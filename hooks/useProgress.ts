import { useState, useEffect, useCallback } from 'react';
import { getDB, today } from '../db/client';
import { EXERCISES } from '../constants/exercises';

export interface DayLog {
  date: string;
  workout_type: string | null; // null = rest/no log
  completed: number;
}

export interface PersonalRecord {
  exercise_id: string;
  exercise_name: string;
  weight_kg: number;
  reps: number;
  achieved_at: string;
}

export interface MuscleFrequency {
  muscle_group: string;
  last_trained: string | null;
  days_since: number;
}

export function useProgress() {
  const [heatmap, setHeatmap] = useState<DayLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [weeklyConsistency, setWeeklyConsistency] = useState(0);
  const [monthlyConsistency, setMonthlyConsistency] = useState(0);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [muscleFrequency, setMuscleFrequency] = useState<MuscleFrequency[]>([]);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const db = getDB();

    // Build last 84 days (12 weeks) heatmap
    const days: DayLog[] = [];
    const todayDate = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = db.getFirstSync<{ workout_type: string; completed: number }>(
        'SELECT workout_type, completed FROM workout_logs WHERE date = ?',
        [dateStr]
      );
      days.push({
        date: dateStr,
        workout_type: log?.workout_type ?? null,
        completed: log?.completed ?? 0,
      });
    }
    setHeatmap(days);

    // Streak: count backwards from today
    let streakCount = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].completed === 1) {
        streakCount++;
      } else {
        // Allow today to not be completed yet
        if (days[i].date === today() && streakCount === 0) continue;
        break;
      }
    }
    setStreak(streakCount);

    // Weekly consistency (last 7 days)
    const lastWeek = days.slice(-7);
    const weekDone = lastWeek.filter((d) => d.completed === 1).length;
    setWeeklyConsistency(Math.round((weekDone / 7) * 100));

    // Monthly consistency (last 30 days)
    const lastMonth = days.slice(-30);
    const monthDone = lastMonth.filter((d) => d.completed === 1).length;
    setMonthlyConsistency(Math.round((monthDone / 30) * 100));

    // Total workouts
    const total = db.getFirstSync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM workout_logs WHERE completed = 1'
    )?.cnt ?? 0;
    setTotalWorkouts(total);

    // Personal records
    const prs = db.getAllSync<{ exercise_id: string; weight_kg: number; reps: number; achieved_at: string }>(
      'SELECT * FROM personal_records ORDER BY achieved_at DESC'
    );
    setPersonalRecords(
      prs.map((pr) => ({
        ...pr,
        exercise_name: EXERCISES.find((e) => e.id === pr.exercise_id)?.name ?? pr.exercise_id,
      }))
    );

    // Muscle group frequency (when was each group last trained)
    const muscleGroups = ['chest', 'back', 'lats', 'shoulders', 'biceps', 'triceps', 'core', 'quads', 'hamstrings', 'glutes', 'calves'];
    const frequencies: MuscleFrequency[] = muscleGroups.map((mg) => {
      // Find exercises in this muscle group that were completed recently
      const exerciseIds = EXERCISES.filter((e) => e.muscle_group === mg).map((e) => e.id);
      if (exerciseIds.length === 0) return { muscle_group: mg, last_trained: null, days_since: 999 };

      const placeholders = exerciseIds.map(() => '?').join(',');
      const lastLog = db.getFirstSync<{ date: string }>(
        `SELECT wl.date FROM log_exercises le
         JOIN workout_logs wl ON wl.id = le.log_id
         WHERE le.exercise_id IN (${placeholders}) AND wl.completed = 1
         ORDER BY wl.date DESC LIMIT 1`,
        exerciseIds
      );

      const lastDate = lastLog?.date ?? null;
      let daysSince = 999;
      if (lastDate) {
        const diff = new Date().getTime() - new Date(lastDate).getTime();
        daysSince = Math.floor(diff / (1000 * 60 * 60 * 24));
      }
      return { muscle_group: mg, last_trained: lastDate, days_since: daysSince };
    });
    setMuscleFrequency(frequencies);

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return {
    heatmap, streak, weeklyConsistency, monthlyConsistency,
    personalRecords, muscleFrequency, totalWorkouts, loading, refresh: load,
  };
}
