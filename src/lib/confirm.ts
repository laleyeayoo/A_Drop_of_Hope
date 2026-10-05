import { Alert, Platform } from 'react-native';

/**
 * Asks the person to confirm something (e.g. deleting data).
 * `Alert` does not work on the web, so we use the browser's confirm there.
 */
export function confirm(message: string, onConfirm: () => void, confirmLabel = 'OK', cancelLabel = 'Cancel') {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(message)) onConfirm();
    return;
  }
  Alert.alert('', message, [
    { text: cancelLabel, style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}

/** Shows a short message. */
export function notify(message: string) {
  if (Platform.OS === 'web') globalThis.alert?.(message);
  else Alert.alert('', message);
}
