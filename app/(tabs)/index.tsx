import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, Alert,
} from 'react-native';
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

  const todayStr = today();
  const todayDate = new Date();
  const dayName = DAY_NAMES[todayDate.getDay() === 0 ? 6 : todayDate.getDay() - 1];

  // Live workout timer
  useEffect(() => {
    if (!log || log.completed === 1) return;
    const t = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [log?.id, log?.completed]);

  // Streak on mount
  useEffect(() => {
    setStreak(getStreak());
  }, [log?.completed]);

  const elapsed = (() => {
    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  })();

  const handleStartWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    startWorkout(todayPlan?.workout_type ?? 'gym');
  };

  const handleWhatToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const s = suggest();
    setSuggestion(s);
    setShowSuggestion(true);
  };

  const handleAddSuggested = (ex: Exercise) => {
    if (!log) return;
    addExerciseToLog(log.id, ex.id, ex.sets_default, ex.reps_default);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLazyDay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowLazyDay(true);
  };

  const handleStartLazy = () => {
    setShowLazyDay(false);
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    startWorkout('lazy_day');
    setTimeout(() => refresh(), 200);
  };

  const handleComplete = () => {
    if (!log) return;
    const mins = Math.max(1, Math.round(elapsedSeconds / 60));
    completeWorkout(log.id, mins);
    setStreak(getStreak());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      '🎉 Workout Complete!',
      `${log.exercises.length} exercises · ${mins} min${streak > 0 ? `\n🔥 ${streak + 1}-day streak!` : ''}`
    );
  };

  const completedCount = log?.exercises.filter((e) => e.completed === 1).length ?? 0;
  const totalExercises = log?.exercises.length ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            <Text style={styles.date}>{dayName}, {todayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={styles.headerRight}>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={styles.streakNum}>{streak}</Text>
              </View>
            )}
            {log?.completed === 1 && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Done ✓</Text>
              </View>
            )}
          </View>
        </View>

        {/* What Today? button */}
        <TouchableOpacity style={styles.whatTodayBtn} onPress={handleWhatToday}>
          <Text style={styles.whatTodayEmoji}>🧠</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.whatTodayTitle}>What should I do today?</Text>
            <Text style={styles.whatTodaySubtitle}>Smart suggestion based on recovery</Text>
          </View>
          <Text style={styles.whatTodayArrow}>›</Text>
        </TouchableOpacity>

        {/* Today's Plan */}
        {todayPlan ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Plan</Text>
            <Text style={styles.planName}>{activePlan?.name} · {todayPlan.exercises.length} exercises</Text>
            {!log && (
              <TouchableOpacity style={styles.startBtn} onPress={handleStartWorkout}>
                <Text style={styles.startBtnText}>▶  Start Workout</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.noplan}>
            <Text style={styles.noplanEmoji}>📅</Text>
            <Text style={styles.noplanText}>No workout planned today</Text>
            <Text style={styles.noplanSub}>Go to Plan tab to set up your week</Text>
          </View>
        )}

        {/* Active workout session */}
        {log && log.completed !== 1 && (
          <View style={styles.section}>
            <View style={styles.sessionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Active Session</Text>
                <Text style={styles.sessionMeta}>{completedCount}/{totalExercises} done · ⏱ {elapsed}</Text>
              </View>
            </View>

            {log.exercises.map((logEx) => (
              <View key={logEx.id} style={styles.exerciseBlock}>
                <View style={[styles.exerciseRow, logEx.completed === 1 && styles.exerciseRowDone]}>
                  <Text style={styles.exerciseName}>{logEx.exercise?.name ?? logEx.exercise_id}</Text>
                  {logEx.completed === 1 && <Text style={styles.doneCheck}>✓</Text>}
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

            {/* Add from plan */}
            {todayPlan?.exercises.map((planEx) => {
              const alreadyAdded = log.exercises.some((le) => le.exercise_id === planEx.exercise_id);
              if (alreadyAdded) return null;
              return (
                <TouchableOpacity
                  key={planEx.id}
                  style={styles.addPlanExBtn}
                  onPress={() => addExerciseToLog(log.id, planEx.exercise_id, planEx.sets, planEx.reps)}
                >
                  <Text style={styles.addPlanExText}>+ Add {planEx.exercise?.name ?? planEx.exercise_id}</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
              <Text style={styles.completeBtnText}>Complete Workout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Completed workout summary */}
        {log?.completed === 1 && (
          <View style={[styles.section, styles.completedSection]}>
            <Text style={styles.completedTitle}>Workout Complete! 🎉</Text>
            <Text style={styles.completedSub}>
              {log.exercises.length} exercises · {log.duration_minutes} min
              {streak > 1 ? `  ·  🔥 ${streak}-day streak` : ''}
            </Text>
          </View>
        )}

        {/* Lazy Day Mode */}
        {!log && (
          <TouchableOpacity style={styles.lazyBtn} onPress={handleLazyDay}>
            <Text style={styles.lazyEmoji}>😴</Text>
            <View>
              <Text style={styles.lazyTitle}>Feeling Lazy?</Text>
              <Text style={styles.lazySub}>20-min session · keeps your streak alive</Text>
            </View>
            <Text style={styles.whatTodayArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Recovery Visualizer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Muscle Recovery</Text>
          <RecoveryVisualizer statuses={muscleStatuses} />
        </View>

        <View style={{ height: showRestTimer ? 140 : 32 }} />
      </ScrollView>

      {/* Floating Rest Timer */}
      {showRestTimer && (
        <RestTimer onDismiss={() => setShowRestTimer(false)} defaultSeconds={90} />
      )}

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
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.md }}>
              <View style={styles.reasonBox}>
                <Text style={styles.reasonText}>{suggestion.reason}</Text>
              </View>
              <Text style={styles.suggestLabel}>Suggested Exercises</Text>
              {suggestion.exercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
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
            <Text style={styles.lazyDesc}>
              3 exercises · ~20 minutes · No equipment needed{'\n'}Your streak stays alive!
            </Text>
            {LAZY_DAY_EXERCISES.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
            <TouchableOpacity style={styles.startBtn} onPress={handleStartLazy}>
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
  scroll: { flex: 1, paddingHorizontal: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  date: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 3,
  },
  streakFire: { fontSize: 16 },
  streakNum: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#E65100' },
  completedBadge: {
    backgroundColor: Colors.gymLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  completedBadgeText: { color: Colors.gym, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  whatTodayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  whatTodayEmoji: { fontSize: 24 },
  whatTodayTitle: { color: Colors.white, fontWeight: FontWeight.semibold, fontSize: FontSize.md },
  whatTodaySubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.xs },
  whatTodayArrow: { color: Colors.white, fontSize: 24 },
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  planName: { fontSize: FontSize.sm, color: Colors.textSecondary },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sessionMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  exerciseBlock: { gap: 6 },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 4,
    paddingTop: 8,
  },
  exerciseRowDone: { opacity: 0.6 },
  exerciseName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, flex: 1 },
  doneCheck: { color: Colors.gym, fontWeight: FontWeight.bold, fontSize: FontSize.lg },
  addPlanExBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addPlanExText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  startBtn: {
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  startBtnText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  completeBtn: {
    backgroundColor: Colors.gym,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: 4,
  },
  completeBtnText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  completedSection: { backgroundColor: Colors.gymLight, borderColor: Colors.gym },
  completedTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.gym },
  completedSub: { color: Colors.gym, fontSize: FontSize.sm },
  noplan: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    gap: 4,
  },
  noplanEmoji: { fontSize: 32 },
  noplanText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  noplanSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  lazyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lazyEmoji: { fontSize: 28 },
  lazyTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, flex: 1 },
  lazySub: { fontSize: FontSize.xs, color: Colors.textSecondary },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  modalClose: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  reasonBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  reasonText: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22 },
  suggestLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  lazyDesc: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
});
