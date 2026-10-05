# A Drop of Hope — Product & Technical Plan

> Living document. Update it as patient/family interviews change priorities.
> Status: **draft v0.1** — pre-build planning.

## 1. Vision

A website and mobile app for people living with sickle cell disease (SCD) that:

1. Helps patients **track their health** — symptoms, pain crises, medications and how well they work, comorbidities, and their crisis treatment plan.
2. **Connects them to a community** — patients, families, and specialists — to share stories, support each other, organize fundraisers, and find research and clinical trials that fit them.
3. Builds a **high-quality, consented dataset** that can improve treatment and match patients to studies.

Initial launch: United States, English. Later: African countries (Nigeria, Ghana, Kenya, etc.), additional languages.

**Guiding principle:** privacy and trust come first. Patients will only log honestly if they trust us with the data — and the research value depends on honest, consistent logging.

## 2. Users & roles

| Role | Who | Can do |
|---|---|---|
| **Patient** | Adult with SCD (18+) | Own and manage their health record; join community; opt into research/trial matching |
| **Caregiver** | Parent, spouse, family member | Manage a record *on behalf of* a patient (e.g., a child) or view/help with an adult's record **only with that patient's permission**; join community |
| **Specialist** | Hematologist, nurse, researcher, trial coordinator | **Verified** before getting the role. Post trials, research, and educational resources; answer questions. **No access to any patient's health data** unless that patient explicitly shares it |
| **Moderator / Admin** | Us (initially) | Moderate community, verify specialists, manage content |

Notes:
- A single account can hold multiple roles (e.g., a patient who is also a parent of a child with SCD).
- **Minors:** children under 13 cannot have their own account (COPPA). Their record is a *managed profile* owned by a caregiver. Teens (13–17) are a later decision — needs parental consent design.

## 3. Features

### 3.1 Health Tracker ("My Health")

The core of the app. Logging must be **fast** — a patient in a crisis should be able to log in under 15 seconds with one hand.

**a. Profile & baseline**
- SCD genotype (HbSS, HbSC, HbSβ⁰-thal, HbSβ⁺-thal, other/unknown)
- Date of birth, sex, state/country (coarse location only)
- Baseline labs (optional): hemoglobin, HbF %, etc.
- Care team (hematologist, preferred hospital) — optional
- Disease-modifying therapies, transfusion history, gene therapy / transplant status

**b. Daily check-in / symptom log**
- Pain score (0–10) and body-map location
- Fatigue, mood, sleep, hydration
- Possible triggers: cold, dehydration, stress, infection, exertion, menstruation, altitude/travel
- Free-text note
- Missing days are data too — gentle reminders, no guilt

**c. Crisis log**
- Start / end time, peak severity
- Where it was managed: home, urgent care, ER, admitted (length of stay)
- Treatments used (links to medications) and what helped
- Complications during the crisis (e.g., fever, chest pain → possible acute chest syndrome)
- ER experience (wait time to pain medication, was treatment plan followed?) — valuable advocacy data

**d. Medications**
- Medication list: name, dose, schedule, start/stop dates, reason stopped
- Dose logging (taken / missed)
- **Effectiveness rating** per medication over time, and per-crisis "what helped"
- Medication names from a standard vocabulary (RxNorm) — never a hard-coded list. Drug availability changes (e.g., voxelotor was withdrawn from the market in 2024), so the list must be data, not code.

**e. Comorbidities & complications**
- Pick from a curated SCD-specific list, each mapped to standard codes (ICD-10 / SNOMED CT):
  acute chest syndrome, splenic sequestration / asplenia, stroke / silent infarcts, avascular necrosis, chronic pain, priapism, leg ulcers, retinopathy, kidney disease, pulmonary hypertension, gallstones, iron overload, depression/anxiety, and "other"
- Per condition: date diagnosed, status (active / resolved / managed), episodes, treatments, notes
- Timeline view of episodes

