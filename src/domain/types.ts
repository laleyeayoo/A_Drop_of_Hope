/**
 * Core health-tracking data types.
 *
 * These are the shapes of everything the app stores. They are written so they
 * can later map onto database tables (see docs/PLAN.md, "Data model").
 *
 * Conventions:
 * - Every record has a string `id`.
 * - Dates/times are ISO 8601 strings (e.g. "2026-10-05T14:30:00.000Z").
 *   Calendar-only dates use "YYYY-MM-DD".
 * - Lists of choices (genotypes, triggers, ...) are string unions so the
 *   TypeScript compiler catches typos. Their human-readable labels live in the
 *   translation file (src/i18n/en.ts), never in code.
 */

export type Role = 'patient' | 'caregiver';

export type Genotype = 'HbSS' | 'HbSC' | 'HbSB0' | 'HbSBplus' | 'other' | 'unknown';

export type Sex = 'female' | 'male' | 'intersex' | 'prefer_not_to_say';

export type BodyArea =
  | 'head'
  | 'chest'
  | 'back'
  | 'abdomen'
  | 'arms'
  | 'legs'
  | 'joints'
  | 'all_over';

export type Trigger =
  | 'cold'
  | 'heat'
  | 'dehydration'
  | 'stress'
  | 'infection'
  | 'exertion'
  | 'poor_sleep'
  | 'menstruation'
  | 'travel_altitude'
  | 'alcohol'
  | 'other';

/** 0 = no pain, 10 = worst pain imaginable. */
export type PainScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** 1 = did not help at all, 5 = helped a lot. */
export type HelpRating = 1 | 2 | 3 | 4 | 5;

export interface Profile {
  /** First name or nickname — shown only on this device. */
  name: string;
  role: Role;
  /** When role is 'caregiver', who they are tracking for (e.g. "My son, Ade"). */
  caringFor?: string;
  genotype: Genotype;
  birthYear?: number;
  sex?: Sex;
  /** Coarse location only (US state or country region). Never GPS. */
  region?: string;
  hematologist?: string;
  createdAt: string;
}

/** A quick daily (or any-time) check-in. */
export interface CheckIn {
  id: string;
  at: string;
  pain: PainScore;
  painAreas: BodyArea[];
  /** 0 = none, 4 = exhausted */
  fatigue: 0 | 1 | 2 | 3 | 4;
  /** 1 = very low, 5 = great */
  mood: 1 | 2 | 3 | 4 | 5;
  sleepHours?: number;
  /** Glasses (~8 oz / 250 ml) of water. */
  waterGlasses?: number;
  triggers: Trigger[];
  note?: string;
}

export type CareSetting = 'home' | 'urgent_care' | 'er' | 'admitted';

export type PlanFollowed = 'yes' | 'partly' | 'no' | 'unknown';

export type CrisisComplication =
  | 'fever'
  | 'chest_pain_breathing'
  | 'severe_headache_or_weakness'
  | 'abdominal_swelling'
  | 'priapism'
  | 'needed_transfusion'
  | 'other';

export interface CrisisTreatment {
  id: string;
  /** Link to a medication in the user's list, if it is one. */
  medicationId?: string;
  /** Free-text name, e.g. "Heating pad", "IV fluids", or the med name. */
  name: string;
  helped?: HelpRating;
}

/** A vaso-occlusive (pain) crisis episode. */
export interface Crisis {
  id: string;
  startedAt: string;
  /** Empty while the crisis is ongoing. */
  endedAt?: string;
  peakPain: PainScore;
  painAreas: BodyArea[];
  /** The highest level of care needed. */
  setting: CareSetting;
  daysAdmitted?: number;
  /** For ER/urgent care visits: minutes from arrival until first pain medicine. */
  minutesToPainMedicine?: number;
  /** Which version of the treatment plan was active when the crisis began. */
  planVersionId?: string;
  planFollowed?: PlanFollowed;
  complications: CrisisComplication[];
  triggers: Trigger[];
  treatments: CrisisTreatment[];
  note?: string;
}

export type MedicationPurpose = 'daily' | 'as_needed' | 'crisis';

export interface Medication {
  id: string;
  name: string;
  /** Free text for now, e.g. "500 mg". */
  dose?: string;
  /** Free text for now, e.g. "Once a day". */
  frequency?: string;
  purpose: MedicationPurpose;
  startedOn?: string;
  stoppedOn?: string;
  stopReason?: string;
  /**
   * Standard RxNorm concept ID. Left empty in the prototype; will be filled
   * once we add a medication search backed by the RxNorm vocabulary.
   */
  rxnormCode?: string;
}

export type DoseStatus = 'taken' | 'missed';

export interface DoseLog {
  id: string;
  medicationId: string;
  at: string;
  status: DoseStatus;
  effectiveness?: HelpRating;
  sideEffects?: string;
}

export type ConditionStatus = 'active' | 'managed' | 'resolved';

export type Severity = 'mild' | 'moderate' | 'severe';

/** A comorbidity or complication of SCD that the person lives with. */
export interface Condition {
  id: string;
  /** Key into the catalog in src/domain/catalog.ts. */
  catalogId: string;
  /** Used when catalogId is 'other'. */
  customName?: string;
  /** "YYYY" or "YYYY-MM-DD" — people often only remember the year. */
  diagnosedOn?: string;
  status: ConditionStatus;
  note?: string;
}

/** One occurrence/flare of a condition (e.g. an episode of acute chest syndrome). */
export interface ConditionEpisode {
  id: string;
  conditionId: string;
  occurredOn: string;
  severity: Severity;
  treatment?: string;
  note?: string;
}

/** The content of a crisis treatment plan. */
export interface PlanContent {
  homeSteps: string;
  whenToGoToER: string;
  erPainMedicines: string;
  medicinesToAvoid: string;
  allergies: string;
  hematologistName: string;
  hematologistPhone: string;
  notesForERStaff: string;
}

/**
 * Treatment plans are never edited in place. Each change creates a new version
 * so the history (and the reason for each change) is preserved.
 */
export interface PlanVersion {
  id: string;
  version: number;
  createdAt: string;
  changeReason: string;
  content: PlanContent;
}

/** Everything the app stores for one person. */
export interface HealthData {
  profile?: Profile;
  /** True when the data was generated by the demo seed, not entered by a person. */
  isDemo: boolean;
  privacyAcknowledgedAt?: string;
  checkIns: CheckIn[];
  crises: Crisis[];
  medications: Medication[];
  doseLogs: DoseLog[];
  conditions: Condition[];
  episodes: ConditionEpisode[];
  planVersions: PlanVersion[];
}
