import { useState, useEffect, useCallback } from 'react';
import { getDB, today } from '../db/client';

export type CardioType = 'treadmill' | 'outdoor_run' | 'cycling' | 'elliptical' | 'rowing' | 'stair_climber';

export interface CardioLog {
  id: number;
  date: string;
  type: CardioType;
  distance_km: number;
  duration_minutes: number;
  avg_speed_kmh: number;
  calories: number;
  notes: string;
  created_at: string;
}

export const CARDIO_TYPES: { key: CardioType; label: string; emoji: string; color: string }[] = [
  { key: 'treadmill',    label: 'Treadmill',    emoji: '🏃', color: '#00B0FF' },
  { key: 'outdoor_run',  label: 'Outdoor Run',  emoji: '🌿', color: '#00E676' },
  { key: 'cycling',      label: 'Cycling',      emoji: '🚴', color: '#FF6D00' },
  { key: 'elliptical',   label: 'Elliptical',   emoji: '🌀', color: '#BD7AFF' },
  { key: 'rowing',       label: 'Rowing',       emoji: '🚣', color: '#2979FF' },
  { key: 'stair_climber',label: 'Stairs',       emoji: '🪜', color: '#FF5252' },
];

// Approx calories burned (MET-based, 75kg person)
function estimateCalories(type: CardioType, durationMin: number, distanceKm: number): number {
  const MET: Record<CardioType, number> = {
    treadmill: 9.8,
    outdoor_run: 10.5,
    cycling: 7.5,
    elliptical: 5.0,
    rowing: 7.0,
    stair_climber: 9.0,
  };
  const met = MET[type] ?? 8;
  // Calories = MET × weight(kg) × hours
  return Math.round(met * 75 * (durationMin / 60));
}

export function useCardio(date: string = today()) {
  const [logs, setLogs] = useState<CardioLog[]>([]);
  const [allLogs, setAllLogs] = useState<CardioLog[]>([]);

  const load = useCallback(() => {
    try {
      const db = getDB();
      const todayRows = db.getAllSync<CardioLog>(
        'SELECT * FROM cardio_logs WHERE date = ? ORDER BY created_at DESC',
        [date]
      );
      setLogs(todayRows);

      const recentRows = db.getAllSync<CardioLog>(
        'SELECT * FROM cardio_logs ORDER BY date DESC, created_at DESC LIMIT 100'
      );
      setAllLogs(recentRows);
    } catch {
      setLogs([]);
      setAllLogs([]);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const logCardio = useCallback((
    type: CardioType,
    distanceKm: number,
    durationMinutes: number,
    avgSpeedKmh?: number,
    notes?: string
  ) => {
    const db = getDB();
    const speed = avgSpeedKmh ?? (durationMinutes > 0 ? (distanceKm / durationMinutes) * 60 : 0);
    const calories = estimateCalories(type, durationMinutes, distanceKm);
    db.runSync(
      `INSERT INTO cardio_logs (date, type, distance_km, duration_minutes, avg_speed_kmh, calories, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, type, distanceKm, durationMinutes, speed, calories, notes ?? '', new Date().toISOString()]
    );
    load();
  }, [date, load]);

  const deleteLog = useCallback((id: number) => {
    const db = getDB();
    db.runSync('DELETE FROM cardio_logs WHERE id = ?', [id]);
    load();
  }, [load]);

  // Totals for today
  const todayTotals = {
    distance_km: logs.reduce((s, l) => s + l.distance_km, 0),
    duration_minutes: logs.reduce((s, l) => s + l.duration_minutes, 0),
    calories: logs.reduce((s, l) => s + l.calories, 0),
  };

  // Weekly totals
  const weeklyTotals = (() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const week = allLogs.filter((l) => l.date >= cutoffStr);
    return {
      distance_km: week.reduce((s, l) => s + l.distance_km, 0),
      sessions: week.length,
      calories: week.reduce((s, l) => s + l.calories, 0),
    };
  })();

  return { logs, allLogs, todayTotals, weeklyTotals, logCardio, deleteLog, refresh: load };
}
