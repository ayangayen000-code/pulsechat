import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/chats - list all conversations for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const memberships = await query(
      `SELECT cm.conversation_id, cm.role, cm.is_pinned, cm.is_muted, cm.last_read_at, cm.last_read_message_id,
              c.type, c.name, c.avatar_url, c.description, c.pinned_message_id, c.updated_at,
              c.disappearing_enabled, c.disappearing_duration, c.disappearing_unit, c.disappearing_admin_only
       FROM conversation_members cm
       JOIN conversations c ON c.id = cm.conversation_id
       WHERE cm.user_id = ?
       ORDER BY cm.is_pinned DESC, c.updated_at DESC`,
      [req.user.id]
    );

    const chats = [];

    for (const item of memberships) {
      let title = item.name;
      let avatar = item.avatar_url;
      let otherUser = null;

      if (item.type === 'direct') {
        // Find other member
        const otherMember = await queryOne(
          `SELECT u.id, u.user_id, u.username, u.avatar_url, u.status, u.last_seen
           FROM conversation_members cm
           JOIN users u ON u.id = cm.user_id
           WHERE cm.conversation_id = ? AND cm.user_id != ?`,
          [item.conversation_id, req.user.id]
        );

        if (otherMember) {
          otherUser = otherMember;
          title = otherMember.username;
          avatar = otherMember.avatar_url;
        } else {
          title = 'Deleted User';
        }
      }

      // Last message
      const lastMessage = await queryOne(
        `SELECT m.id, m.sender_id, m.type, m.content, m.metadata, m.created_at, u.username as sender_name
         FROM messages m
         LEFT JOIN users u ON u.id = m.sender_id
         WHERE m.conversation_id = ?
         ORDER BY m.created_at DESC
         LIMIT 1`,
        [item.conversation_id]
      );

      // Unread count
      let unreadCount = 0;
      if (item.last_read_at) {
        const countRes = await queryOne(
          `SELECT COUNT(*) as count FROM messages
           WHERE conversation_id = ? AND created_at > ? AND sender_id != ?`,
          [item.conversation_id, item.last_read_at, req.user.id]
        );
        unreadCount = countRes ? countRes.count : 0;
      } else {
        const countRes = await queryOne(
          `SELECT COUNT(*) as count FROM messages
           WHERE conversation_id = ? AND sender_id != ?`,
          [item.conversation_id, req.user.id]
        );
        unreadCount = countRes ? countRes.count : 0;
      }

      // Member count
      const memberCountRes = await queryOne(
        `SELECT COUNT(*) as count FROM conversation_members WHERE conversation_id = ?`,
        [item.conversation_id]
      );

      chats.push({
        id: item.conversation_id,
        type: item.type,
        title,
        avatar,
        description: item.description,
        is_pinned: item.is_pinned === 1,
        is_muted: item.is_muted === 1,
        pinned_message_id: item.pinned_message_id,
        updated_at: item.updated_at,
        other_user: otherUser,
        member_count: memberCountRes ? memberCountRes.count : 0,
        last_message: lastMessage,
        unread_count: unreadCount,
        role: item.role,
        disappearing_enabled: item.disappearing_enabled === 1,
        disappearing_duration: item.disappearing_duration || 0,
        disappearing_unit: item.disappearing_unit || 'off',
        disappearing_admin_only: item.disappearing_admin_only === 1
      });
    }

    res.json({ chats });
  } catch (err) {
    console.error('List chats error:', err);
    res.status(500).json({ error: 'Failed to retrieve conversations.' });
  }
});

// POST /api/chats/direct - get or create direct conversation with user
router.post('/direct', authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required.' });
    }

    // Check if target user exists
    const target = await queryOne(
      `SELECT id, user_id, username, avatar_url, status FROM users WHERE id = ? OR LOWER(user_id) = ?`,
      [targetUserId, targetUserId.toLowerCase()]
    );
    if (!target) return res.status(404).json({ error: 'User not found.' });

    // Check if a direct conversation already exists between both users
    const existing = await query(
      `SELECT c.id
       FROM conversations c
       JOIN conversation_members cm1 ON cm1.conversation_id = c.id AND cm1.user_id = ?
       JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id = ?
       WHERE c.type = 'direct'
       LIMIT 1`,
      [req.user.id, target.id]
    );

    if (existing.length > 0) {
      return res.json({ conversationId: existing[0].id, isNew: false });
    }

    // Create new direct conversation
    const convId = 'conv_' + uuidv4().replace(/-/g, '').slice(0, 12);
    const now = new Date().toISOString();

    await run(
      `INSERT INTO conversations (id, type, name, avatar_url, description, created_by, created_at, updated_at)
       VALUES (?, 'direct', '', '', '', ?, ?, ?)`,
      [convId, req.user.id, now, now]
    );

    await run(
      `INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at) VALUES (?, ?, ?, 'member', ?)`,
      [uuidv4(), convId, req.user.id, now]
    );
    await run(
      `INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at) VALUES (?, ?, ?, 'member', ?)`,
      [uuidv4(), convId, target.id, now]
    );

    res.status(201).json({ conversationId: convId, isNew: true });
  } catch (err) {
    console.error('Create direct chat error:', err);
    res.status(500).json({ error: 'Failed to create direct conversation.' });
  }
});

