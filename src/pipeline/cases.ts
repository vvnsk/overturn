import fs from "node:fs";
import path from "node:path";

export interface CaseEntry {
  id: string;
  patient: string;
  service: string;
  cpt: string;
  denialPdf: string;
  chart: string;
  policyPdf: string;
  policyTitle: string;
  chartTitle: string;
  star?: boolean;
}

export function loadCases(cwd: string = process.cwd()): CaseEntry[] {
  return JSON.parse(fs.readFileSync(path.join(cwd, "cases/cases.json"), "utf8")) as CaseEntry[];
}

export function getCase(id: string, cwd: string = process.cwd()): CaseEntry {
  const c = loadCases(cwd).find((c) => c.id === id);
  if (!c) throw new Error(`unknown case: ${id}`);
  return c;
}
