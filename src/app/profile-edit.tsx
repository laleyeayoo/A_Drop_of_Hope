import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { ChoiceChips } from '@/components/Chips';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { useHealthStore } from '@/data/store';
import { GENOTYPES } from '@/domain/catalog';
import type { Genotype, Profile } from '@/domain/types';
import { label } from '@/lib/labels';

export default function ProfileEdit() {
  const { t } = useTranslation();
  const profile = useHealthStore((s) => s.profile) as Profile;
  const [name, setName] = useState(profile.name);
  const [caringFor, setCaringFor] = useState(profile.caringFor ?? '');
  const [genotype, setGenotype] = useState<Genotype>(profile.genotype);
  const [birthYear, setBirthYear] = useState(profile.birthYear?.toString() ?? '');
  const [region, setRegion] = useState(profile.region ?? '');
  const [hematologist, setHematologist] = useState(profile.hematologist ?? '');

  const year = Number(birthYear);
  const yearValid = birthYear === '' || (Number.isInteger(year) && year >= 1900 && year <= new Date().getFullYear());

  const save = () => {
    if (!name.trim() || !yearValid) return;
    useHealthStore.getState().updateProfile({
      name: name.trim(),
      caringFor: profile.role === 'caregiver' ? caringFor.trim() || undefined : undefined,
      genotype,
      birthYear: birthYear ? year : undefined,
      region: region.trim() || undefined,
      hematologist: hematologist.trim() || undefined,
    });
    router.back();
  };

  return (
    <Screen footer={<Button label={t('common.save')} onPress={save} disabled={!name.trim() || !yearValid} />}>
      <Field label={t('onboarding.name')} value={name} onChangeText={setName} error={!name.trim() ? t('common.required') : undefined} />
      {profile.role === 'caregiver' ? (
        <Field label={t('onboarding.caringFor')} value={caringFor} onChangeText={setCaringFor} />
      ) : null}
      <ChoiceChips<Genotype>
        label={t('onboarding.genotype')}
        value={genotype}
        onChange={setGenotype}
        options={GENOTYPES.map((g) => ({ value: g, label: label(t, 'genotypes', g) }))}
      />
      <Field
        label={t('onboarding.birthYear')}
        value={birthYear}
        onChangeText={setBirthYear}
        keyboardType="number-pad"
        maxLength={4}
        error={!yearValid ? t('common.invalidDate') : undefined}
      />
      <Field label={t('onboarding.region')} value={region} onChangeText={setRegion} />
      <Field label={t('profile.hematologist')} value={hematologist} onChangeText={setHematologist} />
    </Screen>
  );
}
