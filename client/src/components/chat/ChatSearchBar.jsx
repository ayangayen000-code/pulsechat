import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { jumpToMessage } from './PinnedMessagesBanner';

export default function ChatSearchBar({ isOpen, onClose }) {
  const { messages } = useChat();
  const [query, setQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return messages.filter(
      (m) =>
        m.is_deleted !== 1 &&
        m.type === 'text' &&
        m.content?.toLowerCase().includes(q)
    );
  }, [messages, query]);

  // When query changes, reset index
  useEffect(() => {
    setCurrentIndex(0);
    if (matches.length > 0) {
      jumpToMessage(matches[0].id);
    }
  }, [matches]);

  const handleNext = () => {
    if (matches.length === 0) return;
    const nextIdx = (currentIndex + 1) % matches.length;
    setCurrentIndex(nextIdx);
    jumpToMessage(matches[nextIdx].id);
  };

  const handlePrev = () => {
    if (matches.length === 0) return;
    const prevIdx = (currentIndex - 1 + matches.length) % matches.length;
    setCurrentIndex(prevIdx);
    jumpToMessage(matches[prevIdx].id);
  };

  if (!isOpen) return null;

  return (
    <div className="sticky top-0 z-30 px-3 sm:px-4 py-2 bg-zinc-950/95 border-b border-zinc-800/80 backdrop-blur-md flex items-center justify-between gap-2 select-none animate-slide-up">
      <div className="flex items-center gap-2 flex-1 px-3 py-1.5 rounded-2xl bg-zinc-900 border border-zinc-800">
        <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in conversation..."
          className="bg-transparent border-none outline-none text-xs w-full text-zinc-200 placeholder-zinc-500"
        />
        {query && (
          <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">
            {matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0 results'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={matches.length === 0}
          onClick={handlePrev}
          className="p-1.5 rounded-xl hover:bg-zinc-800 disabled:opacity-40 text-zinc-400 hover:text-white transition-colors"
          title="Previous match"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={matches.length === 0}
          onClick={handleNext}
          className="p-1.5 rounded-xl hover:bg-zinc-800 disabled:opacity-40 text-zinc-400 hover:text-white transition-colors"
          title="Next match"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setQuery('');
            onClose();
          }}
          className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors ml-1"
          title="Close search"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
