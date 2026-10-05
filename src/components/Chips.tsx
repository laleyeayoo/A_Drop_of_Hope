import { Pressable, StyleSheet, View } from 'react-native';

import { radius, space, useColors } from '@/theme';

import { Txt } from './Txt';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SingleProps<T extends string> {
  label?: string;
  options: Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
}

interface MultiProps<T extends string> {
  label?: string;
  options: Option<T>[];
  values: T[];
  onChange: (values: T[]) => void;
}

function Chip({ label, selected, onPress, multi }: { label: string; selected: boolean; onPress: () => void; multi: boolean }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={multi ? { checked: selected } : { selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
        pressed && styles.pressed,
      ]}>
      <Txt variant="small" color={selected ? colors.onPrimary : colors.text} style={styles.text}>
        {selected && multi ? '✓ ' : ''}
        {label}
      </Txt>
    </Pressable>
  );
}

/** Pick exactly one option. */
export function ChoiceChips<T extends string>({ label, options, value, onChange }: SingleProps<T>) {
  return (
    <View style={styles.wrap} accessibilityRole="radiogroup">
      {label ? <Txt variant="label">{label}</Txt> : null}
      <View style={styles.row}>
        {options.map((o) => (
          <Chip key={o.value} label={o.label} selected={o.value === value} onPress={() => onChange(o.value)} multi={false} />
        ))}
      </View>
    </View>
  );
}

/** Pick any number of options. */
export function MultiChips<T extends string>({ label, options, values, onChange }: MultiProps<T>) {
  const toggle = (v: T) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <View style={styles.wrap}>
      {label ? <Txt variant="label">{label}</Txt> : null}
      <View style={styles.row}>
        {options.map((o) => (
          <Chip key={o.value} label={o.label} selected={values.includes(o.value)} onPress={() => toggle(o.value)} multi />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    minHeight: 40,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
  },
  text: { fontWeight: '500' },
  pressed: { opacity: 0.7 },
});
