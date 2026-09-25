import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Bell,
  Palette,
  MessageSquare,
  HardDrive,
  Info,
  AlertTriangle,
  Lock,
  LogOut,
  Check,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Server,
  Wifi,
  Globe,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api, getServerUrl, setServerUrl, checkServerHealth } from '../../services/api';
import { useToast } from '../layout/Toast';

const ACCENT_COLORS = [
  { id: 'indigo', name: 'Sapphire Indigo', color: 'bg-[#6366f1]' },
  { id: 'violet', name: 'Electric Violet', color: 'bg-[#8b5cf6]' },
  { id: 'cyan', name: 'Cyber Cyan', color: 'bg-[#06b6d4]' },
  { id: 'emerald', name: 'Emerald Green', color: 'bg-[#10b981]' },
  { id: 'amber', name: 'Solar Amber', color: 'bg-[#f59e0b]' },
  { id: 'rose', name: 'Vibrant Rose', color: 'bg-[#f43f5e]' },
];

export default function SettingsPage() {
  const { user, settings, updateSettings, logout } = useAuth();
  const { theme, setTheme, accent, setAccent } = useTheme();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState('appearance');
  const [enterToSend, setEnterToSend] = useState(settings?.enter_to_send !== false);
  const [soundEnabled, setSoundEnabled] = useState(settings?.sound_enabled !== false);
  const [desktopNotifs, setDesktopNotifs] = useState(settings?.desktop_notifications !== false);

  // Storage data
  const [storageData, setStorageData] = useState(null);
  const [loadingStorage, setLoadingStorage] = useState(false);

  // Change password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Danger zone delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Server & Connection states
  const [serverUrl, setServerUrlState] = useState(getServerUrl());
  const [serverTesting, setServerTesting] = useState(false);
  const [serverTestResult, setServerTestResult] = useState(null);

  const handleTestServer = async (testUrl) => {
    setServerTesting(true);
    setServerTestResult(null);
    const res = await checkServerHealth(testUrl !== undefined ? testUrl : serverUrl);
    setServerTestResult(res);
    setServerTesting(false);
  };

  const handleSaveServer = () => {
    setServerUrl(serverUrl.trim());
    showToast('Server URL saved! Socket reconnecting...');
    handleTestServer(serverUrl.trim());
  };

  const loadStorage = async () => {
    try {
      setLoadingStorage(true);
      const data = await api.get('/settings/storage');
      setStorageData(data.storage);
    } catch (e) {
      console.error('Failed to load storage stats:', e);
    } finally {
      setLoadingStorage(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'storage') {
      loadStorage();
    }
  }, [activeSection]);

  const handleToggleSound = async () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    await updateSettings({ sound_enabled: next });
    showToast(next ? 'Sound effects enabled' : 'Sound effects muted');
  };

  const handleToggleEnter = async () => {
    const next = !enterToSend;
    setEnterToSend(next);
    await updateSettings({ enter_to_send: next });
    showToast(next ? 'Enter will now send messages' : 'Shift + Enter creates new line');
  };

  const handleToggleDesktopNotifs = async () => {
    if (!desktopNotifs && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        showToast('Desktop notification permission was denied', 'error');
        return;
      }
    }
    const next = !desktopNotifs;
    setDesktopNotifs(next);
    await updateSettings({ desktop_notifications: next });
    showToast(next ? 'Desktop notifications turned on' : 'Desktop notifications turned off');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError('');
      await api.post('/auth/change-password', { currentPassword, newPassword });
      showToast('Password updated successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== user?.user_id) {
      showToast('Please type your exact User ID to confirm deletion.', 'error');
      return;
    }

    try {
      await api.del('/settings/account');
      showToast('Account deleted permanently.');
      logout();
    } catch (e) {
      showToast('Failed to delete account.', 'error');
    }
  };

  const navSections = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'chat', label: 'Chat Preferences', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'storage', label: 'Data & Storage', icon: HardDrive },
    { id: 'account', label: 'Account & Security', icon: User },
    { id: 'server', label: 'Server & Network', icon: Server },
    { id: 'about', label: 'About PulseChat', icon: Info },
  ];

  return (
    <div className="flex-1 h-full bg-zinc-950 flex flex-col sm:flex-row select-none overflow-hidden">
      {/* Settings Navigation Sidebar */}
      <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-zinc-800/80 p-4 flex flex-col justify-between flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-4 px-2">Settings</h2>
          <nav className="space-y-1">
            {navSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-zinc-800 text-brand shadow-subtle border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={logout}
          className="mt-4 flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Main Settings Content Area */}
      <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-3xl">
        {/* Appearance Section */}
        {activeSection === 'appearance' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Theme & Color Scheme</h3>
              <p className="text-xs text-zinc-400 mb-4">Choose how PulseChat looks on your device.</p>

              <div className="grid grid-cols-3 gap-3 max-w-md">
                {[
                  { id: 'dark', label: 'Dark' },
                  { id: 'light', label: 'Light' },
                  { id: 'system', label: 'System' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      updateSettings({ theme: t.id });
                    }}
                    className={`p-3.5 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                      theme === t.id
                        ? 'bg-zinc-800 border-brand text-white shadow-glow shadow-brand/10'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800/80 pt-6">
              <h3 className="text-sm font-bold text-white mb-1">Primary Accent Palette</h3>
              <p className="text-xs text-zinc-400 mb-4">Select the accent color used across icons, buttons, and bubbles.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setAccent(c.id);
                      updateSettings({ accent_color: c.id });
                    }}
                    className={`p-3 rounded-2xl border flex items-center gap-3 text-xs font-semibold transition-all ${
                      accent === c.id
                        ? 'bg-zinc-800 border-brand text-white shadow-subtle'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${c.color}`} />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Preferences Section */}
        {activeSection === 'chat' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-1">Messaging Controls</h3>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Enter to Send</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Press Enter to send, Shift + Enter for a new line on desktop</p>
              </div>
              <input
                type="checkbox"
                checked={enterToSend}
                onChange={handleToggleEnter}
                className="w-5 h-5 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-1">Notification Settings</h3>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Sound Effects</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Play pleasant chimes for incoming and outgoing messages</p>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={handleToggleSound}
                className="w-5 h-5 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Desktop Push Notifications</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Receive system alerts when messages arrive in the background</p>
              </div>
              <input
                type="checkbox"
                checked={desktopNotifs}
                onChange={handleToggleDesktopNotifs}
                className="w-5 h-5 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Privacy Section */}
        {activeSection === 'privacy' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-1">Privacy & Safety</h3>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <h4 className="text-xs font-bold text-white mb-1">Online Status Visibility</h4>
              <p className="text-xs text-zinc-400 mb-3">Control who sees when you are active</p>
              <select
                defaultValue={settings?.privacy_online || 'everyone'}
                onChange={(e) => updateSettings({ privacy_online: e.target.value })}
                className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-brand"
              >
                <option value="everyone">Everyone</option>
                <option value="friends">Friends Only</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>
          </div>
        )}

        {/* Storage Section */}
        {activeSection === 'storage' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-1">Data & Storage Breakdown</h3>
            <p className="text-xs text-zinc-400">Disk usage by media and cache categories.</p>

            {loadingStorage ? (
              <div className="h-40 flex items-center justify-center text-zinc-500 text-xs">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Calculating storage...
              </div>
            ) : storageData ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">Total Media Usage</span>
                  <span className="text-sm font-bold text-brand">{storageData.total}</span>
                </div>

                <div className="space-y-2">
                  {storageData.breakdown.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-200">{item.category} ({item.count} files)</span>
                      <span className="font-mono text-zinc-400">{item.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Account Section & Danger Zone */}
        {activeSection === 'account' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-1">Account & Security</h3>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Password</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Change your personal login password</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
              >
                Change Password
              </button>
            </div>

            {/* Danger Zone */}
            <div className="mt-10 p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Account Danger Zone</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Permanently deletes your User ID, friendships, conversation memberships, and profile. This action is irreversible.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        )}

        {/* Server & Network Section */}
        {activeSection === 'server' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Server & Network Connection</h3>
              <p className="text-xs text-zinc-400">Configure where PulseChat connects to sync your messages, calls, and files.</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Connection Health</span>
                {serverTesting ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Pinging server...
                  </span>
                ) : serverTestResult?.ok ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Online ({serverTestResult.latency}ms)
                  </span>
                ) : (
                  <button
                    onClick={() => handleTestServer()}
                    className="text-xs text-brand hover:underline font-semibold"
                  >
                    Check Status
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Server URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrlState(e.target.value)}
                    placeholder="e.g. http://192.168.1.3:5000 or https://your-server.onrender.com"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono outline-none focus:border-brand"
                  />
                  <button
                    onClick={() => handleTestServer(serverUrl)}
                    disabled={serverTesting}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                  >
                    Test
                  </button>
                  <button
                    onClick={handleSaveServer}
                    className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-glow shadow-brand/20 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-zinc-400 block mb-2">Quick Presets:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setServerUrlState('http://192.168.1.3:5000');
                      handleTestServer('http://192.168.1.3:5000');
                    }}
                    className="p-3 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all text-xs"
                  >
                    <div className="flex items-center gap-2 font-medium text-white">
                      <Wifi className="w-3.5 h-3.5 text-brand" />
                      <span>Home Wi-Fi (PC)</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono mt-1">http://192.168.1.3:5000</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setServerUrlState('');
                      handleTestServer('');
                    }}
                    className="p-3 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all text-xs"
                  >
                    <div className="flex items-center gap-2 font-medium text-white">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Default / Localhost</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono mt-1">/api (Browser relative)</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        {activeSection === 'about' && (
          <div className="space-y-4 animate-fade-in text-xs text-zinc-400 leading-relaxed">
            <h3 className="text-lg font-bold text-white mb-1">About PulseChat</h3>
            <p>Version: <span className="font-mono text-zinc-200">1.0.0 (Production Stable)</span></p>
            <p>
              PulseChat is a private, modern personal messaging platform built for direct circles and friends. No phone numbers, no tracking, complete end-to-end user identity via unique User IDs.
            </p>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative text-zinc-100 animate-slide-up">
            <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
            {passwordError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {passwordError}
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-4 py-1.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors"
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl relative text-zinc-100 animate-slide-up">
            <h3 className="text-lg font-bold text-rose-400 mb-2">Delete Account</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Type your User ID <span className="font-mono font-bold text-white">{user?.user_id}</span> below to confirm permanent deletion:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={user?.user_id}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-rose-500 font-mono mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== user?.user_id}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-40"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
