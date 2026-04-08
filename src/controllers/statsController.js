const Job = require('../models/Job');
const Applicant = require('../models/Applicant');
const Screening = require('../models/Screening');

// GET /api/stats
const getStats = async (req, res) => {
  try {
    const [totalJobs, totalApplicants, screeningsRun] = await Promise.all([
      Job.countDocuments(),
      Applicant.countDocuments(),
      Screening.countDocuments(),
    ]);
    res.json({ totalJobs, totalApplicants, screeningsRun });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats };
