# Overturn Research Brief

## Executive summary

Overturn is attacking a real and unusually under-served problem: providers lose medically necessary care and revenue because denied pre-service prior authorizations are often **never appealed**, even though appeals that do get filed are frequently successful in managed-care programs. In Medicare Advantage, plans made **49.8 million** prior-authorization determinations in 2023, denied **6.4%** of them, beneficiaries or providers appealed **11.7%** of denials, and **81.7%** of appealed denials were fully or partially overturned. [Confidence: High]

That core thesis also shows up in Medicaid managed care. In a 2019 HHS OIG review covering **17.4 million** prior-authorization requests across **115 MCOs**, plans denied **1 in 8** requests, enrollees appealed only **11%** of denials, and MCOs overturned **36%** of appealed denials; when cases reached state fair hearings, **38.3%** were fully or partially overturned. [Confidence: High]

The burden is operationally large. The AMA’s 2025 physician survey found practices complete **40 prior authorizations per physician per week**, and the AAMC reports **866,460** direct-patient-care physicians in 2024. A naive extrapolation implies about **1.8 billion physician PA-touch events per year**, but I treat that as a **burden proxy, not a national claims-equivalent count**, because transaction-based benchmarks likely count differently and imply a lower total. [Confidence: Low]

What matters commercially is that the workflow is still mostly manual. MGMA says prior authorization is often handled by **phone, fax, mail, or payer portals**, and **92%** of medical practices reported hiring or redistributing staff because of PA growth. [Confidence: High]

My bottom line: there is genuine white space for a **provider-side, pre-service, evidence-chained appeals agent** because most incumbents focus on **submission/pre-check automation** or **post-service claim denials**, not the narrow but high-value step where a denied authorization must be turned into a payer-policy-grounded appeal package. That white space is defensible if Overturn becomes the best system for **denial-root-cause classification, chart evidence retrieval, policy matching, and auditable appeal drafting** before incumbents productize it. [Confidence: Medium]

## Problem definition and quantification

The strongest public evidence base is segmented, not universal. Medicare Advantage and Medicaid managed care have the best administrative data. Commercial broad-market prior-authorization and claims-denial rates are much less transparent; the best public commercial proxy is ACA Marketplace reporting. Because the sources measure different things, the safest way to read the market is as a **range**, not a single national number.

### Core burden metrics

| Metric | Best available figure | Source | Confidence |
|---|---:|---|---|
| Prior authorizations per physician per week | **40** in 2025 | AMA 2025 PA physician survey | High |
| Prior authorizations per physician per week | **43** in 2024 | AMA press release summarizing 2024 survey | High |
| Prior authorizations per physician per week | **45** in AMA 2022 survey | AMA press release on 2022 survey | High |
| Physician/staff time spent on PA per physician per week | **13 hours** in 2025 | AMA survey summary via AHA coverage of the AMA results | Medium |
| Physician/staff time spent on PA per physician per week | **12 hours** in 2024 | AMA press release summarizing 2024 survey | High |
| Direct-patient-care physicians in U.S. | **866,460** in 2024 | AAMC 2025 key findings | High |
| Implied annual physician PA-touch events | **~1.8 billion** = 40 × 52 × 866,460 | Calculated from AMA + AAMC | Low |

That **~1.8 billion** figure is useful for labor-market sizing but not as a literal transaction count. I would trust it for “how pervasive PA feels inside provider organizations,” not for “how many payer-adjudicated PA requests exist nationally,” because AMA is physician-reported workload while CAQH and payer datasets count standardized administrative transactions. Where these two approaches conflict, I trust **administrative datasets for national request counts** and **AMA for workforce burden**.

### Denial, appeal, and overturn rates

| Segment | Denial rate | Appeal rate | Overturn rate among appealed cases | Source | Confidence |
|---|---:|---:|---:|---|---|
| Medicare Advantage prior auth, 2023 | **6.4%** of 49.8M requests denied | **11.7%** of denials appealed | **81.7%** fully or partially overturned | KFF MA prior auth issue brief | High |
| Medicare Advantage prior auth, 2019 | n/a in this OIG comparison table | n/a | **82%** fully or partially overturned | HHS OIG via Medicaid comparison report | High |
| Medicaid managed care prior auth, 2019 | **12.5%** denied overall | **11%** appealed to MCOs | **36%** overturned at MCO appeal; **38.3%** at fair hearing | HHS OIG | High |
| ACA Marketplace in-network claims, 2024 | **19%** denied | **<1%** appealed internally | **34%** overturned internally, because **66%** upheld | KFF using CMS Transparency in Coverage data | High |
| Broad commercial claims denials outside Marketplace | **No comprehensive national public rate found** | **No comprehensive national public rate found** | **No comprehensive national public rate found** | Closest transparent proxy is ACA Marketplace reporting | High |

