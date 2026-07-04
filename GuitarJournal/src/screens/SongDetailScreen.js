import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSongs } from '../storage';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import LineChart from '../components/LineChart';
import Stars from '../components/Stars';
import { colors, spacing } from '../theme';
import { DIMS, DIM_LABELS } from '../utils/songDims';

export default function SongDetailScreen({ route }) {
  const { songId } = route.params;
  const [song, setSong] = useState(null);

  useFocusEffect(useCallback(() => {
    getSongs().then(list => setSong(list.find(s => s.id === songId) ?? null));
  }, [songId]));

  if (!song) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Song not found.</Text>
      </View>
    );
  }

  const history = song.history ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{song.name}</Text>
      {song.author ? <Text style={styles.author}>by {song.author}</Text> : null}
      <View style={styles.subtitleRow}>
        <Text style={styles.subtitle}>{song.status === 'learned' ? 'Learned' : 'Learning'}</Text>
        {song.amebLevel ? <Text style={styles.subtitleDot}>·</Text> : null}
        {song.amebLevel ? <Text style={styles.subtitle}>{song.amebLevel}</Text> : null}
      </View>

      <SectionHeader title="Current ratings" />
      <Card>
        {DIMS.map(dim => (
          <View key={dim} style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>{DIM_LABELS[dim]}</Text>
            <Stars value={song[dim] ?? 0} size={16} />
          </View>
        ))}
      </Card>

      <SectionHeader title="Progress over time" />
      <Card style={styles.chartCard}>
        <LineChart history={history} />
      </Card>

      {history.length > 0 && (
        <Text style={styles.hint}>{history.length} rating update{history.length === 1 ? '' : 's'} recorded. Edit ratings from the Songs list to add more data points.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 },
  author: { fontSize: 13, color: colors.textSub, fontStyle: 'italic', marginBottom: 4 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.lg },
  subtitle: { fontSize: 13, color: colors.textSub },
  subtitleDot: { fontSize: 13, color: colors.textMuted },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  ratingLabel: { fontSize: 14, color: colors.textSub },
  chartCard: { alignItems: 'center' },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14, padding: spacing.lg },
});
