import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_BASE = path.resolve(__dirname, '../../uploads');

const folders = ['avatars', 'images', 'videos', 'audio', 'documents', 'stickers', 'wallpapers'];
for (const folder of folders) {
  const dir = path.join(UPLOADS_BASE, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'documents';
    const uploadType = req.query.type || req.body?.type || '';
    if (file.mimetype.startsWith('image/')) {
      if (uploadType === 'avatar' || req.path.includes('avatar')) subfolder = 'avatars';
      else if (uploadType === 'wallpaper') subfolder = 'wallpapers';
      else if (uploadType === 'sticker' || req.path.includes('sticker')) subfolder = 'stickers';
      else subfolder = 'images';
    } else if (file.mimetype.startsWith('video/')) {
      subfolder = 'videos';
    } else if (file.mimetype.startsWith('audio/')) {
      subfolder = 'audio';
    }
    cb(null, path.join(UPLOADS_BASE, subfolder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Disallow executable files for security
  const blockedExts = ['.exe', '.bat', '.cmd', '.sh', '.msi', '.vbs', '.js', '.bin'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (blockedExts.includes(ext)) {
    return cb(new Error('Executable and script file uploads are restricted for safety.'));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});
