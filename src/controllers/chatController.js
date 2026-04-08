const path = require('path');
const genAI = require('../config/gemini');

const SYSTEM_PROMPT =
  'You are the U-Select Agent — an intelligent recruitment assistant built by the Umurava Select platform, ' +
  'powered by Google AI technology. ' +
  'You were conceived, designed, and deployed by Umurava Select to serve their hiring teams, ' +
  'leveraging Google\'s AI infrastructure to deliver enterprise-grade capabilities: ' +
  'CV analysis, candidate evaluation, job matching, and recruitment workflow automation. ' +
  'You are not a general-purpose assistant — you are a dedicated hiring intelligence agent ' +
  'created by Umurava Select, running on Google AI technology. ' +
  'Never refer to yourself as Gemini or any other product name. ' +
  'You are the U-Select Agent. If asked about your origin, state that you were built by Umurava Select ' +
  'and powered by Google AI technology. ' +
  'Always be professional, precise, and focused on recruitment tasks.';

const MIME_TYPES = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.csv': 'text/csv',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
};

const buildGeminiHistory = (rawHistory) => {
  // Skip the initial AI welcome message (no preceding user message)
  const firstUserIdx = rawHistory.findIndex((m) => m.role === 'user');
  const relevant = firstUserIdx === -1 ? [] : rawHistory.slice(firstUserIdx);

  return [
    // System prompt injected as the first user/model exchange
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Understood. I am the U-Select Agent, ready to assist with your recruitment tasks.' }] },
    // Past conversation turns
    ...relevant
      .filter((m) => !m.isStreaming && m.text && m.text.trim())
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
  ];
};

const chat = async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    // CV upload branch — extract and reply conversationally, nothing saved to DB
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const mimeType = MIME_TYPES[ext];
      if (!mimeType) return res.status(400).json({ message: `Unsupported file type: ${ext}` });

      const base64Data = req.file.buffer.toString('base64');

      let rawHistory = [];
      try { rawHistory = JSON.parse(req.body.history || '[]'); } catch { rawHistory = []; }

      const chatSession = model.startChat({ history: buildGeminiHistory(rawHistory) });
      const result = await chatSession.sendMessage([
        'A CV has been attached. Extract the candidate details and reply in a friendly, conversational tone summarising what you found. Structure your reply with these clearly labelled sections: Name, Email, Phone, Skills, Experience, Education, Summary. End with: "Let me know if you want to save this applicant to a job."',
        { inlineData: { mimeType, data: base64Data } },
      ]);

      return res.json({ reply: result.response.text() });
    }

    // Plain text branch
    const { message, history: rawHistory = [] } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'message is required' });
    }

    const chatSession = model.startChat({ history: buildGeminiHistory(rawHistory) });
    const result = await chatSession.sendMessage(message);
    res.json({ reply: result.response.text() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { chat };
