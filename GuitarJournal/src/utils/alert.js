import { Alert, Platform } from 'react-native';

// react-native-web's Alert.alert is a no-op, so route through the browser's
// dialogs there. Mirrors the Alert.alert(title, message, buttons) signature
// so call sites don't need to change beyond the import.
export function showAlert(title, message, buttons) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }
  const list = buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }];
  const cancelBtn = list.find(b => b.style === 'cancel');
  const actionBtn = list.find(b => b !== cancelBtn) ?? list[0];

  if (list.length >= 2 && cancelBtn) {
    const confirmed = window.confirm(message ? `${title}\n\n${message}` : title);
    if (confirmed) actionBtn?.onPress?.();
    else cancelBtn?.onPress?.();
  } else {
    window.alert(message ? `${title}\n\n${message}` : title);
    actionBtn?.onPress?.();
  }
}
