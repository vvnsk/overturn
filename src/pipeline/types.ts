// Shared types + JSON schemas for the structured-output stages.
// Structured outputs and citations are mutually exclusive per request:
// intake + QA use these schemas; the drafter uses citations instead.

export type RootCause =
  | "medical_necessity"
  | "eligibility"
  | "coding_error"
  | "administrative"
  | "missing_information";

export interface DenialRecord {
  channel: "fax_pdf" | "era_835";
  payer_name: string;
  member: { name: string; member_id: string; dob: string | null };
  provider: { ordering_physician: string | null; facility: string | null };
  service: { description: string; cpt_codes: string[]; icd10_codes: string[] };
  service_lines: {
    cpt: string;
    modifiers: string[];
    carc: string;
    rarc: string[];
    denied_reason: string;
  }[];
  amounts: {
    billed: number;
    allowed: number;
    paid: number;
    patient_responsibility: number;
  } | null;
  denial: {
    denial_date: string | null;
    paid_date: string | null;
    auth_reference: string | null;
    reason_code: string | null;
    reason_text: string;
    cited_policy_id: string | null;
    cited_policy_section: string | null;
    appeal_deadline: string | null;
    appeal_level: string | null;
    peer_to_peer_offered: boolean | null;
  };
  root_cause: RootCause;
  root_cause_rationale: string;
  confidence: number;
}

const str = { type: "string" } as const;
const nullableStr = { type: ["string", "null"] } as const;
const nullableBool = { type: ["boolean", "null"] } as const;

export const DENIAL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "channel",
    "payer_name",
    "member",
    "provider",
    "service",
    "service_lines",
    "amounts",
    "denial",
    "root_cause",
    "root_cause_rationale",
    "confidence",
  ],
  properties: {
    channel: { type: "string", enum: ["fax_pdf", "era_835"] },
    payer_name: str,
    member: {
      type: "object",
      additionalProperties: false,
      required: ["name", "member_id", "dob"],
      properties: { name: str, member_id: str, dob: nullableStr },
    },
    provider: {
      type: "object",
      additionalProperties: false,
      required: ["ordering_physician", "facility"],
      properties: { ordering_physician: nullableStr, facility: nullableStr },
    },
    service: {
      type: "object",
      additionalProperties: false,
      required: ["description", "cpt_codes", "icd10_codes"],
      properties: {
        description: str,
        cpt_codes: { type: "array", items: str },
        icd10_codes: { type: "array", items: str },
      },
    },
    service_lines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["cpt", "modifiers", "carc", "rarc", "denied_reason"],
        properties: {
          cpt: str,
          modifiers: { type: "array", items: str },
          carc: str,
          rarc: { type: "array", items: str },
          denied_reason: str,
        },
      },
    },
    amounts: {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["billed", "allowed", "paid", "patient_responsibility"],
      properties: {
        billed: { type: "number" },
        allowed: { type: "number" },
        paid: { type: "number" },
        patient_responsibility: { type: "number" },
      },
    },
    denial: {
      type: "object",
      additionalProperties: false,
      required: [
        "denial_date",
        "paid_date",
        "auth_reference",
        "reason_code",
        "reason_text",
        "cited_policy_id",
        "cited_policy_section",
        "appeal_deadline",
        "appeal_level",
        "peer_to_peer_offered",
      ],
      properties: {
        denial_date: nullableStr,
        paid_date: nullableStr,
        auth_reference: nullableStr,
        reason_code: nullableStr,
        reason_text: str,
        cited_policy_id: nullableStr,
        cited_policy_section: nullableStr,
        appeal_deadline: nullableStr,
        appeal_level: nullableStr,
        peer_to_peer_offered: nullableBool,
      },
    },
    root_cause: {
      type: "string",
      enum: [
        "medical_necessity",
        "eligibility",
        "coding_error",
        "administrative",
        "missing_information",
      ],
    },
    root_cause_rationale: str,
    confidence: { type: "number" },
  },
} as const;

export interface CitationRef {
  n: number;
  cited_text: string;
  doc_title: string;
  location: string; // "p.2" for PDFs, "chars 120-240" for text docs
}

export interface AssembledLetter {
  text: string; // letter body with [n] markers
  refs: CitationRef[];
}

export interface QaClaim {
  claim: string;
  evidence_strength: "strong" | "moderate" | "weak" | "uncited";
  sources: string[];
}

export interface QaReport {
  timeliness: {
    denial_date: string | null;
    appeal_deadline: string | null;
    filed_date: string;
    within_deadline: boolean;
    days_remaining: number | null;
  };
  claims: QaClaim[];
  missing_elements: string[];
  needs_human: { issue: string; severity: "low" | "medium" | "high" }[];
  overall_confidence: number;
  recommendation: "ready_to_submit" | "review_recommended" | "do_not_submit";
  summary: string;
}

export const QA_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "timeliness",
    "claims",
    "missing_elements",
    "needs_human",
    "overall_confidence",
    "recommendation",
    "summary",
  ],
  properties: {
    timeliness: {
      type: "object",
      additionalProperties: false,
      required: [
        "denial_date",
        "appeal_deadline",
        "filed_date",
        "within_deadline",
        "days_remaining",
      ],
      properties: {
        denial_date: nullableStr,
        appeal_deadline: nullableStr,
        filed_date: str,
        within_deadline: { type: "boolean" },
        days_remaining: { type: ["number", "null"] },
      },
    },
    claims: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["claim", "evidence_strength", "sources"],
        properties: {
          claim: str,
          evidence_strength: {
            type: "string",
            enum: ["strong", "moderate", "weak", "uncited"],
          },
          sources: { type: "array", items: str },
        },
      },
    },
    missing_elements: { type: "array", items: str },
    needs_human: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["issue", "severity"],
        properties: {
          issue: str,
          severity: { type: "string", enum: ["low", "medium", "high"] },
        },
      },
    },
    overall_confidence: { type: "number" },
    recommendation: {
      type: "string",
      enum: ["ready_to_submit", "review_recommended", "do_not_submit"],
    },
    summary: str,
  },
} as const;
