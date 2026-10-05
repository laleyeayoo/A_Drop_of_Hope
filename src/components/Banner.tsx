import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { radius, space, useColors } from '@/theme';

import { Txt } from './Txt';

const ICONS = { info: 'information-circle', warning: 'warning', danger: 'alert-circle' } as const;

/** A colored notice with an icon (never color alone). */
export function Banner({ text, tone = 'info' }: { text: string; tone?: keyof typeof ICONS }) {
  const colors = useColors();
  const palette = {
    info: { bg: colors.accentSoft, fg: colors.accent },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    danger: { bg: colors.primarySoft, fg: colors.primary },
  }[tone];
  return (
    <View style={[styles.banner, { backgroundColor: palette.bg }]} accessibilityRole={tone === 'danger' ? 'alert' : undefined}>
      <Ionicons name={ICONS[tone]} size={20} color={palette.fg} />
      <Txt variant="small" color={colors.text} style={styles.text}>
        {text}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', gap: space.sm, padding: space.md, borderRadius: radius.md, alignItems: 'flex-start' },
  text: { flex: 1 },
});
