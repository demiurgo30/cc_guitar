import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

const CELL = 12;
const GAP = 3;

// Buckets are just visual thresholds to spread typical session lengths
// (15/30/45/60+ min) across the 5-color scale, not a meaningful unit.
function levelFor(minutes) {
  if (minutes <= 0) return 0;
  if (minutes < 20) return 1;
  if (minutes < 40) return 2;
  if (minutes < 60) return 3;
  return 4;
}

const LEVEL_COLORS = [
  colors.surfaceAlt,
  '#1a2e50',
  '#204070',
  '#2a5a9a',
  colors.accentLight,
];

// days: [{ date: 'YYYY-MM-DD', minutes }] oldest-first, length multiple of 7
export default function Heatmap({ days }) {
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.column}>
              {week.map(day => (
                <View
                  key={day.date}
                  style={[styles.cell, { backgroundColor: LEVEL_COLORS[levelFor(day.minutes)] }]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.legendRow}>
        <Text style={styles.legendText}>Less</Text>
        {LEVEL_COLORS.map((c, i) => (
          <View key={i} style={[styles.legendCell, { backgroundColor: c }]} />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: GAP },
  column: { gap: GAP },
  cell: { width: CELL, height: CELL, borderRadius: 3 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  legendCell: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 10, color: colors.textMuted, marginHorizontal: 4 },
});
