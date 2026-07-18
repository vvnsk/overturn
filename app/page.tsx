"use client";

// Overturn pipeline surface. Denials arrive (fax webhook, simulated), each one
// flows through a visible pipeline — Domino's-tracker style — and the autonomy
// policy decides when a human is interrupted vs when the agent runs the show.
// Analysis always runs (no side effects); the policy gates only the SEND.

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AssembledLetter,
  DenialRecord,
  QaReport,
} from "@/src/pipeline/types";
import type { P2pBrief } from "@/src/pipeline/p2p";
import CASES from "@/cases/cases.json";

type StageId = "intake" | "draft" | "qa";
type StageState = "pending" | "active" | "done";

interface LetterVersion {
  n: number;
  letter: AssembledLetter;
  note: string;
}

type Resolution = { kind: "revised"; v: number } | { kind: "dismissed" };

interface CaseRun {
  phase: "arriving" | "running" | "complete" | "error";
  stages: Record<StageId, StageState>;
  denial: DenialRecord | null;
  draftText: string;
  letter: AssembledLetter | null; // the ACTIVE version's letter
  versions: LetterVersion[];
  activeVersion: number; // index into versions
  resolutions: Record<number, Resolution>;
  revising: boolean;
  revisingIdx: number | null;
  reviseText: string;
  qa: QaReport | null;
  error: string | null;
  submitted: null | { by: "agent" | "human"; at: string };
  held: boolean;
  p2p: P2pBrief | null;
  showBrief: boolean;
  p2pLoading: boolean;
}

const freshRun = (): CaseRun => ({
  phase: "arriving",
  stages: { intake: "pending", draft: "pending", qa: "pending" },
  denial: null, draftText: "", letter: null,
  versions: [], activeVersion: 0, resolutions: {}, revising: false, revisingIdx: null, reviseText: "",
  qa: null, error: null,
  submitted: null, held: false, p2p: null, showBrief: false, p2pLoading: false,
});

type Mode = "human" | "confident" | "auto";
interface Settings { mode: Mode; threshold: number; holdHighSev: boolean }

interface Decision { action: "auto" | "human" | "hold"; reason: string }

function decide(qa: QaReport, s: Settings): Decision {
  const conf = Math.round(qa.overall_confidence * 100);
  const bar = Math.round(s.threshold * 100);
  const highFlags = qa.needs_human.some((h) => h.severity === "high");
  if (qa.recommendation === "do_not_submit")
    return { action: "hold", reason: "QA: evidence does not support submitting — held for the clinic" };
  if (s.mode === "human")
    return { action: "human", reason: "policy: a human approves every send" };
  if (s.holdHighSev && highFlags)
    return { action: "human", reason: "high-severity flag — policy interrupts a human" };
  if (s.mode === "auto")
    return { action: "auto", reason: "policy: agent runs the show (QA did not block)" };
  if (qa.overall_confidence >= s.threshold)
    return { action: "auto", reason: `confidence ${conf}% clears the ${bar}% bar, no blocking flags` };
  return { action: "human", reason: `confidence ${conf}% below the ${bar}% bar — routed to coordinator` };
}

const CASE_ORDER = ["rivera", "dara", "haag", "johnston"];

