import React, { useState, useEffect } from 'react';
import { MessageSquare, Shield, Users, Sparkles, ArrowRight, UserCheck, Server, AlertCircle } from 'lucide-react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ServerSettingsModal from '../common/ServerSettingsModal';
import { useAuth } from '../../context/AuthContext';
import { getServerUrl, checkServerHealth } from '../../services/api';

export default function WelcomeScreen() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [serverStatus, setServerStatus] = useState(null); // { ok: bool, latency: number }
  const [quickLoginError, setQuickLoginError] = useState('');
  const { login } = useAuth();
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  const checkStatus = async () => {
    const res = await checkServerHealth();
    setServerStatus(res);
  };

  useEffect(() => {
    checkStatus();
    const handleUrlChange = () => checkStatus();
    window.addEventListener('server-url:changed', handleUrlChange);
    return () => window.removeEventListener('server-url:changed', handleUrlChange);
  }, []);

  const handleQuickLogin = async (handle) => {
    try {
      setQuickLoginLoading(true);
      setQuickLoginError('');
      await login(handle, 'password123');
    } catch (err) {
      console.error('Quick login error:', err);
      setQuickLoginError(err.message || 'Quick login failed. Server may be unreachable.');
    } finally {
      setQuickLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col justify-between relative overflow-hidden text-zinc-100 select-none">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center shadow-glow shadow-brand/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Pulse<span className="text-brand">Chat</span></span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Server Connection Pill */}
          <button
            onClick={() => setShowServerSettings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 font-medium transition-all shadow-sm"
            title="Configure Server Connection"
          >
            <Server className="w-3.5 h-3.5 text-brand" />
            <span className="hidden sm:inline">Server</span>
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus === null
                  ? 'bg-amber-400 animate-pulse'
                  : serverStatus?.ok
                  ? 'bg-emerald-400'
                  : 'bg-rose-400'
              }`}
            />
          </button>

          <button
            onClick={() => setShowLogin(true)}
            className="px-3 sm:px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Log In
          </button>
          <button
            onClick={() => setShowRegister(true)}
            className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold rounded-xl bg-brand hover:bg-brand-hover text-white transition-all shadow-subtle hover:shadow-glow"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-4xl mx-auto z-10 py-8 sm:py-12">
        {/* Offline Warning Banner */}
        {serverStatus && !serverStatus.ok && (
          <div
            onClick={() => setShowServerSettings(true)}
            className="cursor-pointer mb-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-all max-w-md text-left"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Server unreachable.</span> Tap here to set your server URL (<span className="font-mono text-white">{getServerUrl() || 'default'}</span>).
            </div>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-medium text-zinc-400 mb-6 sm:mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          <span>Zero Phone Numbers • Total Privacy • High Fidelity</span>
        </div>

        <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight text-white max-w-2xl leading-[1.15] mb-6">
          Personal messaging, <br />
          <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-indigo-300 bg-clip-text text-transparent">
            built for real circles.
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-zinc-400 max-w-xl mb-8 sm:mb-10 leading-relaxed px-2">
          Connect with friends using unique User IDs. Exchange instant voice notes, full-resolution media, custom stickers, and rich group chats across every screen.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mb-8 sm:mb-12">
          <button
            onClick={() => setShowRegister(true)}
            className="w-full sm:w-auto flex-1 h-12 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-glow shadow-brand/20 active:scale-[0.98]"
          >
            Create Your Account
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowLogin(true)}
            className="w-full sm:w-auto flex-1 h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-sm flex items-center justify-center transition-all active:scale-[0.98]"
          >
            Log In
          </button>
        </div>

        {/* Quick Login Error Display */}
        {quickLoginError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs max-w-md flex items-center justify-between gap-2">
            <span>{quickLoginError}</span>
            <button
              onClick={() => setShowServerSettings(true)}
              className="text-white underline font-semibold shrink-0"
            >
              Check Server
            </button>
          </div>
        )}

        {/* Quick Demo Accounts Switcher */}
        <div className="w-full max-w-lg p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
            <UserCheck className="w-3.5 h-3.5 text-brand" />
            <span>Instant Demo Accounts (One-Click Sign In)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              disabled={quickLoginLoading}
              onClick={() => handleQuickLogin('@ayan_4821')}
              className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-left transition-all hover:border-brand/40 group active:scale-[0.98] disabled:opacity-50"
            >
              <div className="font-semibold text-sm text-zinc-200 group-hover:text-brand flex items-center justify-between">
                <span>Ayan</span>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Dev</span>
              </div>
              <div className="text-xs text-zinc-500 font-mono mt-0.5">@ayan_4821</div>
            </button>

            <button
              disabled={quickLoginLoading}
              onClick={() => handleQuickLogin('@sophia_chen')}
              className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-left transition-all hover:border-brand/40 group active:scale-[0.98] disabled:opacity-50"
            >
              <div className="font-semibold text-sm text-zinc-200 group-hover:text-brand flex items-center justify-between">
                <span>Sophia</span>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Design</span>
              </div>
              <div className="text-xs text-zinc-500 font-mono mt-0.5">@sophia_chen</div>
            </button>

            <button
              disabled={quickLoginLoading}
              onClick={() => handleQuickLogin('@alex_rivera')}
              className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-left transition-all hover:border-brand/40 group active:scale-[0.98] disabled:opacity-50"
            >
              <div className="font-semibold text-sm text-zinc-200 group-hover:text-brand flex items-center justify-between">
                <span>Alex</span>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Friend</span>
              </div>
              <div className="text-xs text-zinc-500 font-mono mt-0.5">@alex_rivera</div>
            </button>
          </div>
        </div>
      </main>

      {/* Feature Highlights Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 border-t border-zinc-900 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-brand">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-200">Handle-Based Privacy</h4>
              <p className="text-xs text-zinc-400 mt-1">Chat securely without ever revealing your personal phone number or private details.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-brand">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-200">Circles & Groups</h4>
              <p className="text-xs text-zinc-400 mt-1">Organize chats by circles with custom themes, pinned messages, and read receipts.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-brand">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-200">Rich Media & Waveforms</h4>
              <p className="text-xs text-zinc-400 mt-1">Real-time voice recordings with interactive waveforms, stickers, videos, and files.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}

      {showServerSettings && (
        <ServerSettingsModal
          onClose={() => setShowServerSettings(false)}
          onSaved={() => checkStatus()}
        />
      )}
    </div>
  );
}
