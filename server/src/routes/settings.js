import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, queryOne, run } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_BASE = path.resolve(__dirname, '../../uploads');

function getFolderSize(dirPath) {
  let size = 0;
  let count = 0;
  if (!fs.existsSync(dirPath)) return { size, count };

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      size += stat.size;
      count++;
    }
  }
  return { size, count };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// GET /api/settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    let settings = await queryOne(`SELECT * FROM user_settings WHERE user_id = ?`, [req.user.id]);
    if (!settings) {
      await run(
        `INSERT INTO user_settings (user_id, theme, accent_color, enter_to_send, sound_enabled, desktop_notifications)
         VALUES (?, 'dark', 'indigo', 1, 1, 1)`,
        [req.user.id]
      );
      settings = await queryOne(`SELECT * FROM user_settings WHERE user_id = ?`, [req.user.id]);
    }

    res.json({
      settings: {
        ...settings,
        enter_to_send: settings.enter_to_send === 1,
        sound_enabled: settings.sound_enabled === 1,
        desktop_notifications: settings.desktop_notifications === 1,
        media_auto_download: settings.media_auto_download === 1
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load settings.' });
  }
});

// PUT /api/settings
router.put('/', authMiddleware, async (req, res) => {
  try {
    const {
      theme,
      accent_color,
      chat_wallpaper,
      enter_to_send,
      sound_enabled,
      desktop_notifications,
      privacy_requests,
      privacy_online,
      privacy_last_seen,
      media_auto_download
    } = req.body;

    const updates = [];
    const params = [];

    if (theme !== undefined) {
      updates.push('theme = ?');
      params.push(theme);
    }
    if (accent_color !== undefined) {
      updates.push('accent_color = ?');
      params.push(accent_color);
    }
    if (chat_wallpaper !== undefined) {
      updates.push('chat_wallpaper = ?');
      params.push(chat_wallpaper);
    }
    if (enter_to_send !== undefined) {
      updates.push('enter_to_send = ?');
      params.push(enter_to_send ? 1 : 0);
    }
    if (sound_enabled !== undefined) {
      updates.push('sound_enabled = ?');
      params.push(sound_enabled ? 1 : 0);
    }
    if (desktop_notifications !== undefined) {
      updates.push('desktop_notifications = ?');
      params.push(desktop_notifications ? 1 : 0);
    }
    if (privacy_requests !== undefined) {
      updates.push('privacy_requests = ?');
      params.push(privacy_requests);
    }
    if (privacy_online !== undefined) {
      updates.push('privacy_online = ?');
      params.push(privacy_online);
    }
    if (privacy_last_seen !== undefined) {
      updates.push('privacy_last_seen = ?');
      params.push(privacy_last_seen);
    }
    if (media_auto_download !== undefined) {
      updates.push('media_auto_download = ?');
      params.push(media_auto_download ? 1 : 0);
    }

    if (updates.length > 0) {
      params.push(req.user.id);
      await run(`UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = ?`, params);
    }

    const updated = await queryOne(`SELECT * FROM user_settings WHERE user_id = ?`, [req.user.id]);
    res.json({
      settings: {
        ...updated,
        enter_to_send: updated.enter_to_send === 1,
        sound_enabled: updated.sound_enabled === 1,
        desktop_notifications: updated.desktop_notifications === 1,
        media_auto_download: updated.media_auto_download === 1
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// GET /api/settings/storage
router.get('/storage', authMiddleware, async (req, res) => {
  try {
    const images = getFolderSize(path.join(UPLOADS_BASE, 'images'));
    const videos = getFolderSize(path.join(UPLOADS_BASE, 'videos'));
    const audio = getFolderSize(path.join(UPLOADS_BASE, 'audio'));
    const documents = getFolderSize(path.join(UPLOADS_BASE, 'documents'));
    const stickers = getFolderSize(path.join(UPLOADS_BASE, 'stickers'));

    const totalBytes = images.size + videos.size + audio.size + documents.size + stickers.size;

    res.json({
      storage: {
        total: formatBytes(totalBytes),
        totalBytes,
        breakdown: [
          { category: 'Images', size: formatBytes(images.size), bytes: images.size, count: images.count },
          { category: 'Videos', size: formatBytes(videos.size), bytes: videos.size, count: videos.count },
          { category: 'Voice & Audio', size: formatBytes(audio.size), bytes: audio.size, count: audio.count },
          { category: 'Documents', size: formatBytes(documents.size), bytes: documents.size, count: documents.count },
          { category: 'Stickers', size: formatBytes(stickers.size), bytes: stickers.size, count: stickers.count }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute storage statistics.' });
  }
});

// DELETE /api/settings/account - Delete Account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Remove user friendships
    await run(`DELETE FROM friends WHERE user_id_1 = ? OR user_id_2 = ?`, [userId, userId]);
    // Remove friend requests
    await run(`DELETE FROM friend_requests WHERE sender_id = ? OR receiver_id = ?`, [userId, userId]);
    // Remove conversation memberships
    await run(`DELETE FROM conversation_members WHERE user_id = ?`, [userId]);
    // Remove notifications
    await run(`DELETE FROM notifications WHERE user_id = ? OR sender_id = ?`, [userId, userId]);
    // Remove settings
    await run(`DELETE FROM user_settings WHERE user_id = ?`, [userId]);
    // Remove user
    await run(`DELETE FROM users WHERE id = ?`, [userId]);

    res.json({ success: true, message: 'Account deleted permanently.' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

export default router;
