import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import { colors, spacing } from '../theme';
import { exportAllData, importAllData } from '../storage';

const ITEMS = [
  { key: 'Durations', label: 'Durations', desc: 'Manage quick-pick session lengths', icon: '⏱️' },
  { key: 'Techniques', label: 'Techniques', desc: 'Manage technique tags for logging', icon: '🎼' },
];

function downloadJson(obj, filename) {
  const json = JSON.stringify(obj, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// react-native-web's Alert.alert is a no-op, so use the browser's dialogs there.
function notify(title, message) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

function confirmDestructive(title, message, onConfirm) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Import', style: 'destructive', onPress: onConfirm },
    ]);
  }
}

export default function SettingsScreen({ navigation }) {
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    if (Platform.OS !== 'web') {
      notify('Web only', 'Export is currently only available in the browser.');
      return;
    }
    try {
      const backup = await exportAllData();
      const date = new Date().toISOString().slice(0, 10);
      downloadJson(backup, `guitar-journal-backup-${date}.json`);
    } catch (e) {
      notify('Export failed', e.message ?? 'Something went wrong.');
    }
  };

  const handleImportPress = () => {
    if (Platform.OS !== 'web') {
      notify('Web only', 'Import is currently only available in the browser.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelected = event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(reader.result);
      } catch {
        notify('Import failed', 'That file is not valid JSON.');
        return;
      }

      confirmDestructive(
        'Replace all data?',
        'Importing will overwrite all existing sessions, songs, goals, durations, and techniques with the contents of this file.',
        async () => {
          try {
            await importAllData(parsed);
            notify('Import complete', 'Your data has been restored.');
          } catch (e) {
            notify('Import failed', e.message ?? 'Something went wrong.');
          }
        }
      );
    };
    reader.readAsText(file);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Manage the options used when logging sessions</Text>

      <Card style={{ padding: 0 }}>
        {ITEMS.map((item, i) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.row, i === ITEMS.length - 1 && { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate(item.key)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </Card>

      <SectionHeader title="Data" />
      <Card style={{ padding: 0 }}>
        <TouchableOpacity style={styles.row} onPress={handleExport}>
          <Text style={styles.icon}>⬇️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Export Data</Text>
            <Text style={styles.desc}>Download all your data as a JSON file</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={handleImportPress}>
          <Text style={styles.icon}>⬆️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Import Data</Text>
            <Text style={styles.desc}>Restore from a previously exported file</Text>
          </View>
        </TouchableOpacity>
      </Card>

      {Platform.OS === 'web' && (
        // eslint-disable-next-line react/no-unknown-property
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleFileSelected}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textSub, marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  icon: { fontSize: 22 },
  label: { fontSize: 15, fontWeight: '600', color: colors.text },
  desc: { fontSize: 12, color: colors.textSub, marginTop: 2 },
  chevron: { fontSize: 20, color: colors.textMuted },
});
