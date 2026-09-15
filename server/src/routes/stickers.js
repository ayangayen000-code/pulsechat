import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

export const STORE_CATEGORIES = [
  '☕ Cute & Cozy',
  '🎌 Anime',
  '🐱 Animals',
  '😂 Funny',
  '💕 Love & Romance',
  '😎 Meme / Reactions',
  '🎮 Gaming',
  '🌈 Cute Characters',
  '🍔 Food',
  '✨ Fantasy',
  '🌙 Aesthetic',
  '🎃 Seasonal',
  '🎉 Celebration',
  '😭 Emotional',
  '🧸 Kawaii',
  '🤪 Crazy / Fun'
];

// GET /api/stickers/categories - list all categories with pack counts
router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const packs = await query(`SELECT category FROM sticker_packs`);
    const countMap = {};
    for (const p of packs) {
      countMap[p.category] = (countMap[p.category] || 0) + 1;
    }

    const categories = STORE_CATEGORIES.map((cat) => {
      const count = countMap[cat] || 0;
      return {
        name: cat,
        count
      };
    });

    res.json({ categories });
  } catch (err) {
    console.error('List sticker categories error:', err);
    res.status(500).json({ error: 'Failed to load sticker categories.' });
  }
});

// GET /api/stickers/store - browse sticker store with filters & search
router.get('/store', authMiddleware, async (req, res) => {
  try {
    const { tab, category, q } = req.query;
    const userId = req.user.id;

    let sql = `
      SELECT sp.*,
             (SELECT COUNT(*) FROM stickers s WHERE s.pack_id = sp.id) as sticker_count,
             (SELECT 1 FROM user_sticker_packs usp WHERE usp.user_id = ? AND usp.pack_id = sp.id) as is_installed
      FROM sticker_packs sp
      WHERE 1=1
    `;
    const params = [userId];

    // Filter by tab
    if (tab === 'featured') {
      sql += ` AND sp.is_featured = 1`;
    } else if (tab === 'popular') {
      sql += ` AND sp.is_popular = 1`;
    } else if (tab === 'new') {
      sql += ` AND sp.is_new = 1`;
    }

    // Filter strictly by category
    if (category && category !== 'All') {
      sql += ` AND sp.category = ?`;
      params.push(category);
    }

    // Search query
    if (q && q.trim()) {
      const searchPattern = `%${q.trim().toLowerCase()}%`;
      sql += ` AND (
        LOWER(sp.name) LIKE ? OR
        LOWER(sp.category) LIKE ? OR
        LOWER(sp.description) LIKE ? OR
        EXISTS (
          SELECT 1 FROM stickers s
          WHERE s.pack_id = sp.id AND (
            LOWER(s.name) LIKE ? OR
            LOWER(s.tags) LIKE ?
          )
        )
      )`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    sql += ` ORDER BY sp.is_featured DESC, sp.downloads_count DESC, sp.created_at DESC`;

    const packs = await query(sql, params);

    // Attach first 6 preview stickers for each pack
    const enrichedPacks = [];
    for (const p of packs) {
      const stickers = await query(
        `SELECT id, image_url, name, tags FROM stickers WHERE pack_id = ? ORDER BY sort_order ASC LIMIT 6`,
        [p.id]
      );
      enrichedPacks.push({
        ...p,
        is_installed: !!p.is_installed,
        stickers
      });
    }

    // Also include featured hero packs for the store banner
    const featuredPacks = await query(
      `SELECT sp.*,
              (SELECT COUNT(*) FROM stickers s WHERE s.pack_id = sp.id) as sticker_count,
              (SELECT 1 FROM user_sticker_packs usp WHERE usp.user_id = ? AND usp.pack_id = sp.id) as is_installed
       FROM sticker_packs sp
       WHERE sp.is_featured = 1
       ORDER BY sp.downloads_count DESC LIMIT 5`,
      [userId]
    );

    res.json({
      packs: enrichedPacks,
      featured: featuredPacks.map((p) => ({ ...p, is_installed: !!p.is_installed }))
    });
  } catch (err) {
    console.error('Store packs error:', err);
    res.status(500).json({ error: 'Failed to load store packs.' });
  }
});

// GET /api/stickers/packs - legacy alias for pack list
router.get('/packs', authMiddleware, async (req, res) => {
  try {
    const packs = await query(
      `SELECT sp.*, u.username as creator_name,
              (SELECT COUNT(*) FROM stickers s WHERE s.pack_id = sp.id) as sticker_count,
              (SELECT 1 FROM user_sticker_packs usp WHERE usp.user_id = ? AND usp.pack_id = sp.id) as is_installed
       FROM sticker_packs sp
       LEFT JOIN users u ON u.id = sp.creator_id
       ORDER BY sp.is_featured DESC, sp.downloads_count DESC`,
      [req.user.id]
    );

    const result = [];
    for (const p of packs) {
      const stickers = await query(
        `SELECT id, image_url, name, tags FROM stickers WHERE pack_id = ? ORDER BY sort_order ASC`,
        [p.id]
      );
      result.push({ ...p, is_installed: !!p.is_installed, stickers });
    }

    res.json({ packs: result });
  } catch (err) {
    console.error('List sticker packs error:', err);
    res.status(500).json({ error: 'Failed to load sticker packs.' });
  }
});

// GET /api/stickers/packs/:id - get single pack details with all stickers
router.get('/packs/:id', authMiddleware, async (req, res) => {
  try {
    const pack = await queryOne(
      `SELECT sp.*,
              (SELECT COUNT(*) FROM stickers s WHERE s.pack_id = sp.id) as sticker_count,
              (SELECT 1 FROM user_sticker_packs usp WHERE usp.user_id = ? AND usp.pack_id = sp.id) as is_installed
       FROM sticker_packs sp
       WHERE sp.id = ?`,
      [req.user.id, req.params.id]
    );

    if (!pack) return res.status(404).json({ error: 'Sticker pack not found.' });

    const stickers = await query(
      `SELECT id, pack_id, image_url, name, tags, animated, sort_order
       FROM stickers
       WHERE pack_id = ?
       ORDER BY sort_order ASC, created_at ASC`,
      [pack.id]
    );

    res.json({
      pack: { ...pack, is_installed: !!pack.is_installed },
      stickers
    });
  } catch (err) {
    console.error('Get single pack error:', err);
    res.status(500).json({ error: 'Failed to load sticker pack.' });
  }
});

// GET /api/stickers/my - get user's installed sticker packs
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const userPacks = await query(
      `SELECT sp.*, usp.sort_order as user_sort_order, usp.added_at,
              (SELECT COUNT(*) FROM stickers s WHERE s.pack_id = sp.id) as sticker_count
       FROM user_sticker_packs usp
       JOIN sticker_packs sp ON sp.id = usp.pack_id
       WHERE usp.user_id = ?
       ORDER BY usp.sort_order ASC, usp.added_at DESC`,
      [req.user.id]
    );

    const enriched = [];
    for (const p of userPacks) {
      const stickers = await query(
        `SELECT id, pack_id, image_url, name, tags, animated, sort_order
         FROM stickers
         WHERE pack_id = ?
         ORDER BY sort_order ASC, created_at ASC`,
        [p.id]
      );
      enriched.push({ ...p, is_installed: true, stickers });
    }

    res.json({ packs: enriched });
  } catch (err) {
    console.error('Get my stickers error:', err);
    res.status(500).json({ error: 'Failed to load your sticker library.' });
  }
});

