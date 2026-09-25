import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const stats = await store.getAdminStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users
router.get('/users', authenticateToken, async (req, res, next) => {
  try {
    const stats = await store.getAdminStats();
    res.json({ users: stats.users.list });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/health
router.get('/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0-production',
    uptime_seconds: process.uptime(),
    memory_usage: process.memoryUsage(),
    engine: 'Node.js Express + @google/genai'
  });
});

export default router;
