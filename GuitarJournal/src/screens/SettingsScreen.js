import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../components/Card';
import { colors, spacing } from '../theme';

const ITEMS = [
  { key: 'Durations', label: 'Durations', desc: 'Manage quick-pick session lengths', icon: '⏱️' },
  { key: 'Techniques', label: 'Techniques', desc: 'Manage technique tags for logging', icon: '🎼' },
];

export default function SettingsScreen({ navigation }) {
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