**f. Crisis Treatment Plan**
- Structured plan: home steps, when to go to ER, preferred pain meds and doses, meds to avoid, allergies, hematologist contact, notes for ER staff
- **Versioned:** every edit creates a new version with a "why I changed it" note (e.g., "morphine stopped working, switched to…"). History is never lost — this is valuable data in itself.
- Link plan versions to crises → "how did crises go under plan v2 vs v3?"
- **Shareable for the ER:** printable PDF / lock-screen card / QR code. Encourage patients to have it reviewed by their hematologist.

**g. Insights dashboard**
- Crisis frequency per month, pain trends, medication adherence vs. crisis rate, trigger patterns
- Export for doctor visits (PDF summary)
- Clear disclaimer: insights are not medical advice

### 3.2 Community ("Connect")

**a. Feed & discussions**
- Posts, comments, reactions; topic groups (e.g., "Parents", "Teens & young adults" later, "Pregnancy with SCD", "Living with AVN", by state)
- Pseudonymous display names — community identity is **separate** from the health record
- Optionally share a health "card" (e.g., "Day 3 of a crisis") — patient chooses exactly what to share

**b. Moderation & safety**
- Report button, moderator queue, block/mute
- Medical-misinformation policy; specialist posts are badged
- Crisis / self-harm language → show emergency and mental-health resources (988 in the US)
- "This app is not for emergencies" messaging

**c. Fundraisers**
- Prototype: a post type that **links out** to an existing platform (GoFundMe, etc.). **We do not handle money** in early versions — it adds legal, fraud, and payments complexity.
- Later: verified fundraisers, organization partnerships

**d. Research & Clinical Trials**
- Pull SCD trials from the **ClinicalTrials.gov API (v2)** on a schedule
- Specialists can post trials/studies (with ClinicalTrials.gov ID where possible) — reviewed before publishing
- **Matching:** if a patient opts in, compare their profile (genotype, age, location, current therapies, comorbidities) to trial eligibility and show "may be a fit" — the patient decides whether to contact the study. **Specialists never see who matched** unless the patient reaches out.
- Educational resources and research summaries in plain language

### 3.3 Research data program (later, but designed from day one)

- **Separate, explicit, granular consent** — e.g., "use my de-identified data for research", "match me to trials", "let researchers contact me". Off by default. Revocable anytime.
- Consent records are versioned (what the user agreed to, and when).
- Research datasets are **de-identified / pseudonymized** and generated from the main database — researchers never query production directly.
- Real research use needs an institutional partner and **IRB** oversight. Plan for this before promising data to anyone.
- Using standard codes (RxNorm, ICD-10/SNOMED, LOINC for labs) and a FHIR-friendly shape makes the data usable by researchers and EHRs later.

## 4. Privacy, security & compliance

This is health data from a population that already experiences mistrust and discrimination in healthcare. Treat it accordingly.

### Legal landscape (needs a real lawyer review before launch with real data)
- **HIPAA** generally applies to healthcare providers, insurers, and their business associates. A consumer app that patients use on their own is often *not* a HIPAA-covered entity — but that can change if we partner with clinics/hospitals. **We should build to HIPAA-level safeguards regardless.**
- **FTC Health Breach Notification Rule** — explicitly covers consumer health apps (updated 2024). Breaches, *including unauthorized sharing with third parties like ad/analytics SDKs*, must be reported.
- **State laws** — e.g., Washington's My Health My Data Act and similar consumer-health-data laws.
- **COPPA** — children under 13.
- **Research** — Common Rule / IRB requirements when data is used for research.
- **Future (Africa):** Nigeria Data Protection Act 2023, Kenya Data Protection Act 2019, Ghana Data Protection Act 2012, South Africa POPIA. Several have data-residency or cross-border-transfer rules — design so data can be stored per region.

