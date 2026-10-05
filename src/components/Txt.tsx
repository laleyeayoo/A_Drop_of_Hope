import { StyleSheet, Text, type TextProps } from 'react-native';

import { font, useColors } from '@/theme';

type Variant = 'hero' | 'title' | 'heading' | 'body' | 'label' | 'muted' | 'small';

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
}

/** App text. Use `variant` instead of setting font sizes by hand. */
export function Txt({ variant = 'body', color, style, ...rest }: Props) {
  const colors = useColors();
  const muted = variant === 'muted' || variant === 'small';
  return (
    <Text
      style={[styles[variant], { color: color ?? (muted ? colors.textMuted : colors.text) }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  hero: { fontSize: font.hero, fontWeight: '700' },
  title: { fontSize: font.xxl, fontWeight: '700' },
  heading: { fontSize: font.lg, fontWeight: '600' },
  body: { fontSize: font.md, lineHeight: 21 },
  label: { fontSize: font.md, fontWeight: '600' },
  muted: { fontSize: font.md, lineHeight: 21 },
  small: { fontSize: font.sm, lineHeight: 18 },
});
