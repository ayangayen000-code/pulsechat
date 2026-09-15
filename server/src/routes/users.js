import express from 'express';
import { query, queryOne, run } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/search?q=query
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const rawQ = req.query.q || '';
    const q = rawQ.trim().toLowerCase();
    if (!q) return res.json({ users: [] });

    const cleanQ = q.startsWith('@') ? q : '%' + q + '%';

    const users = await query(
      `SELECT id, user_id, username, avatar_url, bio, status, last_seen
       FROM users
       WHERE (LOWER(user_id) LIKE ? OR LOWER(username) LIKE ?)
         AND id != ?
       LIMIT 20`,
      [cleanQ, '%' + q.replace(/^@/, '') + '%', req.user.id]
    );

    // Attach relationship status for each user
    const results = [];
    for (const u of users) {
      // Check if friend
      const isFriend = await queryOne(
        `SELECT id, status, blocked_by FROM friends
         WHERE ((user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?))`,
        [req.user.id, u.id, u.id, req.user.id]
      );

      let relationship = 'none';
      if (isFriend) {
        if (isFriend.status === 'blocked') {
          relationship = isFriend.blocked_by === req.user.id ? 'blocked_by_me' : 'blocked_by_them';
        } else {
          relationship = 'friends';
        }
      } else {
        // Check pending requests
        const pendingSent = await queryOne(
          `SELECT id FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'`,
          [req.user.id, u.id]
        );
        const pendingRecv = await queryOne(
          `SELECT id FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'`,
          [u.id, req.user.id]
        );

        if (pendingSent) relationship = 'request_sent';
        else if (pendingRecv) relationship = 'request_received';
      }

      results.push({ ...u, relationship });
    }

    res.json({ users: results });
  } catch (err) {
    console.error('Search users error:', err);
    res.status(500).json({ error: 'Failed to search users.' });
  }
});

// GET /api/users/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await queryOne(
      `SELECT id, user_id, username, avatar_url, bio, status, last_seen, created_at FROM users WHERE id = ? OR LOWER(user_id) = ?`,
      [req.params.id, req.params.id.toLowerCase()]
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Check relationship
    const isFriend = await queryOne(
      `SELECT status FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)`,
      [req.user.id, user.id, user.id, req.user.id]
    );

    res.json({ user, isFriend: !!isFriend && isFriend.status === 'accepted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// PUT /api/users/profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, bio, avatar_url, status } = req.body;

    const updates = [];
    const params = [];

    if (username !== undefined) {
      if (!username.trim()) return res.status(400).json({ error: 'Username cannot be empty.' });
      updates.push('username = ?');
      params.push(username.trim());
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      params.push(bio.trim());
    }
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      params.push(avatar_url);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) return res.json({ user: req.user });

    params.push(req.user.id);
    await run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    const updatedUser = await queryOne(
      `SELECT id, user_id, username, avatar_url, bio, status, last_seen, created_at FROM users WHERE id = ?`,
      [req.user.id]
    );

    res.json({ user: updatedUser });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
