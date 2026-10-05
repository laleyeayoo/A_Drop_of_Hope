import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Banner } from '@/components/Banner';
import { BarChart } from '@/components/BarChart';
import { Card } from '@/components/Card';
import { Divider, ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Stat, StatRow } from '@/components/Stat';
import { Txt } from '@/components/Txt';
import { useHealthStore } from '@/data/store';
import { formatDate, formatMonth } from '@/domain/dates';
import {
  average,
  crisesPerMonth,
  crisisDurationDays,
  dailyPain,
  outcomesByPlanVersion,
  topTriggers,
  withinDays,
} from '@/domain/insights';
import { locale } from '@/i18n';
import { label } from '@/lib/labels';

export default function Insights() {
  const { t } = useTranslation();
  const checkIns = useHealthStore((s) => s.checkIns);
  const crises = useHealthStore((s) => s.crises);
  const planVersions = useHealthStore((s) => s.planVersions);

  const months = crisesPerMonth(crises, 6);
  const pain = dailyPain(checkIns, 30);
  const avgPain = average(withinDays(checkIns, (c) => c.at, 30).map((c) => c.pain));
  const hospital = withinDays(crises, (c) => c.startedAt, 365).filter(
    (c) => c.setting === 'er' || c.setting === 'admitted'
  ).length;
  const avgLength = average(crises.filter((c) => c.endedAt).map((c) => crisisDurationDays(c)));
  const triggers = topTriggers(checkIns, crises).slice(0, 5);
  const outcomes = outcomesByPlanVersion(crises, planVersions);

  return (
    <Screen>
      <Stack.Screen options={{ title: t('insights.title') }} />
      <Banner text={t('insights.disclaimer')} />

      <StatRow>
        <Stat label={t('insights.avgPain')} value={avgPain === undefined ? '–' : `${avgPain.toFixed(1)}/10`} />
        <Stat label={t('insights.hospitalVisits')} value={String(hospital)} />
        <Stat
          label={t('insights.avgCrisisLength')}
          value={avgLength === undefined ? '–' : t('common.days', { count: Math.round(avgLength * 10) / 10 })}
        />
      </StatRow>

      <Section title={t('insights.crisesPerMonth')}>
        <Card>
          <Txt variant="small">{t('insights.last6Months')}</Txt>
          <BarChart
            showValues
            bars={months.map((m) => ({
              key: m.month,
              label: formatMonth(m.month, locale),
              value: m.count,
              detail: `${formatMonth(m.month, locale)}: ${t('insights.times', { count: m.count })}`,
            }))}
          />
        </Card>
      </Section>

      <Section title={t('insights.pain30')}>
        <Card>
          <Txt variant="small">{t('insights.last30Days')}</Txt>
          <BarChart
            max={10}
            labelEvery={7}
            bars={pain.map((d) => {
              const date = formatDate(`${d.day}T12:00:00`, locale);
              return {
                key: d.day,
                label: date.split(',')[0],
                value: d.pain,
                detail: d.pain === undefined ? `${date}: ${t('insights.noLog')}` : `${date}: ${t('pain.label', { value: d.pain })}`,
              };
            })}
          />
        </Card>
      </Section>

      <Section title={t('insights.triggers')}>
        <Card>
          {triggers.length === 0 ? (
            <Txt variant="muted">{t('insights.noTriggers')}</Txt>
          ) : (
            triggers.map((tr, i) => (
              <View key={tr.trigger}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  title={label(t, 'triggers', tr.trigger)}
                  right={<Txt variant="muted">{t('insights.times', { count: tr.count })}</Txt>}
                />
              </View>
            ))
          )}
        </Card>
      </Section>

      {outcomes.length > 1 ? (
        <Section title={t('insights.planComparison')}>
          <Card>
            {outcomes.map((o, i) => (
              <View key={o.planVersionId}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  title={t('plan.version', { version: o.version })}
                  subtitle={
                    o.crises
                      ? t('insights.planRow', {
                          crises: o.crises,
                          pain: o.averagePeakPain?.toFixed(1),
                          hospital: `${Math.round((o.hospitalRate ?? 0) * 100)}%`,
                        })
                      : t('insights.planRowNone')
                  }
                />
              </View>
            ))}
          </Card>
        </Section>
      ) : null}
      <Txt variant="small">{t('insights.exportForDoctor')}</Txt>
    </Screen>
  );
}
