import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSessions, getLastLessonReviewedAt, markLessonReviewed } from '../storage';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import { colors, spacing, radius } from '../theme';
import { showAlert } from '../utils/alert';
import { fmtDate } from '../utils/format';

export default function LessonModeScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [reviewedAt, setReviewedAt] = useState(null);

  const load = useCallback(async () => {
    const [s, reviewed] = await Promise.all([getSessions(), getLastLessonReviewedAt()]);
    setSessions(s);
    setReviewedAt(reviewed);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const pending = sessions
    .filter(s => !reviewedAt || s.date > reviewedAt)
    .filter(s => (s.nextTime && s.nextTime.trim()) || (s.teacherQuestions && s.teacherQuestions.trim()))
    .sort((a, b) => a.date.localeCompare(b.date));

  const todos = pending.filter(s => s.nextTime?.trim());
  const questions = pending.filter(s => s.teacherQuestions?.trim());

  const handleMarkReviewed = () => {
    showAlert(
      'Mark as reviewed?',
      'This clears the pending list. Past sessions stay in your history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark reviewed',
          style: 'destructive',
          onPress: async () => {
            await markLessonReviewed();
            await load();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>Everything to bring to your next lesson</Text>

      {todos.length > 0 && (
        <>
          <SectionHeader title="To work on next time" />
          <Card>
            {todos.map((s, i) => (
              <View key={s.id} style={[styles.item, i === todos.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.itemDate}>{fmtDate(s.date)}</Text>
                <Text style={styles.itemText}>{s.nextTime}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {questions.length > 0 && (
        <>
          <SectionHeader title="Questions for your teacher" />
          <Card>
            {questions.map((s, i) => (
              <View key={s.id} style={[styles.item, i === questions.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.itemDate}>{fmtDate(s.date)}</Text>
                <Text style={styles.itemText}>{s.teacherQuestions}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {pending.length === 0 && (
        <Text style={styles.empty}>Nothing pending — you're all caught up!</Text>
      )}

      {pending.length > 0 && (
        <TouchableOpacity style={styles.reviewBtn} onPress={handleMarkReviewed}>
          <Text style={styles.reviewBtnText}>Mark as reviewed</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 48 },
  subtitle: { fontSize: 13, color: colors.textSub, marginBottom: spacing.lg },
  item: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  itemDate: { fontSize: 11, color: colors.textMuted, marginBottom: 2, fontWeight: '600' },
  itemText: { fontSize: 14, color: colors.text, lineHeight: 19 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14 },
  reviewBtn: { backgroundColor: colors.accent, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  reviewBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
