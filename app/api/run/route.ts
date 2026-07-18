// POST /api/run?case=<id> — executes the pipeline for one case and streams
// NDJSON progress events.
//   ?mode=replay streams the cached runs/<dir> artifacts with realistic pacing,
//   so the live demo cannot be killed by API latency or variance.
//   multipart form with "denial" (PDF) overrides the case's denial document
//   (the drop-a-PDF path).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runIntake } from "@/src/pipeline/intake";
import { runDraft } from "@/src/pipeline/draft";
import { runQa } from "@/src/pipeline/qa";
import { assembleLetter } from "@/src/pipeline/render";
import { getCase } from "@/src/pipeline/cases";
import type { AssembledLetter, DenialRecord, QaReport } from "@/src/pipeline/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// rivera's cache predates multi-case and lives in runs/gold
const runDir = (caseId: string) =>
  path.join(process.cwd(), "runs", caseId === "rivera" ? "gold" : caseId);

type Send = (event: Record<string, unknown>) => void;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function liveRun(send: Send, caseId: string, denialPdfOverride: string | null): Promise<void> {
  const entry = getCase(caseId);
  const today = new Date().toISOString().slice(0, 10);
  const dir = runDir(caseId);
  fs.mkdirSync(dir, { recursive: true });
  const save = (name: string, data: unknown) =>
    fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2));

  send({ type: "stage_start", stage: "intake" });
  const denial: DenialRecord = await runIntake(denialPdfOverride ?? entry.denialPdf);
  save("denial.json", denial);
  send({ type: "denial", data: denial });
  send({ type: "stage_done", stage: "intake" });

  send({ type: "stage_start", stage: "draft" });
  const message = await runDraft(
    denial, entry.policyPdf, entry.chart, today,
    (delta) => send({ type: "draft_delta", text: delta }),
    { policyTitle: entry.policyTitle, chartTitle: entry.chartTitle },
  );
  const letter = assembleLetter(message.content as never);
  save("letter.json", letter);
  send({ type: "letter", data: letter });
  send({ type: "stage_done", stage: "draft" });

  send({ type: "stage_start", stage: "qa" });
  const qa: QaReport = await runQa(denial, letter, today);
  save("qa.json", qa);
  send({ type: "qa", data: qa });
  send({ type: "stage_done", stage: "qa" });

  send({ type: "done" });
}

async function replayRun(send: Send, caseId: string): Promise<void> {
  const dir = runDir(caseId);
  const denial = JSON.parse(fs.readFileSync(path.join(dir, "denial.json"), "utf8")) as DenialRecord;
  const letter = JSON.parse(fs.readFileSync(path.join(dir, "letter.json"), "utf8")) as AssembledLetter;
  const qa = JSON.parse(fs.readFileSync(path.join(dir, "qa.json"), "utf8")) as QaReport;

  send({ type: "stage_start", stage: "intake" });
  await sleep(2200);
  send({ type: "denial", data: denial });
  send({ type: "stage_done", stage: "intake" });

  send({ type: "stage_start", stage: "draft" });
  const plain = letter.text.replace(/\[\d+\]/g, "");
  const words = plain.split(/(?<=\s)/);
  for (let i = 0; i < words.length; i += 5) {
    send({ type: "draft_delta", text: words.slice(i, i + 5).join("") });
    await sleep(20);
  }
  send({ type: "letter", data: letter });
  send({ type: "stage_done", stage: "draft" });

  send({ type: "stage_start", stage: "qa" });
  await sleep(2600);
  send({ type: "qa", data: qa });
  send({ type: "stage_done", stage: "qa" });

  send({ type: "done" });
}

export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode");
  const caseId = url.searchParams.get("case") ?? "rivera";

  let denialPdfOverride: string | null = null;
  let tmpUpload: string | null = null;
  if (mode !== "replay") {
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("denial");
      if (file instanceof File && file.size > 0) {
        const tmp = path.join(os.tmpdir(), `overturn-denial-${Date.now()}.pdf`);
        fs.writeFileSync(tmp, Buffer.from(await file.arrayBuffer()));
        denialPdfOverride = tmp;
        tmpUpload = tmp;
      }
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send: Send = (event) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          closed = true;
        }
      };
      try {
        if (mode === "replay") await replayRun(send, caseId);
        else await liveRun(send, caseId, denialPdfOverride);
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        if (tmpUpload) fs.rmSync(tmpUpload, { force: true });
        if (!closed) {
          try {
            controller.close();
          } catch {
            /* already closed by the client */
          }
        }
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
