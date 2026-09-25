import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Globe,
  Hash,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export default function UploadPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [activeImportType, setActiveImportType] = useState('file'); // 'file', 'url', 'doi', 'manual'

  // File Upload State
  const [file, setFile] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [publicationYear, setPublicationYear] = useState(new Date().getFullYear());
  const [tags, setTags] = useState('');

  // URL State
  const [url, setUrl] = useState('');
  const [urlTitle, setUrlTitle] = useState('');

  // DOI State
  const [doi, setDoi] = useState('');

  // Manual State
  const [manualTitle, setManualTitle] = useState('');
  const [manualText, setManualText] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await api.projects.list();
        setProjects(data.projects || []);
        if (data.projects && data.projects.length > 0) {
          setSelectedProjectId(data.projects[0].id);
        }
      } catch (err) {
        console.warn('Failed to load projects for upload:', err);
      }
    }
    loadProjects();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedProjectId) {
      setStatusMessage({ type: 'error', text: 'Please select a file and a destination project.' });
      return;
    }

    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Parsing document bytes and extracting text...' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', selectedProjectId);
      if (fileTitle) formData.append('title', fileTitle);
      if (authors) formData.append('authors', authors);
      if (publicationYear) formData.append('publication_year', publicationYear);
      if (tags) formData.append('tags', tags);

      const res = await api.documents.upload(formData);

      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      setStatusMessage({ type: 'success', text: `Document "${res.document.filename}" successfully parsed and indexed!` });

      setTimeout(() => {
        navigate(`/project/${selectedProjectId}`);
      }, 1500);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlExtract = async (e) => {
    e.preventDefault();
    if (!url || !selectedProjectId) return;

    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Scraping web page and sanitizing textual content...' });

    try {
      const res = await api.documents.extractUrl({
        project_id: selectedProjectId,
        url,
        title: urlTitle
      });

      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      setStatusMessage({ type: 'success', text: `Web article "${res.document.filename}" imported successfully!` });

      setTimeout(() => {
        navigate(`/project/${selectedProjectId}`);
      }, 1500);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDoiImport = async (e) => {
    e.preventDefault();
    if (!doi || !selectedProjectId) return;

    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Querying CrossRef API and resolving publication metadata...' });

    try {
      const res = await api.documents.importDoi({
        project_id: selectedProjectId,
        doi
      });

      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      setStatusMessage({ type: 'success', text: `DOI publication "${res.document.filename}" indexed!` });

      setTimeout(() => {
        navigate(`/project/${selectedProjectId}`);
      }, 1500);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleManualCreate = async (e) => {
    e.preventDefault();
    if (!manualTitle || !manualText || !selectedProjectId) return;

    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Saving text entry to project corpus...' });

    try {
      const res = await api.documents.createManual({
        project_id: selectedProjectId,
        title: manualTitle,
        content: manualText,
        publication_year: new Date().getFullYear()
      });

      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      setStatusMessage({ type: 'success', text: `Text entry "${res.document.filename}" saved!` });

      setTimeout(() => {
        navigate(`/project/${selectedProjectId}`);
      }, 1500);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  const importTabs = [
    { id: 'file', label: 'PDF / DOCX File Drop', icon: FileText },
    { id: 'url', label: 'Web URL Scraper', icon: Globe },
    { id: 'doi', label: 'DOI Lookup (CrossRef)', icon: Hash },
    { id: 'manual', label: 'Manual Text Paste', icon: Edit3 }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-cyan-400" />
          Multi-Source Document Import
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ingest scientific papers, clinical trials, policy documents, and web literature into your research project.
        </p>
      </div>

      {/* Target Project Selection */}
      <div className="p-4 rounded-xl glass-panel space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300">
          Target Research Project *
        </label>
        {projects.length === 0 ? (
          <p className="text-xs text-rose-400">
            No projects found. Please create a project first before importing documents.
          </p>
        ) : (
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg glass-input focus:outline-none bg-slate-900 text-slate-200"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.domain})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Import Method Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
        {importTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeImportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveImportType(tab.id); setStatusMessage({ type: '', text: '' }); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status Alerts */}
      {statusMessage.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: FILE DROPZONE */}
      {activeImportType === 'file' && (
        <form onSubmit={handleFileUpload} className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/70 rounded-xl p-8 text-center transition bg-slate-900/30">
            <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-white">Drag & drop research document</p>
            <p className="text-[11px] text-slate-500 mt-1">Supports PDF, DOCX, TXT, Markdown (Max 25MB)</p>

            <input
              type="file"
              id="file-input"
              accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                  setFileTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                }
              }}
              className="hidden"
            />
            <label
              htmlFor="file-input"
              className="inline-block mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer transition"
            >
              Browse Files
            </label>

            {file && (
              <div className="mt-3 p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 font-mono inline-block">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Document Title (Optional)</label>
              <input
                type="text"
                placeholder="Leave blank to use filename"
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass-input focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Authors (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Tri Dao, Jay Shah"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass-input focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Publication Year</label>
              <input
                type="number"
                value={publicationYear}
                onChange={(e) => setPublicationYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg glass-input focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tags</label>
              <input
                type="text"
                placeholder="DeepLearning, Hardware"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass-input focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loading ? 'Parsing & Indexing...' : 'Upload & Process Document'}
          </button>
        </form>
      )}

      {/* TAB 2: URL EXTRACTION */}
      {activeImportType === 'url' && (
        <form onSubmit={handleUrlExtract} className="p-6 rounded-2xl glass-panel space-y-4">
          <p className="text-xs text-slate-400">
            Paste a link to a blog post, research paper HTML page, or technical report. KnowSphere will scrape and sanitize the main article content.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Web Page URL *</label>
            <input
              type="url"
              required
              placeholder="https://arxiv.org/abs/2407.08608 or https://deepmind.google/discover/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg glass-input focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Title (Optional)</label>
            <input
              type="text"
              placeholder="Leave blank to use scraped page title"
              value={urlTitle}
              onChange={(e) => setUrlTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg glass-input focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !url}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            {loading ? 'Scraping & Indexing...' : 'Fetch & Ingest Web Article'}
          </button>
        </form>
      )}

      {/* TAB 3: DOI LOOKUP */}
      {activeImportType === 'doi' && (
        <form onSubmit={handleDoiImport} className="p-6 rounded-2xl glass-panel space-y-4">
          <p className="text-xs text-slate-400">
            Enter any peer-reviewed scientific Digital Object Identifier (DOI). KnowSphere connects to CrossRef to resolve bibliographic data, authors, journal, and abstract.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Digital Object Identifier (DOI) *</label>
            <input
              type="text"
              required
              placeholder="10.48550/arXiv.2407.08608 or 10.1038/s41586-024-07566-y"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg glass-input focus:outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !doi}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition"
          >
            <Hash className="w-3.5 h-3.5" />
            {loading ? 'Querying CrossRef...' : 'Resolve & Index DOI'}
          </button>
        </form>
      )}

      {/* TAB 4: MANUAL TEXT PASTE */}
      {activeImportType === 'manual' && (
        <form onSubmit={handleManualCreate} className="p-6 rounded-2xl glass-panel space-y-4">
          <p className="text-xs text-slate-400">
            Paste raw text excerpts, experiment transcripts, clinical case notes, or interview transcripts directly into your project.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lab Experiment Run #42 Notes"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg glass-input focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Raw Content *</label>
            <textarea
              required
              rows={8}
              placeholder="Paste raw text here..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg glass-input focus:outline-none font-mono leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !manualTitle || !manualText}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {loading ? 'Saving...' : 'Add Text Document'}
          </button>
        </form>
      )}
    </div>
  );
}
