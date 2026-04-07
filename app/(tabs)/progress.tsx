import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Share, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme';
import { useProgress } from '../../hooks/useProgress';
import HeatMapGrid from '../../components/HeatMapGrid';
import PlateCalculator from '../../components/PlateCalculator';
import OneRMCalculator from '../../components/OneRMCalculator';
import { MUSCLE_GROUPS } from '../../constants/exercises';

export default function ProgressScreen() {
  const {
    heatmap, streak, weeklyConsistency, monthlyConsistency,
    personalRecords, muscleFrequency, totalWorkouts, loading,
  } = useProgress();

  const [showPlates, setShowPlates] = useState(false);
  const [showOneRM, setShowOneRM] = useState(false);
  const [plateDefault, setPlateDefault] = useState<number | undefined>();
  const [oneRMDefault, setOneRMDefault] = useState<{ weight?: number; reps?: number }>({});

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const topPR = personalRecords[0];
    const msg =
      `💪 FormIQ Weekly Stats\n\n` +
      `🔥 Streak: ${streak} day${streak !== 1 ? 's' : ''}\n` +
      `📅 This week: ${weeklyConsistency}% consistency\n` +
      `🏋️ Total workouts: ${totalWorkouts}\n` +
      (topPR ? `🏆 Top PR: ${topPR.exercise_name} — ${topPR.weight_kg}kg × ${topPR.reps}\n` : '') +
      `\nTracked with FormIQ — formiq-navy.vercel.app`;
    try {
      await Share.share({ message: msg });
    } catch {
      Alert.alert('Error', 'Could not share');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <LinearGradient colors={['#00E676', '#00B0FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.headerBar} />
            <Text style={styles.title}>Progress</Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>⬆ Share</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard value={streak > 0 ? `${streak}` : '0'} label="Day Streak" emoji="🔥" accent={streak > 0} />
          <StatCard value={`${weeklyConsistency}%`} label="This Week" emoji="📅" />
          <StatCard value={totalWorkouts.toString()} label="Workouts" emoji="💪" />
        </View>

        {/* ── Tools Row ── */}
        <Text style={styles.toolsLabel}>Gym Tools</Text>
        <View style={styles.toolsRow}>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowPlates(true); }}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#E53935', '#FF7043']} style={styles.toolIcon}>
              <Text style={styles.toolEmoji}>🏋️</Text>
            </LinearGradient>
            <Text style={styles.toolName}>Plate Calculator</Text>
            <Text style={styles.toolSub}>Which plates to load</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowOneRM(true); }}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#7B1FA2', '#2979FF']} style={styles.toolIcon}>
              <Text style={styles.toolEmoji}>⚡</Text>
            </LinearGradient>
            <Text style={styles.toolName}>1RM Calculator</Text>
            <Text style={styles.toolSub}>Estimate your max lift</Text>
          </TouchableOpacity>
        </View>

        {/* Open plate calc from top PR */}
        {personalRecords.length > 0 && (
          <TouchableOpacity
            style={styles.quickCalcRow}
            onPress={() => {
              setPlateDefault(personalRecords[0].weight_kg);
              setShowPlates(true);
            }}
          >
            <Text style={styles.quickCalcText}>
              🏆 Load plates for your PR: {personalRecords[0].weight_kg}kg {personalRecords[0].exercise_name}
            </Text>
            <Text style={styles.quickCalcArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Consistency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Consistency</Text>
          <View style={styles.consistencyRow}>
            <View style={styles.consistencyTrack}>
              <View style={[styles.consistencyFill, { width: `${monthlyConsistency}%` as `${number}%` }]} />
            </View>
            <Text style={styles.consistencyPct}>{monthlyConsistency}%</Text>
          </View>
          <Text style={styles.consistencySub}>Last 30 days</Text>
        </View>

        {/* Heat Map */}
        {heatmap.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity (12 Weeks)</Text>
            <HeatMapGrid days={heatmap} />
          </View>
        )}

        {/* Muscle Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Muscle Frequency</Text>
          {muscleFrequency
            .filter((mf) => mf.muscle_group !== 'cardio')
            .sort((a, b) => b.days_since - a.days_since)
            .map((mf) => {
              const mg = MUSCLE_GROUPS.find((m) => m.key === mf.muscle_group);
              const neglected = mf.days_since > 4;
              const barWidth = mf.days_since >= 999 ? 0 : Math.min(100, (7 / Math.max(1, mf.days_since)) * 30);
              return (
                <View key={mf.muscle_group} style={styles.freqRow}>
                  <Text style={styles.freqEmoji}>{mg?.emoji}</Text>
                  <View style={styles.freqInfo}>
                    <Text style={styles.freqName}>{mg?.label}</Text>
                    {mf.last_trained ? (
                      <Text style={[styles.freqDays, neglected && styles.freqDaysAlert]}>
                        {mf.days_since === 0 ? 'Trained today' : `${mf.days_since}d ago`}
                        {neglected ? ' ⚠️' : ''}
                      </Text>
                    ) : (
                      <Text style={styles.freqUntrained}>Not trained yet</Text>
                    )}
                  </View>
                  <View style={styles.freqBarWrap}>
                    <View style={[styles.freqBar, {
                      width: `${barWidth}%` as `${number}%`,
                      backgroundColor: neglected ? Colors.recovering : Colors.gym,
                    }]} />
                  </View>
                </View>
              );
            })}
        </View>

        {/* Personal Records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Records 🏆</Text>
          {personalRecords.length === 0 ? (
            <View style={styles.noPR}>
              <Text style={styles.noPRText}>Complete workouts to set PRs!</Text>
            </View>
          ) : (
            personalRecords.map((pr, i) => (
              <TouchableOpacity
                key={pr.exercise_id}
                style={[styles.prRow, i === personalRecords.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => {
                  setOneRMDefault({ weight: pr.weight_kg, reps: pr.reps });
                  setShowOneRM(true);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.prName}>{pr.exercise_name}</Text>
                  <Text style={styles.prDate}>{pr.achieved_at}</Text>
                </View>
                <View style={styles.prValues}>
                  <Text style={styles.prWeight}>{pr.weight_kg}kg</Text>
                  <Text style={styles.prReps}>× {pr.reps}</Text>
                </View>
                <Text style={styles.prArrow}>›</Text>
              </TouchableOpacity>
            ))
          )}
          {personalRecords.length > 0 && (
            <Text style={styles.prHint}>Tap a PR to calculate 1RM</Text>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Calculators */}
      <PlateCalculator
        visible={showPlates}
        onClose={() => { setShowPlates(false); setPlateDefault(undefined); }}
        defaultWeight={plateDefault}
      />
      <OneRMCalculator
        visible={showOneRM}
        onClose={() => { setShowOneRM(false); setOneRMDefault({}); }}
        defaultWeight={oneRMDefault.weight}
        defaultReps={oneRMDefault.reps}
      />
    </SafeAreaView>
  );
}

