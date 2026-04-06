import { useCallback } from 'react';
import { getDB } from '../db/client';
import { EXERCISES, Exercise, MuscleGroup } from '../constants/exercises';

export interface TodaySuggestion {
  muscle_groups: MuscleGroup[];
  exercises: Exercise[];
  reason: string;
}

export function useWhatToday() {
  const suggest = useCallback((): TodaySuggestion => {
    const db = getDB();
    const muscleGroups: MuscleGroup[] = ['chest', 'back', 'lats', 'shoulders', 'biceps', 'triceps', 'core', 'quads', 'hamstrings', 'glutes', 'calves'];

    // Get days since each muscle group was last trained
    const scored = muscleGroups.map((mg) => {
      const exerciseIds = EXERCISES.filter((e) => e.muscle_group === mg).map((e) => e.id);
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
      return { mg, daysSince };
    });

    // Sort by most neglected (most days since training)
    scored.sort((a, b) => b.daysSince - a.daysSince);

    // Pick top 2 muscle groups
    const top2 = scored.slice(0, 2).map((s) => s.mg);
    const topDays = scored[0]?.daysSince ?? 999;

    // Pick 2-3 exercises per muscle group
    const suggestedExercises: Exercise[] = [];
    for (const mg of top2) {
      const mgExercises = EXERCISES.filter((e) => e.muscle_group === mg);
      const picked = mgExercises.slice(0, 3);
      suggestedExercises.push(...picked);
    }

    // Build reason message
    let reason = '';
    if (topDays >= 999) {
      reason = "You haven't trained these yet. Start here!";
    } else if (topDays >= 3) {
      reason = `Your ${top2[0]} and ${top2[1]} haven't been trained in ${topDays}+ days.`;
    } else if (topDays >= 1) {
      reason = `Balanced push — ${top2[0]} and ${top2[1]} are ready for another session.`;
    } else {
      reason = `Consider rest or light cardio — you trained yesterday.`;
    }

    return {
      muscle_groups: top2,
      exercises: suggestedExercises,
      reason,
    };
  }, []);

  return { suggest };
}
