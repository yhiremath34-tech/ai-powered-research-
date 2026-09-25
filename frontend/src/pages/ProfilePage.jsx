import React from 'react';
import {
  User,
  Mail,
  Building,
  Compass,
  Cpu,
  Database,
  HardDrive,
  Shield,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-400" />
          Researcher Settings & Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your research domain preferences, storage quotas, and security credentials.
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/50 shadow-lg"
          />
          <div>
            <h2 className="text-lg font-bold text-white">{user?.full_name || 'Dr. Elena Rostova'}</h2>
            <p className="text-xs text-slate-400">{user?.email || 'researcher@knowsphere.ai'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {user?.role || 'Lead Researcher'}
              </span>
              <span className="text-[10px] text-slate-500">• {user?.institution || 'Institute for Advanced Computational Sciences'}</span>
            </div>
          </div>
        </div>

        {/* System & Architecture Status */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              AI Inference Subsystem
            </span>
            <p className="text-white font-mono text-[11px]">Google Gemini API (@google/genai)</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Operational & Validated
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-400" />
              Database & Security Policy
            </span>
            <p className="text-white font-mono text-[11px]">Supabase PostgreSQL (RLS Enforced)</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Multi-Tenant Isolation
            </span>
          </div>
        </div>

        {/* Storage & Usage Meter */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              Corpus Storage Quota
            </span>
            <span className="font-mono text-slate-400">18.4 MB / 500 MB (3.6%)</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: '3.6%' }} />
          </div>
        </div>

        {/* Sign Out CTA */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of KnowSphere
          </button>
        </div>
      </div>
    </div>
  );
}
