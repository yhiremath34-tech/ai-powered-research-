import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  ShieldCheck,
  Copy,
  RefreshCw,
  Compass,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const pRes = await api.projects.list();
        const pList = pRes.projects || [];
        setProjects(pList);

        if (pList.length > 0) {
          const firstId = pList[0].id;
          setSelectedProjectId(firstId);
          loadProjectChat(firstId, pList[0]);
        }
      } catch (err) {
        console.warn('Error loading chat projects:', err);
      }
    }
    loadData();
  }, []);

  const loadProjectChat = async (projId, projectObj) => {
    try {
      const dRes = await api.documents.listByProject(projId);
      const docs = dRes.documents || [];
      setDocuments(docs);

      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          message: `Welcome! I am your Research Copilot for **${projectObj.title}** (${projectObj.domain}). I have indexed all **${docs.length}** ingested research publications. Ask me anything and I will provide grounded answers with direct citations.`,
          citations: []
        }
      ]);
    } catch (err) {
      console.warn('Error loading project documents for chat:', err);
    }
  };

  const handleProjectChange = (projId) => {
    setSelectedProjectId(projId);
    const p = projects.find(x => x.id === projId);
    if (p) loadProjectChat(projId, p);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading || !selectedProjectId) return;

    const userText = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', message: userText }]);
    setLoading(true);

    try {
      const res = await api.ai.chat({
        project_id: selectedProjectId,
        message: userText
      });

      setMessages(prev => [
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
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          message: `Error generating research answer: ${err.response?.data?.error || err.message}`,
          citations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-4 pb-16">
      {/* Header and Project Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">AI Research Copilot</h1>
            <p className="text-[11px] text-slate-400">Strictly grounded multi-source answering</p>
          </div>
        </div>

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
      </div>

      {/* Main Chat Container */}
      <div className="rounded-2xl glass-panel border border-slate-800 flex flex-col h-[650px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
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
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-3 relative group">
                    <button
                      onClick={() => handleCopy(msg.id, msg.message)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition"
                      title="Copy Answer"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <div className="markdown-content">
                      <ReactMarkdown>{msg.message}</ReactMarkdown>
                    </div>

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

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 text-xs font-bold">
                AI
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                Synthesizing grounded response from indexed papers...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask a technical, empirical, or methodology query..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl glass-input focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
