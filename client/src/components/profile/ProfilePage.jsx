import React, { useState } from 'react';
import {
  User,
  Copy,
  Check,
  QrCode,
  Upload,
  Edit2,
  Sparkles,
  Save,
  Loader2,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../layout/Toast';
import QRCodeModal from '../friends/QRCodeModal';

export default function ProfilePage({ onOpenSettings }) {
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [status, setStatus] = useState(user?.status || 'online');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  React.useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setBio(user.bio || '');
      setStatus(user.status || 'online');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const copyUserId = () => {
    if (user?.user_id) {
      navigator.clipboard.writeText(user.user_id);
      showToast('Unique User ID copied!');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = await api.uploadFile(file, 'avatar');
      setAvatarUrl(data.url);
      await updateProfile({ avatar_url: data.url });
      showToast('Avatar updated successfully!');
    } catch (err) {
      showToast('Failed to upload avatar', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      setSaving(true);
      await updateProfile({
        username: username.trim(),
        bio: bio.trim(),
        status
      });
      setIsEditing(false);
      showToast('Profile updated!');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { id: 'online', label: 'Online', color: 'bg-emerald-500' },
    { id: 'away', label: 'Away', color: 'bg-amber-500' },
    { id: 'busy', label: 'Do Not Disturb', color: 'bg-rose-500' },
    { id: 'offline', label: 'Invisible', color: 'bg-zinc-500' }
  ];

  return (
    <div className="flex-1 h-full bg-zinc-950 flex flex-col select-none overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 sm:p-6 border-b border-zinc-800/60 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">My Profile</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Your personal identity in PulseChat</p>
        </div>

        <button
          onClick={() => setShowQrModal(true)}
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <QrCode className="w-4 h-4 text-brand" />
          <span>My QR Code</span>
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="flex-1 p-4 sm:p-6 max-w-2xl">
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-2xl relative mb-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            <div className="relative group">
              <img
                src={
                  avatarUrl ||
                  user?.avatar_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                }
                alt={user?.username}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                }}
                className="w-28 h-28 rounded-3xl object-cover border-2 border-brand shadow-glow shadow-brand/20 bg-zinc-900"
              />

              <label
                className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-medium cursor-pointer transition-opacity backdrop-blur-xs"
                title="Change Avatar"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 mb-1 text-brand" />
                    <span>Change</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
              </label>

              {/* Visible change badge for mobile touch devices */}
              <label
                className="sm:hidden absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-transform"
                title="Change Avatar"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white tracking-tight">{user?.username}</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold self-center sm:self-auto flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
              </div>

              {/* User ID Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 mt-1">
                <span>{user?.user_id}</span>
                <button
                  onClick={copyUserId}
                  className="text-zinc-500 hover:text-brand transition-colors p-0.5"
                  title="Copy User ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bio */}
              <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                {user?.bio || 'No bio written yet. Click edit to share something about yourself.'}
              </p>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleSave} className="space-y-4 pt-6 border-t border-zinc-800/80 animate-slide-up">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStatus(opt.id)}
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                        status === opt.id
                          ? 'bg-zinc-800 border-brand text-white'
                          : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Bio
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={150}
                  placeholder="Share a short bio..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-brand outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover flex items-center gap-1.5 shadow-subtle transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Account Quick Actions */}
        <div className="space-y-2.5">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="w-full p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between text-xs font-semibold text-zinc-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-800 text-brand">
                  <Settings className="w-4 h-4" />
                </div>
                <span>Open Settings & Preferences</span>
              </div>
              <span className="text-zinc-500 group-hover:text-zinc-300">→</span>
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                logout();
              }
            }}
            className="w-full p-4 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/30 flex items-center gap-3 text-xs font-semibold text-rose-400 transition-all"
          >
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Log Out of Account</span>
          </button>
        </div>
      </div>

      {showQrModal && (
        <QRCodeModal
          userId={user?.user_id}
          username={user?.username}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
}