export default function Page() {
  const [settings, setSettings] = useState<Settings>({ mode: "confident", threshold: 0.8, holdHighSev: true });
  const [replay, setReplay] = useState(true);
  const [arrived, setArrived] = useState<string[]>([]);
  const [runs, setRuns] = useState<Record<string, CaseRun>>({});
  const [drawer, setDrawer] = useState<string | null>(null);
  const [faxToast, setFaxToast] = useState<string | null>(null);
  const arrivedRef = useRef<string[]>([]);
  arrivedRef.current = arrived;

  const patch = useCallback((id: string, p: Partial<CaseRun> | ((r: CaseRun) => Partial<CaseRun>)) => {
    setRuns((all) => {
      const cur = all[id] ?? freshRun();
      const delta = typeof p === "function" ? p(cur) : p;
      return { ...all, [id]: { ...cur, ...delta } };
    });
  }, []);

  const runCase = useCallback(async (id: string) => {
    patch(id, { ...freshRun(), phase: "running" });
    try {
      const res = await fetch(`/api/run?case=${id}${replay ? "&mode=replay" : ""}`, { method: "POST" });
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
            patch(id, (r) => ({ stages: { ...r.stages, [ev.stage as StageId]: "active" } }));
            break;
          case "stage_done":
            patch(id, (r) => ({ stages: { ...r.stages, [ev.stage as StageId]: "done" } }));
            break;
          case "denial": patch(id, { denial: ev.data }); break;
          case "draft_delta":
            patch(id, (r) => ({ draftText: r.draftText + ev.text }));
            break;
          case "letter":
            patch(id, {
              letter: ev.data,
              versions: [{ n: 1, letter: ev.data, note: "initial draft by the agent" }],
              activeVersion: 0,
            });
            break;
          case "qa": patch(id, { qa: ev.data }); break;
          case "error": throw new Error(ev.message);
          case "done": patch(id, { phase: "complete" }); finished = true; break;
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
      handleLine(buf);
      if (!finished) throw new Error("stream ended before the pipeline finished");
    } catch (err) {
      patch(id, { phase: "error", error: err instanceof Error ? err.message : String(err) });
    }
  }, [patch, replay]);

  const simulateFax = useCallback((count = 1) => {
    const pending = CASE_ORDER.filter((c) => !arrivedRef.current.includes(c));
    const batch = pending.slice(0, count);
    batch.forEach((id, i) => {
      setTimeout(() => {
        const label = CASES.find((c) => c.id === id)?.patient ?? id;
        setFaxToast(`Incoming fax — Notice of Adverse Benefit Determination re: ${label}…`);
        setTimeout(() => {
          setFaxToast(null);
          setArrived((a) => (a.includes(id) ? a : [...a, id]));
          void runCase(id);
        }, 1400);
      }, i * 2200);
    });
  }, [runCase]);

  // Autonomy engine: when QA lands (or the policy changes), auto-submit
  // anything the policy clears that hasn't been decided yet.
  useEffect(() => {
    for (const id of arrived) {
      const r = runs[id];
      if (!r?.qa || r.submitted || r.held || r.phase !== "complete") continue;
      const d = decide(r.qa, settings);
      if (d.action === "auto") {
        patch(id, { submitted: { by: "agent", at: new Date().toISOString() } });
      } else if (d.action === "hold") {
        patch(id, { held: true });
      }
    }
  }, [arrived, runs, settings, patch]);

  const drawerCase = drawer ? CASES.find((c) => c.id === drawer) : null;
  const drawerRun = drawer ? runs[drawer] : null;

  return (
    <>
      <header className="topbar">
        <div className="wordmark">OVER<em>TURN</em></div>
        <div className="case-label">appeals pipeline — Cedar Grove Family Medicine</div>
        <div className="spacer" />
        <label className="replay-toggle">
          <input type="checkbox" checked={replay} onChange={(e) => setReplay(e.target.checked)} />
          cached replay
        </label>
        <button className="primary fax-btn" onClick={() => simulateFax(1)}>📠 Simulate incoming fax</button>
        <button className="ghost" onClick={() => simulateFax(4)}>📠 ×{Math.max(CASE_ORDER.length - arrived.length, 0)} all</button>
      </header>

      <div className="policy-bar">
        <span className="policy-label">AUTONOMY POLICY</span>
        <div className="segmented">
          {([
            ["human", "Human approves all"],
            ["confident", "Auto-submit when confident"],
            ["auto", "Agent runs the show"],
          ] as [Mode, string][]).map(([m, label]) => (
            <button key={m} className={settings.mode === m ? "on" : ""}
              onClick={() => setSettings((s) => ({ ...s, mode: m }))}>{label}</button>
          ))}
        </div>
        <label className={`policy-item${settings.mode === "human" ? " dim" : ""}`}>
          confidence ≥ <b>{Math.round(settings.threshold * 100)}%</b>
          <input type="range" min={50} max={95} step={5} value={settings.threshold * 100}
            disabled={settings.mode === "human"}
            onChange={(e) => setSettings((s) => ({ ...s, threshold: Number(e.target.value) / 100 }))} />
        </label>
        <label className="policy-item">
          <input type="checkbox" checked={settings.holdHighSev}
            onChange={(e) => setSettings((s) => ({ ...s, holdHighSev: e.target.checked }))} />
          interrupt a human on high-severity flags
        </label>
      </div>

      {faxToast && <div className="fax-toast">📠 {faxToast}</div>}

      <main className="pipeline">
        {arrived.length === 0 && !faxToast && (
          <div className="empty-pipeline">
            <h1>The fax line is quiet.</h1>
            <p>
              Denials arrive here the way they arrive at every clinic — by fax. Simulate one
              and watch the agent take it from scan to submission-ready appeal. The autonomy
              policy above decides when a human gets interrupted.
            </p>
          </div>
        )}

        {arrived.map((id) => {
          const meta = CASES.find((c) => c.id === id)!;
          const r = runs[id] ?? freshRun();
          const d = r.qa && r.phase === "complete" ? decide(r.qa, settings) : null;
          return (
            <div key={id} className={`case-row${drawer === id ? " open" : ""}`} onClick={() => setDrawer(id)}>
              <div className="case-head">
                <span className="pt-name">{meta.star ? "★ " : ""}{meta.patient}</span>
                <span className="pt-svc">{meta.service} · CPT {meta.cpt}</span>
                <span className="pt-src">📠 fax intake</span>
                <span className="spacer" />
                {r.qa && <span className="conf-badge">{Math.round(r.qa.overall_confidence * 100)}%</span>}
                <DecisionChip run={r} decision={d} />
              </div>
              <Tracker run={r} />
              <div className="case-sub">
                {r.phase === "error" ? `error: ${r.error}` :
                 r.stages.qa === "done" && d ? d.reason :
                 r.stages.qa === "active" ? "adversarial payer-side review…" :
                 r.stages.draft === "active" ? `drafting against the payer's own policy — ${r.draftText.length.toLocaleString()} chars, citations enforced…` :
                 r.stages.intake === "active" ? "vision-parsing the scanned denial…" :
                 r.phase === "arriving" ? "received — queued" : ""}
              </div>
            </div>
          );
        })}
      </main>

      {drawerCase && drawerRun && (
        <Drawer
          meta={drawerCase} run={drawerRun} settings={settings} replay={replay}
          onClose={() => setDrawer(null)}
          onPatch={(p) => patch(drawerCase.id, p)}
        />
      )}
    </>
  );
}

