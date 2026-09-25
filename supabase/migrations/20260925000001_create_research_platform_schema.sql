-- ============================================================================
-- AI-Powered Research & Knowledge Discovery Platform - Production Schema
-- Database: Supabase PostgreSQL (Version 15+)
-- File: supabase/migrations/20260925000001_create_research_platform_schema.sql
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing schema if required in fresh deployments
-- (Drop tables in reverse dependency order if rerunning migration)
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS citations CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS relationships CASCADE;
DROP TABLE IF EXISTS entities CASCADE;
DROP TABLE IF EXISTS ai_summaries CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_auth_id UUID UNIQUE, -- Links to auth.users if using Supabase Auth
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'researcher', -- 'researcher', 'lead_analyst', 'admin'
    primary_domain VARCHAR(100) DEFAULT 'Technology',
    institution VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user email and auth ID lookup
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_supabase_auth_id ON users(supabase_auth_id);

-- ----------------------------------------------------------------------------
-- 2. PROJECTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    domain VARCHAR(100) NOT NULL DEFAULT 'Academic Research',
    objective TEXT NOT NULL,
    expected_outcome TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'archived', 'completed'
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_domain ON projects(domain);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- ----------------------------------------------------------------------------
-- 3. DOCUMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'pdf', 'docx', 'txt', 'markdown', 'url', 'doi', 'manual'
    source_url TEXT,
    doi VARCHAR(100),
    file_path TEXT,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    extracted_text TEXT NOT NULL,
    token_count INT DEFAULT 0,
    authors TEXT[] DEFAULT '{}',
    publication_year INT,
    publisher VARCHAR(255),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_source_type ON documents(source_type);
CREATE INDEX idx_documents_metadata_gin ON documents USING gin(metadata);
-- Full text search index on extracted text
CREATE INDEX idx_documents_extracted_text_tsv ON documents USING gin(to_tsvector('english', extracted_text));

-- ----------------------------------------------------------------------------
-- 4. AI_SUMMARIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE ai_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    key_findings JSONB NOT NULL DEFAULT '[]'::jsonb,
    methodology TEXT,
    limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
    future_work JSONB NOT NULL DEFAULT '[]'::jsonb,
    keywords TEXT[] DEFAULT '{}',
    entities JSONB NOT NULL DEFAULT '[]'::jsonb,
    topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.950,
    model_used VARCHAR(100) DEFAULT 'gemini-1.5-pro',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_summaries_document_id ON ai_summaries(document_id);
CREATE INDEX idx_ai_summaries_key_findings_gin ON ai_summaries USING gin(key_findings);

-- ----------------------------------------------------------------------------
-- 5. ENTITIES TABLE (Knowledge Graph Nodes)
-- ----------------------------------------------------------------------------
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    entity_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL, -- 'author', 'organization', 'concept', 'technology', 'location', 'citation', 'research_topic'
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_entities_project_id ON entities(project_id);
CREATE INDEX idx_entities_type ON entities(entity_type);
CREATE INDEX idx_entities_name ON entities(entity_name);

-- ----------------------------------------------------------------------------
-- 6. RELATIONSHIPS TABLE (Knowledge Graph Edges)
-- ----------------------------------------------------------------------------
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    source_entity UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    target_entity UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL, -- 'cites', 'authored_by', 'builds_upon', 'contradicts', 'proves', 'uses', 'affiliated_with'
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.900,
    context_snippet TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_relationships_project_id ON relationships(project_id);
CREATE INDEX idx_relationships_source ON relationships(source_entity);
CREATE INDEX idx_relationships_target ON relationships(target_entity);

-- ----------------------------------------------------------------------------
-- 7. CONVERSATIONS TABLE (AI Research Copilot Chat)
-- ----------------------------------------------------------------------------
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    citations JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { document_id, title, page, quote, confidence }
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.920,
    token_usage INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_project_id ON conversations(project_id);
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- ----------------------------------------------------------------------------
-- 8. NOTES TABLE (Linked Research Notes)
-- ----------------------------------------------------------------------------
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    linked_sources JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of document IDs, quotes, or entity IDs
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);

-- ----------------------------------------------------------------------------
-- 9. REPORTS TABLE (Generated Research Reports)
-- ----------------------------------------------------------------------------
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    executive_summary TEXT NOT NULL,
    literature_review TEXT,
    methodology_overview TEXT,
    key_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    conclusions TEXT NOT NULL,
    references_list JSONB NOT NULL DEFAULT '[]'::jsonb,
    report_content TEXT NOT NULL, -- Full markdown report
    export_type VARCHAR(50) DEFAULT 'markdown', -- 'markdown', 'pdf', 'docx'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_project_id ON reports(project_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);

-- ----------------------------------------------------------------------------
-- 10. CITATIONS TABLE (Multi-Style Citation Generator)
-- ----------------------------------------------------------------------------
CREATE TABLE citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    style VARCHAR(50) NOT NULL, -- 'APA', 'MLA', 'Chicago', 'IEEE', 'BibTeX'
    formatted_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_citations_document_id ON citations(document_id);
CREATE INDEX idx_citations_style ON citations(style);

