import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ToastProvider } from './components/layout/Toast';
import WelcomeScreen from './components/auth/WelcomeScreen';
import AppShell from './components/layout/AppShell';
import { MessageSquare, Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center select-none text-zinc-100">
        <div className="w-14 h-14 rounded-3xl bg-brand flex items-center justify-center shadow-glow shadow-brand/30 animate-pulse mb-4">
          <MessageSquare className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">Pulse<span className="text-brand">Chat</span></h2>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
          <span>Connecting to your secure network...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <WelcomeScreen />;
  }

  return (
    <ChatProvider>
      <AppShell />
    </ChatProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
