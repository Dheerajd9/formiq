// Web implementation using localStorage for full data persistence.
// All data is stored in the browser — no account needed, works offline.

type Row = Record<string, unknown>;

// ─── In-memory tables backed by localStorage ─────────────────────────────────

function storageKey(table: string) {
  return `formiq_${table}`;
}

function readTable<T extends Row>(table: string): T[] {
  try {
    const raw = localStorage.getItem(storageKey(table));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeTable<T extends Row>(table: string, rows: T[]) {
  try {
    localStorage.setItem(storageKey(table), JSON.stringify(rows));
  } catch {
    // Storage full — silently ignore
  }
}

let _nextId: Record<string, number> = {};
function nextId(table: string): number {
  if (!_nextId[table]) {
    const rows = readTable(table);
    _nextId[table] = rows.length > 0
      ? Math.max(...rows.map((r) => Number(r.id ?? 0))) + 1
      : 1;
  }
  return _nextId[table]++;
}

// ─── SQL-like helpers ─────────────────────────────────────────────────────────

function parseWhere(sql: string) {
  // Very simple: extract "col = ?" pairs from WHERE clause
  const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|$)/is);
  if (!whereMatch) return null;
  return whereMatch[1].trim();
}

// Tiny SQL interpreter — handles the queries actually used in this app
class WebDB {
  getFirstSync<T extends Row>(sql: string, params: unknown[] = []): T | null {
    const rows = this.getAllSync<T>(sql, params);
    return rows[0] ?? null;
  }

  getAllSync<T extends Row>(sql: string, params: unknown[] = []): T[] {
    const upper = sql.trim().toUpperCase();

    // ── SELECT ──
    if (upper.startsWith('SELECT')) {
      return this._select<T>(sql, params);
    }
    return [];
  }

  runSync(sql: string, params: unknown[] = []): void {
    const upper = sql.trim().toUpperCase();

    if (upper.startsWith('INSERT INTO') || upper.startsWith('INSERT OR IGNORE')) {
      this._insert(sql, params);
    } else if (upper.startsWith('UPDATE')) {
      this._update(sql, params);
    } else if (upper.startsWith('DELETE')) {
      this._delete(sql, params);
    } else if (upper.startsWith('PRAGMA') || upper.startsWith('CREATE') || upper.startsWith('DROP')) {
      // No-op: we use localStorage tables instead of SQLite
    }
  }

  execSync(sql: string): void {
    // Used for initDB — we handle init separately
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private _tableName(sql: string): string {
    const m = sql.match(/(?:FROM|INTO|UPDATE|TABLE(?:\s+IF\s+NOT\s+EXISTS)?)\s+(\w+)/i);
    return m?.[1]?.toLowerCase() ?? '';
  }

  private _select<T extends Row>(sql: string, params: unknown[]): T[] {
    // Handle the specific JOIN queries in the app
    if (/JOIN/i.test(sql)) {
      return this._selectJoin<T>(sql, params);
    }

    const table = this._tableName(sql);
    let rows = readTable<T>(table);

    // WHERE
    const whereClause = parseWhere(sql);
    if (whereClause) {
      rows = this._applyWhere(rows, whereClause, params) as T[];
    }

    // ORDER BY
    const orderMatch = sql.match(/ORDER BY\s+(.+?)(?:\s+LIMIT|$)/i);
    if (orderMatch) {
      const parts = orderMatch[1].trim().split(/\s+/);
      const col = parts[0].replace(/^\w+\./, '') as keyof T;
      const desc = parts[1]?.toUpperCase() === 'DESC';
      rows = [...rows].sort((a, b) => {
        const av = a[col] as string | number;
        const bv = b[col] as string | number;
        return desc ? (av < bv ? 1 : -1) : (av > bv ? 1 : -1);
      });
    }

    // LIMIT
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      rows = rows.slice(0, parseInt(limitMatch[1]));
    }

    return rows;
  }

