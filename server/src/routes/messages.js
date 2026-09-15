import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/messages - send message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { conversation_id, type = 'text', content, metadata, reply_to_id, view_once } = req.body;

    if (!conversation_id) {
      return res.status(400).json({ error: 'Conversation ID required.' });
    }
    if (!content && type === 'text') {
      return res.status(400).json({ error: 'Message content required.' });
    }

    // Verify membership
    const member = await queryOne(
      `SELECT * FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      [conversation_id, req.user.id]
    );
    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this conversation.' });
    }

    // Check conversation's disappearing message settings
    const conv = await queryOne(
      `SELECT disappearing_enabled, disappearing_duration, disappearing_unit FROM conversations WHERE id = ?`,
      [conversation_id]
    );

    let isDisappearing = 0;
    let disappearingDuration = null;
    let expiresAt = null;

    if (conv && conv.disappearing_enabled && conv.disappearing_duration > 0) {
      isDisappearing = 1;
      disappearingDuration = conv.disappearing_duration;
      expiresAt = new Date(Date.now() + conv.disappearing_duration * 1000).toISOString();
    }

    const isViewOnce = (view_once === 1 || view_once === true || view_once === '1') ? 1 : 0;

    const msgId = 'msg_' + uuidv4().replace(/-/g, '').slice(0, 12);
    const now = new Date().toISOString();
    const metaStr = metadata ? (typeof metadata === 'object' ? JSON.stringify(metadata) : metadata) : null;

    await run(
      `INSERT INTO messages (
        id, conversation_id, sender_id, reply_to_id, type, content, metadata,
        disappearing_enabled, disappearing_duration, delivered_at, expires_at,
        view_once, view_once_opened, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        msgId, conversation_id, req.user.id, reply_to_id || null, type, content || '', metaStr,
        isDisappearing, disappearingDuration, now, expiresAt,
        isViewOnce, now
      ]
    );

    // Update conversation updated_at
    await run(`UPDATE conversations SET updated_at = ? WHERE id = ?`, [now, conversation_id]);

    // Update sender's last_read_at
    await run(
      `UPDATE conversation_members SET last_read_at = ?, last_read_message_id = ? WHERE conversation_id = ? AND user_id = ?`,
      [now, msgId, conversation_id, req.user.id]
    );

    // Fetch reply message preview if replying
    let replyToPreview = null;
    if (reply_to_id) {
      replyToPreview = await queryOne(
        `SELECT m.id, m.content, m.type, u.username as sender_name
         FROM messages m
         JOIN users u ON u.id = m.sender_id
         WHERE m.id = ?`,
        [reply_to_id]
      );
    }

    const parsedMetadata = metadata ? (typeof metadata === 'object' ? metadata : JSON.parse(metaStr || '{}')) : null;

    const fullMessage = {
      id: msgId,
      conversation_id,
      sender_id: req.user.id,
      sender_name: req.user.username,
      sender_handle: req.user.user_id,
      sender_avatar: req.user.avatar_url,
      reply_to_id: reply_to_id || null,
      reply_to: replyToPreview,
      type,
      content: content || '',
      metadata: parsedMetadata,
      reactions: [],
      is_edited: 0,
      is_deleted: 0,
      disappearing_enabled: isDisappearing,
      disappearing_duration: disappearingDuration,
      delivered_at: now,
      expires_at: expiresAt,
      view_once: isViewOnce,
      view_once_opened: 0,
      viewed_at: null,
      created_at: now
    };

    // Socket.io broadcast
    if (req.app.get('io')) {
      const io = req.app.get('io');
      // For view-once, mask media content from broadcast so clients fetch it only upon tapping
      const broadcastMessage = isViewOnce ? {
        ...fullMessage,
        content: ''
      } : fullMessage;

      // Broadcast to room
      io.to(`conv_${conversation_id}`).emit('new_message', broadcastMessage);

      // Notify other members who might be outside the conversation view
      const otherMembers = await query(
        `SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?`,
        [conversation_id, req.user.id]
      );

      for (const m of otherMembers) {
        io.to(`user_${m.user_id}`).emit('chat_update', {
          conversation_id,
          last_message: broadcastMessage
        });
      }
    }

    res.status(201).json({ message: fullMessage });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// POST /api/messages/:id/view-once - consume a view once message and return media content
