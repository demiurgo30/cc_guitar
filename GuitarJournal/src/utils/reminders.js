import { useEffect } from 'react';
import { Platform } from 'react-native';
import {
  getReminderSettings, getSessions, getLastReminderShownDate, setLastReminderShownDate,
} from '../storage';

// Polls once a minute since there's no native scheduled-notification API on
// web — this is the coarsest interval that still hits the target minute reliably.
const CHECK_INTERVAL_MS = 60 * 1000;

export function notificationsSupported() {
  return Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported';
  if (window.Notification.permission === 'granted') return 'granted';
  return window.Notification.requestPermission();
}

export function sendTestNotification() {
  if (!notificationsSupported() || window.Notification.permission !== 'granted') return false;
  new window.Notification('Guitar Journal', { body: 'This is a test reminder — practice notifications are working!' });
  return true;
}

async function practicedToday(sessions) {
  const today = new Date().toISOString().slice(0, 10);
  return sessions.some(s => s.date.slice(0, 10) === today);
}

async function checkAndFireReminder() {
  if (!notificationsSupported() || window.Notification.permission !== 'granted') return;

  const settings = await getReminderSettings();
  if (!settings.enabled) return;

  const now = new Date();
  const target = new Date(now);
  target.setHours(settings.hour, settings.minute, 0, 0);
  if (now < target) return;

  const today = now.toISOString().slice(0, 10);
  const lastShown = await getLastReminderShownDate();
  if (lastShown === today) return;

  const sessions = await getSessions();
  if (await practicedToday(sessions)) return;

  new window.Notification('Time to practice! 🎸', {
    body: "You haven't logged a guitar session today.",
  });
  await setLastReminderShownDate(today);
}

// Mount once at the app root. While this tab is open, periodically checks
// whether it's time to nudge the user, and fires a browser Notification if
// so. No effect on native or when Notification permission isn't granted —
// there is no backend push server, so this only works while a tab is open.
export function useReminderScheduler() {
  useEffect(() => {
    if (!notificationsSupported()) return;
    checkAndFireReminder();
    const id = setInterval(checkAndFireReminder, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}