-- ----------------------------------------------------------------------------
-- 11. ANALYTICS TABLE (Usage, Costs, Audit Logs)
-- ----------------------------------------------------------------------------
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- 'search', 'upload', 'ai_summary', 'ai_chat', 'ai_compare', 'report_export'
    token_usage INT DEFAULT 0,
    cost_usd NUMERIC(8, 6) DEFAULT 0.000000,
    latency_ms INT DEFAULT 0,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE supabase_auth_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. USERS POLICIES
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (supabase_auth_id = auth.uid() OR is_admin());

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (supabase_auth_id = auth.uid() OR is_admin());

-- 2. PROJECTS POLICIES
CREATE POLICY "Users can view their own projects or public projects"
    ON projects FOR SELECT
    USING (
        user_id IN (SELECT id FROM users WHERE supabase_auth_id = auth.uid())
        OR is_public = TRUE
        OR is_admin()
    );

CREATE POLICY "Users can create projects"
    ON projects FOR INSERT
    WITH CHECK (
        user_id IN (SELECT id FROM users WHERE supabase_auth_id = auth.uid())
        OR is_admin()
    );

CREATE POLICY "Users can update their own projects"
    ON projects FOR UPDATE
    USING (
        user_id IN (SELECT id FROM users WHERE supabase_auth_id = auth.uid())
        OR is_admin()
    );

CREATE POLICY "Users can delete their own projects"
    ON projects FOR DELETE
    USING (
        user_id IN (SELECT id FROM users WHERE supabase_auth_id = auth.uid())
        OR is_admin()
    );

-- 3. DOCUMENTS POLICIES (Inherit ownership from project)
CREATE POLICY "Users can view documents in their projects"
    ON documents FOR SELECT
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN users u ON p.user_id = u.id
            WHERE u.supabase_auth_id = auth.uid() OR p.is_public = TRUE
        )
        OR is_admin()
    );

CREATE POLICY "Users can insert documents into their projects"
    ON documents FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN users u ON p.user_id = u.id
            WHERE u.supabase_auth_id = auth.uid()
        )
        OR is_admin()
    );

CREATE POLICY "Users can delete documents from their projects"
    ON documents FOR DELETE
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN users u ON p.user_id = u.id
            WHERE u.supabase_auth_id = auth.uid()
        )
        OR is_admin()
    );

-- 4. AI_SUMMARIES POLICIES
CREATE POLICY "Users can view AI summaries of accessible documents"
    ON ai_summaries FOR SELECT
    USING (
        document_id IN (
            SELECT d.id FROM documents d
            JOIN projects p ON d.project_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE u.supabase_auth_id = auth.uid() OR p.is_public = TRUE
        )
        OR is_admin()
    );

CREATE POLICY "Users or backend service can manage AI summaries"
    ON ai_summaries FOR ALL
    USING (
        document_id IN (
            SELECT d.id FROM documents d
            JOIN projects p ON d.project_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE u.supabase_auth_id = auth.uid()
        )
        OR is_admin()
    );

-- 5. ENTITIES & RELATIONSHIPS POLICIES
CREATE POLICY "Users can view project entities"
    ON entities FOR ALL
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN users u ON p.user_id = u.id
            WHERE u.supabase_auth_id = auth.uid() OR p.is_public = TRUE
        )
        OR is_admin()
    );

CREATE POLICY "Users can view project relationships"
    ON relationships FOR ALL
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN users u ON p.user_id = u.id
            WHERE u.supabase_auth_id = auth.uid() OR p.is_public = TRUE
        )
        OR is_admin()
    );

-- 6. CONVERSATIONS POLICIES
CREATE POLICY "Users can view their conversations"
    ON conversations FOR SELECT
    USING (
        user_id IN (SELECT id FROM users WHERE supabase_auth_id = auth.uid())
        OR is_admin()
    );

CREATE POLICY "Users can insert conversations"
    ON conversations FOR INSERT
    WITH CHECK (
        user_id IN (SELECT id FROM users WHERE supabase_auth_id = auth.uid())
        OR is_admin()
    );

-- 7. NOTES POLICIES
CREATE POLICY "Users can manage their notes"
    ON notes FOR ALL
    USING (
        user_id IN (SELECT id FROM users WHERE supabase_auth_id = auth.uid())
        OR is_admin()
    );

-- 8. REPORTS POLICIES
CREATE POLICY "Users can manage their reports"
    ON reports FOR ALL
    USING (
        user_id IN (SELECT id FROM users WHERE supabase_auth_id = auth.uid())
        OR is_admin()
    );

-- 9. CITATIONS POLICIES
CREATE POLICY "Users can view and manage citations"
    ON citations FOR ALL
    USING (
        document_id IN (
            SELECT d.id FROM documents d
            JOIN projects p ON d.project_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE u.supabase_auth_id = auth.uid() OR p.is_public = TRUE
        )
        OR is_admin()
    );

-- 10. ANALYTICS POLICIES
CREATE POLICY "Admins can view all analytics; users can view own"
    ON analytics FOR SELECT
    USING (
        user_id IN (SELECT id FROM users WHERE supabase_auth_id = auth.uid())
        OR is_admin()
    );

CREATE POLICY "System can insert analytics"
    ON analytics FOR INSERT
    WITH CHECK (TRUE);

-- ----------------------------------------------------------------------------
-- TRIGGERS FOR UPDATED_AT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_projects
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_documents
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_ai_summaries
BEFORE UPDATE ON ai_summaries
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_notes
BEFORE UPDATE ON notes
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_reports
BEFORE UPDATE ON reports
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
