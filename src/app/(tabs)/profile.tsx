import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Switch, View } from 'react-native';

import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Divider, ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Txt } from '@/components/Txt';
import { useHealthStore } from '@/data/store';
import { confirm } from '@/lib/confirm';
import { exportMyData } from '@/lib/export';
import { label } from '@/lib/labels';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const profile = useHealthStore((s) => s.profile);
  if (!profile) return null;

  const rows: [string, string | undefined][] = [
    [t('profile.role'), label(t, 'roles', profile.role) + (profile.caringFor ? ` · ${profile.caringFor}` : '')],
    [t('profile.genotype'), label(t, 'genotypes', profile.genotype)],
    [t('profile.birthYear'), profile.birthYear?.toString()],
    [t('profile.region'), profile.region],
    [t('profile.hematologist'), profile.hematologist],
  ];

  return (
    <Screen>
      <Txt variant="title" accessibilityRole="header">
        {profile.name}
      </Txt>
      <Section title={t('profile.about')}>
        <Card>
          {rows.map(([title, value], i) => (
            <View key={title}>
              {i > 0 ? <Divider /> : null}
              <ListRow title={title} right={<Txt variant="muted">{value || t('common.notSet')}</Txt>} />
            </View>
          ))}
        </Card>
        <Button label={t('profile.editProfile')} icon="create" variant="secondary" onPress={() => router.push('/profile-edit')} />
      </Section>

      <Section title={t('profile.privacy')}>
        <Banner tone="warning" text={t('profile.storageNote')} />
        <Card>
          <ListRow
            icon="flask"
            title={t('profile.researchSharing')}
            subtitle={t('profile.researchSharingNote')}
            right={<Switch value={false} disabled accessibilityLabel={t('profile.researchSharing')} />}
          />
        </Card>
        <Card>
          <ListRow icon="download" title={t('profile.export')} subtitle={t('profile.exportHint')} onPress={() => exportMyData()} />
          <Divider />
          <ListRow
            icon="sparkles"
            title={t('profile.loadDemo')}
            onPress={() =>
              confirm(t('profile.loadDemoConfirm'), () => useHealthStore.getState().loadDemoData(), t('common.yes'), t('common.cancel'))
            }
          />
        </Card>
        <Button
          label={t('profile.deleteAll')}
          icon="trash"
          variant="danger"
          onPress={() =>
            confirm(t('profile.deleteAllConfirm'), () => useHealthStore.getState().deleteAllData(), t('common.delete'), t('common.cancel'))
          }
        />
      </Section>
      <Txt variant="small">{t('profile.version', { version: Constants.expoConfig?.version ?? '0' })}</Txt>
    </Screen>
  );
}
