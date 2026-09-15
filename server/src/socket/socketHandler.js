import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth.js';
import { queryOne, run } from '../db/database.js';

// Map of userId -> Set of socketIds
const onlineUsers = new Map();

export function setupSocketHandler(io) {
  // Socket auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required for socket connection.'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await queryOne('SELECT id, user_id, username, avatar_url FROM users WHERE id = ?', [decoded.id]);
      if (!user) {
        return next(new Error('User not found.'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token for socket.'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    socket.join(`user_${userId}`);

    // Track online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      // First connection, mark online in DB and broadcast
      const now = new Date().toISOString();
      await run(`UPDATE users SET status = 'online', last_seen = ? WHERE id = ?`, [now, userId]);
      io.emit('presence_change', { userId, status: 'online', last_seen: now });
    }
    onlineUsers.get(userId).add(socket.id);

    // Send currently online user list to newly connected socket
    const onlineList = Array.from(onlineUsers.keys());
    socket.emit('online_users', onlineList);

    // Join conversation room
    socket.on('join_conversation', (convId) => {
      if (convId) {
        socket.join(`conv_${convId}`);
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (convId) => {
      if (convId) {
        socket.leave(`conv_${convId}`);
      }
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      if (data && data.conversation_id) {
        socket.to(`conv_${data.conversation_id}`).emit('user_typing_start', {
          conversation_id: data.conversation_id,
          user_id: socket.user.id,
          username: socket.user.username
        });
      }
    });

    socket.on('typing_stop', (data) => {
      if (data && data.conversation_id) {
        socket.to(`conv_${data.conversation_id}`).emit('user_typing_stop', {
          conversation_id: data.conversation_id,
          user_id: socket.user.id
        });
      }
    });

    // Read receipt broadcast
    socket.on('message_read', async (data) => {
      if (data && data.conversation_id) {
        socket.to(`conv_${data.conversation_id}`).emit('message_read_update', {
          conversation_id: data.conversation_id,
          user_id: socket.user.id,
          message_id: data.message_id
        });
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          const now = new Date().toISOString();
          await run(`UPDATE users SET status = 'offline', last_seen = ? WHERE id = ?`, [now, userId]);
          io.emit('presence_change', { userId, status: 'offline', last_seen: now });
        }
      }
    });
  });
}
