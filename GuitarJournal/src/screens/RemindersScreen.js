import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getReminderSettings, saveReminderSettings } from '../storage';
import {
  notificationsSupported, requestNotificationPermission, sendTestNotification,
} from '../utils/reminders';
import Card from '../components/Card';
import { colors, spacing, radius } from '../theme';
import { showAlert } from '../utils/alert';

function pad(n) { return n.toString().padStart(2, '0'); }

export default function RemindersScreen() {
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(18);
  const [minute, setMinute] = useState(0);
  const [permission, setPermission] = useState('default');

  const load = useCallback(async () => {
    const settings = await getReminderSettings();
    setEnabled(settings.enabled);
    setHour(settings.hour);
    setMinute(settings.minute);
    if (notificationsSupported()) setPermission(window.Notification.permission);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = async next => {
    await saveReminderSettings(next);
    setEnabled(next.enabled);
    setHour(next.hour);
    setMinute(next.minute);
  };

  const handleToggle = async () => {
    if (!notificationsSupported()) {
      showAlert('Not supported', 'Browser notifications aren\'t supported in this environment.');
      return;
    }
    if (!enabled) {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result !== 'granted') {
        showAlert('Permission needed', 'Allow notifications in your browser to enable reminders.');
        return;
      }
    }
    await save({ enabled: !enabled, hour, minute });
  };

  const handleTimeChange = async (h, m) => {
    const nh = Math.max(0, Math.min(23, h));
    const nm = Math.max(0, Math.min(59, m));
    await save({ enabled, hour: nh, minute: nm });
  };

  const handleTest = () => {
    if (permission !== 'granted') {
      showAlert('Permission needed', 'Enable reminders first to grant notification permission.');
      return;
    }
    const sent = sendTestNotification();
    if (!sent) showAlert('Could not send', 'Notifications are not available right now.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        Get a browser notification if you haven't practiced by a set time. Only fires while this tab is open — there's no background push server.
      </Text>

      {!notificationsSupported() && (
        <Card>
          <Text style={styles.warning}>Browser notifications aren't available on this platform yet.</Text>
        </Card>
      )}

      <Card>
        <View style={styles.row}>
          <Text style={styles.label}>Daily reminder</Text>
          <TouchableOpacity
            style={[styles.toggle, enabled && styles.toggleOn]}
            onPress={handleToggle}
            disabled={!notificationsSupported()}
          >
            <View style={[styles.toggleDot, enabled && styles.toggleDotOn]} />
          </TouchableOpacity>
        </View>
      </Card>

      {enabled && (
        <Card>
          <Text style={styles.label}>Remind me at</Text>
          <View style={styles.timeRow}>
            <TextInput
              style={styles.timeInput}
              keyboardType="number-pad"
              value={pad(hour)}
              onChangeText={v => handleTimeChange(parseInt(v, 10) || 0, minute)}
            />
            <Text style={styles.colon}>:</Text>
            <TextInput
              style={styles.timeInput}
              keyboardType="number-pad"
              value={pad(minute)}
              onChangeText={v => handleTimeChange(hour, parseInt(v, 10) || 0)}
            />
          </View>
        </Card>
      )}

      <TouchableOpacity style={styles.testBtn} onPress={handleTest}>
        <Text style={styles.testBtnText}>Send test notification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 48 },
  subtitle: { fontSize: 13, color: colors.textSub, marginBottom: spacing.lg, lineHeight: 18 },
  warning: { fontSize: 13, color: '#e8b060' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  toggle: { width: 46, height: 26, borderRadius: 13, backgroundColor: colors.surfaceAlt, padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.accent },
  toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.textMuted },
  toggleDotOn: { backgroundColor: '#fff', alignSelf: 'flex-end' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  timeInput: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, color: colors.text, fontSize: 16, width: 56, textAlign: 'center' },
  colon: { color: colors.text, fontSize: 16, fontWeight: '700' },
  testBtn: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.accentBorder, marginTop: spacing.md },
  testBtnText: { color: colors.accentLight, fontWeight: '600', fontSize: 14 },
});
