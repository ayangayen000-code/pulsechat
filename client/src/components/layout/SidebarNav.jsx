import React from 'react';
import {
  MessageSquare,
  Users,
  Bell,
  User,
  Settings,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';

export default function SidebarNav({ currentTab, onSelectTab }) {
  const { user, pendingRequestsCount, unreadNotificationsCount, logout } = useAuth();
  const { chats } = useChat();
  const { theme, setTheme } = useTheme();

  // Total unread messages count
  const totalUnreadMessages = chats.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    {
      id: 'chats',
      label: 'Chats',
      icon: MessageSquare,
      badge: totalUnreadMessages
    },
    {
      id: 'friends',
      label: 'Friends',
      icon: Users,
      badge: pendingRequestsCount
    },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: Bell,
      badge: unreadNotificationsCount
    },
    {
      id: 'stickers',
      label: 'Stickers',
      icon: Sparkles
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: Star
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <aside className="w-[72px] h-full bg-zinc-950 border-r border-zinc-800/80 flex flex-col items-center justify-between py-4 select-none z-20 flex-shrink-0">
      {/* Top Logo */}
      <div className="flex flex-col items-center gap-6">
        <div
          onClick={() => onSelectTab('chats')}
          className="w-11 h-11 rounded-2xl bg-brand flex items-center justify-center shadow-glow shadow-brand/30 cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <MessageSquare className="w-5 h-5 text-white" />
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-subtle border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand' : ''}`} />

                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-zinc-950 animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Mini Avatar / Profile Trigger */}
        <button
          onClick={() => onSelectTab('profile')}
          title={`Signed in as ${user?.username}`}
          className="relative group p-0.5 rounded-full hover:ring-2 hover:ring-brand transition-all"
        >
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user?.username}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
            }}
            className="w-9 h-9 rounded-full object-cover border border-zinc-700"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
        </button>
      </div>
    </aside>
  );
}
