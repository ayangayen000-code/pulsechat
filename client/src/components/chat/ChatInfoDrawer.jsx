import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Users,
  Image,
  FileText,
  UserPlus,
  Shield,
  LogOut,
  BellOff,
  BellRing,
  QrCode,
  Sparkles,
  Trash2,
  Palette,
  Clock
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../layout/Toast';
import QRCodeModal from '../friends/QRCodeModal';

export default function ChatInfoDrawer({ onClose, onOpenTheme, onOpenDisappearing }) {
  const { activeChat, messages, onlineUserIds, refreshChats } = useChat();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('members'); // 'members', 'media', 'files'
  const [groupDetails, setGroupDetails] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addHandle, setAddHandle] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  const isGroup = activeChat?.type === 'group';

  const loadGroupDetails = async () => {
    if (!isGroup || !activeChat) return;
    try {
      const data = await api.get(`/groups/${activeChat.id}`);
      setGroupDetails(data.group);
    } catch (e) {
      console.error('Failed to load group details:', e);
    }
  };

  useEffect(() => {
    loadGroupDetails();
  }, [activeChat?.id, isGroup]);

  if (!activeChat) return null;

  const copyHandle = (handle) => {
    if (handle) {
      navigator.clipboard.writeText(handle);
      showToast(`Copied ${handle} to clipboard!`);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addHandle.trim()) return;
    try {
      await api.post(`/groups/${activeChat.id}/members`, { targetUserId: addHandle.trim() });
      showToast('Member added to group!');
      setAddHandle('');
      setShowAddMember(false);
      loadGroupDetails();
      refreshChats();
    } catch (err) {
      showToast(err.message || 'Failed to add member', 'error');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Remove member from group?')) {
      try {
        await api.del(`/groups/${activeChat.id}/members/${memberId}`);
        showToast('Member removed');
        loadGroupDetails();
        refreshChats();
      } catch (err) {
        showToast(err.message || 'Failed to remove member', 'error');
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await api.post(`/groups/${activeChat.id}/leave`, {});
        showToast('Left group');
        onClose();
        refreshChats();
      } catch (err) {
        showToast(err.message || 'Failed to leave group', 'error');
      }
    }
  };

  // Filter shared media and files from conversation messages
  const mediaMessages = messages.filter((m) => m.type === 'image' || m.type === 'video');
  const fileMessages = messages.filter((m) => m.type === 'file');

  const myRole = groupDetails?.myRole || 'member';
  const isAdminOrOwner = myRole === 'owner' || myRole === 'admin';

  return (
    <aside className="w-full sm:w-80 lg:w-88 h-full bg-zinc-950 border-l border-zinc-800/80 flex flex-col z-30 select-none overflow-y-auto animate-fade-in">
      {/* Top Header */}
      <div className="h-16 px-4 border-b border-zinc-800/60 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Conversation Details</h3>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Card Summary */}
      <div className="p-6 flex flex-col items-center text-center border-b border-zinc-800/60">
        <div className="relative mb-3">
          <img
            src={
              activeChat.avatar ||
              (isGroup
                ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')
            }
            onError={(e) => {
              e.currentTarget.src = isGroup
                ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
            }}
            alt={activeChat.title}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-zinc-800 shadow-xl"
          />
          {!isGroup && activeChat.other_user && onlineUserIds.has(activeChat.other_user.id) && (
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-950" />
          )}
        </div>

        <h4 className="text-base font-bold text-white tracking-tight">{activeChat.title}</h4>

        {!isGroup && activeChat.other_user ? (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-mono text-zinc-400">{activeChat.other_user.user_id}</span>
            <button
              onClick={() => copyHandle(activeChat.other_user.user_id)}
              className="p-1 text-zinc-500 hover:text-white rounded"
              title="Copy User ID"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-zinc-400 mt-1 max-w-xs">{activeChat.description || 'Group conversation'}</p>
        )}

        {/* Action Row */}
        <div className="flex items-center gap-3 mt-4">
          {!isGroup && activeChat.other_user && (
            <button
              onClick={() => setShowQrModal(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-brand" />
              <span>QR Code</span>
            </button>
          )}

          {isGroup && isAdminOrOwner && (
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="px-3 py-1.5 rounded-xl bg-brand/15 hover:bg-brand/25 border border-brand/30 text-brand text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          )}
        </div>

        {/* Customize Theme Quick Button */}
        <button
          onClick={onOpenTheme}
          className="w-full mt-4 px-4 py-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-200 text-xs font-semibold flex items-center justify-between transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-brand/15 text-brand flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <span>Customize Chat Theme</span>
          </div>
          <span className="text-[11px] text-brand font-medium">Change →</span>
        </button>

        {/* Disappearing Messages Quick Button */}
        <button
          onClick={onOpenDisappearing}
          className="w-full mt-2 px-4 py-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-200 text-xs font-semibold flex items-center justify-between transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
              activeChat.disappearing_enabled ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <span>Disappearing Messages</span>
          </div>
          <span className={`text-[11px] font-medium ${
            activeChat.disappearing_enabled ? 'text-amber-400 font-bold' : 'text-zinc-500'
          }`}>
            {activeChat.disappearing_enabled ? (activeChat.disappearing_unit || 'On') : 'Off'} →
          </span>
        </button>
      </div>

      {/* Add Member Form in Group */}
      {showAddMember && isGroup && (
        <form onSubmit={handleAddMember} className="p-4 border-b border-zinc-800/60 bg-zinc-900/50 animate-slide-up">
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Add User by Handle or ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={addHandle}
              onChange={(e) => setAddHandle(e.target.value)}
              placeholder="@username"
              className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center justify-around border-b border-zinc-800/60 text-xs font-semibold px-2 py-1">
        {isGroup && (
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'members' ? 'border-brand text-brand' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Members ({groupDetails?.members?.length || 0})
          </button>
        )}
        <button
          onClick={() => setActiveTab('media')}
          className={`py-2 px-3 border-b-2 transition-colors ${
            activeTab === 'media' ? 'border-brand text-brand' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Media ({mediaMessages.length})
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`py-2 px-3 border-b-2 transition-colors ${
            activeTab === 'files' ? 'border-brand text-brand' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Files ({fileMessages.length})
        </button>
      </div>

      {/* Content by Sub Tab */}
      <div className="p-4 flex-1">
        {/* Group Members Tab */}
        {isGroup && activeTab === 'members' && (
          <div className="space-y-2">
            {groupDetails?.members?.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex items-center gap-2.5 truncate">
                  <img
                    src={m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={m.username}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                    }}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-zinc-200 truncate">{m.username}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{m.user_id}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {m.role === 'owner' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Owner
                    </span>
                  )}
                  {m.role === 'admin' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand/20 text-brand border border-brand/30">
                      Admin
                    </span>
                  )}
                  {isAdminOrOwner && m.role !== 'owner' && m.id !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                      title="Remove from group"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={handleLeaveGroup}
              className="w-full mt-6 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 border border-rose-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Group</span>
            </button>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div>
            {mediaMessages.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">No shared media yet.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {mediaMessages.map((m) => (
                  <div key={m.id} className="aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                    <img src={m.content} alt="Media" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="space-y-2">
            {fileMessages.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">No shared files yet.</p>
            ) : (
              fileMessages.map((m) => (
                <a
                  key={m.id}
                  href={m.content}
                  download
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 text-xs truncate transition-colors"
                >
                  <FileText className="w-4 h-4 text-brand flex-shrink-0" />
                  <span className="truncate">{m.metadata?.filename || 'Document'}</span>
                </a>
              ))
            )}
          </div>
        )}
      </div>

      {showQrModal && activeChat?.other_user && (
        <QRCodeModal
          userId={activeChat.other_user.user_id}
          username={activeChat.other_user.username}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </aside>
  );
}
