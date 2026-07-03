import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { colors, spacing } from '../theme';

const WIDTH = 280;
const HEIGHT = 140;
const PADDING = 16;
const MAX_VALUE = 5;

const SERIES = [
  { key: 'speed', label: 'Speed', color: colors.accentLight },
  { key: 'changes', label: 'Changes', color: colors.green },
  { key: 'musicality', label: 'Musicality', color: '#c88af2' },
];

// history: [{ date, speed, changes, musicality }] oldest-first
export default function LineChart({ history }) {
  if (!history || history.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Not enough history yet — keep updating this song's ratings to see a trend.</Text>
      </View>
    );
  }

  const innerW = WIDTH - PADDING * 2;
  const innerH = HEIGHT - PADDING * 2;
  const stepX = innerW / (history.length - 1);

  const toXY = (i, value) => {
    const x = PADDING + i * stepX;
    const y = PADDING + innerH - (value / MAX_VALUE) * innerH;
    return [x, y];
  };

  return (
    <View>
      <Svg width={WIDTH} height={HEIGHT}>
        {[0, 1, 2, 3, 4, 5].map(v => {
          const y = PADDING + innerH - (v / MAX_VALUE) * innerH;
          return <Line key={v} x1={PADDING} y1={y} x2={WIDTH - PADDING} y2={y} stroke={colors.borderLight} strokeWidth={1} />;
        })}
        {SERIES.map(series => {
          const points = history.map((h, i) => toXY(i, h[series.key] ?? 0).join(',')).join(' ');
          return (
            <React.Fragment key={series.key}>
              <Polyline points={points} fill="none" stroke={series.color} strokeWidth={2} />
              {history.map((h, i) => {
                const [x, y] = toXY(i, h[series.key] ?? 0);
                return <Circle key={i} cx={x} cy={y} r={2.5} fill={series.color} />;
              })}
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={styles.legend}>
        {SERIES.map(series => (
          <View key={series.key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: series.color }]} />
            <Text style={styles.legendText}>{series.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { paddingVertical: spacing.lg, alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  legend: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.textSub },
});
