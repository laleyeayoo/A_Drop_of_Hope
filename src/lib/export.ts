import { Platform, Share } from 'react-native';

import { exportData } from '@/data/store';
import { dayKey } from '@/domain/dates';

/**
 * Lets people take a full copy of their data. On the web this downloads a
 * JSON file; on phones it opens the share sheet (save to Files, email, etc.).
 */
export async function exportMyData(): Promise<void> {
  const json = JSON.stringify(exportData(), null, 2);
  const filename = `a-drop-of-hope-${dayKey(new Date())}.json`;
  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ title: filename, message: json });
}
