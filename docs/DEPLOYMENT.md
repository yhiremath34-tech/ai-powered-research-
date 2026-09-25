# Deployment Guide — KnowSphere AI Platform

## 1. Prerequisites
- Node.js 18+ (tested on Node 20 / 24)
- Google Gemini API Key (from Google AI Studio)
- Supabase Project (PostgreSQL + Auth)
- Vercel CLI (or dashboard) for Frontend
- Render / Railway / Fly.io for Backend

---

## 2. Environment Variables

### Backend (`backend/.env`)
```bash
PORT=5000
NODE_ENV=production

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key

# Gemini AI (Official @google/genai SDK)
GEMINI_API_KEY=AIzaSy...

# Authentication & Security
JWT_SECRET=super-secure-production-jwt-secret-key-at-least-32-chars
CLIENT_ORIGIN=https://your-frontend.vercel.app
MAX_UPLOAD_MB=20
```

### Frontend (`frontend/.env`)
```bash
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 3. Database Setup (Supabase)
1. Go to your Supabase dashboard → SQL Editor.
2. Paste the contents of `supabase/migrations/20260925000001_create_research_platform_schema.sql`.
3. Run the query to create all tables, indexes, and Row-Level Security policies.

---

## 4. Frontend Deployment (Vercel)
1. Connect your repository to Vercel.
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure Environment Variables (`VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

---

## 5. Backend Deployment (Render / Railway)
- **Render**: Create a Web Service pointing to `backend/`.
  - Build Command: `npm install`
  - Start Command: `npm start`
- Included `backend/render.yaml` and `backend/Procfile` for one-click configuration.
