import React, { useState } from 'react';
import { MessageSquare, Shield, Users, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { useAuth } from '../../context/AuthContext';

export default function WelcomeScreen() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { login } = useAuth();
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  const handleQuickLogin = async (handle) => {
    try {
      setQuickLoginLoading(true);
      await login(handle, 'password123');
    } catch (err) {
      console.error('Quick login error:', err);
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
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center shadow-glow shadow-brand/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Pulse<span className="text-brand">Chat</span></span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLogin(true)}
            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Log In
          </button>
          <button
            onClick={() => setShowRegister(true)}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-brand hover:bg-brand-hover text-white transition-all shadow-subtle hover:shadow-glow"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto z-10 py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-medium text-zinc-400 mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          <span>Zero Phone Numbers • Total Privacy • High Fidelity</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-2xl leading-[1.15] mb-6">
          Personal messaging, <br />
          <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-indigo-300 bg-clip-text text-transparent">
            built for real circles.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-xl mb-10 leading-relaxed">
          Connect with friends using unique User IDs. Exchange instant voice notes, full-resolution media, custom stickers, and rich group chats across every screen.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mb-12">
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
              className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-all text-left group"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Ayan"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="truncate">
                <div className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">Ayan Gayen</div>
                <div className="text-[10px] text-zinc-500 font-mono">@ayan_4821</div>
              </div>
            </button>

            <button
              disabled={quickLoginLoading}
              onClick={() => handleQuickLogin('@sarah_sky')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-all text-left group"
            >
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                alt="Sarah"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="truncate">
                <div className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">Sarah Jenkins</div>
                <div className="text-[10px] text-zinc-500 font-mono">@sarah_sky</div>
              </div>
            </button>

            <button
              disabled={quickLoginLoading}
              onClick={() => handleQuickLogin('@marcus_dev')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-all text-left group"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Marcus"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="truncate">
                <div className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">Marcus Vance</div>
                <div className="text-[10px] text-zinc-500 font-mono">@marcus_dev</div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Feature Highlights */}
      <footer className="w-full border-t border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm py-6">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-brand">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-200">No Phone Number Required</h4>
              <p className="text-xs text-zinc-400 mt-1">Register with your preferred handle. Add friends securely using unique User IDs.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-brand">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-200">Modern Groups & Circles</h4>
              <p className="text-xs text-zinc-400 mt-1">Organize squad chats with multiple admins, pinned notes, and `@mention` tagging.</p>
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
    </div>
  );
}
