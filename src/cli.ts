// Overturn pipeline CLI — runs the full denial → appeal flow on one case and
// prints the letter with its API-enforced evidence chain.
//
//   npm run pipeline                 # gold case, writes runs/gold/
//   npm run pipeline -- --stage=intake   # run a single stage (uses cached upstream output)

import fs from "node:fs";
import path from "node:path";
import { runIntake } from "./pipeline/intake";
import { runDraft } from "./pipeline/draft";
import { runQa } from "./pipeline/qa";
import { assembleLetter, letterWithSources } from "./pipeline/render";
import { getCase } from "./pipeline/cases";
import type { DenialRecord } from "./pipeline/types";

const caseArg = process.argv.find((a) => a.startsWith("--case="))?.split("=")[1] ?? "rivera";
const entry = getCase(caseArg);
const CASE = {
  // "rivera" keeps its historical runs/gold cache dir; new cases use runs/<id>
  name: caseArg === "rivera" ? "gold" : caseArg,
  denialPdf: entry.denialPdf,
  policyPdf: entry.policyPdf,
  chart: entry.chart,
};

const OUT_DIR = path.join("runs", CASE.name);
const TODAY = new Date().toISOString().slice(0, 10);

const stageArg = process.argv.find((a) => a.startsWith("--stage="))?.split("=")[1];

function save(name: string, data: unknown): void {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, name);
  fs.writeFileSync(file, typeof data === "string" ? data : JSON.stringify(data, null, 2));
  console.log(`   ↳ wrote ${file}`);
}

function load<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(OUT_DIR, name), "utf8")) as T;
}

async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t0 = Date.now();
  process.stdout.write(`▶ ${label}...\n`);
  const result = await fn();
  console.log(`   ✓ ${label} done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  return result;
}

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add the key.");
    process.exit(1);
  }

  console.log(`Overturn pipeline — case "${CASE.name}" — ${TODAY}\n`);

  // Stage 1+2: intake (vision parse + root-cause classification, one schema)
  let denial: DenialRecord;
  if (!stageArg || stageArg === "intake") {
    denial = await timed("Intake: parsing denial notice", () => runIntake(CASE.denialPdf));
    save("denial.json", denial);
    console.log(
      `   payer=${denial.payer_name} | cpt=${denial.service.cpt_codes.join(",")} | ` +
        `root_cause=${denial.root_cause} (${denial.confidence.toFixed(2)})`,
    );
    if (stageArg === "intake") return;
  } else {
    denial = load<DenialRecord>("denial.json");
  }

  // Stage 3: drafter with enforced citations (policy + chart attached)
  let letter;
  if (!stageArg || stageArg === "draft") {
    const message = await timed("Draft: writing appeal against the payer's own policy", () =>
      runDraft(denial, CASE.policyPdf, CASE.chart, TODAY, undefined, {
        policyTitle: entry.policyTitle,
        chartTitle: entry.chartTitle,
      }),
    );
    save("draft-message.json", message);
    letter = assembleLetter(message.content as never);
    save("letter.json", letter);
    save("letter.txt", letterWithSources(letter));
    console.log(`   ${letter.refs.length} enforced citations across the letter`);
    if (stageArg === "draft") return;
  } else {
    letter = load<Parameters<typeof letterWithSources>[0]>("letter.json");
  }

  // Stage 4: QA / compliance review
  const qa = await timed("QA: adversarial compliance review", () =>
    runQa(denial, letter, TODAY),
  );
  save("qa.json", qa);

  // Stage 5 (CLI rendering): letter + evidence chain + QA verdict
  console.log(`\n${"=".repeat(72)}\nAPPEAL LETTER\n${"=".repeat(72)}\n`);
  console.log(letterWithSources(letter));
  console.log(`${"=".repeat(72)}\nQA VERDICT\n${"=".repeat(72)}`);
  console.log(`recommendation: ${qa.recommendation}`);
  console.log(`confidence:     ${qa.overall_confidence}`);
  console.log(`timeliness:     within_deadline=${qa.timeliness.within_deadline}, days_remaining=${qa.timeliness.days_remaining}`);
  for (const c of qa.claims) console.log(`  [${c.evidence_strength.padEnd(8)}] ${c.claim}`);
  if (qa.needs_human.length) {
    console.log("needs human:");
    for (const h of qa.needs_human) console.log(`  (${h.severity}) ${h.issue}`);
  }
  console.log(`\n${qa.summary}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
