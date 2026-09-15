import React from 'react';
import { MessageSquare, Users, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

export default function MobileBottomNav({ currentTab, onSelectTab }) {
  const { pendingRequestsCount, unreadNotificationsCount } = useAuth();
  const { chats } = useChat();

  const totalUnreadMessages = chats.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  const items = [
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
      id: 'profile',
      label: 'Profile',
      icon: User
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 flex items-center justify-around px-2 z-40 safe-bottom select-none">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
              isActive ? 'text-brand' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-zinc-950 animate-pulse">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className={`text-[11px] mt-1 font-medium ${isActive ? 'text-white' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
