# **Overturn: Strategic Research Brief on Pre-Service Prior Authorization Appeals**

> **Sources note:** This is an AI-assisted secondary-source research brief; citation
> quality varies, and some figures attributed to primary agencies (CMS, HHS OIG, KFF)
> are cited via secondary articles. The companion document
> `overturn-deep-research-report.md` carries primary-source attributions with
> per-claim confidence ratings; where the two disagree, prefer that report.
> Figures differ between the two briefs mainly by data year (2024 vs 2023 KFF/CMS
> releases — e.g., 53M vs 49.8M MA determinations, 80.7% vs 81.7% overturn);
> both sets are directionally consistent: ~50M annual MA determinations, ~6-8%
> denied, ~11-12% of denials appealed, ~81% of appeals overturned.


## **Executive Summary**

The pre-service prior authorization workflow represents a critical friction point in the United States healthcare revenue cycle, characterized by escalating administrative costs and systemic delays in patient care. The product concept for "Overturn"—an agentic-AI appeals desk designed to autonomously ingest denials, cross-reference clinical charts via FHIR APIs, and generate evidence-chained appeal letters—targets a highly validated market failure. The foundational thesis is confirmed by federal and industry data: when prior authorization denials are appealed, the large majority are overturned — yet most denials are never appealed, largely due to prohibitive manual labor costs.  
The five most critical quantitative metrics defining this market opportunity are:

1. **53 Million:** The total number of prior authorization requests submitted within the Medicare Advantage system alone in 2024, reflecting an unsustainable volume of utilization management activity1.  
2. **7.7% to 12.5%:** The baseline denial rate for prior authorizations across Medicare Advantage (7.7%) and Medicaid managed care (12.5%), demonstrating the frequency of initial coverage rejections1.  
3. **11.5%:** The percentage of denied Medicare Advantage prior authorizations that are subsequently appealed by providers, leaving nearly 90% of denials unchallenged and resulting in widespread treatment abandonment and revenue leakage1.  
4. **80.7%:** The overturn rate when Medicare Advantage prior authorization denials are formally appealed, indicating that initial denials frequently do not withstand formal review when challenged with appropriate evidence1.  
5. **$10.97:** The direct clerical cost for a provider to process a single manual prior authorization, which scales to a true all-in organizational cost of $50 to $150 per authorization when factoring in physician peer-to-peer time, denial rework, and downstream revenue abandonment2.

The introduction of the CMS Interoperability and Prior Authorization Final Rule (CMS-0057-F) establishes strict decision timelines and mandates specific electronic denial reasons by 2026\. This regulatory tailwind creates the ideal technical environment for Overturn, enabling the platform to ingest structured denial data, map it against public payer medical policies, and autonomously draft compelling, source-cited appeals.

## **Data Reliability and Key Quantitative Claims Assessment**

To ensure rigorous market sizing and problem definition, the underlying data must be evaluated for source reliability. The following assessments reconcile conflicting data points and establish the confidence levels utilized throughout this analysis.

| Metric | Claimed Value | Source Origin | Confidence | Assessment & Reconciliation |
| :---- | :---- | :---- | :---- | :---- |
| **Provider PA Volume** | 39–43 per physician/week | AMA 2024 Physician Survey | High | Consistent year-over-year. Represents approximately 2,236 prior authorizations annually per physician, establishing the baseline burden2. |
| **MA Denial Rate** | 7.7% | KFF / CMS Data (2024) | High | Federal reporting mandates ensure accuracy. Marketing materials from RCM vendors occasionally cite 15-20% (Low Confidence), but the 7.7% aggregate is the trusted baseline1. |
| **Medicaid Denial Rate** | 12.5% | HHS OIG Report | High | Authoritative federal audit data. Demonstrates that Medicaid MCOs deny at a substantially higher rate (~1.6x) than the 7.7% Medicare Advantage baseline3. |
| **ACA Denial Rate** | 17% \- 19% | KFF Analysis of HealthCare.gov | Med | Claims denial rates and prior authorization denial rates are often conflated in ACA data. Trusted as a directional indicator of higher friction in commercial markets9. |
| **Appeal Rate (MA)** | 11.5% | KFF / CMS Data | High | Reconciles perfectly with OIG Medicaid data showing 89% of enrollees/providers do not appeal, validating the core product thesis1. |
| **Overturn Rate (MA)** | 80.7% \- 83.2% | AMA / KFF / CMS Data | High | Over 80% of challenged Medicare Advantage denials are overturned, indicating a systemic vulnerability in payer initial review processes1. |
| **Overturn Rate (Medicaid)** | \~33% | HHS OIG Report | Med | Medicaid MCOs are statistically less likely to overturn on initial internal appeal compared to MA plans, highlighting market segmentation variances3. |
| **Manual PA Cost** | $10.97 (Provider) | CAQH 2024 Index | High | Standard industry benchmark for direct administrative processing, though it notably excludes hidden clinical time and opportunity costs2. |
| **Clinical Harm** | 24% Serious Adverse Event | AMA 2024 Survey | High | Self-reported by physicians; specifically, 19% reported hospitalizations directly caused by prior authorization delays2. |

## **1\. Problem Definition & Quantification**

The prior authorization landscape is defined by a massive mismatch between the volume of requests required by payers and the administrative capacity of providers to process them, leading to significant financial waste and clinical harm.

