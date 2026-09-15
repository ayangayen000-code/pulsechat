import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Palette,
  Sparkles,
  Upload,
  Layers,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sliders,
  Trash2,
  Edit2,
  Users,
  User,
  Eye,
  ChevronRight,
  ZoomIn,
  Move,
  Loader2,
  Heart,
  Gamepad2,
  TreePine,
  Maximize2
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../layout/Toast';
import ThemeChatPreview from './ThemeChatPreview';

const CATEGORY_ICONS = {
  all: Sparkles,
  minimal: Layers,
  gradient: Palette,
  nature: TreePine,
  romantic: Heart,
  gaming: Gamepad2
};

const DEFAULT_THEME = {
  id: null,
  name: 'Default',
  background_type: 'solid',
  background_value: '#09090b',
  background_image: '',
  background_blur: 0,
  background_brightness: 100,
  background_opacity: 100,
  background_position: 'center',
  background_size: 'cover',
  overlay_color: '#000000',
  overlay_opacity: 0,
  sent_bubble_bg: '#6366f1',
  sent_bubble_text: '#ffffff',
  received_bubble_bg: '#27272a',
  received_bubble_text: '#f4f4f5',
  accent_color: '#6366f1',
  input_bg: '#18181b',
  text_color: '#ffffff',
  is_dark: 1,
  zoom: 1
};

