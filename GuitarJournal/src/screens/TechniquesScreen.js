import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getTechniques, addTechnique, updateTechnique, deleteTechnique,
} from '../storage';
import Card from '../components/Card';
import { colors, spacing, radius } from '../theme';

export default function TechniquesScreen() {
  const [techniques, setTechniques] = useState([]);
  const [newValue, setNewValue] = useState('');
  const [editingValue, setEditingValue] = useState(null);
  const [editText, setEditText] = useState('');

  useFocusEffect(useCallback(() => { getTechniques().then(setTechniques); }, []));

  const handleAdd = async () => {
    const name = newValue.trim();
    if (!name) return;
    setTechniques(await addTechnique(name));
    setNewValue('');
  };

  const startEdit = value => { setEditingValue(value); setEditText(value); };

  const saveEdit = async () => {
    const name = editText.trim();
    if (!name) { Alert.alert('Name cannot be empty'); return; }
    setTechniques(await updateTechnique(editingValue, name));
    setEditingValue(null);
    setEditText('');
  };

  const handleDelete = value => {
    Alert.alert('Delete technique?', `Remove "${value}" from the picker.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => setTechniques(await deleteTechnique(value)) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.subtitle}>Techniques shown as tags when logging a session.</Text>

      <Card>
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="Technique name (e.g. Sweep picking)"
            placeholderTextColor={colors.placeholder}
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
        {techniques.map((value, i) => (
          <View key={value} style={[styles.row, i === techniques.length - 1 && { borderBottomWidth: 0 }]}>
            {editingValue === value ? (
              <>
                <TextInput
                  style={styles.editInput}
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
                <Text style={styles.rowText}>{value}</Text>
                <TouchableOpacity onPress={() => startEdit(value)}><Text style={styles.action}>Edit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(value)}><Text style={styles.actionDanger}>Delete</Text></TouchableOpacity>
              </>
            )}
          </View>
        ))}
        {techniques.length === 0 && <Text style={styles.empty}>No techniques yet. Add one above!</Text>}
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
