import { buildNextVersion, changedFields, currentPlan, EMPTY_PLAN, planInEffectAt } from '../plan';
import type { PlanVersion } from '../types';

const v = (version: number, createdAt: string, homeSteps = `steps ${version}`): PlanVersion => ({
  id: `v${version}`,
  version,
  createdAt,
  changeReason: '',
  content: { ...EMPTY_PLAN, homeSteps },
});

describe('treatment plan versioning', () => {
  it('creates version 1 when there is no plan yet', () => {
    const next = buildNextVersion([], { ...EMPTY_PLAN, allergies: 'Penicillin' }, '  First plan ', 'id1');
    expect(next?.version).toBe(1);
    expect(next?.changeReason).toBe('First plan');
  });

  it('increments the version number and keeps the old versions untouched', () => {
    const versions = [v(1, '2026-01-01T00:00:00Z'), v(2, '2026-03-01T00:00:00Z')];
    const next = buildNextVersion(versions, { ...EMPTY_PLAN, homeSteps: 'new' }, 'changed', 'id3');
    expect(next?.version).toBe(3);
    expect(versions).toHaveLength(2);
  });

  it('does not create a version when nothing changed', () => {
    const versions = [v(1, '2026-01-01T00:00:00Z', 'same')];
    expect(buildNextVersion(versions, { ...EMPTY_PLAN, homeSteps: 'same ' }, 'x', 'id2')).toBeUndefined();
  });

  it('finds the current plan and the plan in effect at a given time', () => {
    const versions = [v(2, '2026-03-01T00:00:00Z'), v(1, '2026-01-01T00:00:00Z')];
    expect(currentPlan(versions)?.version).toBe(2);
    expect(planInEffectAt(versions, '2026-02-01T00:00:00Z')?.version).toBe(1);
    expect(planInEffectAt(versions, '2025-12-01T00:00:00Z')).toBeUndefined();
  });

  it('lists changed fields', () => {
    expect(changedFields(EMPTY_PLAN, { ...EMPTY_PLAN, allergies: 'x', homeSteps: 'y' })).toEqual([
      'homeSteps',
      'allergies',
    ]);
  });
});
