import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useHealthStore } from '@/data/store';
import { currentPlan, EMPTY_PLAN, PLAN_FIELDS } from '@/domain/plan';
import type { PlanContent } from '@/domain/types';

/**
 * Edits the plan by saving a NEW version. The old version is kept so people
 * can look back at what changed and why.
 */
export default function EditPlan() {
  const { t } = useTranslation();
  const existing = useHealthStore((s) => currentPlan(s.planVersions));
  const [content, setContent] = useState<PlanContent>(existing?.content ?? EMPTY_PLAN);
  const [reason, setReason] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [unchanged, setUnchanged] = useState(false);

  const needsReason = !!existing;

  const save = () => {
    if (needsReason && !reason.trim()) {
      setShowErrors(true);
      return;
    }
    const saved = useHealthStore.getState().savePlan(content, reason.trim() || t('plan.firstReason'));
    if (!saved) {
      setUnchanged(true);
      return;
    }
    router.back();
  };

  return (
    <Screen footer={<Button label={t('common.save')} onPress={save} />}>
      <Txt variant="muted">{t('plan.intro')}</Txt>
      {unchanged ? <Banner text={t('plan.noChanges')} /> : null}
      {PLAN_FIELDS.map((field) => (
        <Field
          key={field}
          label={t(`plan.fields.${field}`)}
          value={content[field]}
          onChangeText={(text) => {
            setUnchanged(false);
            setContent((c) => ({ ...c, [field]: text }));
          }}
          multiline={field !== 'hematologistName' && field !== 'hematologistPhone'}
          keyboardType={field === 'hematologistPhone' ? 'phone-pad' : 'default'}
        />
      ))}
      {needsReason ? (
        <Field
          label={t('plan.changeReason')}
          placeholder={t('plan.changeReasonPlaceholder')}
          value={reason}
          onChangeText={setReason}
          error={showErrors && !reason.trim() ? t('common.required') : undefined}
          multiline
        />
      ) : null}
    </Screen>
  );
}
