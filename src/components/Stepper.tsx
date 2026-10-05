import { Pressable, StyleSheet, View } from 'react-native';

import { radius, space, useColors } from '@/theme';

import { Txt } from './Txt';

interface Props {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/** A number picker with − and + buttons (no keyboard needed). */
export function Stepper({ label, value, onChange, min = 0, max = 99, step = 1 }: Props) {
  const colors = useColors();
  const current = value ?? min;
  const button = (text: string, next: number, a11y: string) => (
    <Pressable
      onPress={() => onChange(Math.max(min, Math.min(max, next)))}
      accessibilityRole="button"
      accessibilityLabel={`${a11y} ${label}`}
      style={[styles.button, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Txt variant="title">{text}</Txt>
    </Pressable>
  );
  return (
    <View style={styles.row}>
      <Txt variant="label" style={styles.label}>
        {label}
      </Txt>
      {button('−', current - step, 'Decrease')}
      <Txt variant="heading" style={styles.value} accessibilityLiveRegion="polite">
        {value === undefined ? '–' : value}
      </Txt>
      {button('+', value === undefined ? min : current + step, 'Increase')}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  label: { flex: 1 },
  button: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { minWidth: 36, textAlign: 'center' },
});
