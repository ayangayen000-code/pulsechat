import React, { useState } from 'react';
import { X, Lock, AtSign, Eye, EyeOff, Loader2, Server } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getServerUrl } from '../../services/api';
import ServerSettingsModal from '../common/ServerSettingsModal';

export default function LoginModal({ onClose, onSwitchToRegister }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [currentServer, setCurrentServer] = useState(getServerUrl());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(identifier.trim(), password);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (handle) => {
    setIdentifier(handle);
    setPassword('password123');
    setError('');
  };

  const isConnectionError = error && (
    error.toLowerCase().includes('cannot reach server') ||
    error.toLowerCase().includes('failed to fetch') ||
    error.toLowerCase().includes('network')
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-zinc-100 animate-slide-up">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
            <p className="text-sm text-zinc-400 mt-1">Sign in with your User ID or Username</p>
          </div>

          {error && (
            <div className="p-3.5 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium space-y-2">
              <p>{error}</p>
              {isConnectionError && (
                <button
                  type="button"
                  onClick={() => setShowServerSettings(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold text-xs transition-colors"
                >
                  <Server className="w-3.5 h-3.5" />
                  Configure Server Connection →
                </button>
              )}
            </div>
          )}

          {/* Quick Demo Switcher */}
          <div className="mb-5 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 flex items-center justify-between">
              <span>Quick Test Logins</span>
              <span className="text-zinc-600 font-normal">Pass: password123</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setDemoAccount('@ayan_4821')}
                className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors truncate"
              >
                Ayan
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('@sophia_chen')}
                className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors truncate"
              >
                Sophia
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('@alex_rivera')}
                className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors truncate"
              >
                Alex
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                User ID or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <AtSign className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="@your_id or Username"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand focus:ring-1 focus:ring-brand text-sm text-white placeholder-zinc-600 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand focus:ring-1 focus:ring-brand text-sm text-white placeholder-zinc-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-12 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-glow shadow-brand/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          {/* Server Connection Bar */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5 truncate max-w-[240px]">
              <Server className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">Server: <span className="font-mono text-zinc-300">{currentServer || 'Auto / Default'}</span></span>
            </div>
            <button
              type="button"
              onClick={() => setShowServerSettings(true)}
              className="text-brand hover:underline font-semibold shrink-0"
            >
              Configure
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-zinc-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-brand font-semibold hover:underline"
            >
              Create one now
            </button>
          </div>
        </div>
      </div>

      {showServerSettings && (
        <ServerSettingsModal
          onClose={() => setShowServerSettings(false)}
          onSaved={(newUrl) => {
            setCurrentServer(newUrl);
            setError('');
          }}
        />
      )}
    </>
  );
}
