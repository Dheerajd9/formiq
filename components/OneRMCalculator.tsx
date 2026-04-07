import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

// Epley formula: 1RM = weight × (1 + reps/30)
// Shows % of 1RM for common training ranges
const TRAINING_PERCENTAGES = [
  { pct: 100, label: '1 RM', reps: '1', zone: 'Max' },
  { pct: 95,  label: '95%',  reps: '2-3', zone: 'Strength' },
  { pct: 90,  label: '90%',  reps: '4-5', zone: 'Strength' },
  { pct: 85,  label: '85%',  reps: '5-6', zone: 'Strength' },
  { pct: 80,  label: '80%',  reps: '7-8', zone: 'Hypertrophy' },
  { pct: 75,  label: '75%',  reps: '9-10', zone: 'Hypertrophy' },
  { pct: 70,  label: '70%',  reps: '11-12', zone: 'Hypertrophy' },
  { pct: 65,  label: '65%',  reps: '14-16', zone: 'Endurance' },
  { pct: 60,  label: '60%',  reps: '17-20', zone: 'Endurance' },
];

const ZONE_COLORS: Record<string, string> = {
  Max: Colors.accent,
  Strength: '#2979FF',
  Hypertrophy: '#BD7AFF',
  Endurance: '#FF6D00',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultWeight?: number;
  defaultReps?: number;
}

export default function OneRMCalculator({ visible, onClose, defaultWeight, defaultReps }: Props) {
  const [weightStr, setWeightStr] = useState(defaultWeight ? defaultWeight.toString() : '');
  const [repsStr, setRepsStr] = useState(defaultReps ? defaultReps.toString() : '');
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');

  const weight = parseFloat(weightStr) || 0;
  const reps = parseInt(repsStr) || 0;
  const oneRM = weight > 0 && reps > 0 ? weight * (1 + reps / 30) : 0;
  const hasResult = oneRM > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>1RM Calculator</Text>
            <Text style={styles.subtitle}>Epley formula estimate</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Unit toggle */}
          <View style={styles.unitRow}>
            {(['kg', 'lb'] as const).map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (u === unit) return;
                  if (weightStr) {
                    const v = parseFloat(weightStr);
                    if (!isNaN(v)) setWeightStr(u === 'lb' ? (v * 2.20462).toFixed(1) : (v / 2.20462).toFixed(1));
                  }
                  setUnit(u);
                }}
              >
                <Text style={[styles.unitBtnText, unit === u && styles.unitBtnTextActive]}>{u.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Inputs */}
          <View style={styles.inputsRow}>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Weight ({unit})</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={Colors.textTertiary}
                value={weightStr}
                onChangeText={setWeightStr}
                selectTextOnFocus
              />
            </View>
            <View style={[styles.inputBox, { flex: 0.8 }]}>
              <Text style={styles.inputLabel}>Reps done</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={Colors.textTertiary}
                value={repsStr}
                onChangeText={setRepsStr}
                selectTextOnFocus
              />
            </View>
          </View>

          {/* 1RM Result */}
          {hasResult && (
            <>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Estimated 1RM</Text>
                <Text style={styles.resultValue}>{oneRM.toFixed(1)}</Text>
                <Text style={styles.resultUnit}>{unit}</Text>
              </View>

              {/* Training zones table */}
              <Text style={styles.tableTitle}>Training zones</Text>
              <View style={styles.table}>
                {TRAINING_PERCENTAGES.map((row) => {
                  const w = (oneRM * row.pct / 100);
                  const zoneColor = ZONE_COLORS[row.zone] ?? Colors.textSecondary;
                  return (
                    <View key={row.pct} style={[styles.tableRow, row.pct === 100 && styles.tableRowTop]}>
                      <View style={[styles.zoneDot, { backgroundColor: zoneColor }]} />
                      <Text style={styles.tableLabel}>{row.label}</Text>
                      <Text style={styles.tableReps}>{row.reps} reps</Text>
                      <Text style={[styles.tableWeight, row.pct === 100 && { color: Colors.accent }]}>
                        {w.toFixed(1)}{unit}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <Text style={styles.disclaimer}>
                Estimate only. Actual 1RM varies by exercise, fatigue, and form.
              </Text>
            </>
          )}

          {!hasResult && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🏋️</Text>
              <Text style={styles.emptyText}>Enter the weight you lifted and how many reps you did — we'll calculate your estimated max.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  closeText: { fontSize: FontSize.md, color: Colors.accent, fontWeight: FontWeight.semibold },
  scroll: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 60 },

  unitRow: {
    flexDirection: 'row', backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md, padding: 3, gap: 3,
  },
  unitBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: Radius.sm },
  unitBtnActive: { backgroundColor: Colors.btnPrimary },
  unitBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textTertiary },
  unitBtnTextActive: { color: Colors.btnPrimaryText },

  inputsRow: { flexDirection: 'row', gap: Spacing.sm },
  inputBox: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: 4,
  },
  inputLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    fontSize: FontSize.xxxl, fontWeight: FontWeight.heavy,
    color: Colors.textPrimary, padding: 0,
  },

  resultCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.lg, alignItems: 'center', gap: 2,
    borderWidth: 1, borderColor: Colors.accent + '40',
  },
  resultLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  resultValue: { fontSize: FontSize.hero, fontWeight: FontWeight.heavy, color: Colors.accent },
  resultUnit: { fontSize: FontSize.lg, color: Colors.textSecondary },

  tableTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  table: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  tableRowTop: { backgroundColor: Colors.surfaceAlt },
  zoneDot: { width: 8, height: 8, borderRadius: 4 },
  tableLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, width: 36 },
  tableReps: { flex: 1, fontSize: FontSize.xs, color: Colors.textTertiary },
  tableWeight: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },

  disclaimer: { fontSize: FontSize.xs, color: Colors.textTertiary, textAlign: 'center', lineHeight: 18 },
  emptyState: { alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.xl },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: FontSize.md, color: Colors.textTertiary, textAlign: 'center', lineHeight: 22 },
});