// GET /api/chats/:id/messages
router.get('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const convId = req.params.id;

    // Verify membership
    const member = await queryOne(
      `SELECT * FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      [convId, req.user.id]
    );
    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this conversation.' });
    }

    // Get messages (excluding expired disappearing messages and hidden messages for this user)
    const now = new Date().toISOString();
    const rawMessages = await query(
      `SELECT m.*, u.username as sender_name, u.user_id as sender_handle, u.avatar_url as sender_avatar,
              (SELECT COUNT(*) FROM saved_messages sm WHERE sm.message_id = m.id AND sm.user_id = ?) as is_saved,
              (SELECT COUNT(*) FROM pinned_messages pm WHERE pm.message_id = m.id AND pm.conversation_id = m.conversation_id) as is_pinned
       FROM messages m
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = ?
         AND (m.expires_at IS NULL OR m.expires_at > ?)
         AND m.id NOT IN (SELECT message_id FROM hidden_messages WHERE user_id = ?)
       ORDER BY m.created_at ASC
       LIMIT 250`,
      [req.user.id, convId, now, req.user.id]
    );

    // Fetch reactions and replied message previews
    const messages = [];
    for (const m of rawMessages) {
      // Parse metadata if present
      let metadataObj = null;
      if (m.metadata) {
        try {
          metadataObj = JSON.parse(m.metadata);
        } catch (e) {
          metadataObj = m.metadata;
        }
      }

      let content = m.content;
      // If View Once message, mask media content from chat history so media URL is only fetched via POST /api/messages/:id/view-once
      if (m.view_once === 1) {
        content = '';
        if (metadataObj && typeof metadataObj === 'object') {
          delete metadataObj.images;
          delete metadataObj.url;
          delete metadataObj.filename;
          metadataObj.view_once = true;
          metadataObj.consumed = m.view_once_opened === 1;
        }
      }

      // Reactions
      const reactions = await query(
        `SELECT mr.emoji, mr.user_id, u.username
         FROM message_reactions mr
         JOIN users u ON u.id = mr.user_id
         WHERE mr.message_id = ?`,
        [m.id]
      );

      // Reply-to preview if applicable
      let replyToMessage = null;
      if (m.reply_to_id) {
        const replyMsg = await queryOne(
          `SELECT m.id, m.content, m.type, u.username as sender_name
           FROM messages m
           JOIN users u ON u.id = m.sender_id
           WHERE m.id = ?`,
          [m.reply_to_id]
        );
        if (replyMsg) replyToMessage = replyMsg;
      }

      messages.push({
        ...m,
        content,
        is_saved: m.is_saved > 0,
        is_pinned: m.is_pinned > 0,
        metadata: metadataObj,
        reactions: reactions || [],
        reply_to: replyToMessage
      });
    }

    // Auto mark as read
    const lastMsg = rawMessages[rawMessages.length - 1];
    if (lastMsg) {
      await run(
        `UPDATE conversation_members
         SET last_read_at = ?, last_read_message_id = ?
         WHERE conversation_id = ? AND user_id = ?`,
        [now, lastMsg.id, convId, req.user.id]
      );
    }

    // Pinned messages for this conversation
    const pinnedMessages = await query(
      `SELECT pm.id as pin_id, pm.message_id, pm.pinned_by, pm.created_at as pinned_at,
              m.id, m.content, m.type, m.metadata, m.sender_id, u.username as sender_name, u.avatar_url as sender_avatar
       FROM pinned_messages pm
       JOIN messages m ON m.id = pm.message_id
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE pm.conversation_id = ?
       ORDER BY pm.created_at DESC`,
      [convId]
    );

    res.json({ messages, pinned_messages: pinnedMessages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Failed to retrieve conversation messages.' });
  }
});

// POST /api/chats/:id/read - mark conversation read
router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    const now = new Date().toISOString();
    await run(
      `UPDATE conversation_members SET last_read_at = ? WHERE conversation_id = ? AND user_id = ?`,
      [now, req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark conversation read.' });
  }
});

// POST /api/chats/:id/pin - toggle pin
router.post('/:id/pin', authMiddleware, async (req, res) => {
  try {
    const member = await queryOne(
      `SELECT is_pinned FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!member) return res.status(404).json({ error: 'Conversation not found.' });

    const newPinned = member.is_pinned === 1 ? 0 : 1;
    await run(
      `UPDATE conversation_members SET is_pinned = ? WHERE conversation_id = ? AND user_id = ?`,
      [newPinned, req.params.id, req.user.id]
    );

    res.json({ success: true, is_pinned: newPinned === 1 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle pin.' });
  }
});

