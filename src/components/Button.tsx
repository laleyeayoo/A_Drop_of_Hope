import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { font, radius, space, useColors } from '@/theme';

import { Txt } from './Txt';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  large?: boolean;
}

export function Button({ label, onPress, variant = 'primary', icon, disabled, large }: Props) {
  const colors = useColors();
  const palette = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
    danger: { bg: colors.surface, fg: colors.primary, border: colors.primary },
    ghost: { bg: 'transparent', fg: colors.accent, border: 'transparent' },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        large && styles.large,
        { backgroundColor: palette.bg, borderColor: palette.border },
        (pressed || disabled) && styles.dim,
      ]}>
      <View style={styles.row}>
        {icon ? <Ionicons name={icon} size={large ? 22 : 18} color={palette.fg} /> : null}
        <Txt variant="label" color={palette.fg} style={large && styles.largeText}>
          {label}
        </Txt>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  large: { minHeight: 60 },
  largeText: { fontSize: font.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dim: { opacity: 0.6 },
});
