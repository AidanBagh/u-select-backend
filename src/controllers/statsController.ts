import type { RequestHandler } from 'express';
import Job from '../models/Job.js';
import Applicant from '../models/Applicant.js';
import Screening from '../models/Screening.js';

// GET /api/stats
const getStats: RequestHandler = async (req, res) => {
  try {
    const [totalJobs, totalApplicants, screeningsRun] = await Promise.all([
      Job.countDocuments(),
      Applicant.countDocuments(),
      Screening.countDocuments(),
    ]);
    res.json({ totalJobs, totalApplicants, screeningsRun });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
};

export { getStats };
