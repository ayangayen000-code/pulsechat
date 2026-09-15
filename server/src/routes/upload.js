import express from 'express';
import path from 'path';
import { upload } from '../middleware/upload.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Optional auth middleware for avatar uploads during registration
function optionalAuth(req, res, next) {
  const isAvatar = req.query.type === 'avatar' || req.body?.type === 'avatar' || req.path.includes('avatar');
  if (isAvatar) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authMiddleware(req, res, next);
    }
    return next();
  }
  return authMiddleware(req, res, next);
}

function getPublicUrl(req, file) {
  // Directly use the folder where Multer placed the file
  const subfolder = file.destination ? path.basename(file.destination) : 'images';
  return `/uploads/${subfolder}/${file.filename}`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// POST /api/upload - single file
router.post('/', upload.single('file'), optionalAuth, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const url = getPublicUrl(req, req.file);
    res.json({
      url,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      formattedSize: formatBytes(req.file.size)
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'File upload failed.' });
  }
});

// POST /api/upload/multiple - up to 10 files
router.post('/multiple', authMiddleware, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const files = req.files.map(f => ({
      url: getPublicUrl(req, f),
      filename: f.filename,
      originalName: f.originalname,
      mimeType: f.mimetype,
      size: f.size,
      formattedSize: formatBytes(f.size)
    }));

    res.json({ files });
  } catch (err) {
    console.error('Multiple upload error:', err);
    res.status(500).json({ error: 'Files upload failed.' });
  }
});

export default router;
