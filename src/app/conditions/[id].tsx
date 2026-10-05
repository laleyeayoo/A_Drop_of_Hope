import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChoiceChips } from '@/components/Chips';
import { Field } from '@/components/Field';
import { Divider } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Txt } from '@/components/Txt';
import { useHealthStore } from '@/data/store';
import { CONDITION_STATUSES, SEVERITIES } from '@/domain/catalog';
import { dayKey, formatDate, isValidPartialDate } from '@/domain/dates';
import type { Severity } from '@/domain/types';
import { locale } from '@/i18n';
import { confirm } from '@/lib/confirm';
import { conditionName } from '@/lib/labels';
import { space } from '@/theme';

export default function ConditionDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const condition = useHealthStore((s) => s.conditions.find((c) => c.id === id));
  const allEpisodes = useHealthStore((s) => s.episodes);
  const [adding, setAdding] = useState(false);
  const [occurredOn, setOccurredOn] = useState(dayKey(new Date()));
  const [severity, setSeverity] = useState<Severity>('moderate');
  const [treatment, setTreatment] = useState('');
  const [note, setNote] = useState('');

  if (!condition) {
    return (
      <Screen>
        <Txt variant="muted">{t('conditions.empty')}</Txt>
      </Screen>
    );
  }

  const store = useHealthStore.getState();
  const episodes = allEpisodes.filter((e) => e.conditionId === condition.id);
  const dateOk = isValidPartialDate(occurredOn);

  const saveEpisode = () => {
    if (!dateOk) return;
    store.addEpisode({
      conditionId: condition.id,
      occurredOn,
      severity,
      treatment: treatment.trim() || undefined,
      note: note.trim() || undefined,
    });
    setAdding(false);
    setTreatment('');
    setNote('');
  };

  const remove = () =>
    confirm(
      t('common.confirmDelete'),
      () => {
        router.back();
        store.deleteCondition(condition.id);
      },
      t('common.delete'),
      t('common.cancel')
    );

  return (
    <Screen>
      <Stack.Screen options={{ title: conditionName(t, condition) }} />
      <Txt variant="title">{conditionName(t, condition)}</Txt>
      {condition.diagnosedOn ? <Txt variant="muted">{t('conditions.diagnosed', { date: condition.diagnosedOn })}</Txt> : null}
      <ChoiceChips
        label={t('conditions.status')}
        value={condition.status}
        onChange={(status) => store.updateCondition(condition.id, { status })}
        options={CONDITION_STATUSES.map((s) => ({ value: s, label: t(`conditions.statuses.${s}`) }))}
      />
      <Field
        label={t('conditions.note')}
        value={condition.note ?? ''}
        onChangeText={(text) => store.updateCondition(condition.id, { note: text })}
        multiline
      />

      <Section
        title={t('conditions.episodes')}
        action={!adding ? <Button label={t('conditions.addEpisode')} variant="ghost" icon="add" onPress={() => setAdding(true)} /> : null}>
        {adding ? (
          <Card tone="accent">
            <Field
              label={t('conditions.episodeDate')}
              placeholder="YYYY-MM-DD"
              value={occurredOn}
              onChangeText={setOccurredOn}
              error={!dateOk ? t('common.invalidDate') : undefined}
            />
            <ChoiceChips
              label={t('conditions.severity')}
              value={severity}
              onChange={setSeverity}
              options={SEVERITIES.map((s) => ({ value: s, label: t(`conditions.severities.${s}`) }))}
            />
            <Field label={t('conditions.treatment')} value={treatment} onChangeText={setTreatment} />
            <Field label={t('conditions.note')} value={note} onChangeText={setNote} multiline />
            <View style={styles.row}>
              <View style={styles.flex}>
                <Button label={t('common.cancel')} variant="secondary" onPress={() => setAdding(false)} />
              </View>
              <View style={styles.flex}>
                <Button label={t('common.save')} onPress={saveEpisode} disabled={!dateOk} />
              </View>
            </View>
          </Card>
        ) : null}
        <Card>
          {episodes.length === 0 ? (
            <Txt variant="muted">{t('conditions.noEpisodes')}</Txt>
          ) : (
            episodes.map((e, i) => (
              <View key={e.id} style={styles.episode}>
                {i > 0 ? <Divider /> : null}
                <View style={styles.row}>
                  <Txt variant="label" style={styles.flex}>
                    {e.occurredOn.length === 10 ? formatDate(`${e.occurredOn}T12:00:00`, locale) : e.occurredOn}
                  </Txt>
                  <Txt variant="small">{t(`conditions.severities.${e.severity}`)}</Txt>
                </View>
                {e.treatment ? <Txt variant="small">{e.treatment}</Txt> : null}
                {e.note ? <Txt variant="small">{e.note}</Txt> : null}
                <Button label={t('common.delete')} variant="ghost" onPress={() => store.deleteEpisode(e.id)} />
              </View>
            ))
          )}
        </Card>
      </Section>
      <Button label={t('common.delete')} variant="danger" icon="trash" onPress={remove} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1 },
  episode: { gap: space.xs },
});
