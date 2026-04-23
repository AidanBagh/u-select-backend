import Applicant from '../../models/Applicant.js';
import type { Tool, ToolDefinition } from './listJobs.js';

const definition: ToolDefinition = {
  name: 'getApplicantDetail',
  description:
    'Returns full details of a single applicant by ID or name. Use this when the user asks about a specific candidate, their skills, experience, education, or work history.',
  parameters: {
    type: 'object',
    properties: {
      applicantId: {
        type: 'string',
        description: 'The ID of the applicant to fetch.',
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
    applicant = await Applicant.findById(applicantId, { resumeData: 0 })
      .populate<{ jobId: { title: string } }>('jobId', 'title');
  } else if (applicantName) {
    const escaped = applicantName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    applicant = await Applicant.findOne(
      { name: { $regex: escaped, $options: 'i' } },
      { resumeData: 0 }
    ).populate<{ jobId: { title: string } }>('jobId', 'title');
  }

  if (!applicant) return 'No applicant found matching that query.';

  const jobTitle = applicant.jobId?.title || 'Unknown Job';
  const skills = (applicant.skills || []).join(', ') || 'N/A';
  const certs = (applicant.certifications || []).join(', ') || 'N/A';

  const work = (applicant.workHistory || [])
    .map((w) => `  • ${w.role || 'N/A'} at ${w.company || 'N/A'} (${w.startDate || '?'} – ${w.endDate || 'present'})`)
    .join('\n') || '  None';

  const edu = (applicant.education || [])
    .map((e) => `  • ${e.degree || 'N/A'} in ${e.field || 'N/A'} — ${e.institution || 'N/A'} (${e.year || 'N/A'})`)
    .join('\n') || '  None';

  return (
    `Name: ${applicant.name}\n` +
    `ID: ${applicant._id}\n` +
    `Job: ${jobTitle}\n` +
    `Email: ${applicant.email || 'N/A'}\n` +
    `Phone: ${applicant.phone || 'N/A'}\n` +
    `Skills: ${skills}\n` +
    `Certifications: ${certs}\n` +
    `Experience: ${applicant.experienceYears} years\n` +
    `Work History:\n${work}\n` +
    `Education:\n${edu}\n` +
    `Summary: ${applicant.summary || 'N/A'}\n` +
    `Source: ${applicant.source}`
  );
};

const getApplicantDetail: Tool = { definition, handler };
export default getApplicantDetail;
