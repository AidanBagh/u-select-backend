import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chat } from '../controllers/chatController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    // Generate a deterministic temp filename based on originalname
    cb(null, 'chat-' + Buffer.from(file.originalname).toString('base64').replace(/[^a-zA-Z0-9]/g, '') + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 7 * 1024 * 1024 } });

const router = Router();

router.post('/', upload.single('file'), chat);

export default router;
