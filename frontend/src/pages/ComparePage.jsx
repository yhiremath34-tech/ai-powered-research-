import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  CheckCircle,
  Zap,
  Layers,
  ShieldCheck,
  RefreshCw,
  Download
} from 'lucide-react';
import { api } from '../services/api';

export default function ComparePage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const pRes = await api.projects.list();
        const pList = pRes.projects || [];
        setProjects(pList);
        if (pList.length > 0) {
          const firstId = pList[0].id;
          setSelectedProjectId(firstId);
          loadProjectDocs(firstId);
        }
      } catch (err) {
        console.warn('Error loading projects:', err);
      }
    }
    loadData();
  }, []);

  const loadProjectDocs = async (projId) => {
    try {
      const dRes = await api.documents.listByProject(projId);
      const docList = dRes.documents || [];
      setDocuments(docList);
      if (docList.length >= 2) {
        setSelectedDocIds([docList[0].id, docList[1].id]);
      } else {
        setSelectedDocIds(docList.map(d => d.id));
      }
      setComparison(null);
    } catch (err) {
      console.warn('Error loading documents:', err);
    }
  };

  const handleProjectSelect = (projId) => {
    setSelectedProjectId(projId);
    loadProjectDocs(projId);
  };

  const handleRunComparison = async () => {
    if (selectedDocIds.length < 2) {
      alert('Please select at least 2 publications to run meta-analysis comparison.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.ai.compare({
        project_id: selectedProjectId,
        document_ids: selectedDocIds
      });
      setComparison(res.comparison);
    } catch (err) {
      alert('Comparison failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          Cross-Document Meta-Analysis & Comparison
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform multi-paper synthesis to evaluate empirical agreements, contradictions, evidence weighting, and methodology differences.
        </p>
      </div>

      {/* Select Project & Publications */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <label className="text-xs font-semibold text-slate-300">
            Select Research Corpus:
          </label>
          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.domain})</option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <span className="text-xs text-slate-400 block font-medium">
            Select at least 2 publications to compare:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {documents.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocIds(prev =>
                      isSelected ? prev.filter(x => x !== doc.id) : [...prev, doc.id]
                    );
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 text-white'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="max-w-[85%]">
                    <span className="font-semibold block truncate text-slate-200">{doc.filename}</span>
                    <span className="text-[10px] text-slate-500">
                      {(doc.authors || []).join(', ')} ({doc.publication_year || 2024})
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-slate-600'
                    }`}
                  >
                    {isSelected && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleRunComparison}
          disabled={loading || selectedDocIds.length < 2}
          className="mt-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition"
        >
          <Sparkles className="w-4 h-4" />
          {loading ? 'Synthesizing Matrix...' : `Run Meta-Analysis (${selectedDocIds.length} Papers Selected)`}
        </button>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Insight Synthesis */}
          <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Integrated Synthesis & Meta-Conclusion
            </span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {comparison.final_insight}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agreements */}
            <div className="p-6 rounded-2xl glass-card space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Cross-Paper Consensus & Agreements
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(comparison.agreements || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contradictions */}
            <div className="p-6 rounded-2xl glass-card space-y-3">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Contradictions & Conflicting Evidence
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(comparison.contradictions || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Methodology Differences */}
            <div className="p-6 rounded-2xl glass-card space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Methodology Differences & Protocols
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(comparison.methodology_differences || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evidence Strength */}
            <div className="p-6 rounded-2xl glass-card space-y-3">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Evidence Strength & Statistical Reliability
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(comparison.evidence_strength || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
