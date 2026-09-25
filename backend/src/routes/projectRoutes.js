import express from 'express';
import { createProjectSchema, updateProjectSchema } from '../validators/schemas.js';
import { store } from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/projects
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { domain, search } = req.query;
    const projects = await store.getProjects(req.user.id, { domain, search });

    // Attach document count and last updated info
    const enriched = await Promise.all(
      projects.map(async p => {
        const docs = await store.getDocuments(p.id);
        const summaries = await Promise.all(docs.map(d => store.getSummary(d.id)));
        const processedCount = summaries.filter(Boolean).length;
        return {
          ...p,
          document_count: docs.length,
          processed_count: processedCount
        };
      })
    );

    res.json({ projects: enriched });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const validated = createProjectSchema.parse(req.body);
    const newProject = await store.createProject({
      ...validated,
      user_id: req.user.id
    });

    await store.logAnalytics({
      user_id: req.user.id,
      project_id: newProject.id,
      event_type: 'project_created',
      token_usage: 0
    });

    res.status(201).json({
      message: 'Project created successfully',
      project: newProject
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const project = await store.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Research project not found' });
    }

    const documents = await store.getDocuments(project.id);
    const summaries = await Promise.all(documents.map(d => store.getSummary(d.id)));
    const notes = await store.getNotes(project.id);
    const reports = await store.getReports(project.id);
    const graph = await store.getKnowledgeGraph(project.id);

    res.json({
      project: {
        ...project,
        document_count: documents.length,
        processed_count: summaries.filter(Boolean).length,
        notes_count: notes.length,
        reports_count: reports.length,
        graph_entities_count: graph.nodes.length
      },
      documents: documents.map((doc, idx) => ({
        ...doc,
        summary: summaries[idx] || null
      }))
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const validated = updateProjectSchema.parse(req.body);
    const updated = await store.updateProject(req.params.id, validated);
    if (!updated) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project updated successfully', project: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const deleted = await store.deleteProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project and all associated assets deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