### **The Volume and Burden of Prior Authorization**

The volume of pre-service prior authorizations has accelerated rapidly over the past decade as commercial and government payers increasingly rely on utilization management to control healthcare expenditure. Across the United States healthcare system, total prior authorization volume is estimated to exceed 100 million requests annually2. Within the Medicare Advantage sector alone, insurers processed nearly 53 million determinations in 2024, representing a 6.4% year-over-year increase from the 49.8 million determinations processed in 20231. This upward trajectory is occurring despite widespread industry pushback and voluntary pledges by some insurers to reduce authorization requirements.  
At the individual practice level, this macroeconomic trend translates into a crushing daily workflow. Physicians complete an average of 39 to 43 prior authorization requests per week, translating to roughly 2,236 authorizations per physician annually2. Fulfilling these requests consumes approximately 12 to 16 hours of physician and staff time weekly, accounting for nearly 30% of a full-time equivalent (FTE) position dedicated solely to managing payer permissions2. Consequently, 35% of physicians employ staff members whose exclusive job function is navigating the prior authorization apparatus2.  
The burden is not distributed evenly across the medical field. Certain specialties experience disproportionate friction due to the high cost of their interventions. Radiation oncology is the most heavily impacted, with 97% of clinicians reporting severe prior authorization requirements, followed closely by cardiology at 93% and hematology/oncology at 88%2. These specialties rely heavily on advanced imaging, specialty pharmaceuticals, and complex procedures, making them prime targets for payer scrutiny.

### **The Denial and Appeal Discrepancy**

The fundamental operational failure in the current utilization management ecosystem is the stark discrepancy between initial coverage denials and ultimate determinations of medical necessity. Initial denial rates vary significantly by payer segment:

* **Medicare Advantage:** The aggregate denial rate stands at 7.7%1. However, this aggregate masks severe spikes in high-cost post-acute care. For example, the Department of Health and Human Services (HHS) Office of Inspector General (OIG) found that MA plans denied 65% of Long-Term Care Hospital (LTCH) stays, 54% of Inpatient Rehabilitation Facility (IRF) stays, and 12% of Skilled Nursing Facility (SNF) stays14.  
* **Medicaid Managed Care:** Medicaid MCOs are markedly more aggressive, denying 12.5% of prior authorization requests—roughly 1.6 times the 7.7% Medicare Advantage rate3.  
* **Commercial and ACA Markets:** Affordable Care Act marketplace plans deny 17% to 19% of in-network claims (a claims-denial figure, used here only as a directional proxy for prior-authorization friction in commercial markets)9.

Despite this high volume of initial denials, the rate at which providers challenge these decisions is remarkably low. Only 11.5% of denied Medicare Advantage requests are formally appealed1. In the Medicaid sector, the situation is even more pronounced, with 89% of denials going entirely unchallenged3. Providers routinely abandon the process because the administrative labor required to mount a formal appeal—gathering charts, matching against obscure criteria, and drafting a compelling narrative—exceeds the operational capacity of their staff.  
Yet, when providers do invest the resources to appeal, the success rates are staggering. In the Medicare Advantage sector, 80.7% to 83.2% of appealed prior authorization denials are overturned in favor of the provider and patient1. This metric is the foundational thesis for Overturn: denials that are properly challenged rarely survive review, yet systemic friction prevents most challenges from occurring. (Caveat: appealed cases are a self-selected subset; overturn rates among appeals do not by themselves establish the merit distribution of unappealed denials — but even conservative extrapolation implies a large volume of recoverable care.)

### **Financial and Clinical Costs**

The financial impact of this inefficient system is immense. The CAQH 2024 Index calculates the direct administrative cost of a manual provider prior authorization transaction at $10.97, compared to a fully electronic cost of $5.792. However, this metric strictly captures clerical processing time. When accounting for the hidden costs of physician peer-to-peer review time, denial rework, and lost revenue from abandoned treatments, the true all-in cost of a single prior authorization scales to an estimated $50 to $1502. Payers, by contrast, face a highly asymmetric incentive structure: a manual authorization costs a payer only $3.52, and a fully electronic one costs just $0.05, shielding them from the financial pain of the friction they create2.  
Beyond the financial metrics, the clinical consequences are severe. According to American Medical Association survey data, 94% of physicians report that prior authorization delays access to necessary care12. Alarmingly, 24% of physicians report that a prior authorization delay directly led to a serious adverse event for a patient in their care2. Specifically, 19% cited an avoidable hospitalization, 13% cited a life-threatening event requiring intervention, and 7% reported that the delay resulted in permanent disability, congenital anomaly, or death2. Furthermore, 78% of physicians reported that patients abandon recommended treatment entirely due to the complexities of the authorization process2.

## **2\. Market Sizing (TAM / SAM / SOM)**

To rigorously size the market for an agentic-AI prior authorization appeals platform, this analysis applies both top-down industry evaluations and bottom-up operational models, explicitly defining assumptions.

### **Total Addressable Market (TAM)**

The TAM for healthcare administrative technology can be triangulated through two distinct but overlapping lenses:

