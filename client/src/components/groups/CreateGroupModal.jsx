import React, { useState, useEffect } from 'react';
import { X, Users, Upload, Check, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../layout/Toast';

const GROUP_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=150&auto=format&fit=crop&q=80'
];

export default function CreateGroupModal({ onClose, onCreated }) {
  const { createGroupChat } = useChat();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(GROUP_AVATAR_PRESETS[0]);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadFriends() {
      try {
        const data = await api.get('/friends');
        setFriends(data.friends || []);
      } catch (e) {
        console.error('Failed to load friends:', e);
      } finally {
        setLoadingFriends(false);
      }
    }
    loadFriends();
  }, []);

  const toggleFriend = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await api.uploadFile(file, 'avatar');
      setAvatarUrl(data.url);
    } catch (err) {
      showToast('Avatar upload failed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a group name.');
      return;
    }

    try {
      setCreating(true);
      setError('');
      const convId = await createGroupChat({
        name: name.trim(),
        description: description.trim(),
        avatar_url: avatarUrl,
        memberIds: selectedFriends
      });

      showToast(`Group "${name.trim()}" created!`);
      if (onCreated) onCreated(convId);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create group.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-zinc-100 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h3 className="text-2xl font-bold tracking-tight text-white">Create Group</h3>
          <p className="text-xs text-zinc-400 mt-1">Chat together with your squad</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Presets & Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Group Avatar
            </label>
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl}
                alt="Group avatar"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-brand shadow-glow shadow-brand/20 flex-shrink-0"
              />

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {GROUP_AVATAR_PRESETS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`relative rounded-xl overflow-hidden flex-shrink-0 ${
                      avatarUrl === url ? 'ring-2 ring-brand' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-9 h-9 object-cover" />
                  </button>
                ))}

                <label className="w-9 h-9 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer flex-shrink-0">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Group Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Lab"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand text-sm text-white placeholder-zinc-500 outline-none"
            />
          </div>

          {/* Group Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand text-sm text-white placeholder-zinc-500 outline-none"
            />
          </div>

          {/* Member Selection from Friends */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Add Friends ({selectedFriends.length} selected)
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-zinc-950 rounded-2xl border border-zinc-800">
              {loadingFriends ? (
                <div className="text-center py-4 text-zinc-500 text-xs">Loading friends...</div>
              ) : friends.length === 0 ? (
                <div className="text-center py-4 text-zinc-500 text-xs">No friends added yet.</div>
              ) : (
                friends.map((f) => {
                  const isChecked = selectedFriends.includes(f.id);
                  return (
                    <div
                      key={f.id}
                      onClick={() => toggleFriend(f.id)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                        isChecked ? 'bg-brand/20 border border-brand/40 text-white' : 'hover:bg-zinc-900 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <img
                          src={f.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={f.username}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                          }}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium truncate">{f.username}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                          isChecked ? 'bg-brand border-brand text-white' : 'border-zinc-700'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full mt-3 h-12 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-glow shadow-brand/20 disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
}
