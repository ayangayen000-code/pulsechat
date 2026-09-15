import React from 'react';
import {
  ChevronLeft,
  Info,
  Search,
  Palette,
  Clock,
  X,
  CornerUpRight,
  Star,
  Trash2,
  Copy,
  CheckSquare
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../layout/Toast';

export default function ChatHeader({
  onBack,
  onToggleInfo,
  isInfoOpen,
  onOpenTheme,
  onOpenDisappearing,
  onToggleSearch,
  onForwardSelected,
  onDeleteSelected
}) {
  const {
    activeChat,
    onlineUserIds,
    isSelectionMode,
    selectedMessageIds,
    clearSelection,
    selectAllMessages,
    batchSaveMessages,
    messages
  } = useChat();
  const { showToast } = useToast();

  if (!activeChat) return null;

  const isGroup = activeChat.type === 'group';
  const isOnline = !isGroup && activeChat.other_user && onlineUserIds.has(activeChat.other_user.id);
  const isDisappearing = activeChat.disappearing_enabled === 1 || activeChat.disappearing_enabled === true;

  // Handle batch copy
  const handleCopySelected = () => {
    const selectedList = messages.filter((m) => selectedMessageIds.has(m.id) && m.content);
    if (selectedList.length === 0) return;
    const text = selectedList.map((m) => `${m.sender_name}: ${m.content}`).join('\n');
    navigator.clipboard.writeText(text);
    showToast(`Copied ${selectedList.length} messages to clipboard`);
  };

  // Handle batch star/save
  const handleSaveSelected = async () => {
    try {
      await batchSaveMessages(Array.from(selectedMessageIds));
      showToast(`Saved ${selectedMessageIds.size} messages`);
    } catch (err) {
      showToast('Failed to save selected messages', 'error');
    }
  };

  // 1. SELECTION MODE HEADER
  if (isSelectionMode) {
    return (
      <header className="h-16 border-b border-brand/30 bg-zinc-950/98 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 select-none animate-slide-up">
        {/* Left: Close selection + Count */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clearSelection}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Cancel selection"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-white">
            {selectedMessageIds.size} selected
          </span>
        </div>

        {/* Right: Batch Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Select All */}
          <button
            type="button"
            onClick={selectAllMessages}
            className="px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            title="Select all messages"
          >
            Select All
          </button>

          {/* Copy Selected */}
          <button
            type="button"
            onClick={handleCopySelected}
            className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Copy selected text"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Save Selected */}
          <button
            type="button"
            onClick={handleSaveSelected}
            className="p-2.5 rounded-xl hover:bg-zinc-800 text-amber-400 hover:text-amber-300 transition-colors"
            title="Save selected messages"
          >
            <Star className="w-4 h-4" />
          </button>

          {/* Forward Selected */}
          <button
            type="button"
            onClick={onForwardSelected}
            className="p-2.5 rounded-xl hover:bg-zinc-800 text-emerald-400 hover:text-emerald-300 transition-colors"
            title="Forward selected"
          >
            <CornerUpRight className="w-4 h-4" />
          </button>

          {/* Delete Selected */}
          <button
            type="button"
            onClick={onDeleteSelected}
            className="p-2.5 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-colors"
            title="Delete selected"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>
    );
  }

  // 2. STANDARD CHAT HEADER
  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-10 select-none">
      {/* Left: Back Button + Avatar + Name + Status */}
      <div className="flex items-center gap-2.5 truncate">
        {/* Mobile Back Button */}
        <button
          onClick={onBack}
          className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex-shrink-0 -ml-1"
          title="Back to conversations"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Avatar */}
        <div className="relative flex-shrink-0 cursor-pointer" onClick={onToggleInfo}>
          <img
            src={
              activeChat.avatar ||
              (isGroup
                ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80')
            }
            alt={activeChat.title}
            onError={(e) => {
              e.currentTarget.src = isGroup
                ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
            }}
            className="w-10 h-10 rounded-full object-cover border border-zinc-800"
          />
          {!isGroup && isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950 ring-1 ring-emerald-500/50" />
          )}
        </div>

        {/* Title & Handle / Member count */}
        <div className="truncate cursor-pointer" onClick={onToggleInfo}>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-zinc-100 truncate">{activeChat.title}</h3>
            {isGroup && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 uppercase">
                Group
              </span>
            )}
            {/* Clickable Disappearing Indicator Badge */}
            {isDisappearing && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenDisappearing) onOpenDisappearing();
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 text-[10px] font-semibold transition-all shadow-xs"
                title={`Disappearing messages: ${activeChat.disappearing_unit || 'On'}. Click to adjust.`}
              >
                <Clock className="w-3 h-3" />
                <span>{activeChat.disappearing_unit || 'On'}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
            {isGroup ? (
              <span>{activeChat.member_count || 1} members</span>
            ) : (
              <>
                <span className="font-mono text-[11px] text-zinc-500">{activeChat.other_user?.user_id}</span>
                <span>•</span>
                <span className={isOnline ? 'text-emerald-400 font-medium' : 'text-zinc-500'}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Search in Conversation */}
        <button
          onClick={onToggleSearch}
          className="p-2.5 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title="Search in conversation"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Disappearing Messages Quick Button */}
        <button
          onClick={onOpenDisappearing}
          className={`p-2.5 rounded-2xl transition-colors ${
            isDisappearing ? 'text-amber-400 hover:bg-amber-500/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          title={isDisappearing ? `Disappearing messages: ${activeChat.disappearing_unit || 'On'}` : 'Disappearing Messages'}
        >
          <Clock className="w-5 h-5" />
        </button>

        {/* Customize Theme Button */}
        <button
          onClick={onOpenTheme}
          className="p-2.5 rounded-2xl text-zinc-400 hover:text-brand hover:bg-zinc-900 transition-colors"
          title="Customize Chat Theme"
        >
          <Palette className="w-5 h-5" />
        </button>

        {/* Toggle Info Panel */}
        <button
          onClick={onToggleInfo}
          className={`p-2.5 rounded-2xl transition-all ${
            isInfoOpen ? 'bg-zinc-800 text-brand' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          title="Conversation Information"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
