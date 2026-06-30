import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getGoals, addGoal, toggleGoal, deleteGoal } from '../storage';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import { colors, spacing, radius } from '../theme';

function GoalRow({ goal, onToggle, onDelete }) {
  return (
    <TouchableOpacity style={styles.goalRow} onPress={onToggle} onLongPress={onDelete} activeOpacity={0.7}>
      <View style={[styles.checkbox, goal.completed && styles.checkboxDone]}>
        {goal.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.goalText, goal.completed && styles.goalTextDone]} numberOfLines={3}>
        {goal.text}
      </Text>
    </TouchableOpacity>
  );
}

export default function GoalsScreen() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');

  useFocusEffect(useCallback(() => { getGoals().then(setGoals); }, []));

  const handleAdd = async () => {
    const text = newGoal.trim();
    if (!text) return;
    await addGoal(text);
    setGoals(await getGoals());
    setNewGoal('');
  };

  const handleToggle = async id => {
    await toggleGoal(id);
    setGoals(await getGoals());
  };

  const handleDelete = id => {
    Alert.alert('Delete goal?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteGoal(id); setGoals(await getGoals()); } },
    ]);
  };

  const open = goals.filter(g => !g.completed);
  const done = goals.filter(g => g.completed);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Goals</Text>
      <Text style={styles.subtitle}>{done.length} of {goals.length} completed</Text>

      {/* Add goal */}
      <Card>
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="Add a new goal…"
            placeholderTextColor={colors.placeholder}
            value={newGoal}
            onChangeText={setNewGoal}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {open.length > 0 && (
        <>
          <SectionHeader title="In progress" />
          <Card style={{ padding: 0 }}>
            {open.map((g, i) => (
              <View key={g.id} style={i < open.length - 1 ? styles.separator : undefined}>
                <GoalRow goal={g} onToggle={() => handleToggle(g.id)} onDelete={() => handleDelete(g.id)} />
              </View>
            ))}
          </Card>
        </>
      )}

      {done.length > 0 && (
        <>
          <SectionHeader title="Completed" />
          <Card style={{ padding: 0 }}>
            {done.map((g, i) => (
              <View key={g.id} style={i < done.length - 1 ? styles.separator : undefined}>
                <GoalRow goal={g} onToggle={() => handleToggle(g.id)} onDelete={() => handleDelete(g.id)} />
              </View>
            ))}
          </Card>
        </>
      )}

      {goals.length === 0 && (
        <Text style={styles.empty}>No goals yet. Add one above to track your progress!</Text>
      )}

      <Text style={styles.hint}>Tap to check off · Long-press to delete</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textSub, marginBottom: spacing.lg },
  addRow: { flexDirection: 'row', gap: spacing.sm },
  addInput: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, color: colors.text, fontSize: 14 },
  addBtn: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: spacing.md, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' },
  goalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: spacing.md },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: colors.border, flexShrink: 0, marginTop: 2, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: colors.green, borderColor: colors.green },
  checkmark: { fontSize: 11, color: '#0d1a14', fontWeight: '700' },
  goalText: { fontSize: 14, color: colors.text, flex: 1 },
  goalTextDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  separator: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14 },
  hint: { textAlign: 'center', color: colors.textMuted, fontSize: 11, marginTop: spacing.xl },
});
