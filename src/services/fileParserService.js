const xlsx = require('xlsx');
const path = require('path');

const parseFile = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (['.xlsx', '.xls', '.csv'].includes(ext)) return parseSpreadsheet(filePath);
  throw new Error(`Unsupported file type: ${ext}`);
};

const parseSpreadsheet = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);
  return rows.map((row) => ({
    name: row.name || row.Name || '',
    email: row.email || row.Email || '',
    phone: row.phone || row.Phone || '',
    skills: row.skills ? String(row.skills).split(',').map((s) => s.trim()) : [],
    experienceYears: Number(row.experienceYears || row.experience || 0),
    education: row.education || row.Education || '',
    summary: row.summary || row.Summary || '',
  }));
};

module.exports = { parseFile };
