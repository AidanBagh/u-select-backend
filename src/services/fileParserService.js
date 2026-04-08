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
    'You are a recruiter assistant. Extract ALL of the following fields from this CV/resume exhaustively. ' +
    'Do NOT summarise or paraphrase — extract every detail as it appears. ' +
    'Return ONLY a valid JSON object with no markdown, no code fences, and no explanation.\n\n' +
    'Fields:\n' +
    '- name: string\n' +
    '- email: string\n' +
    '- phone: string\n' +
    '- skills: array of strings — include EVERY skill, technology, tool, methodology, or competency mentioned anywhere in the document, even if mentioned only once or in passing\n' +
    '- certifications: array of strings — all certifications, licences, or accreditations\n' +
    '- experienceYears: number — total years of professional experience (infer from dates if not stated explicitly)\n' +
    '- workHistory: array of objects, one per role, each with: { "role": string, "company": string, "startDate": string, "endDate": string, "responsibilities": array of strings — list every responsibility and achievement verbatim }\n' +
    '- education: array of objects, one per qualification, each with: { "degree": string, "institution": string, "year": string, "field": string }\n' +
    '- summary: string — copy the candidate\'s own profile or personal statement verbatim if present; otherwise use an empty string\n\n' +
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