Two conclusions matter for Overturn. First, **appeal rates are strikingly low** in every public dataset I could validate. Second, when appeals are actually pursued, overturn rates are often **material**, especially in Medicare Advantage. That is exactly the kind of wedge that can support a workflow product.

### Administrative cost and labor

Public sources are much better on **time spent on prior authorization in general** than on **time per appeal specifically**. I did **not** find a strong primary national estimate for “minutes per PA appeal letter.” The closest defensible proxies are below.

| Metric | Figure | Source | Confidence |
|---|---:|---|---|
| Practice time spent on PA per physician per week | **12–13 hours** | AMA 2024–2025 survey summaries | High |
| Specialist time for a **manual PA transaction** | **26 minutes** on average | CAQH provider-specialty issue brief | High |
| Time savings from using X12 278 for PA instead of fax/email/mail | **15 minutes** per transaction | 2025 CAQH Index slides | High |
| National medical-industry PA cost-savings opportunity from moving to standard electronic exchange | **$461 million** | 2025 CAQH Index slides | High |
| Practices hiring/reassigning staff because of PA growth | **92%** | MGMA 2026 Regulatory Burden Report | High |

Because an appeal generally requires denial intake, chart review, policy lookup, letter drafting, attachments, status follow-up, and sometimes peer-to-peer preparation, the true labor per **appealed denial** is almost certainly **higher** than the CAQH single-transaction manual PA estimate. But there is no high-quality national primary source I can stand behind for a single “minutes per appeal” number, so I would not put one in an investor deck without provider design-partner validation.

### Clinical harm and specialty concentration

The clinical-harm signal is real, although recent public AMA summaries are easier to access than every exact line item in every survey wave.

| Metric | Figure | Source | Confidence |
|---|---:|---|---|
| Physicians reporting PA had led to a serious adverse event | **1 in 3** in AMA’s 2022 survey | AMA press release, 2023 | High |
| Physicians saying PA negatively affected patient clinical outcomes | **90%** in 2020 survey | AMA press release, 2021 | High |
| Physicians saying PA contributes to burnout | **95%** in 2024 survey | AMA summary article on 2024 survey | Medium |
| Physicians reporting inappropriate peer reviewer qualifications “often or always” | **15%** say they often/always speak to the appropriate peer, implying most do not | AMA summary article on 2024 survey | Medium |

On service mix, the pressure clusters where Overturn’s product concept is strongest: imaging, specialty drugs, procedures, and complex outpatient services.

| Burden signal | Figure | Source | Confidence |
|---|---:|---|---|
| In a large MA-insurer policy simulation, beneficiaries had services that would have required PA at a mean of | **2.2 services/beneficiary/year** | JAMA Health Forum cross-sectional study | High |
| Share of Part B spending that would have been subject to PA under that insurer’s rules | **25%** | JAMA Health Forum | High |
| Highest affected clinician specialties in that study | Radiation oncology **97%**, cardiology **93%**, radiology **91%** had at least one PA-affected service | JAMA Health Forum | High |
| Largest non-drug spending category subject to PA | Radiology **16%** of nondrug spending | JAMA Health Forum | High |
| In a cancer-care patient survey, PA most frequently involved imaging | **71%** | JAMA Network Open | High |

For Overturn’s initial beachhead, **advanced imaging** is the cleanest fit. It is high-volume, highly standardized, policy-dense, documentation-heavy, and repeatedly appears as a burden hotspot in both payer-rule studies and patient experience data.

## Market sizing

I do **not** trust generic market-research TAM reports for this category. Most blend together all denials tech, all RCM, patient eligibility, pharmacy ePA, and retrospective claims recovery. Instead, I would size Overturn bottom-up from provider organization counts and a deliberately conservative ACV range.

