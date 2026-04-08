const fs = require('fs');
const Applicant = require('../models/Applicant');
const { parseFileWithGemini } = require('../services/fileParserService');

// GET /api/applicants?jobId=
// Excludes resumeData binary field from list responses to keep payloads light
const getApplicantsByJob = async (req, res) => {
  try {
    const { jobId } = req.query;
    if (!jobId) return res.status(400).json({ message: 'jobId query param required' });
    const applicants = await Applicant.find({ jobId }, { resumeData: 0 }).sort({ createdAt: -1 });
    res.json(applicants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/applicants/structured
const createStructured = async (req, res) => {
  try {
    const applicant = await Applicant.create({ ...req.body, source: 'structured' });
    res.status(201).json(applicant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST /api/applicants/upload
// Flow: multer saves temp file → Gemini reads base64 → parses fields → stores binary in DB → deletes temp file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const { parsed, fileData, mimeType } = await parseFileWithGemini(req.file.path);

    const applicant = await Applicant.create({
      ...parsed,
      jobId,
      source: 'upload',
      resumeData: fileData,
      resumeMimeType: mimeType,
    });

    fs.unlink(req.file.path, () => {});
    const applicantObj = applicant.toObject();
    delete applicantObj.resumeData;
    delete applicantObj.resumeMimeType;
    res.status(201).json({ applicants: [applicantObj] });
  } catch (err) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getApplicantsByJob, createStructured, uploadFile };
