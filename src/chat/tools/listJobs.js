const Job = require('../../models/Job');

// Tool definition — sent to Gemini so it knows when and how to call this
const definition = {
  name: 'listJobs',
  description: 'Returns all job postings currently on the Umurava Select platform. Use this when the user asks about available jobs, open positions, or wants to see what jobs exist.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

// Handler — executes when Gemini calls this tool
const handler = async () => {
  const jobs = await Job.find({}, 'title description requirements createdAt').sort({ createdAt: -1 });
  if (!jobs.length) return 'There are currently no job postings on the platform.';

  return jobs
    .map((j) => `- ${j.title} (ID: ${j._id})\n  Requirements: ${(j.requirements || []).join(', ') || 'N/A'}`)
    .join('\n');
};

module.exports = { definition, handler };
