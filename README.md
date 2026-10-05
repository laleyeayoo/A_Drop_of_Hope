# A Drop of Hope

A website and mobile app for people living with **sickle cell disease (SCD)** and their families.

- **My Health** — track daily symptoms, pain crises, medications (and how well they work), SCD complications/comorbidities, and a versioned crisis treatment plan.
- **Connect** — (coming in Phase 2) a community of patients, families and specialists: stories, groups, fundraisers, and research & clinical trials.

See [`docs/PLAN.md`](docs/PLAN.md) for the full product and technical plan, and
[`docs/INTERVIEW_GUIDE.md`](docs/INTERVIEW_GUIDE.md) for using the prototype in interviews.

> **Status: Phase 1 prototype.** Data is stored **only on the device** and is **not encrypted**.
> Use the built-in demo data or made-up information — never real patient data — until the
> privacy and security work in Phase 4 of the plan is done.

---

## Run it

You need [Node.js](https://nodejs.org) (version 20 or newer).

```bash
npm install        # once, to download the libraries
npm run web        # opens the app in your web browser
```

To try it on a phone:

```bash
npm start          # shows a QR code
```

Then scan the QR code with the **Expo Go** app ([iOS](https://apps.apple.com/app/expo-go/id982107779) /
[Android](https://play.google.com/store/apps/details?id=host.exp.exponent)). Your phone and computer must be on the
same Wi-Fi network. (If Expo Go says the project's SDK version is not supported, update Expo Go.)

On first launch, choose **"Explore with demo data"** to see 6 months of made-up data for a fictional person, "Jordan".
You can reset at any time from **Profile → Delete all my data** or **Load demo data**.

## Check your work

```bash
npm run check      # runs all three below
npm run typecheck  # TypeScript: catches type mistakes
npm run lint       # ESLint: catches common bugs and style issues
npm test           # Jest: runs the unit tests
```

These also run automatically on GitHub for every push (see `.github/workflows/ci.yml`).

---

## How the code is organized

```
src/
  app/                 Screens. Each file is a page (Expo Router "file-based routing").
    _layout.tsx        Root: loads saved data, shows onboarding until a profile exists.
    onboarding.tsx     Welcome → privacy promises → demo or own profile.
    (tabs)/            The three bottom tabs: My Health (index), Connect, Profile.
    check-in.tsx       Daily check-in form.
    crises/            Crisis list, quick "I'm having a crisis" form, crisis details.
    medications/       Medication list, add form, details + dose logging.
    conditions/        Comorbidities/complications list, add form, details + episodes.
    plan/              Treatment plan, edit (creates a new version), printable ER card.
    insights.tsx       Charts and patterns.
  components/          Reusable building blocks (Button, Card, PainScale, BarChart, ...).
  domain/              The "rules" of the app, with no UI:
    types.ts           The shape of every record we store. Start reading here.
    catalog.ts         Lists of choices (genotypes, triggers, conditions, ...).
    plan.ts            Treatment plan versioning.
    insights.ts        Calculations for the Insights screen.
  data/
    store.ts           Where data lives and the actions that change it.
    demo-seed.ts       Generates the fictional demo data.
  i18n/
    en.ts              Every word the app shows, in English. Translations go next to it.
  theme/               Colors (light + dark), spacing, font sizes.
  lib/                 Small helpers (confirm dialogs, export, labels).
```

### How a feature works, end to end

Take "log a crisis":

1. **Screen** — `src/app/crises/new.tsx` shows the form and keeps what you tap in React state.
2. **Action** — pressing *Save* calls `useHealthStore.getState().addCrisis(...)` in `src/data/store.ts`.
3. **Store** — `addCrisis` gives the crisis an id, links it to the treatment-plan version that was in effect
   (using `planInEffectAt` from `src/domain/plan.ts`), and saves it. The store automatically writes to device storage.
4. **Other screens update** — every screen that reads `useHealthStore((s) => s.crises)` re-renders with the new crisis.

When we add a real backend, mostly step 3 changes — the screens stay the same.

### Where to start reading (if you're learning)

1. `src/domain/types.ts` — what we store.
2. `src/domain/plan.ts` and its test `src/domain/__tests__/plan.test.ts` — small, pure functions with tests.
3. `src/app/check-in.tsx` — a simple screen.
4. `src/data/store.ts` — how screens save data.
5. `src/app/crises/[id].tsx` — a bigger screen that edits existing data.

A good first change: add a new trigger (e.g. `'pollution'`) to `Trigger` in `types.ts`, `TRIGGERS` in `catalog.ts`,
and `triggers` in `i18n/en.ts`, then run `npm run check`. TypeScript will tell you if you missed a spot.

## Rules for contributors

- **Privacy first.** No analytics/ad SDKs, no sending health data anywhere, no real patient data in the repo or in
  test fixtures. Collect only what we use.
- **No hard-coded text in screens.** Put words in `src/i18n/en.ts` so the app can be translated later.
- **No hard-coded colors.** Use `useColors()` from `src/theme` so dark mode works.
- **Keep logic out of screens.** Calculations go in `src/domain/` with a unit test.
- **Accessibility.** Tap targets at least 44–48px; never use color alone to convey meaning; label inputs.
- Run `npm run check` before pushing.

## Notes for mentors / code reviewers

Things worth a careful look:

- `src/data/store.ts` — the persistence layer (zustand + AsyncStorage). This is the seam where a secure backend
  (planned: Supabase/Postgres with row-level security) will go.
- `src/domain/insights.ts` — the numbers patients will see; correctness matters.
- `src/data/demo-seed.ts` — the demo storyline used in interviews.
- Medical content (default plan text, warning signs in `src/i18n/en.ts`) should be reviewed by a clinician.
- Standard codes (ICD-10/SNOMED in `catalog.ts`, RxNorm on medications) are intentionally empty until a
  clinical reviewer maps them.

## Tech stack

[Expo](https://expo.dev) SDK 57 (React Native + web), TypeScript, Expo Router, zustand, i18next, Jest.
