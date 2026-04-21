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
  'Use names and titles only. IDs are for your internal use when chaining tool calls, not for display.';

interface HistoryMessage {
  role?: string;
  text?: string;
  isStreaming?: boolean;
}

interface GeminiHistoryEntry {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

const buildHistory = (rawHistory: HistoryMessage[]): GeminiHistoryEntry[] => {
  const firstUserIdx = rawHistory.findIndex((m) => m.role === 'user');
  const relevant = firstUserIdx === -1 ? [] : rawHistory.slice(firstUserIdx);

  return [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Understood. I am the U-Select Agent, ready to assist with your recruitment tasks.' }] },
    ...relevant
      .filter((m) => !m.isStreaming && m.text && m.text.trim())
      .map<GeminiHistoryEntry>((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text as string }],
      })),
  ];
};

export interface RunAgentOptions {
  message: string;
  history?: unknown[];
  context?: string;
  file?: string;
  mimeType?: string;
}

const runAgent = async ({
  message,
  history = [],
  context = 'default',
  file,
  mimeType,
}: RunAgentOptions): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  const tools = getToolsForContext(context);
  const toolConfig = getGeminiDeclarations(tools);

  const chatSession = model.startChat({
    history: buildHistory(history as HistoryMessage[]),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [toolConfig] as any,
  });

  // CV upload — attach file inline
  const userParts = file
    ? [
        { text: message || 'A CV has been attached. Extract the candidate details and reply in a friendly, conversational tone. Structure your reply with: Name, Email, Phone, Skills, Experience, Education, Summary. End with: "Let me know if you want to save this applicant to a job."' },
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
