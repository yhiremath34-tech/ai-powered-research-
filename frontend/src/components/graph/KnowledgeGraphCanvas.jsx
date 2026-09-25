import React, { useRef, useEffect, useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Filter, Search, Info, X, Share2, Layers } from 'lucide-react';

const TYPE_COLORS = {
  technology: '#06b6d4',      // Cyan
  concept: '#818cf8',         // Indigo
  author: '#10b981',          // Emerald
  organization: '#f59e0b',    // Amber
  paper: '#f43f5e',           // Rose
  research_topic: '#a855f7',  // Violet
  location: '#ec4899',        // Pink
  citation: '#3b82f6'         // Blue
};

export default function KnowledgeGraphCanvas({ graph, className = '', height = 600, onNodeSelect }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Physics simulation state references
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const isDraggingRef = useRef(false);
  const draggedNodeRef = useRef(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);

  // Initialize node physics coordinates when graph changes
  useEffect(() => {
    if (!graph || !graph.nodes || graph.nodes.length === 0) return;

    const width = containerRef.current ? containerRef.current.clientWidth : 800;
    const canvasHeight = height;

    // Create a local map and arrange nodes in an initial distribution circle
    const nodeCount = graph.nodes.length;
    nodesRef.current = graph.nodes.map((node, i) => {
      const angle = (i / nodeCount) * 2 * Math.PI;
      const radius = 140 + (i % 3) * 60;
      return {
        ...node,
        x: width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
        y: canvasHeight / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        radius: node.type === 'paper' ? 22 : node.type === 'concept' ? 18 : 16
      };
    });

    edgesRef.current = (graph.edges || []).map(edge => ({ ...edge }));
  }, [graph, height]);

  // Main Physics Simulation & Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updatePhysicsAndDraw = () => {
      const width = canvas.width;
      const canvasHeight = canvas.height;

      // 1. Physics Calculations
      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // Repulsion between nodes (Coulomb force)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 280) {
            const force = (280 - dist) / 280 * 0.8;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (draggedNodeRef.current !== n1) { n1.vx -= fx; n1.vy -= fy; }
            if (draggedNodeRef.current !== n2) { n2.vx += fx; n2.vy += fy; }
          }
        }
      }

      // Spring attraction along edges (Hooke's law)
      const nodeMap = new Map(nodes.map(n => [n.id, n]));
      for (const edge of edges) {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const desiredDist = 120;
          const force = (dist - desiredDist) * 0.015;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (draggedNodeRef.current !== source) { source.vx += fx; source.vy += fy; }
          if (draggedNodeRef.current !== target) { target.vx -= fx; target.vy -= fy; }
        }
      }

      // Center gravity pull & Velocity damping
      const centerX = width / 2;
      const centerY = canvasHeight / 2;
      for (const node of nodes) {
        if (draggedNodeRef.current === node) continue;
        const gdx = centerX - node.x;
        const gdy = centerY - node.y;
        node.vx += gdx * 0.0012;
        node.vy += gdy * 0.0012;

        // Apply friction
        node.vx *= 0.88;
        node.vy *= 0.88;

        node.x += node.vx;
        node.y += node.vy;
      }

      // 2. Render Scene
      ctx.clearRect(0, 0, width, canvasHeight);
      ctx.save();

      // Apply Pan and Zoom Transformations
      ctx.translate(panOffset.x, panOffset.y);
      ctx.translate(width / 2, canvasHeight / 2);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-width / 2, -canvasHeight / 2);

      // Draw Edges
      for (const edge of edges) {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) continue;

        const isConnectedToSelected = selectedNode && (source.id === selectedNode.id || target.id === selectedNode.id);
        const isConnectedToHovered = hoveredNode && (source.id === hoveredNode.id || target.id === hoveredNode.id);

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (isConnectedToSelected || isConnectedToHovered) {
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#6366f1';
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow

        // Render Edge Relation Label if connected
        if (isConnectedToSelected || isConnectedToHovered) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          ctx.font = '10px Inter, sans-serif';
          ctx.fillStyle = '#a5b4fc';
          ctx.textAlign = 'center';
          ctx.fillText(edge.relation || 'relates', midX, midY - 4);
        }
      }

      // Draw Nodes
      for (const node of nodes) {
        const isSelected = selectedNode && selectedNode.id === node.id;
        const isHovered = hoveredNode && hoveredNode.id === node.id;
        const isMatchSearch = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
        const isFilterMuted = filterType !== 'ALL' && node.type.toUpperCase() !== filterType.toUpperCase();

        const baseColor = TYPE_COLORS[node.type] || '#818cf8';

        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? node.radius + 6 : isHovered ? node.radius + 3 : node.radius, 0, Math.PI * 2);

        // Node fill
        if (isFilterMuted) {
          ctx.fillStyle = 'rgba(51, 65, 85, 0.4)';
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
        } else {
          ctx.fillStyle = isSelected ? baseColor : 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = baseColor;
        }

        ctx.lineWidth = isSelected ? 3.5 : isHovered || isMatchSearch ? 2.5 : 1.5;

        if (isSelected || isHovered || isMatchSearch) {
          ctx.shadowColor = baseColor;
          ctx.shadowBlur = 15;
        }

        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Node Inner Icon or Core Glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#ffffff' : baseColor;
        ctx.fill();

        // Node Label
        ctx.font = isSelected ? 'bold 12px Inter, sans-serif' : '11px Inter, sans-serif';
        ctx.fillStyle = isFilterMuted ? 'rgba(148, 163, 184, 0.4)' : isSelected ? '#ffffff' : '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Truncate label if too long
        const displayLabel = node.label.length > 22 ? node.label.substring(0, 20) + '...' : node.label;
        ctx.fillText(displayLabel, node.x, node.y + node.radius + 6);
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(updatePhysicsAndDraw);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysicsAndDraw);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [panOffset, zoomLevel, selectedNode, hoveredNode, filterType, searchQuery]);

  // Convert Screen Mouse Coordinates to Canvas Virtual Coordinates (accounting for pan & zoom)
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const width = canvas.width;
    const canvasHeight = canvas.height;

    const virtX = (screenX - panOffset.x - width / 2) / zoomLevel + width / 2;
    const virtY = (screenY - panOffset.y - canvasHeight / 2) / zoomLevel + canvasHeight / 2;

    return { x: virtX, y: virtY };
  };

  // Find node under mouse
  const getNodeAtCoords = (virtX, virtY) => {
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const dx = virtX - node.x;
      const dy = virtY - node.y;
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 6) {
        return node;
      }
    }
    return null;
  };

  // Canvas Mouse Event Handlers
  const handleMouseDown = (e) => {
    const { x, y } = getCanvasCoords(e);
    const clickedNode = getNodeAtCoords(x, y);

    if (clickedNode) {
      isDraggingRef.current = true;
      draggedNodeRef.current = clickedNode;
      setSelectedNode(clickedNode);
      if (onNodeSelect) onNodeSelect(clickedNode);
    } else {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = getCanvasCoords(e);

    if (isDraggingRef.current && draggedNodeRef.current) {
      draggedNodeRef.current.x = x;
      draggedNodeRef.current.y = y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
      return;
    }

    if (isPanningRef.current) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      });
      return;
    }

    const hovered = getNodeAtCoords(x, y);
    setHoveredNode(hovered);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hovered ? 'pointer' : 'grab';
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    draggedNodeRef.current = null;
    isPanningRef.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoomLevel(prev => Math.min(3.0, Math.max(0.35, prev * zoomFactor)));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  // Connected nodes for the inspector sidebar
  const connectedNeighbors = useMemo(() => {
    if (!selectedNode || !graph?.edges) return [];
    const neighbors = [];
    for (const edge of graph.edges) {
      if (edge.source === selectedNode.id) {
        const target = graph.nodes.find(n => n.id === edge.target);
        if (target) neighbors.push({ node: target, relation: edge.relation, direction: 'outgoing' });
      } else if (edge.target === selectedNode.id) {
        const source = graph.nodes.find(n => n.id === edge.source);
        if (source) neighbors.push({ node: source, relation: edge.relation, direction: 'incoming' });
      }
    }
    return neighbors;
  }, [selectedNode, graph]);

  // Adjust canvas size to parent container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = height;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [height]);

  const filterOptions = ['ALL', 'TECHNOLOGY', 'CONCEPT', 'AUTHOR', 'ORGANIZATION', 'RESEARCH_TOPIC'];

  return (
    <div ref={containerRef} className={`relative rounded-xl border border-slate-800 bg-[#080c14] overflow-hidden ${className}`}>
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Entity Type Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700/60 pointer-events-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          {filterOptions.map(opt => (
            <button
              key={opt}
              onClick={() => setFilterType(opt)}
              className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                filterType === opt
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Search in Graph & Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Find entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 focus:w-48 transition-all"
            />
          </div>

          <div className="flex items-center bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700/60 p-0.5">
            <button
              onClick={() => setZoomLevel(prev => Math.min(3.0, prev * 1.2))}
              title="Zoom In"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.35, prev / 1.2))}
              title="Zoom Out"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              title="Reset View"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full block"
      />

      {/* Bottom Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
        <span className="text-slate-400 font-medium">Legend:</span>
        {Object.entries(TYPE_COLORS).slice(0, 5).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-slate-300 capitalize">{type.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      {/* Node Details Inspection Drawer */}
      {selectedNode && (
        <div className="absolute top-14 right-3 w-80 max-h-[80%] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-indigo-500/40 rounded-xl p-4 shadow-2xl z-20 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  backgroundColor: `${TYPE_COLORS[selectedNode.type] || '#818cf8'}20`,
                  color: TYPE_COLORS[selectedNode.type] || '#818cf8',
                  border: `1px solid ${TYPE_COLORS[selectedNode.type] || '#818cf8'}50`
                }}
              >
                {selectedNode.type}
              </span>
              <h4 className="text-base font-bold text-white mt-1.5">{selectedNode.label}</h4>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs text-slate-300 space-y-2">
            <p className="leading-relaxed">
              {selectedNode.description || `Key entity identified in project research corpus.`}
            </p>
          </div>

          {/* Connected Edges */}
          <div className="pt-2 border-t border-slate-800">
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Connected Entities ({connectedNeighbors.length})
            </h5>
            {connectedNeighbors.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No direct connections recorded.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {connectedNeighbors.map((conn, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedNode(conn.node)}
                    className="p-2 bg-slate-800/60 hover:bg-slate-800 rounded-lg cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-slate-200 font-medium block">{conn.node.label}</span>
                      <span className="text-[10px] text-indigo-400 font-mono">
                        {conn.direction === 'outgoing' ? '→' : '←'} {conn.relation}
                      </span>
                    </div>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: TYPE_COLORS[conn.node.type] || '#818cf8' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