export default function ThemeCustomizerModal({
  isOpen,
  onClose,
  activeChat,
  currentTheme,
  onApplyTheme,
  onResetTheme
}) {
  const { showToast } = useToast();

  // Active modal tab: 'gallery' | 'create' | 'my_themes'
  const [activeTab, setActiveTab] = useState('gallery');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Built-in presets
  const [categories, setCategories] = useState([]);
  const [presets, setPresets] = useState([]);
  const [loadingPresets, setLoadingPresets] = useState(false);

  // User's custom themes
  const [myThemes, setMyThemes] = useState([]);
  const [loadingMyThemes, setLoadingMyThemes] = useState(false);

  // Active draft theme being previewed / edited
  const [previewTheme, setPreviewTheme] = useState(currentTheme || DEFAULT_THEME);

  // Scope: 'only_me' | 'both' | 'group_default'
  const isGroup = activeChat?.type === 'group';
  const isAdminOrOwner = isGroup && (activeChat?.role === 'owner' || activeChat?.role === 'admin');
  const [scope, setScope] = useState('only_me');

  // Create form state
  const [customName, setCustomName] = useState('');
  const [editingThemeId, setEditingThemeId] = useState(null);
  const [isUploadingWallpaper, setIsUploadingWallpaper] = useState(false);
  const [saveToMyThemes, setSaveToMyThemes] = useState(true);

  // Mobile preview toggle
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const fileInputRef = useRef(null);

  // Sync with currentTheme when opening
  useEffect(() => {
    if (isOpen) {
      setPreviewTheme(currentTheme || DEFAULT_THEME);
      setCustomName(currentTheme?.name ? `${currentTheme.name} (Custom)` : 'My Custom Theme');
      loadPresets();
      loadMyThemes();
    }
  }, [isOpen, currentTheme]);

  const loadPresets = async () => {
    try {
      setLoadingPresets(true);
      const data = await api.get('/themes/presets');
      setCategories(data.categories || []);
      setPresets(data.presets || []);
    } catch (err) {
      console.error('Failed to load theme presets:', err);
    } finally {
      setLoadingPresets(false);
    }
  };

  const loadMyThemes = async () => {
    try {
      setLoadingMyThemes(true);
      const data = await api.get('/themes/my');
      setMyThemes(data.themes || []);
    } catch (err) {
      console.error('Failed to load custom themes:', err);
    } finally {
      setLoadingMyThemes(false);
    }
  };

  // Filter presets by category
  const filteredPresets = selectedCategory === 'all'
    ? presets
    : presets.filter(p => p.category === selectedCategory);

  // Select a preset theme
  const handleSelectPreset = (preset) => {
    setPreviewTheme({
      ...preset,
      zoom: 1
    });
    setCustomName(preset.name);
  };

  // Handle image upload from device gallery
  const handleWallpaperUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a JPG, PNG, WEBP, or GIF image.', 'error');
      return;
    }

    try {
      setIsUploadingWallpaper(true);
      const res = await api.uploadFile(file, 'wallpaper');
      setPreviewTheme(prev => ({
        ...prev,
        background_type: 'image',
        background_image: res.url,
        background_blur: prev.background_blur ?? 0,
        background_brightness: prev.background_brightness ?? 90,
        background_opacity: prev.background_opacity ?? 90,
        overlay_color: prev.overlay_color || '#000000',
        overlay_opacity: prev.overlay_opacity ?? 30,
        zoom: 1
      }));
      showToast('Wallpaper image uploaded successfully!');
    } catch (err) {
      showToast('Failed to upload image. Please try again.', 'error');
    } finally {
      setIsUploadingWallpaper(false);
    }
  };

  // Save / Apply Theme
  const handleApply = async () => {
    try {
      let finalThemeId = previewTheme.id;

      // If user is in "create" tab or opted to save custom theme
      if (activeTab === 'create' && saveToMyThemes) {
        const themePayload = {
          ...previewTheme,
          name: customName.trim() || 'My Custom Theme'
        };

        if (editingThemeId) {
          const updated = await api.put(`/themes/my/${editingThemeId}`, themePayload);
          finalThemeId = updated.theme?.id;
          showToast('Custom theme updated in My Themes!');
        } else {
          const created = await api.post('/themes/my', themePayload);
          finalThemeId = created.theme?.id;
          showToast('New theme saved to My Themes!');
        }
        await loadMyThemes();
      }

      await onApplyTheme({
        themeId: finalThemeId,
        themeConfig: {
          ...previewTheme,
          name: customName.trim() || previewTheme.name || 'Custom Theme'
        },
        scope
      });

      showToast(`Applied theme to ${isGroup ? 'group' : 'chat'}!`);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to apply theme', 'error');
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (window.confirm('Reset this conversation back to the default theme?')) {
      try {
        await onResetTheme();
        showToast('Chat theme reset to default.');
        onClose();
      } catch (err) {
        showToast('Failed to reset theme', 'error');
      }
    }
  };

  // Delete custom theme
  const handleDeleteMyTheme = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this theme from My Themes?')) {
      try {
        await api.del(`/themes/my/${id}`);
        setMyThemes(prev => prev.filter(t => t.id !== id));
        showToast('Theme deleted');
      } catch (err) {
        showToast('Failed to delete theme', 'error');
      }
    }
  };

  // Edit custom theme
  const handleEditMyTheme = (theme, e) => {
    e.stopPropagation();
    setPreviewTheme(theme);
    setCustomName(theme.name);
    setEditingThemeId(theme.id);
    setActiveTab('create');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-fade-in">
      {/* Modal Container */}
      <div className="w-full max-w-6xl h-[92vh] max-h-[850px] bg-zinc-950 border border-zinc-800/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-zinc-800/70 bg-zinc-900/40 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/15 text-brand flex items-center justify-center border border-brand/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Customize Chat Theme</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-normal">
                  {activeChat?.title}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Personalize background wallpaper, bubble styles, and colors</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile View Live Preview Toggle Button */}
            <button
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="lg:hidden px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4 text-brand" />
              <span>{showMobilePreview ? 'Controls' : 'Preview'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns on Desktop */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Customizer Controls (Hidden on mobile if showMobilePreview is true) */}
          <div
            className={`flex-1 flex flex-col overflow-y-auto border-r border-zinc-800/70 ${
              showMobilePreview ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Tab Navigation */}
            <div className="p-4 border-b border-zinc-800/60 bg-zinc-900/20 flex items-center justify-between gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800/80">
                <button
                  onClick={() => { setActiveTab('gallery'); setEditingThemeId(null); }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'gallery'
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Theme Gallery</span>
                </button>

                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'create'
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ Create Theme</span>
                </button>

                <button
                  onClick={() => { setActiveTab('my_themes'); setEditingThemeId(null); }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'my_themes'
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>My Themes ({myThemes.length})</span>
                </button>
              </div>

              {/* Reset to Default button */}
              <button
                onClick={handleReset}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Reset conversation theme to default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 p-5 overflow-y-auto space-y-6">
              {/* TAB 1: THEME GALLERY */}
              {activeTab === 'gallery' && (
                <div className="space-y-4">
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => {
                      const Icon = CATEGORY_ICONS[cat.id] || Sparkles;
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold'
                              : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Themes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {filteredPresets.map((preset) => {
                      const isSelected = previewTheme.id === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset)}
                          className={`group relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all p-3 flex flex-col justify-between aspect-4/3 ${
                            isSelected
                              ? 'border-brand ring-2 ring-brand/30 shadow-lg scale-[1.02]'
                              : 'border-zinc-800/80 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900'
                          }`}
                          style={{
                            background: preset.background_type === 'gradient'
                              ? preset.background_value
                              : preset.background_type === 'image'
                              ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${preset.background_image}) center/cover`
                              : preset.background_value
                          }}
                        >
                          {/* Top selection check badge */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-zinc-300 backdrop-blur-xs">
                              {preset.category}
                            </span>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          {/* Message bubble preview preview swatches */}
                          <div className="space-y-1.5 my-2">
                            <div
                              className="w-3/4 h-3.5 rounded-lg rounded-tl-xs shadow-xs"
                              style={{ backgroundColor: preset.received_bubble_bg }}
                            />
                            <div
                              className="w-3/4 h-3.5 rounded-lg rounded-tr-xs ml-auto shadow-xs"
                              style={{ backgroundColor: preset.sent_bubble_bg }}
                            />
                          </div>

                          {/* Theme name footer */}
                          <div className="bg-black/60 backdrop-blur-xs -mx-3 -mb-3 p-2 border-t border-white/10 flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                            <div
                              className="w-3 h-3 rounded-full border border-white/30"
                              style={{ backgroundColor: preset.accent_color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: CREATE / EDIT CUSTOM THEME */}
              {activeTab === 'create' && (
                <div className="space-y-6">
                  {/* Theme Name */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">Theme Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder='e.g. "My Blue", "Us ❤️", "Night Drive"'
                      className="w-full px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 outline-none focus:border-brand transition-colors"
                    />
                  </div>

                  {/* 1. Wallpaper Image Upload & Customization */}
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-brand" />
                        <span className="text-xs font-bold text-white">Chat Wallpaper / Image</span>
                      </div>
                      {previewTheme.background_image && (
                        <button
                          onClick={() => setPreviewTheme(prev => ({ ...prev, background_type: 'solid', background_image: '' }))}
                          className="text-[11px] text-rose-400 hover:text-rose-300"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>

                    {/* Image Upload Area */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${
                        previewTheme.background_image
                          ? 'border-brand/40 bg-brand/5 hover:border-brand'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleWallpaperUpload}
                        disabled={isUploadingWallpaper}
                        className="hidden"
                      />
                      {isUploadingWallpaper ? (
                        <div className="flex flex-col items-center py-2">
                          <Loader2 className="w-6 h-6 animate-spin text-brand mb-2" />
                          <span className="text-xs text-zinc-300 font-medium">Uploading wallpaper...</span>
                        </div>
                      ) : previewTheme.background_image ? (
                        <div className="flex items-center gap-3 w-full">
                          <img
                            src={previewTheme.background_image}
                            alt="Uploaded wallpaper preview"
                            className="w-16 h-12 rounded-xl object-cover border border-zinc-700"
                          />
                          <div className="text-left flex-1 min-w-0">
                            <span className="text-xs font-semibold text-white block truncate">Custom Wallpaper Active</span>
                            <span className="text-[11px] text-zinc-400 block">Click to change or select another photo</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2">
                          <Upload className="w-6 h-6 text-zinc-500 mx-auto mb-1.5" />
                          <span className="text-xs font-semibold text-zinc-300 block">Upload from Device Gallery</span>
                          <span className="text-[11px] text-zinc-500 block mt-0.5">JPG, PNG, WEBP, or GIF (max 50MB)</span>
                        </div>
                      )}
                    </div>

                    {/* Image Adjustments Sliders */}
                    {previewTheme.background_image && (
                      <div className="space-y-3.5 pt-2 border-t border-zinc-800/60">
                        {/* Blur Slider */}
                        <div>
                          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                            <span>Blur</span>
                            <span className="font-mono text-white">{previewTheme.background_blur || 0}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={previewTheme.background_blur || 0}
                            onChange={(e) => setPreviewTheme(prev => ({ ...prev, background_blur: parseInt(e.target.value) }))}
                            className="w-full accent-brand cursor-pointer"
                          />
                        </div>

                        {/* Brightness Slider */}
                        <div>
                          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                            <span>Brightness</span>
                            <span className="font-mono text-white">{previewTheme.background_brightness ?? 100}%</span>
                          </div>
                          <input
                            type="range"
                            min="30"
                            max="150"
                            value={previewTheme.background_brightness ?? 100}
                            onChange={(e) => setPreviewTheme(prev => ({ ...prev, background_brightness: parseInt(e.target.value) }))}
                            className="w-full accent-brand cursor-pointer"
                          />
                        </div>

                        {/* Opacity Slider */}
                        <div>
                          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                            <span>Opacity</span>
                            <span className="font-mono text-white">{previewTheme.background_opacity ?? 100}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={previewTheme.background_opacity ?? 100}
                            onChange={(e) => setPreviewTheme(prev => ({ ...prev, background_opacity: parseInt(e.target.value) }))}
                            className="w-full accent-brand cursor-pointer"
                          />
                        </div>

                        {/* Tint Overlay Color & Intensity */}
                        <div>
                          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                            <span>Overlay Tint Intensity</span>
                            <span className="font-mono text-white">{previewTheme.overlay_opacity ?? 30}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="90"
                            value={previewTheme.overlay_opacity ?? 30}
                            onChange={(e) => setPreviewTheme(prev => ({ ...prev, overlay_opacity: parseInt(e.target.value) }))}
                            className="w-full accent-brand cursor-pointer"
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] text-zinc-400">Tint Color:</span>
                            {['#000000', '#0f172a', '#18181b', '#2e1065', '#022c22', '#4c0519'].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setPreviewTheme(prev => ({ ...prev, overlay_color: c }))}
                                className={`w-6 h-6 rounded-full border ${
                                  previewTheme.overlay_color === c ? 'border-brand ring-2 ring-brand/40' : 'border-zinc-700'
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Crop / Zoom & Position */}
                        <div className="pt-2 border-t border-zinc-800/60">
                          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                            <span className="font-bold text-white">Zoom & Position</span>
                            <button
                              type="button"
                              onClick={() => setPreviewTheme(prev => ({ ...prev, zoom: 1, background_position: 'center', background_size: 'cover' }))}
                              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" /> Reset
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                                <span>Zoom</span>
                                <span className="font-mono">{previewTheme.zoom || 1}x</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={previewTheme.zoom || 1}
                                onChange={(e) => setPreviewTheme(prev => ({ ...prev, zoom: parseFloat(e.target.value) }))}
                                className="w-full accent-brand cursor-pointer"
                              />
                            </div>

                            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                              {['cover', 'contain'].map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setPreviewTheme(prev => ({ ...prev, background_size: s }))}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize ${
                                    previewTheme.background_size === s
                                      ? 'bg-brand text-white'
                                      : 'text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Color Scheme & Bubble Styling */}
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-brand" />
                      <span className="text-xs font-bold text-white">Message Bubbles & Colors</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Sent Bubble Color */}
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Sent Message Bubble</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={previewTheme.sent_bubble_bg || '#6366f1'}
                            onChange={(e) => setPreviewTheme(prev => ({ ...prev, sent_bubble_bg: e.target.value }))}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={previewTheme.sent_bubble_bg || '#6366f1'}
                            onChange={(e) => setPreviewTheme(prev => ({ ...prev, sent_bubble_bg: e.target.value }))}
                            className="flex-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-white outline-none"
                          />
                        </div>
                      </div>

                      {/* Received Bubble Color */}
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Received Message Bubble</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={previewTheme.received_bubble_bg || '#27272a'}
                            onChange={(e) => setPreviewTheme(prev => ({ ...prev, received_bubble_bg: e.target.value }))}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={previewTheme.received_bubble_bg || '#27272a'}
                            onChange={(e) => setPreviewTheme(prev => ({ ...prev, received_bubble_bg: e.target.value }))}
                            className="flex-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-white outline-none"
                          />
                        </div>
                      </div>

                      {/* Accent Color */}
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={previewTheme.accent_color || '#6366f1'}
                            onChange={(e) => setPreviewTheme(prev => ({ ...prev, accent_color: e.target.value }))}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={previewTheme.accent_color || '#6366f1'}
                            onChange={(e) => setPreviewTheme(prev => ({ ...prev, accent_color: e.target.value }))}
                            className="flex-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-white outline-none"
                          />
                        </div>
                      </div>

                      {/* Input Background */}
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Input Box Background</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={previewTheme.input_bg || '#18181b'}
                            onChange={(e) => setPreviewTheme(prev => ({ ...prev, input_bg: e.target.value }))}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={previewTheme.input_bg || '#18181b'}
                            onChange={(e) => setPreviewTheme(prev => ({ ...prev, input_bg: e.target.value }))}
                            className="flex-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save to My Themes Checkbox */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveToMyThemes}
                      onChange={(e) => setSaveToMyThemes(e.target.checked)}
                      className="w-4 h-4 rounded text-brand focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs text-zinc-300 font-medium">
                      Save to <strong>My Themes</strong> library for reuse in other conversations
                    </span>
                  </label>
                </div>
              )}

              {/* TAB 3: MY THEMES */}
              {activeTab === 'my_themes' && (
                <div className="space-y-4">
                  {loadingMyThemes ? (
                    <div className="py-12 text-center text-xs text-zinc-500">Loading custom themes...</div>
                  ) : myThemes.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500">
                      <Layers className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
                      <h4 className="text-sm font-semibold text-zinc-300">No custom themes created yet</h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        Upload a wallpaper or craft custom colors in the "+ Create Theme" tab!
                      </p>
                      <button
                        onClick={() => setActiveTab('create')}
                        className="mt-4 px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold"
                      >
                        + Create First Theme
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {myThemes.map((theme) => {
                        const isSelected = previewTheme.id === theme.id;
                        return (
                          <div
                            key={theme.id}
                            onClick={() => {
                              setPreviewTheme(theme);
                              setCustomName(theme.name);
                            }}
                            className={`group relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all p-3 flex flex-col justify-between aspect-4/3 ${
                              isSelected
                                ? 'border-brand ring-2 ring-brand/30 shadow-lg scale-[1.02]'
                                : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900'
                            }`}
                            style={{
                              background: theme.background_type === 'gradient'
                                ? theme.background_value
                                : theme.background_type === 'image'
                                ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${theme.background_image}) center/cover`
                                : theme.background_value
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-zinc-300">
                                Custom
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleEditMyTheme(theme, e)}
                                  className="p-1 rounded bg-black/60 text-zinc-300 hover:text-white"
                                  title="Edit custom theme"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteMyTheme(theme.id, e)}
                                  className="p-1 rounded bg-black/60 text-rose-400 hover:text-rose-300"
                                  title="Delete custom theme"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Mini swatches */}
                            <div className="space-y-1 my-2">
                              <div
                                className="w-3/4 h-3 rounded-lg shadow-xs"
                                style={{ backgroundColor: theme.received_bubble_bg }}
                              />
                              <div
                                className="w-3/4 h-3 rounded-lg ml-auto shadow-xs"
                                style={{ backgroundColor: theme.sent_bubble_bg }}
                              />
                            </div>

                            <div className="bg-black/60 backdrop-blur-xs -mx-3 -mb-3 p-2 border-t border-white/10 flex items-center justify-between">
                              <span className="text-xs font-bold text-white truncate">{theme.name}</span>
                              <div
                                className="w-3 h-3 rounded-full border border-white/30"
                                style={{ backgroundColor: theme.accent_color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Scope Control Bar ("Share Theme With Friend") */}
            <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40 flex-shrink-0">
              <label className="block text-xs font-bold text-zinc-300 mb-2">
                {isGroup ? 'Theme Visibility / Scope' : 'Share Theme With Friend'}
              </label>

              {!isGroup ? (
                /* 1-to-1 Conversation Scopes */
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScope('only_me')}
                    className={`p-2.5 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                      scope === 'only_me'
                        ? 'bg-brand/15 border-brand text-white shadow-xs'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <User className="w-4 h-4 text-brand flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Only Me</div>
                      <div className="text-[10px] text-zinc-400 leading-tight">Theme visible just on your screen</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope('both')}
                    className={`p-2.5 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                      scope === 'both'
                        ? 'bg-brand/15 border-brand text-white shadow-xs'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Users className="w-4 h-4 text-brand flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Both of Us ❤️</div>
                      <div className="text-[10px] text-zinc-400 leading-tight">Syncs theme with friend in real-time</div>
                    </div>
                  </button>
                </div>
              ) : (
                /* Group Conversation Scopes */
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScope('only_me')}
                    className={`p-2.5 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                      scope === 'only_me'
                        ? 'bg-brand/15 border-brand text-white shadow-xs'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <User className="w-4 h-4 text-brand flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Personal Theme</div>
                      <div className="text-[10px] text-zinc-400 leading-tight">Only you see this theme in group</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={!isAdminOrOwner}
                    onClick={() => setScope('group_default')}
                    className={`p-2.5 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                      scope === 'group_default'
                        ? 'bg-brand/15 border-brand text-white shadow-xs'
                        : !isAdminOrOwner
                        ? 'opacity-40 cursor-not-allowed bg-zinc-900/30 border-zinc-800 text-zinc-500'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Users className="w-4 h-4 text-brand flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Group Default</div>
                      <div className="text-[10px] text-zinc-400 leading-tight">
                        {isAdminOrOwner ? 'Set default for all members' : 'Admins only'}
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Realistic Live Chat Preview (Always visible on desktop, or when toggled on mobile) */}
          <div
            className={`w-full lg:w-[420px] xl:w-[460px] p-5 bg-zinc-900/40 flex flex-col justify-between overflow-hidden ${
              showMobilePreview ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-brand" />
                  <span>Real-time Chat Preview</span>
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {previewTheme.name || 'Untitled'}
                </span>
              </div>

              {/* Realistic Preview Screen */}
              <div className="flex-1 min-h-[360px] rounded-3xl overflow-hidden shadow-2xl">
                <ThemeChatPreview theme={previewTheme} activeChat={activeChat} />
              </div>
            </div>

            {/* Bottom Action Row */}
            <div className="pt-4 border-t border-zinc-800/80 mt-4 flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="flex-2 py-3 rounded-2xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-lg shadow-brand/20 transition-all text-center flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Apply to This Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