router.post('/:id/view-once', authMiddleware, async (req, res) => {
  try {
    const msgId = req.params.id;

    // Check message existence and user's membership
    const msg = await queryOne(
      `SELECT m.*, cm.user_id as is_member
       FROM messages m
       JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = ?
       WHERE m.id = ?`,
      [req.user.id, msgId]
    );

    if (!msg) {
      return res.status(404).json({ error: 'Message not found or access denied.' });
    }

    if (msg.view_once !== 1) {
      return res.status(400).json({ error: 'This is not a View Once message.' });
    }

    // If already opened:
    if (msg.view_once_opened === 1) {
      return res.status(410).json({ error: 'This media has already been viewed.', view_once_opened: 1, viewed_at: msg.viewed_at });
    }

    // Atomic update to mark viewed
    const now = new Date().toISOString();
    const updateResult = await run(
      `UPDATE messages SET view_once_opened = 1, viewed_at = ? WHERE id = ? AND view_once_opened = 0`,
      [now, msgId]
    );

    if (updateResult.changes === 0) {
      return res.status(410).json({ error: 'This media has already been viewed.', view_once_opened: 1 });
    }

    // Parse metadata
    let metadataObj = null;
    if (msg.metadata) {
      try {
        metadataObj = JSON.parse(msg.metadata);
      } catch (e) {
        metadataObj = msg.metadata;
      }
    }

    // Emit event to conversation room so both parties see status changed to viewed
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`conv_${msg.conversation_id}`).emit('view_once_consumed', {
        id: msgId,
        conversation_id: msg.conversation_id,
        view_once_opened: 1,
        viewed_at: now,
        viewed_by: req.user.id,
        viewed_by_name: req.user.username
      });
    }

    // Return the actual media content for one-time display in modal
    res.json({
      success: true,
      id: msg.id,
      type: msg.type,
      content: msg.content,
      metadata: metadataObj,
      view_once_opened: 1,
      viewed_at: now
    });
  } catch (err) {
    console.error('View once error:', err);
    res.status(500).json({ error: 'Failed to open View Once media.' });
  }
});

// PUT /api/messages/:id - edit message
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const msgId = req.params.id;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content required.' });
    }

    const msg = await queryOne(`SELECT * FROM messages WHERE id = ?`, [msgId]);
    if (!msg) return res.status(404).json({ error: 'Message not found.' });

    if (msg.sender_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own messages.' });
    }

    await run(`UPDATE messages SET content = ?, is_edited = 1 WHERE id = ?`, [content.trim(), msgId]);

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`conv_${msg.conversation_id}`).emit('message_edited', {
        id: msgId,
        conversation_id: msg.conversation_id,
        content: content.trim(),
        is_edited: 1
      });
    }

    res.json({ success: true, message: { ...msg, content: content.trim(), is_edited: 1 } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit message.' });
  }
});

