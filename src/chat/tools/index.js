const listJobs = require('./listJobs');
const listApplicants = require('./listApplicants');

// Registry — add new tools here as they are built
// Each entry: { definition, handler }
// definition → sent to Gemini (name, description, parameters)
// handler    → called when Gemini invokes the tool

const ALL_TOOLS = [listJobs, listApplicants];

// Context map — controls which tools are available per chat location
// 'dashboard' gets everything; scoped contexts get a subset
const CONTEXT_TOOLS = {
  dashboard: ALL_TOOLS,
  jobs: [listJobs],
  applicants: [listApplicants, listJobs],
  default: ALL_TOOLS,
};

const getToolsForContext = (context) => CONTEXT_TOOLS[context] || CONTEXT_TOOLS.default;

// Build the Gemini function declarations array from tool definitions
const getGeminiDeclarations = (tools) => ({
  functionDeclarations: tools.map((t) => t.definition),
});

// Execute a tool by name with args
const executeTool = async (name, args) => {
  const tool = ALL_TOOLS.find((t) => t.definition.name === name);
  if (!tool) return `Unknown tool: ${name}`;
  return await tool.handler(args);
};

module.exports = { getToolsForContext, getGeminiDeclarations, executeTool };
