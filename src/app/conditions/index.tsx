import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Divider, ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useHealthStore } from '@/data/store';
import { CONDITION_STATUSES } from '@/domain/catalog';
import { conditionName } from '@/lib/labels';

export default function ConditionList() {
  const { t } = useTranslation();
  const conditions = useHealthStore((s) => s.conditions);
  const episodes = useHealthStore((s) => s.episodes);
  // Active first, then managed, then resolved.
  const sorted = [...conditions].sort(
    (a, b) => CONDITION_STATUSES.indexOf(a.status) - CONDITION_STATUSES.indexOf(b.status)
  );

  return (
    <Screen>
      <Stack.Screen options={{ title: t('conditions.listTitle') }} />
      <Txt variant="muted">{t('conditions.intro')}</Txt>
      <Button label={t('conditions.newTitle')} icon="add" onPress={() => router.push('/conditions/new')} />
      <Card>
        {sorted.length === 0 ? (
          <Txt variant="muted">{t('conditions.empty')}</Txt>
        ) : (
          sorted.map((c, i) => {
            const count = episodes.filter((e) => e.conditionId === c.id).length;
            return (
              <View key={c.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  title={conditionName(t, c)}
                  subtitle={[
                    t(`conditions.statuses.${c.status}`),
                    c.diagnosedOn ? t('conditions.diagnosed', { date: c.diagnosedOn }) : '',
                    count ? t('conditions.episodeCount', { count }) : '',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  onPress={() => router.push(`/conditions/${c.id}`)}
                />
              </View>
            );
          })
        )}
      </Card>
    </Screen>
  );
}
