import type { RequestHandler } from 'express';
import Job from '../models/Job.js';

// GET /api/jobs
const getAllJobs: RequestHandler = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
};

// POST /api/jobs
const createJob: RequestHandler = async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ message });
  }
};

// GET /api/jobs/:id
const getJobById: RequestHandler = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
};

// PUT /api/jobs/:id
const updateJob: RequestHandler = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ message });
  }
};

// DELETE /api/jobs/:id
const deleteJob: RequestHandler = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
};

export { getAllJobs, createJob, getJobById, updateJob, deleteJob };
