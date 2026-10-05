import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { space, useColors } from '@/theme';

import { Txt } from './Txt';

const LABEL_WIDTH = 64;

export interface Bar {
  key: string;
  /** Short x-axis label (may be hidden when there are many bars). */
  label: string;
  /** Undefined = no data for this bar (drawn as a small gap marker). */
  value?: number;
  /** Full description read by screen readers and shown when tapped. */
  detail: string;
}

interface Props {
  bars: Bar[];
  /** Top of the scale. Defaults to the largest value. */
  max?: number;
  height?: number;
  /** Print each value above its bar (use when there are few bars). */
  showValues?: boolean;
  /** Show every Nth x-axis label. */
  labelEvery?: number;
}

/**
 * A simple single-series column chart built from plain Views so it works the
 * same on iOS, Android and web. Tap a bar to see its details.
 */
export function BarChart({ bars, max, height = 140, showValues, labelEvery = 1 }: Props) {
  const colors = useColors();
  const [selected, setSelected] = useState<string | undefined>();
  const top = Math.max(1, max ?? Math.max(0, ...bars.map((b) => b.value ?? 0)));
  const selectedBar = bars.find((b) => b.key === selected);

  return (
    <View style={styles.wrap}>
      <View style={[styles.plot, { height: height + (showValues ? 20 : 0), borderBottomColor: colors.chartGrid }]}>
        {bars.map((bar) => {
          // A zero still gets a thin bar so it looks different from "no data".
          const h = bar.value ? Math.max(3, (bar.value / top) * height) : 2;
          const isSelected = bar.key === selected;
          return (
            <Pressable
              key={bar.key}
              style={styles.slot}
              onPress={() => setSelected(isSelected ? undefined : bar.key)}
              accessibilityRole="button"
              accessibilityLabel={bar.detail}
              accessibilityState={{ selected: isSelected }}>
              {showValues && bar.value !== undefined ? (
                <Txt variant="small" style={styles.value}>
                  {bar.value}
                </Txt>
              ) : null}
              {bar.value === undefined ? (
                <View style={[styles.noData, { backgroundColor: colors.chartGrid }]} />
              ) : (
                <View
                  style={[
                    styles.bar,
                    { height: h, backgroundColor: colors.chart },
                    selected && !isSelected && styles.faded,
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
      {/* x-axis labels are positioned under their bar but may be wider than it. */}
      <View style={styles.labels}>
        {bars.map((bar, i) => {
          if (i % labelEvery !== 0) return null;
          // With sparse labels, pin the first/last to the edges so they are not cut off.
          const first = labelEvery > 1 && i === 0;
          const last = labelEvery > 1 && i === bars.length - 1;
          const position = first
            ? { left: 0 }
            : last
              ? { right: 0 }
              : { left: `${((i + 0.5) / bars.length) * 100}%` as const, marginLeft: -LABEL_WIDTH / 2 };
          return (
            <Txt
              key={bar.key}
              variant="small"
              numberOfLines={1}
              style={[styles.label, position, { textAlign: first ? 'left' : last ? 'right' : 'center' }]}>
              {bar.label}
            </Txt>
          );
        })}
      </View>
      <Txt variant="small" style={styles.detail} accessibilityLiveRegion="polite">
        {selectedBar ? selectedBar.detail : ' '}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  plot: { flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: 1, gap: 2 },
  slot: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  bar: { width: '100%', maxWidth: 24, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  noData: { width: '60%', maxWidth: 12, height: 2, borderRadius: 1 },
  faded: { opacity: 0.35 },
  value: { marginBottom: 2 },
  labels: { height: 16 },
  label: { position: 'absolute', top: 0, fontSize: 11, width: LABEL_WIDTH },
  detail: { minHeight: 18 },
});
