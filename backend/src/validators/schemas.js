import { z } from 'zod';

// ==========================================
// 1. AUTH SCHEMAS
// ==========================================
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  primary_domain: z.string().default('Technology'),
  institution: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// ==========================================
// 2. PROJECT SCHEMAS
// ==========================================
export const supportedDomains = [
  'Academic Research',
  'Healthcare',
  'Agriculture',
  'Finance',
  'Law',
  'Government',
  'Climate',
  'Energy',
  'Technology',
  'Education',
  'Business',
  'Startups',
  'Engineering',
  'Social Sciences'
];

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional().default(''),
  domain: z.string().default('Academic Research'),
  objective: z.string().min(5, 'Research objective is required'),
  expected_outcome: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([])
});

export const updateProjectSchema = createProjectSchema.partial();

// ==========================================
// 3. DOCUMENT SCHEMAS
// ==========================================
export const documentUploadMetaSchema = z.object({
  project_id: z.string().uuid('Valid project ID required'),
  authors: z.string().optional(), // Can come as comma separated from multipart form
  publication_year: z.coerce.number().int().min(1800).max(2100).optional(),
  tags: z.string().optional(),
  title: z.string().optional()
});

export const urlExtractSchema = z.object({
  project_id: z.string().uuid('Valid project ID required'),
  url: z.string().url('Invalid URL format'),
  title: z.string().optional()
});

export const doiInputSchema = z.object({
  project_id: z.string().uuid('Valid project ID required'),
  doi: z.string().min(4, 'Valid DOI string is required')
});

export const manualTextSchema = z.object({
  project_id: z.string().uuid('Valid project ID required'),
  title: z.string().min(3, 'Title is required'),
  content: z.string().min(20, 'Text content must have at least 20 characters'),
  authors: z.array(z.string()).optional().default([]),
  publication_year: z.number().optional()
});

// ==========================================
// 4. AI PROMPT SCHEMAS (STRICT SYSTEM VALIDATION)
// ==========================================

// Prompt 1: Document Analysis
export const aiDocAnalysisSchema = z.object({
  summary: z.string().min(10, 'Summary required'),
  key_findings: z.array(z.string()).min(1, 'Key findings required'),
  methodology: z.string().default('Empirical / Literature Analysis'),
  limitations: z.array(z.string()).default([]),
  future_work: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  entities: z.array(z.object({
    name: z.string(),
    type: z.enum(['author', 'organization', 'concept', 'technology', 'location', 'citation', 'research_topic']).default('concept')
  })).default([]),
  confidence: z.number().min(0).max(1).default(0.95)
});

// Prompt 2: Cross Document Comparison
export const aiComparisonSchema = z.object({
  agreements: z.array(z.string()).default([]),
  contradictions: z.array(z.string()).default([]),
  methodology_differences: z.array(z.string()).default([]),
  evidence_strength: z.array(z.string()).default([]),
  final_insight: z.string().min(10)
});

// Prompt 3: Research Gap Discovery
export const aiGapDiscoverySchema = z.object({
  identified_gaps: z.array(z.string()).default([]),
  emerging_topics: z.array(z.string()).default([]),
  future_opportunities: z.array(z.string()).default([])
});

// Prompt 4: Knowledge Graph Generation
export const aiKnowledgeGraphSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['author', 'organization', 'concept', 'technology', 'location', 'citation', 'research_topic', 'paper']).default('concept')
  })),
  edges: z.array(z.object({
    source: z.string(),
    target: z.string(),
    relation: z.string().default('relates_to'),
    confidence: z.number().optional().default(0.9)
  }))
});

// Prompt 5: AI Chat
export const aiChatSchema = z.object({
  answer: z.string().min(1),
  citations: z.array(z.object({
    document_id: z.string().optional(),
    title: z.string().optional(),
    quote: z.string().optional(),
    confidence: z.number().optional().default(0.9)
  })).default([]),
  confidence: z.number().min(0).max(1).default(0.92)
});

// Prompt 6: Executive Report
export const aiExecutiveReportSchema = z.object({
  title: z.string(),
  executive_summary: z.string(),
  literature_review: z.string(),
  major_findings: z.array(z.string()),
  conclusion: z.string(),
  references: z.array(z.string())
});

// Request Chat Schema
export const chatRequestSchema = z.object({
  project_id: z.string().uuid(),
  message: z.string().min(1, 'Message cannot be empty'),
  session_id: z.string().optional()
});

// Search Schema
export const searchRequestSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters'),
  project_id: z.string().uuid().optional(),
  domain: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional()
});

// Notes Schema
export const createNoteSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  linked_sources: z.array(z.any()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  is_pinned: z.boolean().optional().default(false)
});

// Reports Schema
export const createReportSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(3),
  focus_areas: z.array(z.string()).optional().default([]),
  export_type: z.enum(['markdown', 'pdf', 'docx']).default('markdown')
});
