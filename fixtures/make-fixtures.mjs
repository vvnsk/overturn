// Generates synthetic PDF fixtures via headless Chrome. SYNTHETIC DATA ONLY.
// Tooling for data assets — product code is written at the event per rules.
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME_BIN ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const css = `<style>
  body { font-family: Georgia, serif; margin: 48px; line-height: 1.5; font-size: 11pt; }
  h1 { font-size: 15pt; } h2 { font-size: 12pt; margin-top: 20px; }
  .hdr { border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 20px; }
  ul { margin: 8px 0; } li { margin: 4px 0; }
  .meta { color: #444; font-size: 10pt; }
</style>`;

// --- Fixture 1: the payer's own published medical policy (the adversarial source) ---
const policy = `${css}
<div class="hdr"><h1>MERIDIAN HEALTH PLAN — MEDICAL POLICY MP-RAD-014</h1>
<div class="meta">Advanced Imaging: Lumbar Spine MRI &nbsp;|&nbsp; Effective 2026-01-01 &nbsp;|&nbsp; Revision 7</div></div>

<h2>1. Purpose</h2>
<p>This policy establishes medical necessity criteria for magnetic resonance imaging (MRI)
of the lumbar spine for members enrolled in commercial plans.</p>

<h2>2. Criteria — Medically Necessary</h2>
<p>Lumbar spine MRI is considered <b>medically necessary</b> when <b>ANY ONE</b> of the
following criteria (2.1 through 2.4) is met and documented in the medical record:</p>
<ul>
<li><b>2.1</b> Low back pain persisting six (6) weeks or longer that has failed a documented
trial of conservative therapy, where conservative therapy includes at least one of:
physical therapy, NSAID or analgesic pharmacotherapy, or a supervised home exercise program.</li>
<li><b>2.2</b> Presence of any red-flag finding, including progressive neurologic deficit,
suspected cauda equina syndrome, suspected malignancy, or suspected spinal infection.
Red-flag presentations are exempt from the conservative therapy requirement in 2.1.</li>
<li><b>2.3</b> Radicular pain persisting four (4) weeks or longer, with corresponding
objective neurologic findings on physical examination (for example, diminished deep
tendon reflex, dermatomal sensory loss, or motor weakness).</li>
<li><b>2.4</b> Pre-operative planning where lumbar spine surgery is being actively considered
by a treating surgeon.</li>
</ul>

<h2>3. Criteria — Not Medically Necessary</h2>
<p>Lumbar spine MRI is considered <b>not medically necessary</b> for acute low back pain of
less than six (6) weeks duration in the absence of red-flag findings as defined in 2.2.</p>

<h2>4. Documentation Requirements</h2>
<p>The medical record must document: duration of symptoms; the specific conservative therapy
modalities attempted and their duration; objective physical examination findings; and the
clinical question the imaging is expected to answer.</p>

<h2>5. Appeals</h2>
<p>A denial under this policy may be appealed in writing within one hundred eighty (180)
days of the denial notice. A peer-to-peer review with a plan medical director may be
requested within fourteen (14) days.</p>`;

// --- Fixture 2: the scanned denial letter (vision-parse input) ---
const denial = `${css}
<div class="hdr"><h1>MERIDIAN HEALTH PLAN</h1>
<div class="meta">Utilization Management &nbsp;|&nbsp; Notice of Adverse Benefit Determination</div></div>

<p class="meta">Date of Notice: July 06, 2026<br>
Member: RIVERA, MARISOL &nbsp;|&nbsp; Member ID: MHP-4471-88203<br>
Reference / Auth #: PA-2026-0706-88412<br>
Ordering Provider: Dana Okafor, MD — Cedar Grove Family Medicine<br>
Requested Service: MRI Lumbar Spine without contrast (CPT 72148)<br>
Diagnosis: M54.16 — Radiculopathy, lumbar region</p>

<h2>Determination: DENIED</h2>
<p><b>Denial Reason Code:</b> MN-02 &mdash; Medical Necessity Not Established</p>
<p><b>Rationale:</b> The submitted documentation does not establish that the member has
completed a documented six (6) week trial of conservative therapy as required under
Medical Policy MP-RAD-014, Section 2.1. The request is therefore denied as not medically
necessary.</p>

<h2>Your Appeal Rights</h2>
<p>You may submit a written appeal within 180 days of the date of this notice. A
peer-to-peer review with a plan medical director may be requested within 14 days.
Submit appeals to: Meridian Health Plan, Attn: Appeals Unit, PO Box 22140.</p>`;

mkdirSync(here, { recursive: true });

for (const [name, html] of [["policy-mp-rad-014", policy], ["denial-notice", denial]]) {
  const htmlPath = join(here, `${name}.html`);
  const pdfPath = join(here, `${name}.pdf`);
  writeFileSync(htmlPath, html);
  execFileSync(CHROME, [
    "--headless", "--disable-gpu", "--no-pdf-header-footer",
    `--print-to-pdf=${pdfPath}`, `file://${resolve(htmlPath)}`,
  ], { stdio: "ignore" });
  console.log(`wrote ${pdfPath}`);
}
