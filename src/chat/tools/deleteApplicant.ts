import Applicant from '../../models/Applicant.js';
import type { Tool, ToolDefinition } from './listJobs.js';

const definition: ToolDefinition = {
  name: 'deleteApplicant',
  description:
    'Deletes an applicant from the platform. Use this when the user explicitly asks to delete or remove a candidate/applicant. Always confirm with the user before calling this tool.',
  parameters: {
    type: 'object',
    properties: {
      applicantId: {
        type: 'string',
        description: 'The ID of the applicant to delete.',
      },
      applicantName: {
        type: 'string',
        description: 'The name of the applicant if the user referred to them by name.',
      },
    },
    required: [],
  },
};

const handler: Tool['handler'] = async (args = {}) => {
  const applicantId = args.applicantId as string | undefined;
  const applicantName = args.applicantName as string | undefined;

  let applicant;
  if (applicantId) {
    applicant = await Applicant.findById(applicantId);
  } else if (applicantName) {
    const escaped = applicantName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    applicant = await Applicant.findOne({ name: { $regex: escaped, $options: 'i' } });
  }

  if (!applicant) return 'No applicant found matching that query.';

  const name = applicant.name;
  await Applicant.findByIdAndDelete(applicant._id);

  return `Applicant "${name}" has been deleted successfully.`;
};

const deleteApplicant: Tool = { definition, handler };
export default deleteApplicant;
