import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, FontSize, FontWeight, Spacing } from '../constants/theme';
import { useStepCounter, StepDay } from '../hooks/useStepCounter';

const DAILY_GOAL = 10_000;

// ── Mini circular progress ring (SVG via inline web path approximation)
// On React Native web we draw a ring with border tricks
function RingProgress({ pct, steps }: { pct: number; steps: number }) {
  const SIZE = 110;
  const STROKE = 9;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const dash = pct * CIRC;

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      {/* SVG ring — works on web */}
      <svg
        width={SIZE}
        height={SIZE}
        style={{ position: 'absolute', top: 0, left: 0 } as any}
      >
        {/* Track */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none" stroke="#1C1C1E" strokeWidth={STROKE}
        />
        {/* Progress arc */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none"
          stroke="#00E676"
          strokeWidth={STROKE}
          strokeDasharray={`${dash} ${CIRC}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          style={{ transition: 'stroke-dasharray 0.4s ease' } as any}
        />
      </svg>
      <Text style={styles.ringSteps}>{steps.toLocaleString()}</Text>
      <Text style={styles.ringLabel}>steps</Text>
    </View>
  );
}

// ── Weekly mini bar chart
function WeekBars({ data }: { data: StepDay[] }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Build 7-day array ending today
  const slots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const str = d.toISOString().split('T')[0];
    const found = data.find((x) => x.date === str);
    return { label: days[d.getDay() === 0 ? 6 : d.getDay() - 1], steps: found?.steps ?? 0, isToday: str === todayStr };
  });

  const max = Math.max(...slots.map((s) => s.steps), 1000);

  return (
    <View style={styles.weekRow}>
      {slots.map((slot, i) => {
        const h = Math.max(4, (slot.steps / max) * 44);
        return (
          <View key={i} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { height: h, backgroundColor: slot.isToday ? '#00E676' : '#2C2C2E' }]} />
            </View>
            <Text style={[styles.barLabel, slot.isToday && { color: '#00E676' }]}>{slot.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function StepCounter() {
  const { steps, weeklySteps, permissionState, isTracking, requestPermission } = useStepCounter();
  const pct = Math.min(1, steps / DAILY_GOAL);
  const goalMet = steps >= DAILY_GOAL;

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isTracking) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.07, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isTracking]);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Steps Today</Text>
          <Text style={styles.sub}>Goal: {DAILY_GOAL.toLocaleString()} steps</Text>
        </View>
        {isTracking ? (
          <View style={styles.liveDot}>
            <Animated.View style={[styles.livePulse, { transform: [{ scale: pulse }] }]} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        ) : null}
      </View>

      {/* Ring + right stats */}
      <View style={styles.body}>
        <RingProgress pct={pct} steps={steps} />

        <View style={styles.statsCol}>
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>🎯</Text>
            <View>
              <Text style={styles.statVal}>{Math.round(pct * 100)}%</Text>
              <Text style={styles.statLbl}>of goal</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>📏</Text>
            <View>
              <Text style={styles.statVal}>{(steps * 0.762 / 1000).toFixed(2)} km</Text>
              <Text style={styles.statLbl}>distance</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>🔥</Text>
            <View>
              <Text style={styles.statVal}>{Math.round(steps * 0.04)} cal</Text>
              <Text style={styles.statLbl}>burned</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Goal met banner */}
      {goalMet && (
        <LinearGradient colors={['#00E676', '#1DE9B6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.goalBanner}>
          <Text style={styles.goalText}>🎉 Daily goal reached!</Text>
        </LinearGradient>
      )}

      {/* Weekly bars */}
      <Text style={styles.weekTitle}>This Week</Text>
      <WeekBars data={weeklySteps} />

      {/* Permission / start button */}
      {permissionState !== 'granted' && (
        <TouchableOpacity onPress={requestPermission} activeOpacity={0.85} style={styles.permBtn}>
          <LinearGradient colors={['#00E676', '#1DE9B6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.permBtnInner}>
            <Text style={styles.permBtnText}>
              {permissionState === 'denied' ? '⚠️ Motion permission denied — check Safari settings' : '👟 Enable Step Tracking'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111111',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  sub: { color: Colors.textTertiary, fontSize: FontSize.xs, marginTop: 2 },
  liveDot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00E676' },
  liveText: { color: '#00E676', fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  body: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.md },
  ringSteps: { color: Colors.textPrimary, fontSize: 22, fontWeight: FontWeight.bold },
  ringLabel: { color: Colors.textTertiary, fontSize: FontSize.xs },
  statsCol: { flex: 1, gap: 12 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIcon: { fontSize: 18 },
  statVal: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  statLbl: { color: Colors.textTertiary, fontSize: 11 },
  goalBanner: { borderRadius: Radius.sm, paddingVertical: 8, paddingHorizontal: 14, marginBottom: Spacing.md, alignItems: 'center' },
  goalText: { color: '#000', fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  weekTitle: { color: Colors.textTertiary, fontSize: FontSize.xs, fontWeight: FontWeight.semibold, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  barCol: { alignItems: 'center', flex: 1 },
  barTrack: { height: 44, justifyContent: 'flex-end', marginBottom: 4 },
  barFill: { width: 14, borderRadius: 4 },
  barLabel: { color: Colors.textTertiary, fontSize: 10 },
  permBtn: { marginTop: Spacing.md },
  permBtnInner: { borderRadius: Radius.sm, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  permBtnText: { color: '#000', fontWeight: FontWeight.bold, fontSize: FontSize.sm },
});
