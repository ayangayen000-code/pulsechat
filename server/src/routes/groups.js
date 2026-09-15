import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/groups - create group
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, avatar_url, memberIds } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group name is required.' });
    }

    const convId = 'grp_' + uuidv4().replace(/-/g, '').slice(0, 12);
    const now = new Date().toISOString();

    await run(
      `INSERT INTO conversations (id, type, name, avatar_url, description, created_by, created_at, updated_at)
       VALUES (?, 'group', ?, ?, ?, ?, ?, ?)`,
      [convId, name.trim(), avatar_url || '', description || '', req.user.id, now, now]
    );

    // Add creator as owner
    await run(
      `INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at)
       VALUES (?, ?, ?, 'owner', ?)`,
      [uuidv4(), convId, req.user.id, now]
    );

    // Add selected members
    if (Array.isArray(memberIds)) {
      for (const mId of memberIds) {
        if (mId !== req.user.id) {
          await run(
            `INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at)
             VALUES (?, ?, ?, 'member', ?)`,
            [uuidv4(), convId, mId, now]
          );

          // Notify added member
          const notifId = uuidv4();
          await run(
            `INSERT INTO notifications (id, user_id, sender_id, type, title, content, data, is_read, created_at)
             VALUES (?, ?, ?, 'added_to_group', 'Added to Group', ?, ?, 0, ?)`,
            [
              notifId,
              mId,
              req.user.id,
              `${req.user.username} added you to the group "${name.trim()}"`,
              JSON.stringify({ conversationId: convId, groupName: name.trim() }),
              now
            ]
          );
        }
      }
    }

    // System welcome message
    const welcomeMsgId = 'msg_' + uuidv4().replace(/-/g, '').slice(0, 12);
    await run(
      `INSERT INTO messages (id, conversation_id, sender_id, type, content, created_at)
       VALUES (?, ?, ?, 'text', ?, ?)`,
      [welcomeMsgId, convId, req.user.id, `Created the group "${name.trim()}" ✨`, now]
    );

    res.status(201).json({ conversationId: convId, name: name.trim() });
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'Failed to create group.' });
  }
});

// GET /api/groups/:id - get group details and members
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const convId = req.params.id;

    // Check membership
    const member = await queryOne(
      `SELECT * FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      [convId, req.user.id]
    );
    if (!member) return res.status(403).json({ error: 'You are not a member of this group.' });

    const group = await queryOne(
      `SELECT c.*, u.username as creator_name
       FROM conversations c
       LEFT JOIN users u ON u.id = c.created_by
       WHERE c.id = ? AND c.type = 'group'`,
      [convId]
    );
    if (!group) return res.status(404).json({ error: 'Group not found.' });

    const members = await query(
      `SELECT cm.role, cm.joined_at, u.id, u.user_id, u.username, u.avatar_url, u.status, u.bio
       FROM conversation_members cm
       JOIN users u ON u.id = cm.user_id
       WHERE cm.conversation_id = ?
       ORDER BY CASE WHEN cm.role = 'owner' THEN 1 WHEN cm.role = 'admin' THEN 2 ELSE 3 END, u.username ASC`,
      [convId]
    );

    // Pinned message if present
    let pinnedMessage = null;
    if (group.pinned_message_id) {
      pinnedMessage = await queryOne(
        `SELECT m.*, u.username as sender_name
         FROM messages m
         JOIN users u ON u.id = m.sender_id
         WHERE m.id = ?`,
        [group.pinned_message_id]
      );
    }

    res.json({
      group: {
        ...group,
        myRole: member.role,
        pinnedMessage,
        members
      }
    });
  } catch (err) {
    console.error('Get group error:', err);
    res.status(500).json({ error: 'Failed to load group details.' });
  }
});

// POST /api/groups/:id/members - add members
router.post('/:id/members', authMiddleware, async (req, res) => {
  try {
    const convId = req.params.id;
    const { targetUserId } = req.body;

    // Verify requesting user is admin/owner
    const myRole = await queryOne(
      `SELECT role FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      [convId, req.user.id]
    );
    if (!myRole || (myRole.role !== 'owner' && myRole.role !== 'admin')) {
      return res.status(403).json({ error: 'Only group admins can add members.' });
    }

    const cleanTarget = targetUserId.trim().toLowerCase();
    const withAt = cleanTarget.startsWith('@') ? cleanTarget : '@' + cleanTarget;
    const target = await queryOne(
      `SELECT id, username, user_id FROM users WHERE id = ? OR LOWER(user_id) = ? OR LOWER(user_id) = ?`,
      [cleanTarget, cleanTarget, withAt]
    );
    if (!target) return res.status(404).json({ error: 'User not found.' });

    // Check if already member
    const existing = await queryOne(
      `SELECT id FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      [convId, target.id]
    );
    if (existing) return res.status(400).json({ error: 'User is already in this group.' });

    const now = new Date().toISOString();
    await run(
      `INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at)
       VALUES (?, ?, ?, 'member', ?)`,
      [uuidv4(), convId, target.id, now]
    );

    // System message
    await run(
      `INSERT INTO messages (id, conversation_id, sender_id, type, content, created_at)
       VALUES (?, ?, ?, 'text', ?, ?)`,
      ['msg_' + uuidv4().replace(/-/g, '').slice(0, 12), convId, req.user.id, `Added ${target.username} to the group`, now]
    );

    res.json({ success: true, message: `Added ${target.username} to group.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add member.' });
  }
});

