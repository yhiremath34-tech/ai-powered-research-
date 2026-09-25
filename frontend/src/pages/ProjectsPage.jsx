import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

const DOMAIN_OPTIONS = [
  'All',
  'Academic Research',
  'Technology',
  'Healthcare',
  'Agriculture',
  'Finance',
  'Law',
  'Government',
  'Climate',
  'Energy',
  'Education',
  'Business',
  'Startups',
  'Engineering',
  'Social Sciences'
];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDomain, setActiveDomain] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    domain: 'Technology',
    objective: '',
    expected_outcome: '',
    tags: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto open modal if ?create=true in URL
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.projects.list({
        domain: activeDomain !== 'All' ? activeDomain : undefined,
        search: searchQuery || undefined
      });
      setProjects(data.projects || []);
    } catch (err) {
      console.warn('[ProjectsPage] Error loading projects:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeDomain, searchQuery]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const tagsArray = newProject.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const created = await api.projects.create({
        ...newProject,
        tags: tagsArray
      });

      setIsModalOpen(false);
      setNewProject({
        title: '',
        description: '',
        domain: 'Technology',
        objective: '',
        expected_outcome: '',
        tags: ''
      });
      await fetchProjects();
      navigate(`/project/${created.project.id}`);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this research project and all associated documents?')) return;
    try {
      await api.projects.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-indigo-400" />
            Research Projects
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize multi-source documents, AI conversations, and citation graphs by domain.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Create Research Project
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Domain Tabs Carousel */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {DOMAIN_OPTIONS.slice(0, 8).map(dom => (
            <button
              key={dom}
              onClick={() => setActiveDomain(dom)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                activeDomain === dom
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
          />
        </div>
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading research projects...</div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-panel space-y-4">
          <Compass className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No research projects found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery
              ? 'No projects matching your search filter.'
              : 'Create your first project to begin importing manuscripts and synthesizing insights.'}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
          >
            Create New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/project/${proj.id}`)}
              className="p-6 rounded-2xl glass-card group cursor-pointer flex flex-col justify-between space-y-4 hover:border-indigo-500/40 relative"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    {proj.domain}
                  </span>
                  <button
                    onClick={(e) => handleDeleteProject(e, proj.id)}
                    title="Delete Project"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {proj.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {proj.description || proj.objective}
                </p>

                {proj.tags && proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    {proj.document_count || 0} Docs
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(proj.created_at).toLocaleDateString()}
                  </span>
                </div>

                <span className="text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Enter
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Create New Research Project</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sub-Quadratic Attention Scaling in LLMs"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Research Domain *</label>
                <select
                  value={newProject.domain}
                  onChange={(e) => setNewProject({ ...newProject, domain: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input focus:outline-none bg-slate-900 text-slate-200"
                >
                  {DOMAIN_OPTIONS.filter(d => d !== 'All').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Research Objective *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Define primary question, hypothesis, or benchmark goal..."
                  value={newProject.objective}
                  onChange={(e) => setNewProject({ ...newProject, objective: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Background context and scope..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Transformers, Hardware, Scalability, Quantization"
                  value={newProject.tags}
                  onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  {submitting ? 'Creating...' : 'Initialize Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
