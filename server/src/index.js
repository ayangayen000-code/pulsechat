import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { getDb, query, run } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import { seedStickersLibrary } from './db/seedStickers.js';
import { setupSocketHandler } from './socket/socketHandler.js';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import friendsRoutes from './routes/friends.js';
import chatsRoutes from './routes/chats.js';
import groupsRoutes from './routes/groups.js';
import messagesRoutes from './routes/messages.js';
import stickersRoutes from './routes/stickers.js';
import uploadRoutes from './routes/upload.js';
import notificationsRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import themesRoutes from './routes/themes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_PATH = path.resolve(__dirname, '../uploads');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

app.set('io', io);

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploaded media
app.use('/uploads', express.static(UPLOADS_PATH));
app.use('/uploads/avatars/:filename', (req, res, next) => {
  const fallbackPath = path.join(UPLOADS_PATH, 'images', req.params.filename);
  if (fs.existsSync(fallbackPath)) {
    return res.sendFile(fallbackPath);
  }
  next();
});
app.use('/uploads/images/:filename', (req, res, next) => {
  const fallbackPath = path.join(UPLOADS_PATH, 'avatars', req.params.filename);
  if (fs.existsSync(fallbackPath)) {
    return res.sendFile(fallbackPath);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/stickers', stickersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/themes', themesRoutes);

// Serve client build if dist exists
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');
app.use(express.static(CLIENT_DIST));

// Global health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), app: 'PulseChat' });
});

// Setup Socket.io
setupSocketHandler(io);

// SPA fallback for frontend routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(CLIENT_DIST, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.json({
    status: 'ok',
    app: 'PulseChat Backend Server',
    message: 'PulseChat server is live and running! Connect using your PulseChat mobile app.',
    healthCheck: '/api/health',
    time: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await getDb();
    await seedDatabase();
    await seedStickersLibrary();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 PulseChat server running at http://localhost:${PORT}`);
    });

    // Periodic cleanup for expired disappearing messages (every 2 seconds)
    setInterval(async () => {
      try {
        const now = new Date().toISOString();
        const expired = await query(
          `SELECT id, conversation_id FROM messages WHERE expires_at IS NOT NULL AND expires_at <= ?`,
          [now]
        );
        if (expired && expired.length > 0) {
          for (const item of expired) {
            await run(`DELETE FROM messages WHERE id = ?`, [item.id]);
            await run(`DELETE FROM message_reactions WHERE message_id = ?`, [item.id]);
            io.to(`conv_${item.conversation_id}`).emit('message_expired', {
              id: item.id,
              conversation_id: item.conversation_id
            });
          }
        }
      } catch (err) {
        // Silent catch in timer
      }
    }, 2000);
  } catch (err) {
    console.error('Failed to start PulseChat server:', err);
    process.exit(1);
  }
}

startServer();
