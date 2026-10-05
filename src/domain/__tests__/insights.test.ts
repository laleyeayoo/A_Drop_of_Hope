import {
  crisesPerMonth,
  dailyPain,
  outcomesByPlanVersion,
  summarizeDoses,
  topTriggers,
} from '../insights';
import { EMPTY_PLAN } from '../plan';
import type { CheckIn, Crisis, DoseLog } from '../types';

const NOW = new Date(2026, 9, 15, 12); // Oct 15 2026, local time

const crisis = (startedAt: Date, extra: Partial<Crisis> = {}): Crisis => ({
  id: String(startedAt.getTime()),
  startedAt: startedAt.toISOString(),
  peakPain: 8,
  painAreas: [],
  setting: 'home',
  complications: [],
  triggers: [],
  treatments: [],
  ...extra,
});

const checkIn = (at: Date, pain: CheckIn['pain'], triggers: CheckIn['triggers'] = []): CheckIn => ({
  id: String(at.getTime()) + pain,
  at: at.toISOString(),
  pain,
  painAreas: [],
  fatigue: 0,
  mood: 3,
  triggers,
});

describe('crisesPerMonth', () => {
  it('counts crises per month for the last N months, oldest first', () => {
    const result = crisesPerMonth(
      [crisis(new Date(2026, 9, 2)), crisis(new Date(2026, 9, 10)), crisis(new Date(2026, 7, 5)), crisis(new Date(2025, 1, 1))],
      3,
      NOW
    );
    expect(result).toEqual([
      { month: '2026-08', count: 1 },
      { month: '2026-09', count: 0 },
      { month: '2026-10', count: 2 },
    ]);
  });
});

describe('dailyPain', () => {
  it('keeps the highest pain per day and leaves gaps for days with no log', () => {
    const result = dailyPain(
      [checkIn(new Date(2026, 9, 15, 8), 2), checkIn(new Date(2026, 9, 15, 20), 6), checkIn(new Date(2026, 9, 13, 9), 1)],
      3,
      NOW
    );
    expect(result).toEqual([
      { day: '2026-10-13', pain: 1 },
      { day: '2026-10-14', pain: undefined },
      { day: '2026-10-15', pain: 6 },
    ]);
  });
});

describe('topTriggers', () => {
  it('combines check-in and crisis triggers, most common first', () => {
    const result = topTriggers(
      [checkIn(NOW, 1, ['cold']), checkIn(NOW, 1, ['stress', 'cold'])],
      [crisis(NOW, { triggers: ['cold', 'dehydration'] })]
    );
    expect(result[0]).toEqual({ trigger: 'cold', count: 3 });
    expect(result).toHaveLength(3);
  });
});

describe('summarizeDoses', () => {
  it('computes adherence and average effectiveness for one medication', () => {
    const logs: DoseLog[] = [
      { id: '1', medicationId: 'a', at: '', status: 'taken', effectiveness: 4 },
      { id: '2', medicationId: 'a', at: '', status: 'taken', effectiveness: 2 },
      { id: '3', medicationId: 'a', at: '', status: 'missed' },
      { id: '4', medicationId: 'b', at: '', status: 'missed' },
    ];
    expect(summarizeDoses(logs, 'a')).toEqual({ taken: 2, missed: 1, adherence: 2 / 3, averageEffectiveness: 3 });
    expect(summarizeDoses(logs, 'none').adherence).toBeUndefined();
  });
});

describe('outcomesByPlanVersion', () => {
  it('summarizes crises under each plan version', () => {
    const versions = [
      { id: 'p1', version: 1, createdAt: '', changeReason: '', content: EMPTY_PLAN },
      { id: 'p2', version: 2, createdAt: '', changeReason: '', content: EMPTY_PLAN },
    ];
    const start = new Date(2026, 0, 1);
    const end = new Date(2026, 0, 3);
    const result = outcomesByPlanVersion(
      [
        crisis(start, { planVersionId: 'p1', setting: 'er', peakPain: 9, endedAt: end.toISOString() }),
        crisis(start, { planVersionId: 'p1', setting: 'home', peakPain: 7, endedAt: end.toISOString() }),
      ],
      versions,
      NOW
    );
    expect(result[0]).toMatchObject({ version: 1, crises: 2, averagePeakPain: 8, hospitalRate: 0.5, averageDays: 2 });
    expect(result[1]).toMatchObject({ version: 2, crises: 0, hospitalRate: undefined });
  });
});
