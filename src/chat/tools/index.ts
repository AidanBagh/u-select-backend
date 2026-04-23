import listJobs from './listJobs.js';
import listApplicants from './listApplicants.js';
import getJobDetail from './getJobDetail.js';
import getApplicantDetail from './getApplicantDetail.js';
import createJob from './createJob.js';
import createApplicant from './createApplicant.js';
import runScreeningTool from './runScreeningTool.js';
import getScreeningResults from './getScreeningResults.js';
import deleteJob from './deleteJob.js';
import deleteApplicant from './deleteApplicant.js';
import type { Tool } from './listJobs.js';

// Registry — add new tools here as they are built
const ALL_TOOLS: Tool[] = [
  listJobs,
  listApplicants,
  getJobDetail,
  getApplicantDetail,
  createJob,
  createApplicant,
  runScreeningTool,
  getScreeningResults,
  deleteJob,
  deleteApplicant,
];

// Context map — controls which tools are available per chat location
const CONTEXT_TOOLS: Record<string, Tool[]> = {
  dashboard: ALL_TOOLS,
  jobs: [listJobs, getJobDetail, createJob, deleteJob],
  applicants: [listApplicants, getApplicantDetail, createApplicant, deleteApplicant, listJobs, getJobDetail],
  screening: [runScreeningTool, getScreeningResults, listJobs, getJobDetail],
  default: ALL_TOOLS,
};

const getToolsForContext = (context: string): Tool[] =>
  CONTEXT_TOOLS[context] || CONTEXT_TOOLS.default;

// Build the Gemini function declarations array from tool definitions
const getGeminiDeclarations = (tools: Tool[]) => ({
  functionDeclarations: tools.map((t) => t.definition),
});

// Security key for destructive operations (swap for env var in production)
const SECURITY_KEY = 'uselect2026';

// Execute a tool by name with args
const executeTool = async (name: string, args: Record<string, unknown>): Promise<string> => {
  const tool = ALL_TOOLS.find((t) => t.definition.name === name);
  if (!tool) return `Unknown tool: ${name}`;

  // Gate destructive tools behind a security key
  if (tool.destructive) {
    const provided = (args.securityKey as string || '').trim();
    if (provided !== SECURITY_KEY) {
      return 'Security key is incorrect or missing. This action requires a valid security key to proceed.';
    }
  }

  return await tool.handler(args);
};

export { getToolsForContext, getGeminiDeclarations, executeTool, SECURITY_KEY };
