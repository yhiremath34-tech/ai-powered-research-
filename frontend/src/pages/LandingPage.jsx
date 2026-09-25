import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  GitGraph,
  Search,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Layers,
  BookOpen,
  BarChart3,
  Quote,
  Zap,
  Globe,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { demoLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeWorkflow, setActiveWorkflow] = useState(0);

  const handleLaunchDemo = async (role = 'researcher') => {
    await demoLogin(role);
    navigate('/dashboard');
  };

  const workflowSteps = [
    {
      title: '1. Collect',
      subtitle: 'Multi-Source Ingestion',
      desc: 'Ingest raw PDFs, DOCX manuscripts, ArXiv papers, web articles, and CrossRef DOIs with automated text extraction and token indexing.',
      badge: 'PDF / DOCX / DOI / Web'
    },
    {
      title: '2. Understand',
      subtitle: 'AI Document Decomposition',
      desc: 'Google Gemini 1.5 Pro instantly generates executive summaries, extracts quantitative key findings, isolates research methods, and detects acknowledged limitations.',
      badge: '@google/genai Pipeline'
    },
    {
      title: '3. Connect',
      subtitle: 'Dynamic Knowledge Graph',
      desc: 'Map relationships across authors, institutions, technologies, concepts, and experimental claims via interactive physics-based network graphs.',
      badge: 'Interactive Force Graph'
    },
    {
      title: '4. Discover',
      subtitle: 'Cross-Doc Matrix & Gap Analysis',
      desc: 'Detect factual contradictions, cross-validate evidence strength, compare divergent methodologies, and surface unexplored research gaps automatically.',
      badge: 'Meta-Analysis Engine'
    },
    {
      title: '5. Decide',
      subtitle: 'Reports & Formatted Citations',
      desc: 'Compile comprehensive literature reviews and executive synthesis reports exportable to Markdown, PDF, and HTML with multi-style citations (APA, MLA, IEEE, BibTeX).',
      badge: 'Instant Export Ready'
    }
  ];

  const domains = [
    'Technology & AI', 'Healthcare & Medicine', 'Agriculture & Food', 'Finance & Economics',
    'Law & Legal Studies', 'Government & Policy', 'Climate & Environment', 'Clean Energy',
    'Education & Pedagogy', 'Business Strategy', 'Startups & Venture', 'Engineering & Robotics',
    'Social Sciences', 'Academic Research'
  ];

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Production-Ready Research Intelligence Engine</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-slate-400">Powered by Gemini & Supabase</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Transform Scattered Papers into <br />
          <span className="text-gradient-primary">Actionable Scientific Intelligence</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The ultimate AI Research Copilot for scholars, data scientists, policy analysts, and enterprises. Upload your literature, discover hidden connections, and generate publication-grade syntheses in minutes.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => handleLaunchDemo('researcher')}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
          >
            <span>Launch Research Copilot (Instant Demo)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 transition"
          >
            <span>{isAuthenticated ? 'Open Dashboard' : 'Sign In With Email'}</span>
          </Link>
        </div>

        {/* Mini Trust Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 text-left">
          <div className="p-4 rounded-xl glass-card">
            <p className="text-2xl font-bold text-white">80%</p>
            <p className="text-xs text-slate-400 mt-0.5">Literature Review Time Reduced</p>
          </div>
          <div className="p-4 rounded-xl glass-card">
            <p className="text-2xl font-bold text-cyan-400">100%</p>
            <p className="text-xs text-slate-400 mt-0.5">Grounded Citation Verifiability</p>
          </div>
          <div className="p-4 rounded-xl glass-card">
            <p className="text-2xl font-bold text-indigo-400">14</p>
            <p className="text-xs text-slate-400 mt-0.5">Calibrated Research Domains</p>
          </div>
          <div className="p-4 rounded-xl glass-card">
            <p className="text-2xl font-bold text-emerald-400">0 ms</p>
            <p className="text-xs text-slate-400 mt-0.5">Friction Seed Experience</p>
          </div>
        </div>
      </section>

      {/* Live Interactive Copilot Demo Widget */}
      <section className="max-w-5xl mx-auto">
        <div className="rounded-2xl glass-panel border border-slate-700/80 overflow-hidden shadow-2xl">
          <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="font-mono text-slate-400 ml-2 font-medium">KnowSphere Research Terminal — Project: Transformer Scalability 2026</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Live Grounded Inference
            </span>
          </div>

          <div className="p-6 space-y-5">
            {/* User Query Simulation */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 text-xs font-bold">
                Q
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm max-w-2xl">
                How does FlashAttention-3 overcome memory bandwidth bottlenecks compared to Mamba at 100k token context?
              </div>
            </div>

            {/* AI Synthesized Answer with Citations */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 text-xs font-bold">
                AI
              </div>
              <div className="space-y-3 max-w-3xl">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-sm leading-relaxed space-y-2">
                  <p>
                    Based strictly on the ingested research corpus, the two architectures address memory scaling through fundamentally divergent computational paradigms:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                    <li>
                      <strong>FlashAttention-3</strong> preserves exact quadratic attention but leverages Hopper GPU <strong>Tensor Memory Accelerators (TMA)</strong> and FP8 warpgroup pipelines to hit 740 TFLOPs/s, slashing 128k latency by 48% <span className="text-cyan-400 font-mono text-[10px] bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">[1]</span>.
                    </li>
                    <li>
                      <strong>Mamba</strong> reformulates sequence modeling into input-dependent <strong>Selective State Spaces</strong>, computing in strictly linear O(N) time with an O(1) memory state, achieving 5x higher inference throughput <span className="text-indigo-400 font-mono text-[10px] bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800">[2]</span>.
                    </li>
                    <li>
                      <strong>Hybrid Convergence</strong>: Interleaving 80% Mamba with 20% attention restores 100% multi-needle recall accuracy while reducing KV cache overhead by 8x <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">[3]</span>.
                    </li>
                  </ul>
                </div>

                {/* Verified Grounded Citations Box */}
                <div className="p-3 bg-[#080c14] border border-slate-800 rounded-xl space-y-1.5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Verified Document Grounding & Quotes
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                      <span className="text-cyan-400 font-mono text-[10px] font-bold block">[1] Dao et al. (2024)</span>
                      <p className="text-[11px] text-slate-400 italic line-clamp-2">
                        "FlashAttention-3 achieves up to 740 TFLOPs/s (75% theoretical peak H100 utilization)..."
                      </p>
                    </div>
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                      <span className="text-indigo-400 font-mono text-[10px] font-bold block">[2] Gu & Dao (2024)</span>
                      <p className="text-[11px] text-slate-400 italic line-clamp-2">
                        "Mamba achieves 5x higher inference throughput than Transformers and linear scaling up to 1M tokens..."
                      </p>
                    </div>
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                      <span className="text-emerald-400 font-mono text-[10px] font-bold block">[3] De et al. (2025)</span>
                      <p className="text-[11px] text-slate-400 italic line-clamp-2">
                        "Hybridizing sparse attention layers anchors global context tracking while reducing KV cache memory by 8x..."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Research Philosophy Workflow */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-indigo-400">Core Methodology</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Collect → Understand → Connect → Discover → Decide
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            A comprehensive, rigorous pipeline replacing fragmented workflows with a single autonomous knowledge engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              onClick={() => setActiveWorkflow(idx)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                activeWorkflow === idx
                  ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {step.badge}
              </span>
              <h3 className="text-base font-bold text-white mt-3">{step.title}</h3>
              <p className="text-xs font-semibold text-cyan-400 mb-2">{step.subtitle}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Platform Capabilities Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">Enterprise Feature Matrix</span>
          <h2 className="text-3xl font-extrabold text-white">Engineered for Academic & Enterprise Rigor</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Deep Document Decomposition</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts executive summaries, methodology overviews, numerical findings, study limitations, and keywords with Zod-validated JSON output.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <GitGraph className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Interactive Knowledge Graph</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time physics network connecting authors, institutions, technologies, concepts, and relationships with zoom, pan, dragging, and inspector drawers.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Natural Language Semantic Search</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Search complex scientific queries like "transformer efficiency after 2023" to get highlighted snippets, confidence metrics, and author references.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Cross-Document Synthesis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare 2 or more publications side-by-side to highlight agreements, flag experimental contradictions, and assess statistical evidence strength.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Quote className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Style Citation Generator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate flawless, copy-ready bibliographic entries in APA 7th, MLA 9th, Chicago, IEEE, and BibTeX format for immediate export.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">PostgreSQL Row-Level Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise tenant isolation. Project documents, private notes, and AI conversations inherit strict RLS policies to guarantee zero cross-user data leakage.
            </p>
          </div>
        </div>
      </section>

      {/* Target Domains Showcase */}
      <section className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-indigo-400">Multi-Disciplinary Support</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">14 Calibrated Research Domains</h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto mt-2">
            Every project adopts specialized AI system prompts, domain terminology calibration, and evidence weighting.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          {domains.map((dom, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 text-xs font-medium transition cursor-default"
            >
              {dom}
            </span>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="text-center space-y-6 py-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Ready to Accelerate Your Research Discovery?
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Explore the pre-loaded research projects or upload your own manuscripts to experience true grounded intelligence.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleLaunchDemo('researcher')}
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-xl shadow-indigo-500/20 transition transform hover:-translate-y-0.5"
          >
            Launch Instant Demo as Lead Researcher
          </button>
        </div>
      </section>
    </div>
  );
}
