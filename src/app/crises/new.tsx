import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { ChoiceChips, MultiChips } from '@/components/Chips';
import { PainScale } from '@/components/PainScale';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useHealthStore } from '@/data/store';
import { BODY_AREAS, CARE_SETTINGS } from '@/domain/catalog';
import type { BodyArea, CareSetting, PainScore } from '@/domain/types';
import { label } from '@/lib/labels';

/** How long ago the crisis started, in hours. */
const START_OPTIONS = ['0', '2', '6', '24', '48', '72'] as const;
type StartOption = (typeof START_OPTIONS)[number];

/**
 * Quick crisis logging — deliberately short so it can be done one-handed while
 * in pain. Everything else can be added later on the crisis detail screen.
 */
export default function NewCrisis() {
  const { t } = useTranslation();
  const [start, setStart] = useState<StartOption>('0');
  const [pain, setPain] = useState<PainScore | undefined>();
  const [painAreas, setPainAreas] = useState<BodyArea[]>([]);
  const [setting, setSetting] = useState<CareSetting>('home');

  const startLabel = (o: StartOption) => {
    const hours = Number(o);
    if (hours === 0) return t('crisis.startNow');
    if (hours < 24) return t('crisis.startHoursAgo', { count: hours });
    if (hours === 24) return t('crisis.startYesterday');
    return t('crisis.startDaysAgo', { count: hours / 24 });
  };

  const save = () => {
    if (pain === undefined) return;
    const startedAt = new Date(Date.now() - Number(start) * 60 * 60 * 1000).toISOString();
    const id = useHealthStore.getState().addCrisis({
      startedAt,
      peakPain: pain,
      painAreas,
      setting,
      complications: [],
      triggers: [],
      treatments: [],
    });
    router.replace(`/crises/${id}`);
  };

  return (
    <Screen footer={<Button label={t('crisis.saveCrisis')} onPress={save} disabled={pain === undefined} large />}>
      <Txt variant="muted">{t('crisis.quickHint')}</Txt>
      <Banner tone="danger" text={t('crisis.emergencyWarning')} />
      <PainScale label={t('crisis.peakPain')} value={pain} onChange={setPain} />
      <MultiChips
        label={t('crisis.painAreas')}
        values={painAreas}
        onChange={setPainAreas}
        options={BODY_AREAS.map((a) => ({ value: a, label: label(t, 'bodyAreas', a) }))}
      />
      <ChoiceChips
        label={t('crisis.whenStarted')}
        value={start}
        onChange={setStart}
        options={START_OPTIONS.map((o) => ({ value: o, label: startLabel(o) }))}
      />
      <ChoiceChips
        label={t('crisis.setting')}
        value={setting}
        onChange={setSetting}
        options={CARE_SETTINGS.map((s) => ({ value: s, label: t(`crisis.settings.${s}`) }))}
      />
    </Screen>
  );
}
