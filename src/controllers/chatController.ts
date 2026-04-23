import path from 'path';
import type { RequestHandler } from 'express';
import { runAgent } from '../chat/agent.js';

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.csv': 'text/csv',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
};

const chat: RequestHandler = async (req, res) => {
  try {
    let history: unknown[] = [];
    if (typeof req.body.history === 'string') {
      try { history = JSON.parse(req.body.history || '[]'); } catch { history = []; }
    } else if (Array.isArray(req.body.history)) {
      history = req.body.history;
    }

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
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
};

export { chat };
