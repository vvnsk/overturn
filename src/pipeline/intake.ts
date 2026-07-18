import fs from "node:fs";
import { client, MODEL, parseStructured } from "./client";
import { DENIAL_SCHEMA, type DenialRecord } from "./types";

const INTAKE_PROMPT = `You are the intake stage of Overturn, an appeals engine for
clinic patient-access teams. The attached document is a scanned prior-authorization
denial notice from a payer.

Extract every field in the output schema exactly as it appears in the notice.
Rules:
- Dates in ISO format (YYYY-MM-DD). Use null for anything not stated in the notice.
- cited_policy_id / cited_policy_section: the payer's own medical policy reference
  used to justify the denial (e.g. a policy number and a section like "2.1").
- root_cause: classify WHY this denial happened, from the notice alone.
  medical_necessity = payer says clinical criteria not met; eligibility = coverage
  or enrollment issue; coding_error = CPT/ICD mismatch; administrative = process or
  paperwork issue; missing_information = payer says documentation absent.
- root_cause_rationale: 1-2 sentences quoting the decisive language from the notice.
- confidence: 0 to 1, your confidence in the extraction and classification overall.`;

export async function runIntake(denialPdfPath: string): Promise<DenialRecord> {
  const pdf = fs.readFileSync(denialPdfPath).toString("base64");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: pdf },
          },
          { type: "text", text: INTAKE_PROMPT },
        ],
      },
    ],
    output_config: {
      format: { type: "json_schema", schema: DENIAL_SCHEMA },
    },
  } as never);

  return parseStructured<DenialRecord>(response, "intake");
}
