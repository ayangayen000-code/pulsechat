import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, run } from '../db/database.js';
import { signToken, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Clean & normalize User ID handle
 */
function normalizeUserId(id) {
  if (!id) return '';
  let cleaned = id.trim();
  if (!cleaned.startsWith('@')) {
    cleaned = '@' + cleaned;
  }
  return cleaned.toLowerCase();
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, user_id, password, avatar_url, bio } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username is required.' });
    }
    if (!user_id || !user_id.trim()) {
      return res.status(400).json({ error: 'Unique User ID is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const normalizedHandle = normalizeUserId(user_id);
    if (!/^@[a-z0-9_]{3,24}$/.test(normalizedHandle)) {
      return res.status(400).json({
        error: 'User ID must be 3-24 characters containing letters, numbers, or underscores (e.g. @ayan_4821)'
      });
    }

    const existingUser = await queryOne('SELECT id FROM users WHERE LOWER(user_id) = ?', [normalizedHandle]);
    if (existingUser) {
      return res.status(409).json({ error: 'This User ID is already taken. Please pick another one.' });
    }

    const id = 'usr_' + uuidv4().replace(/-/g, '').slice(0, 12);
    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();

    await run(
      `INSERT INTO users (id, user_id, username, password_hash, avatar_url, bio, status, last_seen, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'online', ?, ?)`,
      [id, normalizedHandle, username.trim(), passwordHash, avatar_url || '', bio || '', now, now]
    );

    // Initialize user settings
    await run(
      `INSERT INTO user_settings (user_id, theme, accent_color, enter_to_send, sound_enabled, desktop_notifications)
       VALUES (?, 'dark', 'indigo', 1, 1, 1)`,
      [id]
    );

    const user = {
      id,
      user_id: normalizedHandle,
      username: username.trim(),
      avatar_url: avatar_url || '',
      bio: bio || '',
      status: 'online',
      last_seen: now,
      created_at: now
    };

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during account registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide both User ID / Username and Password.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const withAt = cleanId.startsWith('@') ? cleanId : '@' + cleanId;

    const user = await queryOne(
      `SELECT * FROM users WHERE LOWER(user_id) = ? OR LOWER(user_id) = ? OR LOWER(username) = ?`,
      [cleanId, withAt, cleanId]
    );

    if (!user) {
      return res.status(401).json({ error: 'No account found matching those credentials.' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    // Update status to online
    const now = new Date().toISOString();
    await run(`UPDATE users SET status = 'online', last_seen = ? WHERE id = ?`, [now, user.id]);

    const safeUser = {
      id: user.id,
      user_id: user.user_id,
      username: user.username,
      avatar_url: user.avatar_url,
      bio: user.bio,
      status: 'online',
      last_seen: now,
      created_at: user.created_at
    };

    const token = signToken(safeUser);
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await queryOne(
      `SELECT id, user_id, username, avatar_url, bio, status, last_seen, created_at FROM users WHERE id = ?`,
      [req.user.id]
    );

    const pendingRequests = await queryOne(
      `SELECT COUNT(*) as count FROM friend_requests WHERE receiver_id = ? AND status = 'pending'`,
      [req.user.id]
    );

    const unreadNotifications = await queryOne(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [req.user.id]
    );

    const settings = await queryOne(`SELECT * FROM user_settings WHERE user_id = ?`, [req.user.id]);

    res.json({
      user,
      pendingRequestsCount: pendingRequests ? pendingRequests.count : 0,
      unreadNotificationsCount: unreadNotifications ? unreadNotifications.count : 0,
      settings: settings || {}
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const user = await queryOne('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const valid = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const now = new Date().toISOString();
    await run(`UPDATE users SET status = 'offline', last_seen = ? WHERE id = ?`, [now, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process logout.' });
  }
});

export default router;
