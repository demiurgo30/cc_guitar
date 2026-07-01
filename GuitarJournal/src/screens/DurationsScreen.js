import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getDurationPresets, addDurationPreset, updateDurationPreset, deleteDurationPreset,
} from '../storage';
import Card from '../components/Card';
import { colors, spacing, radius } from '../theme';
import { showAlert } from '../utils/alert';

function fmt(mins) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function DurationsScreen() {
  const [presets, setPresets] = useState([]);
  const [newValue, setNewValue] = useState('');
  const [editingValue, setEditingValue] = useState(null);
  const [editText, setEditText] = useState('');

  useFocusEffect(useCallback(() => { getDurationPresets().then(setPresets); }, []));

  const handleAdd = async () => {
    const mins = parseInt(newValue, 10);
    if (!mins || mins <= 0) { showAlert('Enter a valid number of minutes'); return; }
    setPresets(await addDurationPreset(mins));
    setNewValue('');
  };

  const startEdit = value => { setEditingValue(value); setEditText(value.toString()); };

  const saveEdit = async () => {
    const mins = parseInt(editText, 10);
    if (!mins || mins <= 0) { showAlert('Enter a valid number of minutes'); return; }
    setPresets(await updateDurationPreset(editingValue, mins));
    setEditingValue(null);
    setEditText('');
  };

  const handleDelete = value => {
    showAlert('Delete duration?', `Remove ${fmt(value)} from quick-picks.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => setPresets(await deleteDurationPreset(value)) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.subtitle}>Quick-pick durations shown when logging a session.</Text>

      <Card>
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="Minutes (e.g. 20)"
            placeholderTextColor={colors.placeholder}
            keyboardType="number-pad"
            value={newValue}
            onChangeText={setNewValue}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={{ padding: 0 }}>
        {presets.map((value, i) => (
          <View key={value} style={[styles.row, i === presets.length - 1 && { borderBottomWidth: 0 }]}>
            {editingValue === value ? (
              <>
                <TextInput
                  style={styles.editInput}
                  keyboardType="number-pad"
                  value={editText}
                  onChangeText={setEditText}
                  onSubmitEditing={saveEdit}
                  autoFocus
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={saveEdit}><Text style={styles.action}>Save</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingValue(null)}><Text style={styles.actionMuted}>Cancel</Text></TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.rowText}>{fmt(value)}</Text>
                <TouchableOpacity onPress={() => startEdit(value)}><Text style={styles.action}>Edit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(value)}><Text style={styles.actionDanger}>Delete</Text></TouchableOpacity>
              </>
            )}
          </View>
        ))}
        {presets.length === 0 && <Text style={styles.empty}>No durations yet. Add one above!</Text>}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 48 },
  subtitle: { fontSize: 13, color: colors.textSub, marginBottom: spacing.lg },
  addRow: { flexDirection: 'row', gap: spacing.sm },
  addInput: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, color: colors.text, fontSize: 14 },
  addBtn: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: spacing.md, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  rowText: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' },
  editInput: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, color: colors.text, fontSize: 14 },
  action: { color: colors.accentLight, fontWeight: '600', fontSize: 13 },
  actionMuted: { color: colors.textSub, fontWeight: '600', fontSize: 13 },
  actionDanger: { color: '#e88a8a', fontWeight: '600', fontSize: 13 },
  empty: { color: colors.textMuted, textAlign: 'center', padding: spacing.lg, fontSize: 14 },
});
