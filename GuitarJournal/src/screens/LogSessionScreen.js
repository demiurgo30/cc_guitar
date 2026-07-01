import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { addSession, getSongs, upsertSong, getDurationPresets, getTechniques } from '../storage';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import { colors, spacing, radius } from '../theme';
import { showAlert } from '../utils/alert';

function TagPill({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tag, active && styles.tagActive]}
      onPress={onPress}
    >
      <Text style={[styles.tagText, active && styles.tagTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function LogSessionScreen({ navigation }) {
  const [duration, setDuration] = useState(30);
  const [customDuration, setCustomDuration] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [songs, setSongs] = useState([]);          // all known songs
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [newSong, setNewSong] = useState('');
  const [durationPresets, setDurationPresets] = useState([]);
  const [availableTechniques, setAvailableTechniques] = useState([]);
  const [selectedTechniques, setSelectedTechniques] = useState([]);
  const [nextTime, setNextTime] = useState('');
  const [teacherQ, setTeacherQ] = useState('');

  useFocusEffect(useCallback(() => {
    getSongs().then(setSongs);
    getDurationPresets().then(setDurationPresets);
    getTechniques().then(setAvailableTechniques);
  }, []));

  const toggleSong = name => setSelectedSongs(prev =>
    prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
  );

  const toggleTechnique = t => setSelectedTechniques(prev =>
    prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
  );

  const addSongFromInput = () => {
    const trimmed = newSong.trim();
    if (!trimmed) return;
    setSelectedSongs(prev => prev.includes(trimmed) ? prev : [...prev, trimmed]);
    setNewSong('');
  };

  const save = async () => {
    const mins = showCustom ? parseInt(customDuration, 10) || duration : duration;
    const session = {
      durationMinutes: mins,
      songs: selectedSongs,
      techniques: selectedTechniques,
      nextTime: nextTime.trim(),
      teacherQuestions: teacherQ.trim(),
    };
    await addSession(session);

    // ensure new songs exist in song library (without overwriting existing entries)
    const existing = await getSongs();
    for (const name of selectedSongs) {
      if (!existing.find(s => s.name === name)) {
        await upsertSong({ id: Date.now().toString() + Math.random(), name, status: 'learning', speed: 0, changes: 0, musicality: 0 });
      }
    }

    showAlert('Session saved!', `${mins} minutes logged.`, [
      { text: 'OK', onPress: () => navigation.navigate('Home') },
    ]);

    // reset form
    setDuration(durationPresets[1] ?? durationPresets[0] ?? 30);
    setSelectedSongs([]); setSelectedTechniques([]);
    setNextTime(''); setTeacherQ(''); setShowCustom(false); setCustomDuration('');
  };

  const effectiveDuration = showCustom ? (parseInt(customDuration, 10) || 0) : duration;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Log Session</Text>
        <Text style={styles.subtitle}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>

        <SectionHeader title="Duration" />
        <Card>
          <View style={styles.durationRow}>
            {durationPresets.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.durBtn, !showCustom && duration === d && styles.durBtnActive]}
                onPress={() => { setDuration(d); setShowCustom(false); }}
              >
                <Text style={[styles.durBtnText, !showCustom && duration === d && styles.durBtnTextActive]}>
                  {d < 60 ? `${d}m` : `${d / 60}h`}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.durBtn, showCustom && styles.durBtnActive]}
              onPress={() => setShowCustom(true)}
            >
              <Text style={[styles.durBtnText, showCustom && styles.durBtnTextActive]}>Custom</Text>
            </TouchableOpacity>
          </View>
          {showCustom && (
            <TextInput
              style={styles.customInput}
              placeholder="Minutes"
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
              value={customDuration}
              onChangeText={setCustomDuration}
              autoFocus
            />
          )}
          {effectiveDuration > 0 && (
            <Text style={styles.durationDisplay}>
              {effectiveDuration >= 60
                ? `${Math.floor(effectiveDuration / 60)}h ${effectiveDuration % 60 > 0 ? effectiveDuration % 60 + 'm' : ''}`
                : `${effectiveDuration} minutes`}
            </Text>
          )}
        </Card>

        <SectionHeader title="Songs / Exercises" />
        <Card>
          <View style={styles.tags}>
            {songs.map(s => (
              <TagPill key={s.id} label={s.name} active={selectedSongs.includes(s.name)} onPress={() => toggleSong(s.name)} />
            ))}
            {selectedSongs.filter(n => !songs.find(s => s.name === n)).map(n => (
              <TagPill key={n} label={n} active onPress={() => toggleSong(n)} />
            ))}
          </View>
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder="Add song or exercise…"
              placeholderTextColor={colors.placeholder}
              value={newSong}
              onChangeText={setNewSong}
              onSubmitEditing={addSongFromInput}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addBtn} onPress={addSongFromInput}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <SectionHeader title="Techniques" />
        <Card>
          <View style={styles.tags}>
            {availableTechniques.map(t => (
              <TagPill key={t} label={t} active={selectedTechniques.includes(t)} onPress={() => toggleTechnique(t)} />
            ))}
          </View>
          {availableTechniques.length === 0 && (
            <Text style={styles.hint}>No techniques yet — add some in Settings.</Text>
          )}
        </Card>

        <SectionHeader title="To do next time" />
        <Card>
          <TextInput
            style={styles.textArea}
            placeholder="What do you want to work on next session?"
            placeholderTextColor={colors.placeholder}
            multiline
            value={nextTime}
            onChangeText={setNextTime}
          />
        </Card>

        <SectionHeader title="Questions for teacher" />
        <Card>
          <TextInput
            style={styles.textArea}
            placeholder="Any questions to bring up?"
            placeholderTextColor={colors.placeholder}
            multiline
            value={teacherQ}
            onChangeText={setTeacherQ}
          />
        </Card>

        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>Save Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textSub, marginBottom: spacing.lg },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  durBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingVertical: 8, paddingHorizontal: 12 },
  durBtnActive: { backgroundColor: colors.accent },
  durBtnText: { fontSize: 13, color: colors.textSub },
  durBtnTextActive: { color: '#fff', fontWeight: '700' },
  durationDisplay: { marginTop: spacing.sm, fontSize: 13, color: colors.accentLight },
  customInput: { marginTop: spacing.sm, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, color: colors.text, fontSize: 15 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm },
  tag: { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  tagActive: { backgroundColor: colors.accentDim, borderWidth: 1, borderColor: colors.accentBorder },
  tagText: { fontSize: 13, color: colors.textSub },
  tagTextActive: { color: colors.accentLight },
  addRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  addInput: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, color: colors.text, fontSize: 14 },
  addBtn: { backgroundColor: colors.accentDim, borderRadius: radius.sm, paddingHorizontal: spacing.md, justifyContent: 'center', borderWidth: 1, borderColor: colors.accentBorder },
  addBtnText: { color: colors.accentLight, fontWeight: '600' },
  textArea: { color: colors.text, fontSize: 14, minHeight: 60, textAlignVertical: 'top' },
  hint: { color: colors.textMuted, fontSize: 12 },
  saveBtn: { backgroundColor: colors.accent, borderRadius: radius.md, padding: spacing.md + 2, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
