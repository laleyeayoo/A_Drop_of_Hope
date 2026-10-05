import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChoiceChips, MultiChips } from '@/components/Chips';
import { Field } from '@/components/Field';
import { Divider } from '@/components/ListRow';
import { PainScale } from '@/components/PainScale';
import { Rating } from '@/components/Rating';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Stepper } from '@/components/Stepper';
import { Txt } from '@/components/Txt';
import { useHealthStore } from '@/data/store';
import { BODY_AREAS, CARE_SETTINGS, COMPLICATIONS, PLAN_FOLLOWED, TRIGGERS } from '@/domain/catalog';
import { formatDateTime } from '@/domain/dates';
import { newId } from '@/domain/ids';
import { crisisDurationDays } from '@/domain/insights';
import type { Crisis, CrisisComplication, HelpRating } from '@/domain/types';
import { locale } from '@/i18n';
import { confirm } from '@/lib/confirm';
import { label } from '@/lib/labels';
import { space } from '@/theme';

const URGENT: CrisisComplication[] = ['fever', 'chest_pain_breathing', 'severe_headache_or_weakness', 'abdominal_swelling', 'priapism'];

export default function CrisisDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const crisis = useHealthStore((s) => s.crises.find((c) => c.id === id));
  const planVersions = useHealthStore((s) => s.planVersions);
  const medications = useHealthStore((s) => s.medications);
  const [treatmentName, setTreatmentName] = useState('');

  if (!crisis) {
    return (
      <Screen>
        <Txt variant="muted">{t('crisis.empty')}</Txt>
      </Screen>
    );
  }

  const update = (changes: Partial<Crisis>) => useHealthStore.getState().updateCrisis(crisis.id, changes);
  const plan = planVersions.find((p) => p.id === crisis.planVersionId);
  const atHospital = crisis.setting !== 'home';
  const days = crisisDurationDays(crisis);
  const durationText = days < 1 ? `${Math.max(1, Math.round(days * 24))} h` : t('common.days', { count: Math.round(days) });

  const crisisMeds = medications.filter((m) => !m.stoppedOn && m.purpose !== 'daily');
  const addTreatment = (name: string, medicationId?: string) => {
    if (!name.trim()) return;
    update({ treatments: [...crisis.treatments, { id: newId(), name: name.trim(), medicationId }] });
    setTreatmentName('');
  };
  const rateTreatment = (treatmentId: string, helped: HelpRating) =>
    update({ treatments: crisis.treatments.map((x) => (x.id === treatmentId ? { ...x, helped } : x)) });
  const removeTreatment = (treatmentId: string) =>
    update({ treatments: crisis.treatments.filter((x) => x.id !== treatmentId) });

  const remove = () =>
    confirm(
      t('common.confirmDelete'),
      () => {
        router.back();
        useHealthStore.getState().deleteCrisis(crisis.id);
      },
      t('common.delete'),
      t('common.cancel')
    );

  return (
    <Screen>
      <Stack.Screen options={{ title: t('crisis.detailTitle') }} />
      <Card tone={crisis.endedAt ? 'default' : 'primary'}>
        <Txt variant="heading">{formatDateTime(crisis.startedAt, locale)}</Txt>
        <Txt variant="muted">
          {crisis.endedAt ? t('crisis.endedAt', { when: formatDateTime(crisis.endedAt, locale) }) : t('common.ongoing')} ·{' '}
          {t('crisis.duration', { duration: durationText })}
        </Txt>
        <Txt variant="small">
          {plan ? t('crisis.planVersion', { version: plan.version }) : t('crisis.noPlanVersion')}
        </Txt>
        {!crisis.endedAt ? (
          <Button label={t('crisis.end')} icon="checkmark-circle" onPress={() => update({ endedAt: new Date().toISOString() })} />
        ) : null}
      </Card>

      {crisis.complications.some((c) => URGENT.includes(c)) && !crisis.endedAt ? (
        <Banner tone="danger" text={t('crisis.emergencyWarning')} />
      ) : null}

      <PainScale label={t('crisis.peakPain')} value={crisis.peakPain} onChange={(peakPain) => update({ peakPain })} />
      <MultiChips
        label={t('crisis.painAreas')}
        values={crisis.painAreas}
        onChange={(painAreas) => update({ painAreas })}
        options={BODY_AREAS.map((a) => ({ value: a, label: label(t, 'bodyAreas', a) }))}
      />
      <ChoiceChips
        label={t('crisis.setting')}
        value={crisis.setting}
        onChange={(setting) => update({ setting })}
        options={CARE_SETTINGS.map((s) => ({ value: s, label: t(`crisis.settings.${s}`) }))}
      />
      {atHospital ? (
        <Card>
          <Field
            label={t('crisis.minutesToPainMedicine')}
            hint={t('crisis.minutesHint')}
            keyboardType="number-pad"
            value={crisis.minutesToPainMedicine?.toString() ?? ''}
            onChangeText={(text) => {
              const n = parseInt(text.replace(/\D/g, ''), 10);
              update({ minutesToPainMedicine: Number.isNaN(n) ? undefined : n });
            }}
          />
          <ChoiceChips
            label={t('crisis.planFollowed')}
            value={crisis.planFollowed}
            onChange={(planFollowed) => update({ planFollowed })}
            options={PLAN_FOLLOWED.map((p) => ({ value: p, label: t(`crisis.planFollowedOptions.${p}`) }))}
          />
          {crisis.setting === 'admitted' ? (
            <Stepper label={t('crisis.daysAdmitted')} value={crisis.daysAdmitted} onChange={(daysAdmitted) => update({ daysAdmitted })} max={90} />
          ) : null}
        </Card>
      ) : null}

      <MultiChips
        label={t('crisis.complications')}
        values={crisis.complications}
        onChange={(complications) => update({ complications })}
        options={COMPLICATIONS.map((c) => ({ value: c, label: t(`crisis.complicationOptions.${c}`) }))}
      />

      <Section title={t('crisis.treatments')}>
        {crisis.treatments.map((tr, i) => (
          <View key={tr.id} style={styles.gap}>
            {i > 0 ? <Divider /> : null}
            <View style={styles.row}>
              <Txt variant="label" style={styles.flex}>
                {tr.name}
              </Txt>
              <Button label={t('common.delete')} variant="ghost" onPress={() => removeTreatment(tr.id)} />
            </View>
            <Rating<HelpRating>
              label={t('crisis.helped')}
              levels={t('crisis.helpedLevels')}
              start={1}
              value={tr.helped}
              onChange={(v) => rateTreatment(tr.id, v)}
            />
          </View>
        ))}
        {crisisMeds.length > 0 ? (
          <View style={styles.chipRow}>
            {crisisMeds
              .filter((m) => !crisis.treatments.some((x) => x.medicationId === m.id))
              .map((m) => (
                <Button key={m.id} label={`+ ${m.name}`} variant="secondary" onPress={() => addTreatment(m.name, m.id)} />
              ))}
          </View>
        ) : null}
        <Field
          label={t('crisis.treatmentName')}
          placeholder={t('crisis.treatmentPlaceholder')}
          value={treatmentName}
          onChangeText={setTreatmentName}
          onSubmitEditing={() => addTreatment(treatmentName)}
        />
        <Button label={t('crisis.addTreatment')} variant="secondary" icon="add" onPress={() => addTreatment(treatmentName)} disabled={!treatmentName.trim()} />
      </Section>

      <MultiChips
        label={t('crisis.triggers')}
        values={crisis.triggers}
        onChange={(triggers) => update({ triggers })}
        options={TRIGGERS.map((x) => ({ value: x, label: label(t, 'triggers', x) }))}
      />
      <Field label={t('crisis.note')} value={crisis.note ?? ''} onChangeText={(note) => update({ note })} multiline />
      <Button label={t('common.delete')} variant="danger" icon="trash" onPress={remove} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1 },
  gap: { gap: space.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
