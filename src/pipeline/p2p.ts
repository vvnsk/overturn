import { client, MODEL, parseStructured } from "./client";
import type { AssembledLetter, DenialRecord, QaReport } from "./types";

// Third rendering of the same evidence bundle: a one-page peer-to-peer brief
// the ordering physician can glance at during the P2P call with the plan's
// medical director. No new claims — everything traces back to the bundle.

export interface P2pBrief {
  headline: string;
  patient_line: string;
  key_points: { point: string; source: string }[];
  anticipated_objections: { objection: string; response: string }[];
  ask: string;
}

const P2P_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "patient_line", "key_points", "anticipated_objections", "ask"],
  properties: {
    headline: { type: "string" },
    patient_line: { type: "string" },
    key_points: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["point", "source"],
        properties: { point: { type: "string" }, source: { type: "string" } },
      },
    },
    anticipated_objections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["objection", "response"],
        properties: { objection: { type: "string" }, response: { type: "string" } },
      },
    },
    ask: { type: "string" },
  },
} as const;

export async function runP2p(
  denial: DenialRecord,
  letter: AssembledLetter,
  qa: QaReport,
): Promise<P2pBrief> {
  const refList = letter.refs
    .map((r) => `[${r.n}] ${r.doc_title} (${r.location}): "${r.cited_text}"`)
    .join("\n");

  const prompt = `You are the rendering stage of Overturn. The payer has requested a
peer-to-peer review. Produce a one-page P2P brief for the ordering physician,
derived STRICTLY from the evidence bundle below — no new clinical claims.

Parsed denial:
${JSON.stringify(denial, null, 2)}

Appeal letter (markers [n] refer to the evidence list):
---
${letter.text}
---

Evidence list:
${refList}

QA reviewer's claim audit:
${JSON.stringify(qa.claims, null, 2)}

Write for a physician with 90 seconds before the call:
- headline: one sentence — the single strongest framing of why this should be approved.
- patient_line: member, service, diagnosis in one compact line.
- key_points: 4-6 punchy talking points, each with its source ("Chart — discharge note",
  "Policy §2.3", etc.). Lead with the two independent grounds. When a source maps
  to the evidence list, include its exact citation marker(s), such as "Policy §2.3 [9]".
- anticipated_objections: 2-3 things the medical director may raise, each with a
  one-sentence evidence-based response. Add the exact evidence marker(s) [n] to the
  response wherever it relies on the evidence list.
- ask: the exact closing ask for the call.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: prompt }],
    output_config: { format: { type: "json_schema", schema: P2P_SCHEMA } },
  } as never);

  return parseStructured<P2pBrief>(response, "p2p");
}
