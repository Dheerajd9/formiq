import { useState, useEffect, useCallback } from 'react';
import { getDB, today } from '../db/client';
import { EXERCISES, Exercise } from '../constants/exercises';

export interface LogSet {
  id: number;
  log_exercise_id: number;
  set_number: number;
  reps: number;
  weight_kg: number;
  completed: number;
}

export interface PrevSet {
  set_number: number;
  reps: number;
  weight_kg: number;
}

export interface LogExercise {
  id: number;
  log_id: number;
  exercise_id: string;
  completed: number;
  exercise: Exercise | undefined;
  sets: LogSet[];
  prevSets: PrevSet[];
  personalRecord: { weight_kg: number; reps: number } | null;
}

export interface WorkoutLog {
  id: number;
  date: string;
  workout_type: string;
  duration_minutes: number;
  notes: string;
  completed: number;
  started_at: string;
  exercises: LogExercise[];
}

export function useWorkoutLog(date: string = today()) {
  const [log, setLog] = useState<WorkoutLog | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const db = getDB();
    const rawLog = db.getFirstSync<{
      id: number; date: string; workout_type: string;
      duration_minutes: number; notes: string; completed: number; started_at: string;
    }>('SELECT * FROM workout_logs WHERE date = ?', [date]);

    if (!rawLog) {
      setLog(null);
      setLoading(false);
      return;
    }

    const rawExercises = db.getAllSync<{
      id: number; log_id: number; exercise_id: string; completed: number;
    }>('SELECT * FROM log_exercises WHERE log_id = ?', [rawLog.id]);

    const exercises: LogExercise[] = rawExercises.map((e) => {
      const sets = db.getAllSync<LogSet>(
        'SELECT * FROM log_sets WHERE log_exercise_id = ? ORDER BY set_number',
        [e.id]
      );

      // Fetch last completed session's sets for this exercise (for "Last:" reference)
      const prevSets = db.getAllSync<PrevSet>(
        `SELECT ls.set_number, ls.reps, ls.weight_kg
         FROM log_sets ls
         JOIN log_exercises le ON le.id = ls.log_exercise_id
         JOIN workout_logs wl ON wl.id = le.log_id
         WHERE le.exercise_id = ? AND wl.completed = 1 AND wl.date < ?
           AND ls.completed = 1
         ORDER BY wl.date DESC, ls.set_number ASC
         LIMIT 6`,
        [e.exercise_id, date]
      );

      // Fetch personal record
      const personalRecord = db.getFirstSync<{ weight_kg: number; reps: number }>(
        'SELECT weight_kg, reps FROM personal_records WHERE exercise_id = ?',
        [e.exercise_id]
      );

      return {
        ...e,
        exercise: EXERCISES.find((ex) => ex.id === e.exercise_id),
        sets,
        prevSets,
        personalRecord: personalRecord ?? null,
      };
    });

    setLog({ ...rawLog, exercises });
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const startWorkout = useCallback((workoutType = 'gym') => {
    const db = getDB();
    db.runSync(
      'INSERT OR IGNORE INTO workout_logs (date, workout_type, started_at) VALUES (?, ?, ?)',
      [date, workoutType, new Date().toISOString()]
    );
    load();
  }, [date, load]);

  const addExerciseToLog = useCallback((logId: number, exerciseId: string, sets: number, reps: number) => {
    const db = getDB();
    db.runSync('INSERT INTO log_exercises (log_id, exercise_id) VALUES (?, ?)', [logId, exerciseId]);
    const logExId = db.getFirstSync<{ id: number }>(
      'SELECT id FROM log_exercises WHERE log_id = ? AND exercise_id = ? ORDER BY id DESC',
      [logId, exerciseId]
    )?.id;
    if (logExId) {
      // Get last session weights to pre-fill
      const lastSets = db.getAllSync<{ reps: number; weight_kg: number }>(
        `SELECT ls.reps, ls.weight_kg
         FROM log_sets ls
         JOIN log_exercises le ON le.id = ls.log_exercise_id
         JOIN workout_logs wl ON wl.id = le.log_id
         WHERE le.exercise_id = ? AND wl.completed = 1
         ORDER BY wl.date DESC, ls.set_number ASC
         LIMIT ?`,
        [exerciseId, sets]
      );
      for (let i = 1; i <= sets; i++) {
        const lastSet = lastSets[i - 1];
        db.runSync(
          'INSERT INTO log_sets (log_exercise_id, set_number, reps, weight_kg) VALUES (?, ?, ?, ?)',
          [logExId, i, lastSet?.reps ?? reps, lastSet?.weight_kg ?? 0]
        );
      }
    }
    load();
  }, [load]);

  const toggleSet = useCallback((setId: number, reps: number, weightKg: number) => {
    const db = getDB();
    const current = db.getFirstSync<{ completed: number }>(
      'SELECT completed FROM log_sets WHERE id = ?', [setId]
    );
    const newCompleted = current?.completed ? 0 : 1;
    db.runSync(
      'UPDATE log_sets SET completed = ?, reps = ?, weight_kg = ? WHERE id = ?',
      [newCompleted, reps, weightKg, setId]
    );
    load();
  }, [load]);

  const updateSet = useCallback((setId: number, reps: number, weightKg: number) => {
    const db = getDB();
    db.runSync('UPDATE log_sets SET reps = ?, weight_kg = ? WHERE id = ?', [reps, weightKg, setId]);
    load();
  }, [load]);

  const toggleExercise = useCallback((logExerciseId: number) => {
    const db = getDB();
    const current = db.getFirstSync<{ completed: number }>(
      'SELECT completed FROM log_exercises WHERE id = ?', [logExerciseId]
    );
    db.runSync('UPDATE log_exercises SET completed = ? WHERE id = ?', [current?.completed ? 0 : 1, logExerciseId]);
    load();
  }, [load]);

  const completeWorkout = useCallback((logId: number, durationMinutes: number) => {
    const db = getDB();
    db.runSync(
      'UPDATE workout_logs SET completed = 1, duration_minutes = ? WHERE id = ?',
      [durationMinutes, logId]
    );

    // Update personal records
    const exercises = db.getAllSync<{ exercise_id: string; max_weight: number; reps: number }>(
      `SELECT le.exercise_id, MAX(ls.weight_kg) as max_weight, ls.reps
       FROM log_exercises le
       JOIN log_sets ls ON ls.log_exercise_id = le.id
       WHERE le.log_id = ? AND ls.completed = 1
       GROUP BY le.exercise_id`,
      [logId]
    );
    for (const ex of exercises) {
      if (ex.max_weight > 0) {
        const existing = db.getFirstSync<{ weight_kg: number }>(
          'SELECT weight_kg FROM personal_records WHERE exercise_id = ?', [ex.exercise_id]
        );
        if (!existing || ex.max_weight > existing.weight_kg) {
          const achievedAt = new Date().toISOString().split('T')[0];
          db.runSync(
            `INSERT INTO personal_records (exercise_id, weight_kg, reps, achieved_at)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(exercise_id) DO UPDATE SET weight_kg = ?, reps = ?, achieved_at = ?`,
            [ex.exercise_id, ex.max_weight, ex.reps, achievedAt, ex.max_weight, ex.reps, achievedAt]
          );
        }
      }
    }

    load();
  }, [load]);

  return {
    log, loading,
    startWorkout, addExerciseToLog, toggleSet, updateSet,
    toggleExercise, completeWorkout, refresh: load,
  };
}
