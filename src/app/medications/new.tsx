import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { ChoiceChips } from '@/components/Chips';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { useHealthStore } from '@/data/store';
import { MED_PURPOSES } from '@/domain/catalog';
import { isValidPartialDate } from '@/domain/dates';
import type { MedicationPurpose } from '@/domain/types';

export default function NewMedication() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('');
  const [purpose, setPurpose] = useState<MedicationPurpose>('daily');
  const [startedOn, setStartedOn] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const dateOk = startedOn === '' || isValidPartialDate(startedOn);

  const save = () => {
    if (!name.trim() || !dateOk) {
      setShowErrors(true);
      return;
    }
    useHealthStore.getState().addMedication({
      name: name.trim(),
      dose: dose.trim() || undefined,
      frequency: frequency.trim() || undefined,
      purpose,
      startedOn: startedOn || undefined,
    });
    router.back();
  };

  return (
    <Screen footer={<Button label={t('common.save')} onPress={save} />}>
      <Field
        label={t('meds.name')}
        placeholder={t('meds.namePlaceholder')}
        value={name}
        onChangeText={setName}
        error={showErrors && !name.trim() ? t('common.required') : undefined}
      />
      <Field label={t('meds.dose')} placeholder={t('meds.dosePlaceholder')} value={dose} onChangeText={setDose} />
      <Field label={t('meds.frequency')} placeholder={t('meds.frequencyPlaceholder')} value={frequency} onChangeText={setFrequency} />
      <ChoiceChips
        label={t('meds.purpose')}
        value={purpose}
        onChange={setPurpose}
        options={MED_PURPOSES.map((p) => ({ value: p, label: t(`meds.purposes.${p}`) }))}
      />
      <Field
        label={`${t('meds.startedOn')} (${t('common.optional')})`}
        placeholder="YYYY-MM-DD"
        value={startedOn}
        onChangeText={setStartedOn}
        error={showErrors && !dateOk ? t('common.invalidDate') : undefined}
      />
    </Screen>
  );
}
