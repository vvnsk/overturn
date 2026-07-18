"use client";

// Overturn approval surface. Opens on the denial being dropped in — never on a
// queue. One case at a time: denial in → agent works visibly → letter with an
// enforced evidence chain → human approves the send.

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AssembledLetter,
  DenialRecord,
  QaReport,
} from "@/src/pipeline/types";
import type { P2pBrief } from "@/src/pipeline/p2p";

type StageId = "intake" | "draft" | "qa";
type StageState = "pending" | "active" | "done";
type Phase = "idle" | "running" | "complete" | "approved";

const STAGES: { id: StageId; name: string; detail: string }[] = [
  { id: "intake", name: "Intake & root cause", detail: "Vision parse of the scanned denial; classify why it happened" },
  { id: "draft", name: "Evidence & draft", detail: "Reads the payer's own policy + chart; every claim carries an enforced citation" },
  { id: "qa", name: "Compliance QA", detail: "Adversarial payer-side review: deadlines, evidence strength, confidence" },
];

export default function Page() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [stages, setStages] = useState<Record<StageId, StageState>>({
    intake: "pending", draft: "pending", qa: "pending",
  });
  const [denial, setDenial] = useState<DenialRecord | null>(null);
  const [draftText, setDraftText] = useState("");
  const [letter, setLetter] = useState<AssembledLetter | null>(null);
  const [qa, setQa] = useState<QaReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [replayed, setReplayed] = useState(false);
  const [p2p, setP2p] = useState<P2pBrief | null>(null);
  const [p2pLoading, setP2pLoading] = useState(false);
  const [showBrief, setShowBrief] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Keep the streaming caret in view while the letter is drafting — the typing
  // effect is the demo; it shouldn't disappear below the fold. The near-bottom
  // guard lets the presenter scroll up to point at other panels without the
  // page yanking back down.
  useEffect(() => {
    if (phase === "running" && draftText && !letter) {
      const nearBottom =
        window.innerHeight + window.scrollY > document.body.scrollHeight - 400;
      if (nearBottom) window.scrollTo({ top: document.body.scrollHeight });
    }
  }, [phase, draftText, letter]);

  // Jump to the top of the brief when it opens.
  useEffect(() => {
    if (showBrief) window.scrollTo({ top: 0 });
  }, [showBrief]);

  // Once the cited letter lands, return to the top of the sheet.
  useEffect(() => {
    if (letter) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [letter]);

  const run = useCallback(async (opts: { file?: File; replay?: boolean }) => {
    setPhase("running");
    setError(null);
    setDenial(null); setDraftText(""); setLetter(null); setQa(null);
    setP2p(null); setShowBrief(false);
    setStages({ intake: "pending", draft: "pending", qa: "pending" });
    setReplayed(!!opts.replay);

    try {
      const url = opts.replay ? "/api/run?mode=replay" : "/api/run";
      let body: FormData | undefined;
      if (opts.file) {
        body = new FormData();
        body.append("denial", opts.file);
      }
      const res = await fetch(url, { method: "POST", body });
      if (!res.ok || !res.body) throw new Error(`pipeline request failed (${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let finished = false;
      const handleLine = (line: string) => {
        if (!line.trim()) return;
        const ev = JSON.parse(line);
        switch (ev.type) {
          case "stage_start":
            setStages((s) => ({ ...s, [ev.stage as StageId]: "active" }));
            break;
          case "stage_done":
            setStages((s) => ({ ...s, [ev.stage as StageId]: "done" }));
            break;
          case "denial": setDenial(ev.data); break;
          case "draft_delta": setDraftText((t) => t + ev.text); break;
          case "letter": setLetter(ev.data); break;
          case "qa": setQa(ev.data); break;
          case "error": throw new Error(ev.message);
          case "done": setPhase("complete"); finished = true; break;
        }
      };
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) handleLine(line);
      }
      handleLine(buf); // trailing line if the server closed without a final newline
      if (!finished) throw new Error("stream ended before the pipeline finished");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase("idle");
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void run({ file });
    },
    [run],
  );

  const renderP2p = useCallback(async () => {
    if (!denial || !letter || !qa) return;
    if (p2p) { setShowBrief(true); return; }
    setError(null);
    setP2pLoading(true);
    try {
      const res = await fetch("/api/p2p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ denial, letter, qa, cached: replayed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "p2p render failed");
      setP2p(data);
      setShowBrief(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setP2pLoading(false);
    }
  }, [denial, letter, qa, p2p, replayed]);

  const downloadLetter = useCallback(() => {
    if (!letter) return;
    const blob = new Blob([letter.text.replace(/\[\d+\]/g, "")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "appeal-letter-rivera.txt";
    a.click();
  }, [letter]);

  return (
    <>
      <header className="topbar">
        <div className="wordmark">OVER<em>TURN</em></div>
        <div className="case-label">
          {denial
            ? `${denial.member.name} — ${denial.service.description} (CPT ${denial.service.cpt_codes.join(", ")})`
            : "appeals engine for patient-access teams"}
        </div>
        <div className="spacer" />
        {phase === "running" && <span className="status-pill">agent working{replayed ? " (replay)" : ""}…</span>}
        {phase === "complete" && <span className="status-pill">awaiting human approval</span>}
        {phase === "approved" && <span className="status-pill">appeal submitted</span>}
      </header>

      {error && phase !== "idle" && (
        <div className="error-banner" style={{ margin: "12px 22px 0" }}>
          Error: {error}
        </div>
      )}

      {phase === "idle" ? (
        <main className="intake-screen">
          {error && <div className="error-banner">Pipeline error: {error} — retry, or use the cached replay.</div>}
          <h1>The gate said no. Start the appeal.</h1>
          <p className="sub">
            Drop in the scanned prior-authorization denial. Overturn parses it, reads the
            payer&apos;s own policy against the chart, and drafts a submission-ready appeal —
            every sentence carrying an evidence citation the model cannot fabricate.
          </p>
          <div
            className={`dropzone${drag ? " drag" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => fileInput.current?.click()}
          >
            <div className="big">Drop the denial letter here</div>
            <div className="hint">PDF scan — or click to choose a file</div>
            <input
              ref={fileInput} type="file" accept="application/pdf" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void run({ file: f }); }}
            />
          </div>
          <div className="intake-actions">
            <button className="primary" onClick={() => void run({})}>Run the Rivera case live</button>
            <button className="ghost" onClick={() => void run({ replay: true })}>Replay cached run</button>
          </div>
        </main>
      ) : (
        <main className="surface">
          {/* left rail — agent progress + parsed denial */}
          <div className="rail">
            <div className="card">
              <h3>Agent</h3>
              {STAGES.map((s) => (
                <div key={s.id} className={`stage ${stages[s.id]}`}>
                  <div className="dot" />
                  <div>
                    <div className="name">{s.name}</div>
                    <div className="detail">{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {denial && (
              <div className="card">
                <h3>Parsed denial</h3>
                <div className="fact"><span className="k">Payer</span><span className="v">{denial.payer_name}</span></div>
                <div className="fact"><span className="k">Member</span><span className="v">{denial.member.name}</span></div>
                <div className="fact"><span className="k">ID</span><span className="v">{denial.member.member_id}</span></div>
                <div className="fact"><span className="k">Service</span><span className="v">CPT {denial.service.cpt_codes.join(", ")}</span></div>
                <div className="fact"><span className="k">Reason</span><span className="v">{denial.denial.reason_code ?? "—"}</span></div>
                <div className="fact"><span className="k">Policy</span><span className="v">{denial.denial.cited_policy_id} §{denial.denial.cited_policy_section}</span></div>
                <div className="fact"><span className="k">Deadline</span><span className="v">{denial.denial.appeal_deadline ?? "—"}</span></div>
                <div className="fact" style={{ marginTop: 6 }}>
                  <span className="k">Root cause</span>
                  <span className="tag">{denial.root_cause.replace(/_/g, " ")}</span>
                </div>
              </div>
            )}
          </div>

          {/* center — the letter (or the P2P brief, third rendering of the bundle) */}
          <div>
            {showBrief && p2p ? (
              <BriefView brief={p2p} onBack={() => setShowBrief(false)} />
            ) : letter ? (
              <div className="sheet"><LetterView letter={letter} /></div>
            ) : draftText ? (
              <div className="sheet">{draftText}<span className="caret" /></div>
            ) : (
              <div className="sheet empty">
                {stages.intake === "active" ? "Reading the denial notice…" : "Waiting for the agent…"}
              </div>
            )}
          </div>

          {/* right rail — QA verdict + approval */}
          <div className="rail">
            {qa && (
              <div className="card">
                <h3>Compliance review</h3>
                <div className={`rec ${qa.recommendation === "ready_to_submit" ? "ready" : qa.recommendation === "review_recommended" ? "review" : "stop"}`}>
                  {qa.recommendation.replace(/_/g, " ")}
                </div>
                <div className="confbar"><div style={{ width: `${Math.round(qa.overall_confidence * 100)}%` }} /></div>
                <div className="fact"><span className="k">Overturn confidence</span><span className="v">{Math.round(qa.overall_confidence * 100)}%</span></div>
                <div className="fact"><span className="k">Within deadline</span><span className="v">{qa.timeliness.within_deadline ? `yes — ${qa.timeliness.days_remaining}d left` : "NO"}</span></div>
              </div>
            )}

            {qa && qa.needs_human.length > 0 && (
              <div className="card">
                <h3>Needs a human</h3>
                {qa.needs_human.map((h, i) => (
                  <div key={i} className="human-item">
                    <span className={`sev ${h.severity}`}>{h.severity}</span>
                    <span>{h.issue}</span>
                  </div>
                ))}
              </div>
            )}

            {qa && (
              <div className="card">
                <h3>Evidence audit ({qa.claims.length} claims)</h3>
                {qa.claims.map((c, i) => (
                  <div key={i} className="claim">
                    <span className={`strength ${c.evidence_strength}`}>{c.evidence_strength}</span>
                    <span>{c.claim}</span>
                  </div>
                ))}
              </div>
            )}

            {phase === "complete" && (
              <div className="card approve-box">
                <button className="primary" onClick={() => setPhase("approved")}>
                  Approve &amp; submit appeal
                </button>
                <button className="ghost" onClick={downloadLetter}>Download letter (.txt)</button>
              </div>
            )}

            {phase === "approved" && denial && (
              <>
                <div className="packet-ok">
                  <div className="headline">Appeal packet submitted ✓</div>
                  Faxed to {denial.payer_name} appeals department with chart excerpts and
                  policy citations attached. Confirmation logged. <em>(submission mocked)</em>
                </div>
                <div className="sms">
                  <div className="from">SMS → patient (mocked)</div>
                  {`Hi ${firstName(denial.member.name)} — good news: ${denial.provider.facility ?? "your clinic"} appealed your insurance denial today. Most appeals like yours succeed. We expect the plan's answer within 30 days and will text you the moment we hear back.`}
                </div>
                <div className="card approve-box">
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                    Payer requested a peer-to-peer? One click renders the physician&apos;s
                    brief from the same evidence bundle.
                  </div>
                  <button className="primary" onClick={() => void renderP2p()} disabled={p2pLoading}>
                    {p2pLoading ? "Rendering brief…" : showBrief ? "Brief rendered ✓" : "Render P2P brief"}
                  </button>
                  <button className="ghost" onClick={downloadLetter}>Download letter (.txt)</button>
                </div>
              </>
            )}
          </div>
        </main>
      )}
    </>
  );
}

function firstName(name: string): string {
  // handles "RIVERA, MARISOL" and "Marisol Rivera"
  if (name.includes(",")) {
    const part = name.split(",")[1]?.trim() ?? name;
    return part.charAt(0) + part.slice(1).toLowerCase();
  }
  return name.split(" ")[0];
}

function BriefView({ brief, onBack }: { brief: P2pBrief; onBack: () => void }) {
  return (
    <div className="brief">
      <div className="brief-tag">PEER-TO-PEER BRIEF — for the ordering physician</div>
      <h2>{brief.headline}</h2>
      <div className="brief-patient">{brief.patient_line}</div>

      <h4>Key points</h4>
      {brief.key_points.map((k, i) => (
        <div key={i} className="brief-point">
          <span>{k.point}</span>
          <span className="brief-src">{k.source}</span>
        </div>
      ))}

      <h4>If the medical director pushes back</h4>
      {brief.anticipated_objections.map((o, i) => (
        <div key={i} className="brief-obj">
          <div className="obj">“{o.objection}”</div>
          <div className="resp">→ {o.response}</div>
        </div>
      ))}

      <h4>The ask</h4>
      <div className="brief-ask">{brief.ask}</div>

      <button className="ghost" style={{ marginTop: 18 }} onClick={onBack}>
        ← Back to the appeal letter
      </button>
    </div>
  );
}

function LetterView({ letter }: { letter: AssembledLetter }) {
  const refMap = new Map(letter.refs.map((r) => [r.n, r]));
  const parts = letter.text.split(/(\[\d+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/);
        if (!m) return <span key={i}>{part}</span>;
        const ref = refMap.get(Number(m[1]));
        if (!ref) return <span key={i}>{part}</span>;
        return (
          <span key={i} className="cite">
            [{ref.n}]
            <span className="pop">
              <span className="src">{ref.doc_title} — {ref.location}</span>
              <span className="quote">&ldquo;{ref.cited_text}&rdquo;</span>
            </span>
          </span>
        );
      })}
    </>
  );
}
