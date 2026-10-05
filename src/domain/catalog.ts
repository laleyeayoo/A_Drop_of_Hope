/**
 * Lists of choices shown in the app. Labels are translated in src/i18n/en.ts
 * using these ids as keys (e.g. `conditions.acute_chest_syndrome`).
 */
import type {
  BodyArea,
  CareSetting,
  CrisisComplication,
  Genotype,
  MedicationPurpose,
  PlanFollowed,
  Severity,
  Sex,
  Trigger,
  ConditionStatus,
} from './types';

export const GENOTYPES: Genotype[] = ['HbSS', 'HbSC', 'HbSB0', 'HbSBplus', 'other', 'unknown'];
export const SEXES: Sex[] = ['female', 'male', 'intersex', 'prefer_not_to_say'];
export const BODY_AREAS: BodyArea[] = [
  'head',
  'chest',
  'back',
  'abdomen',
  'arms',
  'legs',
  'joints',
  'all_over',
];
export const TRIGGERS: Trigger[] = [
  'cold',
  'heat',
  'dehydration',
  'stress',
  'infection',
  'exertion',
  'poor_sleep',
  'menstruation',
  'travel_altitude',
  'alcohol',
  'other',
];
export const CARE_SETTINGS: CareSetting[] = ['home', 'urgent_care', 'er', 'admitted'];
export const PLAN_FOLLOWED: PlanFollowed[] = ['yes', 'partly', 'no', 'unknown'];
export const COMPLICATIONS: CrisisComplication[] = [
  'fever',
  'chest_pain_breathing',
  'severe_headache_or_weakness',
  'abdominal_swelling',
  'priapism',
  'needed_transfusion',
  'other',
];
export const MED_PURPOSES: MedicationPurpose[] = ['daily', 'as_needed', 'crisis'];
export const CONDITION_STATUSES: ConditionStatus[] = ['active', 'managed', 'resolved'];
export const SEVERITIES: Severity[] = ['mild', 'moderate', 'severe'];

export interface CatalogCondition {
  id: string;
  /**
   * Standard codes (ICD-10-CM / SNOMED CT) so the data can be used for research
   * later. Intentionally left empty in the prototype: codes must be chosen and
   * verified by a clinical reviewer (several SCD codes depend on genotype).
   */
  codes: { icd10?: string[]; snomed?: string[] };
}

/** SCD comorbidities and complications people can track. */
export const CONDITION_CATALOG: CatalogCondition[] = [
  { id: 'acute_chest_syndrome', codes: {} },
  { id: 'splenic_sequestration', codes: {} },
  { id: 'asplenia', codes: {} },
  { id: 'stroke', codes: {} },
  { id: 'silent_cerebral_infarct', codes: {} },
  { id: 'avascular_necrosis', codes: {} },
  { id: 'chronic_pain', codes: {} },
  { id: 'priapism', codes: {} },
  { id: 'leg_ulcers', codes: {} },
  { id: 'retinopathy', codes: {} },
  { id: 'kidney_disease', codes: {} },
  { id: 'pulmonary_hypertension', codes: {} },
  { id: 'gallstones', codes: {} },
  { id: 'iron_overload', codes: {} },
  { id: 'frequent_infections', codes: {} },
  { id: 'depression_anxiety', codes: {} },
  { id: 'other', codes: {} },
];
