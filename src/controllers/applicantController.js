const fs = require('fs');
const Applicant = require('../models/Applicant');
const { parseFile } = require('../services/fileParserService');

// GET /api/applicants?jobId=
const getApplicantsByJob = async (req, res) => {
  try {
    const { jobId } = req.query;
    if (!jobId) return res.status(400).json({ message: 'jobId query param required' });
    const applicants = await Applicant.find({ jobId }).sort({ createdAt: -1 });
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
const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const records = parseFile(req.file.path);
    const applicants = await Applicant.insertMany(
      records.map((r) => ({ ...r, jobId, source: 'upload' }))
    );

    fs.unlink(req.file.path, () => {});
    res.status(201).json({ count: applicants.length, applicants });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getApplicantsByJob, createStructured, uploadFile };
