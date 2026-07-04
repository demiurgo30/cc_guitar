export function fmtMinutes(m) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), min = m % 60;
  return min ? `${h}h ${min}m` : `${h}h`;
}

// Pass { relative: true } to get "Today"/"Yesterday" instead of a date for
// those two days (used on Home's "Last session" card); omit it for a plain
// short date everywhere else (e.g. Lesson Mode's per-session list).
export function fmtDate(iso, { relative = false } = {}) {
  const d = new Date(iso);
  if (relative) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
