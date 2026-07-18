// Builds the multi-case worklist from Synthea FHIR bundles: flattens each
// patient bundle to a chart.txt, generates a denial-notice PDF via headless
// Chrome, and writes cases.json (the case registry the app reads).
// SYNTHETIC DATA ONLY — Synthea patients + fabricated payer documents.
//
//   npx tsx scripts/build-cases.ts

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const SYNTHEA = "fixtures/synthea_sample_data_fhir_latest";
const CHROME =
  process.env.CHROME_BIN ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const strip = (s: string) => s.replace(/\d+/g, "");

interface FhirEntry {
  resource: {
    resourceType: string;
    [k: string]: unknown;
  };
}

function flattenChart(bundlePath: string, addendum?: string): { chart: string; name: string; dob: string; gender: string; memberId: string } {
  const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8")) as { entry: FhirEntry[] };
  const res = (t: string) => bundle.entry.filter((e) => e.resource.resourceType === t).map((e) => e.resource);

  const p = res("Patient")[0] as never as {
    id: string;
    name: { family: string; given: string[] }[];
    birthDate: string;
    gender: string;
  };
  const name = `${strip(p.name[0].given[0])} ${strip(p.name[0].family)}`;
  const memberId = `MHP-${p.id.slice(0, 8).toUpperCase()}`;

  const conditions = (res("Condition") as never as {
    code?: { text?: string };
    onsetDateTime?: string;
    clinicalStatus?: { coding?: { code?: string }[] };
  }[])
    .filter((c) => c.code?.text && !/education|employment|social contact|stress|transport|medication review|housing/i.test(c.code.text))
    .map((c) => ({
      text: c.code!.text!,
      onset: (c.onsetDateTime ?? "").slice(0, 10),
      active: c.clinicalStatus?.coding?.[0]?.code === "active",
    }));
  const active = conditions.filter((c) => c.active);
  const resolvedRecent = conditions.filter((c) => !c.active).slice(-8);

  const meds = (res("MedicationRequest") as never as {
    medicationCodeableConcept?: { text?: string };
    authoredOn?: string;
    status?: string;
  }[])
    .filter((m) => m.medicationCodeableConcept?.text)
    .map((m) => ({ text: m.medicationCodeableConcept!.text!, on: (m.authoredOn ?? "").slice(0, 10), status: m.status ?? "" }));
  const latestMeds = [...new Map(meds.map((m) => [m.text, m])).values()]
    .sort((a, b) => (a.on < b.on ? 1 : -1))
    .slice(0, 14);

  const procs = (res("Procedure") as never as {
    code?: { text?: string };
    performedPeriod?: { start?: string };
    performedDateTime?: string;
  }[])
    .filter((pr) => pr.code?.text)
    .map((pr) => ({ text: pr.code!.text!, on: ((pr.performedPeriod?.start ?? pr.performedDateTime) ?? "").slice(0, 10) }))
    .filter((pr) => !/assessment of health and social care|patient referral|screening|notifications|certification|clarification/i.test(pr.text));
  const therapyProcs = procs.filter((pr) => /therapy|rehabilitation|exercise|manipulation/i.test(pr.text)).slice(-10);
  const recentProcs = procs.slice(-10);

  const encounters = (res("Encounter") as never as {
    type?: { text?: string }[];
    period?: { start?: string };
  }[])
    .map((e) => ({ text: e.type?.[0]?.text ?? "Encounter", on: (e.period?.start ?? "").slice(0, 10) }))
    .slice(-8);

  const fmt = (rows: { text: string; on?: string; onset?: string; status?: string }[]) =>
    rows.map((r) => `- ${r.text}${r.onset ? ` (onset ${r.onset})` : r.on ? ` (${r.on})` : ""}${r.status ? ` [${r.status}]` : ""}`).join("\n");

  const chart = `SYNTHETIC PATIENT CHART — ${name} (${memberId})
Source: Synthea synthetic FHIR bundle, flattened for review. No real patient depicted.
DOB: ${p.birthDate} | Sex: ${p.gender}

=== ACTIVE PROBLEM LIST ===
${fmt(active.map((c) => ({ text: c.text, onset: c.onset })))}

=== RESOLVED / RECENT CONDITIONS ===
${fmt(resolvedRecent.map((c) => ({ text: c.text, onset: c.onset })))}

=== MEDICATIONS (most recent order per drug) ===
${fmt(latestMeds.map((m) => ({ text: m.text, on: m.on, status: m.status })))}

=== THERAPY-RELATED PROCEDURES ===
${therapyProcs.length ? fmt(therapyProcs) : "- None documented in the record."}

=== RECENT PROCEDURES ===
${fmt(recentProcs)}

=== RECENT ENCOUNTERS ===
${fmt(encounters)}
${addendum ? `\n${addendum}\n` : ""}`;

  return { chart, name, dob: p.birthDate, gender: p.gender, memberId };
}