  private _selectJoin<T extends Row>(sql: string, params: unknown[]): T[] {
    // Resolve the specific JOIN patterns used in useWorkoutLog / useRecovery / useWhatToday
    const sqlLower = sql.toLowerCase();

    // Pattern: log_sets → log_exercises → workout_logs (for prevSets and PR queries)
    if (sqlLower.includes('log_sets') && sqlLower.includes('log_exercises') && sqlLower.includes('workout_logs')) {
      const logExercises = readTable<Row>('log_exercises');
      const workoutLogs = readTable<Row>('workout_logs');
      const logSets = readTable<Row>('log_sets');

      // Filter workout_logs where completed = 1
      const completedLogs = workoutLogs.filter((wl) => wl.completed === 1);

      // Filter by exercise_id and date (params[0] = exercise_id, params[1] = date)
      const exerciseId = params[0];
      const beforeDate = params[1];
      const limitMatch = sql.match(/LIMIT\s+(\?|\d+)/i);
      const limit = limitMatch
        ? (limitMatch[1] === '?' ? parseInt(String(params[params.length - 1])) : parseInt(limitMatch[1]))
        : 999;

      // Find log_exercises for this exercise
      const matchingLe = logExercises.filter((le) => le.exercise_id === exerciseId);

      // Join with completed logs (before date if specified)
      const joined: Row[] = [];
      for (const le of matchingLe) {
        const wl = completedLogs.find((w) => w.id === le.log_id);
        if (!wl) continue;
        if (beforeDate && String(wl.date) >= String(beforeDate)) continue;
        // Get sets for this log_exercise
        const sets = logSets.filter((ls) => ls.log_exercise_id === le.id && ls.completed === 1);
        for (const ls of sets) {
          joined.push({ ...ls, exercise_id: le.exercise_id, date: wl.date, started_at: wl.started_at });
        }
      }

      // Sort by date DESC, set_number ASC
      joined.sort((a, b) => {
        const aDate = String(a.date ?? a.started_at ?? '');
        const bDate = String(b.date ?? b.started_at ?? '');
        if (bDate !== aDate) return bDate > aDate ? -1 : 1;
        return Number(a.set_number ?? 0) - Number(b.set_number ?? 0);
      });

      return joined.slice(0, limit) as T[];
    }

    // Pattern: log_exercises → workout_logs (for useRecovery / useWhatToday)
    if (sqlLower.includes('log_exercises') && sqlLower.includes('workout_logs')) {
      const logExercises = readTable<Row>('log_exercises');
      const workoutLogs = readTable<Row>('workout_logs').filter((w) => w.completed === 1);

      // WHERE le.exercise_id IN (...)
      const inMatch = sql.match(/IN\s*\(([^)]+)\)/i);
      let exerciseIds: unknown[] = [];
      if (inMatch) {
        const placeholders = inMatch[1].match(/\?/g) ?? [];
        exerciseIds = params.slice(0, placeholders.length);
      }

      const matchingLe = logExercises.filter((le) => exerciseIds.includes(le.exercise_id));

      const joined: Row[] = [];
      for (const le of matchingLe) {
        const wl = workoutLogs.find((w) => w.id === le.log_id);
        if (!wl) continue;
        joined.push({ ...le, date: wl.date, started_at: wl.started_at });
      }

      joined.sort((a, b) => String(b.date ?? b.started_at ?? '').localeCompare(String(a.date ?? a.started_at ?? '')));

      const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) return joined.slice(0, parseInt(limitMatch[1])) as T[];
      return joined as T[];
    }

    // Pattern: personal_records via log_exercises + log_sets (completeWorkout PR update)
    if (sqlLower.includes('log_sets') && sqlLower.includes('log_exercises')) {
      const logExercises = readTable<Row>('log_exercises').filter((le) => le.log_id === params[0]);
      const logSets = readTable<Row>('log_sets');
      const result: Row[] = [];
      for (const le of logExercises) {
        const sets = logSets.filter((ls) => ls.log_exercise_id === le.id && ls.completed === 1);
        if (!sets.length) continue;
        const maxWeight = Math.max(...sets.map((s) => Number(s.weight_kg ?? 0)));
        const matchSet = sets.find((s) => Number(s.weight_kg ?? 0) === maxWeight);
        result.push({ exercise_id: le.exercise_id, max_weight: maxWeight, reps: matchSet?.reps ?? 0 });
      }
      return result as T[];
    }

    return [];
  }

  private _applyWhere<T extends Row>(rows: T[], where: string, params: unknown[]): T[] {
    // Handle: col = ? AND col2 = ? and IN (?,?,?) patterns
    let paramIdx = 0;
    const conditions = where.split(/\s+AND\s+/i);

    return rows.filter((row) => {
      return conditions.every((cond) => {
        const trimmed = cond.trim();

        // col IN (?,?,?)
        const inMatch = trimmed.match(/^(?:\w+\.)?(\w+)\s+IN\s*\(/i);
        if (inMatch) {
          const col = inMatch[1] as keyof T;
          const placeholders = (trimmed.match(/\?/g) ?? []).length;
          const vals = params.slice(paramIdx, paramIdx + placeholders);
          paramIdx += placeholders;
          return vals.includes(row[col]);
        }

        // col = ?
        const eqMatch = trimmed.match(/^(?:\w+\.)?(\w+)\s*=\s*\?$/i);
        if (eqMatch) {
          const col = eqMatch[1] as keyof T;
          const val = params[paramIdx++];
          return row[col] == val; // loose equality for string/number
        }

        // col < ? (for date comparisons)
        const ltMatch = trimmed.match(/^(?:\w+\.)?(\w+)\s*<\s*\?$/i);
        if (ltMatch) {
          const col = ltMatch[1] as keyof T;
          const val = params[paramIdx++];
          return String(row[col] ?? '') < String(val ?? '');
        }

        return true;
      });
    });
  }

  private _insert(sql: string, params: unknown[]): void {
    const table = this._tableName(sql);
    if (!table) return;

    const rows = readTable<Row>(table);

    // Extract column names
    const colMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
    if (!colMatch) return;
    const cols = colMatch[1].split(',').map((c) => c.trim().toLowerCase());

    const newRow: Row = {};
    cols.forEach((col, i) => {
      newRow[col] = params[i] ?? null;
    });

    // Auto-increment id
    if (!newRow.id) {
      newRow.id = nextId(table);
    }

    // OR IGNORE: check unique constraints
    const isOrIgnore = /OR IGNORE/i.test(sql);
    if (isOrIgnore) {
      const id = newRow.id;
      const exists = rows.some((r) => r.id == id);
      if (exists) return;
    }

    // ON CONFLICT ... DO UPDATE (upsert)
    if (/ON CONFLICT/i.test(sql)) {
      const colUpdateMatch = sql.match(/DO UPDATE SET\s+(.+)/i);
      if (colUpdateMatch) {
        const updateClauses = colUpdateMatch[1].split(',').map((c) => c.trim());
        const conflictColMatch = sql.match(/ON CONFLICT\s*\((\w+)\)/i);
        const conflictCol = conflictColMatch?.[1]?.toLowerCase() ?? 'id';
        const existingIdx = rows.findIndex((r) => r[conflictCol] == newRow[conflictCol]);
        if (existingIdx >= 0) {
          // Parse update clauses: col = ?
          let updateParamIdx = cols.length;
          updateClauses.forEach((clause) => {
            const m = clause.match(/^(\w+)\s*=\s*\?$/i);
            if (m) {
              rows[existingIdx][m[1].toLowerCase()] = params[updateParamIdx++] ?? null;
            }
          });
          writeTable(table, rows);
          return;
        }
      }
    }

    rows.push(newRow);
    writeTable(table, rows);
  }

  private _update(sql: string, params: unknown[]): void {
    const table = this._tableName(sql);
    if (!table) return;

    const rows = readTable<Row>(table);

    // Extract SET columns
    const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
    if (!setMatch) return;
    const setCols = setMatch[1].split(',').map((c) => {
      const m = c.trim().match(/(\w+)\s*=\s*\?/i);
      return m?.[1]?.toLowerCase() ?? '';
    }).filter(Boolean);

    // WHERE col = ?
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|$)/i);
    if (!whereMatch) return;
    const whereClause = whereMatch[1].trim();
    const whereColMatch = whereClause.match(/(\w+)\s*=\s*\?/i);
    if (!whereColMatch) return;
    const whereCol = whereColMatch[1].toLowerCase();

    const setParams = params.slice(0, setCols.length);
    const whereVal = params[setCols.length];

    rows.forEach((row) => {
      if (row[whereCol] == whereVal) {
        setCols.forEach((col, i) => {
          row[col] = setParams[i] ?? null;
        });
      }
    });

    writeTable(table, rows);
  }

  private _delete(sql: string, params: unknown[]): void {
    const table = this._tableName(sql);
    if (!table) return;
    const rows = readTable<Row>(table);
    const whereMatch = sql.match(/WHERE\s+(\w+)\s*=\s*\?/i);
    if (!whereMatch) return;
    const col = whereMatch[1].toLowerCase();
    writeTable(table, rows.filter((r) => r[col] != params[0]));
  }
}