### How I define the market

Overturn is **not** the whole prior-auth market. It is the **provider-side, pre-service, denial-to-appeal** slice. Its value comes from three buckets:

1. **Recovered revenue / preserved cases** when medically necessary care is approved on appeal.
2. **Labor saved** in centralized prior-auth and patient-access teams.
3. **Access / leakage reduction** by preventing clinically appropriate patients from falling out of the funnel after denial.

### Assumptions table

| Assumption | Value used | Basis | Confidence |
|---|---:|---|---|
| U.S. health systems | **397** | AHA Fast Facts: U.S. Health Systems 2025 | High |
| U.S. community hospitals | **5,121** | AHA Fast Facts on U.S. Hospitals, 2026 | | High |
| System-affiliated community hospitals | **3,567** | AHA Fast Facts on U.S. Hospitals, 2026 | | High |
| Early ICP for Overturn | Centralized patient-access / prior-auth operations in health systems and large hospital-based ambulatory networks | Inference from MGMA burden data and RCM workflow structure | Medium |
| Enterprise ACV for large health-system deployment | **$250k–$750k** ARR | Assumption, not public-list-priced; meant as a planning range only | Low |
| Community-hospital / midmarket ACV | **$60k–$180k** ARR | Assumption, not public-list-priced; meant as a planning range only | Low |
| Early SOM win rate over 3–5 years | **20–50 systems** | Assumption for realistic go-to-market planning | Low |

### TAM, SAM, and SOM arithmetic

#### TAM by acute-provider lens

This lens asks: if Overturn ultimately sells to most hospital-based provider organizations that bear meaningful pre-service PA burden, what recurring software revenue could exist?

| Segment | Org count | ACV range | Implied revenue range | Confidence |
|---|---:|---:|---:|---|
| U.S. health systems | 397 | $250k–$750k | **$99M–$298M** | Low on ACV, High on count |
| Independent / non-system community hospitals and larger hospitals buying stand-alone | 1,554 | $60k–$180k | **$93M–$280M** | Low on ACV, High on count |
| Combined hospital/provider acute TAM | — | — | **$192M–$578M** | Medium overall |

This is the most defensible **provider-software TAM** I can build without inventing a physician-group denominator I cannot validate publicly. It likely **understates** the full addressable market because it excludes large multispecialty groups, imaging center chains, and RCM outsourcers.

#### TAM by denial-volume economics lens

A second lens is to ask whether enough underlying denied PAs exist to support dedicated software.

A documented lower bound from public programs is already large:

- Medicare Advantage denied roughly **3.2 million** prior auth requests in 2023. [Confidence: High]
- Medicaid managed care denied about **2.2 million** of **17.4 million** requests in the OIG study sample; because that sample represented **57%** of comprehensive risk-based managed-care enrollment in reviewed states, the full managed-Medicaid national count would be higher. [Confidence: Medium]

Even before adding broad commercial fully insured and self-funded employer populations, documented managed-care PA denials are already in the **multi-million-per-year** range. That is enough denial volume to support a specialized workflow category if the software is sold into organizations with centralized authorization teams.

#### SAM

For now, I would define SAM as **large health systems and hospital-based ambulatory enterprises with centralized PA staff**, because they have enough denial volume, IT sophistication, and workflow standardization to buy purpose-built software.

A defensible SAM starting point is the **397 U.S. health systems** identified by AHA. At the planning ACV range above, that produces a SAM of roughly **$99M–$298M ARR**. [Confidence: Medium]

#### SOM

The best early beachhead is not “all providers.” It is:

- imaging-heavy specialties,
- hospital-owned ambulatory networks,
- organizations with already-centralized prior-auth teams,
- and payers/products where denials are common and appeals overturn meaningfully.

A realistic early SOM model is:

| Scenario | Customers | ACV | ARR | Confidence |
|---|---:|---:|---:|---|
| Conservative | 20 systems | $300k | **$6M** | Low |
| Base case | 30 systems | $350k | **$10.5M** | Low |
| Strong execution | 50 systems | $400k | **$20M** | Low |

I would present those as **planning cases**, not market facts.

### What I would tell an investor or internal team

The market is probably **too small** if Overturn is sold as a narrow “letter generator” for only a few appeals. It becomes meaningfully large if it is sold as a **provider appeals desk platform** that does:

