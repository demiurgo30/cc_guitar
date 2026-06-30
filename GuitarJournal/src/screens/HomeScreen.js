import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSessions, getSongs, getGoals, computeStreak, totalMinutesThisWeek } from '../storage';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import { colors, spacing, radius } from '../theme';

function fmtMinutes(m) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), min = m % 60;
  return min ? `${h}h ${min}m` : `${h}h`;
}

function fmtDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function HomeScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [songs, setSongs] = useState([]);
  const [goals, setGoals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [s, sg, g] = await Promise.all([getSessions(), getSongs(), getGoals()]);
    setSessions(s);
    setSongs(sg);
    setGoals(g);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const streak = computeStreak(sessions);
  const weekMinutes = totalMinutesThisWeek(sessions);
  const lastSession = sessions[0];
  const openGoals = goals.filter(g => !g.completed).slice(0, 3);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentLight} />}
    >
      <Text style={styles.greeting}>{greeting} 🎸</Text>
      <Text style={styles.date}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>

      {/* Streak */}
      <Card style={styles.streakCard}>
        <Text style={styles.flame}>🔥</Text>
        <View>
          <Text style={styles.streakValue}>{streak} day streak</Text>
          <Text style={styles.streakSub}>{streak > 0 ? 'Keep it going!' : 'Start practicing today!'}</Text>
        </View>
      </Card>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: fmtMinutes(weekMinutes), label: 'This week' },
          { value: sessions.length.toString(), label: 'Sessions' },
          { value: songs.length.toString(), label: 'Songs' },
        ].map(({ value, label }) => (
          <Card key={label} style={styles.statCard}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </Card>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Log')}>
        <Text style={styles.btnText}>+ Log Practice Session</Text>
      </TouchableOpacity>

      {/* Last session */}
      {lastSession && (
        <>
          <SectionHeader title="Last session" />
          <Card>
            <View style={styles.row}>
              <Text style={styles.histDate}>{fmtDate(lastSession.date)}</Text>
              <Text style={styles.histDur}>{fmtMinutes(lastSession.durationMinutes ?? 0)}</Text>
            </View>
            {lastSession.songs?.length > 0 && (
              <Text style={styles.histSongs}>{lastSession.songs.join(' · ')}</Text>
            )}
            {lastSession.techniques?.length > 0 && (
              <View style={styles.pills}>
                {lastSession.techniques.map(t => (
                  <View key={t} style={styles.pill}><Text style={styles.pillText}>{t}</Text></View>
                ))}
              </View>
            )}
          </Card>
        </>
      )}

      {/* Open goals */}
      {openGoals.length > 0 && (
        <>
          <SectionHeader title="Open goals" />
          <Card>
            {openGoals.map((g, i) => (
              <View key={g.id} style={[styles.goalRow, i === openGoals.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.checkbox} />
                <Text style={styles.goalText}>{g.text}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {sessions.length === 0 && goals.length === 0 && (
        <Text style={styles.empty}>Log your first session to get started!</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 40 },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 },
  date: { fontSize: 13, color: colors.textSub, marginBottom: spacing.lg },
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.accentBorder, backgroundColor: '#0d1628' },
  flame: { fontSize: 36 },
  streakValue: { fontSize: 22, fontWeight: '800', color: colors.accentLight },
  streakSub: { fontSize: 12, color: colors.textSub },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: 0 },
  statCard: { flex: 1, alignItems: 'center', marginBottom: spacing.md },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.accentLight },
  statLabel: { fontSize: 10, color: colors.textSub, marginTop: 2 },
  btn: { backgroundColor: colors.accent, borderRadius: radius.md, padding: spacing.md + 2, alignItems: 'center', marginBottom: spacing.md },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  histDate: { fontSize: 13, fontWeight: '600', color: colors.text },
  histDur: { fontSize: 13, fontWeight: '700', color: colors.accentLight },
  histSongs: { fontSize: 12, color: colors.textSub, marginBottom: spacing.xs },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { backgroundColor: colors.accentDim, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: colors.accentBorder },
  pillText: { fontSize: 12, color: colors.accentLight },
  goalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 2, borderColor: colors.border, marginTop: 2 },
  goalText: { fontSize: 14, color: colors.text, flex: 1 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14 },
});
