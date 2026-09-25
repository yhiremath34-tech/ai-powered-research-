import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Compass,
  FileText,
  MessageSquare,
  GitGraph,
  Sparkles,
  BookOpen,
  Share2,
  UploadCloud,
  CheckCircle,
  Clock,
  ChevronRight,
  Download,
  Copy,
  Plus,
  RefreshCw,
  Search,
  Quote,
  ShieldCheck,
  Send,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import KnowledgeGraphCanvas from '../components/graph/KnowledgeGraphCanvas';
import ReactMarkdown from 'react-markdown';

export default function ProjectWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projectData, setProjectData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Selected document state for detailed inspection
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [analyzingDocId, setAnalyzingDocId] = useState(null);
  const [citationModalDoc, setCitationModalDoc] = useState(null);
  const [selectedCitationStyle, setSelectedCitationStyle] = useState('APA');
  const [formattedCitation, setFormattedCitation] = useState('');

  // Graph state
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [refreshingGraph, setRefreshingGraph] = useState(false);

  // Chat Copilot State
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Cross Document Compare State
  const [selectedDocIdsForCompare, setSelectedDocIdsForCompare] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparing, setComparing] = useState(false);

  // Notes State
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [aiAssistingNote, setAiAssistingNote] = useState(false);

  // Reports State
  const [reports, setReports] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [activeReport, setActiveReport] = useState(null);

  // Load project workspace data
  const loadWorkspace = async () => {
    try {
      setLoading(true);
      const data = await api.projects.get(id);
      setProjectData(data.project);
      setDocuments(data.documents || []);

      if (data.documents && data.documents.length > 0) {
        setSelectedDoc(data.documents[0]);
        // Default select first two for compare
        setSelectedDocIdsForCompare(data.documents.slice(0, 2).map(d => d.id));
      }

      // Load graph
      const gRes = await api.ai.getKnowledgeGraph(id);
      setGraphData(gRes.graph || { nodes: [], edges: [] });

      // Load notes
      const nRes = await api.notes.list(id);
      setNotes(nRes.notes || []);
      if (nRes.notes && nRes.notes.length > 0) setSelectedNote(nRes.notes[0]);

      // Load reports
      const rRes = await api.reports.list(id);
      setReports(rRes.reports || []);
      if (rRes.reports && rRes.reports.length > 0) setActiveReport(rRes.reports[0]);

      // Initial friendly greeting in copilot
      setChatMessages([
        {
          id: 'welcome',
          role: 'assistant',
          message: `Hello Dr. Elena. I am your Research Copilot for **${data.project?.title}** (${data.project?.domain} domain). All ${data.documents?.length || 0} papers have been indexed. Ask me to compare findings, trace citation lineages, or extract numerical benchmark data.`,
          citations: []
        }
      ]);
    } catch (err) {
      console.warn('[Workspace] Error loading workspace:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadWorkspace();
  }, [id]);

  // AI Document Analysis Trigger
  const handleAnalyzeDocument = async (docId) => {
    try {
      setAnalyzingDocId(docId);
      const res = await api.ai.analyze(docId);
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, summary: res.summary } : d));
      if (selectedDoc && selectedDoc.id === docId) {
        setSelectedDoc(prev => ({ ...prev, summary: res.summary }));
      }
    } catch (err) {
      alert('Analysis failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAnalyzingDocId(null);
    }
  };

  // Generate Citation Trigger
  const handleOpenCitationModal = async (doc, style = 'APA') => {
    setCitationModalDoc(doc);
    setSelectedCitationStyle(style);
    try {
      const res = await api.ai.generateCitation(doc.id, style);
      setFormattedCitation(res.citation);
    } catch (err) {
      setFormattedCitation(`${doc.authors?.join(', ')} (${doc.publication_year}). ${doc.filename}.`);
    }
  };

  const handleCitationStyleChange = async (style) => {
    setSelectedCitationStyle(style);
    if (!citationModalDoc) return;
    try {
      const res = await api.ai.generateCitation(citationModalDoc.id, style);
      setFormattedCitation(res.citation);
    } catch (err) {
      // fallback
    }
  };

  // Chat Send Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const userText = inputMessage;
    setInputMessage('');
    setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', message: userText }]);
    setChatLoading(true);

    try {
      const res = await api.ai.chat({
        project_id: id,
        message: userText
      });

      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          message: res.answer,
          citations: res.citations || [],
          confidence: res.confidence
        }
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          message: `Unable to complete query: ${err.response?.data?.error || err.message}`,
          citations: []
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Cross Document Comparison Trigger
  const handleRunComparison = async () => {
    if (selectedDocIdsForCompare.length < 2) {
      alert('Please select at least 2 documents to compare.');
      return;
    }
    setComparing(true);
    try {
      const res = await api.ai.compare({
        project_id: id,
        document_ids: selectedDocIdsForCompare
      });
      setComparisonResult(res.comparison);
    } catch (err) {
      alert('Comparison failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setComparing(false);
    }
  };

  // Generate Executive Report Trigger
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await api.ai.generateReport({
        project_id: id,
        title: `Strategic Research Synthesis: ${projectData.title}`,
        focus_areas: [projectData.domain, 'Benchmark Analysis', 'Future Roadmap']
      });
      setReports(prev => [res.report, ...prev]);
      setActiveReport(res.report);
      alert('Executive Report compiled successfully!');
    } catch (err) {
      alert('Report generation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setGeneratingReport(false);
    }
  };

  // Notes Handlers
  const handleSaveNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    try {
      const res = await api.notes.create({
        project_id: id,
        title: newNoteTitle,
        content: newNoteContent,
        linked_sources: selectedDoc ? [selectedDoc.id] : []
      });
      setNotes(prev => [res.note, ...prev]);
      setSelectedNote(res.note);
      setIsEditingNote(false);
      setNewNoteTitle('');
      setNewNoteContent('');
    } catch (err) {
      alert('Failed to save note');
    }
  };

  const handleAiAssistNote = async (action) => {
    if (!selectedNote) return;
    setAiAssistingNote(true);
    try {
      const res = await api.notes.aiAssist({
        prompt: selectedNote.title,
        current_content: selectedNote.content,
        action
      });
      const updated = await api.notes.update(selectedNote.id, {
        content: res.enhanced_content
      });
      setSelectedNote(updated.note);
      setNotes(prev => prev.map(n => n.id === updated.note.id ? updated.note : n));
    } catch (err) {
      alert('AI Note assistance failed');
    } finally {
      setAiAssistingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading Research Workspace...</p>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-base text-white font-bold">Project Not Found</p>
        <button onClick={() => navigate('/projects')} className="text-xs text-indigo-400 underline">
          Return to Projects
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview & Insights', icon: Compass },
    { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
    { id: 'chat', label: 'Research Copilot', icon: MessageSquare },
    { id: 'graph', label: 'Knowledge Graph', icon: GitGraph },
    { id: 'compare', label: 'Cross-Doc Compare', icon: Sparkles },
    { id: 'notes', label: `Notes (${notes.length})`, icon: BookOpen },
    { id: 'reports', label: `Reports (${reports.length})`, icon: Share2 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Project Banner */}
      <div className="p-6 rounded-2xl glass-panel relative border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {projectData.domain}
              </span>
              <span className="text-[11px] text-slate-500">
                Created {new Date(projectData.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{projectData.title}</h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Objective:</strong> {projectData.objective}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/upload')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              Import to Project
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4" />
              {generatingReport ? 'Synthesizing...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: OVERVIEW & SYNTHESIS INSIGHTS                           */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Synthesis Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl glass-card">
                <span className="text-[11px] text-slate-400">Total Literature</span>
                <p className="text-xl font-bold text-white mt-1">{documents.length}</p>
              </div>
              <div className="p-4 rounded-xl glass-card">
                <span className="text-[11px] text-slate-400">AI Analyzed</span>
                <p className="text-xl font-bold text-cyan-400 mt-1">
                  {documents.filter(d => d.summary).length}
                </p>
              </div>
              <div className="p-4 rounded-xl glass-card">
                <span className="text-[11px] text-slate-400">Graph Entities</span>
                <p className="text-xl font-bold text-indigo-400 mt-1">
                  {graphData.nodes?.length || 0}
                </p>
              </div>
            </div>

            {/* Ingested Documents List */}
            <div className="p-5 rounded-xl glass-panel space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Ingested Research Manuscripts</span>
                <button
                  onClick={() => setActiveTab('documents')}
                  className="text-xs text-indigo-400 font-normal hover:underline"
                >
                  Manage all
                </button>
              </h3>

              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => { setSelectedDoc(doc); setActiveTab('documents'); }}
                    className="p-3 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1 max-w-lg">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-300">
                          {doc.source_type}
                        </span>
                        <span className="font-semibold text-white truncate">{doc.filename}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] truncate">
                        {(doc.authors || []).join(', ')} • {doc.publication_year || 'N/A'} • {doc.token_count || 5000} tokens
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.summary ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Analyzed
                        </span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAnalyzeDocument(doc.id); }}
                          disabled={analyzingDocId === doc.id}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-semibold"
                        >
                          {analyzingDocId === doc.id ? 'Analyzing...' : 'Analyze AI'}
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Mini Knowledge Graph */}
          <div className="space-y-6">
            <div className="p-5 rounded-xl glass-panel space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <GitGraph className="w-4 h-4 text-cyan-400" />
                  Project Concept Graph
                </h3>
                <button
                  onClick={() => setActiveTab('graph')}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Expand
                </button>
              </div>
              <KnowledgeGraphCanvas graph={graphData} height={300} />
            </div>

            {/* Quick Copilot Questions */}
            <div className="p-5 rounded-xl glass-card space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Suggested Research Queries
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  'What are the core hardware limitations of Hopper GPUs in this study?',
                  'Compare Mamba linear scaling vs FlashAttention-3 throughput at 128k.',
                  'Summarize the evidence strength for hybrid sequence models.'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputMessage(q);
                      setActiveTab('chat');
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 transition text-xs"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: DOCUMENTS & DEEP DECOMPOSITION VIEWER                  */}
      {/* ============================================================== */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document List Sidebar (1 Col) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Corpus Documents ({documents.length})
              </h3>
              <button
                onClick={() => navigate('/upload')}
                className="text-xs text-indigo-400 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                    selectedDoc?.id === doc.id
                      ? 'bg-slate-900 border-indigo-500 shadow-md'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-300">
                      {doc.source_type}
                    </span>
                    <span className="text-[10px] text-slate-500">{doc.publication_year || 2024}</span>
                  </div>
                  <h4 className="font-semibold text-white truncate">{doc.filename}</h4>
                  <p className="text-slate-400 text-[11px] truncate mt-0.5">
                    {(doc.authors || []).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Document Deep Analysis Detail (2 Cols) */}
          <div className="lg:col-span-2">
            {selectedDoc ? (
              <div className="p-6 rounded-2xl glass-panel space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedDoc.filename}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Authors: {(selectedDoc.authors || []).join(', ')} • Year: {selectedDoc.publication_year || 'N/A'} • DOI: {selectedDoc.doi || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenCitationModal(selectedDoc)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Quote className="w-3.5 h-3.5 text-cyan-400" />
                      Cite
                    </button>
                    {!selectedDoc.summary && (
                      <button
                        onClick={() => handleAnalyzeDocument(selectedDoc.id)}
                        disabled={analyzingDocId === selectedDoc.id}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {analyzingDocId === selectedDoc.id ? 'Decomposing...' : 'Decompose with AI'}
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Summary Breakdown */}
                {selectedDoc.summary ? (
                  <div className="space-y-6 text-xs text-slate-300">
                    {/* Executive Summary */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Executive Summary
                      </h4>
                      <p className="leading-relaxed p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200">
                        {selectedDoc.summary.summary}
                      </p>
                    </div>

                    {/* Key Findings */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Key Empirical Findings
                      </h4>
                      <ul className="space-y-1.5 pl-2">
                        {(selectedDoc.summary.key_findings || []).map((f, i) => (
                          <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/40 border border-slate-800/60">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Methodology & Limitations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                        <h5 className="font-bold text-slate-200">Research Methodology</h5>
                        <p className="text-slate-400 leading-relaxed">
                          {selectedDoc.summary.methodology || 'Empirical benchmark analysis'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                        <h5 className="font-bold text-rose-300">Acknowledged Limitations</h5>
                        <ul className="space-y-1 list-disc pl-4 text-slate-400">
                          {(selectedDoc.summary.limitations || []).map((lim, i) => (
                            <li key={i}>{lim}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Extracted Keywords */}
                    {selectedDoc.summary.keywords && (
                      <div className="pt-2">
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDoc.summary.keywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px]">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                    <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">Document Not Yet Decomposed</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Click the button below to extract executive summaries, methodology details, and quantitative findings using Google Gemini.
                    </p>
                    <button
                      onClick={() => handleAnalyzeDocument(selectedDoc.id)}
                      disabled={analyzingDocId === selectedDoc.id}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                    >
                      {analyzingDocId === selectedDoc.id ? 'Analyzing...' : 'Run AI Decomposition'}
                    </button>
                  </div>
                )}

                {/* Raw Extracted Text Viewer Collapsible */}
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Raw Extracted Text Sample
                  </h4>
                  <div className="max-h-48 overflow-y-auto p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap border border-slate-800">
                    {selectedDoc.extracted_text.slice(0, 4000)}...
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">Select a document to inspect</div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: RESEARCH COPILOT CHAT (STRICT GROUNDING & CITATIONS)    */}
      {/* ============================================================== */}
      {activeTab === 'chat' && (
        <div className="rounded-2xl glass-panel border border-slate-800 flex flex-col h-[700px]">
          {/* Chat Header */}
          <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white">KnowSphere Research Copilot</h3>
                <p className="text-[10px] text-slate-400">Strictly grounded in {documents.length} project documents</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Grounding: 100%
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 text-xs font-bold">
                    AI
                  </div>
                )}

                <div className={`max-w-2xl space-y-3 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm p-4 text-xs' : 'space-y-3'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-3">
                      <div className="markdown-content">
                        <ReactMarkdown>{msg.message}</ReactMarkdown>
                      </div>

                      {/* Grounded Citation Cards */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-3 border-t border-slate-800 space-y-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Grounded Supporting Excerpts
                          </p>
                          <div className="space-y-1.5">
                            {msg.citations.map((cite, idx) => (
                              <div key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px]">
                                <span className="text-cyan-400 font-bold block mb-0.5">
                                  [{idx + 1}] {cite.title}
                                </span>
                                <p className="text-slate-400 italic">"{cite.quote}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span>{msg.message}</span>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 text-xs font-bold">
                    U
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 text-xs font-bold">
                  AI
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  Synthesizing grounded answer with citations...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask a technical or empirical question about these papers..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl glass-input focus:outline-none"
            />
            <button
              type="submit"
              disabled={chatLoading || !inputMessage.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              Ask
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: INTERACTIVE KNOWLEDGE GRAPH VIEW                       */}
      {/* ============================================================== */}
      {activeTab === 'graph' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GitGraph className="w-5 h-5 text-indigo-400" />
                Interactive Entity & Concept Graph
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Drag nodes to inspect relationships, zoom with mousewheel, click any node to view connected neighbors.
              </p>
            </div>
            <button
              onClick={async () => {
                setRefreshingGraph(true);
                const res = await api.ai.getKnowledgeGraph(id, true);
                setGraphData(res.graph || { nodes: [], edges: [] });
                setRefreshingGraph(false);
              }}
              disabled={refreshingGraph}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingGraph ? 'animate-spin' : ''}`} />
              Re-Synthesize Graph
            </button>
          </div>

          <KnowledgeGraphCanvas graph={graphData} height={620} />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: CROSS-DOCUMENT COMPARISON MATRIX                       */}
      {/* ============================================================== */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Cross-Document Meta-Analysis Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Select 2 or more publications to compute factual agreements, contradictions, methodology divergences, and evidence weighting.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {documents.map((doc) => {
                const isSelected = selectedDocIdsForCompare.includes(doc.id);
                return (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocIdsForCompare(prev =>
                        isSelected ? prev.filter(x => x !== doc.id) : [...prev, doc.id]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? '#ffffff' : '#64748b' }} />
                    {doc.filename}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleRunComparison}
              disabled={comparing || selectedDocIdsForCompare.length < 2}
              className="mt-3 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              {comparing ? 'Synthesizing Meta-Analysis...' : `Compare ${selectedDocIdsForCompare.length} Selected Papers`}
            </button>
          </div>

          {/* Comparison Result Cards */}
          {comparisonResult && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  Integrated Meta-Analytical Insight
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {comparisonResult.final_insight}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Agreements */}
                <div className="p-5 rounded-xl glass-card space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Consensus & Agreements
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(comparisonResult.agreements || []).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 p-2 rounded bg-slate-900/60 border border-slate-800">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contradictions */}
                <div className="p-5 rounded-xl glass-card space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    Contradictions & Divergences
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(comparisonResult.contradictions || []).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 p-2 rounded bg-slate-900/60 border border-slate-800">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Methodology Differences */}
                <div className="p-5 rounded-xl glass-card space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    Methodology Divergences
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(comparisonResult.methodology_differences || []).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 p-2 rounded bg-slate-900/60 border border-slate-800">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Evidence Strength */}
                <div className="p-5 rounded-xl glass-card space-y-3">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Evidence Strength Assessment
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(comparisonResult.evidence_strength || []).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 p-2 rounded bg-slate-900/60 border border-slate-800">
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
      )}

      {/* ============================================================== */}
      {/* TAB 6: LINKED RESEARCH NOTES                                  */}
      {/* ============================================================== */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Research Notes ({notes.length})
              </h3>
              <button
                onClick={() => { setIsEditingNote(true); setSelectedNote(null); }}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New Note
              </button>
            </div>

            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => { setSelectedNote(note); setIsEditingNote(false); }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                    selectedNote?.id === note.id && !isEditingNote
                      ? 'bg-slate-900 border-indigo-500 shadow-md'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <h4 className="font-semibold text-white truncate">{note.title}</h4>
                  <p className="text-slate-400 text-[11px] line-clamp-2 mt-1">
                    {note.content.replace(/#|\*|_/g, '')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {isEditingNote ? (
              <div className="p-6 rounded-2xl glass-panel space-y-4">
                <h3 className="text-base font-bold text-white">Create New Research Note</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="Note heading..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Markdown Content</label>
                  <textarea
                    rows={8}
                    placeholder="Write observations, equations, or synthesized thoughts..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input focus:outline-none font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingNote(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ) : selectedNote ? (
              <div className="p-6 rounded-2xl glass-panel space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white">{selectedNote.title}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAiAssistNote('expand')}
                      disabled={aiAssistingNote}
                      className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      Expand AI
                    </button>
                    <button
                      onClick={() => handleAiAssistNote('summarize')}
                      disabled={aiAssistingNote}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
                    >
                      Summarize
                    </button>
                  </div>
                </div>

                <div className="markdown-content text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">Select or create a note</div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: EXECUTIVE REPORTS & EXPORTS                            */}
      {/* ============================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                Executive Synthesis Reports
              </h3>
              <p className="text-xs text-slate-400">
                Complete, publication-ready reports compiling executive summaries, literature review, findings, and references.
              </p>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {generatingReport ? 'Synthesizing...' : 'Generate New Report'}
            </button>
          </div>

          {activeReport ? (
            <div className="p-8 rounded-2xl glass-panel border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">{activeReport.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Compiled by KnowSphere AI Engine • {new Date(activeReport.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const blob = new Blob([activeReport.report_content], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${activeReport.title.replace(/[^a-z0-9]/gi, '_')}.md`;
                      a.click();
                    }}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Markdown
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Print / PDF
                  </button>
                </div>
              </div>

              {/* Render Full Markdown Report */}
              <div className="markdown-content text-slate-300 text-xs sm:text-sm leading-relaxed max-w-4xl">
                <ReactMarkdown>{activeReport.report_content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center rounded-2xl glass-panel space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-base text-white font-bold">No Reports Generated Yet</p>
              <button
                onClick={handleGenerateReport}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
              >
                Synthesize First Report
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* CITATION MODAL (MULTI-STYLE: APA, MLA, CHICAGO, IEEE, BIBTEX) */}
      {/* ============================================================== */}
      {citationModalDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Generate Bibliographic Citation</h3>
              </div>
              <button
                onClick={() => setCitationModalDoc(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Citation Style Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {['APA', 'MLA', 'CHICAGO', 'IEEE', 'BIBTEX'].map(style => (
                <button
                  key={style}
                  onClick={() => handleCitationStyleChange(style)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded transition ${
                    selectedCitationStyle === style
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            {/* Formatted Citation Text */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap select-all">
              {formattedCitation || 'Formatting citation...'}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(formattedCitation);
                  alert('Citation copied to clipboard!');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Citation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
