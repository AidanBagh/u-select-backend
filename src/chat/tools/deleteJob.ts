import Job from '../../models/Job.js';
import Applicant from '../../models/Applicant.js';
import Screening from '../../models/Screening.js';
import type { Tool, ToolDefinition } from './listJobs.js';

const definition: ToolDefinition = {
  name: 'deleteJob',
  description:
    'Deletes a job posting and all associated applicants and screening results. Use this when the user explicitly asks to delete or remove a job. Always confirm with the user before calling this tool.',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'The ID of the job to delete.',
      },
      jobTitle: {
        type: 'string',
        description: 'The title of the job if the user referred to it by name.',
      },
      securityKey: {
        type: 'string',
        description: 'The security key provided by the user to authorize this destructive action. You MUST ask the user for this key before calling this tool.',
      },
    },
    required: ['securityKey'],
  },
};

const handler: Tool['handler'] = async (args = {}) => {
  let resolvedJobId = args.jobId as string | undefined;
  const jobTitle = args.jobTitle as string | undefined;

  if (!resolvedJobId && jobTitle) {
    const escaped = jobTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const job = await Job.findOne({ title: { $regex: escaped, $options: 'i' } });
    if (!job) return `No job found matching the title "${jobTitle}".`;
    resolvedJobId = String(job._id);
  }

  if (!resolvedJobId) return 'A job ID or job title is required to delete a job.';

  const job = await Job.findById(resolvedJobId);
  if (!job) return 'Job not found.';

  const title = job.title;

  // Delete associated data first, then the job
  const deletedApplicants = await Applicant.deleteMany({ jobId: resolvedJobId });
  await Screening.deleteMany({ jobId: resolvedJobId });
  await Job.findByIdAndDelete(resolvedJobId);

  return (
    `Job "${title}" has been deleted.\n` +
    `Also removed: ${deletedApplicants.deletedCount} applicant(s) and associated screening results.`
  );
};

const deleteJob: Tool = { definition, handler, destructive: true };
export default deleteJob;