1. **Global Denials Management Software Market:** The global healthcare denials management market was valued at $14.98 billion in 2024 and is projected to reach $30.17 billion by 2030, representing a Compound Annual Growth Rate (CAGR) of approximately 12.2%16. The United States accounts for roughly 56% to 61% of this global share due to its uniquely fragmented payer ecosystem, yielding a US TAM of $8.4 billion to $9.1 billion17.  
2. **US Revenue Cycle Management (RCM) Market:** The broader US RCM market is projected to reach $72.97 billion by 202618. Prior authorization and denials management software typically command 10% to 15% of total RCM technology spend. Applying this ratio validates a TAM in the $7.3 billion to $10.9 billion range, cleanly reconciling with the denials-specific forecast.

### **Serviceable Available Market (SAM)**

Overturn does not address post-service claims denials (such as coding errors, missing modifiers, or untimely filing), which represent a significant portion of the broader denials TAM. Overturn is strictly focused on the provider-side, pre-service prior authorization appeals sub-segment.  
The SAM can be calculated by isolating the unappealed denial volume:

* **Total US Prior Authorizations:** \~100 million annually2.  
* **Average Denial Rate:** \~10% (blended across MA, Commercial, and Medicaid). Total Initial Denials \= 10 million.  
* **Current Appeal Rate:** \~11.5%. Total Currently Appealed \= 1.15 million1.  
* **Unappealed Denials (The Latent Opportunity):** \~8.85 million prior authorizations.

Assuming an automated appeal solution captures an average of $25 in value per appeal (either via a direct transaction fee or a SaaS equivalent tied to recovered revenue and labor replacement), the SAM for pre-service prior authorization appeals software is approximately $250 million to $300 million in direct transaction value. However, when factoring in the enterprise SaaS platform fees charged to health systems to manage the entire pre-service appeals desk (including analytics, physician peer-to-peer preparation, and patient communication), the true SAM expands to roughly $1.5 billion.

### **Serviceable Obtainable Market (SOM): The Initial Beachhead**

The ideal initial go-to-market beachhead comprises imaging-heavy specialties (radiology, oncology, cardiology, orthopedics) within mid-to-large physician groups and regional health systems. These specialties face the highest prior authorization volumes, the most aggressive denial rates, and the highest per-procedure revenue stakes.  
**Explicit SOM Calculation (Bottom-Up Assumptions):**

* **Target Segment:** 500 regional health systems and large multi-specialty practices in the US.  
* **Profile of Average Target:** A 100-physician group.  
* **Annual PA Volume:** 100 physicians × 2,236 PAs/year \= 223,600 PAs2.  
* **Denials:** A 10% denial rate yields 22,360 denials per year.  
* **Overturn Value:** Assuming an 80% overturn rate, there are 17,888 recoverable authorizations.  
* **Average Recovered Value:** At an average of $1,000 per authorization (blending high-cost MRIs, specialty infusions, and standard procedures), the total recovered revenue is $17.8 million per target organization.  
* **Pricing / ACV:** If Overturn prices at a conservative 2% contingency on recovered revenue, or an equivalent $20 per-transaction flat fee for processed appeals, the Annual Contract Value (ACV) would be approximately $350,000 to $450,000 per enterprise client.  
* **SOM:** 500 target organizations × $400,000 ACV \= **$200 million**.

### **Demand Segmentation and Value Proposition**

Demand scales differently across provider types:

* **Health Systems & Hospital Outpatient:** The primary buyers. The value proposition here is overwhelmingly "recovered revenue" and "reduced A/R days," as they have massive balance sheets and dedicated patient access teams struggling with backlog.  
* **Physician Groups & Imaging Centers:** Highly sensitive to operational overhead. The value proposition is "labor saved" and "physician burnout reduction," as peer-to-peer calls actively remove physicians from revenue-generating clinical encounters.  
* **Third-Party RCM Firms:** These entities operate on tight margins (charging 2% to 8% of collections) and view an AI agent as a margin-expansion tool, replacing offshore labor teams19.

## **3\. Competitive Landscape & Market Fit**

The healthcare AI and RCM automation space is heavily populated, yet strictly fragmented by workflow timing (pre-service vs. post-service) and end-user persona (patient vs. provider).

### **Competitive Matrix**

| Player | Market Lane | What They Cover | What They Do NOT Cover | Funding & Traction |
| :---- | :---- | :---- | :---- | :---- |
| **Claimable** | Patient-Facing (B2C) | Direct-to-patient AI appeal letter generation for denied claims and PAs. | Does not integrate with provider EHRs; requires patients to manually procure and upload their own charts22. | Early stage23. |
| **Counterforce Health** | Patient & MedTech | ERISA-focused appeals, generating letters citing federal law and medical literature24. | Targeted at patients and MedTech sponsors; lacks direct health-system RCM integration25. | NIH / UPenn funded, nonprofit origins26. |
| **Cohere Health, Rhyme, Myndshft** | Provider PA Submission | Automates the *initial submission* of PAs using HL7 Da Vinci CRD/DTR standard integration28. | Focused on "touchless" initial approvals. They do not specialize in aggressive AI evidence-chaining for complex denied appeals. | Well-funded incumbents; Myndshft acquired by DrFirst30. |
| **Optum, Waystar, R1 RCM** | Provider Post-Service Denials | Traditional RCM platforms focusing heavily on post-service *claims* denials (coding edits, EOB scraping)21. | Heavy, legacy implementations; historically weak at parsing unstructured clinical notes for pre-service medical necessity arguments. | Multi-billion enterprise platforms21. |
| **Overturn (Target)** | Provider Pre-Service Appeals | Agentic ingestion of pre-service PA denials, chart-mapping against MCG/payer policy, drafting evidence-chained letters. | Does not submit initial PAs; does not handle post-service coding denials. | N/A (Thesis) |

