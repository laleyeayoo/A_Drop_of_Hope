/**
 * Synthetic (made-up) demo data for interviews and testing.
 *
 * "Jordan" is a fictional adult with HbSS. Nothing here is a real person's
 * health information. The data is generated relative to `now` so the demo
 * always looks current, and uses a seeded random generator so it comes out the
 * same every time (which keeps tests stable).
 */
import { addDays } from '@/domain/dates';
import { planInEffectAt } from '@/domain/plan';
import type {
  BodyArea,
  CheckIn,
  Condition,
  ConditionEpisode,
  Crisis,
  DoseLog,
  HealthData,
  Medication,
  PainScore,
  PlanVersion,
  Trigger,
} from '@/domain/types';

/** Small deterministic pseudo-random generator (mulberry32). */
function seededRandom(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clampPain = (n: number) => Math.max(0, Math.min(10, Math.round(n))) as PainScore;

/** Sets a date to a specific local hour on the same day. */
function atHour(date: Date, hour: number): Date {
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d;
}

export function buildDemoData(now: Date = new Date()): HealthData {
  const rand = seededRandom(42);
  const pick = <T,>(items: T[]) => items[Math.floor(rand() * items.length)];
  const daysAgo = (n: number, hour = 9) => atHour(addDays(now, -n), hour).toISOString();

  // --- Medications --------------------------------------------------------
  const medications: Medication[] = [
    {
      id: 'demo-med-hydroxyurea',
      name: 'Hydroxyurea',
      dose: '1000 mg',
      frequency: 'Once a day',
      purpose: 'daily',
      startedOn: daysAgo(730).slice(0, 10),
    },
    {
      id: 'demo-med-folic',
      name: 'Folic acid',
      dose: '1 mg',
      frequency: 'Once a day',
      purpose: 'daily',
      startedOn: daysAgo(2000).slice(0, 10),
    },
    {
      id: 'demo-med-ibuprofen',
      name: 'Ibuprofen',
      dose: '400 mg',
      frequency: 'Every 6–8 hours as needed',
      purpose: 'as_needed',
    },
    {
      id: 'demo-med-oxycodone',
      name: 'Oxycodone',
      dose: '5 mg',
      frequency: 'Every 4–6 hours during a crisis',
      purpose: 'crisis',
    },
    {
      id: 'demo-med-morphine',
      name: 'Morphine (oral)',
      dose: '15 mg',
      frequency: 'Every 4 hours during a crisis',
      purpose: 'crisis',
      startedOn: daysAgo(900).slice(0, 10),
      stoppedOn: daysAgo(95).slice(0, 10),
      stopReason: 'Stopped controlling crisis pain; switched with hematologist',
    },
  ];

  // --- Treatment plan (two versions) --------------------------------------
  const planVersions: PlanVersion[] = [
    {
      id: 'demo-plan-v1',
      version: 1,
      createdAt: daysAgo(240),
      changeReason: 'First plan written with my hematologist',
      content: {
        homeSteps:
          'Drink 3+ liters of water. Heating pad on painful areas. Ibuprofen 400 mg every 6–8 hours. Rest and stay warm.',
        whenToGoToER:
          'Pain 7+ not improving after 4 hours at home, fever over 101°F (38.3°C), chest pain or trouble breathing, weakness or trouble speaking.',
        erPainMedicines: 'IV morphine per weight-based dosing; IV fluids.',
        medicinesToAvoid: 'Meperidine (Demerol).',
        allergies: 'Penicillin (rash).',
        hematologistName: 'Dr. A. Example (demo)',
        hematologistPhone: '(555) 010-0000',
        notesForERStaff:
          'I have HbSS sickle cell disease. Please treat pain within 60 minutes of arrival per NHLBI guidance. Baseline hemoglobin ~8 g/dL.',
      },
    },
  ];
  planVersions.push({
    id: 'demo-plan-v2',
    version: 2,
    createdAt: daysAgo(95),
    changeReason: 'Morphine stopped working well for me — hematologist switched the ER plan to hydromorphone.',
    content: {
      ...planVersions[0].content,
      erPainMedicines: 'IV hydromorphone (Dilaudid) per weight-based dosing; IV fluids. Morphine is less effective for me.',
      homeSteps:
        'Drink 3+ liters of water. Heating pad on painful areas. Ibuprofen 400 mg every 6–8 hours; oxycodone 5 mg if pain is 6+. Rest and stay warm.',
    },
  });

  // --- Crises ---------------------------------------------------------------
  // Crises are listed by hand so the story is clear: more ER visits under plan
  // v1, fewer and shorter crises after the plan changed.
  const crisisSpecs: {
    start: number;
    days: number;
    peak: number;
    setting: Crisis['setting'];
    areas: BodyArea[];
    triggers: Trigger[];
    wait?: number;
    admitted?: number;
    followed?: Crisis['planFollowed'];
    complications?: Crisis['complications'];
    morphineHelped?: 1 | 2 | 3 | 4 | 5;
    oxyHelped?: 1 | 2 | 3 | 4 | 5;
  }[] = [
    { start: 205, days: 4, peak: 9, setting: 'admitted', areas: ['back', 'legs'], triggers: ['cold'], wait: 140, admitted: 3, followed: 'partly', morphineHelped: 2 },
    { start: 168, days: 2, peak: 7, setting: 'home', areas: ['arms', 'joints'], triggers: ['stress', 'poor_sleep'], morphineHelped: 3 },
    { start: 131, days: 3, peak: 8, setting: 'er', areas: ['chest', 'back'], triggers: ['infection'], wait: 95, followed: 'no', complications: ['fever'], morphineHelped: 2 },
    { start: 108, days: 3, peak: 9, setting: 'admitted', areas: ['legs', 'back'], triggers: ['dehydration', 'exertion'], wait: 120, admitted: 2, followed: 'partly', morphineHelped: 1 },
    { start: 62, days: 2, peak: 7, setting: 'home', areas: ['legs'], triggers: ['cold'], oxyHelped: 4 },
    { start: 29, days: 2, peak: 8, setting: 'er', areas: ['back'], triggers: ['menstruation', 'stress'], wait: 45, followed: 'yes', oxyHelped: 3 },
    { start: 9, days: 1, peak: 6, setting: 'home', areas: ['arms', 'joints'], triggers: ['poor_sleep'], oxyHelped: 4 },
  ];

  const crises: Crisis[] = crisisSpecs.map((s, i) => {
    const startedAt = daysAgo(s.start, 22);
    const plan = planInEffectAt(planVersions, startedAt);
    const treatments: Crisis['treatments'] = [
      { id: `demo-ct-${i}-water`, name: 'Extra fluids', helped: 3 },
      { id: `demo-ct-${i}-heat`, name: 'Heating pad', helped: 4 },
    ];
    if (s.morphineHelped)
      treatments.push({ id: `demo-ct-${i}-mor`, medicationId: 'demo-med-morphine', name: 'Morphine (oral)', helped: s.morphineHelped });
    if (s.oxyHelped)
      treatments.push({ id: `demo-ct-${i}-oxy`, medicationId: 'demo-med-oxycodone', name: 'Oxycodone', helped: s.oxyHelped });
    return {
      id: `demo-crisis-${i}`,
      startedAt,
      endedAt: daysAgo(s.start - s.days, 18),
      peakPain: clampPain(s.peak),
      painAreas: s.areas,
      setting: s.setting,
      daysAdmitted: s.admitted,
      minutesToPainMedicine: s.wait,
      planVersionId: plan?.id,
      planFollowed: s.setting === 'home' ? undefined : s.followed,
      complications: s.complications ?? [],
      triggers: s.triggers,
      treatments,
    };
  });

  const inCrisis = (dayOffset: number) =>
    crisisSpecs.some((s) => dayOffset <= s.start && dayOffset >= s.start - s.days);

  // --- Daily check-ins -------------------------------------------------------
  const checkIns: CheckIn[] = [];
  const doseLogs: DoseLog[] = [];
  for (let d = 120; d >= 1; d--) {
    const crisisDay = inCrisis(d);
    if (!crisisDay && rand() < 0.2) continue; // people miss days — that's realistic
    const pain = clampPain(crisisDay ? 6 + rand() * 3 : rand() < 0.15 ? 3 + rand() * 2 : rand() * 3);
    const triggers: Trigger[] = rand() < 0.2 ? [pick<Trigger>(['cold', 'stress', 'poor_sleep', 'dehydration', 'exertion'])] : [];
    checkIns.push({
      id: `demo-checkin-${d}`,
      at: daysAgo(d, 20),
      pain,
      painAreas: pain >= 3 ? [pick<BodyArea>(['back', 'legs', 'arms', 'joints'])] : [],
      fatigue: Math.min(4, Math.round(pain / 2.5 + rand())) as CheckIn['fatigue'],
      mood: Math.max(1, Math.min(5, Math.round(5 - pain / 2.5 + rand() - 0.3))) as CheckIn['mood'],
      sleepHours: Math.round((crisisDay ? 4.5 : 6.5) + rand() * 2),
      waterGlasses: Math.round(4 + rand() * 6),
      triggers,
    });

    // Daily hydroxyurea dose log for the last 60 days (~88% taken).
    if (d <= 60) {
      const taken = rand() < 0.88;
      doseLogs.push({
        id: `demo-dose-hu-${d}`,
        medicationId: 'demo-med-hydroxyurea',
        at: daysAgo(d, 8),
        status: taken ? 'taken' : 'missed',
        effectiveness: taken && d % 7 === 0 ? (pick([3, 4, 4, 5]) as 3 | 4 | 5) : undefined,
      });
    }
    // Ibuprofen on moderate-pain days.
    if (pain >= 3 && pain <= 6) {
      doseLogs.push({
        id: `demo-dose-ibu-${d}`,
        medicationId: 'demo-med-ibuprofen',
        at: daysAgo(d, 14),
        status: 'taken',
        effectiveness: pick([2, 3, 3, 4]) as 2 | 3 | 4,
      });
    }
  }

  // --- Comorbidities ---------------------------------------------------------
  const conditions: Condition[] = [
    { id: 'demo-cond-acs', catalogId: 'acute_chest_syndrome', diagnosedOn: '2014', status: 'managed', note: 'Three episodes so far. Incentive spirometer during admissions.' },
    { id: 'demo-cond-avn', catalogId: 'avascular_necrosis', diagnosedOn: '2023-03', status: 'active', note: 'Left hip. Seeing orthopedics; physical therapy twice a week.' },
    { id: 'demo-cond-pain', catalogId: 'chronic_pain', diagnosedOn: '2020', status: 'active', note: 'Daily lower back and leg pain between crises.' },
    { id: 'demo-cond-gall', catalogId: 'gallstones', diagnosedOn: '2018', status: 'resolved', note: 'Gallbladder removed in 2019.' },
  ];
  const episodes: ConditionEpisode[] = [
    { id: 'demo-ep-acs-1', conditionId: 'demo-cond-acs', occurredOn: '2014-11-02', severity: 'severe', treatment: 'ICU stay, exchange transfusion' },
    { id: 'demo-ep-acs-2', conditionId: 'demo-cond-acs', occurredOn: '2021-01-15', severity: 'moderate', treatment: 'Antibiotics, oxygen, simple transfusion' },
    { id: 'demo-ep-acs-3', conditionId: 'demo-cond-acs', occurredOn: daysAgo(131).slice(0, 10), severity: 'mild', treatment: 'Antibiotics, incentive spirometer', note: 'Started during a pain crisis with fever.' },
    { id: 'demo-ep-avn-1', conditionId: 'demo-cond-avn', occurredOn: daysAgo(45).slice(0, 10), severity: 'moderate', treatment: 'PT, ibuprofen', note: 'Hip pain flared after a long walk.' },
  ];

  return {
    profile: {
      name: 'Jordan (demo)',
      role: 'patient',
      genotype: 'HbSS',
      birthYear: 1998,
      sex: 'prefer_not_to_say',
      region: 'Tennessee',
      hematologist: 'Dr. A. Example (demo)',
      createdAt: daysAgo(240),
    },
    isDemo: true,
    privacyAcknowledgedAt: now.toISOString(),
    checkIns: checkIns.reverse(), // newest first
    crises: crises.reverse(),
    medications,
    doseLogs: doseLogs.reverse(),
    conditions,
    episodes,
    planVersions,
  };
}
