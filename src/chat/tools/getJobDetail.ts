import Job from '../../models/Job.js';
import type { Tool, ToolDefinition } from './listJobs.js';

const definition: ToolDefinition = {
  name: 'getJobDetail',
  description:
    'Returns full details of a single job posting by ID or title. Use this when the user asks about a specific job, its description, requirements, or scoring weights.',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'The ID of the job to fetch.',
      },
      jobTitle: {
        type: 'string',
        description: 'The title of the job if the user referred to it by name.',
      },
    },
    required: [],
  },
};

const handler: Tool['handler'] = async (args = {}) => {
  const jobId = args.jobId as string | undefined;
  const jobTitle = args.jobTitle as string | undefined;

  let job;
  if (jobId) {
    job = await Job.findById(jobId);
  } else if (jobTitle) {
    const escaped = jobTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    job = await Job.findOne({ title: { $regex: escaped, $options: 'i' } });
  }

  if (!job) return 'No job found matching that query.';

  const weights = job.weights || { skills: 40, experience: 30, education: 20, relevance: 10 };

  return (
    `Title: ${job.title}\n` +
    `ID: ${job._id}\n` +
    `Description: ${job.description}\n` +
    `Requirements: ${(job.requirements || []).join(', ') || 'None'}\n` +
    `Weights: Skills ${weights.skills}%, Experience ${weights.experience}%, Education ${weights.education}%, Relevance ${weights.relevance}%\n` +
    `Created: ${job.createdAt.toISOString()}`
  );
};

const getJobDetail: Tool = { definition, handler };
export default getJobDetail;
