/**
 * Colors, spacing and type sizes. Screens never hard-code colors — they use
 * `useColors()` so light and dark mode both work.
 */
import { useColorScheme } from 'react-native';

const light = {
  background: '#FAF8F6',
  surface: '#FFFFFF',
  surfaceAlt: '#F3EFEC',
  border: '#E3DDD8',
  text: '#1C1917',
  textMuted: '#57534E',
  primary: '#A4161A', // deep blood-red (the "drop"); 7:1 contrast with white
  onPrimary: '#FFFFFF',
  primarySoft: '#FBE9E9',
  accent: '#1C5CAB',
  accentSoft: '#E6EFFB',
  success: '#1B6E3A',
  successSoft: '#E5F4EA',
  warning: '#8A5A00',
  warningSoft: '#FFF3D6',
  chart: '#2A78D6',
  chartGrid: '#E7E3DF',
};

const dark: typeof light = {
  background: '#141211',
  surface: '#1F1C1A',
  surfaceAlt: '#2A2624',
  border: '#3A3532',
  text: '#F5F2EF',
  textMuted: '#B9B2AC',
  primary: '#F0605D',
  onPrimary: '#1A0000',
  primarySoft: '#3A1D1C',
  accent: '#7EB0EE',
  accentSoft: '#1B2A3D',
  success: '#6FCF97',
  successSoft: '#163323',
  warning: '#F2C14E',
  warningSoft: '#3A2F12',
  chart: '#3987E5',
  chartGrid: '#34302D',
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

/**
 * Pain-scale colors (0 → 10), green → amber → red. Always shown next to the
 * number, never as color alone.
 */
export const PAIN_COLORS = [
  '#2E7D32', '#43A047', '#7CB342', '#C0CA33', '#FDD835',
  '#FFB300', '#FB8C00', '#F4511E', '#E53935', '#C62828', '#8E0000',
];

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
export const font = { sm: 13, md: 15, lg: 17, xl: 20, xxl: 26, hero: 34 } as const;

/** Content never gets wider than this on big screens (web/tablets). */
export const MAX_WIDTH = 720;
