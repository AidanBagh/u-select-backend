const Job = require('../models/Job');
const Applicant = require('../models/Applicant');
const Screening = require('../models/Screening');
const { rankApplicants } = require('../services/geminiService');

// POST /api/screening/run
const runScreening = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const applicants = await Applicant.find({ jobId }, { resumeData: 0 });
    if (!applicants.length) return res.status(400).json({ message: 'No applicants found for this job' });

    const ranked = await rankApplicants(job, applicants);

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
    res.status(500).json({ message: err.message });
  }
};

// GET /api/screening/:jobId
const getScreening = async (req, res) => {
  try {
    const screening = await Screening.findOne({ jobId: req.params.jobId });
    if (!screening) return res.status(404).json({ message: 'No screening results found for this job' });
    res.json(screening);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { runScreening, getScreening };
