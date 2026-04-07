import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, Alert, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme';
import { usePlan } from '../../hooks/usePlan';
import { useWorkoutLog } from '../../hooks/useWorkoutLog';
import { useWhatToday } from '../../hooks/useWhatToday';
import { useRecovery } from '../../hooks/useRecovery';
import { today, getDB } from '../../db/client';
import { LAZY_DAY_EXERCISES, Exercise } from '../../constants/exercises';
import SetLogger from '../../components/SetLogger';
import RecoveryVisualizer from '../../components/RecoveryVisualizer';
import ExerciseCard from '../../components/ExerciseCard';
import RestTimer from '../../components/RestTimer';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getStreak(): number {
  try {
    const db = getDB();
    const rows = db.getAllSync<{ date: string }>(
      `SELECT date FROM workout_logs WHERE completed = 1 ORDER BY date DESC LIMIT 60`
    );
    if (!rows.length) return 0;
    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (const row of rows) {
      const d = new Date(row.date);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000);
      if (diff > 1) break;
      streak++;
      cursor = d;
    }
    return streak;
  } catch {
    return 0;
  }
}

// Animated stat card
function StatCard({ value, label, color, delay = 0 }: { value: string; label: string; color: string; delay?: number }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.statCard, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      <Text style={styles.statCardLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { todayPlan, activePlan } = usePlan();
  const { log, startWorkout, addExerciseToLog, toggleSet, updateSet, completeWorkout, refresh } = useWorkoutLog();
  const { suggest } = useWhatToday();
  const { muscleStatuses } = useRecovery();

  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState<ReturnType<typeof suggest> | null>(null);
  const [showLazyDay, setShowLazyDay] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [streak, setStreak] = useState(0);
  const startTimeRef = useRef(Date.now());
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-30)).current;

  const todayDate = new Date();
  const dayName = DAY_NAMES[todayDate.getDay() === 0 ? 6 : todayDate.getDay() - 1];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
    setStreak(getStreak());
  }, []);

  useEffect(() => {
    if (!log || log.completed === 1) return;
    const t = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [log?.id, log?.completed]);

  const elapsed = (() => {
    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  })();

  const handleStartWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    startWorkout(todayPlan?.workout_type ?? 'gym');
  };

  const handleWhatToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSuggestion(suggest());
    setShowSuggestion(true);
  };

  const handleAddSuggested = (ex: Exercise) => {
    if (!log) return;
    addExerciseToLog(log.id, ex.id, ex.sets_default, ex.reps_default);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleComplete = () => {
    if (!log) return;
    const mins = Math.max(1, Math.round(elapsedSeconds / 60));
    completeWorkout(log.id, mins);
    const newStreak = getStreak();
    setStreak(newStreak);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      '🎉 Workout Complete!',
      `${log.exercises.length} exercises · ${mins} min${newStreak > 0 ? `\n🔥 ${newStreak}-day streak!` : ''}`
    );
  };

  const completedCount = log?.exercises.filter((e) => e.completed === 1).length ?? 0;
  const totalExercises = log?.exercises.length ?? 0;
  const progressPct = totalExercises > 0 ? completedCount / totalExercises : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Hero Header ── */}
        <Animated.View style={[styles.hero, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}>
          <LinearGradient
            colors={['#00E676', '#1DE9B6', '#00B0FF']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroGradientBar}
          />
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
              <Text style={styles.date}>{dayName} · {todayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
            </View>
            <View style={styles.heroRight}>
              {streak > 0 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakFire}>🔥</Text>
                  <Text style={styles.streakNum}>{streak}</Text>
                </View>
              )}
              {log?.completed === 1 && (
                <View style={styles.doneBadge}>
                  <Text style={styles.doneBadgeText}>Done ✓</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* ── Stat row ── */}
        <View style={styles.statRow}>
          <StatCard value={streak > 0 ? `${streak}d` : '—'} label="Streak" color={Colors.accent} delay={100} />
          <StatCard value={log?.completed === 1 ? `${log.duration_minutes}m` : log ? elapsed : '—'} label={log?.completed === 1 ? 'Duration' : 'Elapsed'} color="#00B0FF" delay={200} />
          <StatCard value={totalExercises > 0 ? `${completedCount}/${totalExercises}` : '—'} label="Exercises" color="#BD7AFF" delay={300} />
        </View>

        {/* ── What Today button ── */}
        <TouchableOpacity onPress={handleWhatToday} activeOpacity={0.85}>
          <LinearGradient
            colors={['#00E676', '#1DE9B6']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.whatBtn}
          >
            <Text style={styles.whatBtnEmoji}>🧠</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.whatBtnTitle}>What should I train today?</Text>
              <Text style={styles.whatBtnSub}>Smart pick based on muscle recovery</Text>
            </View>
            <Text style={styles.whatBtnArrow}>›</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Today's Plan ── */}
        {todayPlan ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today's Plan</Text>
              <Text style={styles.cardMeta}>{activePlan?.name}</Text>
            </View>
            <Text style={styles.cardSub}>{todayPlan.exercises.length} exercises planned</Text>
            {!log && (
              <TouchableOpacity onPress={handleStartWorkout} style={styles.startBtn} activeOpacity={0.8}>
                <Text style={styles.startBtnText}>▶  Start Workout</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>No workout planned today</Text>
            <Text style={styles.emptySub}>Set up your week in the Plan tab</Text>
          </View>
        )}

        {/* ── Active Session ── */}
        {log && log.completed !== 1 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Active Session</Text>
              <Text style={[styles.cardMeta, { color: Colors.accent }]}>⏱ {elapsed}</Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: `${progressPct * 100}%` as `${number}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{completedCount} of {totalExercises} complete</Text>

            {log.exercises.map((logEx) => (
              <View key={logEx.id} style={styles.exBlock}>
                <View style={styles.exRow}>
                  <View style={[styles.exDot, logEx.completed === 1 && styles.exDotDone]} />
                  <Text style={[styles.exName, logEx.completed === 1 && styles.exNameDone]}>
                    {logEx.exercise?.name ?? logEx.exercise_id}
                  </Text>
                  {logEx.completed === 1 && <Text style={styles.exCheck}>✓</Text>}
                </View>
                <SetLogger
                  sets={logEx.sets}
                  prevSets={logEx.prevSets}
                  personalRecord={logEx.personalRecord}
                  onToggleSet={toggleSet}
                  onUpdateSet={updateSet}
                  onSetCompleted={() => setShowRestTimer(true)}
                />
              </View>
            ))}

            {todayPlan?.exercises.map((planEx) => {
              if (log.exercises.some((le) => le.exercise_id === planEx.exercise_id)) return null;
              return (
                <TouchableOpacity
                  key={planEx.id}
                  style={styles.addExBtn}
                  onPress={() => addExerciseToLog(log.id, planEx.exercise_id, planEx.sets, planEx.reps)}
                >
                  <Text style={styles.addExText}>+ {planEx.exercise?.name ?? planEx.exercise_id}</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.completeBtn} onPress={handleComplete} activeOpacity={0.85}>
              <Text style={styles.completeBtnText}>Complete Workout  🎉</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Completed summary ── */}
        {log?.completed === 1 && (
          <LinearGradient colors={['#00E67618', '#00B0FF18']} style={styles.completedCard}>
            <Text style={styles.completedTitle}>Workout Complete  🎉</Text>
            <Text style={styles.completedSub}>
              {log.exercises.length} exercises · {log.duration_minutes} min
              {streak > 1 ? `  ·  🔥 ${streak}-day streak` : ''}
            </Text>
          </LinearGradient>
        )}

        {/* ── Lazy Day ── */}
        {!log && (
          <TouchableOpacity style={styles.lazyCard} onPress={() => setShowLazyDay(true)} activeOpacity={0.8}>
            <Text style={styles.lazyEmoji}>😴</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.lazyTitle}>Feeling Lazy?</Text>
              <Text style={styles.lazySub}>20 min · no equipment · keeps streak alive</Text>
            </View>
            <Text style={[styles.whatBtnArrow, { color: Colors.textTertiary }]}>›</Text>
          </TouchableOpacity>
        )}

        {/* ── Recovery ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Muscle Recovery</Text>
          <Text style={styles.cardSub}>Green = ready to train</Text>
          <RecoveryVisualizer statuses={muscleStatuses} />
        </View>

        <View style={{ height: showRestTimer ? 160 : 32 }} />
      </ScrollView>

      {/* Floating Rest Timer */}
      {showRestTimer && <RestTimer onDismiss={() => setShowRestTimer(false)} defaultSeconds={90} />}

      {/* What Today Modal */}
      <Modal visible={showSuggestion} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Today's Recommendation</Text>
            <TouchableOpacity onPress={() => setShowSuggestion(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          {suggestion && (
            <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
              <View style={styles.reasonBox}>
                <Text style={styles.reasonText}>{suggestion.reason}</Text>
              </View>
              <Text style={styles.sectionLabel}>Suggested Exercises</Text>
              {suggestion.exercises.map((ex) => (
                <ExerciseCard
                  key={ex.id} exercise={ex}
                  showAddButton={!!log && !log.completed}
                  onAdd={() => handleAddSuggested(ex)}
                />
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Lazy Day Modal */}
      <Modal visible={showLazyDay} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lazy Day Mode 😴</Text>
            <TouchableOpacity onPress={() => setShowLazyDay(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: Spacing.md, gap: Spacing.md }}>
            <View style={styles.reasonBox}>
              <Text style={styles.reasonText}>3 exercises · ~20 minutes · No equipment needed{'\n'}Your streak stays alive! 🔥</Text>
            </View>
            {LAZY_DAY_EXERCISES.map((ex) => <ExerciseCard key={ex.id} exercise={ex} />)}
            <TouchableOpacity style={styles.startBtn} onPress={() => {
              setShowLazyDay(false);
              startTimeRef.current = Date.now();
              setElapsedSeconds(0);
              startWorkout('lazy_day');
              setTimeout(() => refresh(), 200);
            }}>
              <Text style={styles.startBtnText}>▶  Start Lazy Day Session</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.md, paddingBottom: 40 },

  // Hero
  hero: { paddingTop: Spacing.lg, marginBottom: Spacing.md },
  heroGradientBar: { height: 3, borderRadius: 2, marginBottom: Spacing.md, width: 60 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroRight: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center' },
  greeting: { fontSize: FontSize.xxxl, fontWeight: FontWeight.heavy, color: Colors.textPrimary, letterSpacing: -0.5 },
  date: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FF6D0018',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radius.full, gap: 3,
    borderWidth: 1, borderColor: '#FF6D0030',
  },
  streakFire: { fontSize: 14 },
  streakNum: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#FF6D00' },
  doneBadge: {
    backgroundColor: Colors.gymLight,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radius.full,
  },
  doneBadgeText: { color: Colors.accent, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },

  // Stat row
  statRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.md,
    alignItems: 'center', gap: 2,
    borderWidth: 1, borderColor: Colors.border,
  },
  statCardValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.heavy },
  statCardLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },

  // What Today
  whatBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.lg, padding: Spacing.md,
    marginBottom: Spacing.md, gap: Spacing.sm,
  },
  whatBtnEmoji: { fontSize: 26 },
  whatBtnTitle: { color: Colors.black, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  whatBtnSub: { color: 'rgba(0,0,0,0.55)', fontSize: FontSize.xs, marginTop: 1 },
  whatBtnArrow: { color: Colors.black, fontSize: 26, fontWeight: FontWeight.bold },

  // Cards
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.md,
    marginBottom: Spacing.md, gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cardMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  cardSub: { fontSize: FontSize.sm, color: Colors.textTertiary },

  // Progress bar
  progressTrack: {
    height: 4, backgroundColor: Colors.surfaceAlt,
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: {
    height: 4, backgroundColor: Colors.accent, borderRadius: 2,
  },
  progressLabel: { fontSize: FontSize.xs, color: Colors.textTertiary },

  // Exercise block
  exBlock: {
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingTop: Spacing.sm, gap: 6,
  },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  exDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.textTertiary,
  },
  exDotDone: { backgroundColor: Colors.accent },
  exName: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  exNameDone: { color: Colors.textTertiary },
  exCheck: { color: Colors.accent, fontWeight: FontWeight.bold },

  addExBtn: {
    paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: Radius.sm, borderWidth: 1,
    borderColor: Colors.border, borderStyle: 'dashed',
    alignItems: 'center',
  },
  addExText: { color: Colors.textSecondary, fontSize: FontSize.sm },

  startBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    padding: Spacing.md, alignItems: 'center',
  },
  startBtnText: { color: Colors.black, fontWeight: FontWeight.bold, fontSize: FontSize.md },

  completeBtn: {
    backgroundColor: Colors.glass,
    borderWidth: 1, borderColor: Colors.accent,
    borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center',
    marginTop: 4,
  },
  completeBtnText: { color: Colors.accent, fontWeight: FontWeight.bold, fontSize: FontSize.md },

  completedCard: {
    borderRadius: Radius.lg, padding: Spacing.md,
    marginBottom: Spacing.md, gap: 4,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  completedTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.accent },
  completedSub: { color: Colors.textSecondary, fontSize: FontSize.sm },

  emptyCard: {
    alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.xl,
    marginBottom: Spacing.md, gap: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  emptySub: { fontSize: FontSize.sm, color: Colors.textTertiary, textAlign: 'center' },

  lazyCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  lazyEmoji: { fontSize: 28 },
  lazyTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  lazySub: { fontSize: FontSize.xs, color: Colors.textTertiary },

  // Modals
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  modalClose: { fontSize: FontSize.md, color: Colors.accent, fontWeight: FontWeight.semibold },
  reasonBox: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  reasonText: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22 },
  sectionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
});
