/**
 * Helpers that turn stored ids into translated labels, e.g.
 * conditionName(t, condition) → "Acute chest syndrome".
 */
import type { TFunction } from 'i18next';

import en from '@/i18n/en';
import type { Condition } from '@/domain/types';

type Group = 'catalog' | 'genotypes' | 'roles' | 'bodyAreas' | 'triggers';

/** Translates `group.id`, falling back to the raw id for unknown values. */
export function label(t: TFunction, group: Group, id: string): string {
  const known = id in en[group];
  return known ? (t(`${group}.${id}` as never) as string) : id;
}

export function conditionName(t: TFunction, condition: Pick<Condition, 'catalogId' | 'customName'>): string {
  if (condition.catalogId === 'other' && condition.customName) return condition.customName;
  return label(t, 'catalog', condition.catalogId);
}
