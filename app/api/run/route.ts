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
import { runIntake835 } from "@/src/pipeline/intake-era";
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

type EraStage = "intake" | "draft" | "qa";

interface RunOptions {
  stage: EraStage | null;
  denialPdfOverride: string | null;
  policyPdfOverride: string | null;
  suppliedDenial: DenialRecord | null;
}

function load<T>(dir: string, name: string): T {
  return JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")) as T;
}

async function liveRun(send: Send, caseId: string, options: RunOptions): Promise<void> {
  const entry = getCase(caseId);
  const channel = entry.channel ?? "fax_pdf";
  const today = new Date().toISOString().slice(0, 10);
  const dir = runDir(caseId);
  fs.mkdirSync(dir, { recursive: true });
  const save = (name: string, data: unknown) =>
    fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2));

  let denial = options.suppliedDenial;
  if (!options.stage || options.stage === "intake") {
    send({ type: "stage_start", stage: "intake" });
    if (channel === "era_835") {
      if (!entry.denialEdi) throw new Error(`case ${caseId} has no 835 ERA source`);
      denial = await runIntake835(entry.denialEdi);
    } else {
      if (!entry.denialPdf) throw new Error(`case ${caseId} has no fax PDF source`);
      denial = await runIntake(options.denialPdfOverride ?? entry.denialPdf);
    }
    save("denial.json", denial);
    send({ type: "denial", data: denial });
    send({ type: "stage_done", stage: "intake" });
    if (channel === "era_835") {
      send({ type: "gate", gate: "policy" });
      return;
    }
    if (options.stage === "intake") {
      send({ type: "done" });
      return;
    }
  }
  denial ??= load<DenialRecord>(dir, "denial.json");

  let letter: AssembledLetter;
  if (options.stage === "qa") {
    letter = load<AssembledLetter>(dir, "letter.json");
  } else {
    send({ type: "stage_start", stage: "draft" });
    if (channel === "era_835" && !options.policyPdfOverride) {
      throw new Error("835 cases require a coordinator-attached policy PDF before drafting");
    }
    const message = await runDraft(
      denial, options.policyPdfOverride ?? entry.policyPdf, entry.chart, today,
      (delta) => send({ type: "draft_delta", text: delta }),
      { policyTitle: entry.policyTitle, chartTitle: entry.chartTitle },
    );
    letter = assembleLetter(message.content as never);
    save("letter.json", letter);
    send({ type: "letter", data: letter });
    send({ type: "stage_done", stage: "draft" });
    if (channel === "era_835") {
      send({ type: "gate", gate: "deadline", paidDate: denial.denial.paid_date });
      return;
    }
    if (options.stage === "draft") {
      send({ type: "done" });
      return;
    }
  }
  if (channel === "era_835" && !denial.denial.appeal_deadline) {
    throw new Error("835 cases require coordinator-confirmed appeal deadline before QA");
  }
  save("denial.json", denial);

  send({ type: "stage_start", stage: "qa" });
  const qa: QaReport = await runQa(denial, letter, today);
  save("qa.json", qa);
  send({ type: "qa", data: qa });
  send({ type: "stage_done", stage: "qa" });

  send({ type: "done" });
}

async function replayRun(send: Send, caseId: string, options: RunOptions): Promise<void> {
  const entry = getCase(caseId);
  const channel = entry.channel ?? "fax_pdf";
  const dir = runDir(caseId);
  const denial = options.suppliedDenial ?? load<DenialRecord>(dir, "denial.json");
  const letter = load<AssembledLetter>(dir, "letter.json");
  const cachedQa = load<QaReport>(dir, "qa.json");
  const deadline = denial.denial.appeal_deadline;
  const qa: QaReport = channel === "era_835" && deadline
    ? {
      ...cachedQa,
      timeliness: {
        ...cachedQa.timeliness,
        denial_date: denial.denial.denial_date,
        appeal_deadline: deadline,
        filed_date: new Date().toISOString().slice(0, 10),
        days_remaining: Math.ceil((new Date(`${deadline}T00:00:00Z`).getTime() - Date.now()) / 86_400_000),
        within_deadline: new Date(`${deadline}T23:59:59Z`).getTime() >= Date.now(),
      },
    }
    : cachedQa;

  // Replay never gates on coordinator input: the cached denial/letter/qa
  // already reflect a policy having been attached and a deadline confirmed
  // (that's what generating the cache *is*), so replaying it re-plays a
  // completed run rather than re-asking a question that's already answered.
  if (!options.stage || options.stage === "intake") {
    send({ type: "stage_start", stage: "intake" });
    await sleep(2200);
    send({ type: "denial", data: denial });
    send({ type: "stage_done", stage: "intake" });
    if (options.stage === "intake") {
      send({ type: "done" });
      return;
    }
  }

  if (options.stage !== "qa") {
    send({ type: "stage_start", stage: "draft" });
    const plain = letter.text.replace(/\[\d+\]/g, "");
    const words = plain.split(/(?<=\s)/);
    for (let i = 0; i < words.length; i += 5) {
      send({ type: "draft_delta", text: words.slice(i, i + 5).join("") });
      await sleep(20);
    }
    send({ type: "letter", data: letter });
    send({ type: "stage_done", stage: "draft" });
    if (options.stage === "draft") {
      send({ type: "done" });
      return;
    }
  }

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
  let policyPdfOverride: string | null = null;
  let suppliedDenial: DenialRecord | null = null;
  let stage = (url.searchParams.get("stage") as EraStage | null);
  const tmpUploads: string[] = [];
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    stage = (form.get("stage") as EraStage | null) ?? stage;
    const denialJson = form.get("denialRecord");
    if (typeof denialJson === "string") {
      try {
        suppliedDenial = JSON.parse(denialJson) as DenialRecord;
      } catch {
        throw new Error("denialRecord form field is not valid JSON");
      }
    }
    const writeUpload = async (name: "denial" | "policy") => {
      const file = form.get(name);
      if (!(file instanceof File) || file.size === 0) return null;
      // Never interpolate the client-supplied filename into a filesystem path
      // (path traversal / arbitrary write) — the extension is the only part
      // of it we trust, and only after stripping any path separators.
      const ext = path.extname(file.name).replace(/[^a-zA-Z0-9.]/g, "") || ".pdf";
      const tmp = path.join(os.tmpdir(), `overturn-${name}-${Date.now()}${ext}`);
      fs.writeFileSync(tmp, Buffer.from(await file.arrayBuffer()));
      tmpUploads.push(tmp);
      return tmp;
    };
    denialPdfOverride = await writeUpload("denial");
    policyPdfOverride = await writeUpload("policy");
  }
  if (stage && !["intake", "draft", "qa"].includes(stage)) throw new Error("invalid pipeline stage");
  const options: RunOptions = { stage, denialPdfOverride, policyPdfOverride, suppliedDenial };

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
        if (mode === "replay") await replayRun(send, caseId, options);
        else await liveRun(send, caseId, options);
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        for (const upload of tmpUploads) fs.rmSync(upload, { force: true });
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
