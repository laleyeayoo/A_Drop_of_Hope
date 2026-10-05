import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Divider } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Txt } from '@/components/Txt';
import { useHealthStore } from '@/data/store';
import { formatDate } from '@/domain/dates';
import { outcomesByPlanVersion } from '@/domain/insights';
import { changedFields, currentPlan, PLAN_FIELDS, planHistory } from '@/domain/plan';
import type { PlanContent, PlanVersion } from '@/domain/types';
import { locale } from '@/i18n';
import { space } from '@/theme';

function PlanFields({ content }: { content: PlanContent }) {
  const { t } = useTranslation();
  return (
    <>
      {PLAN_FIELDS.filter((f) => content[f].trim()).map((field) => (
        <View key={field} style={styles.field}>
          <Txt variant="small">{t(`plan.fields.${field}`)}</Txt>
          <Txt>{content[field]}</Txt>
        </View>
      ))}
    </>
  );
}

export default function PlanScreen() {
  const { t } = useTranslation();
  const versions = useHealthStore((s) => s.planVersions);
  const crises = useHealthStore((s) => s.crises);
  const [expanded, setExpanded] = useState<string | undefined>();
  const plan = currentPlan(versions);

  if (!plan) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('plan.title') }} />
        <Txt variant="muted">{t('plan.intro')}</Txt>
        <Button label={t('plan.create')} icon="create" onPress={() => router.push('/plan/edit')} large />
      </Screen>
    );
  }

  const history = planHistory(versions);
  const outcomes = outcomesByPlanVersion(crises, versions);
  const previous = (v: PlanVersion) => versions.find((x) => x.version === v.version - 1);

  return (
    <Screen>
      <Stack.Screen options={{ title: t('plan.title') }} />
      <Txt variant="muted">{t('plan.intro')}</Txt>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button label={t('plan.edit')} icon="create" variant="secondary" onPress={() => router.push('/plan/edit')} />
        </View>
        <View style={styles.flex}>
          <Button label={t('plan.erView')} icon="medical" onPress={() => router.push('/plan/er-card')} />
        </View>
      </View>

      <Card>
        <View style={styles.row}>
          <Txt variant="heading" style={styles.flex}>
            {t('plan.version', { version: plan.version })} · {t('plan.current')}
          </Txt>
          <Txt variant="small">{t('plan.updated', { date: formatDate(plan.createdAt, locale) })}</Txt>
        </View>
        <PlanFields content={plan.content} />
      </Card>

      <Section title={t('plan.history')}>
        <Card>
          {history.map((v, i) => {
            const prev = previous(v);
            const changed = prev ? changedFields(prev.content, v.content) : [];
            const isOpen = expanded === v.id;
            return (
              <View key={v.id} style={styles.field}>
                {i > 0 ? <Divider /> : null}
                <View style={styles.row}>
                  <Txt variant="label" style={styles.flex}>
                    {t('plan.version', { version: v.version })}
                  </Txt>
                  <Txt variant="small">{formatDate(v.createdAt, locale)}</Txt>
                </View>
                <Txt>“{v.changeReason || t('plan.firstReason')}”</Txt>
                {changed.length ? (
                  <Txt variant="small">{t('plan.changed', { fields: changed.map((f) => t(`plan.fields.${f}`)).join(', ') })}</Txt>
                ) : null}
                {v.id !== plan.id ? (
                  <Button
                    label={isOpen ? t('plan.hideVersion', { version: v.version }) : t('plan.showVersion', { version: v.version })}
                    icon={isOpen ? 'chevron-up' : 'chevron-down'}
                    variant="ghost"
                    onPress={() => setExpanded(isOpen ? undefined : v.id)}
                  />
                ) : null}
                {isOpen ? <PlanFields content={v.content} /> : null}
              </View>
            );
          })}
        </Card>
      </Section>

      {versions.length > 1 ? (
        <Section title={t('plan.outcomes')}>
          <Card>
            {outcomes.map((o, i) => (
              <View key={o.planVersionId} style={styles.field}>
                {i > 0 ? <Divider /> : null}
                <Txt variant="label">{t('plan.version', { version: o.version })}</Txt>
                <Txt variant="small">
                  {o.crises
                    ? t('insights.planRow', {
                        crises: o.crises,
                        pain: o.averagePeakPain?.toFixed(1),
                        hospital: `${Math.round((o.hospitalRate ?? 0) * 100)}%`,
                      })
                    : t('insights.planRowNone')}
                </Txt>
              </View>
            ))}
          </Card>
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1 },
  field: { gap: 2, paddingVertical: space.xs },
});
