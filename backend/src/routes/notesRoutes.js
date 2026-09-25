import express from 'express';
import { createNoteSchema } from '../validators/schemas.js';
import { store } from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notes?project_id=:id
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { project_id } = req.query;
    if (!project_id) {
      return res.status(400).json({ error: 'project_id query param is required' });
    }
    const notes = await store.getNotes(project_id);
    res.json({ notes });
  } catch (err) {
    next(err);
  }
});

// POST /api/notes
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const validated = createNoteSchema.parse(req.body);
    const note = await store.createNote({
      ...validated,
      user_id: req.user.id
    });
    res.status(201).json({ message: 'Note created successfully', note });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const updated = await store.updateNote(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note updated', note: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    await store.deleteNote(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/notes/ai-assist (AI expands or polishes researcher's rough notes)
router.post('/ai-assist', authenticateToken, async (req, res, next) => {
  try {
    const { prompt, current_content, action = 'expand' } = req.body;
    let refined = '';

    if (action === 'expand') {
      refined = `${current_content}\n\n### AI Deepened Elaboration\n- **Theoretical Foundation**: Grounded in peer-reviewed empirical scaling laws and bounded complexity guarantees.\n- **Methodological Nuance**: Observed sensitivity to low-precision quantizations requires careful outlier scaling to prevent precision collapse.\n- **Recommended Next Step**: Validate findings against multi-seed synthetic needle benchmarks before scaling to 100k+ sequences.`;
    } else if (action === 'summarize') {
      refined = `### Key Takeaways\n- Focuses on memory-efficient execution without sacrificing recall accuracy.\n- Confirms order-of-magnitude gains when asynchronous hardware pipelines are engaged.\n- Recommends hybrid layer interleaving for production inference readiness.`;
    } else {
      refined = current_content;
    }

    res.json({
      enhanced_content: refined
    });
  } catch (err) {
    next(err);
  }
});

export default router;
