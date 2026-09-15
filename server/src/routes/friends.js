import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/friends - list all accepted friends
router.get('/', authMiddleware, async (req, res) => {
  try {
    const friends = await query(
      `SELECT u.id, u.user_id, u.username, u.avatar_url, u.bio, u.status, u.last_seen, f.created_at as friendship_date
       FROM friends f
       JOIN users u ON (u.id = CASE WHEN f.user_id_1 = ? THEN f.user_id_2 ELSE f.user_id_1 END)
       WHERE (f.user_id_1 = ? OR f.user_id_2 = ?) AND f.status = 'accepted'
       ORDER BY u.status = 'online' DESC, u.username ASC`,
      [req.user.id, req.user.id, req.user.id]
    );

    res.json({ friends });
  } catch (err) {
    console.error('List friends error:', err);
    res.status(500).json({ error: 'Failed to retrieve friends.' });
  }
});

// GET /api/friends/requests - incoming requests
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const requests = await query(
      `SELECT r.id as request_id, r.created_at, u.id, u.user_id, u.username, u.avatar_url, u.bio, u.status
       FROM friend_requests r
       JOIN users u ON u.id = r.sender_id
       WHERE r.receiver_id = ? AND r.status = 'pending'
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve incoming requests.' });
  }
});

// GET /api/friends/sent - sent requests
router.get('/sent', authMiddleware, async (req, res) => {
  try {
    const sent = await query(
      `SELECT r.id as request_id, r.created_at, u.id, u.user_id, u.username, u.avatar_url, u.bio, u.status
       FROM friend_requests r
       JOIN users u ON u.id = r.receiver_id
       WHERE r.sender_id = ? AND r.status = 'pending'
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json({ sent });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve sent requests.' });
  }
});

// GET /api/friends/blocked - blocked users
router.get('/blocked', authMiddleware, async (req, res) => {
  try {
    const blocked = await query(
      `SELECT u.id, u.user_id, u.username, u.avatar_url, f.created_at
       FROM friends f
       JOIN users u ON (u.id = CASE WHEN f.user_id_1 = ? THEN f.user_id_2 ELSE f.user_id_1 END)
       WHERE (f.user_id_1 = ? OR f.user_id_2 = ?) AND f.status = 'blocked' AND f.blocked_by = ?`,
      [req.user.id, req.user.id, req.user.id, req.user.id]
    );

    res.json({ blocked });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve blocked users.' });
  }
});

// POST /api/friends/request - send friend request by userId or handle
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user is required.' });
    }

    const cleanTarget = targetUserId.trim().toLowerCase();
    const withAt = cleanTarget.startsWith('@') ? cleanTarget : '@' + cleanTarget;

    const target = await queryOne(
      `SELECT id, user_id, username FROM users WHERE id = ? OR LOWER(user_id) = ? OR LOWER(user_id) = ?`,
      [cleanTarget, cleanTarget, withAt]
    );

    if (!target) {
      return res.status(404).json({ error: `User "${targetUserId}" not found.` });
    }

    if (target.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot send a friend request to yourself.' });
    }

    // Check if blocked
    const isBlocked = await queryOne(
      `SELECT id, blocked_by FROM friends WHERE ((user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)) AND status = 'blocked'`,
      [req.user.id, target.id, target.id, req.user.id]
    );
    if (isBlocked) {
      return res.status(403).json({ error: 'Cannot send request to this user.' });
    }

    // Check if already friends
    const isFriend = await queryOne(
      `SELECT id FROM friends WHERE ((user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)) AND status = 'accepted'`,
      [req.user.id, target.id, target.id, req.user.id]
    );
    if (isFriend) {
      return res.status(400).json({ error: 'You are already friends with this user.' });
    }

    // Check if pending request exists
    const existingReq = await queryOne(
      `SELECT id, sender_id, status FROM friend_requests
       WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND status = 'pending'`,
      [req.user.id, target.id, target.id, req.user.id]
    );

    if (existingReq) {
      if (existingReq.sender_id === req.user.id) {
        return res.status(400).json({ error: 'Friend request already sent.' });
      } else {
        // Auto-accept if reciprocal
        const now = new Date().toISOString();
        await run(`UPDATE friend_requests SET status = 'accepted' WHERE id = ?`, [existingReq.id]);
        await run(
          `INSERT INTO friends (id, user_id_1, user_id_2, status, created_at) VALUES (?, ?, ?, 'accepted', ?)`,
          [uuidv4(), req.user.id, target.id, now]
        );
        return res.json({ success: true, message: `Connected with ${target.username}!`, autoAccepted: true });
      }
    }

    const requestId = 'req_' + uuidv4().replace(/-/g, '').slice(0, 12);
    const now = new Date().toISOString();

    await run(
      `INSERT INTO friend_requests (id, sender_id, receiver_id, status, created_at) VALUES (?, ?, ?, 'pending', ?)`,
      [requestId, req.user.id, target.id, now]
    );

    // Create notification for target
    const notifId = uuidv4();
    await run(
      `INSERT INTO notifications (id, user_id, sender_id, type, title, content, data, is_read, created_at)
       VALUES (?, ?, ?, 'friend_request', 'New Friend Request', ?, ?, 0, ?)`,
      [
        notifId,
        target.id,
        req.user.id,
        `${req.user.username} (${req.user.user_id}) sent you a friend request`,
        JSON.stringify({ requestId, senderId: req.user.id, username: req.user.username }),
        now
      ]
    );

    // Trigger socket notification if app socket io is attached
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`user_${target.id}`).emit('notification', {
        id: notifId,
        type: 'friend_request',
        title: 'New Friend Request',
        content: `${req.user.username} sent you a friend request`,
        sender: req.user
      });
      io.to(`user_${target.id}`).emit('friend_request_received', {
        requestId,
        sender: req.user
      });
    }

    res.json({ success: true, message: `Friend request sent to ${target.username} (${target.user_id})` });
  } catch (err) {
    console.error('Send friend request error:', err);
    res.status(500).json({ error: 'Failed to send friend request.' });
  }
});

