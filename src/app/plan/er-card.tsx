import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useHealthStore } from '@/data/store';
import { formatDate } from '@/domain/dates';
import { currentPlan, PLAN_FIELDS } from '@/domain/plan';
import { locale } from '@/i18n';
import { label } from '@/lib/labels';
import { radius, space } from '@/theme';

/**
 * A clean, high-contrast view of the plan to show (or print for) ER staff.
 * Always black on white so it reads well on any phone and prints cleanly.
 * PDF export and a lock-screen/QR version come later.
 */
export default function ERCard() {
  const { t } = useTranslation();
  const profile = useHealthStore((s) => s.profile);
  const plan = useHealthStore((s) => currentPlan(s.planVersions));

  if (!plan || !profile) return null;
  const name = profile.role === 'caregiver' && profile.caringFor ? profile.caringFor : profile.name;

  return (
    <Screen
      footer={Platform.OS === 'web' ? <Button label={t('plan.print')} icon="print" onPress={() => globalThis.print?.()} /> : undefined}>
      <Stack.Screen options={{ title: t('plan.erCardHeader') }} />
      <View style={styles.card}>
        <Txt variant="title" color="#8E0000">
          {t('plan.erCardTitle')}
        </Txt>
        <Txt variant="heading" color="#000">
          {t('plan.erCardFor', { name, genotype: label(t, 'genotypes', profile.genotype) })}
        </Txt>
        <Txt variant="small" color="#333">
          {t('plan.version', { version: plan.version })} · {t('plan.updated', { date: formatDate(plan.createdAt, locale) })}
        </Txt>
        {PLAN_FIELDS.filter((f) => plan.content[f].trim()).map((field) => (
          <View key={field} style={styles.field}>
            <Txt variant="label" color="#8E0000">
              {t(`plan.fields.${field}`)}
            </Txt>
            <Txt color="#000" style={styles.big}>
              {plan.content[field]}
            </Txt>
          </View>
        ))}
        <Txt variant="small" color="#333">
          {t('plan.reviewWithDoctor')}
        </Txt>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#8E0000',
    borderWidth: 3,
    borderRadius: radius.lg,
    padding: space.xl,
    gap: space.md,
  },
  field: { gap: 2 },
  big: { fontSize: 17, lineHeight: 24 },
});