// POST /api/messages/forward - forward messages to target conversations
router.post('/forward', authMiddleware, async (req, res) => {
  try {
    const { message_ids, target_conversation_ids } = req.body;

    if (!Array.isArray(message_ids) || message_ids.length === 0) {
      return res.status(400).json({ error: 'message_ids array is required.' });
    }
    if (!Array.isArray(target_conversation_ids) || target_conversation_ids.length === 0) {
      return res.status(400).json({ error: 'target_conversation_ids array is required.' });
    }

    const io = req.app.get('io');
    const now = new Date().toISOString();
    let totalForwarded = 0;

    for (const targetConvId of target_conversation_ids) {
      // Verify user is member of target conversation
      const member = await queryOne(
        `SELECT id FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
        [targetConvId, req.user.id]
      );
      if (!member) continue;

      // Check disappearing settings of target conversation
      const conv = await queryOne(
        `SELECT disappearing_enabled, disappearing_duration FROM conversations WHERE id = ?`,
        [targetConvId]
      );
      let isDisappearing = 0;
      let disappearingDuration = null;
      let expiresAt = null;
      if (conv && conv.disappearing_enabled && conv.disappearing_duration > 0) {
        isDisappearing = 1;
        disappearingDuration = conv.disappearing_duration;
        expiresAt = new Date(Date.now() + conv.disappearing_duration * 1000).toISOString();
      }

      for (const origMsgId of message_ids) {
        // Fetch original message
        const origMsg = await queryOne(
          `SELECT m.*, u.username as sender_name
           FROM messages m
           LEFT JOIN users u ON u.id = m.sender_id
           WHERE m.id = ?`,
          [origMsgId]
        );

        if (!origMsg || origMsg.is_deleted === 1) continue;
        // Expired disappearing message cannot be forwarded
        if (origMsg.expires_at && new Date(origMsg.expires_at) <= new Date()) continue;
        // View once messages cannot be forwarded
        if (origMsg.view_once === 1) continue;

        let origMetadata = {};
        if (origMsg.metadata) {
          try {
            origMetadata = typeof origMsg.metadata === 'object' ? origMsg.metadata : JSON.parse(origMsg.metadata);
          } catch (e) {
            origMetadata = {};
          }
        }

        const newMsgId = 'msg_' + uuidv4().replace(/-/g, '').slice(0, 12);
        const forwardMeta = {
          ...origMetadata,
          is_forwarded: true,
          forwarded_from_user: origMsg.sender_name || 'Someone'
        };

        await run(
          `INSERT INTO messages (
            id, conversation_id, sender_id, type, content, metadata,
            disappearing_enabled, disappearing_duration, delivered_at, expires_at,
            view_once, view_once_opened, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`,
          [
            newMsgId, targetConvId, req.user.id, origMsg.type, origMsg.content || '',
            JSON.stringify(forwardMeta), isDisappearing, disappearingDuration, now, expiresAt, now
          ]
        );

        // Update target conversation updated_at
        await run(`UPDATE conversations SET updated_at = ? WHERE id = ?`, [now, targetConvId]);

        const fullForwardedMsg = {
          id: newMsgId,
          conversation_id: targetConvId,
          sender_id: req.user.id,
          sender_name: req.user.username,
          sender_handle: req.user.user_id,
          sender_avatar: req.user.avatar_url,
          reply_to_id: null,
          reply_to: null,
          type: origMsg.type,
          content: origMsg.content || '',
          metadata: forwardMeta,
          reactions: [],
          is_edited: 0,
          is_deleted: 0,
          disappearing_enabled: isDisappearing,
          disappearing_duration: disappearingDuration,
          delivered_at: now,
          expires_at: expiresAt,
          view_once: 0,
          view_once_opened: 0,
          created_at: now
        };

        if (io) {
          io.to(`conv_${targetConvId}`).emit('new_message', fullForwardedMsg);

          const otherMembers = await query(
            `SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?`,
            [targetConvId, req.user.id]
          );
          for (const m of otherMembers) {
            io.to(`user_${m.user_id}`).emit('chat_update', {
              conversation_id: targetConvId,
              last_message: fullForwardedMsg
            });
          }
        }

        totalForwarded++;
      }
    }

    res.json({ success: true, forwarded_count: totalForwarded });
  } catch (err) {
    console.error('Forward message error:', err);
    res.status(500).json({ error: 'Failed to forward messages.' });
  }
});

// GET /api/messages/saved - get user's saved messages
router.get('/saved', authMiddleware, async (req, res) => {
  try {
    const saved = await query(
      `SELECT sm.id as saved_id, sm.created_at as saved_at,
              m.id, m.conversation_id, m.sender_id, m.type, m.content, m.metadata, m.created_at,
              u.username as sender_name, u.avatar_url as sender_avatar,
              c.name as conversation_name, c.type as conversation_type, c.avatar_url as conversation_avatar
       FROM saved_messages sm
       JOIN messages m ON m.id = sm.message_id
       JOIN conversations c ON c.id = sm.conversation_id
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE sm.user_id = ?
         AND (m.expires_at IS NULL OR m.expires_at > ?)
       ORDER BY sm.created_at DESC`,
      [req.user.id, new Date().toISOString()]
    );

    const formatted = saved.map((item) => {
      let metaObj = null;
      if (item.metadata) {
        try {
          metaObj = JSON.parse(item.metadata);
        } catch (e) {
          metaObj = item.metadata;
        }
      }
      return {
        ...item,
        metadata: metaObj
      };
    });

    res.json({ saved_messages: formatted });
  } catch (err) {
    console.error('Get saved messages error:', err);
    res.status(500).json({ error: 'Failed to retrieve saved messages.' });
  }
});

// POST /api/messages/:id/save - save a message
router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const msgId = req.params.id;
    const msg = await queryOne(
      `SELECT m.*, cm.user_id as is_member
       FROM messages m
       JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = ?
       WHERE m.id = ?`,
      [req.user.id, msgId]
    );

    if (!msg) {
      return res.status(404).json({ error: 'Message not found or access denied.' });
    }
    if (msg.is_deleted === 1) {
      return res.status(400).json({ error: 'Cannot save a deleted message.' });
    }
    if (msg.view_once === 1) {
      return res.status(400).json({ error: 'Cannot save a View Once message.' });
    }

    const existing = await queryOne(
      `SELECT id FROM saved_messages WHERE user_id = ? AND message_id = ?`,
      [req.user.id, msgId]
    );

    if (!existing) {
      await run(
        `INSERT INTO saved_messages (id, user_id, message_id, conversation_id, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), req.user.id, msgId, msg.conversation_id, new Date().toISOString()]
      );
    }

    res.json({ success: true, is_saved: true, message_id: msgId });
  } catch (err) {
    console.error('Save message error:', err);
    res.status(500).json({ error: 'Failed to save message.' });
  }
});

