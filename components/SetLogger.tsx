import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { LogSet, PrevSet } from '../hooks/useWorkoutLog';

interface Props {
  sets: LogSet[];
  prevSets?: PrevSet[];
  personalRecord?: { weight_kg: number; reps: number } | null;
  onToggleSet: (setId: number, reps: number, weightKg: number) => void;
  onUpdateSet: (setId: number, reps: number, weightKg: number) => void;
  onSetCompleted?: () => void;
}

export default function SetLogger({
  sets, prevSets = [], personalRecord,
  onToggleSet, onUpdateSet, onSetCompleted,
}: Props) {
  const [localReps, setLocalReps] = useState<Record<number, string>>({});
  const [localWeight, setLocalWeight] = useState<Record<number, string>>({});
  const [prFlash, setPrFlash] = useState<number | null>(null);

  const hasPrevData = prevSets.length > 0;
  const maxPrevWeight = prevSets.reduce((m, s) => Math.max(m, s.weight_kg), 0);

  return (
    <View style={styles.container}>
      {/* Last session reference row */}
      {hasPrevData && (
        <View style={styles.prevRow}>
          <Text style={styles.prevLabel}>Last session: </Text>
          {prevSets.slice(0, 4).map((ps, i) => (
            <Text key={i} style={styles.prevValue}>
              {ps.weight_kg > 0 ? `${ps.weight_kg}kg×${ps.reps}` : `${ps.reps} reps`}
              {i < Math.min(prevSets.length, 4) - 1 ? '  ' : ''}
            </Text>
          ))}
          {prevSets.length > 4 && <Text style={styles.prevLabel}>…</Text>}
        </View>
      )}

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.colLabel, { width: 32 }]}>Set</Text>
        <Text style={[styles.colLabel, { flex: 1 }]}>Reps</Text>
        <Text style={[styles.colLabel, { flex: 1 }]}>kg</Text>
        <Text style={[styles.colLabel, { width: 40 }]}>Done</Text>
      </View>

      {sets.map((set) => {
        const repsVal = localReps[set.id] ?? set.reps.toString();
        const weightVal = localWeight[set.id] ?? set.weight_kg.toString();
        const isPR = prFlash === set.id;
        const currentWeight = parseFloat(weightVal) || 0;
        const isNewPR = personalRecord && currentWeight > personalRecord.weight_kg && currentWeight > maxPrevWeight;

        return (
          <View key={set.id}>
            <View style={[
              styles.row,
              set.completed === 1 && styles.rowDone,
              isPR && styles.rowPR,
            ]}>
              <Text style={[styles.setNum, { width: 32 }]}>{set.set_number}</Text>

              <TextInput
                style={[styles.input, { flex: 1 }, set.completed === 1 && styles.inputDone]}
                keyboardType="numeric"
                value={repsVal}
                onChangeText={(t) => setLocalReps((prev) => ({ ...prev, [set.id]: t }))}
                onBlur={() => {
                  const r = parseInt(repsVal) || 0;
                  const w = parseFloat(weightVal) || 0;
                  onUpdateSet(set.id, r, w);
                }}
                editable={set.completed !== 1}
                selectTextOnFocus
              />

              <TextInput
                style={[styles.input, { flex: 1 }, set.completed === 1 && styles.inputDone]}
                keyboardType="decimal-pad"
                value={weightVal}
                onChangeText={(t) => setLocalWeight((prev) => ({ ...prev, [set.id]: t }))}
                onBlur={() => {
                  const r = parseInt(repsVal) || 0;
                  const w = parseFloat(weightVal) || 0;
                  onUpdateSet(set.id, r, w);
                }}
                editable={set.completed !== 1}
                selectTextOnFocus
              />

              <TouchableOpacity
                style={[styles.checkBtn, { width: 40 }, set.completed === 1 && styles.checkBtnDone]}
                onPress={() => {
                  const r = parseInt(repsVal) || set.reps;
                  const w = parseFloat(weightVal) || set.weight_kg;
                  const wasCompleted = set.completed === 1;
                  onToggleSet(set.id, r, w);
                  if (!wasCompleted) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    if (isNewPR) {
                      setPrFlash(set.id);
                      setTimeout(() => setPrFlash(null), 2000);
                    }
                    onSetCompleted?.();
                  }
                }}
              >
                <Text style={[styles.checkText, set.completed === 1 && styles.checkTextDone]}>
                  {set.completed === 1 ? '✓' : '○'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* PR flash banner */}
            {isPR && (
              <View style={styles.prBanner}>
                <Text style={styles.prText}>🏆 New Personal Record!</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  prevRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  prevLabel: { fontSize: FontSize.xs, color: Colors.textTertiary },
  prevValue: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  colLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 4,
  },
  rowDone: { backgroundColor: Colors.gymDark },
  rowPR: { backgroundColor: '#2D2A00' },
  setNum: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputDone: { backgroundColor: Colors.gymDark, borderColor: 'transparent' },
  checkBtn: {
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDone: { backgroundColor: Colors.accent },
  checkText: { fontSize: FontSize.md, color: Colors.textTertiary },
  checkTextDone: { color: Colors.black, fontWeight: FontWeight.bold },
  prBanner: {
    backgroundColor: '#2D2A00',
    borderRadius: 6,
    paddingVertical: 4,
    alignItems: 'center',
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#F0C030',
  },
  prText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#F0C030' },
});
