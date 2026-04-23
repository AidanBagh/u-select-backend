import Job from '../../models/Job.js';
import Applicant from '../../models/Applicant.js';
import Screening from '../../models/Screening.js';
import { rankApplicants } from '../../services/geminiService.js';
import type { Tool, ToolDefinition } from './listJobs.js';

const definition: ToolDefinition = {
  name: 'runScreening',
  description:
    'Runs AI-powered screening on all applicants for a specific job. This scores and ranks candidates based on job requirements and weights. Use this when the user asks to screen, evaluate, rank, or shortlist candidates for a job.',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'The ID of the job to run screening for.',
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
  let resolvedJobId = args.jobId as string | undefined;
  const jobTitle = args.jobTitle as string | undefined;

  if (!resolvedJobId && jobTitle) {
    const escaped = jobTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const found = await Job.findOne({ title: { $regex: escaped, $options: 'i' } });
    if (!found) return `No job found matching the title "${jobTitle}".`;
    resolvedJobId = String(found._id);
  }

  if (!resolvedJobId) return 'A job ID or job title is required to run screening.';

  const job = await Job.findById(resolvedJobId);
  if (!job) return 'Job not found.';

  const applicants = await Applicant.find({ jobId: resolvedJobId }, { resumeData: 0 });
  if (!applicants.length) return `No applicants found for "${job.title}". Add some applicants first.`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ranked = await rankApplicants(job as any, applicants as any);

  const rankedApplicants = ranked.map((item, index) => ({
    applicantId: item.applicantId,
    name: item.name,
    score: item.score,
    reasoning: item.reasoning,
    shortlisted: index < 10,
  }));

  await Screening.findOneAndUpdate(
    { jobId: resolvedJobId },
    { jobId: resolvedJobId, rankedApplicants },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const topCandidates = rankedApplicants
    .slice(0, 5)
    .map((c, i) => `  ${i + 1}. ${c.name} — Score: ${c.score}/100`)
    .join('\n');

  return (
    `Screening completed for "${job.title}".\n` +
    `Total candidates evaluated: ${rankedApplicants.length}\n` +
    `Shortlisted: ${rankedApplicants.filter((c) => c.shortlisted).length}\n\n` +
    `Top candidates:\n${topCandidates}`
  );
};

const runScreeningTool: Tool = { definition, handler };
export default runScreeningTool;
