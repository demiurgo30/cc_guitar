import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSongs, upsertSong, deleteSong } from '../storage';
import Card from '../components/Card';
import Stars from '../components/Stars';
import { colors, spacing, radius } from '../theme';
import { showAlert } from '../utils/alert';
import { DIMS, DIM_LABELS } from '../utils/songDims';

const AMEB_LEVELS = ['Preliminary', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];

function SongModal({ visible, song, onClose, onSave }) {
  const [name, setName] = useState(song?.name ?? '');
  const [author, setAuthor] = useState(song?.author ?? '');
  const [amebLevel, setAmebLevel] = useState(song?.amebLevel ?? '');
  const [status, setStatus] = useState(song?.status ?? 'learning');
  const [speed, setSpeed] = useState(song?.speed ?? 0);
  const [changes, setChanges] = useState(song?.changes ?? 0);
  const [musicality, setMusicality] = useState(song?.musicality ?? 0);

  React.useEffect(() => {
    if (song) {
      setName(song.name ?? '');
      setAuthor(song.author ?? '');
      setAmebLevel(song.amebLevel ?? '');
      setStatus(song.status ?? 'learning');
      setSpeed(song.speed ?? 0);
      setChanges(song.changes ?? 0);
      setMusicality(song.musicality ?? 0);
    } else {
      setName(''); setAuthor(''); setAmebLevel(''); setStatus('learning'); setSpeed(0); setChanges(0); setMusicality(0);
    }
  }, [song, visible]);

  const handleSave = () => {
    if (!name.trim()) { showAlert('Name required'); return; }
    onSave({
      ...song,
      id: song?.id ?? Date.now().toString(),
      name: name.trim(),
      author: author.trim(),
      amebLevel,
      status, speed, changes, musicality,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={ms.overlay}>
        <View style={ms.sheet}>
          <Text style={ms.title}>{song?.id ? 'Edit Song' : 'Add Song'}</Text>

          <ScrollView style={ms.scroll} keyboardShouldPersistTaps="handled">

          <Text style={ms.label}>Name</Text>
          <TextInput style={ms.input} value={name} onChangeText={setName} placeholder="Song or exercise name" placeholderTextColor={colors.placeholder} />

          <Text style={ms.label}>Author</Text>
          <TextInput style={ms.input} value={author} onChangeText={setAuthor} placeholder="Composer or artist" placeholderTextColor={colors.placeholder} />

          <Text style={ms.label}>AMEB Level</Text>
          <View style={ms.levelWrap}>
            {AMEB_LEVELS.map(lvl => (
              <TouchableOpacity
                key={lvl}
                style={[ms.levelChip, amebLevel === lvl && ms.levelChipActive]}
                onPress={() => setAmebLevel(amebLevel === lvl ? '' : lvl)}
              >
                <Text style={[ms.levelChipText, amebLevel === lvl && ms.levelChipTextActive]}>{lvl}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={ms.label}>Status</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            {['learning', 'learned'].map(s => (
              <TouchableOpacity key={s} style={[ms.statusBtn, status === s && ms.statusBtnActive]} onPress={() => setStatus(s)}>
                <Text style={[ms.statusText, status === s && ms.statusTextActive]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {DIMS.map(dim => {
            const val = dim === 'speed' ? speed : dim === 'changes' ? changes : musicality;
            const set = dim === 'speed' ? setSpeed : dim === 'changes' ? setChanges : setMusicality;
            return (
              <View key={dim} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                <Text style={ms.dimLabel}>{DIM_LABELS[dim]}</Text>
                <Stars value={val} onPress={set} />
              </View>
            );
          })}

          </ScrollView>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            <TouchableOpacity style={[ms.btn, ms.btnSecondary]} onPress={onClose}>
              <Text style={ms.btnSecText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[ms.btn, ms.btnPrimary]} onPress={handleSave}>
              <Text style={ms.btnPrimText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function SongsScreen({ navigation }) {
  const [songs, setSongs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  useFocusEffect(useCallback(() => { getSongs().then(setSongs); }, []));

  const openAdd = () => { setEditing(null); setModalVisible(true); };
  const openEdit = song => { setEditing(song); setModalVisible(true); };

  const handleSave = async song => {
    await upsertSong(song);
    setSongs(await getSongs());
    setModalVisible(false);
  };

  const handleDelete = id => {
    showAlert('Delete song?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteSong(id); setSongs(await getSongs()); } },
    ]);
  };

  const learning = songs.filter(s => s.status !== 'learned');
  const learned = songs.filter(s => s.status === 'learned');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Songs</Text>
      <Text style={styles.subtitle}>{songs.length} song{songs.length !== 1 ? 's' : ''} tracked</Text>

      {[{ label: 'Learning', list: learning }, { label: 'Learned', list: learned }].map(({ label, list }) =>
        list.length > 0 && (
          <React.Fragment key={label}>
            <Text style={styles.sectionHeader}>{label.toUpperCase()}</Text>
            <Card style={{ padding: 0 }}>
              {list.map((song, i) => (
                <View key={song.id} style={[styles.songRow, i === list.length - 1 && { borderBottomWidth: 0 }]}>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => openEdit(song)} onLongPress={() => handleDelete(song.id)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: song.author ? 2 : 6, flexWrap: 'wrap' }}>
                      <Text style={styles.songName}>{song.name}</Text>
                      <View style={[styles.badge, song.status === 'learned' ? styles.badgeLearned : styles.badgeLearning]}>
                        <Text style={[styles.badgeText, song.status === 'learned' ? styles.badgeLearnedText : styles.badgeLearningText]}>
                          {song.status}
                        </Text>
                      </View>
                      {song.amebLevel ? (
                        <View style={styles.levelBadge}>
                          <Text style={styles.levelBadgeText}>{song.amebLevel}</Text>
                        </View>
                      ) : null}
                    </View>
                    {song.author ? <Text style={styles.songAuthor}>by {song.author}</Text> : null}
                    <View style={[styles.masteryRow, { marginTop: 6 }]}>
                      {DIMS.map(dim => (
                        <View key={dim} style={styles.masteryItem}>
                          <Stars value={song[dim] ?? 0} />
                          <Text style={styles.dimLabel}>{DIM_LABELS[dim]}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.progressBtn}
                    onPress={() => navigation.navigate('SongDetail', { songId: song.id })}
                  >
                    <Text style={styles.progressBtnText}>📈</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </Card>
          </React.Fragment>
        )
      )}

      {songs.length === 0 && <Text style={styles.empty}>No songs yet. Add one below!</Text>}

      <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
        <Text style={styles.addBtnText}>+ Add Song</Text>
      </TouchableOpacity>

      <SongModal visible={modalVisible} song={editing} onClose={() => setModalVisible(false)} onSave={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textSub, marginBottom: spacing.lg },
  sectionHeader: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1, marginTop: spacing.lg, marginBottom: spacing.sm },
  songRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  progressBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  progressBtnText: { fontSize: 18 },
  songName: { fontSize: 14, fontWeight: '600', color: colors.text },
  badge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  badgeLearning: { backgroundColor: colors.accentDim },
  badgeLearned: { backgroundColor: colors.greenDim },
  badgeText: { fontSize: 10, fontWeight: '600' },
  badgeLearningText: { color: colors.accentLight },
  badgeLearnedText: { color: colors.green },
  levelBadge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  levelBadgeText: { fontSize: 10, fontWeight: '600', color: colors.textSub },
  songAuthor: { fontSize: 12, color: colors.textSub, fontStyle: 'italic' },
  masteryRow: { flexDirection: 'row', gap: spacing.lg },
  masteryItem: { alignItems: 'flex-start' },
  dimLabel: { fontSize: 9, color: colors.textMuted, marginTop: 2 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14 },
  addBtn: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.accentBorder, marginTop: spacing.md },
  addBtnText: { color: colors.accentLight, fontWeight: '600', fontSize: 14 },
});

const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, paddingBottom: 40, maxHeight: '85%' },
  scroll: { maxHeight: 420 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  label: { fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, color: colors.text, fontSize: 15, marginBottom: spacing.md },
  levelWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md },
  levelChip: { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  levelChipActive: { backgroundColor: colors.accentDim, borderWidth: 1, borderColor: colors.accentBorder },
  levelChipText: { fontSize: 12, color: colors.textSub },
  levelChipTextActive: { color: colors.accentLight, fontWeight: '600' },
  statusBtn: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, alignItems: 'center' },
  statusBtnActive: { backgroundColor: colors.accentDim, borderWidth: 1, borderColor: colors.accentBorder },
  statusText: { color: colors.textSub, fontWeight: '600' },
  statusTextActive: { color: colors.accentLight },
  dimLabel: { fontSize: 13, color: colors.textSub },
  btn: { flex: 1, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center' },
  btnPrimary: { backgroundColor: colors.accent },
  btnSecondary: { backgroundColor: colors.surfaceAlt },
  btnPrimText: { color: '#fff', fontWeight: '700' },
  btnSecText: { color: colors.textSub, fontWeight: '600' },
});
