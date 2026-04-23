import fs from 'fs';
import type { RequestHandler } from 'express';
import Applicant from '../models/Applicant.js';
import { parseFileWithGemini } from '../services/fileParserService.js';

// GET /api/applicants/all — returns all applicants across jobs (max 50, newest first)
// Populates jobId with job title for display
const getAllApplicants: RequestHandler = async (req, res) => {
  try {
    const applicants = await Applicant.find({}, { resumeData: 0 })
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(applicants);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
};

// GET /api/applicants?jobId=
// Excludes resumeData binary field from list responses to keep payloads light
const getApplicantsByJob: RequestHandler = async (req, res) => {
  try {
    const { jobId } = req.query;
    if (!jobId) return res.status(400).json({ message: 'jobId query param required' });
    const applicants = await Applicant.find({ jobId }, { resumeData: 0 }).sort({ createdAt: -1 });
    res.json(applicants);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
};

// POST /api/applicants/structured
const createStructured: RequestHandler = async (req, res) => {
  try {
    const applicant = await Applicant.create({ ...req.body, source: 'structured' });
    res.status(201).json(applicant);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ message });
  }
};

// POST /api/applicants/upload
// Flow: multer saves temp file → Gemini reads base64 → parses fields → stores binary in DB → deletes temp file
const uploadFile: RequestHandler = async (req, res) => {
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
    const applicantObj = applicant.toObject() as Record<string, unknown>;
    delete applicantObj.resumeData;
    delete applicantObj.resumeMimeType;
    res.status(201).json({ applicants: [applicantObj] });
  } catch (err) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ message });
  }
};

// DELETE /api/applicants/:id
const deleteApplicantById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const applicant = await Applicant.findByIdAndDelete(id);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    res.json({ message: 'Applicant deleted successfully' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
};

export { getAllApplicants, getApplicantsByJob, createStructured, uploadFile, deleteApplicantById };
