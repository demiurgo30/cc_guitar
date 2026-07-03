import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSessions, getSongs, getGoals, buildPracticeHeatmap } from '../storage';
import { computeBadges } from '../utils/badges';
import { computeSummary } from '../utils/insights';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import Heatmap from '../components/Heatmap';
import { colors, spacing, radius } from '../theme';

function fmtMinutes(m) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), min = m % 60;
  return min ? `${h}h ${min}m` : `${h}h`;
}

export default function ProgressScreen() {
  const [sessions, setSessions] = useState([]);
  const [songs, setSongs] = useState([]);
  const [goals, setGoals] = useState([]);
  const [range, setRange] = useState('week'); // 'week' | 'month'

  useFocusEffect(useCallback(() => {
    Promise.all([getSessions(), getSongs(), getGoals()]).then(([s, sg, g]) => {
      setSessions(s); setSongs(sg); setGoals(g);
    });
  }, []));

  const heatmapDays = buildPracticeHeatmap(sessions, 16);
  const badges = computeBadges({ sessions, songs, goals });
  const summary = computeSummary(sessions, songs, { rangeDays: range === 'week' ? 7 : 30 });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Progress</Text>
      <Text style={styles.subtitle}>Your practice trends and milestones</Text>

      <SectionHeader title="Practice heatmap" />
      <Card>
        <Heatmap days={heatmapDays} />
      </Card>

      <SectionHeader title="Summary" />
      <Card>
        <View style={styles.toggleRow}>
          {['week', 'month'].map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.toggleBtn, range === r && styles.toggleBtnActive]}
              onPress={() => setRange(r)}
            >
              <Text style={[styles.toggleText, range === r && styles.toggleTextActive]}>
                {r === 'week' ? 'This week' : 'This month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.summaryLine}>
          <Text style={styles.summaryStrong}>{fmtMinutes(summary.totalMinutes)}</Text> practiced across{' '}
          <Text style={styles.summaryStrong}>{summary.sessionCount}</Text> session{summary.sessionCount === 1 ? '' : 's'}.
        </Text>
        {summary.mostPracticedSong && (
          <Text style={styles.summaryLine}>
            Most practiced: <Text style={styles.summaryStrong}>{summary.mostPracticedSong}</Text>
          </Text>
        )}
        {summary.biggestGainSong && (
          <Text style={styles.summaryLine}>
            Biggest improvement: <Text style={styles.summaryStrong}>{summary.biggestGainSong}</Text> (+{summary.biggestGainAmount} pts)
          </Text>
        )}
        {summary.sessionCount === 0 && (
          <Text style={styles.summaryEmpty}>No sessions logged in this period yet.</Text>
        )}
      </Card>

      <SectionHeader title="Milestones" />
      <View style={styles.badgeGrid}>
        {badges.map(b => (
          <View key={b.id} style={[styles.badgeCard, !b.achieved && styles.badgeCardLocked]}>
            <Text style={[styles.badgeIcon, !b.achieved && styles.badgeIconLocked]}>{b.icon}</Text>
            <Text style={[styles.badgeLabel, !b.achieved && styles.badgeLabelLocked]}>{b.label}</Text>
            <Text style={styles.badgeDesc}>{b.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textSub, marginBottom: spacing.lg },
  toggleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  toggleBtn: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingVertical: 8, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: colors.accent },
  toggleText: { fontSize: 13, color: colors.textSub, fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
  summaryLine: { fontSize: 14, color: colors.text, marginBottom: 6, lineHeight: 20 },
  summaryStrong: { fontWeight: '700', color: colors.accentLight },
  summaryEmpty: { fontSize: 13, color: colors.textMuted },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badgeCard: { width: '47%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.accentBorder },
  badgeCardLocked: { borderColor: colors.border, opacity: 0.5 },
  badgeIcon: { fontSize: 26, marginBottom: 4 },
  badgeIconLocked: { opacity: 0.5 },
  badgeLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 2 },
  badgeLabelLocked: { color: colors.textMuted },
  badgeDesc: { fontSize: 11, color: colors.textSub },
});
