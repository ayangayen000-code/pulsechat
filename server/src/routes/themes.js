import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { PRESET_CATEGORIES, PRESET_THEMES } from '../db/presetThemes.js';

const router = express.Router();

/**
 * GET /api/themes/presets
 * Returns all built-in themes and category filters
 */
router.get('/presets', (req, res) => {
  res.json({
    categories: PRESET_CATEGORIES,
    presets: PRESET_THEMES
  });
});

/**
 * GET /api/themes/my
 * Returns custom themes created by the current user
 */
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const themes = await query(
      `SELECT * FROM custom_themes WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ themes: themes || [] });
  } catch (err) {
    console.error('Fetch custom themes error:', err);
    res.status(500).json({ error: 'Failed to fetch custom themes.' });
  }
});

/**
 * POST /api/themes/my
 * Saves a new custom theme
 */
router.post('/my', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      category = 'custom',
      background_type = 'solid',
      background_value = '#09090b',
      background_image = '',
      background_blur = 0,
      background_brightness = 100,
      background_opacity = 100,
      background_position = 'center',
      background_size = 'cover',
      overlay_color = '#000000',
      overlay_opacity = 30,
      sent_bubble_bg = '#6366f1',
      sent_bubble_text = '#ffffff',
      received_bubble_bg = '#27272a',
      received_bubble_text = '#f4f4f5',
      accent_color = '#6366f1',
      input_bg = '#18181b',
      text_color = '#ffffff',
      is_dark = 1
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Theme name is required.' });
    }

    const id = 'thm_' + uuidv4().replace(/-/g, '').slice(0, 12);
    const now = new Date().toISOString();

    await run(
      `INSERT INTO custom_themes (
        id, user_id, name, category, is_preset,
        background_type, background_value, background_image,
        background_blur, background_brightness, background_opacity,
        background_position, background_size, overlay_color, overlay_opacity,
        sent_bubble_bg, sent_bubble_text, received_bubble_bg, received_bubble_text,
        accent_color, input_bg, text_color, is_dark, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, 0,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )`,
      [
        id, req.user.id, name.trim(), category,
        background_type, background_value, background_image,
        parseInt(background_blur) || 0,
        parseInt(background_brightness) || 100,
        parseInt(background_opacity) || 100,
        background_position, background_size, overlay_color,
        parseInt(overlay_opacity) || 0,
        sent_bubble_bg, sent_bubble_text, received_bubble_bg, received_bubble_text,
        accent_color, input_bg, text_color, is_dark ? 1 : 0, now, now
      ]
    );

    const createdTheme = await queryOne('SELECT * FROM custom_themes WHERE id = ?', [id]);
    res.status(201).json({ theme: createdTheme });
  } catch (err) {
    console.error('Create custom theme error:', err);
    res.status(500).json({ error: 'Failed to create custom theme.' });
  }
});

/**
 * PUT /api/themes/my/:id
 * Updates an existing custom theme
 */
router.put('/my/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await queryOne(
      'SELECT id FROM custom_themes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!existing) {
      return res.status(404).json({ error: 'Custom theme not found or not authorized.' });
    }

    const {
      name,
      background_type,
      background_value,
      background_image,
      background_blur,
      background_brightness,
      background_opacity,
      background_position,
      background_size,
      overlay_color,
      overlay_opacity,
      sent_bubble_bg,
      sent_bubble_text,
      received_bubble_bg,
      received_bubble_text,
      accent_color,
      input_bg,
      text_color,
      is_dark
    } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (background_type !== undefined) {
      updates.push('background_type = ?');
      params.push(background_type);
    }
    if (background_value !== undefined) {
      updates.push('background_value = ?');
      params.push(background_value);
    }
    if (background_image !== undefined) {
      updates.push('background_image = ?');
      params.push(background_image);
    }
    if (background_blur !== undefined) {
      updates.push('background_blur = ?');
      params.push(parseInt(background_blur) || 0);
    }
    if (background_brightness !== undefined) {
      updates.push('background_brightness = ?');
      params.push(parseInt(background_brightness) || 100);
    }
    if (background_opacity !== undefined) {
      updates.push('background_opacity = ?');
      params.push(parseInt(background_opacity) || 100);
    }
    if (background_position !== undefined) {
      updates.push('background_position = ?');
      params.push(background_position);
    }
    if (background_size !== undefined) {
      updates.push('background_size = ?');
      params.push(background_size);
    }
    if (overlay_color !== undefined) {
      updates.push('overlay_color = ?');
      params.push(overlay_color);
    }
    if (overlay_opacity !== undefined) {
      updates.push('overlay_opacity = ?');
      params.push(parseInt(overlay_opacity) || 0);
    }
    if (sent_bubble_bg !== undefined) {
      updates.push('sent_bubble_bg = ?');
      params.push(sent_bubble_bg);
    }
    if (sent_bubble_text !== undefined) {
      updates.push('sent_bubble_text = ?');
      params.push(sent_bubble_text);
    }
    if (received_bubble_bg !== undefined) {
      updates.push('received_bubble_bg = ?');
      params.push(received_bubble_bg);
    }
    if (received_bubble_text !== undefined) {
      updates.push('received_bubble_text = ?');
      params.push(received_bubble_text);
    }
    if (accent_color !== undefined) {
      updates.push('accent_color = ?');
      params.push(accent_color);
    }
    if (input_bg !== undefined) {
      updates.push('input_bg = ?');
      params.push(input_bg);
    }
    if (text_color !== undefined) {
      updates.push('text_color = ?');
      params.push(text_color);
    }
    if (is_dark !== undefined) {
      updates.push('is_dark = ?');
      params.push(is_dark ? 1 : 0);
    }

    const now = new Date().toISOString();
    updates.push('updated_at = ?');
    params.push(now);

    params.push(req.params.id);
    await run(`UPDATE custom_themes SET ${updates.join(', ')} WHERE id = ?`, params);

    const updated = await queryOne('SELECT * FROM custom_themes WHERE id = ?', [req.params.id]);
    res.json({ theme: updated });
  } catch (err) {
    console.error('Update custom theme error:', err);
    res.status(500).json({ error: 'Failed to update custom theme.' });
  }
});

/**
 * DELETE /api/themes/my/:id
 * Deletes a custom theme
 */
router.delete('/my/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await queryOne(
      'SELECT id FROM custom_themes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!existing) {
      return res.status(404).json({ error: 'Custom theme not found or not authorized.' });
    }

    await run('DELETE FROM custom_themes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Custom theme deleted.' });
  } catch (err) {
    console.error('Delete custom theme error:', err);
    res.status(500).json({ error: 'Failed to delete custom theme.' });
  }
});

/**
 * GET /api/themes/conversation/:convId
 * Retrieves the effective theme for the current user in a conversation
 */
router.get('/conversation/:convId', authMiddleware, async (req, res) => {
  try {
    const { convId } = req.params;

    // Verify user is a member of the conversation
    const member = await queryOne(
      'SELECT id FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [convId, req.user.id]
    );
    if (!member) {
      return res.status(403).json({ error: 'Not a member of this conversation.' });
    }

    // 1. Personal override ("only_me")
    const personal = await queryOne(
      `SELECT * FROM conversation_themes WHERE conversation_id = ? AND user_id = ? AND scope = 'only_me'`,
      [convId, req.user.id]
    );
    if (personal) {
      let config = null;
      try { config = JSON.parse(personal.custom_config); } catch (e) {}
      return res.json({ theme: config, scope: 'only_me', themeId: personal.theme_id });
    }

    // 2. Shared 1-to-1 theme ("both")
    const shared = await queryOne(
      `SELECT * FROM conversation_themes WHERE conversation_id = ? AND scope = 'both' ORDER BY updated_at DESC LIMIT 1`,
      [convId]
    );
    if (shared) {
      let config = null;
      try { config = JSON.parse(shared.custom_config); } catch (e) {}
      return res.json({ theme: config, scope: 'both', themeId: shared.theme_id });
    }

    // 3. Group default theme ("group_default")
    const groupDefault = await queryOne(
      `SELECT * FROM conversation_themes WHERE conversation_id = ? AND scope = 'group_default' ORDER BY updated_at DESC LIMIT 1`,
      [convId]
    );
    if (groupDefault) {
      let config = null;
      try { config = JSON.parse(groupDefault.custom_config); } catch (e) {}
      return res.json({ theme: config, scope: 'group_default', themeId: groupDefault.theme_id });
    }

    // Default: no custom theme applied
    res.json({ theme: null, scope: 'default', themeId: null });
  } catch (err) {
    console.error('Get conversation theme error:', err);
    res.status(500).json({ error: 'Failed to get conversation theme.' });
  }
});

/**
 * PUT /api/themes/conversation/:convId
 * Sets or updates the theme for a conversation
 */
router.put('/conversation/:convId', authMiddleware, async (req, res) => {
  try {
    const { convId } = req.params;
    const { themeId, themeConfig, scope = 'only_me' } = req.body;

    if (!themeConfig) {
      return res.status(400).json({ error: 'themeConfig object is required.' });
    }

    // Check membership and role
    const member = await queryOne(
      'SELECT id, role FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [convId, req.user.id]
    );
    if (!member) {
      return res.status(403).json({ error: 'Not a member of this conversation.' });
    }

    const conversation = await queryOne('SELECT id, type FROM conversations WHERE id = ?', [convId]);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    if (scope === 'group_default' && member.role !== 'owner' && member.role !== 'admin') {
      return res.status(403).json({ error: 'Only group owners and admins can set group default themes.' });
    }

    const now = new Date().toISOString();
    const configStr = JSON.stringify(themeConfig);

    if (scope === 'both') {
      // Shared in 1-to-1: Clear previous shared entries for this conversation and insert new
      await run(`DELETE FROM conversation_themes WHERE conversation_id = ? AND scope = 'both'`, [convId]);
      const id = 'cth_' + uuidv4().replace(/-/g, '').slice(0, 12);
      await run(
        `INSERT INTO conversation_themes (id, conversation_id, user_id, theme_id, custom_config, scope, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'both', ?, ?)`,
        [id, convId, req.user.id, themeId || null, configStr, now, now]
      );
    } else if (scope === 'group_default') {
      // Group default: clear previous group_default and insert
      await run(`DELETE FROM conversation_themes WHERE conversation_id = ? AND scope = 'group_default'`, [convId]);
      const id = 'cth_' + uuidv4().replace(/-/g, '').slice(0, 12);
      await run(
        `INSERT INTO conversation_themes (id, conversation_id, user_id, theme_id, custom_config, scope, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'group_default', ?, ?)`,
        [id, convId, req.user.id, themeId || null, configStr, now, now]
      );
    } else {
      // scope === 'only_me': User-specific preference
      const existing = await queryOne(
        `SELECT id FROM conversation_themes WHERE conversation_id = ? AND user_id = ? AND scope = 'only_me'`,
        [convId, req.user.id]
      );
      if (existing) {
        await run(
          `UPDATE conversation_themes SET theme_id = ?, custom_config = ?, updated_at = ? WHERE id = ?`,
          [themeId || null, configStr, now, existing.id]
        );
      } else {
        const id = 'cth_' + uuidv4().replace(/-/g, '').slice(0, 12);
        await run(
          `INSERT INTO conversation_themes (id, conversation_id, user_id, theme_id, custom_config, scope, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'only_me', ?, ?)`,
          [id, convId, req.user.id, themeId || null, configStr, now, now]
        );
      }
    }

    // Broadcast socket event if shared or group default
    const io = req.app.get('io');
    if (io && (scope === 'both' || scope === 'group_default')) {
      io.to(`conv_${convId}`).emit('chat:theme_updated', {
        conversationId: convId,
        theme: themeConfig,
        scope,
        updatedBy: req.user.id
      });
    }

    res.json({
      success: true,
      theme: themeConfig,
      scope,
      themeId: themeId || null
    });
  } catch (err) {
    console.error('Set conversation theme error:', err);
    res.status(500).json({ error: 'Failed to set conversation theme.' });
  }
});

/**
 * DELETE /api/themes/conversation/:convId
 * Resets the conversation theme to default
 */
router.delete('/conversation/:convId', authMiddleware, async (req, res) => {
  try {
    const { convId } = req.params;

    // Delete user's personal override
    await run(
      `DELETE FROM conversation_themes WHERE conversation_id = ? AND user_id = ? AND scope = 'only_me'`,
      [convId, req.user.id]
    );

    // Also check if user is admin or if 1-to-1 to clear shared
    const member = await queryOne(
      'SELECT role FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [convId, req.user.id]
    );

    const conv = await queryOne('SELECT type FROM conversations WHERE id = ?', [convId]);

    let clearedShared = false;
    if (conv && conv.type === 'direct') {
      await run(`DELETE FROM conversation_themes WHERE conversation_id = ? AND scope = 'both'`, [convId]);
      clearedShared = true;
    } else if (member && (member.role === 'owner' || member.role === 'admin')) {
      await run(`DELETE FROM conversation_themes WHERE conversation_id = ? AND scope = 'group_default'`, [convId]);
      clearedShared = true;
    }

    const io = req.app.get('io');
    if (io && clearedShared) {
      io.to(`conv_${convId}`).emit('chat:theme_updated', {
        conversationId: convId,
        theme: null,
        scope: 'default',
        updatedBy: req.user.id
      });
    }

    res.json({ success: true, message: 'Theme reset to default.' });
  } catch (err) {
    console.error('Reset conversation theme error:', err);
    res.status(500).json({ error: 'Failed to reset conversation theme.' });
  }
});

export default router;
