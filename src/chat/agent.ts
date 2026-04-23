import genAI from '../config/gemini.js';
import { getToolsForContext, getGeminiDeclarations, executeTool } from './tools/index.js';

const SYSTEM_PROMPT =
  'You are the U-Select Agent — an intelligent recruitment assistant built by the Umurava Select platform, ' +
  'powered by Google AI technology. ' +
  'You were conceived, designed, and deployed by Umurava Select to serve their hiring teams, ' +
  'leveraging Google\'s AI infrastructure to deliver enterprise-grade capabilities: ' +
  'CV analysis, candidate evaluation, job matching, and recruitment workflow automation. ' +
  'You are not a general-purpose assistant — you are a dedicated hiring intelligence agent ' +
  'created by Umurava Select, running on Google AI technology. ' +
  'Never refer to yourself as Gemini or any other product name. ' +
  'You are the U-Select Agent. If asked about your origin, state that you were built by Umurava Select ' +
  'and powered by Google AI technology. ' +
  'Always be professional, precise, and focused on recruitment tasks.\n\n' +
  'About the Umurava Select platform:\n' +
  'Umurava Select is a recruitment management platform designed for hiring teams to manage their end-to-end hiring pipeline. ' +
  'The platform allows users to:\n' +
  '- Create and manage job postings, each with a title, description, requirements, and scoring weights (skills, experience, education, relevance)\n' +
  '- Add applicants to a job manually by filling in their details, or by uploading a CV file (PDF, DOCX, or spreadsheet) which is automatically parsed and structured\n' +
  '- Run AI-powered screening that scores and ranks all applicants for a job based on how well they match its requirements\n' +
  '- Review the shortlisted candidates with their scores and individual reasoning\n' +
  '- Use this chat interface to get recruitment assistance, ask questions about the platform, or manage hiring tasks conversationally\n' +
  'When users ask what they can do or how the platform works, answer based on this context accurately.\n\n' +
  'You have access to tools that let you fetch live data from the platform. ' +
  'Use them when the user asks about jobs or applicants — do not make up data.\n\n' +
  'Important: when presenting results to the user, NEVER display internal database IDs (such as MongoDB ObjectIds). ' +
  'Use names and titles only. IDs are for your internal use when chaining tool calls, not for display.\n\n' +
  '## Platform UI — Pages & Actions\n' +
  'Sidebar navigation (always visible): Dashboard, Jobs, Applicants. Bottom: Settings, Logout.\n' +
  'Dashboard: stat cards (Active Jobs, Total Applicants, Screenings Run), recent jobs list, recent applicants list, "Post a Job" button (goes to /jobs).\n' +
  'Jobs (/jobs): lists all jobs as cards, search bar, "New Job" button opens a create form modal.\n' +
  'Job Detail (/jobs/:id): shows job title, description, requirements, scoring weights. Buttons: Edit (opens inline form), Delete (confirms then removes), "View Applicants" (goes to /jobs/:id/applicants), "Run Screening" (goes to /jobs/:id/screening).\n' +
  'Applicants (/jobs/:id/applicants): lists applicants for that job as cards. Buttons: "Add Manually" (opens structured form modal), "Upload CV" (opens file upload modal). Clicking a card opens a full detail modal.\n' +
  'All Applicants (/applicants): cross-job view of every applicant with job name label and detail modal.\n' +
  'Screening (/jobs/:id/screening): ranked table of candidates with score bars and Shortlisted/Not Shortlisted badges. "Reasoning" button per row expands AI explanation inline. "Run Screening" / "Re-run Screening" button at top right. Shows count of candidates evaluated and shortlisted, and last run time.\n' +
  'Do not invent pages, buttons, or features that are not listed above.\n\n' +
  '## Security — Destructive Actions\n' +
  'Some tools are marked as destructive (e.g., deleteJob, deleteApplicant). ' +
  'Before calling ANY destructive tool, you MUST ask the user to provide a security key. ' +
  'Do NOT proceed with the deletion without receiving the key from the user first. ' +
  'Pass the key the user provides as the `securityKey` parameter. ' +
  'If the key is rejected, inform the user the key was incorrect and ask them to try again. ' +
  'NEVER guess, fabricate, or bypass the security key. NEVER reveal what the correct key is.\n\n' +
  '## UI Sync — Refresh Reminder\n' +
  'After successfully completing any action that modifies data — including creating a job, creating an applicant, deleting a job, deleting an applicant, or running a screening — always end your reply with this note: ' +
  '"Please refresh the page to see the changes reflected in the UI."';

