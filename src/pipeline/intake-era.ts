import fs from "node:fs";
import type { DenialRecord, RootCause } from "./types";

export interface CarcRule {
  meaning: string;
  root_cause: RootCause;
  route: boolean;
}

export const CARC_RULES: Record<string, CarcRule> = {
  "50": { meaning: "Not deemed medically necessary", root_cause: "medical_necessity", route: true },
  "197": { meaning: "Precertification/authorization absent", root_cause: "medical_necessity", route: true },
  "55": { meaning: "Experimental or investigational service", root_cause: "medical_necessity", route: true },
  "40": { meaning: "Charges for level of care not covered", root_cause: "medical_necessity", route: true },
  "16": { meaning: "Missing or incomplete information", root_cause: "missing_information", route: false },
  "29": { meaning: "Timely filing limit expired", root_cause: "administrative", route: false },
  "97": { meaning: "Bundled or included in another service", root_cause: "coding_error", route: false },
  "11": { meaning: "Diagnosis inconsistent with procedure", root_cause: "coding_error", route: false },
};

export class NonClinicalEraDenialError extends Error {
  readonly code = "NON_CLINICAL_835_DENIAL";

  constructor(readonly carc: string, readonly reason: string) {
    super(`835 denial ${carc} is ${reason}, not a clinical appeal candidate`);
    this.name = "NonClinicalEraDenialError";
  }
}

type Segment = string[];
type ParsedLine = { cpt: string; modifiers: string[]; carcs: { group: string; code: string }[]; rarc: string[] };

const amount = (value: string | undefined) => {
  const parsed = Number(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
};

const isoDate = (value: string | undefined): string | null => {
  const match = value?.match(/^(\d{4})(\d{2})(\d{2})$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
};

function segments(edi: string): Segment[] {
  const input = edi.replace(/^\uFEFF/, "").trim();
  const separator = input.startsWith("ISA") ? input[3] : "*";
  const terminator = input.includes("~") ? "~" : input.startsWith("ISA") && input.length > 105 ? input[105] : "\n";
  return input
    .split(terminator)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => segment.split(separator));
}

// NM1 elements are Last(3), First(4), Middle(5) per X12 — reorder for display
// to match how every other name in this app is shown (first-name-first).
function nm1Name(segment: Segment): string {
  return [segment[4], segment[5], segment[3]].filter(Boolean).join(" ");
}

function serviceFrom(segment: Segment): ParsedLine {
  const compound = (segment[1] ?? "").split(":");
  const cpt = compound[1] ?? compound[0] ?? "";
  return { cpt, modifiers: compound.slice(2), carcs: [], rarc: [] };
}

export function parse835(edi: string): DenialRecord {
  let payerName = "";
  let patientName = "";
  let memberId = "";
  let facility: string | null = null;
  let orderingPhysician: string | null = null;
  let billed = 0;
  let paid = 0;
  let patientResponsibility = 0;
  let allowed = 0;
  let paidDate: string | null = null;
  let currentLine: ParsedLine | null = null;
  const lines: ParsedLine[] = [];
  const claimCarcs: { group: string; code: string }[] = [];

  for (const segment of segments(edi)) {
    const [tag] = segment;
    if (tag === "CLP") {
      memberId ||= segment[1] ?? "";
      billed = amount(segment[3]);
      paid = amount(segment[4]);
      patientResponsibility = amount(segment[5]);
    } else if (tag === "SVC") {
      currentLine = serviceFrom(segment);
      lines.push(currentLine);
    } else if (tag === "CAS") {
      const target = currentLine?.carcs ?? claimCarcs;
      for (let i = 2; i < segment.length; i += 3) {
        if (segment[i]) target.push({ group: segment[1] ?? "CO", code: segment[i] });
      }
    } else if (tag === "LQ" && currentLine && segment[1] === "HE" && segment[2]) {
      currentLine.rarc.push(segment[2]);
    } else if (tag === "DTM" && !paidDate && ["405", "573", "232"].includes(segment[1] ?? "")) {
      paidDate = isoDate(segment[2]);
    } else if (tag === "AMT") {
      if (segment[1] === "B6") allowed = amount(segment[2]);
      if (segment[1] === "T") billed ||= amount(segment[2]);
    } else if (tag === "NM1") {
      if (segment[1] === "PR") payerName = nm1Name(segment);
      if (segment[1] === "QC") {
        patientName = nm1Name(segment);
        memberId = segment[9] ?? memberId;
      }
      if (segment[1] === "82") orderingPhysician = nm1Name(segment) || null;
      if (segment[1] === "1P") facility = nm1Name(segment) || null;
    }
  }

  const allCarcs = lines.flatMap((line) => line.carcs).concat(claimCarcs);
  if (!allCarcs.length) throw new Error("835 contains no CAS claim adjustment reason code");

  for (const carc of allCarcs) {
    const rule = CARC_RULES[carc.code];
    if (!rule || !rule.route) {
      throw new NonClinicalEraDenialError(`${carc.group}-${carc.code}`, rule?.meaning ?? "an unsupported adjustment");
    }
  }

  const primary = allCarcs[0];
  const primaryRule = CARC_RULES[primary.code]!;
  const serviceLines = (lines.length ? lines : [{ cpt: "", modifiers: [], carcs: claimCarcs, rarc: [] }]).map((line) => {
    const carc = line.carcs[0] ?? primary;
    const rule = CARC_RULES[carc.code]!;
    return {
      cpt: line.cpt,
      modifiers: line.modifiers,
      carc: `${carc.group}-${carc.code}`,
      rarc: line.rarc,
      denied_reason: rule.meaning,
    };
  });

  return {
    channel: "era_835",
    payer_name: payerName || "Unknown payer",
    member: { name: patientName || "Unknown member", member_id: memberId, dob: null },
    provider: { ordering_physician: orderingPhysician, facility },
    service: {
      description: "Post-service claim services",
      cpt_codes: serviceLines.map((line) => line.cpt).filter(Boolean),
      icd10_codes: [],
    },
    service_lines: serviceLines,
    amounts: { billed, allowed, paid, patient_responsibility: patientResponsibility },
    denial: {
      denial_date: paidDate,
      paid_date: paidDate,
      auth_reference: null,
      reason_code: `${primary.group}-${primary.code}`,
      reason_text: primaryRule.meaning,
      cited_policy_id: null,
      cited_policy_section: null,
      appeal_deadline: null,
      appeal_level: null,
      peer_to_peer_offered: null,
    },
    root_cause: primaryRule.root_cause,
    root_cause_rationale: `CARC ${primary.group}-${primary.code}: ${primaryRule.meaning}.`,
    confidence: 1,
  };
}

export async function runIntake835(denialEdiPath: string): Promise<DenialRecord> {
  return parse835(fs.readFileSync(denialEdiPath, "utf8"));
}
