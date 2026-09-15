import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, MessageCircle, Users, Sparkles, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from './Toast';
import SidebarNav from './SidebarNav';
import MobileBottomNav from './MobileBottomNav';
import ChatList from '../chat/ChatList';
import ChatHeader from '../chat/ChatHeader';
import MessageList from '../chat/MessageList';
import MessageComposer from '../chat/MessageComposer';
import ChatInfoDrawer from '../chat/ChatInfoDrawer';
import FriendsPage from '../friends/FriendsPage';
import NotificationCenter from '../notifications/NotificationCenter';
import ProfilePage from '../profile/ProfilePage';
import SettingsPage from '../settings/SettingsPage';
import CreateGroupModal from '../groups/CreateGroupModal';
import ThemeCustomizerModal from '../theme/ThemeCustomizerModal';
import DisappearingSettingsModal from '../chat/DisappearingSettingsModal';
import ViewOnceModal from '../media/ViewOnceModal';
import StickerStoreModal from '../stickers/StickerStoreModal';
import StickerPackDetailModal from '../stickers/StickerPackDetailModal';

// Advanced Message Actions components
import ForwardMessageModal from '../chat/ForwardMessageModal';
import DeleteMessageModal from '../chat/DeleteMessageModal';
import MessageActionsBottomSheet from '../chat/MessageActionsBottomSheet';
import SavedMessagesModal from '../chat/SavedMessagesModal';
import ReactionDetailsModal from '../chat/ReactionDetailsModal';
import ChatSearchBar from '../chat/ChatSearchBar';
import { jumpToMessage } from '../chat/PinnedMessagesBanner';
import InstallAppBanner from './InstallAppBanner';

