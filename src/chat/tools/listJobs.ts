import Job from '../../models/Job.js';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface Tool {
  definition: ToolDefinition;
  destructive?: boolean;
  handler: (args?: Record<string, unknown>) => Promise<string>;
}

const definition: ToolDefinition = {
  name: 'listJobs',
  description: 'Returns all job postings currently on the Umurava Select platform. Use this when the user asks about available jobs, open positions, or wants to see what jobs exist.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

const handler: Tool['handler'] = async () => {
  const jobs = await Job.find({}, 'title description requirements createdAt').sort({ createdAt: -1 });
  if (!jobs.length) return 'There are currently no job postings on the platform.';

  return jobs
    .map((j) => `- ${j.title} (ID: ${j._id})\n  Requirements: ${(j.requirements || []).join(', ') || 'N/A'}`)
    .join('\n');
};

const listJobs: Tool = { definition, handler };
export default listJobs;