- denial intake and routing,
- chart evidence retrieval,
- payer-policy matching,
- appeal drafting,
- peer-to-peer prep,
- patient status messaging,
- outcome analytics,
- and eventually closed-loop payer submission/status.

## Competitive landscape and market fit

The market separates into three lanes. Overturn belongs in a narrow gap between them.

### Competitive matrix

| Player | Lane | What it covers | What it does **not** clearly cover | Funding / capital signal | Confidence |
|---|---|---|---|---|---|
| Claimable | Patient-facing appeals | Consumer-facing tool to create and send appeals for denied care/meds; flat-fee consumer workflow | Not provider-embedded, not pre-service provider ops, not chart/FHIR-native patient-access workflow | Public site shows **$39.95** flat fee for non-sponsored cases; public venture financing not identified in sources reviewed | Medium |
| Counterforce Health | Patient-facing appeals | Free patient/caregiver/doctor appeal drafting; grant-backed | Not provider enterprise workflow; not PA-desk software inside rev cycle | Site says supported by **NIH and University of Pennsylvania grants** | Medium |
| Cohere Health | Provider/payer prior-auth submission and UM automation | AI-driven prior-auth automation, payer-provider collaboration, auto-approvals, payer clinical rules | No clear public positioning around provider-side denied-PA appeal drafting desk as the product wedge | Raised **$50M** in 2024; major payer partnerships | High |
| Availity | Network / prior-auth infrastructure | FHIR-native intelligent utilization management, connectivity across payers/providers, CMS-0057-F readiness | Not publicly positioned as a provider-side appeal-writing specialist | Private; large network scale disclosed but not public financing in reviewed sources | High |
| Rhyme | Provider prior-auth submission automation | EHR-integrated touchless prior auth; **4M** prior auths for **83** large providers each year | Public materials emphasize making authorizations touchless, not denial-to-appeal evidence chaining | PriorAuthNow disclosed **$57M total funding** in 2022; now branded Rhyme | Medium |
| Myndshft | Prior-auth automation, especially benefits and specialty meds | Automates medical and pharmacy PA submission/status; labs/imaging coverage visibility | No clear public evidence of provider-side pre-service appeals desk product | Acquired by DrFirst in 2024 | High |
| Waystar Authorization Manager | Provider prior-auth submission automation | Authorization submission automation, payer-rule library, portal automation | Focuses on obtaining/submitting auths, not the clinical-appeal wedge after denial | Public company product line; no separate funding figure needed | High |
| Waystar Denial + Appeal Management | Provider denials/appeals | Post-service denial + appeal management using AI and payer-specific forms | Not clearly focused on **pre-service denied authorizations** and payer-medical-necessity appeals before care is rendered | Public company product line | High |
| SmarterDx | Provider denials / medical necessity evidence support | Finds chart evidence, helps hospitals appeal denials faster, supports medical necessity and level-of-care decisions | Primarily hospital CDI/DRG/revenue integrity and retrospective denials, not front-end PA appeals desk | Private; public funding signal not reviewed here | Medium |
| Abridge + Availity | Point-of-conversation prior auth | Real-time prior authorization, documentation-gap detection, workflow alignment at point of conversation | Early partnership scope is about **real-time submission/decision support**, not obviously about a centralized patient-access appeal desk after denial | Partnership announced Jan 2026; Abridge says **200+** health systems, projected **80M** conversations in 2026; Availity says **95%** payer connectivity | Medium to High |

### The real white space

The white space is **not** “AI for prior auth” in general. That category is already crowded.

The white space is:

1. **Provider-side**
2. **Pre-service**
3. **After denial**
4. **Evidence-chained**
5. **Human-reviewed**
6. **Built for patient-access / rev-cycle ops, not only the ordering physician**

That combination is important. Cohere, Availity, Rhyme, Myndshft, and Waystar mostly aim to make the **original PA submission** faster or more touchless. Waystar and some denials vendors help with **post-service claim denials**. Patient tools like Claimable and Counterforce help patients fight denials but are not embedded in provider operations. Overturn can sit in the part of the workflow where there is a denied order, a ticking access-and-revenue clock, and no good internal tooling.

### Is that white space defensible?

It is defensible **for now**, but not automatically.

