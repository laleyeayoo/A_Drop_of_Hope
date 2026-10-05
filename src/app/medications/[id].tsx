import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Field } from '@/components/Field';
import { Divider, ListRow } from '@/components/ListRow';
import { Rating } from '@/components/Rating';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Stat, StatRow } from '@/components/Stat';
import { Txt } from '@/components/Txt';
import { useHealthStore } from '@/data/store';
import { dayKey, formatDate, formatDateTime } from '@/domain/dates';
import { crisisHelpRating, summarizeDoses } from '@/domain/insights';
import type { HelpRating } from '@/domain/types';
import { locale } from '@/i18n';
import { confirm } from '@/lib/confirm';
import { space } from '@/theme';

export default function MedicationDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const med = useHealthStore((s) => s.medications.find((m) => m.id === id));
  const doseLogs = useHealthStore((s) => s.doseLogs);
  const crises = useHealthStore((s) => s.crises);
  const [effectiveness, setEffectiveness] = useState<HelpRating | undefined>();
  const [sideEffects, setSideEffects] = useState('');
  const [stopReason, setStopReason] = useState('');
  const [stopping, setStopping] = useState(false);

  if (!med) {
    return (
      <Screen>
        <Txt variant="muted">{t('meds.empty')}</Txt>
      </Screen>
    );
  }

  const summary = summarizeDoses(doseLogs, med.id);
  const crisisRating = crisisHelpRating(crises, med.id);
  const history = doseLogs.filter((d) => d.medicationId === med.id).slice(0, 10);
  const store = useHealthStore.getState();

  const log = (status: 'taken' | 'missed') => {
    store.logDose({
      medicationId: med.id,
      at: new Date().toISOString(),
      status,
      effectiveness: status === 'taken' ? effectiveness : undefined,
      sideEffects: sideEffects.trim() || undefined,
    });
    setEffectiveness(undefined);
    setSideEffects('');
  };

  const stop = () => {
    store.updateMedication(med.id, { stoppedOn: dayKey(new Date()), stopReason: stopReason.trim() || undefined });
    setStopping(false);
  };

  const remove = () =>
    confirm(
      t('common.confirmDelete'),
      () => {
        router.back();
        store.deleteMedication(med.id);
      },
      t('common.delete'),
      t('common.cancel')
    );

  const rating = (v: number | undefined) => (v === undefined ? '–' : t('meds.ratingOutOf5', { value: v.toFixed(1) }));

  return (
    <Screen>
      <Stack.Screen options={{ title: med.name }} />
      <Card>
        <Txt variant="title">{med.name}</Txt>
        <Txt variant="muted">{[med.dose, med.frequency, t(`meds.purposes.${med.purpose}`)].filter(Boolean).join(' · ')}</Txt>
        {med.stoppedOn ? (
          <Txt variant="small">
            {t('meds.stoppedOn', { date: formatDate(med.stoppedOn, locale) })}
            {med.stopReason ? ` — ${med.stopReason}` : ''}
          </Txt>
        ) : null}
      </Card>

      <StatRow>
        <Stat
          label={t('meds.adherence')}
          value={summary.adherence === undefined ? '–' : `${Math.round(summary.adherence * 100)}%`}
        />
        <Stat label={t('meds.avgEffectiveness')} value={rating(summary.averageEffectiveness)} />
        {med.purpose !== 'daily' ? <Stat label={t('meds.crisisHelp')} value={rating(crisisRating)} /> : null}
      </StatRow>

      {!med.stoppedOn ? (
        <Section title={t('meds.logDose')}>
          <Card>
            <Rating<HelpRating>
              label={t('meds.effectiveness')}
              levels={t('crisis.helpedLevels')}
              start={1}
              value={effectiveness}
              onChange={setEffectiveness}
            />
            <Field
              label={`${t('meds.sideEffects')} (${t('common.optional')})`}
              placeholder={t('meds.sideEffectsPlaceholder')}
              value={sideEffects}
              onChangeText={setSideEffects}
            />
            <View style={styles.row}>
              <View style={styles.flex}>
                <Button label={t('meds.taken')} icon="checkmark" onPress={() => log('taken')} />
              </View>
              <View style={styles.flex}>
                <Button label={t('meds.missed')} variant="secondary" icon="close" onPress={() => log('missed')} />
              </View>
            </View>
          </Card>
        </Section>
      ) : null}

      <Section title={t('meds.history')}>
        <Card>
          {history.length === 0 ? (
            <Txt variant="muted">{t('meds.noHistory')}</Txt>
          ) : (
            history.map((d, i) => (
              <View key={d.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  title={formatDateTime(d.at, locale)}
                  subtitle={[d.effectiveness ? t('meds.ratingOutOf5', { value: d.effectiveness }) : '', d.sideEffects ?? '']
                    .filter(Boolean)
                    .join(' · ') || undefined}
                  right={<Txt variant="label">{d.status === 'taken' ? `✓ ${t('meds.taken')}` : `✕ ${t('meds.missed')}`}</Txt>}
                />
              </View>
            ))
          )}
        </Card>
      </Section>

      {med.stoppedOn ? (
        <Button
          label={t('meds.restart')}
          variant="secondary"
          onPress={() => store.updateMedication(med.id, { stoppedOn: undefined, stopReason: undefined })}
        />
      ) : stopping ? (
        <Card>
          <Field
            label={t('meds.stopReason')}
            placeholder={t('meds.stopReasonPlaceholder')}
            value={stopReason}
            onChangeText={setStopReason}
          />
          <Button label={t('meds.stop')} variant="secondary" onPress={stop} />
        </Card>
      ) : (
        <Button label={t('meds.stop')} variant="secondary" icon="pause" onPress={() => setStopping(true)} />
      )}
      <Button label={t('common.delete')} variant="danger" icon="trash" onPress={remove} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1 },
});
