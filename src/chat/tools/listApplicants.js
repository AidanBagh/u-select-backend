const Applicant = require('../../models/Applicant');
const Job = require('../../models/Job');

// Tool definition — sent to Gemini so it knows when and how to call this
const definition = {
  name: 'listApplicants',
  description: 'Returns applicants for a specific job, or all applicants across all jobs if no jobId is provided. Use this when the user asks about candidates, applicants, or who has applied.',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'The ID of the job to fetch applicants for. Omit to get applicants across all jobs.',
      },
      jobTitle: {
        type: 'string',
        description: 'The title of the job if the user referred to it by name instead of ID. Will be used to look up the jobId.',
      },
    },
    required: [],
  },
};

// Handler — executes when Gemini calls this tool
const handler = async ({ jobId, jobTitle } = {}) => {
  let resolvedJobId = jobId;

  // If user said job title instead of ID, look it up
  if (!resolvedJobId && jobTitle) {
    const job = await Job.findOne({ title: { $regex: jobTitle, $options: 'i' } });
    if (!job) return `No job found matching the title "${jobTitle}".`;
    resolvedJobId = job._id;
  }

  const query = resolvedJobId ? { jobId: resolvedJobId } : {};
  const applicants = await Applicant.find(query, { resumeData: 0 })
    .populate('jobId', 'title')
    .sort({ createdAt: -1 })
    .limit(50);

  if (!applicants.length) return resolvedJobId ? 'No applicants found for that job.' : 'There are no applicants on the platform yet.';

  return applicants
    .map((a) => {
      const job = a.jobId?.title || 'Unknown Job';
      const skills = (a.skills || []).slice(0, 5).join(', ') || 'N/A';
      return `- ${a.name} (ID: ${a._id}) — Job: ${job}\n  Skills: ${skills} | Experience: ${a.experienceYears} yrs`;
    })
    .join('\n');
};

module.exports = { definition, handler };
