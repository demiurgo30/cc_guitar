import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  sessions: 'gj_sessions',
  songs: 'gj_songs',
  goals: 'gj_goals',
  durations: 'gj_durations',
  techniques: 'gj_techniques',
};

const DEFAULT_DURATIONS = [15, 30, 45, 60, 90];
const DEFAULT_TECHNIQUES = ['Fingerpicking', 'Strumming', 'Barre chords', 'Scales', 'Legato', 'Chord transitions', 'Arpeggios'];

// ── generic helpers ──────────────────────────────────────────────

async function load(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function save(key, data) {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

// ── sessions ─────────────────────────────────────────────────────

export async function getSessions() {
  return load(KEYS.sessions);
}

export async function addSession(session) {
  const list = await getSessions();
  const entry = { ...session, id: Date.now().toString(), date: new Date().toISOString() };
  await save(KEYS.sessions, [entry, ...list]);
  return entry;
}

export async function deleteSession(id) {
  const list = await getSessions();
  await save(KEYS.sessions, list.filter(s => s.id !== id));
}

// ── songs ─────────────────────────────────────────────────────────

export async function getSongs() {
  return load(KEYS.songs);
}

export async function upsertSong(song) {
  const list = await getSongs();
  const idx = list.findIndex(s => s.id === song.id);
  if (idx >= 0) {
    list[idx] = song;
  } else {
    list.push({ ...song, id: song.id ?? Date.now().toString() });
  }
  await save(KEYS.songs, list);
}

export async function deleteSong(id) {
  const list = await getSongs();
  await save(KEYS.songs, list.filter(s => s.id !== id));
}

// ── goals ─────────────────────────────────────────────────────────

export async function getGoals() {
  return load(KEYS.goals);
}

export async function addGoal(text) {
  const list = await getGoals();
  const entry = { id: Date.now().toString(), text, completed: false, createdAt: new Date().toISOString() };
  await save(KEYS.goals, [...list, entry]);
  return entry;
}

export async function toggleGoal(id) {
  const list = await getGoals();
  await save(KEYS.goals, list.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
}

export async function deleteGoal(id) {
  const list = await getGoals();
  await save(KEYS.goals, list.filter(g => g.id !== id));
}

// ── duration presets ─────────────────────────────────────────────

export async function getDurationPresets() {
  const raw = await AsyncStorage.getItem(KEYS.durations);
  if (raw === null) {
    await save(KEYS.durations, DEFAULT_DURATIONS);
    return DEFAULT_DURATIONS;
  }
  return JSON.parse(raw);
}

export async function addDurationPreset(minutes) {
  const list = await getDurationPresets();
  if (list.includes(minutes)) return list;
  const updated = [...list, minutes].sort((a, b) => a - b);
  await save(KEYS.durations, updated);
  return updated;
}

export async function updateDurationPreset(oldValue, newValue) {
  const list = await getDurationPresets();
  const updated = list.map(v => v === oldValue ? newValue : v).sort((a, b) => a - b);
  await save(KEYS.durations, updated);
  return updated;
}

export async function deleteDurationPreset(minutes) {
  const list = await getDurationPresets();
  const updated = list.filter(v => v !== minutes);
  await save(KEYS.durations, updated);
  return updated;
}

// ── techniques ────────────────────────────────────────────────────

export async function getTechniques() {
  const raw = await AsyncStorage.getItem(KEYS.techniques);
  if (raw === null) {
    await save(KEYS.techniques, DEFAULT_TECHNIQUES);
    return DEFAULT_TECHNIQUES;
  }
  return JSON.parse(raw);
}

export async function addTechnique(name) {
  const list = await getTechniques();
  if (list.includes(name)) return list;
  const updated = [...list, name];
  await save(KEYS.techniques, updated);
  return updated;
}

export async function updateTechnique(oldName, newName) {
  const list = await getTechniques();
  const updated = list.map(t => t === oldName ? newName : t);
  await save(KEYS.techniques, updated);
  return updated;
}

export async function deleteTechnique(name) {
  const list = await getTechniques();
  const updated = list.filter(t => t !== name);
  await save(KEYS.techniques, updated);
  return updated;
}

// ── streak helpers ────────────────────────────────────────────────

export function computeStreak(sessions) {
  if (!sessions.length) return 0;
  const days = [...new Set(sessions.map(s => s.date.slice(0, 10)))].sort().reverse();
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const day of days) {
    const d = new Date(day);
    const diff = Math.round((cursor - d) / 86400000);
    if (diff > 1) break;
    streak++;
    cursor = d;
  }
  return streak;
}

export function totalMinutesThisWeek(sessions) {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  return sessions
    .filter(s => s.date >= weekAgo)
    .reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
}
