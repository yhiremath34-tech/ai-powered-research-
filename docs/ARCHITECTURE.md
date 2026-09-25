# KnowSphere AI — AI-Powered Research & Knowledge Discovery Platform
## System Architecture & Technical Specification

### 1. Architectural Overview
KnowSphere AI is an enterprise-grade AI Research Copilot and Knowledge Discovery engine engineered to reduce research cycle times by up to 80% while enhancing critical decision confidence. The platform implements the core research philosophy:
`"Collect → Understand → Connect → Discover → Decide"`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (React.js)                         │
│  - Tailwind CSS + Framer Motion Design System (Notion / Perplexity aesthetic)│
│  - Interactive Knowledge Graph Canvas (Force-Directed Physics & Zoom/Pan)   │
│  - Research Copilot Chat with Verified Source Grounding & Citations         │
│  - Multi-Document Side-by-Side Comparison & Synthesis Matrix                │
│  - Live Markdown & Structured Report Generator (PDF / DOCX / MD)            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / REST / SSE
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            API GATEWAY & BACKEND                            │
│  - Node.js + Express.js API Server with Helmet, CORS & Rate Limiting        │
│  - Multi-Format Parser: PDF (pdf-parse), DOCX (mammoth), Web & DOI (cheerio) │
│  - Zod Request/Response/AI-JSON Validation Engine                            │
│  - Token Counter, Audit Logger & Analytics Subsystem                        │
└──────────────────┬──────────────────────────────────────────┬───────────────┘
                   │                                          │
┌──────────────────▼───────────────────┐    ┌─────────────────▼───────────────┐
│     DATABASE & AUTH (Supabase)       │    │      AI ENGINE (@google/genai)  │
│  - PostgreSQL 15+ with UUID v4 Keys  │    │  - Google Gemini 1.5 Pro / Flash│
│  - Row-Level Security (RLS) Policies │    │  - Strict JSON Schema Output    │
│  - Full-Text Search (tsvector GIN)   │    │  - Source Grounding Prompts     │
│  - JSONB Metadata & Graph Indexes    │    │  - Retry & Resiliency Pipeline  │
└──────────────────────────────────────┘    └─────────────────────────────────┘
```

### 2. Multi-Domain Context Engine
Every research project is tied to one of 14 domains, providing domain-specific prompting, terminology calibration, and evidence weighing:
1. Academic Research
2. Healthcare & Medicine
3. Agriculture & Food
4. Finance & Economics
5. Law & Legal Studies
6. Government & Public Policy
7. Climate & Environment
8. Energy & Sustainability
9. Technology & AI
10. Education & Pedagogy
11. Business & Strategy
12. Startups & Venture Capital
13. Engineering & Robotics
14. Social Sciences & Psychology

### 3. Data Isolation and Security
- **Strict Row-Level Security (RLS)**: Enforced directly at the PostgreSQL layer. Documents, summaries, graph entities, chats, and reports inherit project-level tenancy.
- **Server-Side AI API Access**: Client never receives raw AI API keys. All calls pass through validated backend endpoints.
- **Input Sanitization & MIME Validation**: Multer enforces file type verification, byte inspection, and size limits (20MB default).
- **Zod Schema Enforcement**: All incoming JSON and outgoing AI structured outputs are strictly parsed and validated against typed schemas.
