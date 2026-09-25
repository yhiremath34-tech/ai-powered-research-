import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Share2,
  Printer,
  Calendar,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import ReactMarkdown from 'react-markdown';

export default function ReportsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const pRes = await api.projects.list();
        const pList = pRes.projects || [];
        setProjects(pList);
        if (pList.length > 0) {
          const firstId = pList[0].id;
          setSelectedProjectId(firstId);
          loadReports(firstId);
        }
      } catch (err) {
        console.warn('Error loading reports projects:', err);
      }
    }
    loadData();
  }, []);

  const loadReports = async (projId) => {
    try {
      setLoading(true);
      const res = await api.reports.list(projId);
      const rList = res.reports || [];
      setReports(rList);
      if (rList.length > 0) {
        setSelectedReport(rList[0]);
      } else {
        setSelectedReport(null);
      }
    } catch (err) {
      console.warn('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedProjectId) return;
    setGenerating(true);
    try {
      const proj = projects.find(p => p.id === selectedProjectId);
      const res = await api.ai.generateReport({
        project_id: selectedProjectId,
        title: `Comprehensive Synthesis: ${proj?.title || 'Research Analysis'}`
      });
      setReports(prev => [res.report, ...prev]);
      setSelectedReport(res.report);
      alert('Report synthesized successfully!');
    } catch (err) {
      alert('Report generation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!selectedReport) return;
    const blob = new Blob([selectedReport.report_content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-400" />
            Executive Synthesis Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publication-grade research meta-syntheses compiled directly from verified literature.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => { setSelectedProjectId(e.target.value); loadReports(e.target.value); }}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.domain})</option>
              ))}
            </select>
          )}

          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {generating ? 'Compiling Report...' : 'Compile New Report'}
          </button>
        </div>
      </div>

      {/* Main Report View */}
      {selectedReport ? (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl glass-panel border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Publication-Grade Meta-Analysis
                </span>
                <h2 className="text-xl font-bold text-white mt-1.5">{selectedReport.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Compiled on {new Date(selectedReport.created_at).toLocaleDateString()} by KnowSphere AI Engine
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadMarkdown}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  Markdown
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
              </div>
            </div>

            {/* Markdown Report Render */}
            <div className="markdown-content text-slate-300 text-xs sm:text-sm leading-relaxed max-w-4xl">
              <ReactMarkdown>{selectedReport.report_content}</ReactMarkdown>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-24 text-center rounded-2xl glass-panel space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Reports Compiled for this Project</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "Compile New Report" to generate an executive synthesis with Gemini 1.5.
          </p>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
          >
            {generating ? 'Compiling...' : 'Synthesize Report'}
          </button>
        </div>
      )}
    </div>
  );
}
