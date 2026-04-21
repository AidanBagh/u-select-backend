import type { RequestHandler } from 'express';
import Job from '../models/Job.js';
import Applicant from '../models/Applicant.js';
import Screening from '../models/Screening.js';
import { rankApplicants } from '../services/geminiService.js';

// POST /api/screening/run
const runScreening: RequestHandler = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const applicants = await Applicant.find({ jobId }, { resumeData: 0 });
    if (!applicants.length) return res.status(400).json({ message: 'No applicants found for this job' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ranked = await rankApplicants(job as any, applicants as any);

    const rankedApplicants = ranked.map((item, index) => ({
      applicantId: item.applicantId,
      name: item.name,
      score: item.score,
      reasoning: item.reasoning,
      shortlisted: index < 10,
    }));

    const screening = await Screening.findOneAndUpdate(
      { jobId },
      { jobId, rankedApplicants },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(screening);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
};

// GET /api/screening/:jobId
const getScreening: RequestHandler = async (req, res) => {
  try {
    const screening = await Screening.findOne({ jobId: req.params.jobId });
    if (!screening) return res.status(404).json({ message: 'No screening results found for this job' });
    res.json(screening);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
};

export { runScreening, getScreening };