function StatCard({ value, label, emoji, accent }: { value: string; label: string; emoji: string; accent?: boolean }) {
  if (accent) {
    return (
      <LinearGradient colors={['#00E676', '#1DE9B6']} style={[styles.statCard, { borderWidth: 0 }]}>
        <Text style={styles.statEmoji}>{emoji}</Text>
        <Text style={[styles.statValue, { color: Colors.black }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: 'rgba(0,0,0,0.55)' }]}>{label}</Text>
      </LinearGradient>
    );
  }
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.md, paddingBottom: 32 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: Colors.textSecondary },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  headerBar: { height: 3, width: 48, borderRadius: 2, marginBottom: 6 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.heavy, color: Colors.textPrimary },
  shareBtn: {
    backgroundColor: Colors.surfaceAlt, paddingHorizontal: Spacing.md,
    paddingVertical: 8, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  shareBtnText: { color: Colors.textPrimary, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.md,
    alignItems: 'center', gap: 2,
    borderWidth: 1, borderColor: Colors.border,
  },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },

  // Tools
  toolsLabel: {
    fontSize: FontSize.md, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, marginBottom: Spacing.sm,
  },
  toolsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  toolCard: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.md,
    alignItems: 'flex-start', gap: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  toolIcon: {
    width: 44, height: 44, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  toolEmoji: { fontSize: 22 },
  toolName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  toolSub: { fontSize: FontSize.xs, color: Colors.textTertiary },

  quickCalcRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    gap: Spacing.sm,
  },
  quickCalcText: { flex: 1, fontSize: FontSize.sm, color: Colors.accent, fontWeight: FontWeight.medium },
  quickCalcArrow: { fontSize: 20, color: Colors.accent },

  section: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },

  consistencyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  consistencyTrack: {
    flex: 1, height: 8, backgroundColor: Colors.surfaceAlt,
    borderRadius: 4, overflow: 'hidden',
  },
  consistencyFill: { height: '100%', backgroundColor: Colors.gym, borderRadius: 4 },
  consistencyPct: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, width: 44, textAlign: 'right' },
  consistencySub: { fontSize: FontSize.xs, color: Colors.textTertiary },

  freqRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  freqEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
  freqInfo: { flex: 1 },
  freqName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  freqDays: { fontSize: FontSize.xs, color: Colors.textSecondary },
  freqDaysAlert: { color: Colors.recovering },
  freqUntrained: { fontSize: FontSize.xs, color: Colors.textTertiary },
  freqBarWrap: { width: 60, height: 4, backgroundColor: Colors.surfaceAlt, borderRadius: 2, overflow: 'hidden' },
  freqBar: { height: '100%', borderRadius: 2 },

  noPR: { paddingVertical: Spacing.md, alignItems: 'center' },
  noPRText: { color: Colors.textTertiary, fontSize: FontSize.sm },
  prRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  prName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  prDate: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  prValues: { alignItems: 'flex-end' },
  prWeight: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.accent },
  prReps: { fontSize: FontSize.xs, color: Colors.textSecondary },
  prArrow: { color: Colors.textTertiary, fontSize: FontSize.lg },
  prHint: { fontSize: FontSize.xs, color: Colors.textTertiary, textAlign: 'center', paddingTop: 4 },
});