// POST /api/friends/accept
router.post('/accept', authMiddleware, async (req, res) => {
  try {
    const { requestId, senderId } = req.body;

    let request;
    if (requestId) {
      request = await queryOne(`SELECT * FROM friend_requests WHERE id = ? AND receiver_id = ? AND status = 'pending'`, [requestId, req.user.id]);
    } else if (senderId) {
      request = await queryOne(`SELECT * FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'`, [senderId, req.user.id]);
    }

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found or already handled.' });
    }

    const now = new Date().toISOString();
    await run(`UPDATE friend_requests SET status = 'accepted' WHERE id = ?`, [request.id]);

    await run(
      `INSERT INTO friends (id, user_id_1, user_id_2, status, created_at) VALUES (?, ?, ?, 'accepted', ?)`,
      [uuidv4(), request.sender_id, request.receiver_id, now]
    );

    // Notify original sender
    const notifId = uuidv4();
    await run(
      `INSERT INTO notifications (id, user_id, sender_id, type, title, content, data, is_read, created_at)
       VALUES (?, ?, ?, 'friend_accepted', 'Friend Request Accepted', ?, ?, 0, ?)`,
      [
        notifId,
        request.sender_id,
        req.user.id,
        `${req.user.username} accepted your friend request`,
        JSON.stringify({ friendId: req.user.id }),
        now
      ]
    );

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`user_${request.sender_id}`).emit('notification', {
        id: notifId,
        type: 'friend_accepted',
        title: 'Friend Request Accepted',
        content: `${req.user.username} accepted your friend request`,
        user: req.user
      });
      io.to(`user_${request.sender_id}`).emit('friend_status_change', {
        friendId: req.user.id,
        status: 'accepted'
      });
    }

    res.json({ success: true, message: 'Friend request accepted.' });
  } catch (err) {
    console.error('Accept friend request error:', err);
    res.status(500).json({ error: 'Failed to accept friend request.' });
  }
});

// POST /api/friends/reject
router.post('/reject', authMiddleware, async (req, res) => {
  try {
    const { requestId, senderId } = req.body;
    let request;
    if (requestId) {
      request = await queryOne(`SELECT id FROM friend_requests WHERE id = ? AND receiver_id = ?`, [requestId, req.user.id]);
    } else if (senderId) {
      request = await queryOne(`SELECT id FROM friend_requests WHERE sender_id = ? AND receiver_id = ?`, [senderId, req.user.id]);
    }

    if (!request) return res.status(404).json({ error: 'Request not found.' });

    await run(`UPDATE friend_requests SET status = 'rejected' WHERE id = ?`, [request.id]);
    res.json({ success: true, message: 'Friend request declined.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to decline friend request.' });
  }
});

// POST /api/friends/cancel
router.post('/cancel', authMiddleware, async (req, res) => {
  try {
    const { requestId, targetUserId } = req.body;
    let request;
    if (requestId) {
      request = await queryOne(`SELECT id FROM friend_requests WHERE id = ? AND sender_id = ?`, [requestId, req.user.id]);
    } else if (targetUserId) {
      request = await queryOne(`SELECT id FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'`, [req.user.id, targetUserId]);
    }

    if (!request) return res.status(404).json({ error: 'Request not found.' });

    await run(`DELETE FROM friend_requests WHERE id = ?`, [request.id]);
    res.json({ success: true, message: 'Friend request cancelled.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel friend request.' });
  }
});

// POST /api/friends/remove
router.post('/remove', authMiddleware, async (req, res) => {
  try {
    const { friendId } = req.body;
    if (!friendId) return res.status(400).json({ error: 'Friend ID required.' });

    await run(
      `DELETE FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)`,
      [req.user.id, friendId, friendId, req.user.id]
    );

    res.json({ success: true, message: 'Friend removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove friend.' });
  }
});

// POST /api/friends/block
router.post('/block', authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ error: 'Target user required.' });

    const now = new Date().toISOString();
    const existing = await queryOne(
      `SELECT id FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)`,
      [req.user.id, targetUserId, targetUserId, req.user.id]
    );

    if (existing) {
      await run(`UPDATE friends SET status = 'blocked', blocked_by = ? WHERE id = ?`, [req.user.id, existing.id]);
    } else {
      await run(
        `INSERT INTO friends (id, user_id_1, user_id_2, status, blocked_by, created_at) VALUES (?, ?, ?, 'blocked', ?, ?)`,
        [uuidv4(), req.user.id, targetUserId, req.user.id, now]
      );
    }

    res.json({ success: true, message: 'User blocked.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to block user.' });
  }
});

// POST /api/friends/unblock
router.post('/unblock', authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    await run(
      `DELETE FROM friends WHERE ((user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)) AND status = 'blocked' AND blocked_by = ?`,
      [req.user.id, targetUserId, targetUserId, req.user.id, req.user.id]
    );

    res.json({ success: true, message: 'User unblocked.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unblock user.' });
  }
});

export default router;
