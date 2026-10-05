import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { font, radius, space, useColors } from '@/theme';

import { Txt } from './Txt';

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  hint?: string;
  error?: string;
}

/** A labeled text input. */
export function Field({ label, hint, error, multiline, ...rest }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <Txt variant="label">{label}</Txt>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.multiline,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: error ? colors.primary : colors.border,
          },
        ]}
        {...rest}
      />
      {error ? (
        <Txt variant="small" color={colors.primary}>
          {error}
        </Txt>
      ) : hint ? (
        <Txt variant="small">{hint}</Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: font.md,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
});
