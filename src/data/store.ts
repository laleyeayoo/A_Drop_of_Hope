/**
 * The app's data store.
 *
 * PROTOTYPE STORAGE: everything is saved only on this device (AsyncStorage —
 * localStorage on the web). Nothing is sent to a server. This storage is NOT
 * encrypted, which is why the prototype asks people to use demo data rather
 * than real health information. In a later phase this file's actions will
 * call a secure backend instead (see docs/PLAN.md).
 *
 * Screens read data with `useHealthStore(state => state.something)` and change
 * it by calling the actions below, e.g. `useHealthStore.getState().addCheckIn(...)`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { newId } from '@/domain/ids';
import { buildNextVersion, planInEffectAt } from '@/domain/plan';
import type {
  CheckIn,
  Condition,
  ConditionEpisode,
  Crisis,
  DoseLog,
  HealthData,
  Medication,
  PlanContent,
  PlanVersion,
  Profile,
} from '@/domain/types';

import { buildDemoData } from './demo-seed';

/** A new record before it has an id. */
type New<T extends { id: string }> = Omit<T, 'id'>;

const EMPTY: HealthData = {
  profile: undefined,
  isDemo: false,
  privacyAcknowledgedAt: undefined,
  checkIns: [],
  crises: [],
  medications: [],
  doseLogs: [],
  conditions: [],
  episodes: [],
  planVersions: [],
};

interface Actions {
  completeOnboarding: (profile: Profile) => void;
  updateProfile: (changes: Partial<Profile>) => void;
  loadDemoData: () => void;
  deleteAllData: () => void;

  addCheckIn: (checkIn: New<CheckIn>) => void;
  deleteCheckIn: (id: string) => void;

  /** Saves a crisis and links it to the treatment plan in effect when it started. */
  addCrisis: (crisis: Omit<New<Crisis>, 'planVersionId'>) => string;
  updateCrisis: (id: string, changes: Partial<Crisis>) => void;
  deleteCrisis: (id: string) => void;

  addMedication: (medication: New<Medication>) => string;
  updateMedication: (id: string, changes: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  logDose: (dose: New<DoseLog>) => void;

  addCondition: (condition: New<Condition>) => string;
  updateCondition: (id: string, changes: Partial<Condition>) => void;
  deleteCondition: (id: string) => void;
  addEpisode: (episode: New<ConditionEpisode>) => void;
  deleteEpisode: (id: string) => void;

  /** Saves a new plan version. Returns it, or undefined if nothing changed. */
  savePlan: (content: PlanContent, changeReason: string) => PlanVersion | undefined;
}

export type HealthStore = HealthData & Actions;

const newestFirst = <T,>(items: T[], date: (item: T) => string) =>
  [...items].sort((a, b) => date(b).localeCompare(date(a)));

export const useHealthStore = create<HealthStore>()(
  persist(
    (set, get) => ({
      ...EMPTY,

      completeOnboarding: (profile) =>
        set({ ...EMPTY, profile, isDemo: false, privacyAcknowledgedAt: new Date().toISOString() }),
      updateProfile: (changes) => {
        const profile = get().profile;
        if (profile) set({ profile: { ...profile, ...changes } });
      },
      loadDemoData: () => set(buildDemoData()),
      deleteAllData: () => set(EMPTY),

      addCheckIn: (checkIn) =>
        set((s) => ({ checkIns: newestFirst([{ ...checkIn, id: newId() }, ...s.checkIns], (c) => c.at) })),
      deleteCheckIn: (id) => set((s) => ({ checkIns: s.checkIns.filter((c) => c.id !== id) })),

      addCrisis: (crisis) => {
        const id = newId();
        const planVersionId = planInEffectAt(get().planVersions, crisis.startedAt)?.id;
        set((s) => ({
          crises: newestFirst([{ ...crisis, id, planVersionId }, ...s.crises], (c) => c.startedAt),
        }));
        return id;
      },
      updateCrisis: (id, changes) =>
        set((s) => ({ crises: s.crises.map((c) => (c.id === id ? { ...c, ...changes, id } : c)) })),
      deleteCrisis: (id) => set((s) => ({ crises: s.crises.filter((c) => c.id !== id) })),

      addMedication: (medication) => {
        const id = newId();
        set((s) => ({ medications: [...s.medications, { ...medication, id }] }));
        return id;
      },
      updateMedication: (id, changes) =>
        set((s) => ({
          medications: s.medications.map((m) => (m.id === id ? { ...m, ...changes, id } : m)),
        })),
      deleteMedication: (id) =>
        set((s) => ({
          medications: s.medications.filter((m) => m.id !== id),
          doseLogs: s.doseLogs.filter((d) => d.medicationId !== id),
        })),
      logDose: (dose) =>
        set((s) => ({ doseLogs: newestFirst([{ ...dose, id: newId() }, ...s.doseLogs], (d) => d.at) })),

      addCondition: (condition) => {
        const id = newId();
        set((s) => ({ conditions: [...s.conditions, { ...condition, id }] }));
        return id;
      },
      updateCondition: (id, changes) =>
        set((s) => ({
          conditions: s.conditions.map((c) => (c.id === id ? { ...c, ...changes, id } : c)),
        })),
      deleteCondition: (id) =>
        set((s) => ({
          conditions: s.conditions.filter((c) => c.id !== id),
          episodes: s.episodes.filter((e) => e.conditionId !== id),
        })),
      addEpisode: (episode) =>
        set((s) => ({
          episodes: newestFirst([{ ...episode, id: newId() }, ...s.episodes], (e) => e.occurredOn),
        })),
      deleteEpisode: (id) => set((s) => ({ episodes: s.episodes.filter((e) => e.id !== id) })),

      savePlan: (content, changeReason) => {
        const next = buildNextVersion(get().planVersions, content, changeReason, newId());
        if (next) set((s) => ({ planVersions: [...s.planVersions, next] }));
        return next;
      },
    }),
    {
      name: 'a-drop-of-hope/health',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Only save data, not the action functions.
      partialize: ({ profile, isDemo, privacyAcknowledgedAt, checkIns, crises, medications, doseLogs, conditions, episodes, planVersions }) => ({
        profile,
        isDemo,
        privacyAcknowledgedAt,
        checkIns,
        crises,
        medications,
        doseLogs,
        conditions,
        episodes,
        planVersions,
      }),
    }
  )
);

/** Everything stored, as plain data (used for "Export my data"). */
export function exportData(): HealthData {
  const { profile, isDemo, privacyAcknowledgedAt, checkIns, crises, medications, doseLogs, conditions, episodes, planVersions } =
    useHealthStore.getState();
  return { profile, isDemo, privacyAcknowledgedAt, checkIns, crises, medications, doseLogs, conditions, episodes, planVersions };
}

/** True once saved data has been loaded from device storage. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useHealthStore.persist.onFinishHydration(onChange),
    () => useHealthStore.persist.hasHydrated(),
    () => false
  );
}
