// POST /api/revise — coordinator-led letter revision, streamed as NDJSON.
// Body: { caseId, denial, letter, instruction, issues[] }
// Events: revise_delta (text), letter (assembled with citations), done | error.

import { runRevise } from "@/src/pipeline/revise";
import { assembleLetter } from "@/src/pipeline/render";
import { getCase } from "@/src/pipeline/cases";
import type { AssembledLetter, DenialRecord } from "@/src/pipeline/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as {
    caseId: string;
    denial: DenialRecord;
    letter: AssembledLetter;
    instruction: string;
    issues?: string[];
  };
  const entry = getCase(body.caseId);
  const today = new Date().toISOString().slice(0, 10);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (event: Record<string, unknown>) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          closed = true;
        }
      };
      try {
        const message = await runRevise(
          body.denial, body.letter, body.instruction, body.issues ?? [],
          entry.policyPdf, entry.chart,
          { policyTitle: entry.policyTitle, chartTitle: entry.chartTitle },
          today,
          (delta) => send({ type: "revise_delta", text: delta }),
        );
        send({ type: "letter", data: assembleLetter(message.content as never) });
        send({ type: "done" });
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        if (!closed) {
          try {
            controller.close();
          } catch { /* closed by client */ }
        }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
