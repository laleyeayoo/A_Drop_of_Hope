import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Divider, ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Txt } from '@/components/Txt';
import { useHealthStore } from '@/data/store';
import { formatDate } from '@/domain/dates';
import type { Medication } from '@/domain/types';
import { locale } from '@/i18n';

export default function MedicationList() {
  const { t } = useTranslation();
  const medications = useHealthStore((s) => s.medications);
  const current = medications.filter((m) => !m.stoppedOn);
  const stopped = medications.filter((m) => m.stoppedOn);

  const renderList = (items: Medication[]) =>
    items.map((m, i) => (
      <View key={m.id}>
        {i > 0 ? <Divider /> : null}
        <ListRow
          title={m.name}
          subtitle={[
            [m.dose, m.frequency].filter(Boolean).join(' · '),
            m.stoppedOn ? t('meds.stoppedOn', { date: formatDate(m.stoppedOn, locale) }) : t(`meds.purposes.${m.purpose}`),
          ]
            .filter(Boolean)
            .join('\n')}
          onPress={() => router.push(`/medications/${m.id}`)}
        />
      </View>
    ));

  return (
    <Screen>
      <Stack.Screen options={{ title: t('meds.listTitle') }} />
      <Button label={t('meds.newTitle')} icon="add" onPress={() => router.push('/medications/new')} />
      <Section title={t('meds.active')}>
        <Card>{current.length ? renderList(current) : <Txt variant="muted">{t('meds.empty')}</Txt>}</Card>
      </Section>
      {stopped.length ? (
        <Section title={t('meds.stopped')}>
          <Card>{renderList(stopped)}</Card>
        </Section>
      ) : null}
    </Screen>
  );
}