// ---------- case definitions ----------

const CHERLY_ADDENDUM = `=== CLINIC ADDENDUM — PT DISCHARGE SUMMARY (faxed from Riverbend Rehabilitation, 2026-07-02) ===
Course: Supervised physical therapy for chronic low back pain, 14 visits over 7 weeks
(2026-05-12 through 2026-07-01). Modalities: lumbar stabilization, graded activity,
supervised home exercise program. Adherence documented at 13/14 visits.
DISCHARGE NOTE: Completed course with minimal symptomatic improvement; low back pain
persists with functional limitation. Naproxen 500mg BID maintained throughout the course
per PCP. Referred back to ordering physician for advanced imaging evaluation.`;

interface CaseDef {
  id: string;
  bundle?: string; // synthea file; absent for rivera
  addendum?: string;
  denial?: {
    date: string;
    authRef: string;
    reasonCode: string;
    reasonTitle: string;
    rationale: string;
    cpt: string;
    icd: string;
    service: string;
  };
  era?: {
    paidDate: string;
    carc: string;
    cpt: string;
    billed: number;
    allowed: number;
    paid: number;
    patientResponsibility: number;
    service: string;
  };
}

const DEFS: CaseDef[] = [
  { id: "rivera" }, // pre-built fixtures, registry entry only
  {
    id: "dara",
    bundle: "Cherly215_Dara636_Jacobi462_adc25003-72ca-d569-ed7b-8ff60fe98f85.json",
    addendum: CHERLY_ADDENDUM,
    denial: {
      date: "2026-07-08",
      authRef: "PA-2026-0708-91277",
      reasonCode: "MN-02",
      reasonTitle: "Medical Necessity Not Established",
      rationale:
        "The submitted documentation does not establish that the member has completed a documented six (6) week trial of conservative therapy as required under Medical Policy MP-RAD-014, Section 2.1. The request is therefore denied as not medically necessary.",
      cpt: "72148",
      icd: "M54.50",
      service: "MRI Lumbar Spine without contrast",
    },
  },
  {
    id: "haag",
    bundle: "Antione404_Haag279_89eded81-4a51-f304-ee16-58c137114a71.json",
    denial: {
      date: "2026-07-10",
      authRef: "PA-2026-0710-91903",
      reasonCode: "MN-03",
      reasonTitle: "Conservative Therapy Requirement Not Met",
      rationale:
        "Under Medical Policy MP-RAD-014, Section 2.1, lumbar spine MRI requires low back pain persisting six (6) weeks or longer AND a documented failed trial of conservative therapy (physical therapy, NSAID/analgesic pharmacotherapy, or a supervised home exercise program). The record as submitted does not document a completed conservative therapy trial. The request is denied as not medically necessary.",
      cpt: "72148",
      icd: "M54.50",
      service: "MRI Lumbar Spine without contrast",
    },
  },
  {
    id: "johnston",
    bundle: "Darron84_Johnston597_93ee1e59-72a4-0103-39b9-c53658226ff0.json",
    denial: {
      date: "2026-07-14",
      authRef: "PA-2026-0714-92416",
      reasonCode: "AD-01",
      reasonTitle: "Requested Clinical Documentation Not Received",
      rationale:
        "The clinical documentation requested to support this prior authorization (recent office notes documenting symptom duration, physical examination findings, and conservative therapy attempted) was not received within the required timeframe. The request is administratively denied. Per Medical Policy MP-RAD-014, Section 4, the medical record must document symptom duration, conservative therapy modalities and duration, and objective examination findings.",
      cpt: "72148",
      icd: "M54.50",
      service: "MRI Lumbar Spine without contrast",
    },
  },
  {
    id: "buckridge-era",
    bundle: "Lincoln623_Buckridge80_91be1bd7-1e12-99a1-d3fd-6eea14e5d70f.json",
    addendum: `=== POST-SERVICE APPEAL CONTEXT ===
MRI lumbar spine without contrast (CPT 72148) was performed and billed, then denied
after service on the remittance under CARC CO-50 ("not deemed medically necessary").
This is a post-service claim denial (835 ERA), not a pre-service prior-authorization
denial — there is no prior-auth reference on file.`,
    era: {
      paidDate: "2026-07-18",
      carc: "50",
      cpt: "72148",
      billed: 500,
      allowed: 75,
      paid: 0,
      patientResponsibility: 0,
      service: "MRI Lumbar Spine without contrast",
    },
  },
];

