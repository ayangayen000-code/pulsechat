import express from 'express';
import { query, queryOne, run } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rawNotifications = await query(
      `SELECT n.*, u.username as sender_name, u.user_id as sender_handle, u.avatar_url as sender_avatar
       FROM notifications n
       LEFT JOIN users u ON u.id = n.sender_id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    const notifications = rawNotifications.map(n => {
      let dataObj = null;
      if (n.data) {
        try {
          dataObj = JSON.parse(n.data);
        } catch (e) {
          dataObj = n.data;
        }
      }
      return {
        ...n,
        is_read: n.is_read === 1,
        data: dataObj
      };
    });

    res.json({ notifications });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Failed to load notifications.' });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', authMiddleware, async (req, res) => {
  try {
    await run(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

// POST /api/notifications/:id/read
router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    await run(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification read.' });
  }
});

// DELETE /api/notifications
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await run(`DELETE FROM notifications WHERE user_id = ?`, [req.user.id]);
    res.json({ success: true, message: 'All notifications cleared.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear notifications.' });
  }
});

export default router;
