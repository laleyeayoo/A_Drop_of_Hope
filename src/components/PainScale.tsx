import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import type { PainScore } from '@/domain/types';
import { PAIN_COLORS, radius, space, useColors } from '@/theme';

import { Txt } from './Txt';

const SCORES: PainScore[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Big tap targets for 0–10 pain — usable one-handed during a crisis. */
export function PainScale({ label, value, onChange }: { label: string; value: PainScore | undefined; onChange: (v: PainScore) => void }) {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <Txt variant="label">{label}</Txt>
      <View style={styles.row} accessibilityRole="radiogroup">
        {SCORES.map((score) => {
          const selected = score === value;
          return (
            <Pressable
              key={score}
              onPress={() => onChange(score)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={t('pain.label', { value: score })}
              style={[
                styles.cell,
                { borderColor: selected ? colors.text : colors.border, backgroundColor: colors.surface },
                selected && { backgroundColor: PAIN_COLORS[score], borderWidth: 2 },
              ]}>
              <View style={[styles.swatch, { backgroundColor: PAIN_COLORS[score] }]} />
              <Txt variant="label" color={selected ? (score >= 7 || score <= 1 ? '#fff' : '#1C1917') : colors.text}>
                {score}
              </Txt>
            </Pressable>
          );
        })}
      </View>
      <Txt variant="small">{t('pain.scaleHint')}</Txt>
    </View>
  );
}

/** A small colored pill showing a pain score, e.g. "7/10". */
export function PainBadge({ value }: { value: number }) {
  const score = Math.max(0, Math.min(10, Math.round(value)));
  return (
    <View style={[styles.badge, { backgroundColor: PAIN_COLORS[score] }]}>
      <Txt variant="small" color={score >= 7 || score <= 1 ? '#fff' : '#1C1917'} style={styles.badgeText}>
        {score}/10
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    width: 48,
    height: 52,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  swatch: { width: 20, height: 4, borderRadius: 2 },
  badge: { paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.pill },
  badgeText: { fontWeight: '700' },
});
