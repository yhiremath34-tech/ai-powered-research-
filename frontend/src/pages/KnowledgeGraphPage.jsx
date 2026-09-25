import React, { useState, useEffect } from 'react';
import {
  GitGraph,
  Layers,
  Filter,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { api } from '../services/api';
import KnowledgeGraphCanvas from '../components/graph/KnowledgeGraphCanvas';

export default function KnowledgeGraphPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const pRes = await api.projects.list();
        const pList = pRes.projects || [];
        setProjects(pList);

        if (pList.length > 0) {
          const firstId = pList[0].id;
          setSelectedProjectId(firstId);
          const gRes = await api.ai.getKnowledgeGraph(firstId);
          setGraphData(gRes.graph || { nodes: [], edges: [] });
        }
      } catch (err) {
        console.warn('Error loading graph page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleProjectChange = async (projectId) => {
    setSelectedProjectId(projectId);
    setLoading(true);
    try {
      const gRes = await api.ai.getKnowledgeGraph(projectId);
      setGraphData(gRes.graph || { nodes: [], edges: [] });
    } catch (err) {
      console.warn('Error loading graph for project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshGraph = async () => {
    if (!selectedProjectId) return;
    setRefreshing(true);
    try {
      const gRes = await api.ai.getKnowledgeGraph(selectedProjectId, true);
      setGraphData(gRes.graph || { nodes: [], edges: [] });
    } catch (err) {
      alert('Graph re-synthesis failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Project Selector and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitGraph className="w-6 h-6 text-indigo-400" />
            Interactive Knowledge Graph Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic force-directed graph mapping authors, organizations, technologies, concepts, and citations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.domain})</option>
              ))}
            </select>
          )}

          <button
            onClick={handleRefreshGraph}
            disabled={refreshing}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Extracting...' : 'Re-Extract Graph'}
          </button>
        </div>
      </div>

      {/* Main Graph Canvas Container */}
      <div className="rounded-2xl glass-panel border border-slate-800 p-2 shadow-2xl">
        <KnowledgeGraphCanvas graph={graphData} height={680} />
      </div>

      {/* Entity Analytics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl glass-card">
          <span className="text-slate-400">Total Entities</span>
          <p className="text-xl font-bold text-white mt-1">{graphData.nodes?.length || 0}</p>
        </div>
        <div className="p-4 rounded-xl glass-card">
          <span className="text-slate-400">Directed Relationships</span>
          <p className="text-xl font-bold text-cyan-400 mt-1">{graphData.edges?.length || 0}</p>
        </div>
        <div className="p-4 rounded-xl glass-card">
          <span className="text-slate-400">Physics Simulation</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">Force-Directed</p>
        </div>
        <div className="p-4 rounded-xl glass-card">
          <span className="text-slate-400">Extraction Engine</span>
          <p className="text-xl font-bold text-indigo-400 mt-1">Gemini 1.5 Pro</p>
        </div>
      </div>
    </div>
  );
}
