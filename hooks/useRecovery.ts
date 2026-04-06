import { useState, useEffect, useCallback } from 'react';
import { getDB } from '../db/client';
import { EXERCISES, MuscleGroup } from '../constants/exercises';

export interface MuscleStatus {
  muscle_group: MuscleGroup;
  status: 'ready' | 'recovering' | 'untrained';
  hours_since: number;
  label: string;
}

const RECOVERY_HOURS = 48;

export function useRecovery() {
  const [muscleStatuses, setMuscleStatuses] = useState<MuscleStatus[]>([]);

  const load = useCallback(() => {
    const db = getDB();
    const muscleGroups: MuscleGroup[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'core', 'quads', 'hamstrings', 'glutes', 'calves', 'lats', 'traps'];

    const statuses: MuscleStatus[] = muscleGroups.map((mg) => {
      const exerciseIds = EXERCISES.filter((e) => e.muscle_group === mg).map((e) => e.id);
      const placeholders = exerciseIds.map(() => '?').join(',');
      const lastLog = db.getFirstSync<{ started_at: string }>(
        `SELECT wl.started_at FROM log_exercises le
         JOIN workout_logs wl ON wl.id = le.log_id
         WHERE le.exercise_id IN (${placeholders}) AND wl.completed = 1
         ORDER BY wl.started_at DESC LIMIT 1`,
        exerciseIds
      );

      if (!lastLog) {
        return { muscle_group: mg, status: 'untrained', hours_since: 999, label: 'Never trained' };
      }

      const lastDate = new Date(lastLog.started_at);
      const hoursSince = (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60);

      if (hoursSince < RECOVERY_HOURS) {
        const hoursLeft = Math.ceil(RECOVERY_HOURS - hoursSince);
        return {
          muscle_group: mg,
          status: 'recovering',
          hours_since: hoursSince,
          label: `${hoursLeft}h to recover`,
        };
      }

      return { muscle_group: mg, status: 'ready', hours_since: hoursSince, label: 'Ready to train' };
    });

    setMuscleStatuses(statuses);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { muscleStatuses, refresh: load };
}
