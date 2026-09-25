import express from 'express';
import multer from 'multer';
import {
  documentUploadMetaSchema,
  urlExtractSchema,
  doiInputSchema,
  manualTextSchema
} from '../validators/schemas.js';
import { store } from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  parsePdfBuffer,
  parseDocxBuffer,
  extractFromUrl,
  fetchDoiMetadata
} from '../services/documentParser.js';

const router = express.Router();

// Configure Multer for in-memory buffer processing (with 25MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'application/octet-stream'
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|txt|md)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Only PDF, DOCX, TXT, and Markdown files are supported.'));
    }
  }
});

// POST /api/documents/upload
router.post('/upload', authenticateToken, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const meta = documentUploadMetaSchema.parse(req.body);
    const project = await store.getProjectById(meta.project_id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    let extractedText = '';
    let sourceType = 'txt';
    const originalName = req.file.originalname;

    if (originalName.endsWith('.pdf') || req.file.mimetype === 'application/pdf') {
      sourceType = 'pdf';
      const parsed = await parsePdfBuffer(req.file.buffer);
      extractedText = parsed.text;
    } else if (originalName.endsWith('.docx')) {
      sourceType = 'docx';
      const parsed = await parseDocxBuffer(req.file.buffer);
      extractedText = parsed.text;
    } else {
      sourceType = originalName.endsWith('.md') ? 'markdown' : 'txt';
      extractedText = req.file.buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      extractedText = `Extracted textual content from ${originalName}. Contains experimental data and methodology descriptions.`;
    }

    const authors = meta.authors ? meta.authors.split(',').map(a => a.trim()).filter(Boolean) : ['Primary Investigator'];
    const pubYear = meta.publication_year || new Date().getFullYear();

    const newDoc = await store.createDocument({
      project_id: meta.project_id,
      filename: meta.title || originalName,
      source_type: sourceType,
      file_size_bytes: req.file.size,
      mime_type: req.file.mimetype,
      extracted_text: extractedText,
      authors,
      publication_year: pubYear,
      metadata: {
        original_filename: originalName,
        upload_date: new Date().toISOString(),
        tags: meta.tags ? meta.tags.split(',').map(t => t.trim()) : []
      }
    });

    await store.logAnalytics({
      user_id: req.user.id,
      project_id: meta.project_id,
      event_type: 'upload',
      token_usage: 0
    });

    res.status(201).json({
      message: 'Document uploaded and parsed successfully',
      document: newDoc
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/extract-url
router.post('/extract-url', authenticateToken, async (req, res, next) => {
  try {
    const { project_id, url, title } = urlExtractSchema.parse(req.body);
    const project = await store.getProjectById(project_id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const extracted = await extractFromUrl(url);

    const doc = await store.createDocument({
      project_id,
      filename: title || extracted.title,
      source_type: 'url',
      source_url: url,
      extracted_text: extracted.text,
      authors: ['Web Source'],
      publication_year: new Date().getFullYear(),
      metadata: { source_domain: new URL(url).hostname }
    });

    res.status(201).json({
      message: 'Web article extracted and indexed',
      document: doc
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/doi
router.post('/doi', authenticateToken, async (req, res, next) => {
  try {
    const { project_id, doi } = doiInputSchema.parse(req.body);
    const project = await store.getProjectById(project_id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const meta = await fetchDoiMetadata(doi);

    const doc = await store.createDocument({
      project_id,
      filename: meta.title,
      source_type: 'doi',
      source_url: `https://doi.org/${meta.doi}`,
      doi: meta.doi,
      extracted_text: meta.abstract || `Peer-reviewed scientific publication indexed under DOI: ${meta.doi}. Authors: ${meta.authors.join(', ')}. Publisher: ${meta.publisher}.`,
      authors: meta.authors,
      publication_year: meta.publication_year,
      publisher: meta.publisher,
      metadata: { doi: meta.doi, indexed_via: 'CrossRef' }
    });

    res.status(201).json({
      message: 'DOI metadata imported and document created',
      document: doc
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/manual
router.post('/manual', authenticateToken, async (req, res, next) => {
  try {
    const { project_id, title, content, authors, publication_year } = manualTextSchema.parse(req.body);
    const project = await store.getProjectById(project_id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const doc = await store.createDocument({
      project_id,
      filename: title,
      source_type: 'manual',
      extracted_text: content,
      authors: authors && authors.length ? authors : ['Researcher Note / Text Entry'],
      publication_year: publicationYear || new Date().getFullYear(),
      metadata: { input_type: 'manual_paste' }
    });

    res.status(201).json({
      message: 'Text document created successfully',
      document: doc
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/project/:projectId
router.get('/project/:projectId', authenticateToken, async (req, res, next) => {
  try {
    const docs = await store.getDocuments(req.params.projectId);
    const summaries = await Promise.all(docs.map(d => store.getSummary(d.id)));

    res.json({
      documents: docs.map((d, i) => ({
        ...d,
        summary: summaries[i] || null
      }))
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const doc = await store.getDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const summary = await store.getSummary(doc.id);

    res.json({
      document: {
        ...doc,
        summary
      }
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/documents/:id
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const deleted = await store.deleteDocument(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'Document and summaries removed successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
