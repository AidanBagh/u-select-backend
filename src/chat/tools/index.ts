import listJobs from './listJobs.js';
import listApplicants from './listApplicants.js';
import type { Tool } from './listJobs.js';

// Registry — add new tools here as they are built
const ALL_TOOLS: Tool[] = [listJobs, listApplicants];

// Context map — controls which tools are available per chat location
const CONTEXT_TOOLS: Record<string, Tool[]> = {
  dashboard: ALL_TOOLS,
  jobs: [listJobs],
  applicants: [listApplicants, listJobs],
  default: ALL_TOOLS,
};

const getToolsForContext = (context: string): Tool[] =>
  CONTEXT_TOOLS[context] || CONTEXT_TOOLS.default;

// Build the Gemini function declarations array from tool definitions
const getGeminiDeclarations = (tools: Tool[]) => ({
  functionDeclarations: tools.map((t) => t.definition),
});

// Execute a tool by name with args
const executeTool = async (name: string, args: Record<string, unknown>): Promise<string> => {
  const tool = ALL_TOOLS.find((t) => t.definition.name === name);
  if (!tool) return `Unknown tool: ${name}`;
  return await tool.handler(args);
};

export { getToolsForContext, getGeminiDeclarations, executeTool };
