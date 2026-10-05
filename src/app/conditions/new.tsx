import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { ChoiceChips } from '@/components/Chips';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { useHealthStore } from '@/data/store';
import { CONDITION_CATALOG, CONDITION_STATUSES } from '@/domain/catalog';
import { isValidPartialDate } from '@/domain/dates';
import type { ConditionStatus } from '@/domain/types';
import { label } from '@/lib/labels';

export default function NewCondition() {
  const { t } = useTranslation();
  const tracked = useHealthStore((s) => s.conditions);
  const [catalogId, setCatalogId] = useState<string | undefined>();
  const [customName, setCustomName] = useState('');
  const [diagnosedOn, setDiagnosedOn] = useState('');
  const [status, setStatus] = useState<ConditionStatus>('active');
  const [note, setNote] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  // Hide conditions that are already tracked (except "Other").
  const options = CONDITION_CATALOG.filter((c) => c.id === 'other' || !tracked.some((x) => x.catalogId === c.id));
  const dateOk = diagnosedOn === '' || isValidPartialDate(diagnosedOn);
  const nameOk = catalogId !== 'other' || customName.trim() !== '';

  const save = () => {
    if (!catalogId || !dateOk || !nameOk) {
      setShowErrors(true);
      return;
    }
    const id = useHealthStore.getState().addCondition({
      catalogId,
      customName: catalogId === 'other' ? customName.trim() : undefined,
      diagnosedOn: diagnosedOn || undefined,
      status,
      note: note.trim() || undefined,
    });
    router.replace(`/conditions/${id}`);
  };

  return (
    <Screen footer={<Button label={t('common.save')} onPress={save} disabled={!catalogId} />}>
      <ChoiceChips
        label={t('conditions.chooseCondition')}
        value={catalogId}
        onChange={setCatalogId}
        options={options.map((c) => ({ value: c.id, label: label(t, 'catalog', c.id) }))}
      />
      {catalogId === 'other' ? (
        <Field
          label={t('conditions.customName')}
          value={customName}
          onChangeText={setCustomName}
          error={showErrors && !nameOk ? t('common.required') : undefined}
        />
      ) : null}
      <Field
        label={`${t('conditions.diagnosedOn')} (${t('common.optional')})`}
        hint={t('conditions.diagnosedHint')}
        placeholder="YYYY"
        value={diagnosedOn}
        onChangeText={setDiagnosedOn}
        error={showErrors && !dateOk ? t('common.invalidDate') : undefined}
      />
      <ChoiceChips
        label={t('conditions.status')}
        value={status}
        onChange={setStatus}
        options={CONDITION_STATUSES.map((s) => ({ value: s, label: t(`conditions.statuses.${s}`) }))}
      />
      <Field label={t('conditions.note')} value={note} onChangeText={setNote} multiline />
    </Screen>
  );
}
