import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, space, useColors } from '@/theme';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  tone?: 'default' | 'primary' | 'accent' | 'warning' | 'success';
  accessibilityLabel?: string;
}

/** A rounded box that groups related content. Pass `onPress` to make it tappable. */
export function Card({ children, onPress, style, tone = 'default', accessibilityLabel }: Props) {
  const colors = useColors();
  const background = {
    default: colors.surface,
    primary: colors.primarySoft,
    accent: colors.accentSoft,
    warning: colors.warningSoft,
    success: colors.successSoft,
  }[tone];
  const cardStyle = [styles.card, { backgroundColor: background, borderColor: colors.border }, style];
  if (!onPress) return <View style={cardStyle}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: space.lg, gap: space.sm },
  pressed: { opacity: 0.75 },
});
