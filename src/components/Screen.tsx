import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { MAX_WIDTH, space, useColors } from '@/theme';

/** Scrollable page wrapper with consistent padding and a max width on big screens. */
export function Screen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const colors = useColors();
  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>{children}</View>
      </ScrollView>
      {footer ? (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={styles.inner}>{footer}</View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: space.lg, paddingBottom: space.xxl * 2, alignItems: 'center' },
  inner: { width: '100%', maxWidth: MAX_WIDTH, gap: space.lg },
  footer: { padding: space.md, borderTopWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
});
