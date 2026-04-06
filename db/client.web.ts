// Web stub for expo-sqlite — SQLite is not supported in the browser.
// Exercise browsing (Muscles, Library) works fully on web since it uses
// static data. Logging and plan features require the mobile app.

type Row = Record<string, unknown>;

const noop = () => {};
const nullRow = () => null;
const emptyArr = () => [];

const stub = {
  execSync: noop,
  getFirstSync: nullRow,
  runSync: noop,
  getAllSync: emptyArr,
} as unknown;

export function getDB() {
  return stub as import('expo-sqlite').SQLiteDatabase;
}

export function initDB() {
  // no-op on web
}

export function getSettings() {
  return {
    id: 1,
    goal: 'muscle_gain',
    gym_days_per_week: 4,
    accent_color: '#000000',
    notification_time: '20:00',
    onboarding_done: 1,
  };
}

export function updateSettings(_fields: Record<string, unknown>) {
  // no-op on web
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function dayOfWeek(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}
