// POST /api/p2p — renders the peer-to-peer brief from the same evidence bundle.
// Body: { denial, letter, qa, cached? }. With cached=true, serves (and seeds)
// runs/gold/p2p.json so the demo's escalation beat is instant and API-proof.

import fs from "node:fs";
import path from "node:path";
import { getCase } from "@/src/pipeline/cases";
import { runP2p } from "@/src/pipeline/p2p";
import type { AssembledLetter, DenialRecord, QaReport } from "@/src/pipeline/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cachePath = (caseId: string) =>
  path.join(process.cwd(), "runs", caseId === "rivera" ? "gold" : caseId, "p2p.json");

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as {
    denial: DenialRecord;
    letter: AssembledLetter;
    qa: QaReport;
    cached?: boolean;
    caseId?: string;
  };
  const caseId = body.caseId ?? "rivera";
  getCase(caseId);
  const cache = cachePath(caseId);

  if (body.cached && fs.existsSync(cache)) {
    return Response.json(JSON.parse(fs.readFileSync(cache, "utf8")));
  }

  try {
    const brief = await runP2p(body.denial, body.letter, body.qa);
    if (body.cached) fs.writeFileSync(cache, JSON.stringify(brief, null, 2));
    return Response.json(brief);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