const db = new WebDB();

export function getDB() {
  return db as unknown as import('expo-sqlite').SQLiteDatabase;
}

// ─── Init (ensure default rows exist) ────────────────────────────────────────

export function initDB() {
  // cardio_logs table is auto-created via localStorage on first insert — no migration needed.
  // Ensure user_settings row 1 exists
  const settings = readTable<Row>('user_settings');
  if (!settings.find((s) => s.id == 1)) {
    settings.push({
      id: 1,
      goal: 'muscle_gain',
      gym_days_per_week: 4,
      accent_color: '#000000',
      notification_time: '20:00',
      onboarding_done: 0,
    });
    writeTable('user_settings', settings);
  }
}

export function getSettings() {
  return readTable<{
    id: number; goal: string; gym_days_per_week: number;
    accent_color: string; notification_time: string; onboarding_done: number;
  }>('user_settings').find((s) => s.id == 1) ?? null;
}

export function updateSettings(fields: Partial<{
  goal: string; gym_days_per_week: number;
  accent_color: string; notification_time: string; onboarding_done: number;
}>) {
  const rows = readTable<Row>('user_settings');
  const row = rows.find((r) => r.id == 1);
  if (!row) return;
  Object.assign(row, fields);
  writeTable('user_settings', rows);
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function dayOfWeek(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}