### Technical safeguards (build in from the start)
- **No real patient data until the safeguards below are in place.** The prototype runs on **synthetic/demo data** and test accounts only.
- Encryption in transit (TLS) and at rest; extra field-level encryption for the most sensitive free-text (notes, treatment plans)
- **Row-level security** in the database: every query is scoped to the owner + people they explicitly granted access
- Strong auth: email/password + MFA option, passkeys later; secure session handling; biometric app lock on mobile
- **Least data:** only collect what we use. Coarse location (state/country), not GPS.
- **No ad trackers, no third-party analytics SDKs** sending health data. If we need analytics, self-hosted/privacy-preserving and event-level only, no health content.
- Audit log of access to health records (who viewed/changed what, when)
- User controls: export all my data, delete my account and data, see and revoke who has access
- Separation of community data and health data (different tables, different access rules; linking requires explicit user action)
- Specialist verification (license / institutional email check)
- Backups, dependency scanning, secrets never in the repo
- Plain-language privacy policy and in-app explanations of *why* we ask for each piece of data

## 5. Recommended technical approach

### Stack (recommended)

| Layer | Choice | Why |
|---|---|---|
| App (iOS, Android, **and** web) | **Expo (React Native) + TypeScript + Expo Router** | One codebase for website + both mobile apps. Huge ecosystem. Android support matters for African scale-up. |
| Backend | **Supabase** (Postgres, Auth, Row-Level Security, Storage, Edge Functions) | Fast to prototype for a solo developer; Postgres is standard and portable (no lock-in); RLS fits our privacy model. Supabase offers a HIPAA BAA on paid plans when we need it. |
| Data fetching / offline | TanStack Query (+ local persistence); evaluate an offline-first store (e.g., expo-sqlite based) in Phase 2 | Logging must work with bad connectivity — especially important for Africa |
| Charts | A React Native charting lib (e.g., Victory Native) | Insights dashboard |
| i18n | i18next / expo-localization from day one | English only now, but no hard-coded strings → translation later is cheap. Also units (g/dL vs g/L) and date formats. |
| Trials data | ClinicalTrials.gov API v2, synced by a scheduled function | Free, official source |
| Testing | Jest + React Native Testing Library; DB tests for RLS policies | RLS policies are security-critical and must be tested |

**Alternatives considered**
- *Next.js website first, mobile later:* simpler web, but two codebases eventually. Good choice if mobile is far off.
- *AWS/GCP from scratch:* most control and HIPAA-eligible, but far more setup work. Supabase can be migrated off later since it is plain Postgres.
- *Flutter:* great mobile, weaker web story; smaller hiring pool for later collaborators.

### High-level architecture

```
 ┌──────────────────────────┐
 │  Expo app (iOS/Android/Web)│
 │  - My Health  - Connect    │
 └────────────┬─────────────┘
              │ HTTPS (auth token)
 ┌────────────▼─────────────────────────────────────────┐
 │ Supabase                                              │
 │  Auth ── Postgres (RLS) ── Storage ── Edge Functions  │
 │           │  health schema  (private, owner-scoped)   │
 │           │  community schema (pseudonymous)          │
 │           │  trials schema   (public + specialist)    │
 │           │  consent + audit schema                   │
 └───────────┼──────────────────────────────────────────┘
             │ scheduled job
     ClinicalTrials.gov API v2
             │ (later) de-identified export
     Research dataset (separate store, IRB-governed)
```

### Proposed repo layout

```
/app                 Expo Router screens (tabs: health, connect, profile)
/src/components      Shared UI
/src/features        health/, crises/, meds/, comorbidities/, plans/, community/, trials/
/src/lib             api client, auth, i18n, validation (zod)
/src/locales/en      Translation strings
/supabase/migrations SQL schema + RLS policies
/supabase/functions  Edge functions (trial sync, exports)
/supabase/seed       Synthetic demo data
/docs                This plan, data model, privacy notes, interview notes
```

## 6. Data model (first draft)

Health data (owner-scoped via RLS):

