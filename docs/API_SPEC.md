# API Specification — KnowSphere Research Engine

All endpoints are prefixed with `/api`. Protected routes require a Bearer token in the `Authorization` header (`Authorization: Bearer <token>`).

### 1. Authentication
- `POST /api/auth/signup`
  - Body: `{ email, password, full_name, primary_domain, institution }`
  - Returns: `{ user, token }`
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Returns: `{ user, token }`
- `GET /api/auth/me`
  - Returns: `{ user }`
- `POST /api/auth/logout`

### 2. Research Projects
- `GET /api/projects`
  - Query: `domain`, `status`, `search`
  - Returns: `Project[]`
- `POST /api/projects`
  - Body: `{ title, description, domain, objective, expected_outcome, tags }`
  - Returns: `Project`
- `GET /api/projects/:id`
  - Returns: `Project` with associated documents and stats
- `PUT /api/projects/:id`
  - Body: Partial project object
- `DELETE /api/projects/:id`

### 3. Document Ingestion & Management
- `POST /api/documents/upload`
  - Multipart Form: `file` (PDF/DOCX/TXT/MD), `project_id`, `authors`, `publication_year`, `tags`
- `POST /api/documents/extract-url`
  - Body: `{ project_id, url, title }`
- `POST /api/documents/doi`
  - Body: `{ project_id, doi }`
- `POST /api/documents/manual`
  - Body: `{ project_id, title, content, authors, publication_year }`
- `GET /api/documents/project/:projectId`
- `GET /api/documents/:id`
- `DELETE /api/documents/:id`

### 4. AI Intelligence Pipeline (@google/genai)
- `POST /api/ai/analyze`
  - Body: `{ document_id }`
  - Returns: `{ summary, key_findings, methodology, limitations, future_work, keywords, confidence, entities }`
- `POST /api/ai/chat`
  - Body: `{ project_id, message, session_id }`
  - Returns: `{ answer, citations: [{ document_id, title, quote, confidence }], confidence }`
- `POST /api/ai/search`
  - Body: `{ query, project_id, domain, date_from, date_to }`
  - Returns: `{ results: [{ document_id, title, snippet, confidence, score }] }`
- `POST /api/ai/compare`
  - Body: `{ project_id, document_ids: string[] }`
  - Returns: `{ agreements, contradictions, methodology_differences, evidence_strength, final_insight }`
- `POST /api/ai/knowledge-graph`
  - Body: `{ project_id }`
  - Returns: `{ nodes: [{ id, label, type }], edges: [{ source, target, relation, confidence }] }`
- `POST /api/ai/gaps`
  - Body: `{ project_id }`
  - Returns: `{ identified_gaps, emerging_topics, future_opportunities }`
- `POST /api/ai/report`
  - Body: `{ project_id, title, focus_areas }`
  - Returns: `{ title, executive_summary, literature_review, major_findings, conclusion, references, report_content }`
- `POST /api/ai/citation`
  - Body: `{ document_id, style: 'APA' | 'MLA' | 'Chicago' | 'IEEE' | 'BibTeX' }`

### 5. Notes & Reports
- `GET /api/notes?project_id=:id`
- `POST /api/notes`
- `PUT /api/notes/:id`
- `DELETE /api/notes/:id`
- `POST /api/notes/ai-assist`
- `GET /api/reports?project_id=:id`
- `POST /api/reports`
- `POST /api/reports/:id/export`

### 6. Administration & Telemetry
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/logs`
