import { useState, useEffect, useCallback } from 'react';
import { getDB, today, dayOfWeek } from '../db/client';
import { EXERCISES, Exercise } from '../constants/exercises';

export interface PlanDay {
  id: number;
  plan_id: number;
  day_of_week: number;
  workout_type: string;
  exercises: PlanDayExercise[];
}

export interface PlanDayExercise {
  id: number;
  plan_day_id: number;
  exercise_id: string;
  sets: number;
  reps: number;
  order_index: number;
  exercise: Exercise | undefined;
}

export interface Plan {
  id: number;
  name: string;
  is_active: number;
  created_at: string;
  days: PlanDay[];
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function getDayName(index: number) {
  return DAY_NAMES[index] ?? 'Day';
}

export function usePlan() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [todayPlan, setTodayPlan] = useState<PlanDay | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const db = getDB();
    const rawPlans = db.getAllSync<{ id: number; name: string; is_active: number; created_at: string }>(
      'SELECT * FROM plans ORDER BY is_active DESC, created_at DESC'
    );

    const loadedPlans: Plan[] = rawPlans.map((p) => {
      const rawDays = db.getAllSync<{ id: number; plan_id: number; day_of_week: number; workout_type: string }>(
        'SELECT * FROM plan_days WHERE plan_id = ? ORDER BY day_of_week',
        [p.id]
      );

      const days: PlanDay[] = rawDays.map((d) => {
        const rawExercises = db.getAllSync<{
          id: number; plan_day_id: number; exercise_id: string;
          sets: number; reps: number; order_index: number;
        }>(
          'SELECT * FROM plan_day_exercises WHERE plan_day_id = ? ORDER BY order_index',
          [d.id]
        );

        return {
          ...d,
          exercises: rawExercises.map((e) => ({
            ...e,
            exercise: EXERCISES.find((ex) => ex.id === e.exercise_id),
          })),
        };
      });

      return { ...p, days };
    });

    setPlans(loadedPlans);
    const active = loadedPlans.find((p) => p.is_active === 1) ?? null;
    setActivePlan(active);

    if (active) {
      const todayDow = dayOfWeek();
      const found = active.days.find((d) => d.day_of_week === todayDow) ?? null;
      setTodayPlan(found);
    } else {
      setTodayPlan(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createPlan = useCallback((name: string) => {
    const db = getDB();
    db.runSync('INSERT INTO plans (name, is_active) VALUES (?, 0)', [name]);
    load();
  }, [load]);

  const setActivePlanById = useCallback((planId: number) => {
    const db = getDB();
    db.runSync('UPDATE plans SET is_active = 0');
    db.runSync('UPDATE plans SET is_active = 1 WHERE id = ?', [planId]);
    load();
  }, [load]);

  const deletePlan = useCallback((planId: number) => {
    const db = getDB();
    db.runSync('DELETE FROM plans WHERE id = ?', [planId]);
    load();
  }, [load]);

  const upsertPlanDay = useCallback((planId: number, dayOfWeekIdx: number, workoutType: string) => {
    const db = getDB();
    const existing = db.getFirstSync<{ id: number }>(
      'SELECT id FROM plan_days WHERE plan_id = ? AND day_of_week = ?',
      [planId, dayOfWeekIdx]
    );
    if (existing) {
      db.runSync('UPDATE plan_days SET workout_type = ? WHERE id = ?', [workoutType, existing.id]);
    } else {
      db.runSync(
        'INSERT INTO plan_days (plan_id, day_of_week, workout_type) VALUES (?, ?, ?)',
        [planId, dayOfWeekIdx, workoutType]
      );
    }
    load();
  }, [load]);

  const addExerciseToPlanDay = useCallback((planDayId: number, exerciseId: string, sets: number, reps: number) => {
    const db = getDB();
    const count = db.getFirstSync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM plan_day_exercises WHERE plan_day_id = ?',
      [planDayId]
    )?.cnt ?? 0;
    db.runSync(
      'INSERT INTO plan_day_exercises (plan_day_id, exercise_id, sets, reps, order_index) VALUES (?, ?, ?, ?, ?)',
      [planDayId, exerciseId, sets, reps, count]
    );
    load();
  }, [load]);

  const removeExerciseFromPlanDay = useCallback((planDayExerciseId: number) => {
    const db = getDB();
    db.runSync('DELETE FROM plan_day_exercises WHERE id = ?', [planDayExerciseId]);
    load();
  }, [load]);

  const ensurePlanDayExists = useCallback((planId: number, dayOfWeekIdx: number, workoutType = 'gym') => {
    const db = getDB();
    const existing = db.getFirstSync<{ id: number }>(
      'SELECT id FROM plan_days WHERE plan_id = ? AND day_of_week = ?',
      [planId, dayOfWeekIdx]
    );
    if (!existing) {
      db.runSync(
        'INSERT INTO plan_days (plan_id, day_of_week, workout_type) VALUES (?, ?, ?)',
        [planId, dayOfWeekIdx, workoutType]
      );
      load();
      return db.getFirstSync<{ id: number }>(
        'SELECT id FROM plan_days WHERE plan_id = ? AND day_of_week = ?',
        [planId, dayOfWeekIdx]
      )?.id;
    }
    return existing.id;
  }, [load]);

  return {
    plans, activePlan, todayPlan, loading,
    createPlan, setActivePlanById, deletePlan,
    upsertPlanDay, addExerciseToPlanDay, removeExerciseFromPlanDay,
    ensurePlanDayExists, refresh: load,
  };
}
