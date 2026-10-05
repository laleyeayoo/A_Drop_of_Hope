/** Helpers for versioned crisis treatment plans. */
import type { PlanContent, PlanVersion } from './types';

export const EMPTY_PLAN: PlanContent = {
  homeSteps: '',
  whenToGoToER: '',
  erPainMedicines: '',
  medicinesToAvoid: '',
  allergies: '',
  hematologistName: '',
  hematologistPhone: '',
  notesForERStaff: '',
};

export const PLAN_FIELDS: (keyof PlanContent)[] = [
  'homeSteps',
  'whenToGoToER',
  'erPainMedicines',
  'medicinesToAvoid',
  'allergies',
  'hematologistName',
  'hematologistPhone',
  'notesForERStaff',
];

/** The newest version, or undefined if the person has no plan yet. */
export function currentPlan(versions: PlanVersion[]): PlanVersion | undefined {
  return versions.reduce<PlanVersion | undefined>(
    (latest, v) => (!latest || v.version > latest.version ? v : latest),
    undefined
  );
}

/** Versions sorted newest first. */
export function planHistory(versions: PlanVersion[]): PlanVersion[] {
  return [...versions].sort((a, b) => b.version - a.version);
}

/** Which fields differ between two plan contents. */
export function changedFields(before: PlanContent, after: PlanContent): (keyof PlanContent)[] {
  return PLAN_FIELDS.filter((field) => before[field].trim() !== after[field].trim());
}

/** The version that was in effect at a given moment (the newest one created before it). */
export function planInEffectAt(versions: PlanVersion[], at: string): PlanVersion | undefined {
  const time = new Date(at).getTime();
  return currentPlan(versions.filter((v) => new Date(v.createdAt).getTime() <= time));
}

/**
 * Builds the next version of a plan. Returns undefined when nothing changed,
 * so we never store duplicate versions.
 */
export function buildNextVersion(
  versions: PlanVersion[],
  content: PlanContent,
  changeReason: string,
  id: string,
  now: Date = new Date()
): PlanVersion | undefined {
  const latest = currentPlan(versions);
  if (latest && changedFields(latest.content, content).length === 0) return undefined;
  return {
    id,
    version: (latest?.version ?? 0) + 1,
    createdAt: now.toISOString(),
    changeReason: changeReason.trim(),
    content: { ...content },
  };
}
