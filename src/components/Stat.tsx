import { StyleSheet, View } from 'react-native';

import { radius, space, useColors } from '@/theme';

import { Txt } from './Txt';

/** A single headline number with a label. */
export function Stat({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Txt variant="title">{value}</Txt>
      <Txt variant="small">{label}</Txt>
    </View>
  );
}

export function StatRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  stat: {
    flexGrow: 1,
    flexBasis: 140,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
});
