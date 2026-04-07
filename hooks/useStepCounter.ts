// Step counter using the DeviceMotion API (accelerometer)
// Works in Safari PWA on iPhone — no HealthKit access needed from web
// iOS 13+ requires explicit permission via DeviceMotionEvent.requestPermission()

import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY = 'formiq_steps';
const STEP_THRESHOLD = 11;     // m/s² acceleration magnitude to detect a step peak
const MIN_STEP_GAP_MS = 280;   // min milliseconds between two steps (~fastest walk cadence)
const SAVE_EVERY = 10;         // persist to localStorage every N steps

export type StepDay = {
  date: string;   // YYYY-MM-DD
  steps: number;
};

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function readData(): StepDay[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeData(data: StepDay[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function saveStepsForToday(count: number) {
  const data = readData();
  const today = todayStr();
  const idx = data.findIndex((d) => d.date === today);
  if (idx >= 0) {
    data[idx].steps = count;
  } else {
    data.push({ date: today, steps: count });
  }
  // Keep last 30 days only
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  writeData(data.filter((d) => d.date >= cutoffStr));
}

export function useStepCounter() {
  const [steps, setSteps] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState<StepDay[]>([]);
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [isTracking, setIsTracking] = useState(false);

  const stepsRef = useRef(0);
  const lastStepTs = useRef(0);
  const abovePeak = useRef(false);

  // Load saved steps on mount
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const data = readData();
    const today = data.find((d) => d.date === todayStr());
    if (today) {
      stepsRef.current = today.steps;
      setSteps(today.steps);
    }
    const week = new Date();
    week.setDate(week.getDate() - 7);
    const weekStr = week.toISOString().split('T')[0];
    setWeeklySteps(data.filter((d) => d.date >= weekStr));
  }, []);

  const handleMotion = useCallback((e: Event) => {
    const evt = e as DeviceMotionEvent;
    const acc = evt.accelerationIncludingGravity;
    if (!acc) return;
    const x = acc.x ?? 0;
    const y = acc.y ?? 0;
    const z = acc.z ?? 0;
    const mag = Math.sqrt(x * x + y * y + z * z);

    // Peak detection: wait for magnitude to rise above threshold, then fall back
    if (mag > STEP_THRESHOLD && !abovePeak.current) {
      const now = Date.now();
      if (now - lastStepTs.current > MIN_STEP_GAP_MS) {
        abovePeak.current = true;
        lastStepTs.current = now;
        stepsRef.current += 1;
        setSteps(stepsRef.current);
        if (stepsRef.current % SAVE_EVERY === 0) {
          saveStepsForToday(stepsRef.current);
        }
      }
    } else if (mag < STEP_THRESHOLD - 2) {
      abovePeak.current = false;
    }
  }, []);

  const startTracking = useCallback(() => {
    window.addEventListener('devicemotion', handleMotion);
    setIsTracking(true);
  }, [handleMotion]);

  const stopTracking = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion);
    setIsTracking(false);
    saveStepsForToday(stepsRef.current);
  }, [handleMotion]);

  // Save on unmount / page hide
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onHide = () => saveStepsForToday(stepsRef.current);
    window.addEventListener('pagehide', onHide);
    window.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      window.removeEventListener('visibilitychange', onHide);
      saveStepsForToday(stepsRef.current);
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'web') return false;
    if (typeof window === 'undefined') return false;

    // iOS 13+ requires explicit permission
    const DMe = window.DeviceMotionEvent as typeof DeviceMotionEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DMe?.requestPermission === 'function') {
      try {
        const result = await DMe.requestPermission();
        if (result === 'granted') {
          setPermissionState('granted');
          startTracking();
          return true;
        } else {
          setPermissionState('denied');
          return false;
        }
      } catch {
        setPermissionState('denied');
        return false;
      }
    } else if (typeof window.DeviceMotionEvent !== 'undefined') {
      // Android / desktop — no permission needed
      setPermissionState('granted');
      startTracking();
      return true;
    } else {
      setPermissionState('denied');
      return false;
    }
  }, [startTracking]);

  return {
    steps,
    weeklySteps,
    permissionState,
    isTracking,
    requestPermission,
    stopTracking,
  };
}
