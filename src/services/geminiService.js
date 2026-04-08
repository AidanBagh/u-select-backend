const genAI = require('../config/gemini');

const rankApplicants = async (job, applicants) => {
  const candidateList = applicants
    .map(
      (a) =>
        `- applicantId: ${a._id}\n  name: ${a.name}\n  skills: ${(a.skills || []).join(', ')}\n  experienceYears: ${a.experienceYears}\n  education: ${a.education || 'N/A'}\n  summary: ${a.summary || 'N/A'}`
    )
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

  const ranked = JSON.parse(clean);

  ranked.sort((a, b) => b.score - a.score);

  return ranked;
};

module.exports = { rankApplicants };
