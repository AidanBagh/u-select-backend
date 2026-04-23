import Job from '../../models/Job.js';
import Screening from '../../models/Screening.js';
import type { Tool, ToolDefinition } from './listJobs.js';

const definition: ToolDefinition = {
  name: 'getScreeningResults',
  description:
    'Fetches the screening results (scores, rankings, shortlist) for a specific job. Use this when the user asks about screening results, scores, shortlisted candidates, or rankings for a job.',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'The ID of the job to fetch screening results for.',
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
    const job = await Job.findOne({ title: { $regex: escaped, $options: 'i' } });
    if (!job) return `No job found matching the title "${jobTitle}".`;
    resolvedJobId = String(job._id);
  }

  if (!resolvedJobId) return 'A job ID or job title is required to fetch screening results.';

  const screening = await Screening.findOne({ jobId: resolvedJobId });
  if (!screening) return 'No screening results found for this job. Run screening first.';

  const job = await Job.findById(resolvedJobId, 'title');
  const jobName = job?.title || 'Unknown Job';

  const candidates = (screening.rankedApplicants || [])
    .map((c, i) => {
      const status = c.shortlisted ? '✅ Shortlisted' : '—';
      return `  ${i + 1}. ${c.name} — Score: ${c.score}/100 ${status}\n     Reasoning: ${c.reasoning || 'N/A'}`;
    })
    .join('\n');

  return (
    `Screening results for "${jobName}":\n` +
    `Total evaluated: ${screening.rankedApplicants.length}\n` +
    `Shortlisted: ${screening.rankedApplicants.filter((c) => c.shortlisted).length}\n\n` +
    `Rankings:\n${candidates}`
  );
};

const getScreeningResults: Tool = { definition, handler };
export default getScreeningResults;