It is defensible if Overturn becomes best-in-class at four hard things incumbents are not yet obviously optimized for:

- **Denial-root-cause classification** from unstructured denial artifacts.
- **Policy-grounded evidence assembly** from chart + payer medical policy + guideline support.
- **Appeal artifacts, not just submissions**: letters, attachment packet, and peer-to-peer brief.
- **Auditable traceability** so every sentence can be checked by a human and by compliance.

It is **not** defensible if the product remains only a generic LLM letter writer. Submission incumbents could add that as a feature.

### The Abridge–Availity question

The partnership scope is narrower than “they solved Overturn.”

What the partnership publicly says it is doing:

- developing **real-time prior authorization** at the point of conversation,
- surfacing **documentation gaps during the visit**,
- aligning **utilization management and order submission** inside clinical workflow,
- with the goal of enabling payer determination during the encounter.

What it does **not** clearly claim to do:

- run a centralized provider **appeals desk** for already-denied requests,
- classify denial root causes from incoming denial notices across payers,
- generate a source-cited appeal packet for a human coordinator,
- or manage the downstream internal appeal / external-review workflow as a dedicated ops product.

So Abridge–Availity is best read as **submission-era competition and future platform adjacency**, not as direct proof the appeal-desk wedge is closed.

### Buyer, budget, and ROI framing

The most natural economic buyer is in **revenue cycle / patient access**, not IT. That is an inference, but a strong one: the burden shows up as lost authorizations, staff cost, portals/faxes, delays, and downstream denials. MGMA and Waystar both frame prior auth as an RCM and front-end financial-clearance problem. [Confidence: Medium]

The buyer map likely looks like this:

| Role | Why they care | Confidence |
|---|---|---|
| VP Revenue Cycle / CFO | Prevent lost revenue and reduce write-offs / leakage | Medium |
| Patient Access leadership | Authorization throughput, staff productivity, access delays | High |
| Service-line ops leads for imaging/cardiology/oncology | High-volume denied orders and scheduled-care leakage | Medium |
| CMIO / clinical informatics | Needed for chart access, workflow integration, safety oversight | Medium |

The ROI framing that should resonate is:

- **Recovered cases / preserved net revenue** from successful appeals.
- **Labor avoidance** in prior-auth coordination.
- **Faster time to scheduled care**, which matters to both operations and patient experience.
- **Auditability and compliance**, especially once denial reasons become more explicit under CMS-0057-F.

## Workflow and domain reality

### How the appeals ladder actually works

The process differs sharply by payer category.

| Payer type | Initial pre-service decision deadline | First appeal filing window | First appeal decision timeline | External / independent review path | Source | Confidence |
|---|---:|---:|---:|---|---|---|
| Commercial / ACA / ERISA group health | **15 days** standard pre-service; **72 hours** urgent | **180 days** to file internal appeal | **30 days** pre-service; **72 hours** urgent | External review request within **4 months**; standard decision **45 days**, expedited **72 hours** | CMS marketplace webinar + ERISA claims procedure + 45 CFR 147.136 | High |
| Medicare Advantage | **14 days** standard service request; **72 hours** expedited; **24 hours** for expedited Part B drug decisions | **65 days** for level 1 appeal | **30 days** standard reconsideration for services; **72 hours** expedited | If plan upholds service denial, case goes to CMS-contracted IRE; further levels include ALJ and beyond | CMS Part C/D appeals guidance | High |
| Medicaid managed care | **14 days** standard before 2026, **7 days** for rating periods starting on/after Jan. 1, 2026; **72 hours** expedited | **60 days** to appeal to MCO | State and plan rules vary; fair hearing rights apply after MCO appeal | State fair hearing required; external medical review exists only in some states | 42 CFR 438.210 + MACPAC + OIG | High |

A practical implication for Overturn is that “appeal” is not one thing. The product should treat at least four artifacts separately:

- **reconsideration packet**,
- **peer-to-peer brief**,
- **external-review / IRO packet** where applicable,
- and **patient-facing status explanation**.

### Who does this work today

Inside provider organizations, this work is mostly done by prior-auth coordinators, patient-access teams, clinic staff, or service-line scheduling teams using a patchwork of systems. MGMA says practices often complete PA using **phone, fax, mail, or proprietary payer portals**, and its burden survey shows widespread staff reassignment just to keep up. The AMA also reports that **40%** of physicians have staff who work exclusively on PA.