- `profiles` — user_id, display_name, roles, country, region
- `patients` — id, owner_user_id (patient or caregiver for managed profiles), genotype, dob, sex, baseline labs
- `care_access` — patient_id, user_id, permission (view / edit), granted_by, expires_at
- `symptom_logs` — patient_id, logged_at, pain_score, pain_locations[], fatigue, mood, sleep, hydration, triggers[], note
- `crises` — patient_id, started_at, ended_at, peak_severity, setting (home/urgent/ER/admitted), los_days, plan_version_id, complications[], er_wait_minutes, note
- `crisis_treatments` — crisis_id, medication_id, helped_rating
- `medications` — patient_id, rxnorm_code, name, dose, schedule, started_on, stopped_on, stop_reason
- `medication_logs` — medication_id, taken_at, status (taken/missed), effectiveness (1–5)
- `comorbidities` — patient_id, condition_code, diagnosed_on, status, note
- `comorbidity_episodes` — comorbidity_id, occurred_on, severity, treatment, note
- `treatment_plans` — patient_id, current_version_id
- `treatment_plan_versions` — plan_id, version, content (structured JSON), change_reason, created_at, created_by
- `labs` (later) — patient_id, loinc_code, value, unit, measured_on

Community:
- `posts`, `comments`, `reactions`, `groups`, `group_members`, `reports`, `fundraiser_links`

Trials:
- `trials` — source (ctgov / specialist), nct_id, title, summary, eligibility (structured where possible), locations, status
- `specialist_verifications`

Governance:
- `consents` — user_id, consent_type, version, granted_at, revoked_at
- `audit_log` — actor, action, table, record_id, at

## 7. Screens (prototype)

- **Onboarding:** welcome → role selection → privacy explainer → account → basic profile (genotype etc.)
- **My Health (tab):** today's check-in card, quick "I'm in a crisis" button, recent logs
  - Crisis log & detail · Medications · Comorbidities · Treatment Plan (with version history) · Insights
- **Connect (tab):** feed, groups, post composer, fundraisers, Trials & Research (search + "may fit me")
- **Profile (tab):** account, sharing & caregivers, consents, export/delete data, settings

## 8. Phased roadmap

**Phase 0 — Foundations (1–2 weeks)**
- Repo, Expo + TypeScript, linting, CI
- Supabase project, auth, roles, base schema + RLS + tests
- i18n scaffolding, design basics, synthetic seed data

**Phase 1 — Tracker prototype (for interviews) (3–5 weeks)**
- Onboarding & profile
- Daily check-in, crisis log, medications + effectiveness, comorbidities
- Treatment plan with versioning + printable/shareable view
- Simple insights (crisis frequency, pain trend)
- 🎯 Goal: a working demo to put in front of patients and families during interviews

**Phase 2 — Community (3–4 weeks)**
- Feed, posts, comments, groups, reporting & moderation tools
- Fundraiser link posts
- ClinicalTrials.gov trial browsing

**Phase 3 — Specialists & matching**
- Specialist verification, specialist-posted trials/resources
- Opt-in trial matching
- Caregiver sharing improvements, offline logging, reminders/notifications

**Phase 4 — Research & scale**
- Legal review, HIPAA BAA, security review / pen test before real users at scale
- Research consent + de-identified exports with an institutional/IRB partner
- FHIR export, EHR integration exploration
- Localization and regional data storage for African launch

## 9. Open questions (to resolve with interviews / decisions)

- How do patients prefer to log during a crisis — tap scale, voice note, caregiver logs for them?
- Do caregivers usually manage one patient or several (e.g., multiple children with SCD)?
- How should teens (13–17) be supported?
- What would make the ER treatment plan actually get used by ER staff?
- Which comorbidities matter most to track in detail vs. a simple checklist?
- Do users want community posts tied to their health logs at all, or fully separate?
- Potential institutional research partner (university / sickle cell center) and IRB path?
- Reminder style and frequency that helps without becoming a burden

## 10. Interview notes

_Add notes from patient/family/specialist interviews here (no identifying details)._
