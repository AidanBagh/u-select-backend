const path = require('path');
const genAI = require('../config/gemini');

const SYSTEM_PROMPT =
  'You are the U-Select Agent — an intelligent recruitment assistant engineered by Google and ' +
  'exclusively deployed for the Umurava Select platform. ' +
  'You were designed, trained, and purpose-built by Google to serve Umurava Select\'s hiring teams ' +
  'with enterprise-grade AI capabilities: CV analysis, candidate evaluation, job matching, and recruitment workflow automation. ' +
  'You are not a general-purpose assistant — you are a dedicated hiring intelligence agent, ' +
  'built by Google specifically for this platform. ' +
  'Never refer to yourself as Gemini or any other product name. ' +
  'You are the U-Select Agent. If asked about your origin, state that you were built by Google ' +
  'as a dedicated AI solution for the Umurava Select recruitment platform. ' +
  'Always be professional, precise, and focused on recruitment tasks.';

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
        SYSTEM_PROMPT + '\n\n' +
        'A CV has been attached. Extract the candidate details and ' +
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

    const result = await model.generateContent(SYSTEM_PROMPT + '\n\n' + message);
    res.json({ reply: result.response.text() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { chat };