// POST /api/chats/:id/mute - toggle mute
router.post('/:id/mute', authMiddleware, async (req, res) => {
  try {
    const member = await queryOne(
      `SELECT is_muted FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!member) return res.status(404).json({ error: 'Conversation not found.' });

    const newMuted = member.is_muted === 1 ? 0 : 1;
    await run(
      `UPDATE conversation_members SET is_muted = ? WHERE conversation_id = ? AND user_id = ?`,
      [newMuted, req.params.id, req.user.id]
    );

    res.json({ success: true, is_muted: newMuted === 1 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle mute.' });
  }
});

// DELETE /api/chats/:id - leave/delete chat for user
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await run(
      `DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Conversation removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove conversation.' });
  }
});

// PUT /api/chats/:id/disappearing - update disappearing messages settings
router.put('/:id/disappearing', authMiddleware, async (req, res) => {
  try {
    const convId = req.params.id;
    const duration = req.body.duration !== undefined ? req.body.duration : req.body.disappearing_duration;
    const unit = req.body.unit !== undefined ? req.body.unit : req.body.disappearing_unit;
    const adminOnly = req.body.adminOnly !== undefined ? req.body.adminOnly : req.body.disappearing_admin_only;

    const member = await queryOne(
      `SELECT role FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      [convId, req.user.id]
    );
    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this conversation.' });
    }

    const conv = await queryOne(`SELECT * FROM conversations WHERE id = ?`, [convId]);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    // Check permission in groups
    if (conv.type === 'group' && conv.disappearing_admin_only && member.role !== 'owner' && member.role !== 'admin') {
      return res.status(403).json({ error: 'Only group admins and owners can modify disappearing message settings.' });
    }

    const numDuration = Math.max(0, parseInt(duration, 10) || 0);
    const isEnabled = numDuration > 0 ? 1 : 0;
    const cleanUnit = unit || (numDuration > 0 ? 'custom' : 'off');
    const newAdminOnly = adminOnly !== undefined ? (adminOnly ? 1 : 0) : (conv.disappearing_admin_only ?? 1);
    const now = new Date().toISOString();

    await run(
      `UPDATE conversations
       SET disappearing_enabled = ?, disappearing_duration = ?, disappearing_unit = ?, disappearing_admin_only = ?, updated_at = ?
       WHERE id = ?`,
      [isEnabled, numDuration, cleanUnit, newAdminOnly, now, convId]
    );

    // Format duration text for system announcement
    let formattedDuration = '';
    if (numDuration <= 0) {
      formattedDuration = 'off';
    } else if (numDuration < 60) {
      formattedDuration = `${numDuration} second${numDuration === 1 ? '' : 's'}`;
    } else if (numDuration < 3600) {
      const mins = Math.round(numDuration / 60);
      formattedDuration = `${mins} minute${mins === 1 ? '' : 's'}`;
    } else if (numDuration < 86400) {
      const hrs = Math.round(numDuration / 3600);
      formattedDuration = `${hrs} hour${hrs === 1 ? '' : 's'}`;
    } else {
      const days = Math.round(numDuration / 86400);
      formattedDuration = `${days} day${days === 1 ? '' : 's'}`;
    }

    const systemContent = numDuration <= 0
      ? `${req.user.username} turned off disappearing messages.`
      : `${req.user.username} set disappearing messages to ${formattedDuration}.`;

    const msgId = 'msg_' + uuidv4().replace(/-/g, '').slice(0, 12);
    await run(
      `INSERT INTO messages (id, conversation_id, sender_id, type, content, created_at)
       VALUES (?, ?, ?, 'system', ?, ?)`,
      [msgId, convId, req.user.id, systemContent, now]
    );

    const systemMsg = {
      id: msgId,
      conversation_id: convId,
      sender_id: req.user.id,
      sender_name: req.user.username,
      sender_handle: req.user.user_id,
      type: 'system',
      content: systemContent,
      reactions: [],
      is_edited: 0,
      is_deleted: 0,
      created_at: now
    };

    const io = req.app.get('io');
    if (io) {
      io.to(`conv_${convId}`).emit('disappearing_settings_updated', {
        conversationId: convId,
        disappearing_enabled: isEnabled === 1,
        disappearing_duration: numDuration,
        disappearing_unit: cleanUnit,
        disappearing_admin_only: newAdminOnly === 1,
        updatedBy: req.user.username
      });
      io.to(`conv_${convId}`).emit('new_message', systemMsg);
    }

    res.json({
      success: true,
      disappearing_enabled: isEnabled === 1,
      disappearing_duration: numDuration,
      disappearing_unit: cleanUnit,
      disappearing_admin_only: newAdminOnly === 1,
      systemMessage: systemMsg
    });
  } catch (err) {
    console.error('Update disappearing settings error:', err);
    res.status(500).json({ error: 'Failed to update disappearing message settings.' });
  }
});

export default router;
