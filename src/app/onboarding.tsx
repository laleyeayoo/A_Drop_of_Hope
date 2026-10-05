import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChoiceChips } from '@/components/Chips';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useHealthStore } from '@/data/store';
import { GENOTYPES } from '@/domain/catalog';
import type { Genotype, Role } from '@/domain/types';
import { label } from '@/lib/labels';
import { space, useColors } from '@/theme';

type Step = 'welcome' | 'privacy' | 'choose' | 'profile';

export default function Onboarding() {
  const { t } = useTranslation();
  const colors = useColors();
  const [step, setStep] = useState<Step>('welcome');

  // Profile form
  const [role, setRole] = useState<Role>('patient');
  const [name, setName] = useState('');
  const [caringFor, setCaringFor] = useState('');
  const [genotype, setGenotype] = useState<Genotype>('unknown');
  const [birthYear, setBirthYear] = useState('');
  const [region, setRegion] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const year = Number(birthYear);
  const yearValid = birthYear === '' || (Number.isInteger(year) && year >= 1900 && year <= new Date().getFullYear());

  const finish = () => {
    if (!name.trim() || !yearValid) {
      setShowErrors(true);
      return;
    }
    useHealthStore.getState().completeOnboarding({
      name: name.trim(),
      role,
      caringFor: role === 'caregiver' ? caringFor.trim() || undefined : undefined,
      genotype,
      birthYear: birthYear ? year : undefined,
      region: region.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
  };

  if (step === 'welcome') {
    return (
      <Screen footer={<Button label={t('common.next')} onPress={() => setStep('privacy')} large />}>
        <View style={styles.hero}>
          <Ionicons name="water" size={64} color={colors.primary} />
          <Txt variant="title" style={styles.center} accessibilityRole="header">
            {t('onboarding.welcomeTitle')}
          </Txt>
          <Txt variant="muted" style={styles.center}>
            {t('onboarding.welcomeBody')}
          </Txt>
        </View>
        <Card tone="warning">
          <Txt variant="heading">{t('onboarding.prototypeTitle')}</Txt>
          <Txt>{t('onboarding.prototypeBody')}</Txt>
        </Card>
      </Screen>
    );
  }

  if (step === 'privacy') {
    const promises = [t('onboarding.privacy1'), t('onboarding.privacy2'), t('onboarding.privacy3'), t('onboarding.privacy4')];
    return (
      <Screen footer={<Button label={t('onboarding.acknowledge')} onPress={() => setStep('choose')} large />}>
        <Txt variant="title" accessibilityRole="header" style={styles.top}>
          {t('onboarding.privacyTitle')}
        </Txt>
        {promises.map((text) => (
          <View key={text} style={styles.promise}>
            <Ionicons name="shield-checkmark" size={22} color={colors.success} />
            <Txt style={styles.flex}>{text}</Txt>
          </View>
        ))}
        <Banner text={t('app.notMedicalAdvice')} />
      </Screen>
    );
  }

  if (step === 'choose') {
    return (
      <Screen>
        <Txt variant="title" accessibilityRole="header" style={styles.top}>
          {t('onboarding.chooseTitle')}
        </Txt>
        <Card onPress={() => useHealthStore.getState().loadDemoData()} tone="primary" accessibilityLabel={t('onboarding.tryDemo')}>
          <View style={styles.promise}>
            <Ionicons name="sparkles" size={24} color={colors.primary} />
            <Txt variant="heading" style={styles.flex}>
              {t('onboarding.tryDemo')}
            </Txt>
          </View>
          <Txt variant="muted">{t('onboarding.tryDemoHint')}</Txt>
        </Card>
        <Card onPress={() => setStep('profile')} accessibilityLabel={t('onboarding.startFresh')}>
          <View style={styles.promise}>
            <Ionicons name="create" size={24} color={colors.accent} />
            <Txt variant="heading" style={styles.flex}>
              {t('onboarding.startFresh')}
            </Txt>
          </View>
          <Txt variant="muted">{t('onboarding.startFreshHint')}</Txt>
        </Card>
        <Txt variant="small">{t('onboarding.specialistNote')}</Txt>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View style={styles.footerRow}>
          <View style={styles.flex}>
            <Button label={t('common.back')} variant="secondary" onPress={() => setStep('choose')} />
          </View>
          <View style={styles.flex}>
            <Button label={t('onboarding.finish')} onPress={finish} />
          </View>
        </View>
      }>
      <Txt variant="title" accessibilityRole="header" style={styles.top}>
        {t('onboarding.profileTitle')}
      </Txt>
      <Banner tone="warning" text={t('app.prototypeBanner')} />
      <ChoiceChips<Role>
        label={t('onboarding.whoAreYou')}
        value={role}
        onChange={setRole}
        options={[
          { value: 'patient', label: t('onboarding.rolePatient') },
          { value: 'caregiver', label: t('onboarding.roleCaregiver') },
        ]}
      />
      <Field
        label={t('onboarding.name')}
        value={name}
        onChangeText={setName}
        autoComplete="off"
        error={showErrors && !name.trim() ? t('common.required') : undefined}
      />
      {role === 'caregiver' ? (
        <Field
          label={t('onboarding.caringFor')}
          placeholder={t('onboarding.caringForPlaceholder')}
          value={caringFor}
          onChangeText={setCaringFor}
        />
      ) : null}
      <ChoiceChips<Genotype>
        label={t('onboarding.genotype')}
        value={genotype}
        onChange={setGenotype}
        options={GENOTYPES.map((g) => ({ value: g, label: label(t, 'genotypes', g) }))}
      />
      <Field
        label={`${t('onboarding.birthYear')} (${t('common.optional')})`}
        value={birthYear}
        onChangeText={setBirthYear}
        keyboardType="number-pad"
        maxLength={4}
        error={showErrors && !yearValid ? t('common.invalidDate') : undefined}
      />
      <Field label={`${t('onboarding.region')} (${t('common.optional')})`} value={region} onChangeText={setRegion} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: space.md, paddingTop: space.xxl },
  center: { textAlign: 'center' },
  top: { paddingTop: space.lg },
  promise: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  flex: { flex: 1 },
  footerRow: { flexDirection: 'row', gap: space.sm },
});
