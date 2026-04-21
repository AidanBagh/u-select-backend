import genAI from '../config/gemini.js';
import type { IJob } from '../models/Job.js';
import type { IApplicant } from '../models/Applicant.js';
import type { Types } from 'mongoose';

export interface RankedApplicantResult {
  applicantId: string;
  name: string;
  score: number;
  reasoning: string;
}

type ApplicantWithId = IApplicant & { _id: Types.ObjectId };

const rankApplicants = async (
  job: IJob,
  applicants: ApplicantWithId[]
): Promise<RankedApplicantResult[]> => {
  const candidateList = applicants
    .map((a) => {
      const work = (a.workHistory || [])
        .map(
          (w) =>
            `    • ${w.role} at ${w.company} (${w.startDate || '?'} – ${w.endDate || 'present'}): ${(w.responsibilities || []).join('; ')}`
        )
        .join('\n');

      const edu = (a.education || [])
        .map((e) => `    • ${e.degree} in ${e.field || 'N/A'} — ${e.institution} (${e.year || 'N/A'})`)
        .join('\n');

      return (
        `- applicantId: ${a._id}\n` +
        `  name: ${a.name}\n` +
        `  skills: ${(a.skills || []).join(', ')}\n` +
        `  certifications: ${(a.certifications || []).join(', ') || 'N/A'}\n` +
        `  experienceYears: ${a.experienceYears}\n` +
        `  workHistory:\n${work || '    N/A'}\n` +
        `  education:\n${edu || '    N/A'}\n` +
        `  summary: ${a.summary || 'N/A'}`
      );
    })
    .join('\n');

  const prompt =
    `You are an expert recruiter evaluating candidates for a job.\n\n` +
    `JOB TITLE: ${job.title}\n` +
    `DESCRIPTION: ${job.description}\n` +
    `REQUIREMENTS: ${(job.requirements || []).join(', ')}\n` +
    `SCORING WEIGHTS: skills=${job.weights.skills}%, experience=${job.weights.experience}%, education=${job.weights.education}%, relevance=${job.weights.relevance}%\n\n` +
    `CANDIDATES:\n${candidateList}\n\n` +
    `Score each candidate from 0 to 100 using the provided weights. ` +
    `Return ONLY a valid JSON array with no markdown, no code fences, and no explanation. ` +
    `Each item must have exactly these fields: { "applicantId": string, "name": string, "score": number, "reasoning": string }`;

  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const clean = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const ranked: RankedApplicantResult[] = JSON.parse(clean);

  ranked.sort((a, b) => b.score - a.score);

  return ranked;
};

export { rankApplicants };
