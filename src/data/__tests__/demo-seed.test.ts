import { buildDemoData } from '../demo-seed';

describe('demo data', () => {
  const now = new Date(2026, 9, 15, 12);
  const data = buildDemoData(now);

  it('is marked as demo data', () => {
    expect(data.isDemo).toBe(true);
    expect(data.profile?.name).toContain('demo');
  });

  it('is the same every time for the same date', () => {
    expect(buildDemoData(now)).toEqual(data);
  });

  it('only references records that exist', () => {
    const medIds = new Set(data.medications.map((m) => m.id));
    const planIds = new Set(data.planVersions.map((p) => p.id));
    const conditionIds = new Set(data.conditions.map((c) => c.id));
    for (const d of data.doseLogs) expect(medIds.has(d.medicationId)).toBe(true);
    for (const e of data.episodes) expect(conditionIds.has(e.conditionId)).toBe(true);
    for (const c of data.crises) {
      expect(c.planVersionId && planIds.has(c.planVersionId)).toBe(true);
      for (const t of c.treatments) if (t.medicationId) expect(medIds.has(t.medicationId)).toBe(true);
    }
  });

  it('has valid pain scores and no dates in the future', () => {
    for (const c of data.checkIns) {
      expect(c.pain).toBeGreaterThanOrEqual(0);
      expect(c.pain).toBeLessThanOrEqual(10);
      expect(new Date(c.at).getTime()).toBeLessThanOrEqual(now.getTime());
    }
    for (const c of data.crises) expect(new Date(c.endedAt!).getTime()).toBeLessThanOrEqual(now.getTime());
  });

  it('links crises to the plan version in effect at the time', () => {
    const v2 = data.planVersions.find((p) => p.version === 2)!;
    for (const c of data.crises) {
      const expected = c.startedAt >= v2.createdAt ? v2.id : 'demo-plan-v1';
      expect(c.planVersionId).toBe(expected);
    }
  });
});
