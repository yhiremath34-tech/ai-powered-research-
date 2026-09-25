import express from 'express';
import {
  chatRequestSchema,
  searchRequestSchema,
  createReportSchema
} from '../validators/schemas.js';
import { store } from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  analyzeDocument,
  compareDocuments,
  discoverResearchGaps,
  generateKnowledgeGraph,
  chatWithResearch,
  generateExecutiveReport,
  formatCitation
} from '../services/gemini.js';

const router = express.Router();

// -------------------------------------------------------------
// 1. POST /api/ai/analyze (Document Analysis)
// -------------------------------------------------------------
router.post('/analyze', authenticateToken, async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { document_id } = req.body;
    if (!document_id) {
      return res.status(400).json({ error: 'document_id is required' });
    }

    const document = await store.getDocumentById(document_id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const project = await store.getProjectById(document.project_id);
    const domain = project ? project.domain : 'Technology';

    const analysis = await analyzeDocument(
      document.extracted_text,
      domain,
      document.filename
    );

    // Save summary into store / Supabase
    const savedSummary = await store.saveSummary({
      document_id: document.id,
      summary: analysis.summary,
      key_findings: analysis.key_findings,
      methodology: analysis.methodology,
      limitations: analysis.limitations,
      future_work: analysis.future_work,
      keywords: analysis.keywords,
      entities: analysis.entities,
      confidence: analysis.confidence,
      model_used: 'gemini-1.5-flash'
    });

    await store.logAnalytics({
      user_id: req.user.id,
      project_id: document.project_id,
      event_type: 'ai_summary',
      token_usage: 1800,
      latency_ms: Date.now() - startTime
    });

    res.json({
      message: 'Analysis completed successfully',
      summary: savedSummary
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 2. POST /api/ai/chat (Research Copilot Chat with Citations)
// -------------------------------------------------------------
router.post('/chat', authenticateToken, async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { project_id, message, session_id } = chatRequestSchema.parse(req.body);
    const project = await store.getProjectById(project_id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const documents = await store.getDocuments(project_id);
    if (!documents || documents.length === 0) {
      return res.status(400).json({
        error: 'No documents in this project. Please upload research documents first to chat with grounded context.'
      });
    }

    const history = await store.getConversations(project_id, session_id || 'default');

    const result = await chatWithResearch(project, documents, history, message);

    const savedConvo = await store.saveConversation({
      project_id,
      user_id: req.user.id,
      session_id: session_id || 'default',
      user_message: message,
      ai_response: result.answer,
      citations: result.citations,
      confidence: result.confidence,
      token_usage: 950
    });

    await store.logAnalytics({
      user_id: req.user.id,
      project_id,
      event_type: 'ai_chat',
      token_usage: 950,
      latency_ms: Date.now() - startTime
    });

    res.json({
      conversation: savedConvo,
      answer: result.answer,
      citations: result.citations,
      confidence: result.confidence
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 3. POST /api/ai/search (Smart Natural Language Search)
// -------------------------------------------------------------
router.post('/search', authenticateToken, async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { query, project_id, domain } = searchRequestSchema.parse(req.body);

    let docs = [];
    if (project_id) {
      docs = await store.getDocuments(project_id);
    } else {
      docs = await store.getAllDocuments();
    }

    const searchTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    // Compute semantic match score and extract highlighted snippets
    const results = [];
    for (const doc of docs) {
      const textLower = doc.extracted_text.toLowerCase();
      let matchCount = 0;
      let bestSnippet = '';

      for (const token of searchTokens) {
        const idx = textLower.indexOf(token);
        if (idx !== -1) {
          matchCount++;
          if (!bestSnippet) {
            const start = Math.max(0, idx - 80);
            const end = Math.min(doc.extracted_text.length, idx + 200);
            bestSnippet = '...' + doc.extracted_text.substring(start, end).replace(/\n/g, ' ') + '...';
          }
        }
      }

      if (matchCount > 0 || searchTokens.length === 0) {
        const score = searchTokens.length > 0 ? (matchCount / searchTokens.length) : 0.8;
        const confidence = Math.min(0.98, Math.max(0.65, 0.70 + (score * 0.25)));
        const summary = await store.getSummary(doc.id);

        results.push({
          document_id: doc.id,
          project_id: doc.project_id,
          filename: doc.filename,
          authors: doc.authors,
          publication_year: doc.publication_year,
          snippet: bestSnippet || (summary?.summary?.slice(0, 200) + '...') || doc.extracted_text.slice(0, 200) + '...',
          confidence: parseFloat(confidence.toFixed(2)),
          score: parseFloat(score.toFixed(2)),
          summary: summary || null
        });
      }
    }

    // Sort by match confidence
    results.sort((a, b) => b.confidence - a.confidence);

    await store.logAnalytics({
      user_id: req.user.id,
      project_id: project_id || null,
      event_type: 'search',
      token_usage: 120,
      latency_ms: Date.now() - startTime
    });

    res.json({
      query,
      total_matches: results.length,
      results
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 4. POST /api/ai/compare (Cross-Document Comparison)
// -------------------------------------------------------------
router.post('/compare', authenticateToken, async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { project_id, document_ids } = req.body;
    if (!project_id) return res.status(400).json({ error: 'project_id is required' });
    if (!document_ids || !Array.isArray(document_ids) || document_ids.length < 2) {
      return res.status(400).json({ error: 'At least 2 document_ids are required for comparison' });
    }

    const project = await store.getProjectById(project_id);
    const documents = await Promise.all(document_ids.map(id => store.getDocumentById(id)));
    const validDocs = documents.filter(Boolean);

    if (validDocs.length < 2) {
      return res.status(400).json({ error: 'Could not resolve at least 2 valid documents' });
    }

    const comparison = await compareDocuments(validDocs, project?.domain || 'Technology');

    await store.logAnalytics({
      user_id: req.user.id,
      project_id,
      event_type: 'ai_compare',
      token_usage: 2400,
      latency_ms: Date.now() - startTime
    });

    res.json({
      comparison,
      compared_documents: validDocs.map(d => ({ id: d.id, filename: d.filename, authors: d.authors, publication_year: d.publication_year }))
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 5. POST /api/ai/knowledge-graph (Generate or Retrieve Knowledge Graph)
// -------------------------------------------------------------
router.post('/knowledge-graph', authenticateToken, async (req, res, next) => {
  try {
    const { project_id, refresh } = req.body;
    if (!project_id) return res.status(400).json({ error: 'project_id is required' });

    const existingGraph = await store.getKnowledgeGraph(project_id);

    // If graph already has nodes and refresh is not requested, return existing
    if (existingGraph.nodes.length > 0 && !refresh) {
      return res.json({ graph: existingGraph });
    }

    const project = await store.getProjectById(project_id);
    const documents = await store.getDocuments(project_id);

    if (!documents || documents.length === 0) {
      return res.json({
        graph: {
          nodes: [{ id: 'p1', label: project?.title || 'Project Root', type: 'concept' }],
          edges: []
        }
      });
    }

    const generated = await generateKnowledgeGraph(documents, project?.domain || 'Technology');
    const saved = await store.saveKnowledgeGraph(project_id, generated);

    res.json({ graph: saved });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 6. POST /api/ai/gaps (Research Gap Discovery)
// -------------------------------------------------------------
router.post('/gaps', authenticateToken, async (req, res, next) => {
  try {
    const { project_id } = req.body;
    if (!project_id) return res.status(400).json({ error: 'project_id is required' });

    const project = await store.getProjectById(project_id);
    const documents = await store.getDocuments(project_id);

    const gaps = await discoverResearchGaps(documents, project?.domain || 'Technology');
    res.json({ gaps });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 7. POST /api/ai/report (Executive Report Generation)
// -------------------------------------------------------------
router.post('/report', authenticateToken, async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { project_id, title, focus_areas, export_type } = createReportSchema.parse(req.body);
    const project = await store.getProjectById(project_id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const documents = await store.getDocuments(project_id);
    if (!documents || documents.length === 0) {
      return res.status(400).json({ error: 'Cannot generate report: No research documents in project' });
    }

    const generatedReport = await generateExecutiveReport(project, documents, focus_areas);

    const savedReport = await store.createReport({
      project_id,
      user_id: req.user.id,
      title: title || generatedReport.title,
      executive_summary: generatedReport.executive_summary,
      literature_review: generatedReport.literature_review,
      methodology_overview: generatedReport.methodology_overview || 'Multi-source synthesis',
      key_evidence: generatedReport.major_findings,
      conclusions: generatedReport.conclusion,
      references_list: generatedReport.references,
      report_content: generatedReport.report_content,
      export_type: export_type || 'markdown'
    });

    await store.logAnalytics({
      user_id: req.user.id,
      project_id,
      event_type: 'report_export',
      token_usage: 3200,
      latency_ms: Date.now() - startTime
    });

    res.status(201).json({
      message: 'Executive report synthesized and compiled successfully',
      report: savedReport
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 8. POST /api/ai/citation (Multi-Style Citation Generator)
// -------------------------------------------------------------
router.post('/citation', authenticateToken, async (req, res, next) => {
  try {
    const { document_id, style = 'APA' } = req.body;
    if (!document_id) return res.status(400).json({ error: 'document_id is required' });

    const doc = await store.getDocumentById(document_id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const formatted = formatCitation(doc, style);
    res.json({
      document_id,
      style,
      citation: formatted
    });
  } catch (err) {
    next(err);
  }
});

export default router;
