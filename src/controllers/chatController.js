const path = require('path');
const genAI = require('../config/gemini');

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
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    // CV upload branch — extract and reply conversationally, nothing saved to DB
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const mimeType = MIME_TYPES[ext];
      if (!mimeType) return res.status(400).json({ message: `Unsupported file type: ${ext}` });

      const base64Data = req.file.buffer.toString('base64');
      const prompt =
        'You are a recruiter assistant reviewing a CV. Extract the candidate details and ' +
        'reply in a friendly, conversational tone summarising what you found. ' +
        'Structure your reply with these clearly labelled sections: ' +
        'Name, Email, Phone, Skills, Experience, Education, Summary. ' +
        'End with: "Let me know if you want to save this applicant to a job."';

      const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType, data: base64Data } },
      ]);

      return res.json({ reply: result.response.text() });
    }

    // Plain text branch
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'message is required' });
    }

    const result = await model.generateContent(message);
    res.json({ reply: result.response.text() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { chat };
