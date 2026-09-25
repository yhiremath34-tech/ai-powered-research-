# KnowSphere AI — AI-Powered Research & Knowledge Discovery Platform
> **Production-Grade Research Intelligence Engine** engineered for scientists, scholars, policy analysts, startups, and enterprise teams.

[![TypeScript & Node.js](https://img.shields.io/badge/Backend-Node.js%20Express-green.svg)](https://nodejs.org/)
[![React.js & Tailwind CSS](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Tailwind-blue.svg)](https://react.dev/)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini%20API-indigo.svg)](https://ai.google.dev/)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL%20RLS-3ecf8e.svg)](https://supabase.com/)
[![Validation](https://img.shields.io/badge/Validation-Zod%20Strict%20Schemas-blueviolet.svg)](https://zod.dev/)

---

## 1. Core Mission & Philosophy
KnowSphere AI transforms scattered research publications, clinical trials, preprints, and policy briefs into structured, actionable intelligence. It implements the end-to-end research philosophy:

$$\text{Collect} \longrightarrow \text{Understand} \longrightarrow \text{Connect} \longrightarrow \text{Discover} \longrightarrow \text{Decide}$$

Instead of merely answering questions, KnowSphere acts as an autonomous **Research Copilot** providing:
1. **Multi-Source Ingestion**: PDF, DOCX, TXT, Markdown, Web Scraper, and CrossRef DOI resolution.
2. **Deep Document Decomposition**: Extracts executive summaries, methodology protocols, numerical findings, study limitations, and keywords with strict Zod JSON validation.
3. **Interactive Knowledge Graph**: Real-time force-directed physics network mapping authors, institutions, technologies, concepts, and citations with zoom, pan, hover, and entity drawers.
4. **Cross-Document Comparison Matrix**: Side-by-side analysis isolating empirical agreements, experimental contradictions, evidence weighting, and methodology divergences.
5. **Grounded AI Copilot**: Strict document grounding with explicit bracketed citations `[1]`, `[2]` linking directly to verified textual excerpts and confidence meters.
6. **Executive Report Generator**: Synthesizes comprehensive literature reviews and executive reports exportable to Markdown, PDF, and HTML.
7. **Multi-Style Citation Generator**: Instant bibliographic entries in APA 7th, MLA 9th, Chicago 17th, IEEE, and BibTeX.

---

## 2. 14 Supported Research Domains
Every project belongs to a domain which influences specialized prompt engineering, terminology calibration, and evidence weighting:
- Academic Research
- Healthcare & Medicine
- Agriculture & Food
- Finance & Economics
- Law & Legal Studies
- Government & Policy
- Climate & Environment
- Clean Energy
- Technology & AI
- Education & Pedagogy
- Business & Strategy
- Startups & Venture Capital
- Engineering & Robotics
- Social Sciences & Psychology

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, React Router v6, Tailwind CSS, Lucide Icons, Framer Motion, Axios, React Query, React Markdown |
| **Backend** | Node.js, Express.js, Multer, PDF-parse, Mammoth (DOCX), Cheerio, Zod, Helmet, CORS, express-rate-limit |
| **AI Integration** | Google Gemini API via official `@google/genai` SDK (`gemini-1.5-flash` / `gemini-1.5-pro`) |
| **Database & Auth** | Supabase PostgreSQL 15+ with Row-Level Security (RLS) policies, UUIDv4 keys, JSONB, GIN full-text indexes |
| **Deployment** | Vercel (`vercel.json`), Render (`render.yaml`), Railway (`Procfile`) |

---

## 4. Quick Start (Local Development)

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- Google Gemini API Key (optional for zero-friction demo mode)
- Supabase Project (optional for local evaluation - includes rich pre-seeded in-memory store)

### Step 1: Install Dependencies
```bash
# In project root:
npm run install:all
```

### Step 2: Configure Environment Variables
- Backend (`backend/.env`):
```bash
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=super-secure-32-char-secret-for-jwt-signing
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CLIENT_ORIGIN=http://localhost:5173
```
- Frontend (`frontend/.env`):
```bash
VITE_API_URL=/api
```

### Step 3: Run the Application
In separate terminal windows:
```bash
# Terminal 1: Start Backend API (Port 5000)
npm run dev:backend

# Terminal 2: Start Frontend Client (Port 5173)
npm run dev:frontend
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Instant Demo / Evaluator Persona Access
For zero-friction grading and review:
- **Lead Researcher Demo**: One-click login on `/login` as **Dr. Elena Rostova** (`researcher@knowsphere.ai`)
- **Platform Admin Demo**: One-click login on `/login` as **Marcus Vance** (`admin@knowsphere.ai`)
- Pre-loaded with 3 publication corpora:
  1. *Transformer Efficiency & Linear Attention Optimization (2024–2026)*
  2. *CRISPR-Cas9 & Epigenetic Gene Regulation in Solid Tumors*
  3. *Solid-State Battery Electrolytes & High-Entropy Perovskites*

---

## 6. Database Migration (Supabase PostgreSQL)
1. In your Supabase dashboard, navigate to **SQL Editor**.
2. Run the migration file:
   [`supabase/migrations/20260925000001_create_research_platform_schema.sql`](file:///c:/hackathon%201/supabase/migrations/20260925000001_create_research_platform_schema.sql)
3. This creates all tables (`users`, `projects`, `documents`, `ai_summaries`, `entities`, `relationships`, `conversations`, `notes`, `reports`, `citations`, `analytics`), GIN indexes, update triggers, and Row-Level Security policies.

---

## 7. Security Architecture
- **Row-Level Security (RLS)**: Enforced directly at the PostgreSQL layer. Project documents, private notes, and AI conversations inherit strict RLS policies to guarantee zero cross-user data leakage.
- **Server-Side AI API Access**: Clients never receive or handle Gemini API keys.
- **Input Sanitization & MIME Validation**: Multer enforces file type verification, byte inspection, and size limits (25MB default).
- **Zod Schema Enforcement**: All incoming HTTP payloads and Gemini JSON outputs are parsed and strictly validated against typed schemas.
