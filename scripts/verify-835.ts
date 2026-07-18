import assert from "node:assert/strict";
import fs from "node:fs";
import { NonClinicalEraDenialError, parse835, runIntake835 } from "../src/pipeline/intake-era.js";

const denial = await runIntake835("cases/buckridge-era/denial.835");

assert.equal(denial.channel, "era_835");
assert.equal(denial.member.name, "Lincoln Buckridge");
assert.equal(denial.provider.ordering_physician, "Priya Natarajan");
assert.equal(denial.denial.reason_code, "CO-50");
assert.equal(denial.root_cause, "medical_necessity");
assert.equal(denial.denial.paid_date, "2026-07-18");
assert.deepEqual(denial.service_lines[0], {
  cpt: "72148",
  modifiers: ["26"],
  carc: "CO-50",
  rarc: ["M50"],
  denied_reason: "Not deemed medically necessary",
});
assert.deepEqual(denial.amounts, {
  billed: 500,
  allowed: 75,
  paid: 0,
  patient_responsibility: 0,
});

assert.throws(
  () => parse835(fs.readFileSync("cases/buckridge-era/denial.835", "utf8").replace("CAS*CO*50", "CAS*CO*16")),
  NonClinicalEraDenialError,
);

console.log(JSON.stringify(denial, null, 2));
