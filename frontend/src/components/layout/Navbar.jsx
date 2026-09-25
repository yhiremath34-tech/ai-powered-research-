import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  UploadCloud,
  FileText,
  GitGraph,
  MessageSquare,
  Shield,
  Sun,
  Moon,
  LogOut,
  User,
  PlusCircle,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Navbar() {
  const { user, logout, demoLogin, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: Compass },
    { label: 'Projects', path: '/projects', icon: FileText },
    { label: 'Import', path: '/upload', icon: UploadCloud },
    { label: 'AI Search', path: '/search', icon: Search },
    { label: 'Graph', path: '/knowledge-graph', icon: GitGraph },
    { label: 'Compare', path: '/compare', icon: Sparkles },
    { label: 'Copilot', path: '/chat', icon: MessageSquare },
    { label: 'Notes', path: '/notes', icon: FileText },
    { label: 'Reports', path: '/reports', icon: FileText }
  ];

  if (user?.role === 'admin') {
    navLinks.push({ label: 'Admin', path: '/admin', icon: Shield });
  }

  const handleDemoSwitch = async (role) => {
    setUserMenuOpen(false);
    await demoLogin(role);
    navigate('/dashboard');
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                  KnowSphere<span className="text-cyan-400 font-normal">.AI</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v1.0 PROD
                </span>
              </div>
            </div>
          </Link>

          {/* Center Links (Visible on desktop) */}
          {isAuthenticated && (
            <div className="hidden xl:flex items-center gap-1 ml-4 pl-4 border-l border-slate-800">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Quick Project CTA */}
              <Link
                to="/projects?create=true"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-500/20 transition transform hover:-translate-y-0.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Project
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
                >
                  <img
                    src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                    alt="User Avatar"
                    className="w-7 h-7 rounded-full object-cover border border-indigo-500/50"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-medium text-slate-200 leading-tight">{user?.full_name?.split(' ')[0] || 'Researcher'}</p>
                    <span className="text-[10px] text-slate-400 capitalize">{user?.role}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-slate-800 mb-1">
                      <p className="font-semibold text-white">{user?.full_name}</p>
                      <p className="text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px]">
                        {user?.primary_domain} Domain
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      User Settings & API
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-950/40 rounded-lg transition"
                      >
                        <Shield className="w-4 h-4 text-indigo-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="pt-1 mt-1 border-t border-slate-800">
                      <p className="text-[10px] uppercase font-semibold text-slate-500 px-3 py-1">Quick Switch Persona</p>
                      <button
                        onClick={() => handleDemoSwitch('researcher')}
                        className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-800 rounded-lg transition flex items-center justify-between"
                      >
                        <span>Dr. Elena Rostova</span>
                        <span className="text-[10px] text-cyan-400">Researcher</span>
                      </button>
                      <button
                        onClick={() => handleDemoSwitch('admin')}
                        className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-800 rounded-lg transition flex items-center justify-between"
                      >
                        <span>Marcus Vance</span>
                        <span className="text-[10px] text-amber-400">Admin</span>
                      </button>
                    </div>

                    <div className="pt-1 mt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