That means Overturn should be designed first for the people already living in this queue:

- prior-auth coordinators,
- patient-access specialists,
- utilization-management nurses,
- and service-line schedulers,

with physician review only where clinical sign-off or peer-to-peer preparation is necessary.

### What makes an appeal win

The OIG’s MA work is especially useful here because it shows what improper denials look like in practice. Some MA denials that should not have happened were driven by:

- internal clinical criteria that were **more restrictive** than Medicare coverage rules,
- demands for **unnecessary documentation**,
- and manual or system errors.

Several OIG examples are directly relevant to Overturn’s product design. Denied imaging cases were overturned in OIG review when the chart showed medical necessity, but the plan had required things like a prior x-ray or extra conservative-treatment documentation that was not actually required by the governing coverage rule.

So the winning appeal packet usually needs:

- the **payer’s own policy** or controlling coverage rule,
- the exact **denial reason**,
- chart evidence tied to each criterion,
- a concise narrative of **symptoms, failed conservative therapy, red flags, and why the requested service is the right next step**,
- and any missing attachments the payer says it needed.

For inpatient and some site-of-care or UM contexts, plans may also use tools like **MCG** when no specific medical policy governs the service. Anthem’s publicly posted UM guide indicates MCG Care Guidelines are used for inpatient medical-necessity review and for some outpatient services when there is not an established policy. That makes it important for Overturn to know when a denial is a **payer-specific medical policy question** versus a **general utilization-review criteria** question.

### Peer-to-peer review

Peer-to-peer is often the last fast-moving provider touchpoint before or during formal appeal escalation, but it is frequently frustrating. The AMA’s 2024 summary reported that only **15%** of physicians said they often or always speak to a reviewer with the appropriate qualifications. [Confidence: Medium]

A useful peer-to-peer brief should therefore be short and tactical:

- denial reason in one sentence,
- requested service and timeline,
- payer policy section at issue,
- top three chart facts supporting medical necessity,
- what conservative therapy was already tried,
- what bad outcome is being avoided,
- and the clinician’s preferred “ask” phrased in payer language.

## Technical and regulatory build implications

### FHIR, Da Vinci, and what an engineer actually needs

CMS recommends the Da Vinci stack for Prior Authorization APIs:

- **CRD** for coverage-requirements discovery,
- **DTR** for documentation templates/rules,
- **PAS** for FHIR-based prior-authorization request and response exchange.

CMS also states that the HIPAA standard prior-authorization transaction is **X12 278**, and that PAS exists to map FHIR workflows into that ecosystem. CMS further notes enforcement discretion for FHIR-based prior-authorization processes because X12 278 alone cannot meet all CMS-0057-F requirements.

The minimum technical insight for Overturn is this:

- **mockable today**: denial ingestion, policy lookup, chart evidence extraction, criteria matching, letter drafting, peer-to-peer briefing, and PAS payload construction.
- **not fully mockable without market connectivity**: live payer coverage-discovery, DTR question flows, PAS submission/status updates, and reliable electronic attachment acceptance across real trading partners.

On the data model, the safest MVP interpretation of the Da Vinci stack is:

- use **Claim / ClaimResponse** for PAS-style request and decision objects,
- preserve US Core clinical evidence such as **Condition, Observation, Procedure, DiagnosticReport, ServiceRequest, MedicationRequest, Encounter, DocumentReference** as supporting artifacts,
- and keep a normalized internal evidence graph so every appeal statement can trace back to a chart fact or policy clause. PAS explicitly profiles **ClaimResponse**, and CMS’s prior-auth API guidance makes clear that the ecosystem is FHIR-based even where X12 remains the HIPAA baseline. [Confidence: Medium, because the full resource list is an engineering inference from the official IG stack]

### Synthetic data and MVP realism

Synthea is a strong hackathon starting point because it generates realistic but synthetic EHR records and exports FHIR. But it also has a real limit for this use case: Synthea does **not** natively support arbitrary implementation guides beyond US Core; its maintainers point users toward **Flexporter**-style transformation when they need different profiles.

That means a convincing MVP should not pretend to have production-grade PAS interoperability. Instead, it should:

