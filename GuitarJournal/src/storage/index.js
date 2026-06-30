import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  sessions: 'gj_sessions',
  songs: 'gj_songs',
  goals: 'gj_goals',
};

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
