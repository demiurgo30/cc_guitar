import { computeStreak } from '../storage';

const BADGE_DEFS = [
  { id: 'first-session', label: 'First Step', icon: '🎸', description: 'Log your first practice session', check: ({ sessions }) => sessions.length >= 1 },
  { id: 'sessions-10', label: 'Getting Started', icon: '🔥', description: 'Log 10 practice sessions', check: ({ sessions }) => sessions.length >= 10 },
  { id: 'sessions-50', label: 'Dedicated', icon: '💪', description: 'Log 50 practice sessions', check: ({ sessions }) => sessions.length >= 50 },
  { id: 'sessions-100', label: 'Century', icon: '💯', description: 'Log 100 practice sessions', check: ({ sessions }) => sessions.length >= 100 },
  { id: 'song-learned-1', label: 'Song Learner', icon: '🎵', description: 'Mark your first song as learned', check: ({ songs }) => songs.filter(s => s.status === 'learned').length >= 1 },
  { id: 'song-learned-5', label: 'Repertoire', icon: '🎶', description: 'Mark 5 songs as learned', check: ({ songs }) => songs.filter(s => s.status === 'learned').length >= 5 },
  { id: 'streak-7', label: 'Week Warrior', icon: '📅', description: 'Reach a 7-day practice streak', check: ({ sessions }) => computeStreak(sessions) >= 7 },
  { id: 'streak-30', label: 'Monthly Master', icon: '🏆', description: 'Reach a 30-day practice streak', check: ({ sessions }) => computeStreak(sessions) >= 30 },
  { id: 'goal-1', label: 'Goal Getter', icon: '🎯', description: 'Complete your first goal', check: ({ goals }) => goals.filter(g => g.completed).length >= 1 },
  { id: 'goal-10', label: 'Goal Crusher', icon: '🥇', description: 'Complete 10 goals', check: ({ goals }) => goals.filter(g => g.completed).length >= 10 },
];

export function computeBadges({ sessions = [], songs = [], goals = [] }) {
  const ctx = { sessions, songs, goals };
  return BADGE_DEFS.map(({ check, ...def }) => ({
    ...def,
    achieved: check(ctx),
  }));
}
