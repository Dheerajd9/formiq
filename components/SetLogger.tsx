import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { LogSet } from '../hooks/useWorkoutLog';

interface Props {
  sets: LogSet[];
  onToggleSet: (setId: number, reps: number, weightKg: number) => void;
  onUpdateSet: (setId: number, reps: number, weightKg: number) => void;
}

export default function SetLogger({ sets, onToggleSet, onUpdateSet }: Props) {
  const [localReps, setLocalReps] = useState<Record<number, string>>({});
  const [localWeight, setLocalWeight] = useState<Record<number, string>>({});

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.colLabel, { width: 32 }]}>Set</Text>
        <Text style={[styles.colLabel, { flex: 1 }]}>Reps</Text>
        <Text style={[styles.colLabel, { flex: 1 }]}>Weight (kg)</Text>
        <Text style={[styles.colLabel, { width: 36 }]}>Done</Text>
      </View>

      {sets.map((set) => {
        const repsVal = localReps[set.id] ?? set.reps.toString();
        const weightVal = localWeight[set.id] ?? set.weight_kg.toString();

        return (
          <View key={set.id} style={[styles.row, set.completed === 1 && styles.rowDone]}>
            <Text style={[styles.setNum, { width: 32 }]}>{set.set_number}</Text>

            <TextInput
              style={[styles.input, { flex: 1 }]}
              keyboardType="numeric"
              value={repsVal}
              onChangeText={(t) => setLocalReps((prev) => ({ ...prev, [set.id]: t }))}
              onBlur={() => {
                const r = parseInt(repsVal) || 0;
                const w = parseFloat(weightVal) || 0;
                onUpdateSet(set.id, r, w);
              }}
              editable={set.completed !== 1}
            />

            <TextInput
              style={[styles.input, { flex: 1 }]}
              keyboardType="decimal-pad"
              value={weightVal}
              onChangeText={(t) => setLocalWeight((prev) => ({ ...prev, [set.id]: t }))}
              onBlur={() => {
                const r = parseInt(repsVal) || 0;
                const w = parseFloat(weightVal) || 0;
                onUpdateSet(set.id, r, w);
              }}
              editable={set.completed !== 1}
            />

            <TouchableOpacity
              style={[styles.checkBtn, { width: 36 }, set.completed === 1 && styles.checkBtnDone]}
              onPress={() => {
                const r = parseInt(repsVal) || set.reps;
                const w = parseFloat(weightVal) || set.weight_kg;
                onToggleSet(set.id, r, w);
              }}
            >
              <Text style={[styles.checkText, set.completed === 1 && styles.checkTextDone]}>
                {set.completed === 1 ? '✓' : '○'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 4,
  },
  rowDone: {
    backgroundColor: Colors.gymLight,
  },
  setNum: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkBtn: {
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDone: {
    backgroundColor: Colors.gym,
  },
  checkText: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
  },
  checkTextDone: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
});
