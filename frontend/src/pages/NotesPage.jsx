import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Sparkles,
  Trash2,
  Edit2,
  Save,
  Tag,
  Pin,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import ReactMarkdown from 'react-markdown';

export default function NotesPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAssisting, setAiAssisting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const pRes = await api.projects.list();
        const pList = pRes.projects || [];
        setProjects(pList);

        if (pList.length > 0) {
          const firstId = pList[0].id;
          setSelectedProjectId(firstId);
          loadNotes(firstId);
        }
      } catch (err) {
        console.warn('Error loading notes projects:', err);
      }
    }
    loadData();
  }, []);

  const loadNotes = async (projId) => {
    try {
      setLoading(true);
      const res = await api.notes.list(projId);
      const noteList = res.notes || [];
      setNotes(noteList);
      if (noteList.length > 0) {
        setSelectedNote(noteList[0]);
        setTitle(noteList[0].title);
        setContent(noteList[0].content);
        setIsEditing(false);
      } else {
        setSelectedNote(null);
        setTitle('');
        setContent('');
      }
    } catch (err) {
      console.warn('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  };

  const handleStartNewNote = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setIsEditing(true);
  };

  const handleSaveNote = async () => {
    if (!title.trim() || !content.trim() || !selectedProjectId) return;
    try {
      if (selectedNote) {
        const res = await api.notes.update(selectedNote.id, { title, content });
        setNotes(prev => prev.map(n => n.id === res.note.id ? res.note : n));
        setSelectedNote(res.note);
      } else {
        const res = await api.notes.create({
          project_id: selectedProjectId,
          title,
          content
        });
        setNotes(prev => [res.note, ...prev]);
        setSelectedNote(res.note);
      }
      setIsEditing(false);
    } catch (err) {
      alert('Failed to save note');
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this research note?')) return;
    try {
      await api.notes.delete(id);
      const remaining = notes.filter(n => n.id !== id);
      setNotes(remaining);
      if (remaining.length > 0) {
        handleSelectNote(remaining[0]);
      } else {
        setSelectedNote(null);
        setTitle('');
        setContent('');
      }
    } catch (err) {
      alert('Failed to delete note');
    }
  };

  const handleAiAssist = async (action) => {
    if (!content.trim()) return;
    setAiAssisting(true);
    try {
      const res = await api.notes.aiAssist({
        prompt: title,
        current_content: content,
        action
      });
      setContent(res.enhanced_content);
      if (selectedNote) {
        const updated = await api.notes.update(selectedNote.id, { content: res.enhanced_content });
        setNotes(prev => prev.map(n => n.id === updated.note.id ? updated.note : n));
      }
    } catch (err) {
      alert('AI note assistance failed');
    } finally {
      setAiAssisting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Research Notes & Synthesis Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Capture personal observations and deepen notes with AI assistance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => { setSelectedProjectId(e.target.value); loadNotes(e.target.value); }}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.domain})</option>
              ))}
            </select>
          )}

          <button
            onClick={handleStartNewNote}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>
      </div>

      {/* Split Pane: Notes List + Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List Column */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Notes ({notes.length})
          </h3>

          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className={`p-3.5 rounded-xl border cursor-pointer transition text-xs relative group ${
                  selectedNote?.id === note.id
                    ? 'bg-slate-900 border-indigo-500 shadow-md'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-white truncate max-w-[85%]">{note.title}</h4>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                    className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-400 text-[11px] line-clamp-2 mt-1">
                  {note.content.replace(/#|\*|_/g, '')}
                </p>
                <span className="text-[10px] text-slate-500 mt-2 block">
                  {new Date(note.updated_at || note.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Note Editor / Preview Column */}
        <div className="lg:col-span-2">
          {selectedNote || isEditing ? (
            <div className="p-6 rounded-2xl glass-panel space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="Note Title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-base font-bold text-white bg-transparent border-none focus:outline-none w-full mr-4"
                  />
                ) : (
                  <h2 className="text-lg font-bold text-white">{selectedNote?.title}</h2>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAiAssist('expand')}
                    disabled={aiAssisting}
                    className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Expand AI
                  </button>
                  <button
                    onClick={() => handleAiAssist('summarize')}
                    disabled={aiAssisting}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Summarize
                  </button>
                  {isEditing ? (
                    <button
                      onClick={handleSaveNote}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <textarea
                  rows={16}
                  placeholder="Write Markdown notes here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 rounded-xl glass-input focus:outline-none font-mono text-xs leading-relaxed"
                />
              ) : (
                <div className="markdown-content text-xs text-slate-200 leading-relaxed min-h-[350px]">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )}
            </div>
          ) : (
            <div className="py-24 text-center rounded-2xl glass-panel space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-base text-white font-bold">No Note Selected</p>
              <button
                onClick={handleStartNewNote}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
              >
                Create Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
