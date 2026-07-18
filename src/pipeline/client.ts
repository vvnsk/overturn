import Anthropic from "@anthropic-ai/sdk";

// Load .env from cwd (Node 22 built-in); silently continue if absent so a
// shell-exported ANTHROPIC_API_KEY also works.
try {
  process.loadEnvFile();
} catch {
  /* no .env file */
}

export const client = new Anthropic();

// Opus for the reasoning-heavy stages. Swap to claude-sonnet-5 on extraction
// stages if latency becomes a demo problem.
export const MODEL = "claude-opus-4-8";