// ---------- denial PDF ----------

const css = `<style>
  body { font-family: Georgia, serif; margin: 48px; line-height: 1.5; font-size: 11pt; }
  h1 { font-size: 15pt; } h2 { font-size: 12pt; margin-top: 20px; }
  .hdr { border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 20px; }
  .meta { color: #444; font-size: 10pt; }
</style>`;

function denialHtml(name: string, memberId: string, d: NonNullable<CaseDef["denial"]>): string {
  const display = name.toUpperCase().split(" ").reverse().join(", ");
  return `${css}
<div class="hdr"><h1>MERIDIAN HEALTH PLAN</h1>
<div class="meta">Utilization Management &nbsp;|&nbsp; Notice of Adverse Benefit Determination</div></div>
<p class="meta">Date of Notice: ${d.date}<br>
Member: ${display} &nbsp;|&nbsp; Member ID: ${memberId}<br>
Reference / Auth #: ${d.authRef}<br>
Ordering Provider: Priya Natarajan, MD — Cedar Grove Family Medicine<br>
Requested Service: ${d.service} (CPT ${d.cpt})<br>
Diagnosis: ${d.icd} — Low back pain</p>
<h2>Determination: DENIED</h2>
<p><b>Denial Reason Code:</b> ${d.reasonCode} &mdash; ${d.reasonTitle}</p>
<p><b>Rationale:</b> ${d.rationale}</p>
<h2>Your Appeal Rights</h2>
<p>You may submit a written appeal within 180 days of the date of this notice. A
peer-to-peer review with a plan medical director may be requested within 14 days.
Submit appeals to: Meridian Health Plan, Attn: Appeals Unit, PO Box 22140.</p>`;
}

interface ClaimResponseFixture {
  resourceType: "ClaimResponse";
  id: string;
  status: "active";
  outcome: "error";
  created: string;
  patient: { display: string };
  item: {
    itemSequence: number;
    productOrService: { coding: { system: string; code: string }[] };
    adjudication: { category: { coding: { code: string }[] }; amount: { value: number; currency: string } }[];
    processNote: { text: string }[];
  }[];
}

function deniedClaimResponse(name: string, memberId: string, era: NonNullable<CaseDef["era"]>): ClaimResponseFixture {
  return {
    resourceType: "ClaimResponse",
    id: `synthetic-${memberId.toLowerCase()}`,
    status: "active",
    outcome: "error",
    created: era.paidDate,
    patient: { display: name },
    item: [{
      itemSequence: 1,
      productOrService: { coding: [{ system: "http://www.ama-assn.org/go/cpt", code: era.cpt }] },
      adjudication: [
        { category: { coding: [{ code: "submitted" }] }, amount: { value: era.billed, currency: "USD" } },
        { category: { coding: [{ code: "eligible" }] }, amount: { value: era.allowed, currency: "USD" } },
        { category: { coding: [{ code: "benefit" }] }, amount: { value: era.paid, currency: "USD" } },
      ],
      processNote: [{ text: `CARC ${era.carc}` }],
    }],
  };
}

function claimResponseTo835(name: string, memberId: string, response: ClaimResponseFixture): string {
  const item = response.item[0];
  const findAmount = (category: string) => item.adjudication.find((a) => a.category.coding[0]?.code === category)?.amount.value ?? 0;
  const billed = findAmount("submitted");
  const allowed = findAmount("eligible");
  const paid = findAmount("benefit");
  const cpt = item.productOrService.coding[0]?.code ?? "";
  const carc = item.processNote[0]?.text.match(/CARC\s+(\d+)/)?.[1] ?? "";
  const ymd = response.created.replaceAll("-", "");
  const display = name.split(" ");
  const family = display.pop() ?? "Member";
  const given = display.join(" ") || "Synthetic";
  return [
    "ISA*00*          *00*          *ZZ*CEDARGROVE     *ZZ*CEDARHORIZON  *260718*1200*^*00501*000000001*0*P*:~",
    "GS*HP*CEDARGROVE*CEDARHORIZON*20260718*1200*1*X*005010X221A1~",
    "ST*835*0001~",
    `CLP*${memberId}*4*${billed.toFixed(2)}*${paid.toFixed(2)}*0.00*MC*ERA-20260718-001~`,
    "NM1*PR*2*Cedar Horizon Health Plan*****PI*CHP001~",
    `NM1*QC*1*${family}*${given}****MI*${memberId}~`,
    "NM1*82*1*Natarajan*Priya****XX*1999999999~",
    "NM1*1P*2*Cedar Grove Family Medicine*****XX*1888888888~",
    `DTM*405*${ymd}~`,
    `AMT*B6*${allowed.toFixed(2)}~`,
    `SVC*HC:${cpt}:26*${billed.toFixed(2)}*${paid.toFixed(2)}**1~`,
    `CAS*CO*${carc}*${(billed - paid).toFixed(2)}*1~`,
    "LQ*HE*M50~",
    "SE*12*0001~",
    "GE*1*1~",
    "IEA*1*000000001~",
  ].join("\n");
}

