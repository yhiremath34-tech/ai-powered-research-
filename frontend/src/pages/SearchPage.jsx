import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export default function SearchPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState('transformer efficiency after 2023');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Filters
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await api.projects.list();
        setProjects(data.projects || []);
      } catch (err) {
        console.warn('Error loading projects for search:', err);
      }
    }
    loadProjects();
    // Run initial search
    handleSearch(new Event('submit'), 'transformer efficiency after 2023');
  }, []);

  const handleSearch = async (e, customQuery) => {
    if (e && e.preventDefault) e.preventDefault();
    const q = customQuery !== undefined ? customQuery : query;
    if (!q.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await api.ai.search({
        query: q,
        project_id: selectedProjectId || undefined
      });
      setResults(res.results || []);
    } catch (err) {
      console.warn('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    'transformer efficiency after 2023',
    'CRISPR dCas9 epigenetic gene regulation',
    'solid-state battery electrolyte dendrites',
    'asynchronous TMA memory hopper GPU'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-indigo-400" />
          Smart Natural Language Research Search
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform semantic queries across all ingested scientific publications, preprints, and clinical notes.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            required
            placeholder="e.g. Show papers discussing transformer efficiency after 2023..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-28 py-3.5 text-sm rounded-2xl glass-input focus:outline-none shadow-xl"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-semibold rounded-xl shadow-md transition"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Query Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Try:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuery(sq);
                handleSearch(null, sq);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition"
            >
              {sq}
            </button>
          ))}
        </div>
      </form>

      {/* Results Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
          <span>{searched ? `${results.length} relevant documents found` : 'Enter a query to search'}</span>
          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                handleSearch(null, query);
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs"
            >
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            Evaluating semantic similarity across indexed corpus...
          </div>
        ) : results.length === 0 && searched ? (
          <div className="p-12 text-center rounded-2xl glass-panel space-y-2">
            <Search className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No documents matched your query</h3>
            <p className="text-xs text-slate-400">Try rephrasing or search across all projects.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((res, i) => (
              <div
                key={res.document_id || i}
                onClick={() => navigate(`/project/${res.project_id}`)}
                className="p-5 rounded-2xl glass-card group cursor-pointer space-y-3 hover:border-indigo-500/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {res.filename}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Authors: {(res.authors || []).join(', ') || 'Lead Investigators'} • Year: {res.publication_year || 'N/A'}
                    </p>
                  </div>

                  <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {Math.round(res.confidence * 100)}% Match
                  </span>
                </div>

                {/* Highlighted Snippet */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                  {res.snippet}
                </div>

                {/* Keywords if available */}
                {res.summary?.keywords && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {res.summary.keywords.slice(0, 4).map((kw, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Indexed in Project Corpus</span>
                  <span className="text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Open in Project Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
