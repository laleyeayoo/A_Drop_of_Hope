import { EMPTY_PLAN } from '@/domain/plan';

import { exportData, useHealthStore } from '../store';

const store = () => useHealthStore.getState();

beforeEach(() => store().deleteAllData());

describe('health store', () => {
  it('links a new crisis to the plan version in effect when it started', () => {
    store().savePlan({ ...EMPTY_PLAN, homeSteps: 'Fluids' }, 'first');
    const id = store().addCrisis({
      startedAt: new Date().toISOString(),
      peakPain: 7,
      painAreas: ['back'],
      setting: 'home',
      complications: [],
      triggers: [],
      treatments: [],
    });
    const crisis = store().crises.find((c) => c.id === id);
    expect(crisis?.planVersionId).toBe(store().planVersions[0].id);
  });

  it('keeps every plan version and skips saves with no changes', () => {
    store().savePlan({ ...EMPTY_PLAN, homeSteps: 'A' }, 'first');
    store().savePlan({ ...EMPTY_PLAN, homeSteps: 'B' }, 'A stopped working');
    expect(store().savePlan({ ...EMPTY_PLAN, homeSteps: 'B' }, 'no change')).toBeUndefined();
    expect(store().planVersions.map((v) => v.version)).toEqual([1, 2]);
  });

  it('deleting a medication also deletes its dose logs', () => {
    const id = store().addMedication({ name: 'Test', purpose: 'daily' });
    store().logDose({ medicationId: id, at: new Date().toISOString(), status: 'taken' });
    store().deleteMedication(id);
    expect(store().doseLogs).toHaveLength(0);
  });

  it('can load demo data and then delete everything', () => {
    store().loadDemoData();
    expect(exportData().isDemo).toBe(true);
    expect(exportData().crises.length).toBeGreaterThan(0);
    store().deleteAllData();
    expect(exportData().profile).toBeUndefined();
    expect(exportData().crises).toHaveLength(0);
  });
});
