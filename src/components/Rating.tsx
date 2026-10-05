import { Pressable, StyleSheet, View } from 'react-native';

import { radius, space, useColors } from '@/theme';

import { Txt } from './Txt';

interface Props<T extends number> {
  label: string;
  /** Text for each level, lowest first. Its length decides how many levels there are. */
  levels: string[];
  /** Number of the first level (e.g. 0 or 1). */
  start: number;
  value: T | undefined;
  onChange: (value: T) => void;
}

/**
 * A row of numbered options, e.g. "how much did it help? 1–5". The meaning of
 * the selected number (or of the two ends of the scale) is shown underneath.
 */
export function Rating<T extends number>({ label, levels, start, value, onChange }: Props<T>) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <Txt variant="label">{label}</Txt>
      <View style={styles.row} accessibilityRole="radiogroup">
        {levels.map((text, i) => {
          const v = (start + i) as T;
          const selected = v === value;
          return (
            <Pressable
              key={text}
              onPress={() => onChange(v)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${v}: ${text}`}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? colors.accent : colors.surface,
                  borderColor: selected ? colors.accent : colors.border,
                },
              ]}>
              <Txt variant="label" color={selected ? colors.surface : colors.text}>
                {v}
              </Txt>
            </Pressable>
          );
        })}
      </View>
      <Txt variant="small" accessibilityElementsHidden importantForAccessibility="no">
        {value === undefined ? `${start} = ${levels[0]} · ${start + levels.length - 1} = ${levels[levels.length - 1]}` : `${value} = ${levels[value - start]}`}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  row: { flexDirection: 'row', gap: 6 },
  option: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xs,
  },
});
