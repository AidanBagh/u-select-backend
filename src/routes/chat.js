const express = require('express');
const multer = require('multer');
const router = express.Router();
const { chat } = require('../controllers/chatController');

// Memory storage — file never touches disk, buffer goes straight to Gemini
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 7 * 1024 * 1024 } });

router.post('/', upload.single('file'), chat);

module.exports = router;
