import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Sparkles,
  Download,
  Check,
  Flame,
  Plus,
  Compass,
  Layers,
  ChevronRight,
  Loader2,
  PackageCheck,
  ArrowLeft,
  Grid
} from 'lucide-react';
import { api, resolveMediaUrl } from '../../services/api';
import StickerPackDetailModal from './StickerPackDetailModal';
import CreateStickerPackModal from './CreateStickerPackModal';
import MyStickersManagerModal from './MyStickersManagerModal';

export const CATEGORIES = [
  'All',
  '☕ Cute & Cozy',
  '🎌 Anime',
  '🐱 Animals',
  '😂 Funny',
  '💕 Love & Romance',
  '😎 Meme / Reactions',
  '🎮 Gaming',
  '🌈 Cute Characters',
  '🍔 Food',
  '✨ Fantasy',
  '🌙 Aesthetic',
  '🎃 Seasonal',
  '🎉 Celebration',
  '😭 Emotional',
  '🧸 Kawaii',
  '🤪 Crazy / Fun'
];

export const STORE_EMOTIONS = [
  { key: 'happy', label: 'Happy', emoji: '😊' },
  { key: 'smile', label: 'Smile', emoji: '😄' },
  { key: 'laugh', label: 'Laugh', emoji: '🤣' },
  { key: 'sad', label: 'Sad', emoji: '😢' },
  { key: 'cry', label: 'Cry', emoji: '😭' },
  { key: 'angry', label: 'Angry', emoji: '😡' },
  { key: 'bored', label: 'Bored', emoji: '🥱' },
  { key: 'love', label: 'Love', emoji: '😍' },
  { key: 'shock', label: 'Shock', emoji: '😱' },
  { key: 'confused', label: 'Confused', emoji: '😕' },
  { key: 'sleepy', label: 'Sleepy', emoji: '😴' },
  { key: 'excited', label: 'Excited', emoji: '🤩' },
  { key: 'scared', label: 'Scared', emoji: '😨' },
  { key: 'thank-you', label: 'Thank You', emoji: '🙏' },
  { key: 'sorry', label: 'Sorry', emoji: '🥺' },
  { key: 'yes', label: 'Yes', emoji: '👍' },
  { key: 'no', label: 'No', emoji: '👎' },
  { key: 'good', label: 'Good', emoji: '👌' },
  { key: 'bad', label: 'Bad', emoji: '👎' },
  { key: 'greeting', label: 'Greeting', emoji: '👋' },
  { key: 'celebration', label: 'Celebration', emoji: '🎉' },
  { key: 'goodmorning', label: 'Good Morning', emoji: '☀️' },
  { key: 'goodnight', label: 'Good Night', emoji: '🌙' }
];

