/**
 * Calculations behind the Insights screen. These are pure functions (same input
 * → same output, no side effects) so they are easy to unit test.
 */
import { addDays, dayKey, daysBetween, monthKey } from './dates';
import type { CheckIn, Crisis, DoseLog, PlanVersion, Trigger } from './types';

export interface MonthCount {
  month: string; // "YYYY-MM"
  count: number;
}

/** Number of crises that started in each of the last `months` months (oldest first). */
export function crisesPerMonth(crises: Crisis[], months: number, now: Date = new Date()): MonthCount[] {
  const result: MonthCount[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ month: monthKey(d), count: 0 });
  }
  const index = new Map(result.map((r, i) => [r.month, i]));
  for (const c of crises) {
    const i = index.get(monthKey(c.startedAt));
    if (i !== undefined) result[i].count += 1;
  }
  return result;
}

export interface DayPain {
  day: string; // "YYYY-MM-DD"
  /** Highest pain logged that day, or undefined if nothing was logged. */
  pain?: number;
}

/** Highest pain per day over the last `days` days (oldest first). */
export function dailyPain(checkIns: CheckIn[], days: number, now: Date = new Date()): DayPain[] {
  const byDay = new Map<string, number>();
  for (const c of checkIns) {
    const key = dayKey(c.at);
    byDay.set(key, Math.max(byDay.get(key) ?? 0, c.pain));
  }
  const result: DayPain[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = dayKey(addDays(now, -i));
    result.push({ day: key, pain: byDay.get(key) });
  }
  return result;
}

export function average(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Records with a timestamp within the last `days` days. */
export function withinDays<T>(items: T[], getDate: (item: T) => string, days: number, now: Date = new Date()): T[] {
  return items.filter((item) => {
    const age = daysBetween(getDate(item), now);
    return age >= 0 && age <= days;
  });
}

/** Crisis length in days (fractional). Ongoing crises are measured up to `now`. */
export function crisisDurationDays(crisis: Crisis, now: Date = new Date()): number {
  return daysBetween(crisis.startedAt, crisis.endedAt ?? now);
}

export interface TriggerCount {
  trigger: Trigger;
  count: number;
}

/** How often each trigger was reported across check-ins and crises, most common first. */
export function topTriggers(checkIns: CheckIn[], crises: Crisis[]): TriggerCount[] {
  const counts = new Map<Trigger, number>();
  for (const t of [...checkIns.flatMap((c) => c.triggers), ...crises.flatMap((c) => c.triggers)]) {
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count);
}

export interface MedicationSummary {
  taken: number;
  missed: number;
  /** Share of logged doses that were taken, 0–1. */
  adherence?: number;
  /** Average 1–5 effectiveness rating. */
  averageEffectiveness?: number;
}

export function summarizeDoses(logs: DoseLog[], medicationId: string): MedicationSummary {
  const mine = logs.filter((l) => l.medicationId === medicationId);
  const taken = mine.filter((l) => l.status === 'taken').length;
  const missed = mine.length - taken;
  const ratings = mine.flatMap((l) => (l.effectiveness ? [l.effectiveness] : []));
  return {
    taken,
    missed,
    adherence: mine.length ? taken / mine.length : undefined,
    averageEffectiveness: average(ratings),
  };
}

/** Average "how much did it help" rating for a medication across all crises. */
export function crisisHelpRating(crises: Crisis[], medicationId: string): number | undefined {
  return average(
    crises.flatMap((c) =>
      c.treatments.filter((t) => t.medicationId === medicationId && t.helped).map((t) => t.helped!)
    )
  );
}

export interface PlanOutcome {
  planVersionId: string;
  version: number;
  crises: number;
  averagePeakPain?: number;
  /** Share of crises that needed the ER or a hospital stay, 0–1. */
  hospitalRate?: number;
  averageDays?: number;
}

/** Compares how crises went under each version of the treatment plan. */
export function outcomesByPlanVersion(
  crises: Crisis[],
  versions: PlanVersion[],
  now: Date = new Date()
): PlanOutcome[] {
  return [...versions]
    .sort((a, b) => a.version - b.version)
    .map((v) => {
      const mine = crises.filter((c) => c.planVersionId === v.id);
      const hospital = mine.filter((c) => c.setting === 'er' || c.setting === 'admitted').length;
      return {
        planVersionId: v.id,
        version: v.version,
        crises: mine.length,
        averagePeakPain: average(mine.map((c) => c.peakPain)),
        hospitalRate: mine.length ? hospital / mine.length : undefined,
        averageDays: average(mine.map((c) => crisisDurationDays(c, now))),
      };
    });
}
