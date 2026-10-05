import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { MultiChips } from '@/components/Chips';
import { Field } from '@/components/Field';
import { PainScale } from '@/components/PainScale';
import { Rating } from '@/components/Rating';
import { Screen } from '@/components/Screen';
import { Stepper } from '@/components/Stepper';
import { useHealthStore } from '@/data/store';
import { BODY_AREAS, TRIGGERS } from '@/domain/catalog';
import type { BodyArea, CheckIn, PainScore, Trigger } from '@/domain/types';
import { label } from '@/lib/labels';

export default function CheckInScreen() {
  const { t } = useTranslation();
  const [pain, setPain] = useState<PainScore | undefined>();
  const [painAreas, setPainAreas] = useState<BodyArea[]>([]);
  const [fatigue, setFatigue] = useState<CheckIn['fatigue']>(0);
  const [mood, setMood] = useState<CheckIn['mood']>(3);
  const [sleepHours, setSleepHours] = useState<number | undefined>();
  const [waterGlasses, setWaterGlasses] = useState<number | undefined>();
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [note, setNote] = useState('');

  const save = () => {
    if (pain === undefined) return;
    useHealthStore.getState().addCheckIn({
      at: new Date().toISOString(),
      pain,
      painAreas,
      fatigue,
      mood,
      sleepHours,
      waterGlasses,
      triggers,
      note: note.trim() || undefined,
    });
    router.back();
  };

  return (
    <Screen footer={<Button label={t('common.save')} onPress={save} disabled={pain === undefined} />}>
      <PainScale label={t('checkIn.pain')} value={pain} onChange={setPain} />
      {pain !== undefined && pain > 0 ? (
        <MultiChips
          label={t('checkIn.painAreas')}
          values={painAreas}
          onChange={setPainAreas}
          options={BODY_AREAS.map((a) => ({ value: a, label: label(t, 'bodyAreas', a) }))}
        />
      ) : null}
      <Rating<CheckIn['fatigue']> label={t('checkIn.fatigue')} levels={t('checkIn.fatigueLevels')} start={0} value={fatigue} onChange={setFatigue} />
      <Rating<CheckIn['mood']> label={t('checkIn.mood')} levels={t('checkIn.moodLevels')} start={1} value={mood} onChange={setMood} />
      <Stepper label={t('checkIn.sleep')} value={sleepHours} onChange={setSleepHours} max={24} />
      <Stepper label={t('checkIn.water')} value={waterGlasses} onChange={setWaterGlasses} max={30} />
      <MultiChips
        label={t('checkIn.triggers')}
        values={triggers}
        onChange={setTriggers}
        options={TRIGGERS.map((x) => ({ value: x, label: label(t, 'triggers', x) }))}
      />
      <Field label={t('checkIn.note')} placeholder={t('checkIn.notePlaceholder')} value={note} onChangeText={setNote} multiline />
    </Screen>
  );
}