function Tracker({ run }: { run: CaseRun }) {
  const steps: { label: string; state: StageState }[] = [
    { label: "Received", state: "done" },
    { label: "Parse & classify", state: run.stages.intake },
    { label: "Evidence & draft", state: run.stages.draft },
    { label: "Compliance QA", state: run.stages.qa },
    {
      label: run.submitted ? (run.submitted.by === "agent" ? "Auto-submitted" : "Submitted") : run.held ? "Held" : "Decision",
      state: run.submitted || run.held ? "done" : run.stages.qa === "done" ? "active" : "pending",
    },
  ];
  return (
    <div className="tracker">
      {steps.map((s, i) => (
        <div key={i} className={`seg ${s.state}`}>
          <div className="seg-bar" />
          <div className="seg-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function DecisionChip({ run, decision }: { run: CaseRun; decision: Decision | null }) {
  if (run.submitted)
    return <span className="chip green">✓ {run.submitted.by === "agent" ? "auto-submitted → payer fax (mocked)" : "submitted by coordinator"}</span>;
  if (run.held) return <span className="chip red">✋ held — not worth submitting as-is</span>;
  if (decision?.action === "human") return <span className="chip amber">👤 needs a human</span>;
  if (run.phase === "running" || run.phase === "arriving") return <span className="chip gray">agent working…</span>;
  if (run.phase === "error") return <span className="chip red">error</span>;
  return null;
}

function firstName(name: string): string {
  if (name.includes(",")) {
    const part = name.split(",")[1]?.trim() ?? name;
    return part.charAt(0) + part.slice(1).toLowerCase();
  }
  return name.split(" ")[0];
}

interface DrawerProps {
  meta: (typeof CASES)[number];
  run: CaseRun;
  settings: Settings;
  replay: boolean;
  onClose: () => void;
  onPatch: (p: Partial<CaseRun>) => void;
}

// What "Let the agent fix it" sends: resolve from the record, never invent.
const AUTO_FIX =
  "Resolve the flagged item(s) as you judge best, using ONLY information already documented in the attached record. Where required information is genuinely missing (phone/fax numbers, DOB, signature details), insert a clearly marked [CONFIRM: what is needed] placeholder so clinic staff can fill it before transmission. Do not weaken any ground of the appeal.";

function Drawer({ meta, run, settings, replay, onClose, onPatch }: DrawerProps) {
  const d = run.qa && run.phase === "complete" ? decide(run.qa, settings) : null;
  // resolvingIdx: which composer is open; -1 = the resolve-all composer
  const [resolvingIdx, setResolvingIdx] = useState<number | null>(null);
  const [instruction, setInstruction] = useState("");

  const unresolved = run.qa
    ? run.qa.needs_human.map((_, i) => i).filter((i) => !run.resolutions[i])
    : [];

  // idx >= 0 targets one flag; idx === -1 targets every unresolved flag.
  const sendRevision = async (idx: number, text: string) => {
    if (!run.denial || !run.letter || !run.qa || !text.trim()) return;
    const targets = idx === -1 ? unresolved : [idx];
    const issue = targets.map((i) => run.qa!.needs_human[i].issue);
    const note = text.trim();
    onPatch({ revising: true, revisingIdx: idx, reviseText: "", error: null });
    setResolvingIdx(null);
    setInstruction("");
    // bring the letter into view so the rewrite is visible as it streams
    setTimeout(() => {
      document.querySelector(".drawer .sheet")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    try {
      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: meta.id, denial: run.denial, letter: run.letter,
          instruction: note, issues: issue,
        }),
      });
      if (!res.ok || !res.body) throw new Error(`revision failed (${res.status})`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let newLetter: AssembledLetter | null = null;
      let acc = "";
      const handleLine = (line: string) => {
        if (!line.trim()) return;
        const ev = JSON.parse(line);
        if (ev.type === "revise_delta") { acc += ev.text; onPatch({ reviseText: acc }); }
        else if (ev.type === "letter") newLetter = ev.data;
        else if (ev.type === "error") throw new Error(ev.message);
      };
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) handleLine(line);
      }
      handleLine(buf);
      if (!newLetter) throw new Error("revision stream ended without a letter");
      const vn = run.versions.length + 1;
      onPatch({
        revising: false, revisingIdx: null, reviseText: "",
        versions: [...run.versions, { n: vn, letter: newLetter, note }],
        activeVersion: run.versions.length,
        letter: newLetter,
        resolutions: {
          ...run.resolutions,
          ...Object.fromEntries(targets.map((i) => [i, { kind: "revised", v: vn }])),
        },
      });
    } catch (err) {
      onPatch({ revising: false, revisingIdx: null, error: err instanceof Error ? err.message : String(err) });
    }
  };

  const renderP2p = async () => {
    if (run.p2p) { onPatch({ showBrief: true }); return; }
    if (!run.denial || !run.letter || !run.qa) return;
    onPatch({ p2pLoading: true });
    try {
      const res = await fetch("/api/p2p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ denial: run.denial, letter: run.letter, qa: run.qa, cached: replay, caseId: meta.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "p2p render failed");
      onPatch({ p2p: data, showBrief: true, p2pLoading: false });
    } catch (err) {
      onPatch({ error: err instanceof Error ? err.message : String(err), p2pLoading: false });
    }
  };

  const downloadLetter = () => {
    if (!run.letter) return;
    const blob = new Blob([run.letter.text.replace(/\[\d+\]/g, "")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `appeal-letter-${meta.id}.txt`;
    a.click();
  };

  return (
    <div className="drawer-scrim" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <div className="pt-name">{meta.patient}</div>
            <div className="pt-svc">{meta.service} · CPT {meta.cpt}</div>
          </div>
          <div className="spacer" />
          <DecisionChip run={run} decision={d} />
          <button className="ghost close" onClick={onClose}>×</button>
        </div>

        {run.error && <div className="error-banner">Error: {run.error}</div>}

        {d && !run.submitted && (
          <div className="decision-banner">
            <span>{d.reason}</span>
            <div className="decision-actions">
              <button className="primary" onClick={() => onPatch({ submitted: { by: "human", at: new Date().toISOString() }, held: false })}>
                Approve &amp; submit
              </button>
              {!run.held && (
                <button className="ghost" onClick={() => onPatch({ held: true })}>Hold</button>
              )}
            </div>
          </div>
        )}

        {run.submitted && run.denial && (
          <div className="packet-ok">
            <div className="headline">Appeal packet {run.submitted.by === "agent" ? "auto-submitted by the agent" : "submitted"} ✓</div>
            Faxed to {run.denial.payer_name} appeals department with chart excerpts and policy
            citations attached. <em>(fax transmission mocked)</em>
            <div className="sms">
              <div className="from">SMS → patient (mocked)</div>
              {`Hi ${firstName(run.denial.member.name)} — good news: your clinic appealed your insurance denial today. Most appeals like yours succeed. We'll text you the moment we hear back.`}
            </div>
          </div>
        )}

        {run.qa && (
          <div className="card">
            <h3>Compliance review</h3>
            <div className={`rec ${run.qa.recommendation === "ready_to_submit" ? "ready" : run.qa.recommendation === "review_recommended" ? "review" : "stop"}`}>
              {run.qa.recommendation.replace(/_/g, " ")} — {Math.round(run.qa.overall_confidence * 100)}%
            </div>
            <div className="confbar"><div style={{ width: `${Math.round(run.qa.overall_confidence * 100)}%` }} /></div>
            <div className="fact"><span className="k">Within deadline</span><span className="v">{run.qa.timeliness.within_deadline ? `yes — ${run.qa.timeliness.days_remaining}d left` : "NO"}</span></div>
          </div>
        )}

        {run.qa && run.qa.needs_human.length > 0 && (
          <div className="card">
            <h3>Confirmations — lead the agent</h3>

            {unresolved.length >= 2 && !run.revising && (
              <div className="resolve-all">
                {resolvingIdx === -1 ? (
                  <div className="confirm-thread">
                    <textarea
                      autoFocus rows={3} value={instruction}
                      placeholder={`One message covering all ${unresolved.length} open flags — e.g. "Sign as Dr. Okafor, fax 415-555-0198; DOB 1979-03-22; this is a first-level appeal; drop the muscle-relaxant point."`}
                      onChange={(e) => setInstruction(e.target.value)}
                    />
                    <div className="confirm-actions">
                      <button className="primary" disabled={!instruction.trim()}
                        onClick={() => void sendRevision(-1, instruction)}>
                        Send → one revision fixes all {unresolved.length}
                      </button>
                      <button className="ghost" onClick={() => { setResolvingIdx(null); setInstruction(""); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="confirm-actions all">
                    <span className="resolve-all-label">{unresolved.length} open flags:</span>
                    <button className="primary" onClick={() => void sendRevision(-1, AUTO_FIX)}>
                      Let the agent fix all {unresolved.length}
                    </button>
                    <button className="ghost" onClick={() => { setResolvingIdx(-1); setInstruction(""); }}>
                      Fix all with my notes…
                    </button>
                  </div>
                )}
              </div>
            )}

            {run.qa.needs_human.map((h, i) => {
              const r = run.resolutions[i];
              const working = run.revisingIdx === i || (run.revisingIdx === -1 && !r);
              return (
                <div key={i} className={`confirm-item${r ? " resolved" : ""}`}>
                  <div className="confirm-row">
                    <span className={`sev ${h.severity}`}>{h.severity}</span>
                    <span className="confirm-issue">{h.issue}</span>
                  </div>
                  {working && run.revising ? (
                    <div className="confirm-status working">
                      <span className="workdot" /> agent working on this — redrafting the letter…
                    </div>
                  ) : r ? (
                    <div className="confirm-status">
                      {r.kind === "revised" ? `✓ resolved — letter revised to v${r.v}` : "dismissed — not applicable"}
                    </div>
                  ) : resolvingIdx === i ? (
                    <div className="confirm-thread">
                      <textarea
                        autoFocus rows={2} value={instruction}
                        placeholder='Answer or instruct — e.g. "Sign as Dana Okafor, MD; direct fax 415-555-0198" or "drop that argument"'
                        onChange={(e) => setInstruction(e.target.value)}
                      />
                      <div className="confirm-actions">
                        <button className="primary" disabled={run.revising || !instruction.trim()}
                          onClick={() => void sendRevision(i, instruction)}>
                          Send to agent → revise letter
                        </button>
                        <button className="ghost" onClick={() => { setResolvingIdx(null); setInstruction(""); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="confirm-actions">
                      <button className="ghost strong" disabled={run.revising}
                        onClick={() => void sendRevision(i, `${AUTO_FIX}\n\nThe flag to resolve: "${h.issue}"`)}>
                        Let the agent fix it
                      </button>
                      <button className="ghost" disabled={run.revising}
                        onClick={() => { setResolvingIdx(i); setInstruction(""); }}>
                        Give details…
                      </button>
                      <button className="ghost" disabled={run.revising}
                        onClick={() => onPatch({ resolutions: { ...run.resolutions, [i]: { kind: "dismissed" } } })}>
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {run.versions.length > 0 && (
          <div className="version-bar">
            <span className="policy-label">LETTER</span>
            {run.versions.map((v, i) => (
              <button key={v.n} className={`vpill${i === run.activeVersion ? " on" : ""}`}
                title={v.note} disabled={run.revising}
                onClick={() => onPatch({ activeVersion: i, letter: run.versions[i].letter })}>
                v{v.n}
              </button>
            ))}
            <span className="vnote">{run.versions[run.activeVersion]?.note}</span>
          </div>
        )}

        {run.revising ? (
          <div className="sheet">
            <div className="revising-note">Agent revising per your instruction — citations re-enforced…</div>
            {run.reviseText}<span className="caret" />
          </div>
        ) : run.showBrief && run.p2p ? (
          <BriefView brief={run.p2p} onBack={() => onPatch({ showBrief: false })} />
        ) : run.letter ? (
          <div className="sheet"><LetterView letter={run.letter} /></div>
        ) : run.draftText ? (
          <div className="sheet">{run.draftText}<span className="caret" /></div>
        ) : (
          <div className="sheet empty">
            {run.stages.intake === "active" ? "Reading the denial notice…" : "Waiting for the agent…"}
          </div>
        )}

        {run.letter && !run.showBrief && run.qa && (
          <div className="card approve-box">
            <button className="primary" onClick={() => void renderP2p()} disabled={run.p2pLoading}>
              {run.p2pLoading ? "Rendering brief…" : run.p2p ? "View P2P brief" : "Render P2P brief"}
            </button>
            <button className="ghost" onClick={downloadLetter}>Download letter (.txt)</button>
          </div>
        )}
      </aside>
    </div>
  );
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
      <button className="ghost" style={{ marginTop: 18 }} onClick={onBack}>← Back to the appeal letter</button>
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
