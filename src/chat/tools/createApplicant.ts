import Applicant from '../../models/Applicant.js';
import Job from '../../models/Job.js';
import type { Tool, ToolDefinition } from './listJobs.js';

const definition: ToolDefinition = {
  name: 'createApplicant',
  description:
    'Adds a new applicant to a job. Use this when the user wants to save, add, or create an applicant/candidate for a specific job. You must have the applicant name and the target job before calling this tool.',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'The ID of the job to add the applicant to.',
      },
      jobTitle: {
        type: 'string',
        description: 'The title of the job if the user referred to it by name.',
      },
      name: {
        type: 'string',
        description: 'The applicant full name (required).',
      },
      email: {
        type: 'string',
        description: 'The applicant email address.',
      },
      phone: {
        type: 'string',
        description: 'The applicant phone number.',
      },
      skills: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of skills the applicant has.',
      },
      experienceYears: {
        type: 'number',
        description: 'Total years of professional experience.',
      },
      summary: {
        type: 'string',
        description: 'A brief summary of the applicant profile.',
      },
    },
    required: ['name'],
  },
};

const handler: Tool['handler'] = async (args = {}) => {
  const name = (args.name as string || '').trim();
  if (!name) return 'Applicant name is required.';

  let resolvedJobId = args.jobId as string | undefined;
  const jobTitle = args.jobTitle as string | undefined;
  let resolvedJob: InstanceType<typeof Job> | null = null;

  if (!resolvedJobId && jobTitle) {
    const escaped = jobTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    resolvedJob = await Job.findOne({ title: { $regex: escaped, $options: 'i' } });
    if (!resolvedJob) return `No job found matching the title "${jobTitle}". Please create the job first or provide the correct title.`;
    resolvedJobId = String(resolvedJob._id);
  }

  if (!resolvedJobId) return 'A job ID or job title is required to add an applicant.';

  // Only query DB if we got a raw jobId (title lookup already found the job)
  if (!resolvedJob) {
    resolvedJob = await Job.findById(resolvedJobId);
  }
  if (!resolvedJob) return 'The specified job does not exist.';

  const applicant = await Applicant.create({
    jobId: resolvedJobId,
    name,
    email: (args.email as string || '').trim() || undefined,
    phone: (args.phone as string || '').trim() || undefined,
    skills: Array.isArray(args.skills) ? args.skills.map(String) : [],
    experienceYears: typeof args.experienceYears === 'number' ? args.experienceYears : 0,
    summary: (args.summary as string || '').trim() || undefined,
    source: 'structured',
  });

  return (
    `Applicant added successfully.\n` +
    `Name: ${applicant.name}\n` +
    `ID: ${applicant._id}\n` +
    `Job: ${resolvedJob.title}\n` +
    `Skills: ${(applicant.skills || []).join(', ') || 'N/A'}\n` +
    `Experience: ${applicant.experienceYears} years`
  );
};

const createApplicant: Tool = { definition, handler };
export default createApplicant;
