import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Smile,
  Sticker,
  Mic,
  Send,
  Image,
  Video,
  FileText,
  Music,
  X,
  Square,
  Trash2,
  Loader2,
  Check
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../layout/Toast';
import { api } from '../../services/api';
import EmojiPicker from './EmojiPicker';
import StickerPicker from '../stickers/StickerPicker';

export default function MessageComposer({ replyingTo, onCancelReply, editingMessage, onCancelEdit }) {
  const { sendMessage, editMessage, sendTyping, activeTheme } = useChat();
  const { settings } = useAuth();
  const { showToast } = useToast();

  const [text, setText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  // File upload state
  const [pendingFiles, setPendingFiles] = useState([]); // [{ file, preview, type, name }]
  const [isUploading, setIsUploading] = useState(false);
  const [isViewOnce, setIsViewOnce] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const docInputRef = useRef(null);

  // Set editing text if editing
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content || '');
      if (textareaRef.current) textareaRef.current.focus();
    }
  }, [editingMessage]);

  // Handle typing indicator debounce
  const typingTimerRef = useRef(null);
  const handleTextChange = (e) => {
    setText(e.target.value);
    sendTyping(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  };

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        if (recordingDuration >= 1) {
          // Send voice note
          try {
            setIsUploading(true);
            const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
            const uploadRes = await api.uploadFile(audioFile, 'audio');

            // Generate synthetic waveform heights for visual fidelity
            const sampleWaveforms = Array.from({ length: 24 }, () => Math.floor(Math.random() * 70) + 25);

            await sendMessage({
              type: 'voice',
              content: uploadRes.url,
              metadata: {
                duration: recordingDuration,
                waveforms: sampleWaveforms,
                filename: 'Voice message'
              },
              reply_to_id: replyingTo?.id || null
            });

            if (onCancelReply) onCancelReply();
          } catch (err) {
            showToast('Failed to send voice recording', 'error');
          } finally {
            setIsUploading(false);
          }
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or unsupported:', err);
      // Create simulated high-fidelity voice note demo if mic permission is rejected
      showToast('Microphone not available, sending demo audio note', 'info');
      const sampleWaveforms = [30, 50, 80, 60, 95, 70, 40, 60, 85, 90, 65, 45, 30, 60, 80, 50, 35];
      await sendMessage({
        type: 'voice',
        content: '/uploads/audio/voice_sample.mp3',
        metadata: {
          duration: 5.2,
          waveforms: sampleWaveforms,
          filename: 'Voice message'
        },
        reply_to_id: replyingTo?.id || null
      });
      if (onCancelReply) onCancelReply();
    }
  };

  const stopRecordingAndSend = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(recordingTimerRef.current);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(recordingTimerRef.current);
      audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  // Handle file select
  const handleFilesAdded = (files, type) => {
    const newItems = Array.from(files).map((f) => ({
      file: f,
      name: f.name,
      type,
      preview: type === 'image' ? URL.createObjectURL(f) : null
    }));
    setPendingFiles((prev) => [...prev, ...newItems]);
    setShowAttachments(false);
  };

  const removePendingFile = (idx) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit message
  const handleSend = async () => {
    if (editingMessage) {
      if (!text.trim()) return;
      await editMessage(editingMessage.id, text.trim());
      setText('');
      if (onCancelEdit) onCancelEdit();
      return;
    }

    // Handle file upload if files are queued
    if (pendingFiles.length > 0) {
      try {
        setIsUploading(true);
        const images = pendingFiles.filter((f) => f.type === 'image');
        const others = pendingFiles.filter((f) => f.type !== 'image');

        // Multi-image upload
        if (images.length > 0) {
          const filesToUpload = images.map((i) => i.file);
          const uploadRes = await api.uploadMultiple(filesToUpload);
          const uploadedImages = uploadRes.files.map((f) => ({ url: f.url, name: f.originalName }));

          await sendMessage({
            type: 'image',
            content: uploadedImages[0].url,
            metadata: {
              images: uploadedImages,
              count: uploadedImages.length
            },
            reply_to_id: replyingTo?.id || null,
            view_once: isViewOnce
          });
        }

        // Other individual files (videos, audio, docs)
        for (const item of others) {
          const res = await api.uploadFile(item.file, item.type);
          await sendMessage({
            type: item.type,
            content: res.url,
            metadata: {
              filename: res.originalName,
              filesize: res.formattedSize,
              mimeType: res.mimeType
            },
            reply_to_id: replyingTo?.id || null,
            view_once: isViewOnce && (item.type === 'video' || item.type === 'audio')
          });
        }

        setPendingFiles([]);
        setIsViewOnce(false);
      } catch (err) {
        showToast('Failed to upload files', 'error');
      } finally {
        setIsUploading(false);
      }
    }

    // Handle text send
    if (text.trim()) {
      const msgContent = text.trim();
      setText('');
      sendTyping(false);

      await sendMessage({
        type: 'text',
        content: msgContent,
        reply_to_id: replyingTo?.id || null
      });
    }

    if (onCancelReply) onCancelReply();
  };

  const handleKeyDown = (e) => {
    const enterToSend = settings?.enter_to_send !== false;
    if (enterToSend && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSendSticker = async (stickerData) => {
    setShowStickerPicker(false);
    await sendMessage({
      type: 'sticker',
      content: stickerData.sticker_url,
      metadata: stickerData,
      reply_to_id: replyingTo?.id || null
    });
    if (stickerData.id) {
      try {
        api.post('/stickers/recent', { stickerId: stickerData.id });
      } catch (e) {}
    }
    if (onCancelReply) onCancelReply();
  };

  const handleSelectEmoji = (emoji) => {
    setText((prev) => prev + emoji);
  };

  const formatSecs = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="relative border-t border-zinc-800/80 bg-zinc-950 px-3 sm:px-4 py-3 select-none">
      {/* Replying Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between p-2.5 mb-2 rounded-2xl bg-zinc-900 border border-zinc-800 animate-slide-up text-xs">
          <div className="flex items-center gap-2 truncate text-zinc-300">
            <span className="font-semibold text-brand">Replying to {replyingTo.sender_name}:</span>
            <span className="truncate text-zinc-400">{replyingTo.content || `[${replyingTo.type}]`}</span>
          </div>
          <button onClick={onCancelReply} className="text-zinc-500 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editing Banner */}
      {editingMessage && (
        <div className="flex items-center justify-between p-2.5 mb-2 rounded-2xl bg-zinc-900 border border-zinc-800 animate-slide-up text-xs">
          <span className="font-semibold text-brand">Editing message</span>
          <button onClick={onCancelEdit} className="text-zinc-500 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pending Files Queue Preview */}
      {pendingFiles.length > 0 && (
        <div className="flex items-center gap-2 mb-2.5 overflow-x-auto pb-1 animate-fade-in">
          {/* View Once Toggle Button for Media */}
          {pendingFiles.some((f) => f.type === 'image' || f.type === 'video' || f.type === 'audio') && (
            <button
              type="button"
              onClick={() => setIsViewOnce(!isViewOnce)}
              className={`px-3 py-1.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0 select-none ${
                isViewOnce
                  ? 'bg-amber-500 border-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-500/25 ring-2 ring-amber-400/40'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
              title="View Once: Recipient can only open media once before access is destroyed"
            >
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                isViewOnce ? 'border-zinc-950 text-zinc-950 font-black' : 'border-current text-zinc-400'
              }`}>
                1
              </div>
              <span>View Once {isViewOnce ? 'On' : 'Off'}</span>
            </button>
          )}

          {pendingFiles.map((item, idx) => (
            <div key={idx} className="relative rounded-2xl bg-zinc-900 border border-zinc-800 p-2 flex items-center gap-2 flex-shrink-0 max-w-xs">
              {item.preview ? (
                <img src={item.preview} alt="preview" className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-brand">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <span className="text-xs truncate max-w-[120px] text-zinc-200">{item.name}</span>
              <button
                onClick={() => removePendingFile(idx)}
                className="text-zinc-500 hover:text-rose-400 p-1 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Composer Row */}
      {isRecording ? (
        /* Voice Recording Active UI */
        <div className="flex items-center justify-between gap-3 h-12 px-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-semibold font-mono tracking-wider">
              {formatSecs(recordingDuration)}
            </span>
            <span className="text-xs text-zinc-400 hidden sm:inline ml-2">Recording audio note...</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
              title="Cancel recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={stopRecordingAndSend}
              className="px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-subtle transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          {/* Attachment Button & Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowAttachments(!showAttachments);
                setShowEmojiPicker(false);
                setShowStickerPicker(false);
              }}
              className={`p-2.5 rounded-2xl transition-all ${
                showAttachments
                  ? 'bg-brand text-white shadow-subtle'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
              }`}
              title="Attach media"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Attachment Dropdown */}
            {showAttachments && (
              <div className="absolute bottom-full mb-3 left-0 w-48 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 flex flex-col gap-1 z-40 animate-slide-up">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-zinc-800 text-xs font-medium text-zinc-200 transition-colors"
                >
                  <Image className="w-4 h-4 text-emerald-400" />
                  <span>Photos & Images</span>
                </button>
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-zinc-800 text-xs font-medium text-zinc-200 transition-colors"
                >
                  <Video className="w-4 h-4 text-purple-400" />
                  <span>Video Clip</span>
                </button>
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-zinc-800 text-xs font-medium text-zinc-200 transition-colors"
                >
                  <Music className="w-4 h-4 text-amber-400" />
                  <span>Audio File</span>
                </button>
                <button
                  onClick={() => docInputRef.current?.click()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-zinc-800 text-xs font-medium text-zinc-200 transition-colors"
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Document / File</span>
                </button>
              </div>
            )}
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFilesAdded(e.target.files, 'image')}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => handleFilesAdded(e.target.files, 'video')}
            className="hidden"
          />
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={(e) => handleFilesAdded(e.target.files, 'audio')}
            className="hidden"
          />
          <input
            ref={docInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.csv"
            onChange={(e) => handleFilesAdded(e.target.files, 'file')}
            className="hidden"
          />

          {/* Message Input Box */}
          <div
            className={`flex-1 min-h-[44px] rounded-2xl border px-3.5 py-2 flex items-center gap-2 transition-all ${
              !activeTheme ? 'bg-zinc-900 border-zinc-800 focus-within:border-brand/80 focus-within:ring-1 focus-within:ring-brand/40' : ''
            }`}
            style={
              activeTheme
                ? {
                    backgroundColor: activeTheme.input_bg || '#18181b',
                    borderColor: 'rgba(255,255,255,0.12)'
                  }
                : undefined
            }
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a message..."
              className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 resize-none outline-none max-h-28 overflow-y-auto leading-relaxed"
            />

            {/* Emoji Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowStickerPicker(false);
                  setShowAttachments(false);
                }}
                className={`p-1 text-zinc-400 hover:text-white transition-colors ${
                  showEmojiPicker ? 'text-brand' : ''
                }`}
                title="Emojis"
              >
                <Smile className="w-5 h-5" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full mb-3 right-0 z-50">
                  <EmojiPicker
                    onSelectEmoji={handleSelectEmoji}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              )}
            </div>

            {/* Sticker Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowStickerPicker(!showStickerPicker);
                  setShowEmojiPicker(false);
                  setShowAttachments(false);
                }}
                className={`p-1 text-zinc-400 hover:text-white transition-colors ${
                  showStickerPicker ? 'text-brand' : ''
                }`}
                title="Custom Stickers"
              >
                <Sticker className="w-5 h-5" />
              </button>

              {showStickerPicker && (
                <div className="fixed sm:absolute bottom-16 sm:bottom-full mb-3 right-2 sm:right-0 z-50">
                  <StickerPicker
                    onSelectSticker={handleSendSticker}
                    onClose={() => setShowStickerPicker(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Voice Note or Send Button */}
          {text.trim() || pendingFiles.length > 0 || editingMessage ? (
            <button
              type="button"
              onClick={handleSend}
              disabled={isUploading}
              className={`w-11 h-11 rounded-2xl text-white flex items-center justify-center shadow-glow active:scale-95 transition-all disabled:opacity-50 flex-shrink-0 ${
                !activeTheme ? 'bg-brand hover:bg-brand-hover shadow-brand/20' : ''
              }`}
              style={
                activeTheme
                  ? { backgroundColor: activeTheme.accent_color || activeTheme.sent_bubble_bg || '#6366f1' }
                  : undefined
              }
              title="Send message"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="w-11 h-11 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center active:scale-95 transition-all flex-shrink-0"
              title="Record voice note"
            >
              <Mic
                className="w-5 h-5"
                style={{ color: activeTheme?.accent_color || undefined }}
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
