import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDB(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('formiq.db');
  }
  return db;
}

export function initDB() {
  const database = getDB();

  database.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      goal TEXT DEFAULT 'muscle_gain',
      gym_days_per_week INTEGER DEFAULT 4,
      accent_color TEXT DEFAULT '#000000',
      notification_time TEXT DEFAULT '20:00',
      onboarding_done INTEGER DEFAULT 0
    );

    INSERT OR IGNORE INTO user_settings (id) VALUES (1);

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      is_active INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (date('now'))
    );

    CREATE TABLE IF NOT EXISTS plan_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
      day_of_week INTEGER NOT NULL,
      workout_type TEXT DEFAULT 'gym'
    );

    CREATE TABLE IF NOT EXISTS plan_day_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_day_id INTEGER NOT NULL REFERENCES plan_days(id) ON DELETE CASCADE,
      exercise_id TEXT NOT NULL,
      sets INTEGER DEFAULT 3,
      reps INTEGER DEFAULT 12,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS workout_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      workout_type TEXT DEFAULT 'gym',
      duration_minutes INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      completed INTEGER DEFAULT 0,
      started_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS log_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_id INTEGER NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
      exercise_id TEXT NOT NULL,
      completed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS log_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_exercise_id INTEGER NOT NULL REFERENCES log_exercises(id) ON DELETE CASCADE,
      set_number INTEGER NOT NULL,
      reps INTEGER DEFAULT 0,
      weight_kg REAL DEFAULT 0,
      completed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS personal_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id TEXT NOT NULL,
      weight_kg REAL DEFAULT 0,
      reps INTEGER DEFAULT 0,
      achieved_at TEXT DEFAULT (date('now')),
      UNIQUE(exercise_id)
    );
  `);
}

export function getSettings() {
  const database = getDB();
  return database.getFirstSync<{
    id: number;
    goal: string;
    gym_days_per_week: number;
    accent_color: string;
    notification_time: string;
    onboarding_done: number;
  }>('SELECT * FROM user_settings WHERE id = 1');
}

export function updateSettings(fields: Partial<{
  goal: string;
  gym_days_per_week: number;
  accent_color: string;
  notification_time: string;
  onboarding_done: number;
}>) {
  const database = getDB();
  const entries = Object.entries(fields);
  if (entries.length === 0) return;
  const setClauses = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  database.runSync(`UPDATE user_settings SET ${setClauses} WHERE id = 1`, values);
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function dayOfWeek(): number {
  // 0=Monday, 6=Sunday
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}
