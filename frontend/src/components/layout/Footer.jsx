import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Cpu, Database, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#080c14] text-slate-400 py-12 px-4 lg:px-8 text-xs transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand & Mission */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-white">KnowSphere AI</span>
          </div>
          <p className="text-slate-400 leading-relaxed max-w-md">
            Production-grade AI Research Copilot and Multi-Source Knowledge Discovery Platform. Grounded evidence synthesis, interactive force graphs, cross-document analysis, and citation intelligence for modern researchers.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI Core Operational (Google Gemini API)
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-[11px]">
              <Database className="w-3 h-3" />
              Supabase RLS Active
            </span>
          </div>
        </div>

        {/* Research Domains */}
        <div>
          <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px] mb-3">Target Domains</h4>
          <ul className="space-y-1.5">
            <li><span className="hover:text-indigo-400 transition cursor-default">Technology & AI</span></li>
            <li><span className="hover:text-indigo-400 transition cursor-default">Healthcare & Medicine</span></li>
            <li><span className="hover:text-indigo-400 transition cursor-default">Clean Energy & Climate</span></li>
            <li><span className="hover:text-indigo-400 transition cursor-default">Finance & Economics</span></li>
            <li><span className="hover:text-indigo-400 transition cursor-default">Law & Public Policy</span></li>
            <li><span className="hover:text-indigo-400 transition cursor-default">Agriculture & Food Systems</span></li>
          </ul>
        </div>

        {/* Platform Modules */}
        <div>
          <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px] mb-3">Platform Modules</h4>
          <ul className="space-y-1.5">
            <li><Link to="/upload" className="hover:text-indigo-400 transition">Multi-Source Import</Link></li>
            <li><Link to="/search" className="hover:text-indigo-400 transition">Smart Natural Search</Link></li>
            <li><Link to="/compare" className="hover:text-indigo-400 transition">Cross-Document Matrix</Link></li>
            <li><Link to="/knowledge-graph" className="hover:text-indigo-400 transition">Interactive Force Graph</Link></li>
            <li><Link to="/reports" className="hover:text-indigo-400 transition">Executive Report Synthesizer</Link></li>
            <li><Link to="/admin" className="hover:text-indigo-400 transition">Telemetry & Security Logs</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <p>© 2026 KnowSphere AI Research Intelligence Engine. All Rights Reserved.</p>
        <p className="font-mono text-slate-400">
          Philosophy: <span className="text-indigo-400">Collect → Understand → Connect → Discover → Decide</span>
        </p>
      </div>
    </footer>
  );
}
