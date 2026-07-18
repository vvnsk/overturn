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

// Shared guard for the structured-output stages: surface truncation/refusal as
// a clear error instead of a cryptic JSON.parse failure mid-demo.
export function parseStructured<T>(response: unknown, stage: string): T {
  const r = response as {
    stop_reason?: string;
    content: { type: string; text?: string }[];
  };
  if (r.stop_reason && r.stop_reason !== "end_turn") {
    throw new Error(`${stage}: model stopped with stop_reason=${r.stop_reason}`);
  }
  const textBlock = r.content.find((b) => b.type === "text");
  if (!textBlock?.text) throw new Error(`${stage}: no text block in response`);
  return JSON.parse(textBlock.text) as T;
}