// DELETE /api/groups/:id/members/:userId - kick member
router.delete('/:id/members/:userId', authMiddleware, async (req, res) => {
  try {
    const convId = req.params.id;
    const targetUserId = req.params.userId;

    const myRole = await queryOne(
      `SELECT role FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      [convId, req.user.id]
    );
    if (!myRole || (myRole.role !== 'owner' && myRole.role !== 'admin')) {
      return res.status(403).json({ error: 'Only admins can remove members.' });
    }

    await run(`DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?`, [convId, targetUserId]);
    res.json({ success: true, message: 'Member removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove member.' });
  }
});

// POST /api/groups/:id/role - promote/demote admin
router.post('/:id/role', authMiddleware, async (req, res) => {
  try {
    const convId = req.params.id;
    const { targetUserId, role } = req.body;

    const myRole = await queryOne(
      `SELECT role FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      [convId, req.user.id]
    );
    if (!myRole || myRole.role !== 'owner') {
      return res.status(403).json({ error: 'Only group owners can update member roles.' });
    }

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    await run(`UPDATE conversation_members SET role = ? WHERE conversation_id = ? AND user_id = ?`, [role, convId, targetUserId]);
    res.json({ success: true, message: `Role updated to ${role}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update member role.' });
  }
});

// PUT /api/groups/:id - update group details
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const convId = req.params.id;
    const { name, description, avatar_url, pinned_message_id } = req.body;

    const myRole = await queryOne(
      `SELECT role FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      [convId, req.user.id]
    );
    if (!myRole || (myRole.role !== 'owner' && myRole.role !== 'admin')) {
      return res.status(403).json({ error: 'Only admins can update group settings.' });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description.trim());
    }
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      params.push(avatar_url);
    }
    if (pinned_message_id !== undefined) {
      updates.push('pinned_message_id = ?');
      params.push(pinned_message_id);
    }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(convId);
      await run(`UPDATE conversations SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update group.' });
  }
});

// POST /api/groups/:id/leave
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const convId = req.params.id;
    await run(`DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?`, [convId, req.user.id]);

    const now = new Date().toISOString();
    await run(
      `INSERT INTO messages (id, conversation_id, sender_id, type, content, created_at)
       VALUES (?, ?, ?, 'text', ?, ?)`,
      ['msg_' + uuidv4().replace(/-/g, '').slice(0, 12), convId, req.user.id, `${req.user.username} left the group`, now]
    );

    res.json({ success: true, message: 'You left the group.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to leave group.' });
  }
});

export default router;
