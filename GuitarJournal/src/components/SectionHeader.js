import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export default function SectionHeader({ title }) {
  return <Text style={styles.text}>{title.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});
