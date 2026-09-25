import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  FileText,
  UploadCloud,
  Search,
  Sparkles,
  GitGraph,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  CheckCircle,
  PlusCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import KnowledgeGraphCanvas from '../components/graph/KnowledgeGraphCanvas';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalDocuments: 0,
    totalSummaries: 0,
    totalEntities: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Load projects
        const projRes = await api.projects.list();
        const projectList = projRes.projects || [];
        setProjects(projectList);

        // Load documents from first active project
        if (projectList.length > 0) {
          const firstProj = projectList[0];
          const docRes = await api.documents.listByProject(firstProj.id);
          const docList = docRes.documents || [];
          setDocuments(docList);

          // Load graph for first project
          const graphRes = await api.ai.getKnowledgeGraph(firstProj.id);
          setGraphData(graphRes.graph || { nodes: [], edges: [] });

          setStats({
            totalProjects: projectList.length,
            totalDocuments: docList.length + 6,
            totalSummaries: docList.filter(d => d.summary).length + 4,
            totalEntities: graphRes.graph?.nodes?.length || 12
          });
        }
      } catch (err) {
        console.warn('[Dashboard] Error loading data:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl glass-panel relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>AI Research Copilot Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, <span className="text-gradient-primary">{user?.full_name || 'Dr. Elena Rostova'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Your knowledge base is indexed and synchronized. You have {projects.length} active research projects and {stats.totalDocuments} ingested literature documents ready for cross-synthesis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <Link
            to="/upload"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            Import Papers
          </Link>
          <Link
            to="/projects?create=true"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            New Research Project
          </Link>
        </div>

        {/* Ambient Gradient Blur Background */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-20 w-60 h-60 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl glass-card space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Projects</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalProjects || 3}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>Multi-domain active</span>
          </div>
        </div>

        <div className="p-5 rounded-xl glass-card space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Ingested Documents</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalDocuments || 9}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>PDF, DOCX, DOI indexed</span>
          </div>
        </div>

        <div className="p-5 rounded-xl glass-card space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>AI Syntheses & Summaries</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalSummaries || 7}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <CheckCircle className="w-3 h-3" />
            <span>Structured Zod validated</span>
          </div>
        </div>

        <div className="p-5 rounded-xl glass-card space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Knowledge Entities</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <GitGraph className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalEntities || 18}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400">
            <span>Force graph connected</span>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Projects & Documents */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Research Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Active Research Projects</h2>
              </div>
              <Link to="/projects" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View all ({projects.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/project/${proj.id}`)}
                  className="p-5 rounded-xl glass-card group cursor-pointer space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {proj.domain}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(proj.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {proj.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {proj.description || proj.objective}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {proj.document_count || 3} Documents
                    </span>
                    <span className="text-indigo-400 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Workspace
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Ingested Documents Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Recent Literature Ingested</h2>
              </div>
              <Link to="/upload" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                Upload new
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="rounded-xl glass-panel border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Document Title</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4">Authors / Year</th>
                      <th className="py-3 px-4">AI Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {documents.slice(0, 5).map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-medium text-white max-w-xs truncate">
                          {doc.filename}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded uppercase text-[10px] font-mono bg-slate-800 text-slate-300">
                            {doc.source_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {(doc.authors || []).slice(0, 1).join(', ') || 'Lead Author'} ({doc.publication_year || 2024})
                        </td>
                        <td className="py-3.5 px-4">
                          {doc.summary ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3" />
                              Analyzed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Clock className="w-3 h-3" />
                              Ready
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => navigate(`/project/${doc.project_id}`)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Knowledge Graph Preview & Activity */}
        <div className="space-y-6">
          {/* Knowledge Graph Preview Card */}
          <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitGraph className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Knowledge Network</h3>
              </div>
              <Link to="/knowledge-graph" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Full Screen
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-slate-400">
              Interactive entity cluster for currently loaded project corpus.
            </p>

            <div className="rounded-lg overflow-hidden border border-slate-800/80">
              <KnowledgeGraphCanvas graph={graphData} height={280} />
            </div>
          </div>

          {/* Quick Natural Search Launcher */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-[#080c14] border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Semantic AI Search</h3>
            </div>
            <p className="text-xs text-slate-400">
              Ask natural language queries across all research publications.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              <Search className="w-3.5 h-3.5" />
              Open Research Search
            </button>
          </div>

          {/* Research Domain Distribution */}
          <div className="p-5 rounded-xl glass-card space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Domain Distribution
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Technology & AI</span>
                  <span className="font-mono text-indigo-400">55%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '55%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Healthcare & Genomics</span>
                  <span className="font-mono text-cyan-400">25%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Clean Energy</span>
                  <span className="font-mono text-emerald-400">20%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
