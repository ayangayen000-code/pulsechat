import React, { useState, useEffect } from 'react';
import {
  Clock,
  Star,
  Sparkles,
  ShoppingBag,
  Search,
  Settings,
  Heart,
  Loader2,
  X,
  Plus
} from 'lucide-react';
import { api } from '../../services/api';
import StickerStoreModal from './StickerStoreModal';
import MyStickersManagerModal from './MyStickersManagerModal';
import CreateStickerPackModal from './CreateStickerPackModal';

export const EMOTION_FACES = [
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

export default function StickerPicker({ onSelectSticker, onClose }) {
  const [activeTab, setActiveTab] = useState('recent'); // 'recent', 'favorites', or pack.id
  const [packs, setPacks] = useState([]);
  const [recentStickers, setRecentStickers] = useState([]);
  const [favoriteStickers, setFavoriteStickers] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load user packs, recents, and favorites
  const loadData = async () => {
    try {
      setLoading(true);
      const [packsRes, recentsRes, favsRes] = await Promise.all([
        api.get('/stickers/my'),
        api.get('/stickers/recent'),
        api.get('/stickers/favorites')
      ]);

      const myPacks = packsRes.packs || [];
      const recents = recentsRes.recent || [];
      const favs = favsRes.favorites || [];

      setPacks(myPacks);
      setRecentStickers(recents);
      setFavoriteStickers(favs);
      setFavoriteIds(new Set(favs.map((f) => f.id)));

      // Default active tab: recents if available, otherwise first pack
      if (recents.length > 0) {
        setActiveTab('recent');
      } else if (myPacks.length > 0) {
        setActiveTab(myPacks[0].id);
      }
    } catch (err) {
      console.error('Failed to load sticker picker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle emotion tag search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const data = await api.get('/stickers/search', {
          params: { q: searchQuery.trim() }
        });
        setSearchResults(data.stickers || []);
      } catch (err) {
        console.error('Search stickers error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSend = (stk, packInfo = {}) => {
    const payload = {
      id: stk.id,
      pack_id: stk.pack_id || packInfo.id,
      pack_name: stk.pack_name || packInfo.name || 'Custom Sticker',
      name: stk.name,
      sticker_url: stk.image_url
    };
    onSelectSticker(payload);

    // Track recent in background
    if (stk.id) {
      api.post('/stickers/recent', { stickerId: stk.id }).catch(() => {});
    }
  };

  const handleToggleFavorite = async (e, stk) => {
    e.stopPropagation();
    try {
      const res = await api.post('/stickers/favorite', { stickerId: stk.id });
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (res.isFavorite) {
          next.add(stk.id);
        } else {
          next.delete(stk.id);
        }
        return next;
      });

      if (res.isFavorite) {
        setFavoriteStickers((prev) => [stk, ...prev.filter((s) => s.id !== stk.id)]);
      } else {
        setFavoriteStickers((prev) => prev.filter((s) => s.id !== stk.id));
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  const activePack = packs.find((p) => p.id === activeTab);

  return (
    <div className="w-[340px] sm:w-[400px] max-w-[95vw] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-3 select-none animate-slide-up flex flex-col gap-2 z-50">
      {/* 1. Header with Search Input & Store / Manage Buttons */}
      <div className="flex items-center gap-2 px-1 pt-1">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search emotions, e.g. happy, cry, cat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-7 rounded-xl bg-zinc-900 border border-zinc-800/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sticker Store Shortcut */}
        <button
          type="button"
          onClick={() => setShowStoreModal(true)}
          title="Open Sticker Store"
          className="h-8 px-2.5 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Store</span>
        </button>

        {/* Manage Library */}
        <button
          type="button"
          onClick={() => setShowManagerModal(true)}
          title="Manage Stickers"
          className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. 21 Core Emotion Reaction Faces Quick Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar px-1 py-1 -mt-0.5 border-b border-zinc-900/80">
        {EMOTION_FACES.map((em) => {
          const isSelected = searchQuery.toLowerCase() === em.key.toLowerCase();
          return (
            <button
              key={em.key}
              type="button"
              onClick={() => {
                if (isSelected) {
                  setSearchQuery('');
                } else {
                  setSearchQuery(em.key);
                }
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                isSelected
                  ? 'bg-brand text-white shadow-sm shadow-brand/30 scale-105 font-bold'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/60'
              }`}
            >
              <span>{em.emoji}</span>
              <span>{em.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Stickers Content Grid */}
      <div className="h-64 overflow-y-auto custom-scrollbar p-1">
        {loading || isSearching ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
            <span className="text-xs">Loading stickers...</span>
          </div>
        ) : searchQuery.trim() ? (
          /* Search Results */
          searchResults.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-bold text-zinc-400">
                  {searchResults.length} stickers for "{searchQuery}"
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] text-brand hover:underline font-semibold"
                >
                  Clear
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
              {searchResults.map((stk) => {
                const isFav = favoriteIds.has(stk.id);
                return (
                  <div
                    key={stk.id}
                    onClick={() => handleSend(stk)}
                    className="group relative aspect-square rounded-2xl hover:bg-zinc-900 p-2 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <img
                      src={stk.image_url}
                      alt={stk.name}
                      className="max-w-full max-h-full object-contain filter drop-shadow-md"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, stk)}
                      className={`absolute top-1 right-1 p-1 rounded-full bg-zinc-900/90 transition-opacity ${
                        isFav ? 'text-rose-500 opacity-100' : 'text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-rose-400'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${isFav ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs text-center p-4">
              <Sparkles className="w-6 h-6 mb-2 text-zinc-600" />
              <span>No stickers found for "{searchQuery}"</span>
            </div>
          )
        ) : activeTab === 'recent' ? (
          /* Recent Stickers */
          recentStickers.length > 0 ? (
            <div>
              <div className="text-[11px] font-semibold text-zinc-500 mb-2 px-1 uppercase tracking-wider">
                Recently Used
              </div>
              <div className="grid grid-cols-4 gap-2">
                {recentStickers.map((stk) => {
                  const isFav = favoriteIds.has(stk.id);
                  return (
                    <div
                      key={stk.id}
                      onClick={() => handleSend(stk)}
                      className="group relative aspect-square rounded-2xl hover:bg-zinc-900 p-2 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      <img
                        src={stk.image_url}
                        alt={stk.name}
                        className="max-w-full max-h-full object-contain filter drop-shadow-md"
                      />
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(e, stk)}
                        className={`absolute top-1 right-1 p-1 rounded-full bg-zinc-900/90 transition-opacity ${
                          isFav ? 'text-rose-500 opacity-100' : 'text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-rose-400'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${isFav ? 'fill-rose-500' : ''}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs text-center p-4">
              <Clock className="w-6 h-6 mb-2 text-zinc-600" />
              <span>No recent stickers yet. Tap any sticker to send!</span>
            </div>
          )
        ) : activeTab === 'favorites' ? (
          /* Favorites */
          favoriteStickers.length > 0 ? (
            <div>
              <div className="text-[11px] font-semibold text-zinc-500 mb-2 px-1 uppercase tracking-wider">
                Favorite Stickers ({favoriteStickers.length})
              </div>
              <div className="grid grid-cols-4 gap-2">
                {favoriteStickers.map((stk) => (
                  <div
                    key={stk.id}
                    onClick={() => handleSend(stk)}
                    className="group relative aspect-square rounded-2xl hover:bg-zinc-900 p-2 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <img
                      src={stk.image_url}
                      alt={stk.name}
                      className="max-w-full max-h-full object-contain filter drop-shadow-md"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, stk)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-zinc-900/90 text-rose-500 opacity-100 hover:scale-110 transition-transform"
                    >
                      <Heart className="w-3 h-3 fill-rose-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs text-center p-4">
              <Star className="w-6 h-6 mb-2 text-zinc-600" />
              <span>No favorites yet. Hover and click the heart on any sticker!</span>
            </div>
          )
        ) : activePack && activePack.stickers && activePack.stickers.length > 0 ? (
          /* Active Pack Grid */
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-zinc-300">
                {activePack.name}
              </span>
              <span className="text-[10px] text-zinc-500">
                {activePack.stickers.length} stickers
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {activePack.stickers.map((stk) => {
                const isFav = favoriteIds.has(stk.id);
                return (
                  <div
                    key={stk.id}
                    onClick={() => handleSend(stk, activePack)}
                    className="group relative aspect-square rounded-2xl hover:bg-zinc-900 p-2 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <img
                      src={stk.image_url}
                      alt={stk.name}
                      className="max-w-full max-h-full object-contain filter drop-shadow-md"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, stk)}
                      className={`absolute top-1 right-1 p-1 rounded-full bg-zinc-900/90 transition-opacity ${
                        isFav ? 'text-rose-500 opacity-100' : 'text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-rose-400'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${isFav ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs text-center p-4">
            <Sparkles className="w-6 h-6 mb-2 text-zinc-600" />
            <span>No stickers in this pack.</span>
          </div>
        )}
      </div>

      {/* 3. Bottom Tabs Bar */}
      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2 px-1">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar flex-1 pb-1">
          {/* Recent Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('recent');
              setSearchQuery('');
            }}
            title="Recent Stickers"
            className={`p-2 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'recent' && !searchQuery
                ? 'bg-zinc-800 text-brand ring-1 ring-brand/50'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Favorites Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('favorites');
              setSearchQuery('');
            }}
            title="Favorite Stickers"
            className={`p-2 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'favorites' && !searchQuery
                ? 'bg-zinc-800 text-amber-400 ring-1 ring-amber-400/50'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Star className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-zinc-800 mx-1 flex-shrink-0" />

          {/* Installed Packs Tabs */}
          {packs.map((pack) => {
            const isActive = activeTab === pack.id && !searchQuery;
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => {
                  setActiveTab(pack.id);
                  setSearchQuery('');
                }}
                title={pack.name}
                className={`w-9 h-9 rounded-xl flex-shrink-0 p-1 flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-zinc-800 ring-2 ring-brand shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:bg-zinc-900'
                }`}
              >
                <img
                  src={pack.icon_url || pack.cover_image}
                  alt={pack.name}
                  className="max-w-full max-h-full object-contain filter drop-shadow-sm"
                />
              </button>
            );
          })}
        </div>

        {/* Plus button to create custom pack */}
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          title="Create New Sticker Pack"
          className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-brand border border-zinc-800 flex items-center justify-center transition-colors flex-shrink-0 ml-1.5"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Sub-modals */}
      {showStoreModal && (
        <StickerStoreModal
          isOpen={showStoreModal}
          onClose={() => {
            setShowStoreModal(false);
            loadData();
          }}
        />
      )}

      {showManagerModal && (
        <MyStickersManagerModal
          isOpen={showManagerModal}
          onClose={() => {
            setShowManagerModal(false);
            loadData();
          }}
          onOpenStore={() => {
            setShowManagerModal(false);
            setShowStoreModal(true);
          }}
          onOpenPackPreview={() => {}}
        />
      )}

      {showCreateModal && (
        <CreateStickerPackModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            loadData();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
