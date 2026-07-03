import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  sessions: 'gj_sessions',
  songs: 'gj_songs',
  goals: 'gj_goals',
  durations: 'gj_durations',
  techniques: 'gj_techniques',
  lastLessonReviewedAt: 'gj_lastLessonReviewedAt',
  reminderSettings: 'gj_reminderSettings',
  lastReminderShownDate: 'gj_lastReminderShownDate',
};

const DEFAULT_REMINDER_SETTINGS = { enabled: false, hour: 18, minute: 0 };

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
  const now = new Date().toISOString();

  if (idx >= 0) {
    const prev = list[idx];
    const ratingsChanged = prev.speed !== song.speed || prev.changes !== song.changes || prev.musicality !== song.musicality;
    const history = prev.history ?? [];
    list[idx] = {
      ...song,
      history: ratingsChanged
        ? [...history, { date: now, speed: song.speed ?? 0, changes: song.changes ?? 0, musicality: song.musicality ?? 0 }]
        : history,
    };
  } else {
    const entry = { ...song, id: song.id ?? Date.now().toString() };
    entry.history = [{ date: now, speed: entry.speed ?? 0, changes: entry.changes ?? 0, musicality: entry.musicality ?? 0 }];
    list.push(entry);
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

// ── lesson mode ───────────────────────────────────────────────────

export async function getLastLessonReviewedAt() {
  return AsyncStorage.getItem(KEYS.lastLessonReviewedAt);
}

export async function markLessonReviewed() {
  const now = new Date().toISOString();
  await AsyncStorage.setItem(KEYS.lastLessonReviewedAt, now);
  return now;
}

// ── reminders ─────────────────────────────────────────────────────

export async function getReminderSettings() {
  const raw = await AsyncStorage.getItem(KEYS.reminderSettings);
  return raw ? { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(raw) } : DEFAULT_REMINDER_SETTINGS;
}

export async function saveReminderSettings(settings) {
  await AsyncStorage.setItem(KEYS.reminderSettings, JSON.stringify(settings));
}

export async function getLastReminderShownDate() {
  return AsyncStorage.getItem(KEYS.lastReminderShownDate);
}

export async function setLastReminderShownDate(dateStr) {
  await AsyncStorage.setItem(KEYS.lastReminderShownDate, dateStr);
}

// ── export / import ──────────────────────────────────────────────

export async function exportAllData() {
  const [sessions, songs, goals, durations, techniques, lastLessonReviewedAt, reminderSettings] = await Promise.all([
    AsyncStorage.getItem(KEYS.sessions),
    AsyncStorage.getItem(KEYS.songs),
    AsyncStorage.getItem(KEYS.goals),
    AsyncStorage.getItem(KEYS.durations),
    AsyncStorage.getItem(KEYS.techniques),
    AsyncStorage.getItem(KEYS.lastLessonReviewedAt),
    AsyncStorage.getItem(KEYS.reminderSettings),
  ]);
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    data: {
      sessions: sessions ? JSON.parse(sessions) : [],
      songs: songs ? JSON.parse(songs) : [],
      goals: goals ? JSON.parse(goals) : [],
      durations: durations ? JSON.parse(durations) : [],
      techniques: techniques ? JSON.parse(techniques) : [],
      lastLessonReviewedAt: lastLessonReviewedAt ?? null,
      reminderSettings: reminderSettings ? JSON.parse(reminderSettings) : DEFAULT_REMINDER_SETTINGS,
    },
  };
}

export async function importAllData(parsed) {
  if (!parsed || typeof parsed !== 'object' || typeof parsed.data !== 'object' || parsed.data === null) {
    throw new Error('Invalid backup file: missing "data" object.');
  }
  const { sessions, songs, goals, durations, techniques, lastLessonReviewedAt, reminderSettings } = parsed.data;
  const writes = [];
  if (Array.isArray(sessions)) writes.push(save(KEYS.sessions, sessions));
  if (Array.isArray(songs)) writes.push(save(KEYS.songs, songs));
  if (Array.isArray(goals)) writes.push(save(KEYS.goals, goals));
  if (Array.isArray(durations)) writes.push(save(KEYS.durations, durations));
  if (Array.isArray(techniques)) writes.push(save(KEYS.techniques, techniques));
  // version 1 backups won't have these — only write if present, so imports of older files don't clobber current settings
  if (typeof lastLessonReviewedAt === 'string') writes.push(AsyncStorage.setItem(KEYS.lastLessonReviewedAt, lastLessonReviewedAt));
  if (reminderSettings && typeof reminderSettings === 'object') writes.push(save(KEYS.reminderSettings, reminderSettings));
  if (writes.length === 0) {
    throw new Error('Invalid backup file: no recognizable data found.');
  }
  await Promise.all(writes);
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

export function totalMinutesThisMonth(sessions) {
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  return sessions
    .filter(s => s.date >= monthAgo)
    .reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
}

// Returns an array of { date: 'YYYY-MM-DD', minutes } covering the last
// `weeks` weeks up to and including today, oldest first.
export function buildPracticeHeatmap(sessions, weeks = 16) {
  const minutesByDay = {};
  for (const s of sessions) {
    const day = s.date.slice(0, 10);
    minutesByDay[day] = (minutesByDay[day] ?? 0) + (s.durationMinutes ?? 0);
  }

  const days = weeks * 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, minutes: minutesByDay[key] ?? 0 });
  }
  return result;
}
