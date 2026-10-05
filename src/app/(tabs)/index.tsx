import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Divider, ListRow } from '@/components/ListRow';
import { PainBadge } from '@/components/PainScale';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Txt } from '@/components/Txt';
import { useHealthStore } from '@/data/store';
import { formatDate, formatDateTime, isSameDay } from '@/domain/dates';
import { withinDays } from '@/domain/insights';
import { currentPlan } from '@/domain/plan';
import { locale } from '@/i18n';
import { label } from '@/lib/labels';
import { space } from '@/theme';

export default function HealthHome() {
  const { t } = useTranslation();
  const profile = useHealthStore((s) => s.profile);
  const isDemo = useHealthStore((s) => s.isDemo);
  const checkIns = useHealthStore((s) => s.checkIns);
  const crises = useHealthStore((s) => s.crises);
  const medications = useHealthStore((s) => s.medications);
  const conditions = useHealthStore((s) => s.conditions);
  const planVersions = useHealthStore((s) => s.planVersions);

  const ongoing = crises.find((c) => !c.endedAt);
  const todays = checkIns.find((c) => isSameDay(c.at, new Date()));
  const plan = currentPlan(planVersions);
  const recentCrises = withinDays(crises, (c) => c.startedAt, 90).length;
  const activeMeds = medications.filter((m) => !m.stoppedOn).length;

  const greeting =
    profile?.role === 'caregiver' && profile.caringFor
      ? t('health.greetingCaregiver', { name: profile.caringFor })
      : t('health.greeting', { name: profile?.name ?? '' });

  return (
    <Screen>
      <Banner tone="warning" text={isDemo ? t('app.demoBanner') : t('app.prototypeBanner')} />
      <Txt variant="title" accessibilityRole="header">
        {greeting}
      </Txt>

      {ongoing ? (
        <Card tone="primary" onPress={() => router.push(`/crises/${ongoing.id}`)} accessibilityLabel={t('health.updateCrisis')}>
          <View style={styles.row}>
            <Txt variant="heading" style={styles.flex}>
              {t('health.ongoingCrisis')}
            </Txt>
            <PainBadge value={ongoing.peakPain} />
          </View>
          <Txt variant="muted">{t('health.ongoingCrisisSince', { when: formatDateTime(ongoing.startedAt, locale) })}</Txt>
          <Txt variant="label">{t('health.updateCrisis')} →</Txt>
        </Card>
      ) : (
        <Button label={t('health.crisisCta')} icon="alert-circle" onPress={() => router.push('/crises/new')} large />
      )}

      <Card>
        <Txt variant="heading">{t('health.checkInTitle')}</Txt>
        {todays ? <Txt variant="muted">{t('health.checkedInToday', { pain: todays.pain })}</Txt> : null}
        <Button label={t('health.checkInCta')} icon="sunny" variant="secondary" onPress={() => router.push('/check-in')} />
      </Card>

      <Section title={t('health.sections')}>
        <Card>
          <ListRow
            icon="pulse"
            title={t('health.crises')}
            subtitle={t('health.crisesSub', { count: recentCrises })}
            onPress={() => router.push('/crises')}
          />
          <Divider />
          <ListRow
            icon="medkit"
            title={t('health.medications')}
            subtitle={t('health.medicationsSub', { count: activeMeds })}
            onPress={() => router.push('/medications')}
          />
          <Divider />
          <ListRow
            icon="body"
            title={t('health.conditions')}
            subtitle={t('health.conditionsSub', { count: conditions.length })}
            onPress={() => router.push('/conditions')}
          />
          <Divider />
          <ListRow
            icon="document-text"
            title={t('health.plan')}
            subtitle={
              plan
                ? t('health.planSub', { version: plan.version, date: formatDate(plan.createdAt, locale) })
                : t('health.planNone')
            }
            onPress={() => router.push('/plan')}
          />
          <Divider />
          <ListRow icon="bar-chart" title={t('health.insights')} subtitle={t('health.insightsSub')} onPress={() => router.push('/insights')} />
        </Card>
      </Section>

      <Section title={t('health.recentCheckIns')}>
        <Card>
          {checkIns.length === 0 ? (
            <Txt variant="muted">{t('health.noCheckIns')}</Txt>
          ) : (
            checkIns.slice(0, 5).map((c, i) => (
              <View key={c.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  title={formatDateTime(c.at, locale)}
                  subtitle={
                    [...c.painAreas.map((a) => label(t, 'bodyAreas', a)), ...c.triggers.map((x) => label(t, 'triggers', x))].join(' · ') ||
                    undefined
                  }
                  right={<PainBadge value={c.pain} />}
                />
              </View>
            ))
          )}
        </Card>
      </Section>
      <Txt variant="small">{t('app.notMedicalAdvice')}</Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1 },
});