### **The Abridge and Availity Partnership (January 2026\)**

In January 2026, Abridge (an ambient clinical documentation AI platform) and Availity (a massive healthcare clearinghouse connecting millions of providers to payers) announced a partnership targeting real-time prior authorization at the point of conversation33.

* **What they do:** Abridge's Contextual Reasoning Engine listens to the doctor-patient conversation and maps the clinical data to Availity's FHIR-native Intelligent Utilization Management API. This identifies documentation gaps *during* the visit, ensuring the initial prior authorization request is compliant before submission, thereby aiming to secure an instant, real-time approval from the payer33.  
* **What remains uncovered (The White Space):** The Abridge-Availity alliance operates as a *preventative* submission tool. It relies entirely on the payer's automated rules engine granting an approval based on a clean initial submission. However, when a payer's algorithm insists on a denial (for example, demanding a step-therapy failure that the physician argues is clinically contraindicated), a formal, adversarial appeal is required. Abridge does not operate an "appeals desk"; it operates at the point of care. Overturn's genuine white space is the administrative recovery of complex, stubborn denials that require synthesizing extensive patient histories beyond a single visit transcript, citing external peer-reviewed literature, and structuring a formal legal and clinical argument.

### **Buyer Persona and Budget Dynamics**

The target buyer for Overturn is the VP of Revenue Cycle, the Director of Patient Access, or the Chief Financial Officer (CFO) of a health system or large practice.

* **Sales Cycle & Integration:** Enterprise RCM software typically commands a 6 to 12-month sales cycle, requiring rigorous IT security vetting and EHR integration validation.  
* **Pricing Models:** RCM software is traditionally sold via three models: subscription (SaaS), per-transaction ($1 to $5+ per claim), or a percentage of collections (typically 2% to 8%)19.  
* **Willingness to Pay & ROI Framing:** Overturn must position itself as an autonomous revenue recovery engine. Because nearly 90% of prior authorization denials are currently abandoned2, any overturned denial represents net-new recovered revenue that would have otherwise been written off or resulted in patient treatment abandonment. If Overturn charges $20 per appeal, and successfully recovers a $1,500 MRI authorization 80% of the time, the Return on Investment (ROI) is mathematically undeniable, yielding returns exceeding 50x the transaction cost.

## **4\. Workflow & Domain Reality**

To successfully automate the appeals desk, an agentic AI must mimic the procedural sequencing of a human prior authorization coordinator, adhering to strict federal, state, and payer-specific deadlines.

### **The Appeals Escalation Ladder**

When a pre-service prior authorization is denied, the workflow follows a highly regulated escalation path that dictates strategy36:

1. **Peer-to-Peer (P2P) Review (Informal):**  
   * *Mechanism:* The ordering physician speaks directly with the payer's medical director to discuss the clinical rationale. This bypasses formal appeal letters and is the fastest, highest-yield intervention, frequently overturning over 50% of denials36.  
   * *Timeline:* Must be requested within strict windows (e.g., 7 days for Cigna/EviCore, 14 days for UnitedHealthcare). Crucially, initiating a formal written appeal often closes the P2P scheduling queue36.  
   * *Product Implication:* Overturn must instantly detect a denial and generate a "P2P Prep Brief" for the physician. This brief must highlight the exact missing criteria cited by the payer and map it directly to the specific sentence in the patient's EHR chart, allowing the physician to successfully complete the call in under five minutes.  
2. **Internal Reconsideration / Level 1 Formal Appeal:**  
   * *Mechanism:* A formal written submission containing a physician-signed letter of medical necessity, comprehensive chart notes, history of failed conservative treatments, and peer-reviewed journal abstracts36.  
   * *Timeline:* Must be filed within 60 days for Medicare Advantage, or up to 180 days for commercial plans36. Under the CMS-0057-F rule (effective 2026), payers must issue standard decisions within 7 calendar days, and expedited decisions within 72 hours36.  
   * *Product Implication:* This represents Overturn's core feature. The AI must draft an evidence-chained letter that explicitly cites the payer's specific denial reason, extracts the contradictory evidence from the FHIR DocumentReference, and cites the payer's own published clinical policy.  
3. **External Independent Review Organization (IRO) / Level 2:**  
   * *Mechanism:* A legally binding review conducted by board-certified physicians unaffiliated with the payer36. This review is free to the patient and provider under federal law and carries an approximate 40% overturn rate36.  
   * *Timeline:* Decisions typically take 60 days for standard requests, or 72 hours for expedited cases36.  
   * *Product Implication:* Overturn tracks the status of the Level 1 appeal and automatically packages the denial packet for IRO submission if the internal appeal fails.  
4. **Administrative Law Judge (ALJ) / Federal Court:**  
   * *Mechanism:* For Medicare Advantage, Medicaid, and ERISA plans, final escalations involve formal legal hearings24. Overturn is not designed to argue in this tier, but its meticulous documentation ensures a pristine administrative record should legal counsel assume control.

### **The Role of Clinical Criteria (MCG and InterQual)**

Payers base medical necessity decisions on proprietary clinical criteria, predominantly Change Healthcare's InterQual and Hearst's MCG38.