export const CATEGORY_THEMES = {
  '☕ Cute & Cozy': {
    title: 'Cute & Cozy',
    emoji: '☕',
    tag: 'Warm & Snug',
    desc: 'Warm cups of coffee, fluffy sloths, and calming pastel aesthetics for relaxing chats.',
    gradient: 'from-amber-600/20 via-orange-500/10 to-yellow-500/5',
    headerBg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accentText: 'text-amber-400',
    hoverBorder: 'hover:border-amber-500/50'
  },
  '🎌 Anime': {
    title: 'Anime & Manga',
    emoji: '🎌',
    tag: 'Shonen & Chibi',
    desc: 'High-octane power screams, chibi blushing, sweat drops, and dramatic menacing aura.',
    gradient: 'from-violet-600/20 via-fuchsia-600/10 to-pink-500/5',
    headerBg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    accentText: 'text-violet-400',
    hoverBorder: 'hover:border-violet-500/50'
  },
  '🐱 Animals': {
    title: 'Animals & Pets',
    emoji: '🐱',
    tag: 'Paws & Purrs',
    desc: 'Curious cats, cheering shiba inus, clumsy pandas, and bouncy corgi bums.',
    gradient: 'from-emerald-600/20 via-teal-600/10 to-green-500/5',
    headerBg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    accentText: 'text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/50'
  },
  '😂 Funny': {
    title: 'Funny & Comedy',
    emoji: '😂',
    tag: 'LOL & Chaos',
    desc: 'Sipping tea frogs, alarm clock smashing bears, and sarcastic eye-rolling ducks.',
    gradient: 'from-yellow-500/20 via-amber-500/10 to-orange-500/5',
    headerBg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    accentText: 'text-yellow-400',
    hoverBorder: 'hover:border-yellow-500/50'
  },
  '💕 Love & Romance': {
    title: 'Love & Romance',
    emoji: '💕',
    tag: 'Sweet & Romantic',
    desc: 'Floating red hearts, romantic love letters, and warm heartfelt kisses.',
    gradient: 'from-rose-600/20 via-pink-600/10 to-red-500/5',
    headerBg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    accentText: 'text-rose-400',
    hoverBorder: 'hover:border-rose-500/50'
  },
  '😎 Meme / Reactions': {
    title: 'Memes & Reactions',
    emoji: '😎',
    tag: 'Internet Culture',
    desc: 'Galaxy mind-blowns, facepalms, suspicious squints, and drama popcorn eating.',
    gradient: 'from-cyan-600/20 via-blue-600/10 to-indigo-500/5',
    headerBg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    accentText: 'text-cyan-400',
    hoverBorder: 'hover:border-cyan-500/50'
  },
  '🎮 Gaming': {
    title: 'Gaming & 8-Bit',
    emoji: '🎮',
    tag: 'Pixel & Arcade',
    desc: 'Retro handhelds, button mash victories, game-over screens, and bouncy slimes.',
    gradient: 'from-purple-600/20 via-indigo-600/10 to-blue-500/5',
    headerBg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    accentText: 'text-purple-400',
    hoverBorder: 'hover:border-purple-500/50'
  },
  '🌈 Cute Characters': {
    title: 'Cute Characters',
    emoji: '🌈',
    tag: 'Pastel & Magic',
    desc: 'Smiling pastel rainbow clouds and cheerful twinkling golden stars.',
    gradient: 'from-pink-500/20 via-purple-500/10 to-sky-500/5',
    headerBg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    accentText: 'text-pink-400',
    hoverBorder: 'hover:border-pink-500/50'
  },
  '🍔 Food': {
    title: 'Food & Delights',
    emoji: '🍔',
    tag: 'Yum & Tasty',
    desc: 'Cheesy melting pizza slices, steaming curly ramen noodles, and glazed sprinkle donuts.',
    gradient: 'from-orange-600/20 via-red-500/10 to-yellow-500/5',
    headerBg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    accentText: 'text-orange-400',
    hoverBorder: 'hover:border-orange-500/50'
  },
  '✨ Fantasy': {
    title: 'Fantasy & Magic',
    emoji: '✨',
    tag: 'Mythical & Fun',
    desc: 'Fire-breathing baby dragons, friendly floating ghosts, and cute little retro robots.',
    gradient: 'from-indigo-600/20 via-purple-600/10 to-pink-500/5',
    headerBg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    accentText: 'text-indigo-400',
    hoverBorder: 'hover:border-indigo-500/50'
  },
  '🌙 Aesthetic': {
    title: 'Aesthetic & Lo-Fi',
    emoji: '🌙',
    tag: 'Vaporwave & Chill',
    desc: 'Crescent sleepy moons, synthwave retro cassettes, and ambient midnight calm.',
    gradient: 'from-slate-700/30 via-indigo-900/20 to-purple-900/10',
    headerBg: 'bg-indigo-900/20',
    border: 'border-indigo-400/30',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
    accentText: 'text-indigo-300',
    hoverBorder: 'hover:border-indigo-400/50'
  },
  '🎃 Seasonal': {
    title: 'Seasonal & Spooky',
    emoji: '🎃',
    tag: 'Autumn & Holidays',
    desc: 'Jack-o-lantern glowing smiles and crunchy golden autumn maple leaves.',
    gradient: 'from-orange-700/25 via-amber-700/15 to-red-800/10',
    headerBg: 'bg-orange-600/10',
    border: 'border-orange-600/30',
    badge: 'bg-orange-600/20 text-orange-300 border-orange-600/30',
    accentText: 'text-orange-400',
    hoverBorder: 'hover:border-orange-600/50'
  },
  '🎉 Celebration': {
    title: 'Celebration & Party',
    emoji: '🎉',
    tag: 'Party & Festive',
    desc: 'Confetti popper blasts, sweet birthday cakes, and festive celebration vibes.',
    gradient: 'from-fuchsia-600/20 via-pink-500/10 to-amber-500/5',
    headerBg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/30',
    badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    accentText: 'text-fuchsia-400',
    hoverBorder: 'hover:border-fuchsia-500/50'
  },
  '😭 Emotional': {
    title: 'Emotional & Drama',
    emoji: '😭',
    tag: 'Feelings & Tears',
    desc: 'Sobbing tissue boxes, pouring melodramatic rain clouds, and peak emotional reactions.',
    gradient: 'from-blue-600/20 via-sky-600/10 to-indigo-600/5',
    headerBg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    accentText: 'text-sky-400',
    hoverBorder: 'hover:border-sky-500/50'
  },
  '🧸 Kawaii': {
    title: 'Kawaii & Plushies',
    emoji: '🧸',
    tag: 'Adorable & Soft',
    desc: 'Blushing teddy bears, button-eyed baby dino plushies, and huggable cute friends.',
    gradient: 'from-rose-500/20 via-pink-400/10 to-amber-400/5',
    headerBg: 'bg-rose-500/10',
    border: 'border-rose-400/30',
    badge: 'bg-rose-400/20 text-rose-300 border-rose-400/30',
    accentText: 'text-rose-300',
    hoverBorder: 'hover:border-rose-400/50'
  },
  '🤪 Crazy / Fun': {
    title: 'Crazy & Chaotic',
    emoji: '🤪',
    tag: 'Wild & Derpy',
    desc: 'Hyped overdrive energy, funny cross-eyed blep derp faces, and chaotic fun.',
    gradient: 'from-lime-500/20 via-emerald-500/10 to-yellow-500/5',
    headerBg: 'bg-lime-500/10',
    border: 'border-lime-500/30',
    badge: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    accentText: 'text-lime-400',
    hoverBorder: 'hover:border-lime-500/50'
  }
};

