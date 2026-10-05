import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { space, useColors } from '@/theme';

const TRIALS_URL = 'https://clinicaltrials.gov/search?cond=Sickle%20Cell%20Disease';

/** Placeholder for the Phase 2 community. Shows what's coming so we can get feedback in interviews. */
export default function Connect() {
  const { t } = useTranslation();
  const colors = useColors();
  const features: { icon: ComponentProps<typeof Ionicons>['name']; title: string; body: string }[] = [
    { icon: 'chatbubbles', title: t('connect.stories'), body: t('connect.storiesBody') },
    { icon: 'people', title: t('connect.groups'), body: t('connect.groupsBody') },
    { icon: 'heart', title: t('connect.fundraisers'), body: t('connect.fundraisersBody') },
    { icon: 'flask', title: t('connect.trials'), body: t('connect.trialsBody') },
  ];

  return (
    <Screen>
      <Txt variant="title" accessibilityRole="header">
        {t('connect.title')}
      </Txt>
      <Txt variant="muted">{t('connect.intro')}</Txt>
      {features.map((f) => (
        <Card key={f.title}>
          <View style={styles.row}>
            <Ionicons name={f.icon} size={24} color={colors.primary} />
            <Txt variant="heading" style={styles.flex}>
              {f.title}
            </Txt>
          </View>
          <Txt variant="muted">{f.body}</Txt>
        </Card>
      ))}
      <Button label={t('connect.browseTrials')} icon="open-outline" variant="secondary" onPress={() => Linking.openURL(TRIALS_URL)} />
      <Card tone="accent">
        <Txt>{t('connect.feedback')}</Txt>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1 },
});
