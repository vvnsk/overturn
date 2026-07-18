// POST /api/run — executes the pipeline and streams NDJSON progress events.
//   multipart form with optional "denial" (PDF): live run (fixture fallback)
//   ?mode=replay: streams the cached runs/gold artifacts with realistic pacing,
//   so the live demo cannot be killed by API latency or variance.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runIntake } from "@/src/pipeline/intake";
import { runDraft } from "@/src/pipeline/draft";
import { runQa } from "@/src/pipeline/qa";
import { assembleLetter } from "@/src/pipeline/render";
import type { AssembledLetter, DenialRecord, QaReport } from "@/src/pipeline/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIXTURES = {
  denialPdf: path.join(process.cwd(), "fixtures/denial-notice.pdf"),
  policyPdf: path.join(process.cwd(), "fixtures/policy-mp-rad-014.pdf"),
  chart: path.join(process.cwd(), "fixtures/chart-rivera.txt"),
};
const GOLD_DIR = path.join(process.cwd(), "runs/gold");

type Send = (event: Record<string, unknown>) => void;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function liveRun(send: Send, denialPdfPath: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);

  send({ type: "stage_start", stage: "intake" });
  const denial: DenialRecord = await runIntake(denialPdfPath);
  send({ type: "denial", data: denial });
  send({ type: "stage_done", stage: "intake" });

  send({ type: "stage_start", stage: "draft" });
  const message = await runDraft(denial, FIXTURES.policyPdf, FIXTURES.chart, today, (delta) =>
    send({ type: "draft_delta", text: delta }),
  );
  const letter = assembleLetter(message.content as never);
  send({ type: "letter", data: letter });
  send({ type: "stage_done", stage: "draft" });

  send({ type: "stage_start", stage: "qa" });
  const qa: QaReport = await runQa(denial, letter, today);
  send({ type: "qa", data: qa });
  send({ type: "stage_done", stage: "qa" });

  send({ type: "done" });
}

async function replayRun(send: Send): Promise<void> {
  const denial = JSON.parse(fs.readFileSync(path.join(GOLD_DIR, "denial.json"), "utf8")) as DenialRecord;
  const letter = JSON.parse(fs.readFileSync(path.join(GOLD_DIR, "letter.json"), "utf8")) as AssembledLetter;
  const qa = JSON.parse(fs.readFileSync(path.join(GOLD_DIR, "qa.json"), "utf8")) as QaReport;

  send({ type: "stage_start", stage: "intake" });
  await sleep(2600);
  send({ type: "denial", data: denial });
  send({ type: "stage_done", stage: "intake" });

  send({ type: "stage_start", stage: "draft" });
  // Stream the letter body (markers stripped) in word chunks to read as live drafting.
  const plain = letter.text.replace(/\[\d+\]/g, "");
  const words = plain.split(/(?<=\s)/);
  for (let i = 0; i < words.length; i += 4) {
    send({ type: "draft_delta", text: words.slice(i, i + 4).join("") });
    await sleep(24);
  }
  send({ type: "letter", data: letter });
  send({ type: "stage_done", stage: "draft" });

  send({ type: "stage_start", stage: "qa" });
  await sleep(3200);
  send({ type: "qa", data: qa });
  send({ type: "stage_done", stage: "qa" });

  send({ type: "done" });
}

export async function POST(req: Request): Promise<Response> {
  const mode = new URL(req.url).searchParams.get("mode");

  let denialPdfPath = FIXTURES.denialPdf;
  if (mode !== "replay") {
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("denial");
      if (file instanceof File && file.size > 0) {
        const tmp = path.join(os.tmpdir(), `overturn-denial-${Date.now()}.pdf`);
        fs.writeFileSync(tmp, Buffer.from(await file.arrayBuffer()));
        denialPdfPath = tmp;
      }
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send: Send = (event) =>
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        if (mode === "replay") await replayRun(send);
        else await liveRun(send, denialPdfPath);
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
