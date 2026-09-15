import jwt from 'jsonwebtoken';
import { queryOne } from '../db/database.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'pulsechat_super_secret_jwt_key_2026';

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      user_id: user.user_id,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await queryOne('SELECT id, user_id, username, avatar_url, bio, status, last_seen FROM users WHERE id = ?', [decoded.id]);
    if (!user) {
      return res.status(401).json({ error: 'User session invalid or user deleted.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}
