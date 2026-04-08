const path = require('path');
const { runAgent } = require('../chat/agent');

const MIME_TYPES = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.csv': 'text/csv',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
};

const chat = async (req, res) => {
  try {
    let history = [];
    try { history = JSON.parse(req.body.history || '[]'); } catch { history = []; }

    const context = req.body.context || 'default';

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const mimeType = MIME_TYPES[ext];
      if (!mimeType) return res.status(400).json({ message: `Unsupported file type: ${ext}` });

      const reply = await runAgent({
        message: req.body.message || '',
        history,
        context,
        file: req.file.buffer.toString('base64'),
        mimeType,
      });

      return res.json({ reply });
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'message is required' });
    }

    const reply = await runAgent({ message, history, context });
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { chat };