/**
 * Reusable Card for a Single Sticker Pack with custom category design cues
 */
function PackCard({ pack, onSelect, onToggleAdd, actionLoading, categoryTheme }) {
  const theme = categoryTheme || CATEGORY_THEMES[pack.category] || {
    border: 'border-zinc-800',
    hoverBorder: 'hover:border-zinc-700',
    accentText: 'text-brand',
    badge: 'bg-zinc-800 text-zinc-400 border-zinc-700/60'
  };

  return (
    <div
      onClick={() => onSelect(pack.id)}
      className={`group relative rounded-3xl bg-zinc-900/80 hover:bg-zinc-900 border ${theme.border} ${theme.hoverBorder} p-4 flex flex-col justify-between gap-3.5 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-0.5`}
    >
      {/* Top: Icon + Details + Quick Action */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/90 p-2 border border-zinc-700/60 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
            <img
              src={resolveMediaUrl(pack.icon_url || pack.cover_image)}
              alt={pack.name}
              className="max-w-full max-h-full object-contain filter drop-shadow-sm"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className={`text-sm font-bold text-white truncate group-hover:${theme.accentText} transition-colors`}>
              {pack.name}
            </h3>
            <span className="text-[11px] text-zinc-400 truncate mt-0.5">
              {pack.creator_name || 'Pulse Studio'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${theme.badge}`}>
                {pack.category}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">
                {pack.sticker_count || pack.stickers?.length || 0} stickers
              </span>
            </div>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={(e) => onToggleAdd(e, pack)}
          disabled={actionLoading}
          title={pack.is_installed ? 'Remove from library' : 'Add pack to library'}
          className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 shadow-sm ${
            pack.is_installed
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/40'
              : 'bg-brand/15 text-brand border border-brand/30 hover:bg-brand hover:text-white'
          }`}
        >
          {actionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : pack.is_installed ? (
            <Check className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Description Preview */}
      {pack.description && (
        <p className="text-[11px] text-zinc-400 line-clamp-1 leading-relaxed px-0.5">
          {pack.description}
        </p>
      )}

      {/* Bottom Preview Stickers Strip */}
      <div className="pt-2.5 border-t border-zinc-800/60 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          {pack.stickers && pack.stickers.length > 0 ? (
            pack.stickers.slice(0, 4).map((stk) => (
              <div
                key={stk.id}
                className="w-11 h-11 rounded-xl bg-zinc-950/70 p-1 flex items-center justify-center hover:bg-zinc-800 transition-colors border border-zinc-800/40"
              >
                <img
                  src={resolveMediaUrl(stk.image_url)}
                  alt={stk.name}
                  className="max-w-full max-h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform"
                />
              </div>
            ))
          ) : (
            <span className="text-[11px] text-zinc-500 italic py-1">
              Tap to preview stickers
            </span>
          )}
        </div>

        <div className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-500 group-hover:text-zinc-300">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

export default function StickerStoreModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'featured', 'popular', 'new', 'my'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [packs, setPacks] = useState([]);
  const [featuredPacks, setFeaturedPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sub-modals
  const [selectedPackId, setSelectedPackId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [actionLoadingPackId, setActionLoadingPackId] = useState(null);

  // 21 Emotion / Reaction Faces Filter
  const [activeEmotion, setActiveEmotion] = useState(null);
  const [emotionStickers, setEmotionStickers] = useState([]);
  const [loadingEmotion, setLoadingEmotion] = useState(false);

  const handleSelectEmotion = async (emotionKey) => {
    if (activeEmotion === emotionKey) {
      setActiveEmotion(null);
      setEmotionStickers([]);
      return;
    }
    try {
      setActiveEmotion(emotionKey);
      setLoadingEmotion(true);
      const data = await api.get('/stickers/search', { params: { q: emotionKey } });
      setEmotionStickers(data.stickers || []);
    } catch (err) {
      console.error('Failed to load emotion stickers:', err);
    } finally {
      setLoadingEmotion(false);
    }
  };

  const loadStoreData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== 'all' && activeTab !== 'my') {
        params.tab = activeTab;
      }
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      if (activeTab === 'my') {
        const data = await api.get('/stickers/my');
        setPacks(data.packs || []);
      } else {
        const data = await api.get('/stickers/store', { params });
        setPacks(data.packs || []);
        if (data.featured) {
          setFeaturedPacks(data.featured);
        }
      }
    } catch (err) {
      console.error('Failed to load store:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStoreData();
    }
  }, [isOpen, activeTab, selectedCategory, searchQuery]);

  // Group packs by category for the divided "All Packs" view
  const categorizedSections = useMemo(() => {
    if (activeTab !== 'all' || selectedCategory !== 'All' || searchQuery.trim()) {
      return [];
    }

    return CATEGORIES.filter((c) => c !== 'All')
      .map((catKey) => {
        const theme = CATEGORY_THEMES[catKey] || {
          title: catKey,
          emoji: '✨',
          tag: 'Stickers',
          desc: 'Expressive stickers for chat',
          gradient: 'from-zinc-800/40 to-zinc-900/40',
          border: 'border-zinc-800',
          badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          accentText: 'text-zinc-300',
          hoverBorder: 'hover:border-zinc-700'
        };
        const catPacks = packs.filter((p) => p.category === catKey);
        return {
          category: catKey,
          theme,
          packs: catPacks
        };
      })
      .filter((section) => section.packs.length > 0);
  }, [packs, activeTab, selectedCategory, searchQuery]);

  // Strict client-side category filtering defense: ensure Cute & Cozy only shows Cute & Cozy, Anime only Anime, etc.
  const displayedCategoryPacks = useMemo(() => {
    if (selectedCategory && selectedCategory !== 'All') {
      return packs.filter((p) => p.category === selectedCategory);
    }
    return packs;
  }, [packs, selectedCategory]);

  if (!isOpen) return null;

  const handleToggleAddPack = async (e, pack) => {
    e.stopPropagation();
    try {
      setActionLoadingPackId(pack.id);
      if (pack.is_installed) {
        await api.delete(`/stickers/my/${pack.id}`);
        setPacks((prev) =>
          prev.map((p) => (p.id === pack.id ? { ...p, is_installed: false } : p))
        );
      } else {
        await api.post(`/stickers/my/${pack.id}`);
        setPacks((prev) =>
          prev.map((p) =>
            p.id === pack.id
              ? {
                  ...p,
                  is_installed: true,
                  downloads_count: (p.downloads_count || 0) + 1
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle pack in store:', err);
    } finally {
      setActionLoadingPackId(null);
    }
  };

  const heroPack = featuredPacks.length > 0 ? featuredPacks[0] : packs[0];
  const activeCategoryTheme = CATEGORY_THEMES[selectedCategory];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-5xl h-[94vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* 1. Header Bar */}
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-glow shadow-brand/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>Sticker Store</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand/20 text-brand border border-brand/30">
                    28 PACKS • 16 CATEGORIES
                  </span>
                </h1>
                <p className="text-xs text-zinc-400">
                  Explore curated sticker packs divided by categories for every mood
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowManagerModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors border border-zinc-700/60"
              >
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>My Stickers</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand/10 hover:bg-brand/20 text-xs font-semibold text-brand transition-colors border border-brand/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Pack</span>
              </button>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search + Tab Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80 flex-shrink-0">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sticker packs, emotions, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto w-full pb-1 sm:pb-0 custom-scrollbar">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'featured', label: '⭐ Featured' },
                { id: 'popular', label: '🔥 Popular' },
                { id: 'new', label: '✨ New' },
                { id: 'my', label: '📦 Installed' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id !== 'all') {
                        setSelectedCategory('All');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-zinc-800 text-white shadow-subtle border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Category Scroll Pills */}
        <div className="px-6 py-2.5 border-b border-zinc-800/60 bg-zinc-950/60 flex items-center gap-2 overflow-x-auto custom-scrollbar flex-shrink-0">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  if (activeTab !== 'all') {
                    setActiveTab('all');
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand text-white shadow-glow shadow-brand/20 font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
                }`}
              >
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* 2.5 21 Core Emotion & Reaction Faces Quick Filter Bar */}
        <div className="px-6 py-2 border-b border-zinc-800/60 bg-zinc-900/30 flex items-center gap-2 overflow-x-auto custom-scrollbar flex-shrink-0">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1 mr-1">
            <span>🎭</span>
            <span>Faces:</span>
          </span>
          {STORE_EMOTIONS.map((em) => {
            const isSelected = activeEmotion === em.key;
            return (
              <button
                key={em.key}
                type="button"
                onClick={() => handleSelectEmotion(em.key)}
                className={`px-2.5 py-1 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand text-white shadow-glow shadow-brand/30 font-bold scale-105'
                    : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'
                }`}
              >
                <span>{em.emoji}</span>
                <span>{em.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8">
          {/* Loading State */}
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin text-brand mb-3" />
              <span className="text-xs font-medium">Loading Sticker Store...</span>
            </div>
          ) : activeEmotion ? (
            /* Emotion Reaction Face Showcase */
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {STORE_EMOTIONS.find((e) => e.key === activeEmotion)?.emoji || '✨'}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white capitalize flex items-center gap-2">
                      <span>{STORE_EMOTIONS.find((e) => e.key === activeEmotion)?.label || activeEmotion} Reaction Stickers</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand/20 text-brand border border-brand/30">
                        {loadingEmotion ? 'Loading...' : `${emotionStickers.length} stickers`}
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Matching reaction faces across Anime, Animals, Memes, Gaming, Coffee, and Romance
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveEmotion(null);
                    setEmotionStickers([]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                >
                  Back to Store
                </button>
              </div>

              {loadingEmotion ? (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-500">
                  <Loader2 className="w-8 h-8 animate-spin text-brand mb-3" />
                  <span className="text-xs font-medium">Finding {activeEmotion} stickers...</span>
                </div>
              ) : emotionStickers.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-zinc-500 text-xs text-center">
                  <span>No stickers found for {activeEmotion}.</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {emotionStickers.map((stk) => (
                    <div
                      key={stk.id}
                      onClick={() => setSelectedPackId(stk.pack_id)}
                      className="group relative bg-zinc-900/60 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-brand/40 rounded-2xl p-2.5 flex flex-col items-center justify-between cursor-pointer transition-all hover:scale-105 hover:shadow-xl aspect-square"
                      title={`${stk.name} (from ${stk.pack_name})`}
                    >
                      <div className="w-full flex-1 flex items-center justify-center p-1">
                        <img
                          src={resolveMediaUrl(stk.image_url)}
                          alt={stk.name}
                          className="max-w-full max-h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="w-full text-center mt-1">
                        <span className="text-[10px] font-bold text-zinc-200 truncate block">
                          {stk.name}
                        </span>
                        <span className="text-[9px] text-zinc-500 truncate block">
                          {stk.pack_name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : packs.length === 0 ? (
            /* Empty State */
            <div className="h-64 flex flex-col items-center justify-center text-center p-8">
              <Compass className="w-10 h-10 text-zinc-600 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">No sticker packs found</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                Try searching for a different keyword or reset your filters.
              </p>
              {(searchQuery || selectedCategory !== 'All' || activeTab !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setActiveTab('all');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : searchQuery.trim() ? (
            /* Search Results View */
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Search Results for</span>
                  <span className="text-brand">"{searchQuery}"</span>
                  <span className="text-xs text-zinc-500 font-normal">
                    ({packs.length} packs)
                  </span>
                </h2>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Clear Search
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {packs.map((pack) => (
                  <PackCard
                    key={pack.id}
                    pack={pack}
                    onSelect={setSelectedPackId}
                    onToggleAdd={handleToggleAddPack}
                    actionLoading={actionLoadingPackId === pack.id}
                  />
                ))}
              </div>
            </div>
          ) : activeTab !== 'all' ? (
            /* Specific Tab View (Featured, Popular, New, Installed) */
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div>
                  <h2 className="text-base font-black text-white capitalize">
                    {activeTab === 'featured' && '⭐ Featured Sticker Packs'}
                    {activeTab === 'popular' && '🔥 Most Popular & Trending Packs'}
                    {activeTab === 'new' && '✨ Fresh & New Releases'}
                    {activeTab === 'my' && '📦 Your Installed Sticker Packs'}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {activeTab === 'featured' && 'Editorially handpicked packs for expressive conversations'}
                    {activeTab === 'popular' && 'The most downloaded and favored packs across all chats'}
                    {activeTab === 'new' && 'Brand new artwork and characters recently added to the store'}
                    {activeTab === 'my' && 'Packs currently installed in your keyboard and quick composer'}
                  </p>
                </div>
                <span className="text-xs text-zinc-500 font-bold px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                  {packs.length} Packs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {packs.map((pack) => (
                  <PackCard
                    key={pack.id}
                    pack={pack}
                    onSelect={setSelectedPackId}
                    onToggleAdd={handleToggleAddPack}
                    actionLoading={actionLoadingPackId === pack.id}
                  />
                ))}
              </div>
            </div>
          ) : selectedCategory !== 'All' ? (
            /* Single Category Showcase View */
            <div className="flex flex-col gap-6">
              {/* Themed Category Hero Banner */}
              {activeCategoryTheme && (
                <div
                  className={`relative rounded-3xl p-6 overflow-hidden bg-gradient-to-r ${activeCategoryTheme.gradient} border ${activeCategoryTheme.border} shadow-xl flex flex-col gap-4`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to All Categories</span>
                    </button>
                    <span
                      className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${activeCategoryTheme.badge}`}
                    >
                      {activeCategoryTheme.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-center text-4xl shadow-lg flex-shrink-0">
                      {activeCategoryTheme.emoji}
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        {activeCategoryTheme.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
                        {activeCategoryTheme.desc}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2 font-medium">
                        <span className="text-white font-semibold">{displayedCategoryPacks.length} Packs</span>
                        <span>•</span>
                        <span>Free for everyone</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid of Category Packs strictly for this category */}
              {displayedCategoryPacks.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-zinc-900/40 rounded-3xl border border-zinc-800">
                  <p className="text-xs text-zinc-400">No sticker packs available in this category yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedCategoryPacks.map((pack) => (
                    <PackCard
                      key={pack.id}
                      pack={pack}
                      onSelect={setSelectedPackId}
                      onToggleAdd={handleToggleAddPack}
                      actionLoading={actionLoadingPackId === pack.id}
                      categoryTheme={activeCategoryTheme}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* MAIN STORE VIEW: Divided into Dedicated Category Sections */
            <div className="flex flex-col gap-8">
              {/* 1. Hero Featured Banner of the Week */}
              {heroPack && (
                <div
                  onClick={() => setSelectedPackId(heroPack.id)}
                  className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-purple-600/20 border border-amber-500/30 cursor-pointer group hover:border-amber-400/50 transition-all shadow-xl"
                >
                  <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                    <div className="flex flex-col gap-2 max-w-md text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black tracking-wide uppercase border border-amber-500/30 self-center sm:self-start">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Featured Pack of the Week</span>
                      </div>
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        {heroPack.name}
                      </h2>
                      <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                        {heroPack.description ||
                          'Elevate your conversations with this curated collection of expressive illustrations.'}
                      </p>
                      <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400 mt-2">
                        <span className="font-semibold text-white">
                          {heroPack.sticker_count || 8} Stickers
                        </span>
                        <span>•</span>
                        <span>{heroPack.category}</span>
                        <span>•</span>
                        <span>{heroPack.creator_name || 'Pulse'}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-center sm:justify-start gap-3">
                        <button
                          type="button"
                          onClick={(e) => handleToggleAddPack(e, heroPack)}
                          disabled={actionLoadingPackId === heroPack.id}
                          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95 ${
                            heroPack.is_installed
                              ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                              : 'bg-brand hover:bg-brand-hover text-white shadow-brand/30'
                          }`}
                        >
                          {actionLoadingPackId === heroPack.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : heroPack.is_installed ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span>Added to Library</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              <span>Add Pack</span>
                            </>
                          )}
                        </button>
                        <span className="text-xs text-zinc-400 group-hover:text-white flex items-center gap-1 transition-colors">
                          <span>Preview pack</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Hero Sticker showcase preview */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {heroPack.stickers &&
                        heroPack.stickers.slice(0, 3).map((stk, idx) => (
                          <div
                            key={stk.id || idx}
                            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-900/80 p-2 border border-white/10 flex items-center justify-center shadow-lg transition-transform ${
                              idx === 1
                                ? 'scale-110 -translate-y-2 ring-2 ring-brand/40'
                                : 'opacity-90'
                            }`}
                          >
                            <img
                              src={resolveMediaUrl(stk.image_url)}
                              alt={stk.name}
                              className="max-w-full max-h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Reaction Faces Showcase (All 21 Emotions Across Categories) */}
              <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-zinc-900/60 p-5 sm:p-6 flex flex-col gap-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl shadow-sm">
                      🎭
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <span>Express by Reaction Face</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          21 Emotions
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Discover matching reaction stickers across Anime, Coffee, Cats, Hearts, Gaming & Memes
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-500 italic hidden sm:block">
                    Tap any face to view stickers
                  </span>
                </div>

                {/* 21 Emotion Face Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 pt-1">
                  {STORE_EMOTIONS.map((em) => (
                    <button
                      key={em.key}
                      type="button"
                      onClick={() => handleSelectEmotion(em.key)}
                      className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/40 hover:scale-105 active:scale-95 transition-all shadow-sm"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform mb-1">
                        {em.emoji}
                      </span>
                      <span className="text-[11px] font-bold text-zinc-300 group-hover:text-white truncate max-w-full">
                        {em.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Categorized Sections (Divided by Category with dedicated design) */}
              <div className="flex flex-col gap-8">
                {categorizedSections.map(({ category, theme, packs: sectionPacks }) => (
                  <section
                    key={category}
                    className={`rounded-3xl border ${theme.border} bg-gradient-to-br ${theme.gradient} p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden transition-all shadow-md`}
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                          {theme.emoji}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                              {theme.title}
                            </h3>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}
                            >
                              {theme.tag}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 truncate max-w-md mt-0.5">
                            {theme.desc}
                          </p>
                        </div>
                      </div>

                      {/* View All Button for this category */}
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-zinc-900/80 hover:bg-zinc-800 text-white border border-white/10 hover:border-white/20 whitespace-nowrap shadow-sm group flex-shrink-0"
                      >
                        <span>See All ({sectionPacks.length})</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Packs in this category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {sectionPacks.map((pack) => (
                        <PackCard
                          key={pack.id}
                          pack={pack}
                          onSelect={setSelectedPackId}
                          onToggleAdd={handleToggleAddPack}
                          actionLoading={actionLoadingPackId === pack.id}
                          categoryTheme={theme}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-modals */}
      {selectedPackId && (
        <StickerPackDetailModal
          packId={selectedPackId}
          isOpen={!!selectedPackId}
          onClose={() => setSelectedPackId(null)}
          onInstalledChange={(pId, isInstalled) => {
            setPacks((prev) =>
              prev.map((p) => (p.id === pId ? { ...p, is_installed: isInstalled } : p))
            );
          }}
        />
      )}

      {showManagerModal && (
        <MyStickersManagerModal
          isOpen={showManagerModal}
          onClose={() => setShowManagerModal(false)}
          onOpenStore={() => {
            setShowManagerModal(false);
            setActiveTab('all');
            setSelectedCategory('All');
          }}
          onOpenPackPreview={(pId) => {
            setShowManagerModal(false);
            setSelectedPackId(pId);
          }}
        />
      )}

      {showCreateModal && (
        <CreateStickerPackModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            loadStoreData();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
