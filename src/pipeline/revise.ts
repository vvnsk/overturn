import fs from "node:fs";
import type Anthropic from "@anthropic-ai/sdk";
import { client, MODEL } from "./client";
import type { AssembledLetter, DenialRecord } from "./types";

// Coordinator-led revision: the human answers a QA confirmation (or gives any
// instruction) and the agent redrafts the letter. The policy + chart are
// re-attached with citations enforced, so a revision has the same provenance
// guarantees as the original draft — the coordinator can steer, but cannot be
// handed an uncited claim.

export async function runRevise(
  denial: DenialRecord,
  currentLetter: AssembledLetter,
  instruction: string,
  issuesAddressed: string[],
  policyPdfPath: string,
  chartPath: string,
  titles: { policyTitle: string; chartTitle: string },
  today: string,
  onText?: (delta: string) => void,
): Promise<Anthropic.Message> {
  const policyPdf = fs.readFileSync(policyPdfPath).toString("base64");
  const chart = fs.readFileSync(chartPath, "utf8");
  const plainLetter = currentLetter.text.replace(/\[\d+\]/g, "");

  const prompt = `You are the drafting stage of Overturn. A human coordinator has
reviewed the appeal letter below and is directing a revision.

Today's date: ${today}

Parsed denial:
${JSON.stringify(denial, null, 2)}

CURRENT LETTER:
---
${plainLetter}
---
${issuesAddressed.length ? `\nQA flags the coordinator is addressing:\n${issuesAddressed.map((i) => `- ${i}`).join("\n")}\n` : ""}
COORDINATOR'S INSTRUCTION:
"${instruction}"

Produce the complete revised letter. Rules:
- Apply the coordinator's instruction faithfully. Information the coordinator
  supplies (names, phone/fax numbers, dates of birth, signature details) is
  authoritative — incorporate it verbatim where it belongs.
- Preserve everything in the current letter that remains valid. Do not weaken or
  drop grounds unless the instruction says to.
- Every clinical fact and policy statement must still come from the attached
  documents — keep citing as you write. Coordinator-supplied administrative
  details do not need citations.
- Output ONLY the letter text. No preamble, no commentary, no change summary.`;

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: policyPdf },
            title: titles.policyTitle,
            citations: { enabled: true },
          },
          {
            type: "document",
            source: { type: "text", media_type: "text/plain", data: chart },
            title: titles.chartTitle,
            citations: { enabled: true },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  } as never);

  if (onText) stream.on("text", onText);
  return (await stream.finalMessage()) as Anthropic.Message;
}
