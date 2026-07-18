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

- Check the denial's stated reason against the chart. If the chart documents what
  the payer says is missing, say so precisely (durations, visit counts, dates) —
  a denial that is factually wrong on its own cited criterion is your strongest
  ground; label it clearly.
- Read the FULL policy for alternative qualifying criteria the denial never
  evaluated. If the patient independently satisfies another section, argue it as a
  separate ground from the policy's own text and the chart's own findings.
- Argue every ground the record genuinely supports — and ONLY those. If the
  record is thin, argue what exists honestly and precisely; do NOT overstate weak
  evidence or invent support. The QA stage and a human coordinator rely on this
  letter being exactly as strong as the record allows.
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
  titles?: { policyTitle: string; chartTitle: string },
): Promise<Anthropic.Message> {
  const policyPdf = fs.readFileSync(policyPdfPath).toString("base64");
  const chart = fs.readFileSync(chartPath, "utf8");
  const policyTitle =
    titles?.policyTitle ?? "Payer Medical Policy MP-RAD-014 (Advanced Imaging of the Spine)";
  const chartTitle = titles?.chartTitle ?? "Patient Chart";

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
            title: policyTitle,
            citations: { enabled: true },
          },
          {
            type: "document",
            source: { type: "text", media_type: "text/plain", data: chart },
            title: chartTitle,
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
