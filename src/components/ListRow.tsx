import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { space, useColors } from '@/theme';

import { Txt } from './Txt';

interface Props {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  icon?: ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
}

/** One row in a list. Shows a chevron when tappable. */
export function ListRow({ title, subtitle, right, icon, onPress }: Props) {
  const colors = useColors();
  const content = (
    <View style={styles.row}>
      {icon ? <Ionicons name={icon} size={22} color={colors.primary} /> : null}
      <View style={styles.text}>
        <Txt variant="label">{title}</Txt>
        {subtitle ? <Txt variant="small">{subtitle}</Txt> : null}
      </View>
      {right}
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

/** Thin line between rows. */
export function Divider() {
  const colors = useColors();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48, paddingVertical: space.xs },
  text: { flex: 1, gap: 2 },
  pressed: { opacity: 0.6 },
  divider: { height: StyleSheet.hairlineWidth },
});
