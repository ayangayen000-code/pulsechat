import React, { useState, useEffect } from 'react';
import { X, Clock, Shield, Check, Info, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../layout/Toast';

const PRESETS = [
  { id: 'off', label: 'Off', duration: 0, description: 'Messages stay in the chat history indefinitely.' },
  { id: '10s', label: '10 seconds', duration: 10, description: 'Rapid self-destruct for quick, fleeting notes.' },
  { id: '1m', label: '1 minute', duration: 60, description: 'Disappears 60 seconds after delivery.' },
  { id: '1h', label: '1 hour', duration: 3600, description: 'Good for temporary meetings or daily sessions.' },
  { id: '1d', label: '1 day', duration: 86400, description: 'Remains visible for 24 hours before disappearing.' },
  { id: 'custom', label: 'Custom time', duration: null, description: 'Set your own custom expiration timer.' }
];

const QUICK_PILLS = [
  { label: '10 seconds', value: 10, unit: 'seconds', num: 10 },
  { label: '45 seconds', value: 45, unit: 'seconds', num: 45 },
  { label: '5 minutes', value: 300, unit: 'minutes', num: 5 },
  { label: '30 minutes', value: 1800, unit: 'minutes', num: 30 },
  { label: '3 hours', value: 10800, unit: 'hours', num: 3 },
  { label: '12 hours', value: 43200, unit: 'hours', num: 12 },
  { label: '2 days', value: 172800, unit: 'days', num: 2 },
  { label: '7 days', value: 604800, unit: 'days', num: 7 }
];

export default function DisappearingSettingsModal({ isOpen, onClose, conversation }) {
  const { updateDisappearingSettings } = useChat();
  const { user } = useAuth();
  const { showToast } = useToast();

  const isGroup = conversation?.type === 'group';

  // State
  const [selectedPreset, setSelectedPreset] = useState('off');
  const [customValue, setCustomValue] = useState(5);
  const [customUnit, setCustomUnit] = useState('minutes'); // 'seconds' | 'minutes' | 'hours' | 'days'
  const [adminOnly, setAdminOnly] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize from current conversation settings
  useEffect(() => {
    if (!conversation) return;
    const duration = conversation.disappearing_duration || 0;
    const unit = conversation.disappearing_unit || 'off';
    const isEnabled = conversation.disappearing_enabled === 1 || conversation.disappearing_enabled === true;

    setAdminOnly(conversation.disappearing_admin_only !== 0);

    if (!isEnabled || duration === 0) {
      setSelectedPreset('off');
    } else if (duration === 10) {
      setSelectedPreset('10s');
    } else if (duration === 60) {
      setSelectedPreset('1m');
    } else if (duration === 3600) {
      setSelectedPreset('1h');
    } else if (duration === 86400) {
      setSelectedPreset('1d');
    } else {
      setSelectedPreset('custom');
      // Infer custom unit
      if (duration % 86400 === 0) {
        setCustomValue(duration / 86400);
        setCustomUnit('days');
      } else if (duration % 3600 === 0) {
        setCustomValue(duration / 3600);
        setCustomUnit('hours');
      } else if (duration % 60 === 0) {
        setCustomValue(duration / 60);
        setCustomUnit('minutes');
      } else {
        setCustomValue(duration);
        setCustomUnit('seconds');
      }
    }
  }, [conversation, isOpen]);

  if (!isOpen || !conversation) return null;

  // Calculate duration in seconds based on selection
  const computeDuration = () => {
    if (selectedPreset === 'off') return 0;
    if (selectedPreset === '10s') return 10;
    if (selectedPreset === '1m') return 60;
    if (selectedPreset === '1h') return 3600;
    if (selectedPreset === '1d') return 86400;

    // Custom
    const num = Math.max(1, parseInt(customValue, 10) || 1);
    switch (customUnit) {
      case 'seconds':
        return Math.min(300, Math.max(5, num));
      case 'minutes':
        return Math.min(720, Math.max(1, num)) * 60;
      case 'hours':
        return Math.min(72, Math.max(1, num)) * 3600;
      case 'days':
        return Math.min(90, Math.max(1, num)) * 86400;
      default:
        return num * 60;
    }
  };

  // Human readable label for computed duration
  const getComputedLabel = () => {
    const dur = computeDuration();
    if (dur === 0) return 'Off';
    if (dur < 60) return `${dur} second${dur === 1 ? '' : 's'}`;
    if (dur < 3600) {
      const m = Math.round(dur / 60);
      return `${m} minute${m === 1 ? '' : 's'}`;
    }
    if (dur < 86400) {
      const h = Math.round(dur / 3600);
      return `${h} hour${h === 1 ? '' : 's'}`;
    }
    const d = Math.round(dur / 86400);
    return `${d} day${d === 1 ? '' : 's'}`;
  };

  const getComputedUnitTag = () => {
    const dur = computeDuration();
    if (dur === 0) return 'off';
    if (dur === 10) return '10s';
    if (dur === 60) return '1m';
    if (dur === 3600) return '1h';
    if (dur === 86400) return '1d';
    if (dur < 60) return `${dur}s`;
    if (dur < 3600) return `${Math.round(dur / 60)}m`;
    if (dur < 86400) return `${Math.round(dur / 3600)}h`;
    return `${Math.round(dur / 86400)}d`;
  };

  const handleApply = async () => {
    try {
      setSaving(true);
      const duration = computeDuration();
      const unit = getComputedUnitTag();

      await updateDisappearingSettings(conversation.id, {
        duration,
        unit,
        adminOnly
      });

      showToast(
        duration > 0
          ? `Disappearing messages set to ${getComputedLabel()}`
          : 'Disappearing messages turned off'
      );
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800/70 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Disappearing Messages</h3>
              <p className="text-xs text-zinc-400">Set automatic expiration timer for messages</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Information Card */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex items-start gap-3 text-xs text-zinc-300 leading-relaxed">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-100">How it works: </span>
              When enabled, new messages sent in this chat will automatically disappear for everyone after the chosen timer.
              Existing messages will not be affected.
            </div>
          </div>

          {/* Preset Options Grid */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2.5">
              Timer Presets
            </label>
            <div className="space-y-2">
              {PRESETS.map((p) => {
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPreset(p.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-xs'
                        : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400 text-zinc-950 font-bold'
                            : 'border-zinc-600 group-hover:border-zinc-500'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                          <span>{p.label}</span>
                          {isSelected && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">{p.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Timer Controls (Shown when 'custom' is selected) */}
          {selectedPreset === 'custom' && (
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Custom Timer Builder
                </span>
                <span className="text-xs font-semibold text-amber-400">
                  {getComputedLabel()}
                </span>
              </div>

              {/* Number and Unit Inputs */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={customValue}
                  onChange={(e) => setCustomValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-24 px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-center text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition-colors"
                />

                <select
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-amber-500 transition-colors capitalize cursor-pointer"
                >
                  <option value="seconds">Seconds (5s – 300s)</option>
                  <option value="minutes">Minutes (1m – 720m)</option>
                  <option value="hours">Hours (1h – 72h)</option>
                  <option value="days">Days (1d – 90d)</option>
                </select>
              </div>

              {/* Quick Pills */}
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 block mb-2">
                  Quick suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PILLS.map((pill) => (
                    <button
                      key={pill.label}
                      type="button"
                      onClick={() => {
                        setCustomValue(pill.num);
                        setCustomUnit(pill.unit);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Group-specific permissions */}
          {isGroup && (
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Who can modify this timer</h4>
                  <p className="text-[11px] text-zinc-400">Restricts timer changes to group admins & owners</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={adminOnly}
                  onChange={(e) => setAdminOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
              </label>
            </div>
          )}

          {/* Live Preview Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-300/90">
            <Clock className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>
              {computeDuration() > 0 ? (
                <>
                  Messages sent in this chat will disappear after{' '}
                  <strong className="text-amber-300 font-bold">{getComputedLabel()}</strong> once delivered.
                </>
              ) : (
                'Disappearing messages are currently disabled.'
              )}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/30 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Set Timer'}
          </button>
        </div>
      </div>
    </div>
  );
}