* **InterQual** relies on highly granular, condition-specific checklists, specifying required findings, acceptable diagnostic workups, and particular thresholds for severity or risk39.  
* **MCG** relies more heavily on care pathways and expected recovery timelines, setting out a typical course of treatment39.

Because these criteria are proprietary intellectual property, Overturn cannot natively embed them without negotiating prohibitively expensive licensing agreements. However, payers publish public-facing "Medical Policies" (e.g., BCBS Medical Policies, UHC Coverage Determinations) which summarize these criteria to comply with transparency regulations. Overturn must dynamically scrape these public policies at runtime to use as the ground truth for its reasoning engine.

## **5\. Technical Build Context**

Building Overturn requires deep integration with healthcare interoperability standards. The product architecture must leverage the HL7 FHIR standard and capitalize on the regulatory mandates established by CMS-0057-F.

### **Relevant FHIR Resources**

To construct a comprehensive appeal, Overturn must extract complex clinical data from the provider's Electronic Health Record (EHR) using the following FHIR R4 resources:

* ServiceRequest: Represents the original order (e.g., Lumbar MRI) that was denied by the payer.  
* Claim / ClaimResponse: While typically used for post-service billing, pre-service prior authorization data is often tracked via ClaimResponse or the Da Vinci CoverageRequirementsDiscovery extensions.  
* Condition: Extracts the patient's ICD-10 diagnoses to justify the intervention.  
* DocumentReference: The most critical resource in the workflow. It contains the unstructured clinical progress notes, lab results, and specialist consults where the nuanced "evidence" of medical necessity actually resides.  
* Coverage: Identifies the payer and plan type (e.g., Medicare Advantage, Commercial, Medicaid, ERISA self-funded), which directly dictates the legal appeal deadlines and regulatory escalation paths36.

### **The HL7 Da Vinci Prior Authorization Stack**

The Da Vinci project has established the industry standards for prior authorization automation37:

1. **CRD (Coverage Requirements Discovery):** Allows the EHR to ask the payer if a prior authorization is required for a specific service.  
2. **DTR (Documentation Templates and Rules):** The payer sends back a CQL (Clinical Quality Language) or SMART-on-FHIR questionnaire of required data.  
3. **PAS (Prior Authorization Support):** The actual submission of the prior authorization, which translates FHIR payloads into the HIPAA-mandated X12 278 EDI format for payer ingestion.

*Build Implication:* For a hackathon MVP, developers should utilize Synthea to generate mock patient FHIR bundles and mock a simple PAS endpoint. In a production environment, Overturn will likely need to sit downstream of an incumbent PAS clearinghouse (such as Availity or Change Healthcare), intercepting the ClaimResponse X12 278 denial code, translating it back into FHIR, and triggering the agentic appeal workflow.

### **Regulatory Catalyst: CMS-0057-F and HTI-4**

The CMS Interoperability and Prior Authorization Final Rule (CMS-0057-F) serves as the primary regulatory tailwind for this product category.

* **Timeline:** By January 1, 2026, impacted payers (MA, Medicaid, ACA) must begin publicly reporting prior authorization metrics and strictly adhere to 72-hour (expedited) and 7-day (standard) decision timeframes37.  
* **The Wedge:** Crucially, starting in 2026, payers must provide **a specific reason for each prior authorization denial**37. Historically, payers returned opaque, unhelpful codes (e.g., "Not Medically Necessary"). A specific reason allows Overturn's Large Language Model (LLM) to parse the exact deficiency (e.g., "Patient did not complete 6 weeks of physical therapy") and search the FHIR DocumentReference to find proof that the patient *did* complete the therapy, instantly generating the counter-argument.  
* **API Mandate:** By January 1, 2027, payers must deploy full Prior Authorization FHIR APIs (CRD, DTR, PAS) to facilitate electronic exchange37.

### **State Level Dynamics: Gold Carding and ERISA Protections**

Several states, pioneered by Texas (HB 3459), have passed "Gold Card" legislation44. Under Texas law, if a physician achieves a 90% prior authorization approval rate for a specific service over a six-month period, they are legally exempt from prior authorization requirements for that service44. Overturn can serve as a strategic dual-threat tool: by winning appeals and ensuring high ultimate approval rates, it helps physicians mathematically qualify for state-mandated gold-card exemptions.  
Additionally, for self-funded employer plans governed by the Employee Retirement Income Security Act (ERISA), appeal strategy shifts entirely. Courts have repeatedly held that procedural violations by the payer can overturn denials regardless of medical merits24. Overturn must be programmed to recognize ERISA plans via the Coverage resource and inject specific legal citations regarding procedural timelines into the appeal.

### **Architecture for Safety and Trust**

Because Overturn generates clinical and quasi-legal arguments, AI hallucination is a catastrophic risk that would destroy provider trust. The architecture must strictly enforce **Human-in-the-Loop (HITL) Evidence Chaining**.

* The LLM must be constrained and not allowed to generate free-text medical facts.  
* Every declarative claim in the generated appeal letter must contain a hyperlinked citation pointing directly to the specific highlighted sentence in the EHR clinical note or the payer's medical policy.  
* A human Prior Authorization Coordinator must review the draft, click the links to verify the exact source text, and explicitly authorize the submission.

## **6\. Risks & Open Questions**

While the market thesis is strong, several systemic risks could invalidate the business model or impede scaling:

