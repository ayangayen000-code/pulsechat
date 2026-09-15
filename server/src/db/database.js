import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'chat.db');

let dbInstance = null;
let saveTimeout = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const filebuffer = fs.readFileSync(DB_FILE);
    dbInstance = new SQL.Database(filebuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  initSchema(dbInstance);
  persistDb();
  return dbInstance;
}

export function persistDb() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error persisting database to disk:', err);
  }
}

export function schedulePersist() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    persistDb();
  }, 100);
}

function initSchema(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      status TEXT DEFAULT 'online',
      last_seen TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS friends (
      id TEXT PRIMARY KEY,
      user_id_1 TEXT NOT NULL,
      user_id_2 TEXT NOT NULL,
      status TEXT DEFAULT 'accepted',
      blocked_by TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(user_id_1, user_id_2)
    );

    CREATE TABLE IF NOT EXISTS friend_requests (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL,
      UNIQUE(sender_id, receiver_id)
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, -- 'direct' or 'group'
      name TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      description TEXT DEFAULT '',
      created_by TEXT,
      pinned_message_id TEXT,
      disappearing_enabled INTEGER DEFAULT 0,
      disappearing_duration INTEGER DEFAULT 0,
      disappearing_unit TEXT DEFAULT 'off',
      disappearing_admin_only INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversation_members (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
      is_pinned INTEGER DEFAULT 0,
      is_muted INTEGER DEFAULT 0,
      last_read_message_id TEXT,
      last_read_at TEXT,
      joined_at TEXT NOT NULL,
      UNIQUE(conversation_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      reply_to_id TEXT,
      type TEXT DEFAULT 'text', -- 'text', 'image', 'video', 'audio', 'voice', 'file', 'sticker', 'system'
      content TEXT,
      metadata TEXT, -- JSON string
      is_edited INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      disappearing_enabled INTEGER DEFAULT 0,
      disappearing_duration INTEGER DEFAULT 0,
      delivered_at TEXT,
      expires_at TEXT,
      view_once INTEGER DEFAULT 0,
      view_once_opened INTEGER DEFAULT 0,
      viewed_at TEXT,
      view_once_token TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS message_reactions (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      emoji TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(message_id, user_id, emoji)
    );

    CREATE TABLE IF NOT EXISTS sticker_packs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      creator_id TEXT,
      icon_url TEXT,
      is_system INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stickers (
      id TEXT PRIMARY KEY,
      pack_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      name TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorite_stickers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      sticker_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, sticker_id)
    );

    CREATE TABLE IF NOT EXISTS user_sticker_packs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      pack_id TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      added_at TEXT NOT NULL,
      UNIQUE(user_id, pack_id)
    );

    CREATE TABLE IF NOT EXISTS recent_stickers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      sticker_id TEXT NOT NULL,
      last_used_at TEXT NOT NULL,
      UNIQUE(user_id, sticker_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      sender_id TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      data TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      theme TEXT DEFAULT 'dark',
      accent_color TEXT DEFAULT 'indigo',
      chat_wallpaper TEXT DEFAULT 'default',
      enter_to_send INTEGER DEFAULT 1,
      sound_enabled INTEGER DEFAULT 1,
      desktop_notifications INTEGER DEFAULT 1,
      privacy_requests TEXT DEFAULT 'everyone',
      privacy_online TEXT DEFAULT 'everyone',
      privacy_last_seen TEXT DEFAULT 'everyone',
      media_auto_download INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS custom_themes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'custom',
      is_preset INTEGER DEFAULT 0,
      background_type TEXT DEFAULT 'solid',
      background_value TEXT DEFAULT '#09090b',
      background_image TEXT DEFAULT '',
      background_blur INTEGER DEFAULT 0,
      background_brightness INTEGER DEFAULT 100,
      background_opacity INTEGER DEFAULT 100,
      background_position TEXT DEFAULT 'center',
      background_size TEXT DEFAULT 'cover',
      overlay_color TEXT DEFAULT '#000000',
      overlay_opacity INTEGER DEFAULT 30,
      sent_bubble_bg TEXT DEFAULT '#6366f1',
      sent_bubble_text TEXT DEFAULT '#ffffff',
      received_bubble_bg TEXT DEFAULT '#27272a',
      received_bubble_text TEXT DEFAULT '#f4f4f5',
      accent_color TEXT DEFAULT '#6366f1',
      input_bg TEXT DEFAULT '#18181b',
      text_color TEXT DEFAULT '#ffffff',
      is_dark INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversation_themes (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      theme_id TEXT,
      custom_config TEXT,
      scope TEXT DEFAULT 'only_me',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(conversation_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS saved_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      conversation_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, message_id)
    );

    CREATE TABLE IF NOT EXISTS pinned_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      pinned_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(conversation_id, message_id)
    );

    CREATE TABLE IF NOT EXISTS hidden_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, message_id)
    );

    CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_conv_members ON conversation_members(conversation_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_reactions_msg ON message_reactions(message_id);
    CREATE INDEX IF NOT EXISTS idx_custom_themes_user ON custom_themes(user_id);
    CREATE INDEX IF NOT EXISTS idx_conv_themes ON conversation_themes(conversation_id, scope);
    CREATE INDEX IF NOT EXISTS idx_saved_messages_user ON saved_messages(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_pinned_messages_conv ON pinned_messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_hidden_messages_user ON hidden_messages(user_id, message_id);
  `);

  // Migrate existing tables if columns don't exist yet
  const safeAdd = (table, colDef) => {
    try { db.run(`ALTER TABLE ${table} ADD COLUMN ${colDef}`); } catch (e) {}
  };
  safeAdd('conversations', 'disappearing_enabled INTEGER DEFAULT 0');
  safeAdd('conversations', 'disappearing_duration INTEGER DEFAULT 0');
  safeAdd('conversations', "disappearing_unit TEXT DEFAULT 'off'");
  safeAdd('conversations', 'disappearing_admin_only INTEGER DEFAULT 1');

  safeAdd('messages', 'disappearing_enabled INTEGER DEFAULT 0');
  safeAdd('messages', 'disappearing_duration INTEGER DEFAULT 0');
  safeAdd('messages', 'delivered_at TEXT');
  safeAdd('messages', 'expires_at TEXT');
  safeAdd('messages', 'view_once INTEGER DEFAULT 0');
  safeAdd('messages', 'view_once_opened INTEGER DEFAULT 0');
  safeAdd('messages', 'viewed_at TEXT');
  safeAdd('messages', 'view_once_token TEXT');

  // Stickers migrations
  safeAdd('sticker_packs', "description TEXT DEFAULT ''");
  safeAdd('sticker_packs', "category TEXT DEFAULT '☕ Cute & Cozy'");
  safeAdd('sticker_packs', "cover_image TEXT DEFAULT ''");
  safeAdd('sticker_packs', "creator_name TEXT DEFAULT 'Pulse Studio'");
  safeAdd('sticker_packs', 'is_featured INTEGER DEFAULT 0');
  safeAdd('sticker_packs', 'is_popular INTEGER DEFAULT 0');
  safeAdd('sticker_packs', 'is_new INTEGER DEFAULT 0');
  safeAdd('sticker_packs', 'downloads_count INTEGER DEFAULT 0');
  safeAdd('sticker_packs', 'updated_at TEXT');

  safeAdd('stickers', "tags TEXT DEFAULT ''");
  safeAdd('stickers', 'animated INTEGER DEFAULT 0');
  safeAdd('stickers', 'sort_order INTEGER DEFAULT 0');

  const safeIndex = (sql) => {
    try { db.run(sql); } catch (e) {}
  };
  safeIndex(`CREATE TABLE IF NOT EXISTS saved_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    conversation_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, message_id)
  );`);
  safeIndex(`CREATE TABLE IF NOT EXISTS pinned_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    pinned_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(conversation_id, message_id)
  );`);
  safeIndex(`CREATE TABLE IF NOT EXISTS hidden_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, message_id)
  );`);
  safeIndex(`CREATE INDEX IF NOT EXISTS idx_messages_expires ON messages(expires_at);`);
  safeIndex(`CREATE INDEX IF NOT EXISTS idx_messages_view_once ON messages(view_once, view_once_opened);`);
  safeIndex(`CREATE INDEX IF NOT EXISTS idx_user_sticker_packs ON user_sticker_packs(user_id, sort_order);`);
  safeIndex(`CREATE INDEX IF NOT EXISTS idx_recent_stickers ON recent_stickers(user_id, last_used_at);`);
  safeIndex(`CREATE INDEX IF NOT EXISTS idx_stickers_pack ON stickers(pack_id);`);
  safeIndex(`CREATE INDEX IF NOT EXISTS idx_saved_messages_user ON saved_messages(user_id, created_at);`);
  safeIndex(`CREATE INDEX IF NOT EXISTS idx_pinned_messages_conv ON pinned_messages(conversation_id);`);
  safeIndex(`CREATE INDEX IF NOT EXISTS idx_hidden_messages_user ON hidden_messages(user_id, message_id);`);
}

/**
 * Execute query and return array of objects
 */
export async function query(sql, params = []) {
  const db = await getDb();
  const stmt = db.prepare(sql);
  if (params && params.length > 0) {
    stmt.bind(params);
  }
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

/**
 * Execute query and return first object or null
 */
export async function queryOne(sql, params = []) {
  const res = await query(sql, params);
  return res.length > 0 ? res[0] : null;
}

/**
 * Run statement (INSERT/UPDATE/DELETE), auto-persist
 */
export async function run(sql, params = []) {
  const db = await getDb();
  db.run(sql, params);
  schedulePersist();
  const changes = typeof db.getRowsModified === 'function' ? db.getRowsModified() : 1;
  return { changes };
}
