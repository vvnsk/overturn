# Fixtures — synthetic demo data (prepared pre-event; data assets, not code)

- `denial-notice.pdf` — synthetic payer denial letter (vision-parse input)
- `policy-mp-rad-014.pdf` — synthetic payer medical policy styled after public
  imaging policies (the adversarial evidence source)
- `chart-rivera.txt` — synthetic patient chart (stand-in for a FHIR bundle)
- `make-fixtures.mjs` — pre-event tooling that generated the synthetic PDFs,
  included for transparency and reproducibility (`CHROME_BIN` env var overrides
  the browser path). Not part of the hackathon product build; all product code
  is written at the event per the rules.

All patient data is synthetic. No real patient, provider, or payer is depicted.

## The gold-path case

Marisol Rivera (synthetic), lumbar MRI (CPT 72148) denied for medical
necessity under policy MP-RAD-014 §2.1. The case is designed with **two
independent grounds to overturn**:

1. **The denial is factually wrong.** It claims no documented 6-week
   conservative-therapy trial; the chart documents 8 weeks of physical therapy
   (16 visits) plus 9 weeks of NSAIDs and a home exercise program.
2. **The payer never evaluated its own §2.3.** Radicular pain persisting 13
   weeks (threshold: 4) with corresponding objective neurologic findings on
   exam (diminished right ankle reflex, S1 dermatomal sensory loss)
   independently satisfies the policy — a criterion the denial never addressed.

Both grounds cite the payer's own published policy: the agent reads the policy
more carefully than the payer did.
