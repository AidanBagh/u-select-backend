import Job from '../../models/Job.js';
import type { Tool, ToolDefinition } from './listJobs.js';

const definition: ToolDefinition = {
  name: 'createJob',
  description:
    'Creates a new job posting on the platform. Use this when the user wants to add or create a new job, position, or role. You must gather the title and description from the user before calling this tool.',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'The job title (required).',
      },
      description: {
        type: 'string',
        description: 'A detailed job description (required).',
      },
      requirements: {
        type: 'array',
        items: { type: 'string' },
        description: 'A list of requirements or qualifications for the job.',
      },
      weightsSkills: {
        type: 'number',
        description: 'Weight percentage for skills scoring (default 40).',
      },
      weightsExperience: {
        type: 'number',
        description: 'Weight percentage for experience scoring (default 30).',
      },
      weightsEducation: {
        type: 'number',
        description: 'Weight percentage for education scoring (default 20).',
      },
      weightsRelevance: {
        type: 'number',
        description: 'Weight percentage for relevance scoring (default 10).',
      },
    },
    required: ['title', 'description'],
  },
};

const handler: Tool['handler'] = async (args = {}) => {
  const title = (args.title as string || '').trim();
  const description = (args.description as string || '').trim();

  if (!title || !description) return 'Both title and description are required to create a job.';

  const requirements = Array.isArray(args.requirements) ? args.requirements.map(String) : [];

  const weights = {
    skills: typeof args.weightsSkills === 'number' ? args.weightsSkills : 40,
    experience: typeof args.weightsExperience === 'number' ? args.weightsExperience : 30,
    education: typeof args.weightsEducation === 'number' ? args.weightsEducation : 20,
    relevance: typeof args.weightsRelevance === 'number' ? args.weightsRelevance : 10,
  };

  const job = await Job.create({ title, description, requirements, weights });

  return (
    `Job created successfully.\n` +
    `Title: ${job.title}\n` +
    `ID: ${job._id}\n` +
    `Requirements: ${(job.requirements || []).join(', ') || 'None'}\n` +
    `Weights: Skills ${weights.skills}%, Experience ${weights.experience}%, Education ${weights.education}%, Relevance ${weights.relevance}%`
  );
};

const createJob: Tool = { definition, handler };
export default createJob;
