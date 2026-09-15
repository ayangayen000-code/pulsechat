import React, { useState } from 'react';
import { X, User, AtSign, Lock, Sparkles, Upload, Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setError('');
      const data = await api.uploadFile(file, 'avatar');
      setAvatarUrl(data.url);
    } catch (err) {
      setError(err.message || 'Avatar upload failed.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUserIdChange = (e) => {
    let val = e.target.value.toLowerCase().replace(/[^a-z0-9_@]/g, '');
    if (val && !val.startsWith('@')) {
      val = '@' + val;
    }
    setUserId(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !userId.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const cleanHandle = userId.startsWith('@') ? userId : '@' + userId;
    if (!/^@[a-z0-9_]{3,24}$/.test(cleanHandle)) {
      setError('User ID must be 3-24 characters containing letters, numbers, or underscores.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register({
        username: username.trim(),
        user_id: cleanHandle,
        password,
        avatar_url: avatarUrl,
        bio: bio.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-zinc-100 animate-slide-up my-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
          <p className="text-sm text-zinc-400 mt-1">No phone number required. Choose your unique handle.</p>
        </div>

        {error && (
          <div className="p-3.5 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Profile Avatar
            </label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={avatarUrl || PRESET_AVATARS[0]}
                  alt="Avatar"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-brand shadow-glow shadow-brand/20"
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`relative rounded-xl overflow-hidden flex-shrink-0 transition-transform ${
                      avatarUrl === url ? 'ring-2 ring-brand scale-105' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx}`} className="w-9 h-9 object-cover" />
                    {avatarUrl === url && (
                      <div className="absolute inset-0 bg-brand/30 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}

                <label className="w-9 h-9 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition-colors flex-shrink-0">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Display Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Alex Rivera"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand focus:ring-1 focus:ring-brand text-sm text-white placeholder-zinc-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Unique User ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Unique User ID <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-500">Friends will add you with this ID</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <AtSign className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={userId}
                onChange={handleUserIdChange}
                placeholder="@alex_99"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand focus:ring-1 focus:ring-brand text-sm text-white font-mono placeholder-zinc-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand focus:ring-1 focus:ring-brand text-sm text-white placeholder-zinc-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                {confirmPassword && (
                  <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                    password === confirmPassword ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {password === confirmPassword ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <span>Passwords do not match yet</span>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className={`w-full pl-10 pr-11 py-3 rounded-xl bg-zinc-950 border text-sm text-white placeholder-zinc-600 outline-none transition-all ${
                    confirmPassword
                      ? password === confirmPassword
                        ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                        : 'border-amber-500/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                      : 'border-zinc-800 focus:border-brand focus:ring-1 focus:ring-brand'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Optional Bio */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Bio <span className="text-zinc-600 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few words about yourself..."
              maxLength={120}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand focus:ring-1 focus:ring-brand text-sm text-white placeholder-zinc-600 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-12 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-glow shadow-brand/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-400">
          Already registered?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-brand font-semibold hover:underline"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