// DELETE /api/messages/:id/save - unsave a message
router.delete('/:id/save', authMiddleware, async (req, res) => {
  try {
    const msgId = req.params.id;
    await run(
      `DELETE FROM saved_messages WHERE user_id = ? AND message_id = ?`,
      [req.user.id, msgId]
    );
    res.json({ success: true, is_saved: false, message_id: msgId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unsave message.' });
  }
});

// POST /api/messages/batch-save - batch save messages
router.post('/batch-save', authMiddleware, async (req, res) => {
  try {
    const { message_ids } = req.body;
    if (!Array.isArray(message_ids) || message_ids.length === 0) {
      return res.status(400).json({ error: 'message_ids array is required.' });
    }

    const now = new Date().toISOString();
    let savedCount = 0;

    for (const mId of message_ids) {
      const msg = await queryOne(
        `SELECT m.id, m.conversation_id
         FROM messages m
         JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = ?
         WHERE m.id = ? AND m.is_deleted = 0`,
        [req.user.id, mId]
      );
      if (!msg) continue;

      const existing = await queryOne(
        `SELECT id FROM saved_messages WHERE user_id = ? AND message_id = ?`,
        [req.user.id, mId]
      );
      if (!existing) {
        await run(
          `INSERT INTO saved_messages (id, user_id, message_id, conversation_id, created_at)
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), req.user.id, mId, msg.conversation_id, now]
        );
        savedCount++;
      }
    }

    res.json({ success: true, saved_count: savedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to batch save messages.' });
  }
});

// POST /api/messages/:id/pin - pin a message
router.post('/:id/pin', authMiddleware, async (req, res) => {
  try {
    const msgId = req.params.id;
    const msg = await queryOne(
      `SELECT m.*, c.type as conv_type, c.disappearing_admin_only, cm.role
       FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = ?
       WHERE m.id = ?`,
      [req.user.id, msgId]
    );

    if (!msg) {
      return res.status(404).json({ error: 'Message not found or access denied.' });
    }
    if (msg.is_deleted === 1) {
      return res.status(400).json({ error: 'Cannot pin a deleted message.' });
    }

    // In groups, check if permissions allow member or require admin
    if (msg.conv_type === 'group' && msg.disappearing_admin_only === 1) {
      if (msg.role !== 'owner' && msg.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can pin messages in this group.' });
      }
    }

    const now = new Date().toISOString();
    const existing = await queryOne(
      `SELECT id FROM pinned_messages WHERE conversation_id = ? AND message_id = ?`,
      [msg.conversation_id, msgId]
    );

    const pinId = existing ? existing.id : uuidv4();
    if (!existing) {
      await run(
        `INSERT INTO pinned_messages (id, conversation_id, message_id, pinned_by, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [pinId, msg.conversation_id, msgId, req.user.id, now]
      );
    }

    // Update conversation pinned_message_id
    await run(
      `UPDATE conversations SET pinned_message_id = ?, updated_at = ? WHERE id = ?`,
      [msgId, now, msg.conversation_id]
    );

    const sender = await queryOne(`SELECT username, avatar_url FROM users WHERE id = ?`, [msg.sender_id]);

    const pinPayload = {
      id: pinId,
      conversation_id: msg.conversation_id,
      message_id: msgId,
      pinned_by: req.user.id,
      pinned_at: now,
      message: {
        id: msg.id,
        content: msg.content,
        type: msg.type,
        metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
        sender_id: msg.sender_id,
        sender_name: sender ? sender.username : 'Someone',
        sender_avatar: sender ? sender.avatar_url : ''
      }
    };

    if (req.app.get('io')) {
      req.app.get('io').to(`conv_${msg.conversation_id}`).emit('message_pinned', pinPayload);
    }

    res.json({ success: true, is_pinned: true, pin: pinPayload });
  } catch (err) {
    console.error('Pin message error:', err);
    res.status(500).json({ error: 'Failed to pin message.' });
  }
});

// DELETE /api/messages/:id/pin - unpin a message
router.delete('/:id/pin', authMiddleware, async (req, res) => {
  try {
    const msgId = req.params.id;
    const msg = await queryOne(
      `SELECT m.*, c.type as conv_type, c.disappearing_admin_only, cm.role
       FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = ?
       WHERE m.id = ?`,
      [req.user.id, msgId]
    );

    if (!msg) {
      return res.status(404).json({ error: 'Message not found or access denied.' });
    }

    if (msg.conv_type === 'group' && msg.disappearing_admin_only === 1) {
      if (msg.role !== 'owner' && msg.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can unpin messages in this group.' });
      }
    }

    await run(
      `DELETE FROM pinned_messages WHERE conversation_id = ? AND message_id = ?`,
      [msg.conversation_id, msgId]
    );

    // Pick next latest pinned message if any
    const nextPinned = await queryOne(
      `SELECT message_id FROM pinned_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1`,
      [msg.conversation_id]
    );

    await run(
      `UPDATE conversations SET pinned_message_id = ? WHERE id = ?`,
      [nextPinned ? nextPinned.message_id : null, msg.conversation_id]
    );

    if (req.app.get('io')) {
      req.app.get('io').to(`conv_${msg.conversation_id}`).emit('message_unpinned', {
        conversation_id: msg.conversation_id,
        message_id: msgId,
        next_pinned_message_id: nextPinned ? nextPinned.message_id : null
      });
    }

    res.json({ success: true, is_pinned: false, message_id: msgId });
  } catch (err) {
    console.error('Unpin message error:', err);
    res.status(500).json({ error: 'Failed to unpin message.' });
  }
});

// GET /api/messages/:id/reactions - get detailed list of users who reacted
router.get('/:id/reactions', authMiddleware, async (req, res) => {
  try {
    const msgId = req.params.id;
    const reactions = await query(
      `SELECT mr.emoji, mr.user_id, mr.created_at, u.username, u.user_id as user_handle, u.avatar_url
       FROM message_reactions mr
       JOIN users u ON u.id = mr.user_id
       WHERE mr.message_id = ?
       ORDER BY mr.created_at ASC`,
      [msgId]
    );

    res.json({ reactions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get reactions.' });
  }
});

// DELETE /api/messages/:id - delete message (delete_type: 'everyone' | 'me')
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const msgId = req.params.id;
    const deleteType = req.body?.delete_type || req.query?.delete_type || 'everyone';

    const msg = await queryOne(`SELECT * FROM messages WHERE id = ?`, [msgId]);
    if (!msg) return res.status(404).json({ error: 'Message not found.' });

    // Verify membership in conversation
    const member = await queryOne(
      `SELECT role FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      [msg.conversation_id, req.user.id]
    );
    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this conversation.' });
    }

    if (deleteType === 'me') {
      // Hide message for this user only
      const existing = await queryOne(
        `SELECT id FROM hidden_messages WHERE user_id = ? AND message_id = ?`,
        [req.user.id, msgId]
      );
      if (!existing) {
        await run(
          `INSERT INTO hidden_messages (id, user_id, message_id, created_at) VALUES (?, ?, ?, ?)`,
          [uuidv4(), req.user.id, msgId, new Date().toISOString()]
        );
      }

      if (req.app.get('io')) {
        req.app.get('io').to(`user_${req.user.id}`).emit('message_deleted', {
          id: msgId,
          conversation_id: msg.conversation_id,
          delete_type: 'me'
        });
      }

      return res.json({ success: true, message: 'Message deleted for you.', delete_type: 'me' });
    }

    // Delete for everyone
    let allowed = msg.sender_id === req.user.id;
    if (!allowed && (member.role === 'owner' || member.role === 'admin')) {
      allowed = true;
    }

    if (!allowed) {
      return res.status(403).json({ error: 'You do not have permission to delete this message for everyone.' });
    }

    await run(`UPDATE messages SET content = 'This message was deleted', is_deleted = 1 WHERE id = ?`, [msgId]);

    // Also remove any active pins for this message
    await run(`DELETE FROM pinned_messages WHERE message_id = ?`, [msgId]);
    await run(
      `UPDATE conversations SET pinned_message_id = NULL WHERE pinned_message_id = ?`,
      [msgId]
    );

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`conv_${msg.conversation_id}`).emit('message_deleted', {
        id: msgId,
        conversation_id: msg.conversation_id,
        delete_type: 'everyone'
      });
    }

    res.json({ success: true, message: 'Message deleted for everyone.', delete_type: 'everyone' });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ error: 'Failed to delete message.' });
  }
});

// POST /api/messages/batch-delete - batch delete messages (delete_type: 'everyone' | 'me')
router.post('/batch-delete', authMiddleware, async (req, res) => {
  try {
    const { message_ids, delete_type = 'me' } = req.body;
    if (!Array.isArray(message_ids) || message_ids.length === 0) {
      return res.status(400).json({ error: 'message_ids array is required.' });
    }

    const io = req.app.get('io');
    const now = new Date().toISOString();
    let deletedCount = 0;

    for (const msgId of message_ids) {
      const msg = await queryOne(`SELECT * FROM messages WHERE id = ?`, [msgId]);
      if (!msg) continue;

      const member = await queryOne(
        `SELECT role FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
        [msg.conversation_id, req.user.id]
      );
      if (!member) continue;

      if (delete_type === 'me') {
        const existing = await queryOne(
          `SELECT id FROM hidden_messages WHERE user_id = ? AND message_id = ?`,
          [req.user.id, msgId]
        );
        if (!existing) {
          await run(
            `INSERT INTO hidden_messages (id, user_id, message_id, created_at) VALUES (?, ?, ?, ?)`,
            [uuidv4(), req.user.id, msgId, now]
          );
        }
        if (io) {
          io.to(`user_${req.user.id}`).emit('message_deleted', {
            id: msgId,
            conversation_id: msg.conversation_id,
            delete_type: 'me'
          });
        }
        deletedCount++;
      } else {
        // Everyone
        const allowed = msg.sender_id === req.user.id || member.role === 'owner' || member.role === 'admin';
        if (allowed) {
          await run(`UPDATE messages SET content = 'This message was deleted', is_deleted = 1 WHERE id = ?`, [msgId]);
          await run(`DELETE FROM pinned_messages WHERE message_id = ?`, [msgId]);
          if (io) {
            io.to(`conv_${msg.conversation_id}`).emit('message_deleted', {
              id: msgId,
              conversation_id: msg.conversation_id,
              delete_type: 'everyone'
            });
          }
          deletedCount++;
        }
      }
    }

    res.json({ success: true, deleted_count: deletedCount });
  } catch (err) {
    console.error('Batch delete error:', err);
    res.status(500).json({ error: 'Failed to batch delete messages.' });
  }
});

// POST /api/messages/:id/react - toggle reaction
router.post('/:id/react', authMiddleware, async (req, res) => {
  try {
    const msgId = req.params.id;
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ error: 'Emoji required.' });

    const msg = await queryOne(`SELECT id, conversation_id FROM messages WHERE id = ?`, [msgId]);
    if (!msg) return res.status(404).json({ error: 'Message not found.' });

    // Check if user already reacted with this exact emoji
    const existing = await queryOne(
      `SELECT id FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?`,
      [msgId, req.user.id, emoji]
    );

    if (existing) {
      // Remove reaction
      await run(`DELETE FROM message_reactions WHERE id = ?`, [existing.id]);
    } else {
      // Add reaction
      const now = new Date().toISOString();
      await run(
        `INSERT INTO message_reactions (id, message_id, user_id, emoji, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), msgId, req.user.id, emoji, now]
      );
    }

    // Get updated reactions list
    const reactions = await query(
      `SELECT mr.emoji, mr.user_id, u.username
       FROM message_reactions mr
       JOIN users u ON u.id = mr.user_id
       WHERE mr.message_id = ?`,
      [msgId]
    );

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`conv_${msg.conversation_id}`).emit('message_reaction_update', {
        message_id: msgId,
        conversation_id: msg.conversation_id,
        reactions
      });
    }

    res.json({ success: true, reactions });
  } catch (err) {
    console.error('React error:', err);
    res.status(500).json({ error: 'Failed to update reaction.' });
  }
});

export default router;