export default function AppShell() {
  const { user } = useAuth();
  const {
    activeChatId,
    setActiveChatId,
    activeChat,
    activeTheme,
    setConversationTheme,
    resetConversationTheme,
    selectedMessageIds,
    toggleSelectMessage,
    saveMessage,
    unsaveMessage,
    pinMessage,
    unpinMessage
  } = useChat();
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState('chats'); // 'chats', 'friends', 'notifications', 'profile', 'settings'
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [activeViewOnceMessage, setActiveViewOnceMessage] = useState(null);
  const [showStickerStore, setShowStickerStore] = useState(false);
  const [selectedPackForPreview, setSelectedPackForPreview] = useState(null);

  // In-chat search bar
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Advanced Message Action modals & sheets
  const [forwardModalData, setForwardModalData] = useState({ isOpen: false, messageIds: [] });
  const [deleteModalData, setDeleteModalData] = useState({ isOpen: false, message: null, messageIds: [] });
  const [actionsSheetMessage, setActionsSheetMessage] = useState(null);
  const [reactionsModalMessage, setReactionsModalMessage] = useState(null);
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Replying & Editing message state
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  // Handle deep links from URL hash or query params
  useEffect(() => {
    const handleDeepLink = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#message-')) {
        const msgId = hash.replace('#message-', '');
        setTimeout(() => {
          jumpToMessage(msgId);
        }, 500);
      }
    };

    handleDeepLink();
    window.addEventListener('hashchange', handleDeepLink);
    return () => window.removeEventListener('hashchange', handleDeepLink);
  }, [activeChatId]);

  const handleSelectTab = (tab) => {
    if (tab === 'stickers') {
      setShowStickerStore(true);
      return;
    }
    if (tab === 'saved') {
      setShowSavedModal(true);
      return;
    }
    setCurrentTab(tab);
  };

  const handleOpenChatFromOtherTab = (convId) => {
    setActiveChatId(convId);
    setCurrentTab('chats');
  };

  // Action handlers
  const handleForwardSingle = (message) => {
    setForwardModalData({ isOpen: true, messageIds: [message.id] });
  };

  const handleForwardSelected = () => {
    if (selectedMessageIds.size > 0) {
      setForwardModalData({ isOpen: true, messageIds: Array.from(selectedMessageIds) });
    }
  };

  const handleDeleteSingle = (message) => {
    setDeleteModalData({ isOpen: true, message, messageIds: [] });
  };

  const handleDeleteSelected = () => {
    if (selectedMessageIds.size > 0) {
      setDeleteModalData({ isOpen: true, message: null, messageIds: Array.from(selectedMessageIds) });
    }
  };

  const handleCopyLink = (message) => {
    const url = `${window.location.origin}${window.location.pathname}#message-${message.id}`;
    navigator.clipboard.writeText(url);
    showToast('Message link copied to clipboard');
  };

  const handleToggleSave = async (message) => {
    try {
      if (message.is_saved) {
        await unsaveMessage(message.id);
        showToast('Message removed from Saved');
      } else {
        await saveMessage(message.id);
        showToast('Message saved');
      }
    } catch (err) {
      showToast('Failed to update saved message', 'error');
    }
  };

  const handleTogglePin = async (message) => {
    try {
      if (message.is_pinned) {
        await unpinMessage(message.id);
        showToast('Message unpinned');
      } else {
        await pinMessage(message.id);
        showToast('Message pinned to top');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update pin', 'error');
    }
  };

  return (
    <div className="h-screen w-screen bg-zinc-950 flex overflow-hidden select-none">
      {/* 1. Desktop Left Navigation Rail (Hidden on Mobile) */}
      <div className="hidden md:flex flex-shrink-0 h-full">
        <SidebarNav currentTab={currentTab} onSelectTab={handleSelectTab} />
      </div>

      {/* 2. Main Middle Area */}
      <div className="flex-1 h-full flex overflow-hidden relative">
        {/* TAB 1: CHATS */}
        {currentTab === 'chats' && (
          <>
            {/* Desktop / Tablet ChatList Sidebar OR Mobile ChatList when no active chat */}
            <div
              className={`h-full ${
                activeChatId ? 'hidden md:flex' : 'flex w-full'
              }`}
            >
              <ChatList
                onOpenNewGroup={() => setShowCreateGroup(true)}
                onOpenFriends={() => setCurrentTab('friends')}
                onOpenStickerStore={() => setShowStickerStore(true)}
              />
            </div>

            {/* Active Conversation View */}
            <div
              className={`flex-1 h-full flex flex-col bg-zinc-950/40 relative overflow-hidden ${
                activeChatId ? 'flex w-full' : 'hidden md:flex'
              }`}
              style={{
                ...(activeTheme?.background_type === 'gradient' && activeTheme?.background_value
                  ? { backgroundImage: activeTheme.background_value }
                  : activeTheme?.background_value
                  ? { backgroundColor: activeTheme.background_value }
                  : {})
              }}
            >
              {/* Wallpaper Layer */}
              {activeTheme?.background_type === 'image' && activeTheme?.background_image && (
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300 z-0 origin-center"
                  style={{
                    backgroundImage: `url(${activeTheme.background_image})`,
                    backgroundPosition: activeTheme.background_position || 'center',
                    backgroundSize: activeTheme.background_size || 'cover',
                    backgroundRepeat: 'no-repeat',
                    filter: `blur(${activeTheme.background_blur || 0}px) brightness(${activeTheme.background_brightness ?? 100}%)`,
                    opacity: (activeTheme.background_opacity ?? 100) / 100,
                    transform: `scale(${activeTheme.zoom || 1})`
                  }}
                />
              )}

              {/* Tint Overlay Layer */}
              {activeTheme?.overlay_opacity > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300 z-0"
                  style={{
                    backgroundColor: activeTheme.overlay_color || '#000000',
                    opacity: (activeTheme.overlay_opacity ?? 0) / 100
                  }}
                />
              )}

              {activeChatId ? (
                <>
                  <ChatHeader
                    onBack={() => setActiveChatId(null)}
                    onToggleInfo={() => setIsInfoOpen(!isInfoOpen)}
                    isInfoOpen={isInfoOpen}
                    onOpenTheme={() => setShowThemeModal(true)}
                    onOpenDisappearing={() => setShowDisappearingModal(true)}
                    onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
                    onForwardSelected={handleForwardSelected}
                    onDeleteSelected={handleDeleteSelected}
                  />

                  {/* In-Chat Search Bar */}
                  <ChatSearchBar
                    isOpen={isSearchOpen}
                    onClose={() => setIsSearchOpen(false)}
                  />

                  <MessageList
                    onReply={(m) => setReplyingTo(m)}
                    onEdit={(m) => setEditingMessage(m)}
                    onForward={handleForwardSingle}
                    onDeleteRequest={handleDeleteSingle}
                    onOpenMoreActions={(m) => setActionsSheetMessage(m)}
                    onViewReactions={(m) => setReactionsModalMessage(m)}
                    onOpenViewOnce={(m) => setActiveViewOnceMessage(m)}
                    onOpenStickerPack={(pId) => setSelectedPackForPreview(pId)}
                  />

                  <MessageComposer
                    replyingTo={replyingTo}
                    onCancelReply={() => setReplyingTo(null)}
                    editingMessage={editingMessage}
                    onCancelEdit={() => setEditingMessage(null)}
                  />
                </>
              ) : (
                /* Desktop Empty State when no conversation is selected */
                <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center select-none text-zinc-500 z-10">
                  <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-brand mb-4 shadow-glow shadow-brand/10">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Your Messages</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 max-w-sm leading-relaxed">
                    Select an active conversation or find your friends using their unique User ID to begin chatting.
                  </p>
                  <button
                    onClick={() => setCurrentTab('friends')}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-glow shadow-brand/20 transition-all flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Find Friends</span>
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Collapsible Right Info Drawer */}
            {activeChatId && isInfoOpen && (
              <ChatInfoDrawer
                onClose={() => setIsInfoOpen(false)}
                onOpenTheme={() => setShowThemeModal(true)}
                onOpenDisappearing={() => setShowDisappearingModal(true)}
              />
            )}
          </>
        )}

        {/* TAB 2: FRIENDS */}
        {currentTab === 'friends' && (
          <FriendsPage onOpenChat={handleOpenChatFromOtherTab} />
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {currentTab === 'notifications' && (
          <NotificationCenter
            onOpenChat={handleOpenChatFromOtherTab}
            onOpenFriends={() => setCurrentTab('friends')}
          />
        )}

        {/* TAB 4: PROFILE */}
        {currentTab === 'profile' && (
          <ProfilePage onOpenSettings={() => setCurrentTab('settings')} />
        )}

        {/* TAB 5: SETTINGS */}
        {currentTab === 'settings' && <SettingsPage />}
      </div>

      {/* 3. Mobile Sticky Bottom Navigation (Hidden on desktop & hidden when inside active chat) */}
      {!activeChatId && (
        <MobileBottomNav currentTab={currentTab} onSelectTab={handleSelectTab} />
      )}

      {/* Modals */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreated={(convId) => {
            setActiveChatId(convId);
            setCurrentTab('chats');
          }}
        />
      )}

      {showThemeModal && (
        <ThemeCustomizerModal
          isOpen={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          activeChat={activeChat}
          currentTheme={activeTheme}
          onApplyTheme={setConversationTheme}
          onResetTheme={resetConversationTheme}
        />
      )}

      {showDisappearingModal && (
        <DisappearingSettingsModal
          isOpen={showDisappearingModal}
          onClose={() => setShowDisappearingModal(false)}
          conversation={activeChat}
        />
      )}

      {activeViewOnceMessage && (
        <ViewOnceModal
          isOpen={!!activeViewOnceMessage}
          onClose={() => setActiveViewOnceMessage(null)}
          message={activeViewOnceMessage}
        />
      )}

      {showStickerStore && (
        <StickerStoreModal
          isOpen={showStickerStore}
          onClose={() => setShowStickerStore(false)}
        />
      )}

      {selectedPackForPreview && (
        <StickerPackDetailModal
          packId={selectedPackForPreview}
          isOpen={!!selectedPackForPreview}
          onClose={() => setSelectedPackForPreview(null)}
        />
      )}

      {/* Advanced Message Action Modals */}
      {forwardModalData.isOpen && (
        <ForwardMessageModal
          isOpen={forwardModalData.isOpen}
          onClose={() => setForwardModalData({ isOpen: false, messageIds: [] })}
          messageIds={forwardModalData.messageIds}
        />
      )}

      {deleteModalData.isOpen && (
        <DeleteMessageModal
          isOpen={deleteModalData.isOpen}
          onClose={() => setDeleteModalData({ isOpen: false, message: null, messageIds: [] })}
          message={deleteModalData.message}
          messageIds={deleteModalData.messageIds}
        />
      )}

      {actionsSheetMessage && (
        <MessageActionsBottomSheet
          message={actionsSheetMessage}
          isOpen={!!actionsSheetMessage}
          onClose={() => setActionsSheetMessage(null)}
          onReply={(m) => setReplyingTo(m)}
          onForward={handleForwardSingle}
          onCopy={(m) => {
            if (m.content) {
              navigator.clipboard.writeText(m.content);
              showToast('Message copied to clipboard');
            }
          }}
          onCopyLink={handleCopyLink}
          onEdit={(m) => setEditingMessage(m)}
          onDelete={handleDeleteSingle}
          onToggleSave={handleToggleSave}
          onTogglePin={handleTogglePin}
          onViewReactions={(m) => setReactionsModalMessage(m)}
          onSelect={(m) => toggleSelectMessage(m.id)}
        />
      )}

      {reactionsModalMessage && (
        <ReactionDetailsModal
          message={reactionsModalMessage}
          isOpen={!!reactionsModalMessage}
          onClose={() => setReactionsModalMessage(null)}
        />
      )}

      {showSavedModal && (
        <SavedMessagesModal
          isOpen={showSavedModal}
          onClose={() => setShowSavedModal(false)}
          onForwardMessage={(msgId) => setForwardModalData({ isOpen: true, messageIds: [msgId] })}
        />
      )}

      {/* In-app install banner */}
      <InstallAppBanner />
    </div>
  );
}
