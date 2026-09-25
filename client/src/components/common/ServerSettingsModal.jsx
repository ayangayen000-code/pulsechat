import React, { useState, useEffect } from 'react';
import { X, Server, Wifi, Globe, CheckCircle2, AlertCircle, RefreshCw, Smartphone, HelpCircle } from 'lucide-react';
import { getServerUrl, setServerUrl, checkServerHealth } from '../../services/api';

export default function ServerSettingsModal({ onClose, onSaved }) {
  const current = getServerUrl();
  const [url, setUrl] = useState(current || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok: bool, latency: number, error: string }
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Automatically perform a health check on the currently configured URL
    handleTest(current);
  }, []);

  const handleTest = async (targetUrl) => {
    setTesting(true);
    setTestResult(null);
    const result = await checkServerHealth(targetUrl !== undefined ? targetUrl : url);
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = () => {
    setServerUrl(url.trim());
    if (onSaved) onSaved(url.trim());
    if (onClose) onClose();
  };

  const applyPreset = (presetUrl) => {
    setUrl(presetUrl);
    handleTest(presetUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-zinc-100 animate-slide-up flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Server Connection</h2>
              <p className="text-xs text-zinc-400">Configure where your app connects for login & chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="mb-5 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Current Status</span>
            {testing ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Checking...
              </span>
            ) : testResult?.ok ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Online ({testResult.latency}ms)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="w-3.5 h-3.5" />
                Offline / Unreachable
              </span>
            )}
          </div>

          {testResult && !testResult.ok && (
            <p className="mt-2.5 text-xs text-rose-300/90 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              ⚠️ {testResult.error || 'Server cannot be reached.'} Ensure your server is running and your device is on the same network or cloud URL is valid.
            </p>
          )}

          {testResult && testResult.ok && (
            <p className="mt-2 text-xs text-emerald-400/90 font-medium">
              ✅ Connected successfully to PulseChat backend engine!
            </p>
          )}
        </div>

        {/* Input */}
        <div className="mb-5 space-y-2">
          <label className="text-xs font-semibold text-zinc-300">Server Backend URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. http://192.168.1.3:5000 or https://your-server.onrender.com"
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-mono"
            />
            <button
              onClick={() => handleTest(url)}
              disabled={testing}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              Test
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-5 space-y-2">
          <span className="text-xs font-semibold text-zinc-400">Quick Presets:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => applyPreset('https://pulsechat-server-2z5x.onrender.com')}
              className="p-3 rounded-xl bg-zinc-950/50 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all text-xs group"
            >
              <div className="flex items-center gap-2 font-medium text-white group-hover:text-brand">
                <Globe className="w-3.5 h-3.5 text-brand" />
                <span>24/7 Cloud Server (Render)</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 font-mono truncate">https://pulsechat-server-2z5x.onrender.com</p>
            </button>

            <button
              onClick={() => applyPreset('http://192.168.1.3:5000')}
              className="p-3 rounded-xl bg-zinc-950/50 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all text-xs group"
            >
              <div className="flex items-center gap-2 font-medium text-white group-hover:text-brand">
                <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                <span>Home Wi-Fi (PC)</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 font-mono truncate">http://192.168.1.3:5000</p>
            </button>
          </div>
        </div>

        {/* Info Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1.5 text-xs text-brand hover:underline"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How do my friends connect from their homes?</span>
          </button>

          {showHelp && (
            <div className="mt-3 p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 space-y-2 leading-relaxed animate-fade-in">
              <p>
                <strong>📱 At Home (Testing):</strong> If your phone is connected to the same Wi-Fi as your computer, select <strong>Home Wi-Fi</strong> (<span className="font-mono text-brand">192.168.1.3:5000</span>) and make sure your computer server is running!
              </p>
              <p>
                <strong>🌐 With Friends Anywhere (24/7):</strong> Connect your GitHub repo to <strong>Render.com</strong> (100% free). Render gives you a free HTTPS server link (e.g. <span className="font-mono text-brand">https://pulsechat-server.onrender.com</span>) that works on any phone, anywhere in the world!
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800 mt-auto">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-brand hover:bg-brand-hover text-white transition-all shadow-glow shadow-brand/20 active:scale-95"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
}