// POST /api/stickers/my/:packId - install sticker pack to library
router.post('/my/:packId', authMiddleware, async (req, res) => {
  try {
    const packId = req.params.packId;
    const pack = await queryOne(`SELECT id FROM sticker_packs WHERE id = ?`, [packId]);
    if (!pack) return res.status(404).json({ error: 'Sticker pack not found.' });

    const existing = await queryOne(
      `SELECT id FROM user_sticker_packs WHERE user_id = ? AND pack_id = ?`,
      [req.user.id, packId]
    );

    if (!existing) {
      const maxOrder = await queryOne(
        `SELECT MAX(sort_order) as max_order FROM user_sticker_packs WHERE user_id = ?`,
        [req.user.id]
      );
      const nextOrder = (maxOrder && maxOrder.max_order !== null) ? maxOrder.max_order + 1 : 0;

      await run(
        `INSERT INTO user_sticker_packs (id, user_id, pack_id, sort_order, added_at)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), req.user.id, packId, nextOrder, new Date().toISOString()]
      );

      // Increment pack download count
      await run(`UPDATE sticker_packs SET downloads_count = downloads_count + 1 WHERE id = ?`, [packId]);
    }

    res.json({ success: true, is_installed: true, packId });
  } catch (err) {
    console.error('Install pack error:', err);
    res.status(500).json({ error: 'Failed to add sticker pack.' });
  }
});

// DELETE /api/stickers/my/:packId - uninstall sticker pack from library
router.delete('/my/:packId', authMiddleware, async (req, res) => {
  try {
    const packId = req.params.packId;
    await run(
      `DELETE FROM user_sticker_packs WHERE user_id = ? AND pack_id = ?`,
      [req.user.id, packId]
    );
    res.json({ success: true, is_installed: false, packId });
  } catch (err) {
    console.error('Uninstall pack error:', err);
    res.status(500).json({ error: 'Failed to remove sticker pack.' });
  }
});

// PUT /api/stickers/my/reorder - reorder user's installed sticker packs
router.put('/my/reorder', authMiddleware, async (req, res) => {
  try {
    const { packIds } = req.body;
    if (!Array.isArray(packIds)) {
      return res.status(400).json({ error: 'packIds array required.' });
    }

    for (let i = 0; i < packIds.length; i++) {
      await run(
        `UPDATE user_sticker_packs SET sort_order = ? WHERE user_id = ? AND pack_id = ?`,
        [i, req.user.id, packIds[i]]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Reorder packs error:', err);
    res.status(500).json({ error: 'Failed to reorder sticker packs.' });
  }
});

// GET /api/stickers/recent - get user's recent stickers
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    const recents = await query(
      `SELECT s.*, sp.name as pack_name, sp.icon_url as pack_icon, rs.last_used_at
       FROM recent_stickers rs
       JOIN stickers s ON s.id = rs.sticker_id
       LEFT JOIN sticker_packs sp ON sp.id = s.pack_id
       WHERE rs.user_id = ?
       ORDER BY rs.last_used_at DESC
       LIMIT 30`,
      [req.user.id]
    );
    res.json({ recent: recents });
  } catch (err) {
    console.error('Get recents error:', err);
    res.status(500).json({ error: 'Failed to load recent stickers.' });
  }
});

// POST /api/stickers/recent - track recently used sticker
router.post('/recent', authMiddleware, async (req, res) => {
  try {
    const { stickerId } = req.body;
    if (!stickerId) return res.status(400).json({ error: 'Sticker ID required.' });

    const now = new Date().toISOString();

    const existing = await queryOne(
      `SELECT id FROM recent_stickers WHERE user_id = ? AND sticker_id = ?`,
      [req.user.id, stickerId]
    );

    if (existing) {
      await run(`UPDATE recent_stickers SET last_used_at = ? WHERE id = ?`, [now, existing.id]);
    } else {
      await run(
        `INSERT INTO recent_stickers (id, user_id, sticker_id, last_used_at)
         VALUES (?, ?, ?, ?)`,
        [uuidv4(), req.user.id, stickerId, now]
      );
    }

    // Prune entries past 40
    const countRes = await queryOne(`SELECT COUNT(*) as count FROM recent_stickers WHERE user_id = ?`, [req.user.id]);
    if (countRes && countRes.count > 40) {
      await run(
        `DELETE FROM recent_stickers WHERE id NOT IN (
          SELECT id FROM recent_stickers WHERE user_id = ? ORDER BY last_used_at DESC LIMIT 40
        ) AND user_id = ?`,
        [req.user.id, req.user.id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Record recent sticker error:', err);
    res.status(500).json({ error: 'Failed to record recent sticker.' });
  }
});

// GET /api/stickers/favorites - get user's favorite stickers
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const favs = await query(
      `SELECT s.*, sp.name as pack_name, sp.icon_url as pack_icon, fs.created_at as favorited_at
       FROM favorite_stickers fs
       JOIN stickers s ON s.id = fs.sticker_id
       LEFT JOIN sticker_packs sp ON sp.id = s.pack_id
       WHERE fs.user_id = ?
       ORDER BY fs.created_at DESC`,
      [req.user.id]
    );
    res.json({ favorites: favs });
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ error: 'Failed to load favorite stickers.' });
  }
});

// POST /api/stickers/favorite - toggle favorite status
router.post('/favorite', authMiddleware, async (req, res) => {
  try {
    const { stickerId } = req.body;
    if (!stickerId) return res.status(400).json({ error: 'Sticker ID required.' });

    const existing = await queryOne(
      `SELECT id FROM favorite_stickers WHERE user_id = ? AND sticker_id = ?`,
      [req.user.id, stickerId]
    );

    if (existing) {
      await run(`DELETE FROM favorite_stickers WHERE id = ?`, [existing.id]);
      res.json({ isFavorite: false });
    } else {
      await run(
        `INSERT INTO favorite_stickers (id, user_id, sticker_id, created_at) VALUES (?, ?, ?, ?)`,
        [uuidv4(), req.user.id, stickerId, new Date().toISOString()]
      );
      res.json({ isFavorite: true });
    }
  } catch (err) {
    console.error('Toggle favorite error:', err);
    res.status(500).json({ error: 'Failed to update favorite sticker.' });
  }
});

export const CORE_EMOTIONS = [
  { key: 'happy', label: 'Happy', emoji: '😊' },
  { key: 'smile', label: 'Smile', emoji: '😄' },
  { key: 'laugh', label: 'Laugh', emoji: '🤣' },
  { key: 'sad', label: 'Sad', emoji: '😢' },
  { key: 'cry', label: 'Cry', emoji: '😭' },
  { key: 'angry', label: 'Angry', emoji: '😡' },
  { key: 'bored', label: 'Bored', emoji: '🥱' },
  { key: 'love', label: 'Love', emoji: '😍' },
  { key: 'shock', label: 'Shock', emoji: '😱' },
  { key: 'confused', label: 'Confused', emoji: '😕' },
  { key: 'sleepy', label: 'Sleepy', emoji: '😴' },
  { key: 'excited', label: 'Excited', emoji: '🤩' },
  { key: 'scared', label: 'Scared', emoji: '😨' },
  { key: 'thank-you', label: 'Thank You', emoji: '🙏' },
  { key: 'sorry', label: 'Sorry', emoji: '🥺' },
  { key: 'yes', label: 'Yes', emoji: '👍' },
  { key: 'no', label: 'No', emoji: '👎' },
  { key: 'good', label: 'Good', emoji: '👌' },
  { key: 'bad', label: 'Bad', emoji: '👎' },
  { key: 'greeting', label: 'Greeting', emoji: '👋' },
  { key: 'celebration', label: 'Celebration', emoji: '🎉' },
  { key: 'goodmorning', label: 'Good Morning', emoji: '☀️' },
  { key: 'goodnight', label: 'Good Night', emoji: '🌙' }
];

const EMOTION_SYNONYMS = {
  'thank-you': ['thank-you', 'thank you', 'thanks', 'thankyou', 'grateful', 'arigato', 'gratitude'],
  'thank you': ['thank-you', 'thank you', 'thanks', 'thankyou', 'grateful', 'arigato'],
  'thanks': ['thank-you', 'thank you', 'thanks', 'thankyou', 'grateful', 'arigato'],
  'sorry': ['sorry', 'apologize', 'apology', 'forgive', 'mybad', 'gomen'],
  'greeting': ['greeting', 'hello', 'hi', 'hey', 'wave', 'welcome', 'konnichiwa', 'meow'],
  'celebration': ['celebration', 'celebrate', 'party', 'congrats', 'birthday', 'yay', 'victory'],
  'goodmorning': ['goodmorning', 'good morning', 'morning', 'sunrise', 'wakeup', 'sun', 'ohayo'],
  'good morning': ['goodmorning', 'good morning', 'morning', 'sunrise', 'wakeup', 'sun', 'ohayo'],
  'morning': ['goodmorning', 'good morning', 'morning', 'sunrise', 'wakeup', 'sun'],
  'goodnight': ['goodnight', 'good night', 'night', 'bedtime', 'sleep', 'moon', 'oyasumi', 'dreams'],
  'good night': ['goodnight', 'good night', 'night', 'bedtime', 'sleep', 'moon', 'oyasumi'],
  'night': ['goodnight', 'good night', 'night', 'bedtime', 'sleep', 'moon'],
  'confused': ['confused', 'question', 'huh', 'what', 'spiral'],
  'scared': ['scared', 'fear', 'panic', 'terror', 'terrified', 'horror', 'ghost', 'shiver'],
  'laugh': ['laugh', 'laughing', 'lol', 'haha', 'lmao', 'rofl', 'wheeze', 'giggle'],
  'sleepy': ['sleepy', 'sleep', 'tired', 'zzz', 'nap', 'snore', 'snooze'],
  'angry': ['angry', 'mad', 'rage', 'furious', 'hiss', 'ragequit', 'flame', 'tableflip'],
  'bored': ['bored', 'yawn', 'whatever', 'idle', 'afk', 'meh', 'eyeroll'],
  'happy': ['happy', 'joy', 'cheerful', 'kawaii', 'bliss'],
  'smile': ['smile', 'smiling', 'grin', 'smirk', 'wholesome'],
  'sad': ['sad', 'sorrow', 'gloomy', 'depressed', 'depresso', 'melancholy', 'blue'],
  'cry': ['cry', 'crying', 'sob', 'tears', 'weep', 'waterfall'],
  'love': ['love', 'heart', 'crush', 'romance', 'adore', 'simp', 'kiss'],
  'shock': ['shock', 'shocked', 'omg', 'disbelief', 'gasp', 'mind blown', 'alert'],
  'excited': ['excited', 'hype', 'letsgo', 'sparkle', 'pounce', 'hyper'],
  'yes': ['yes', 'thumbsup', 'approve', 'agree', 'ok', 'ready', 'based'],
  'no': ['no', 'nope', 'refuse', 'deny', 'reject', 'denied', 'stop', 'dame'],
  'good': ['good', 'great', 'perfect', 'awesome', 'nice', 'srank', 'purrfect', 'chefs kiss'],
  'bad': ['bad', 'awful', 'terrible', 'trash', 'dislike', 'frank', 'grumpy']
};

// GET /api/stickers/emotions - list all 21 emotion reaction faces with counts & previews
router.get('/emotions', authMiddleware, async (req, res) => {
  try {
    const list = [];
    for (const em of CORE_EMOTIONS) {
      const term = `%${em.key}%`;
      const matching = await query(
        `SELECT s.id, s.image_url, s.name, sp.category
         FROM stickers s
         JOIN sticker_packs sp ON sp.id = s.pack_id
         WHERE LOWER(s.tags) LIKE ? OR LOWER(s.name) LIKE ?
         LIMIT 6`,
        [term, term]
      );
      const countRes = await queryOne(
        `SELECT COUNT(*) as count
         FROM stickers s
         WHERE LOWER(s.tags) LIKE ? OR LOWER(s.name) LIKE ?`,
        [term, term]
      );
      list.push({
        ...em,
        count: countRes ? countRes.count : matching.length,
        previews: matching.map((m) => m.image_url)
      });
    }
    res.json({ emotions: list });
  } catch (err) {
    console.error('List sticker emotions error:', err);
    res.status(500).json({ error: 'Failed to load sticker emotions.' });
  }
});

// GET /api/stickers/search - search stickers by keyword/tags with emotion synonyms
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q, emotion } = req.query;
    const queryTerm = (emotion || q || '').trim().toLowerCase();
    if (!queryTerm) {
      return res.json({ stickers: [] });
    }

    // Check if query term matches an emotion or synonym
    const synonyms = EMOTION_SYNONYMS[queryTerm] || [queryTerm];
    
    // Build SQL query matching any of the synonyms
    const conditions = [];
    const params = [];
    for (const syn of synonyms) {
      const pattern = `%${syn}%`;
      conditions.push(`(LOWER(s.name) LIKE ? OR LOWER(s.tags) LIKE ?)`);
      params.push(pattern, pattern);
    }
    // Also match pack name on the original query term
    conditions.push(`LOWER(sp.name) LIKE ?`);
    params.push(`%${queryTerm}%`);

    const sql = `
      SELECT s.*, sp.name as pack_name, sp.icon_url as pack_icon, sp.category as pack_category
      FROM stickers s
      JOIN sticker_packs sp ON sp.id = s.pack_id
      WHERE ${conditions.join(' OR ')}
      LIMIT 60
    `;

    const stickers = await query(sql, params);
    res.json({ stickers });
  } catch (err) {
    console.error('Search stickers error:', err);
    res.status(500).json({ error: 'Failed to search stickers.' });
  }
});

// POST /api/stickers/packs - create custom sticker pack
router.post('/packs', authMiddleware, async (req, res) => {
  try {
    const { name, icon_url, stickers } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Pack name is required.' });
    }
    if (!Array.isArray(stickers) || stickers.length === 0) {
      return res.status(400).json({ error: 'At least one sticker is required.' });
    }

    const packId = 'pack_' + uuidv4().replace(/-/g, '').slice(0, 12);
    const now = new Date().toISOString();

    await run(
      `INSERT INTO sticker_packs (id, name, creator_id, creator_name, icon_url, is_system, is_new, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?)`,
      [packId, name.trim(), req.user.id, req.user.username || 'User', icon_url || stickers[0].url || stickers[0].image_url || '', now, now]
    );

    for (let i = 0; i < stickers.length; i++) {
      const s = stickers[i];
      const sUrl = s.url || s.image_url;
      if (sUrl) {
        await run(
          `INSERT INTO stickers (id, pack_id, image_url, name, tags, sort_order, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), packId, sUrl, s.name || name.trim(), s.tags || '', i, now]
        );
      }
    }

    // Auto-install newly created pack to creator's library
    await run(
      `INSERT INTO user_sticker_packs (id, user_id, pack_id, sort_order, added_at)
       VALUES (?, ?, ?, 0, ?)`,
      [uuidv4(), req.user.id, packId, now]
    );

    res.status(201).json({ success: true, packId, name: name.trim() });
  } catch (err) {
    console.error('Create sticker pack error:', err);
    res.status(500).json({ error: 'Failed to create sticker pack.' });
  }
});

export default router;
