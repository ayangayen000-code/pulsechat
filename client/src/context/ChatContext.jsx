import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { soundService } from '../services/sound';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user, settings, setUnreadNotificationsCount } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [savedMessages, setSavedMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({}); // { [convId]: Set of usernames }
  const [activeTheme, setActiveTheme] = useState(null);
  const [conversationThemes, setConversationThemes] = useState({});

  // Message Multi-Selection Mode
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState(new Set());

  const activeChatIdRef = useRef(activeChatId);
  activeChatIdRef.current = activeChatId;

  const loadChats = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingChats(true);
      const data = await api.get('/chats');
      setChats(data.chats || []);
    } catch (err) {
      console.error('Failed to load chats:', err);
    } finally {
      setLoadingChats(false);
    }
  }, [user]);

  const loadMessages = useCallback(async (convId) => {
    if (!convId) {
      setMessages([]);
      setPinnedMessages([]);
      return;
    }
    try {
      setLoadingMessages(true);
      const data = await api.get(`/chats/${convId}/messages`);
      const now = new Date().toISOString();
      const validMessages = (data.messages || []).filter(m => !m.expires_at || m.expires_at > now);
      setMessages(validMessages);
      setPinnedMessages(data.pinned_messages || []);

      // Decrement unread on the chat item locally
      setChats(prev => prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c));
    } catch (err) {
      console.error('Failed to load messages for conversation:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const loadSavedMessages = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.get('/messages/saved');
      setSavedMessages(data.saved_messages || []);
    } catch (err) {
      console.error('Failed to load saved messages:', err);
    }
  }, [user]);

  const expireMessageLocally = useCallback((messageId) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  // Initial chats load when user authenticates
  useEffect(() => {
    if (user) {
      loadChats();
    } else {
      setChats([]);
      setActiveChatId(null);
      setMessages([]);
    }
  }, [user, loadChats]);

  const loadTheme = useCallback(async (convId) => {
    if (!convId) {
      setActiveTheme(null);
      return;
    }
    try {
      const data = await api.get(`/themes/conversation/${convId}`);
      setActiveTheme(data.theme || null);
      setConversationThemes(prev => ({ ...prev, [convId]: data.theme || null }));
    } catch (err) {
      console.error('Failed to load conversation theme:', err);
    }
  }, []);

  // When activeChatId changes, join socket room and load messages & theme
  useEffect(() => {
    const socket = getSocket();
    if (activeChatId) {
      loadMessages(activeChatId);
      loadTheme(activeChatId);
      if (socket && socket.connected) {
        socket.emit('join_conversation', activeChatId);
      }
    } else {
      setActiveTheme(null);
    }

    return () => {
      if (activeChatId && socket && socket.connected) {
        socket.emit('leave_conversation', activeChatId);
      }
    };
  }, [activeChatId, loadMessages, loadTheme]);

  // Setup Socket.io real-time listeners
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    const handleOnlineUsers = (userIds) => {
      setOnlineUserIds(new Set(userIds));
    };

    const handlePresenceChange = ({ userId, status }) => {
      setOnlineUserIds(prev => {
        const next = new Set(prev);
        if (status === 'online') next.add(userId);
        else next.delete(userId);
        return next;
      });

      // Update in chats list other_user if applicable
      setChats(prev => prev.map(c => {
        if (c.other_user && c.other_user.id === userId) {
          return {
            ...c,
            other_user: { ...c.other_user, status }
          };
        }
        return c;
      }));
    };

    const handleNewMessage = (newMsg) => {
      const isCurrentChat = activeChatIdRef.current === newMsg.conversation_id;
      const isFromMe = newMsg.sender_id === user.id;

      if (isCurrentChat) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }

      // Play sound
      const soundEnabled = settings?.sound_enabled !== false;
      if (isFromMe) {
        soundService.playMessageSent(soundEnabled);
      } else {
        soundService.playMessageReceived(soundEnabled);
      }

      // Update chats list item
      setChats(prev => {
        const index = prev.findIndex(c => c.id === newMsg.conversation_id);
        if (index === -1) {
          // New conversation, trigger full refresh
          loadChats();
          return prev;
        }

        const chat = prev[index];
        const updatedChat = {
          ...chat,
          last_message: newMsg,
          updated_at: newMsg.created_at,
          unread_count: isCurrentChat || isFromMe ? chat.unread_count : (chat.unread_count || 0) + 1
        };

        const remaining = prev.filter((_, i) => i !== index);
        // Move updated chat to top (unless pinned logic applies)
        return [updatedChat, ...remaining].sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
          return new Date(b.updated_at) - new Date(a.updated_at);
        });
      });
    };

    const handleChatUpdate = ({ conversation_id, last_message }) => {
      setChats(prev => {
        const index = prev.findIndex(c => c.id === conversation_id);
        if (index === -1) {
          loadChats();
          return prev;
        }
        const isCurrent = activeChatIdRef.current === conversation_id;
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          last_message,
          updated_at: last_message.created_at,
          unread_count: isCurrent ? 0 : (updated[index].unread_count || 0) + 1
        };
        return updated.sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
          return new Date(b.updated_at) - new Date(a.updated_at);
        });
      });
    };

    const handleMessageEdited = ({ id, content, is_edited }) => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, content, is_edited } : m));
    };

    const handleMessageDeleted = ({ id, delete_type }) => {
      if (delete_type === 'me') {
        setMessages(prev => prev.filter(m => m.id !== id));
      } else {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, content: 'This message was deleted', is_deleted: 1 } : m));
      }
      setPinnedMessages(prev => prev.filter(p => p.message_id !== id && p.id !== id));
    };

    const handleMessagePinned = ({ conversation_id, message_id, message, pin }) => {
      if (activeChatIdRef.current === conversation_id) {
        setMessages(prev => prev.map(m => m.id === message_id ? { ...m, is_pinned: true } : m));
        const newPin = pin || { message_id, message };
        setPinnedMessages(prev => [newPin, ...prev.filter(p => p.message_id !== message_id)]);
      }
    };

    const handleMessageUnpinned = ({ conversation_id, message_id }) => {
      if (activeChatIdRef.current === conversation_id) {
        setMessages(prev => prev.map(m => m.id === message_id ? { ...m, is_pinned: false } : m));
        setPinnedMessages(prev => prev.filter(p => p.message_id !== message_id && p.id !== message_id));
      }
    };

    const handleReactionUpdate = ({ message_id, reactions }) => {
      setMessages(prev => prev.map(m => m.id === message_id ? { ...m, reactions } : m));
    };

    const handleTypingStart = ({ conversation_id, username }) => {
      setTypingUsers(prev => {
        const current = new Set(prev[conversation_id] || []);
        current.add(username);
        return { ...prev, [conversation_id]: current };
      });
    };

    const handleTypingStop = ({ conversation_id, user_id }) => {
      setTypingUsers(prev => {
        const current = new Set(prev[conversation_id] || []);
        // clear or remove
        return { ...prev, [conversation_id]: new Set() };
      });
    };

    const handleNotification = (notif) => {
      setUnreadNotificationsCount(prev => prev + 1);
      soundService.playNotification(settings?.sound_enabled !== false);
    };

    const handleThemeUpdated = ({ conversationId, theme }) => {
      setConversationThemes(prev => ({ ...prev, [conversationId]: theme }));
      if (activeChatIdRef.current === conversationId) {
        setActiveTheme(theme);
      }
    };

    const handleDisappearingSettings = ({ conversationId, disappearing_enabled, disappearing_duration, disappearing_unit, disappearing_admin_only }) => {
      setChats(prev => prev.map(c => c.id === conversationId ? {
        ...c,
        disappearing_enabled: disappearing_enabled ? 1 : 0,
        disappearing_duration,
        disappearing_unit,
        disappearing_admin_only: disappearing_admin_only ? 1 : 0
      } : c));
    };

    const handleMessageExpired = ({ id, conversation_id }) => {
      if (activeChatIdRef.current === conversation_id) {
        setMessages(prev => prev.filter(m => m.id !== id));
      }
    };

    const handleViewOnceConsumed = ({ id, conversation_id, view_once_opened, viewed_at }) => {
      if (activeChatIdRef.current === conversation_id) {
        setMessages(prev => prev.map(m => m.id === id ? {
          ...m,
          view_once_opened: 1,
          viewed_at,
          content: '',
          metadata: m.metadata ? { ...m.metadata, consumed: true } : { consumed: true }
        } : m));
      }
    };

    socket.on('online_users', handleOnlineUsers);
    socket.on('presence_change', handlePresenceChange);
    socket.on('new_message', handleNewMessage);
    socket.on('chat_update', handleChatUpdate);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_pinned', handleMessagePinned);
    socket.on('message_unpinned', handleMessageUnpinned);
    socket.on('message_reaction_update', handleReactionUpdate);
    socket.on('user_typing_start', handleTypingStart);
    socket.on('user_typing_stop', handleTypingStop);
    socket.on('notification', handleNotification);
    socket.on('chat:theme_updated', handleThemeUpdated);
    socket.on('disappearing_settings_updated', handleDisappearingSettings);
    socket.on('message_expired', handleMessageExpired);
    socket.on('view_once_consumed', handleViewOnceConsumed);

    return () => {
      socket.off('online_users', handleOnlineUsers);
      socket.off('presence_change', handlePresenceChange);
      socket.off('new_message', handleNewMessage);
      socket.off('chat_update', handleChatUpdate);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_pinned', handleMessagePinned);
      socket.off('message_unpinned', handleMessageUnpinned);
      socket.off('message_reaction_update', handleReactionUpdate);
      socket.off('user_typing_start', handleTypingStart);
      socket.off('user_typing_stop', handleTypingStop);
      socket.off('notification', handleNotification);
      socket.off('chat:theme_updated', handleThemeUpdated);
      socket.off('disappearing_settings_updated', handleDisappearingSettings);
      socket.off('message_expired', handleMessageExpired);
      socket.off('view_once_consumed', handleViewOnceConsumed);
    };
  }, [user, settings, setUnreadNotificationsCount, loadChats]);

  // Multi-selection helpers
  const toggleSelectMessage = useCallback((msgId) => {
    setSelectedMessageIds(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      setIsSelectionMode(next.size > 0);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMessageIds(new Set());
    setIsSelectionMode(false);
  }, []);

  const selectAllMessages = useCallback(() => {
    setSelectedMessageIds(new Set(messages.map(m => m.id)));
    setIsSelectionMode(true);
  }, [messages]);

  // Send message
  const sendMessage = async ({ type = 'text', content, metadata = null, reply_to_id = null, view_once = false }) => {
    if (!activeChatId) return null;
    try {
      const data = await api.post('/messages', {
        conversation_id: activeChatId,
        type,
        content,
        metadata,
        reply_to_id,
        view_once: view_once ? 1 : 0
      });
      return data.message;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };

  // Edit message
  const editMessage = async (msgId, newContent) => {
    try {
      const data = await api.put(`/messages/${msgId}`, { content: newContent });
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: newContent, is_edited: 1 } : m));
      return data;
    } catch (err) {
      console.error('Failed to edit message:', err);
      throw err;
    }
  };

  // Delete message
  const deleteMessage = async (msgId, deleteType = 'everyone') => {
    try {
      const data = await api.del(`/messages/${msgId}`, { delete_type: deleteType });
      if (deleteType === 'me') {
        setMessages(prev => prev.filter(m => m.id !== msgId));
      } else {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: 'This message was deleted', is_deleted: 1 } : m));
      }
      setPinnedMessages(prev => prev.filter(p => p.message_id !== msgId && p.id !== msgId));
      return data;
    } catch (err) {
      console.error('Failed to delete message:', err);
      throw err;
    }
  };

  // Batch delete messages
  const batchDeleteMessages = async (messageIds, deleteType = 'me') => {
    try {
      const data = await api.post('/messages/batch-delete', { message_ids: messageIds, delete_type: deleteType });
      if (deleteType === 'me') {
        setMessages(prev => prev.filter(m => !messageIds.includes(m.id)));
      } else {
        setMessages(prev => prev.map(m => messageIds.includes(m.id) ? { ...m, content: 'This message was deleted', is_deleted: 1 } : m));
      }
      clearSelection();
      return data;
    } catch (err) {
      console.error('Failed to batch delete messages:', err);
      throw err;
    }
  };

  // Save / unsave message
  const saveMessage = async (msgId) => {
    try {
      const data = await api.post(`/messages/${msgId}/save`);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_saved: true } : m));
      loadSavedMessages();
      return data;
    } catch (err) {
      console.error('Failed to save message:', err);
      throw err;
    }
  };

  const unsaveMessage = async (msgId) => {
    try {
      const data = await api.del(`/messages/${msgId}/save`);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_saved: false } : m));
      setSavedMessages(prev => prev.filter(sm => sm.id !== msgId && sm.message_id !== msgId));
      return data;
    } catch (err) {
      console.error('Failed to unsave message:', err);
      throw err;
    }
  };

  // Batch save messages
  const batchSaveMessages = async (messageIds) => {
    try {
      const data = await api.post('/messages/batch-save', { message_ids: messageIds });
      setMessages(prev => prev.map(m => messageIds.includes(m.id) ? { ...m, is_saved: true } : m));
      loadSavedMessages();
      clearSelection();
      return data;
    } catch (err) {
      console.error('Failed to batch save messages:', err);
      throw err;
    }
  };

  // Pin / unpin message
  const pinMessage = async (msgId) => {
    try {
      const data = await api.post(`/messages/${msgId}/pin`);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_pinned: true } : m));
      if (data.pin) {
        setPinnedMessages(prev => [data.pin, ...prev.filter(p => p.message_id !== msgId)]);
      }
      return data;
    } catch (err) {
      console.error('Failed to pin message:', err);
      throw err;
    }
  };

  const unpinMessage = async (msgId) => {
    try {
      const data = await api.del(`/messages/${msgId}/pin`);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_pinned: false } : m));
      setPinnedMessages(prev => prev.filter(p => p.message_id !== msgId && p.id !== msgId));
      return data;
    } catch (err) {
      console.error('Failed to unpin message:', err);
      throw err;
    }
  };

  // Forward messages
  const forwardMessages = async (messageIds, targetConversationIds) => {
    try {
      const data = await api.post('/messages/forward', {
        message_ids: messageIds,
        target_conversation_ids: targetConversationIds
      });
      clearSelection();
      return data;
    } catch (err) {
      console.error('Failed to forward messages:', err);
      throw err;
    }
  };

  // React to message
  const reactMessage = async (msgId, emoji) => {
    try {
      const data = await api.post(`/messages/${msgId}/react`, { emoji });
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: data.reactions } : m));
      return data;
    } catch (err) {
      console.error('Failed to react to message:', err);
      throw err;
    }
  };

  // Send typing notification
  const sendTyping = (isTyping) => {
    const socket = getSocket();
    if (!socket || !activeChatId) return;
    if (isTyping) {
      socket.emit('typing_start', { conversation_id: activeChatId });
    } else {
      socket.emit('typing_stop', { conversation_id: activeChatId });
    }
  };

  // Create direct chat
  const createDirectChat = async (targetUserId) => {
    const data = await api.post('/chats/direct', { targetUserId });
    await loadChats();
    setActiveChatId(data.conversationId);
    return data.conversationId;
  };

  // Create group chat
  const createGroupChat = async (groupData) => {
    const data = await api.post('/groups', groupData);
    await loadChats();
    setActiveChatId(data.conversationId);
    return data.conversationId;
  };

  // Set / update theme for current conversation
  const setConversationTheme = async ({ themeId, themeConfig, scope }) => {
    if (!activeChatId) return;
    const data = await api.put(`/themes/conversation/${activeChatId}`, { themeId, themeConfig, scope });
    setActiveTheme(themeConfig);
    setConversationThemes(prev => ({ ...prev, [activeChatId]: themeConfig }));
    return data;
  };

  // Reset theme for current conversation
  const resetConversationTheme = async () => {
    if (!activeChatId) return;
    await api.del(`/themes/conversation/${activeChatId}`);
    setActiveTheme(null);
    setConversationThemes(prev => ({ ...prev, [activeChatId]: null }));
  };

  // Update disappearing message settings for a conversation
  const updateDisappearingSettings = async (convId, { duration, unit, adminOnly }) => {
    const data = await api.put(`/chats/${convId}/disappearing`, { duration, unit, adminOnly });
    setChats(prev => prev.map(c => c.id === convId ? {
      ...c,
      disappearing_enabled: data.disappearing_enabled ? 1 : 0,
      disappearing_duration,
      disappearing_unit,
      disappearing_admin_only: data.disappearing_admin_only ? 1 : 0
    } : c));
    return data;
  };

  // Open & consume a View Once message
  const consumeViewOnce = async (messageId) => {
    const data = await api.post(`/messages/${messageId}/view-once`);
    setMessages(prev => prev.map(m => m.id === messageId ? {
      ...m,
      view_once_opened: 1,
      viewed_at: data.viewed_at,
      content: data.content,
      metadata: data.metadata
    } : m));
    return data;
  };

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        setActiveChatId,
        activeChat,
        messages,
        pinnedMessages,
        savedMessages,
        isSelectionMode,
        selectedMessageIds,
        loadingChats,
        loadingMessages,
        onlineUserIds,
        typingUsers: activeChatId && typingUsers[activeChatId] ? Array.from(typingUsers[activeChatId]) : [],
        activeTheme,
        conversationThemes,
        setConversationTheme,
        resetConversationTheme,
        updateDisappearingSettings,
        consumeViewOnce,
        expireMessageLocally,
        loadTheme,
        sendMessage,
        editMessage,
        deleteMessage,
        batchDeleteMessages,
        saveMessage,
        unsaveMessage,
        batchSaveMessages,
        pinMessage,
        unpinMessage,
        forwardMessages,
        loadSavedMessages,
        toggleSelectMessage,
        selectAllMessages,
        clearSelection,
        reactMessage,
        sendTyping,
        createDirectChat,
        createGroupChat,
        refreshChats: loadChats,
        refreshMessages: () => loadMessages(activeChatId)
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
}