1. **Regulatory Obsolescence via CMS-0057-F:** The core premise of the Da Vinci CRD/DTR APIs is to create "touchless" prior authorizations. If payers successfully implement DTR by 2027, the EHR will automatically prevent physicians from submitting an authorization if the clinical criteria aren't met, or automatically approve it if they are41. This could drastically reduce the total volume of initial denials, shrinking Overturn's SAM.  
   * *Mitigation:* Payers are economically incentivized to design algorithms that issue aggressive initial denials for high-cost care to preserve capital. Disputes over clinical nuance (e.g., drug contraindications to step-therapy) will perpetually require a narrative, adversarial appeal.  
2. **Data Access & Walled Gardens:** Extracting unstructured clinical notes (DocumentReference) from incumbent EHRs like Epic or Oracle Health requires navigating complex app orchard approvals. Furthermore, if payers obscure their public medical policies behind provider-portal logins, dynamic scraping becomes technically brittle.  
3. **Incumbent Feature Bundling:** Epic, Optum, and Availity possess the distribution channels and raw data access to build agentic appeals internally31. Optum already owns Change Healthcare (which owns the InterQual criteria)32. If these incumbents embed AI appeal drafting into their native workflows, a standalone startup will struggle to command enterprise ACV.  
4. **Clinical Liability:** If the AI hallucinates a clinical justification that the human coordinator fails to catch, and a patient is harmed by the resulting treatment, liability allocation between the software vendor and the healthcare provider remains legally ambiguous.

### **What to Verify with a Design Partner**

To validate the MVP and refine the product architecture, the following unknowns must be tested with an early-adopter health system or regional clinic:

1. **Denial Data Granularity:** Do the current EDI 278 denial responses received by the provider actually contain enough specific text for an LLM to parse a distinct root cause, or are payers still returning generic codes pending the 2026 CMS enforcement?  
2. **EHR Note Quality:** Are the physician's unstructured clinical notes (the FHIR DocumentReference) detailed enough to win an appeal without requiring the physician to dictate additional addendums to satisfy the LLM?  
3. **User Persona:** Who precisely hits the "approve" button on the drafted appeal inside the hospital? Is it a centralized prior authorization coordinator (administrative), a clinical pharmacist, or a nurse case manager (clinical)?  
4. **Payer Portal Friction:** Can the generated appeal letter actually be submitted electronically via an API or clearinghouse, or must a human user physically copy-paste the AI's output into a disjointed payer web portal or resort to a fax machine?  
5. **P2P Prep Value:** Will physicians actually read a 1-page "P2P Prep Brief" before their calls with medical directors, and does utilizing this brief demonstrably increase their phone-call overturn rate?

#### **Works cited**

