import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Divider, ListRow } from '@/components/ListRow';
import { PainBadge } from '@/components/PainScale';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useHealthStore } from '@/data/store';
import { formatDate } from '@/domain/dates';
import { crisisDurationDays } from '@/domain/insights';
import { locale } from '@/i18n';

export default function CrisisList() {
  const { t } = useTranslation();
  const crises = useHealthStore((s) => s.crises);

  return (
    <Screen>
      <Stack.Screen options={{ title: t('crisis.listTitle') }} />
      <Button label={t('crisis.newTitle')} icon="add" onPress={() => router.push('/crises/new')} />
      <Card>
        {crises.length === 0 ? (
          <Txt variant="muted">{t('crisis.empty')}</Txt>
        ) : (
          crises.map((c, i) => {
            const days = Math.max(1, Math.round(crisisDurationDays(c)));
            const status = c.endedAt ? t('common.days', { count: days }) : t('common.ongoing');
            return (
              <View key={c.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  title={formatDate(c.startedAt, locale)}
                  subtitle={`${t(`crisis.settings.${c.setting}`)} · ${status}`}
                  right={<PainBadge value={c.peakPain} />}
                  onPress={() => router.push(`/crises/${c.id}`)}
                />
              </View>
            );
          })
        )}
      </Card>
    </Screen>
  );
}
