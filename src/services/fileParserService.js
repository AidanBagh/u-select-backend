const fs = require('fs');
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

const parseFileWithGemini = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext];
  if (!mimeType) throw new Error(`Unsupported file type: ${ext}`);

  const fileData = fs.readFileSync(filePath);
  const base64Data = fileData.toString('base64');

  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

  const prompt =
    'You are a recruiter assistant. Extract the following fields from this CV/resume ' +
    'and return ONLY a valid JSON object with no markdown, no code fences, and no explanation. ' +
    'Fields: name (string), email (string), phone (string), skills (array of strings), ' +
    'experienceYears (number), education (string), summary (string). ' +
    'If a field is not found use an empty string, 0 for numbers, or [] for arrays.';

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType, data: base64Data } },
  ]);

  const text = result.response.text().trim();
  const parsed = JSON.parse(text);

  return { parsed, fileData, mimeType };
};

module.exports = { parseFileWithGemini };