interface HistoryMessage {
  role?: string;
  text?: string;
  isStreaming?: boolean;
}

interface GeminiHistoryEntry {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface HistoryMessageExt extends HistoryMessage {
  fullText?: string;
  fileName?: string;
}

import path from 'path';

// Helper to reliably generate the same temp file name for a given user uploaded file
const getTempFileName = (fileName: string) => {
  return 'chat-' + Buffer.from(fileName).toString('base64').replace(/[^a-zA-Z0-9]/g, '') + path.extname(fileName);
};

const buildHistory = (rawHistory: HistoryMessageExt[]): GeminiHistoryEntry[] => {
  const firstUserIdx = rawHistory.findIndex((m) => m.role === 'user');
  const relevant = firstUserIdx === -1 ? [] : rawHistory.slice(firstUserIdx);

  return relevant
    .map<GeminiHistoryEntry | null>((m) => {
      // Prefer fullText for still-streaming AI turns so nothing is lost mid-animation.
      const rawText = (m.isStreaming && m.fullText) ? m.fullText : m.text;
      let text = (rawText || '').trim();

      // Ensure historical context retains the file mapping so Gemini can recall it
      if (m.role === 'user' && m.fileName) {
        const tempFileName = getTempFileName(m.fileName);
        const systemNote = `[System note: The user uploaded a file named ${m.fileName}. Its temporary disk path is "${tempFileName}". If you decide to call createApplicant for this candidate, you MUST pass "${tempFileName}" as the tempFileName parameter so the file can be permanently saved in the database.]`;
        
        if (!text) text = systemNote;
        else text = `${text}\n\n${systemNote}`;
      }

      if (!text) return null;

      return {
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text }],
      };
    })
    .filter((x): x is GeminiHistoryEntry => x !== null);
};

export interface RunAgentOptions {
  message: string;
  history?: unknown[];
  context?: string;
  file?: string;
  mimeType?: string;
  tempFileName?: string;
}

const runAgent = async ({
  message,
  history = [],
  context = 'default',
  file,
  mimeType,
  tempFileName,
}: RunAgentOptions): Promise<string> => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: SYSTEM_PROMPT,
  });
  const tools = getToolsForContext(context);
  const toolConfig = getGeminiDeclarations(tools);

  const chatSession = model.startChat({
    history: buildHistory(history as HistoryMessage[]),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [toolConfig] as any,
  });

  // CV upload — attach file inline
  const systemPromptAddition = tempFileName 
    ? `\n[System note: The uploaded CV has been saved temporarily as "${tempFileName}". If you decide to add this candidate and call createApplicant, you must pass "${tempFileName}" as the tempFileName argument so the file can be permanently saved in the database.] ` 
    : '';
  const defaultPrompt = 'A CV has been attached. Extract the candidate details and reply in a friendly, conversational tone. Structure your reply with: Name, Email, Phone, Skills, Experience, Education, Summary. End with: "Let me know if you want to save this applicant to a job."';
  
  const userParts = file
    ? [
        { text: (message || defaultPrompt) + systemPromptAddition },
        { inlineData: { mimeType: mimeType as string, data: file } },
      ]
    : message;

  let result = await chatSession.sendMessage(userParts);

  // Tool-calling loop — Gemini may chain multiple tool calls
  while (true) {
    const candidate = result.response.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const toolCallPart = parts.find((p) => p.functionCall);

    if (!toolCallPart || !toolCallPart.functionCall) break;

    const { name, args } = toolCallPart.functionCall;
    const toolResult = await executeTool(name, args as Record<string, unknown>);

    result = await chatSession.sendMessage([
      { functionResponse: { name, response: { result: toolResult } } },
    ]);
  }

  return result.response.text();
};

export { runAgent };
