import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/reports?project_id=:id
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { project_id } = req.query;
    if (!project_id) {
      return res.status(400).json({ error: 'project_id query parameter is required' });
    }
    const reports = await store.getReports(project_id);
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/:id
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const report = await store.getReportById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ report });
  } catch (err) {
    next(err);
  }
});

// POST /api/reports/:id/export
router.post('/:id/export', authenticateToken, async (req, res, next) => {
  try {
    const { format = 'markdown' } = req.body;
    const report = await store.getReportById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    if (format === 'markdown') {
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/[^a-z0-9]/gi, '_')}.md"`);
      return res.send(report.report_content);
    }

    if (format === 'json') {
      return res.json({ report });
    }

    // Default HTML export for browser PDF print
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${report.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }
    h1 { font-size: 28px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; color: #0f172a; }
    h2 { font-size: 20px; margin-top: 24px; color: #1e293b; }
    blockquote { border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0; color: #475569; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="badge">KnowSphere AI Research Report</div>
  <h1>${report.title}</h1>
  <div>
    <h2>1. Executive Summary</h2>
    <p>${report.executive_summary}</p>
    <h2>2. Literature Review</h2>
    <p>${report.literature_review}</p>
    <h2>3. Major Empirical Findings</h2>
    <ul>
      ${(report.key_evidence || []).map(e => `<li>${e}</li>`).join('')}
    </ul>
    <h2>4. Strategic Conclusions</h2>
    <p>${report.conclusions}</p>
    <h2>5. References</h2>
    <ol>
      ${(report.references_list || []).map(r => `<li>${r}</li>`).join('')}
    </ol>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/[^a-z0-9]/gi, '_')}.html"`);
    res.send(html);
  } catch (err) {
    next(err);
  }
});

export default router;