- generate synthetic patient charts with Synthea,
- handcraft or transform them into the narrower evidence set needed for the demo,
- use **real publicly posted payer medical policies** and guideline text,
- and simulate denial notices plus appeal deadlines.

### Public payer medical policy sources

A favorable fact for Overturn is that many major payers do publish at least some medical policies or provider-facing PA requirement materials openly.

Examples reviewed here:

- **Aetna** Clinical Policy Bulletins, including MRI/CT spine medical-necessity criteria.
- **UnitedHealthcare** provider-facing radiology prior-auth requirements and radiology imaging guidelines.
- **Cigna** provider coverage-policy index and precertification resources.
- **Anthem** clinical UM guideline lists, including public references to MCG usage in some review contexts.

That is strategically important. It means Overturn can often build a legally and clinically safer evidence packet from **publicly posted payer logic**, even before it has deep payer connectivity.

### CMS-0057-F and what changes between 2026 and 2028

The 2024 CMS Interoperability and Prior Authorization final rule applies to MA organizations, Medicaid and CHIP FFS and managed care, and QHP issuers on the FFEs. CMS says impacted payers must implement certain provisions by **January 1, 2026**, while the major API requirements land primarily by **January 1, 2027**. [Confidence: High]

What matters most for Overturn:

| Requirement | Timing | Why it matters to Overturn | Source | Confidence |
|---|---|---|---|---|
| Specific denial reason required for non-drug PA denials | Beginning in **2026** | Makes denial intake/classification easier and more machine-tractable | CMS fact sheet | High |
| Prior Authorization API | **Jan. 1, 2027** | Creates future path from “draft appeal” to true interoperable workflow | CMS fact sheet / CMS API page | High |
| Public reporting of aggregated PA metrics | In rule implementation period beginning **2026** | Improves benchmarkability of payer behavior | 42 CFR 438.210 + CMS rule pages | High |
| Standard Medicaid MCO authorization timeline shortens to **7 days** | Rating periods starting on/after **Jan. 1, 2026** | Compresses SLA requirements for provider-side response and appeal prep | 42 CFR 438.210 | High |
| Estimated ten-year savings from moving prior auth into modern electronic workflows | **~$15B** | Reinforces strong policy tailwind toward digitization | CMS blog | Medium |

My read: CMS-0057-F does **not** kill Overturn. It probably helps. More structured denial reasons and API-based workflows make it easier to automate evidence assembly and appeal preparation. What it may reduce over time are the easiest, sloppiest denials. The remaining pool may become **smaller but more complex**, which actually favors a product that is good at reasoning over policy and chart evidence.

### State reform and gold-carding

NCSL reported that, as of late 2025, **at least 10 states** had adopted some form of “gold card” exemption. [Confidence: Medium]

The implication is nuanced. Gold-carding can reduce repetitive low-value PA volume for highly approved services, which is a headwind to any tool monetized purely on raw PA count. But it can also leave behind a harder residual set of denials that require stronger evidence assembly, which is more favorable to Overturn’s specialized wedge. That second point is an inference, not a published statistic. [Confidence: Low]

### Build implications

For a **hackathon MVP**, I would build only the part that is both differentiated and testable:

1. ingest a denial notice,
2. classify likely denial root cause,
3. retrieve the minimal chart facts from FHIR,
4. retrieve the matching public payer policy,
5. draft an appeal letter where every sentence is linked to a chart fact or policy clause,
6. generate a short peer-to-peer brief and a patient-friendly update.

For the **real product**, the architecture should add:

- payer/policy versioning,
- role-based audit logs,
- evidence provenance at sentence level,
- attachment packaging,
- task routing and SLA tracking by payer deadline,
- analytics on appeal outcomes by payer, policy, service, and coordinator,
- and eventually PAS / attachment connectivity where trading partners support it.

The product should **not** auto-submit without human review at first. OIG examples make clear that the line between “missing documentation” and “payer applying the wrong rule” is clinically consequential. Human-in-the-loop plus auditable evidence chains are not just safety features; they are part of the commercial trust proposition.

## Risks and open questions

The biggest product risks are straightforward.

First, **regulatory digitization could move earlier in the workflow**. If submission automation plus payer-side logic gets much better, the number of denials worth appealing could fall. CMS-0057-F and payer simplification pledges push in that direction.