// ---------- build ----------

interface CaseEntry {
  id: string;
  patient: string;
  service: string;
  cpt: string;
  channel?: "fax_pdf" | "era_835";
  denialPdf?: string;
  denialEdi?: string;
  chart: string;
  policyPdf: string;
  policyTitle: string;
  chartTitle: string;
  star?: boolean;
}

const registry: CaseEntry[] = [];

for (const def of DEFS) {
  if (def.id === "rivera") {
    registry.push({
      id: "rivera",
      patient: "Marisol Rivera",
      service: "MRI Lumbar Spine w/o contrast",
      cpt: "72148",
      denialPdf: "fixtures/denial-notice.pdf",
      chart: "fixtures/chart-rivera.txt",
      policyPdf: "fixtures/policy-mp-rad-014.pdf",
      policyTitle: "Payer Medical Policy MP-RAD-014 (Advanced Imaging of the Spine)",
      chartTitle: "Patient Chart — Marisol Rivera, Cedar Grove Family Medicine",
      star: true,
    });
    continue;
  }

  const dir = path.join("cases", def.id);
  fs.mkdirSync(dir, { recursive: true });

  const { chart, name, memberId } = flattenChart(path.join(SYNTHEA, def.bundle!), def.addendum);
  fs.writeFileSync(path.join(dir, "chart.txt"), chart);

  if (def.era) {
    const claimResponse = deniedClaimResponse(name, memberId, def.era);
    const claimResponsePath = path.join(dir, "claim-response.json");
    const ediPath = path.join(dir, "denial.835");
    fs.writeFileSync(claimResponsePath, JSON.stringify(claimResponse, null, 2));
    fs.writeFileSync(ediPath, claimResponseTo835(name, memberId, claimResponse));
    registry.push({
      id: def.id,
      patient: name,
      service: def.era.service,
      cpt: def.era.cpt,
      channel: "era_835",
      denialEdi: ediPath,
      chart: path.join(dir, "chart.txt"),
      policyPdf: "fixtures/policy-mp-rad-014.pdf",
      policyTitle: "Payer Medical Policy MP-RAD-014 (Advanced Imaging of the Spine)",
      chartTitle: `Patient Chart — ${name}, Cedar Grove Family Medicine`,
    });
    console.log(`built 835 case ${def.id}: ${name} (${memberId})`);
    continue;
  }

  const html = denialHtml(name, memberId, def.denial!);
  const htmlPath = path.join(dir, "denial.html");
  const pdfPath = path.join(dir, "denial.pdf");
  fs.writeFileSync(htmlPath, html);
  execFileSync(CHROME, [
    "--headless", "--disable-gpu", "--no-pdf-header-footer",
    `--print-to-pdf=${path.resolve(pdfPath)}`, `file://${path.resolve(htmlPath)}`,
  ], { stdio: "ignore" });

  registry.push({
    id: def.id,
    patient: name,
    service: def.denial!.service,
    cpt: def.denial!.cpt,
    denialPdf: pdfPath,
    chart: path.join(dir, "chart.txt"),
    policyPdf: "fixtures/policy-mp-rad-014.pdf",
    policyTitle: "Payer Medical Policy MP-RAD-014 (Advanced Imaging of the Spine)",
    chartTitle: `Patient Chart — ${name}, Cedar Grove Family Medicine`,
  });
  console.log(`built case ${def.id}: ${name} (${memberId})`);
}

fs.writeFileSync("cases/cases.json", JSON.stringify(registry, null, 2));
console.log(`wrote cases/cases.json with ${registry.length} cases`);
