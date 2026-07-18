import { client, MODEL, parseStructured } from "./client";
import {
  QA_SCHEMA,
  type AssembledLetter,
  type DenialRecord,
  type QaReport,
} from "./types";

function qaPrompt(denial: DenialRecord, letter: AssembledLetter, today: string): string {
  const refList = letter.refs
    .map((r) => `[${r.n}] ${r.doc_title} (${r.location}): "${r.cited_text}"`)
    .join("\n");

  return `You are the QA/compliance stage of Overturn. Review this drafted
prior-authorization appeal the way a skeptical payer-side reviewer would, before a
human coordinator approves the send.

Today's date (intended filing date): ${today}

Parsed denial:
${JSON.stringify(denial, null, 2)}

Drafted appeal letter (citation markers [n] refer to the evidence list below):
---
${letter.text}
---

Evidence list (these citations were produced by the API's enforced-citation
mechanism — the quoted text is verbatim from the source documents):
${refList}

Evaluate:
- timeliness: is the appeal within the deadline stated in the denial? days_remaining
  = days from today until the deadline (negative if past).
- claims: list each substantive claim the letter makes and rate its evidence
  strength based on the citations attached to it. A claim with no citation is
  "uncited". sources = the [n] markers backing it.
- missing_elements: anything a payer could use to reject the appeal on procedural
  grounds (missing identifiers, missing signature elements, etc.).
- needs_human: anything the human coordinator must check or edit before sending.
- overall_confidence: 0-1 that this appeal overturns the denial as written.
- recommendation: ready_to_submit / review_recommended / do_not_submit.
- summary: 2-3 sentences for the coordinator.`;
}

export async function runQa(
  denial: DenialRecord,
  letter: AssembledLetter,
  today: string,
): Promise<QaReport> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: qaPrompt(denial, letter, today) }],
    output_config: { format: { type: "json_schema", schema: QA_SCHEMA } },
  } as never);

  const report = parseStructured<QaReport>(response, "qa");
  const addFlag = (issue: string, severity: "medium" | "high") => {
    if (!report.needs_human.some((flag) => flag.issue === issue)) {
      report.needs_human.push({ issue, severity });
    }
  };

  if (denial.channel === "era_835" && !denial.denial.appeal_deadline) {
    addFlag("Confirm the payer-specific post-service appeal deadline before submission.", "high");
    report.recommendation = "review_recommended";
  }
  if ((denial.service_lines ?? []).some((line) => line.carc.endsWith("-197"))) {
    addFlag(
      "CARC CO-197 (no auth on file) is ambiguous between a genuine clinical appeal and a pure " +
        "administrative miss — a coordinator must decide before this can be sent, regardless of " +
        "the autonomy policy in effect.",
      "high",
    );
    // Hard stop, not just a flag: CO-197 must never auto-submit even if the
    // coordinator has disabled "interrupt on high-severity flags" or is in
    // full-autonomy mode — `do_not_submit` is the one recommendation `decide()`
    // in app/page.tsx honors unconditionally, ahead of any autonomy setting.
    report.recommendation = "do_not_submit";
  }

  return report;
}
