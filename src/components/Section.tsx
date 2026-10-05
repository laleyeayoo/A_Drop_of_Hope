import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { space } from '@/theme';

import { Txt } from './Txt';

/** A titled group of content, with an optional action on the right (e.g. "Add"). */
export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Txt variant="heading" accessibilityRole="header" style={styles.title}>
          {title}
        </Txt>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  title: { flex: 1 },
});
