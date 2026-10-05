import Ionicons from '@expo/vector-icons/Ionicons';
import Tabs from 'expo-router/js-tabs';
import { useTranslation } from 'react-i18next';

import { useColors } from '@/theme';

export default function TabLayout() {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.health'),
          tabBarIcon: ({ color, size }) => <Ionicons name="water" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          title: t('tabs.connect'),
          tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
