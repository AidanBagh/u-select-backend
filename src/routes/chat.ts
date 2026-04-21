import { Router } from 'express';
import multer from 'multer';
import { chat } from '../controllers/chatController.js';

const router = Router();

// Memory storage — file never touches disk, buffer goes straight to Gemini
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 7 * 1024 * 1024 } });

router.post('/', upload.single('file'), chat);

export default router;