Second, **incumbent bundling is real**. Waystar, Availity, Cohere, and perhaps Abridge-adjacent workflows already sit near the providers and payers Overturn wants. If they add a credible appeals layer, stand-alone value will be harder to sustain.

Third, **data access** is not trivial. A product that needs chart facts, scheduling context, denial artifacts, fax ingestion, payer-policy capture, and status tracking crosses EHR, document-management, portal, and fax boundaries. MGMA’s description of current workflow makes that painfully clear.

Fourth, **clinical-safety and liability** matter. A bad appeal can misstate the chart, cite the wrong policy version, miss a deadline, or push a physician into an unproductive peer-to-peer. OIG’s examples show that medical-necessity logic is not a casual drafting task.

Fifth, **the thesis could be wrong if provider organizations simply do not staff or prioritize appeals even after labor is reduced**. The current non-appeal rate may reflect not only labor burden but also low perceived ROI, decentralized ownership, or learned helplessness with certain payers. That is a design-partner question, not a theoretical one.

### What to verify with a design partner

The most important unknowns to validate quickly are these:

- What percentage of denied **pre-service** authorizations are currently appealed by the organization, by payer and service line?  
- Who owns the work queue in practice: patient access, clinic staff, UM nurses, or a shared rev-cycle team?  
- Which denial reasons are most common, and which are actually appealable?  
- For imaging and procedures, what share of wins come from **missing documentation** versus **bad payer policy application**?  
- How often is a **peer-to-peer** offered before formal reconsideration, and who prepares for it?  
- What is the real unit economics of a won appeal: scheduled case preserved, downstream revenue retained, patient leakage avoided?  
- What systems hold the source facts: EHR, fax inbox, document management, clearinghouse, payer portal, or email?  
- How much variation is there by payer in accepted attachments, templates, and deadlines?  
- Would buyers prefer pricing per site, per physician, per auth denial worked, or shared-savings tied to recovered cases?  
- Would they buy a stand-alone tool or only a module integrated into their existing prior-auth / RCM stack?

## Key sources and confidence map

| Key claim | Source | Confidence |
|---|---|---|
| MA plans made **49.8M** prior-auth determinations in 2023; **6.4%** denied; **11.7%** appealed; **81.7%** overturned | KFF MA prior auth issue brief | High |
| Medicaid MCOs denied **1 in 8** PA requests in 2019 | HHS OIG Medicaid managed care report | High |
| Medicaid MCO denials appealed at **11%**; MCO overturn **36%**; fair-hearing overturn **38.3%** | HHS OIG | High |
| ACA Marketplace insurers denied **19%** of in-network claims in 2024 | KFF using CMS TiC data | High |
| ACA denied claims appealed internally at **<1%**; **66%** upheld | KFF using CMS TiC data | High |
| AMA 2025 burden: **40** PAs per physician/week | AMA 2025 PA survey | High |
| AMA 2024 burden: **43** PAs per physician/week; **12 hours/week** | AMA press summary of 2024 survey | High |
| Direct-patient-care physician count **866,460** in 2024 | AAMC 2025 key findings | High |
| Specialist manual PA transaction time **26 minutes** | CAQH specialty brief | High |
| Electronic PA via X12 278 saves **15 minutes** per transaction; national savings opportunity **$461M** | CAQH 2025 Index slides | High |
| Practices using phone/fax/mail/portal for PA; **92%** hired/reassigned staff | MGMA 2026 Regulatory Burden Report | High |
| JAMA Health Forum: services subject to PA highest in radiation oncology, cardiology, radiology; radiology largest non-drug spending category | JAMA Health Forum | High |
| CMS-0057-F: denial reasons begin in **2026**; APIs mainly by **2027** | CMS fact sheet and API page | High |
| U.S. health systems **397** | AHA Fast Facts: U.S. Health Systems 2025 | High |
| White-space conclusion that Overturn’s wedge is distinct from submission and post-service denial tools | Synthesis across company primary docs and OIG findings | Medium |

Overall assessment: **Overturn has a real wedge** if it is built as a **provider-operational, evidence-traceable pre-service appeals desk** rather than a generic AI authoring feature. The best initial customers are likely integrated provider organizations with centralized patient-access teams and high imaging/procedure burden, where low appeal rates and high overturn rates create a measurable ROI case.