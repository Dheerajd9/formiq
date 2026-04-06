import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Share, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme';
import { useProgress } from '../../hooks/useProgress';
import HeatMapGrid from '../../components/HeatMapGrid';
import { MUSCLE_GROUPS } from '../../constants/exercises';

export default function ProgressScreen() {
  const {
    heatmap, streak, weeklyConsistency, monthlyConsistency,
    personalRecords, muscleFrequency, totalWorkouts, loading,
  } = useProgress();

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const message =
      `🏋️ My FormIQ Weekly Stats\n\n` +
      `🔥 Streak: ${streak} days\n` +
      `📅 This week: ${weeklyConsistency}% consistency\n` +
      `💪 Total workouts: ${totalWorkouts}\n\n` +
      `Tracked with FormIQ`;
    try {
      await Share.share({ message });
    } catch (e) {
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
          <Text style={styles.title}>Progress</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard value={streak.toString()} label="Day Streak" emoji="🔥" accent={streak > 0} />
          <StatCard value={`${weeklyConsistency}%`} label="This Week" emoji="📅" />
          <StatCard value={totalWorkouts.toString()} label="Workouts" emoji="💪" />
        </View>

        {/* Consistency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Consistency</Text>
          <View style={styles.consistencyRow}>
            <View style={styles.consistencyBar}>
              <View style={[styles.consistencyFill, { width: `${monthlyConsistency}%` }]} />
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
          <Text style={styles.sectionTitle}>Muscle Group Frequency</Text>
          {muscleFrequency
            .filter((mf) => mf.muscle_group !== 'cardio')
            .sort((a, b) => b.days_since - a.days_since)
            .map((mf) => {
              const mg = MUSCLE_GROUPS.find((m) => m.key === mf.muscle_group);
              const neglected = mf.days_since > 4;
              return (
                <View key={mf.muscle_group} style={styles.freqRow}>
                  <Text style={styles.freqEmoji}>{mg?.emoji}</Text>
                  <View style={styles.freqInfo}>
                    <Text style={styles.freqName}>{mg?.label}</Text>
                    {mf.last_trained ? (
                      <Text style={[styles.freqDays, neglected && styles.freqDaysAlert]}>
                        {mf.days_since === 0
                          ? 'Trained today'
                          : `${mf.days_since} day${mf.days_since !== 1 ? 's' : ''} ago`}
                        {neglected ? ' ⚠️' : ''}
                      </Text>
                    ) : (
                      <Text style={styles.freqUntrained}>Not trained yet</Text>
                    )}
                  </View>
                  <View style={styles.freqBarWrap}>
                    <View style={[styles.freqBar, {
                      width: mf.days_since >= 999 ? 0 : Math.min(100, (7 / Math.max(1, mf.days_since)) * 30),
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
              <Text style={styles.noPRText}>No PRs yet — complete some workouts!</Text>
            </View>
          ) : (
            personalRecords.map((pr) => (
              <View key={pr.exercise_id} style={styles.prRow}>
                <View>
                  <Text style={styles.prName}>{pr.exercise_name}</Text>
                  <Text style={styles.prDate}>{pr.achieved_at}</Text>
                </View>
                <View style={styles.prValues}>
                  <Text style={styles.prWeight}>{pr.weight_kg}kg</Text>
                  <Text style={styles.prReps}>× {pr.reps}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ value, label, emoji, accent }: { value: string; label: string; emoji: string; accent?: boolean }) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.md, paddingBottom: 32 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: Colors.textSecondary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  shareBtn: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  shareBtnText: { color: Colors.white, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCardAccent: { backgroundColor: Colors.textPrimary, borderColor: Colors.textPrimary },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statValueAccent: { color: Colors.white },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  statLabelAccent: { color: 'rgba(255,255,255,0.7)' },
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
  consistencyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  consistencyBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  consistencyFill: { height: '100%', backgroundColor: Colors.gym, borderRadius: 4 },
  consistencyPct: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, width: 44, textAlign: 'right' },
  consistencySub: { fontSize: FontSize.xs, color: Colors.textTertiary },
  freqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  freqEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
  freqInfo: { flex: 1 },
  freqName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  freqDays: { fontSize: FontSize.xs, color: Colors.textSecondary },
  freqDaysAlert: { color: Colors.recovering },
  freqUntrained: { fontSize: FontSize.xs, color: Colors.textTertiary },
  freqBarWrap: { width: 60, height: 4, backgroundColor: Colors.surface, borderRadius: 2, overflow: 'hidden' },
  freqBar: { height: '100%', borderRadius: 2 },
  noPR: { paddingVertical: Spacing.md, alignItems: 'center' },
  noPRText: { color: Colors.textTertiary, fontSize: FontSize.sm },
  prRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  prName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  prDate: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  prValues: { alignItems: 'flex-end' },
  prWeight: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  prReps: { fontSize: FontSize.xs, color: Colors.textSecondary },
});
