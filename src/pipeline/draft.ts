import fs from "node:fs";
import type Anthropic from "@anthropic-ai/sdk";
import { client, MODEL } from "./client";
import type { DenialRecord } from "./types";

// The centerpiece stage. The payer's own policy and the patient chart are
// attached as citation-enabled documents; the API binds every claim in the
// letter to a real span in those documents (cited_text + location). The model
// cannot fabricate a citation — the evidence chain is enforced by the API,
// not by the prompt. (Citations and structured outputs are mutually exclusive
// per request, which is why this stage has no output schema.)

function draftPrompt(denial: DenialRecord, today: string): string {
  return `You are the drafting stage of Overturn, writing a first-level
prior-authorization appeal on behalf of the ordering clinic's patient-access team.

Today's date: ${today}

The parsed denial:
${JSON.stringify(denial, null, 2)}

Attached documents:
1. The payer's own published medical policy — the policy the denial itself cites.
2. The patient's chart (encounter notes, PT course, medication history).

Write the complete appeal letter, ready to submit. Requirements:

- GROUND 1 — the denial is factually wrong on its own cited criterion: check the
  denial's stated reason against the chart. If the chart documents what the payer
  says is missing, say so precisely (durations, visit counts, dates).
- GROUND 2 — the payer's own policy contains alternative qualifying criteria the
  denial never evaluated: read the FULL policy, find any section this patient
  independently satisfies, and argue it from the policy's own text and the chart's
  own findings.
- Every clinical fact must come from the chart. Every policy statement must come
  from the policy document. Do not assert anything the attached documents do not
  support. Cite as you write.
- Structure: date line; payer appeals department address block; RE: line with
  member name, member ID, auth reference, CPT code(s); salutation; a one-paragraph
  request to overturn; the grounds as clearly labeled sections; a timeliness
  sentence referencing the appeal deadline; a closing paragraph requesting approval
  and offering peer-to-peer discussion with the ordering physician; signature block
  for "Patient Access Team" at the ordering facility on behalf of the ordering
  physician.
- Output ONLY the letter text. No preamble, no commentary, no markdown headers.`;
}

export async function runDraft(
  denial: DenialRecord,
  policyPdfPath: string,
  chartPath: string,
  today: string,
  onText?: (delta: string) => void,
): Promise<Anthropic.Message> {
  const policyPdf = fs.readFileSync(policyPdfPath).toString("base64");
  const chart = fs.readFileSync(chartPath, "utf8");

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
            title: "Payer Medical Policy MP-RAD-014 (Advanced Imaging of the Spine)",
            citations: { enabled: true },
          },
          {
            type: "document",
            source: { type: "text", media_type: "text/plain", data: chart },
            title: "Patient Chart — Marisol Rivera, Cedar Grove Family Medicine",
            citations: { enabled: true },
          },
          { type: "text", text: draftPrompt(denial, today) },
        ],
      },
    ],
  } as never);

  if (onText) stream.on("text", onText);
  return (await stream.finalMessage()) as Anthropic.Message;
}
