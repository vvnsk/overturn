import fs from "node:fs";
import path from "node:path";
import { getCase } from "@/src/pipeline/cases";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const caseId = new URL(req.url).searchParams.get("case");
  if (!caseId) return Response.json({ error: "case is required" }, { status: 400 });

  let entry;
  try {
    entry = getCase(caseId);
  } catch {
    return Response.json({ error: "unknown case" }, { status: 404 });
  }
  if (!entry.denialPdf) {
    return Response.json({ error: "this case has no PDF denial document" }, { status: 404 });
  }

  const root = path.resolve(process.cwd());
  const filePath = path.resolve(root, entry.denialPdf);
  if (!filePath.startsWith(`${root}${path.sep}`) || !fs.existsSync(filePath)) {
    return Response.json({ error: "denial document not found" }, { status: 404 });
  }

  return new Response(fs.readFileSync(filePath), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="denial-${entry.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
