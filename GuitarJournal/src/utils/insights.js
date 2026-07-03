// Weekly/monthly recap: totals, most-practiced song, and the song with the
// biggest combined rating gain within the window (using song.history).
export function computeSummary(sessions, songs, { rangeDays } = { rangeDays: 7 }) {
  const cutoff = new Date(Date.now() - rangeDays * 86400000).toISOString();
  const inRange = sessions.filter(s => s.date >= cutoff);

  const totalMinutes = inRange.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
  const sessionCount = inRange.length;

  const songCounts = {};
  for (const s of inRange) {
    for (const name of s.songs ?? []) {
      songCounts[name] = (songCounts[name] ?? 0) + 1;
    }
  }
  let mostPracticedSong = null;
  let mostPracticedCount = 0;
  for (const [name, count] of Object.entries(songCounts)) {
    if (count > mostPracticedCount) {
      mostPracticedSong = name;
      mostPracticedCount = count;
    }
  }

  let biggestGainSong = null;
  let biggestGainAmount = 0;
  for (const song of songs) {
    const history = song.history ?? [];
    const inWindow = history.filter(h => h.date >= cutoff);
    if (inWindow.length === 0) continue;
    const before = [...history].reverse().find(h => h.date < cutoff);
    const baseline = before ?? inWindow[0];
    const latest = inWindow[inWindow.length - 1];
    const gain = (latest.speed + latest.changes + latest.musicality) - (baseline.speed + baseline.changes + baseline.musicality);
    if (gain > biggestGainAmount) {
      biggestGainAmount = gain;
      biggestGainSong = song.name;
    }
  }

  return {
    totalMinutes,
    sessionCount,
    mostPracticedSong,
    mostPracticedCount,
    biggestGainSong,
    biggestGainAmount,
  };
}