1. Contributor: Prior Authorization in 2026—CMS Is Rebuilding the Operating Model | AJMC, [https://www.ajmc.com/view/contributor-prior-authorization-in-2026-cms-is-rebuilding-the-operating-model](https://www.ajmc.com/view/contributor-prior-authorization-in-2026-cms-is-rebuilding-the-operating-model)  
2. The True Cost of Prior Authorization: A Data Analysis \- Nirmitee.io, [https://nirmitee.io/blog/true-cost-prior-authorization-data-driven-analysis-cms-ama-caqh/](https://nirmitee.io/blog/true-cost-prior-authorization-data-driven-analysis-cms-ama-caqh/)  
3. Prior Authorization Process Policies in Medicaid Managed Care: Findings from a Survey of State Medicaid Programs | KFF, [https://www.kff.org/medicaid/prior-authorization-process-policies-in-medicaid-managed-care-findings-from-a-survey-of-state-medicaid-programs/](https://www.kff.org/medicaid/prior-authorization-process-policies-in-medicaid-managed-care-findings-from-a-survey-of-state-medicaid-programs/)  
4. Best Prior Authorization Software for Specialty Practices \- Linear Health, [https://linear.health/blog/best-prior-authorization-software](https://linear.health/blog/best-prior-authorization-software)  
5. Fixing prior auth: Nearly 40 prior authorizations a week is way too many, [https://www.ama-assn.org/practice-management/prior-authorization/fixing-prior-auth-nearly-40-prior-authorizations-week-way](https://www.ama-assn.org/practice-management/prior-authorization/fixing-prior-auth-nearly-40-prior-authorizations-week-way)  
6. Prior authorization in 2025: What to know \- Becker's Payer Issues, [https://www.beckerspayer.com/payer/prior-authorization-in-2025-what-to-know/](https://www.beckerspayer.com/payer/prior-authorization-in-2025-what-to-know/)  
7. The Current Prior Authorization Landscape | Health Affairs, [https://www.healthaffairs.org/content/briefs/current-prior-authorization-landscape](https://www.healthaffairs.org/content/briefs/current-prior-authorization-landscape)  
8. New OIG Report Examines Prior Authorization Denials in Medicaid MCOs \- KFF, [https://www.kff.org/medicaid/new-oig-report-examines-prior-authorization-denials-in-medicaid-mcos/](https://www.kff.org/medicaid/new-oig-report-examines-prior-authorization-denials-in-medicaid-mcos/)  
9. ACA insurers ranked by claim denial rates \- Becker's Payer Issues, [https://www.beckerspayer.com/payer/aca-insurers-ranked-by-claim-denial-rates/](https://www.beckerspayer.com/payer/aca-insurers-ranked-by-claim-denial-rates/)  
10. The Growing Challenges of Hospital Denial Management \- FinThrive, [https://finthrive.com/blog/the-growing-challenges-of-hospital-denial-management](https://finthrive.com/blog/the-growing-challenges-of-hospital-denial-management)  
11. Global Healthcare Claims Management Market (2022 to 2030\) \- Size, Share & Trends Analysis Report, [https://www.prnewswire.com/news-releases/global-healthcare-claims-management-market-2022-to-2030---size-share--trends-analysis-report-301617055.html](https://www.prnewswire.com/news-releases/global-healthcare-claims-management-market-2022-to-2030---size-share--trends-analysis-report-301617055.html)  
12. Prior authorization denials up big in Medicare Advantage \- American Medical Association, [https://www.ama-assn.org/practice-management/prior-authorization/prior-authorization-denials-big-medicare-advantage](https://www.ama-assn.org/practice-management/prior-authorization/prior-authorization-denials-big-medicare-advantage)  
13. Streamlining Prior Authorization Workflow: Tips for Healthcare Providers \- Rivet Health, [https://www.rivethealth.com/blog/impact-of-prior-authorization-process](https://www.rivethealth.com/blog/impact-of-prior-authorization-process)  
14. Medicare Advantage Insurers Deny Prior Authorization Requests for Post Acute Care at Substantially Higher Rates Than the Overall Denial Rate | KFF, [https://www.kff.org/medicare/medicare-advantage-insurers-deny-prior-authorization-requests-for-post-acute-care-at-substantially-higher-rates-than-the-overall-denial-rate/](https://www.kff.org/medicare/medicare-advantage-insurers-deny-prior-authorization-requests-for-post-acute-care-at-substantially-higher-rates-than-the-overall-denial-rate/)  
15. Government Watchdog Agency Finds Excessive Medicare Advantage Denials of Care, [https://medicareadvocacy.org/ma-prior-auth-flagged-again/](https://medicareadvocacy.org/ma-prior-auth-flagged-again/)  
16. Global Healthcare Denial Management Market Research Report: Forecast (2025-2030), [https://www.marknteladvisors.com/research-library/healthcare-denial-management-market.html](https://www.marknteladvisors.com/research-library/healthcare-denial-management-market.html)  
17. Denials Management Software Market Size, Share \[2034\], [https://www.fortunebusinessinsights.com/denials-management-software-market-115401](https://www.fortunebusinessinsights.com/denials-management-software-market-115401)  
18. US Healthcare Revenue Cycle Management Market Embraces Cloud Innovation 2026, [https://www.towardshealthcare.com/insights/us-healthcare-revenue-cycle-management-market-sizing](https://www.towardshealthcare.com/insights/us-healthcare-revenue-cycle-management-market-sizing)  
19. Medical Billing & EHR Pricing | 3 Months Free Offer \- AdvancedMD, [https://www.advancedmd.com/software-pricing/](https://www.advancedmd.com/software-pricing/)  
20. 8 Best Behavioral Health RCM Companies Reviewed for 2026, [https://behavioralproz.com/blog/best-behavioral-health-rcm-companies/](https://behavioralproz.com/blog/best-behavioral-health-rcm-companies/)  
21. Top Revenue Cycle Management Companies for Healthcare Providers in 2025, [https://credexhealthcare.com/top-revenue-cycle-management-companies/](https://credexhealthcare.com/top-revenue-cycle-management-companies/)  
22. For Providers | Help Patients Easily Appeal Denied Insurance Claims \- Claimable, [https://www.getclaimable.com/for-providers](https://www.getclaimable.com/for-providers)  
23. AI Startup Has Helped Reverse Thousands of Denied Health Insurance Claims \- Reddit, [https://www.reddit.com/r/healthcare/comments/1ssmmxt/ai\_startup\_has\_helped\_reverse\_thousands\_of\_denied/](https://www.reddit.com/r/healthcare/comments/1ssmmxt/ai_startup_has_helped_reverse_thousands_of_denied/)  
24. ERISA Appeal Rights: The Hidden Advantage in Self Funded Plan Denials, [https://www.counterforcehealth.org/post/erisa-appeal-rights-the-hidden-advantage-in-self-funded-plan-denials/](https://www.counterforcehealth.org/post/erisa-appeal-rights-the-hidden-advantage-in-self-funded-plan-denials/)  
25. The Hidden Cost of Insurance Denials: How MedTech Companies Lose Millions Annually, [https://www.counterforcehealth.org/post/the-hidden-cost-of-insurance-denials-how-medtech-companies-lose-millions-annually/](https://www.counterforcehealth.org/post/the-hidden-cost-of-insurance-denials-how-medtech-companies-lose-millions-annually/)  
26. Durham-Based Counterforce Health Uses AI to Appeal Insurance Claim Denials \- GrepBeat, [https://grepbeat.com/2025/05/20/durham-based-counterforce-health-uses-ai-to-appeal-insurance-claim-denials/](https://grepbeat.com/2025/05/20/durham-based-counterforce-health-uses-ai-to-appeal-insurance-claim-denials/)  
27. How to Use Google Gemini to Appeal Your Denied Health Insurance Claim, [https://www.counterforcehealth.org/post/how-to-use-google-gemini-to-appeal-your-denied-health-insurance-claim/](https://www.counterforcehealth.org/post/how-to-use-google-gemini-to-appeal-your-denied-health-insurance-claim/)  
28. Rhyme \- Eliminating Prior Auth, [https://www.getrhyme.com/](https://www.getrhyme.com/)  
29. Cohere Health: AI in Prior Authorization & Company Profile | IntuitionLabs, [https://intuitionlabs.ai/articles/cohere-health-ai-prior-authorization](https://intuitionlabs.ai/articles/cohere-health-ai-prior-authorization)  
30. Myndshft Technologies has been acquired by DRFirst \- Transaction, [https://bnco.com/transaction/myndshft-technologies/](https://bnco.com/transaction/myndshft-technologies/)  
31. 7 Best RCM Software Solutions for Epic Users (2025 Comparison) \- Enter.Health, [https://www.enter.health/post/best-rcm-software-for-epic-users](https://www.enter.health/post/best-rcm-software-for-epic-users)  
32. Best Revenue Cycle Management Software 2026 \- Nirmitee.io, [https://nirmitee.io/blog/best-revenue-cycle-management-software-2026-comparison/](https://nirmitee.io/blog/best-revenue-cycle-management-software-2026-comparison/)  
33. Abridge and Availity Redefine Payer-Provider Collaboration, [https://www.abridge.com/press-release/abridge-availity-collaboration-announcement](https://www.abridge.com/press-release/abridge-availity-collaboration-announcement)  
34. Abridge, Availity team up on real-time prior authorization \- Becker's Hospital Review, [https://www.beckershospitalreview.com/digital-health/abridge-availity-team-up-on-real-time-prior-authorization/](https://www.beckershospitalreview.com/digital-health/abridge-availity-team-up-on-real-time-prior-authorization/)  
35. Ambulatory Billing Software in 2026: How to Choose Between EMR-Native, Standalone PM, and Outsourced RCM \- Exactrx, [https://exactrx.ai/dispatch/ambulatory-billing-software-2026-buyers-guide](https://exactrx.ai/dispatch/ambulatory-billing-software-2026-buyers-guide)  
36. What Happens If Prior Authorization Is Denied: 2026 Action Guide | Muni Health, [https://muni.health/blog/what-happens-if-prior-authorization-denied-2025](https://muni.health/blog/what-happens-if-prior-authorization-denied-2025)  
37. CMS-0057-F decoded: Must-have APIs vs. nice-to-have IGs for 2026–2027 \- Firely, [https://fire.ly/blog/cms-0057-f-decoded-must-have-apis-vs-nice-to-have-igs-for-2026-2027/](https://fire.ly/blog/cms-0057-f-decoded-must-have-apis-vs-nice-to-have-igs-for-2026-2027/)  
38. InterQual Criteria | Blue Cross Blue Shield of Massachusetts, [https://www.bluecrossma.org/medical-policies/interqual-criteria](https://www.bluecrossma.org/medical-policies/interqual-criteria)  
39. InterQual & MCG Criteria for Imaging Studies \- Solum Health, [https://getsolum.com/glossary/interqual-mcg-criteria-guide](https://getsolum.com/glossary/interqual-mcg-criteria-guide)  
40. InterQual Criteria | Optum Business, [https://business.optum.com/en/operations-technology/clinical-decision-support/interqual/criteria.html](https://business.optum.com/en/operations-technology/clinical-decision-support/interqual/criteria.html)  
41. HTI-4 & CMS-0057-F \- Compliance \- Medplum, [https://www.medplum.com/docs/compliance/hti-4](https://www.medplum.com/docs/compliance/hti-4)  
42. 2027 Healthcare Compliance Requirements: What Providers Need to Know, [https://www.accountablehq.com/post/2027-healthcare-compliance-requirements-what-providers-need-to-know](https://www.accountablehq.com/post/2027-healthcare-compliance-requirements-what-providers-need-to-know)  
43. CMS-0057-F, [https://www.cms.gov/files/document/cms-0057-f.pdf](https://www.cms.gov/files/document/cms-0057-f.pdf)  
44. Ultimate Guide to Prior Authorizations \- NantHealth, Inc., [https://nanthealth.com/the-ultimate-guide-to-prior-authorizations/](https://nanthealth.com/the-ultimate-guide-to-prior-authorizations/)  
45. Prior Authorization Denied? How to Appeal and Win (2026 Rules) \- Health Bill Central, [https://healthbillcentral.com/blog/prior-authorization-guide](https://healthbillcentral.com/blog/prior-authorization-guide)  
46. 2021 Bill Tracker \- Texas Orthopaedic Association, [https://toa.org/2021-bill-tracker/](https://toa.org/2021-bill-tracker/)  
47. 2026 Newfront ERISA for Employers Guide, [https://go.newfront.com/hubfs/PDFs%20-%20Migrated/Newfront\_ERISA\_for\_Employers\_Guide.pdf](https://go.newfront.com/hubfs/PDFs%20-%20Migrated/Newfront_ERISA_for_Employers_Guide.pdf)  
48. How to Appeal Commercial Health Plan Denials, [https://www.orthopt.org/uploads/content\_files/files/How%20to%20Appeal%20Manual\_by%20Gwen%20Simons\_2021-03-22.pdf](https://www.orthopt.org/uploads/content_files/files/How%20to%20Appeal%20Manual_by%20Gwen%20Simons_2021-03-22.pdf)