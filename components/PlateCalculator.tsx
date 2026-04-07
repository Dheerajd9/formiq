import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

// Standard plate weights in kg
const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATES_LB = [45, 35, 25, 10, 5, 2.5];
const BAR_KG = 20;   // Olympic barbell
const BAR_LB = 45;

type Unit = 'kg' | 'lb';

function calcPlates(targetWeight: number, unit: Unit): { plate: number; count: number }[] {
  const bar = unit === 'kg' ? BAR_KG : BAR_LB;
  const plates = unit === 'kg' ? PLATES_KG : PLATES_LB;
  let remaining = (targetWeight - bar) / 2; // weight per side
  const result: { plate: number; count: number }[] = [];
  for (const p of plates) {
    if (remaining <= 0) break;
    const count = Math.floor(remaining / p);
    if (count > 0) {
      result.push({ plate: p, count });
      remaining -= count * p;
    }
  }
  return result;
}

// Plate colors matching gym conventions
const PLATE_COLORS: Record<number, string> = {
  25: '#E53935',  45: '#E53935',  // red
  20: '#1E88E5',  35: '#1E88E5',  // blue
  15: '#FFB300',                  // yellow
  10: '#43A047',                  // green
  5: '#FFFFFF',                   // white
  2.5: '#212121', 2: '#212121',   // black
  1.25: '#9E9E9E',                // grey
};

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultWeight?: number;
}

export default function PlateCalculator({ visible, onClose, defaultWeight }: Props) {
  const [weightStr, setWeightStr] = useState(defaultWeight ? defaultWeight.toString() : '');
  const [unit, setUnit] = useState<Unit>('kg');

  const weight = parseFloat(weightStr) || 0;
  const bar = unit === 'kg' ? BAR_KG : BAR_LB;
  const valid = weight > bar;
  const plates = valid ? calcPlates(weight, unit) : [];

  const handleUnitToggle = useCallback((u: Unit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (u === unit) return;
    // Convert value
    if (weightStr) {
      const v = parseFloat(weightStr);
      if (!isNaN(v)) {
        setWeightStr(u === 'lb' ? (v * 2.20462).toFixed(1) : (v / 2.20462).toFixed(1));
      }
    }
    setUnit(u);
  }, [unit, weightStr]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Plate Calculator</Text>
            <Text style={styles.subtitle}>Olympic bar · per side</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Unit toggle */}
        <View style={styles.unitRow}>
          {(['kg', 'lb'] as Unit[]).map((u) => (
            <TouchableOpacity
              key={u}
              style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
              onPress={() => handleUnitToggle(u)}
            >
              <Text style={[styles.unitBtnText, unit === u && styles.unitBtnTextActive]}>
                {u.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weight input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder={`Target weight (${unit})`}
            placeholderTextColor={Colors.textTertiary}
            value={weightStr}
            onChangeText={setWeightStr}
            autoFocus
            selectTextOnFocus
          />
          <Text style={styles.inputUnit}>{unit}</Text>
        </View>

        {/* Bar info */}
        <Text style={styles.barNote}>Bar: {bar}{unit} · Each side: {valid ? ((weight - bar) / 2).toFixed(2) : '—'}{unit}</Text>

        {/* Plate visual */}
        {valid && plates.length > 0 ? (
          <ScrollView contentContainerStyle={styles.resultContainer}>
            {/* Visual bar */}
            <View style={styles.barVisual}>
              <View style={styles.barEnd} />
              <View style={styles.barShaft}>
                {[...plates].reverse().map((item, i) => (
                  <View key={i} style={styles.plateGroup}>
                    {Array.from({ length: item.count }).map((_, j) => {
                      const color = PLATE_COLORS[item.plate] ?? '#9E9E9E';
                      const h = Math.min(80, 24 + item.plate * 1.5);
                      return (
                        <View key={j} style={[styles.plateVisual, {
                          backgroundColor: color,
                          height: h,
                          borderColor: color === '#FFFFFF' ? Colors.border : 'transparent',
                          borderWidth: color === '#FFFFFF' ? 1 : 0,
                        }]}>
                          <Text style={[styles.plateVisualText, { color: color === '#FFFFFF' ? Colors.black : Colors.white }]}>
                            {item.plate}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
              <View style={styles.barEnd} />
            </View>

            {/* Plate list */}
            <View style={styles.plateList}>
              {plates.map((item) => {
                const color = PLATE_COLORS[item.plate] ?? '#9E9E9E';
                return (
                  <View key={item.plate} style={styles.plateRow}>
                    <View style={[styles.plateDot, { backgroundColor: color, borderWidth: color === '#FFFFFF' ? 1 : 0, borderColor: Colors.border }]} />
                    <Text style={styles.plateLabel}>{item.plate} {unit}</Text>
                    <Text style={styles.plateTimes}>×</Text>
                    <Text style={styles.plateCount}>{item.count * 2} total ({item.count} per side)</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            {weight > 0 && weight <= bar ? (
              <Text style={styles.emptyText}>Weight must be more than bar ({bar}{unit})</Text>
            ) : (
              <Text style={styles.emptyText}>Enter a target weight above</Text>
            )}
          </View>
        )}
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
  closeBtn: { paddingVertical: 4 },
  closeText: { fontSize: FontSize.md, color: Colors.accent, fontWeight: FontWeight.semibold },

  unitRow: {
    flexDirection: 'row', margin: Spacing.md,
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md,
    padding: 3, gap: 3,
  },
  unitBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: Radius.sm },
  unitBtnActive: { backgroundColor: Colors.btnPrimary },
  unitBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textTertiary },
  unitBtnTextActive: { color: Colors.btnPrimaryText },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.md, marginBottom: Spacing.xs,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.glassBorder,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1, fontSize: FontSize.xxxl, fontWeight: FontWeight.heavy,
    color: Colors.textPrimary, paddingVertical: Spacing.md,
  },
  inputUnit: { fontSize: FontSize.lg, color: Colors.textTertiary, fontWeight: FontWeight.medium },
  barNote: {
    fontSize: FontSize.xs, color: Colors.textTertiary,
    marginHorizontal: Spacing.md, marginBottom: Spacing.md,
  },

  resultContainer: { paddingHorizontal: Spacing.md, paddingBottom: 40 },

  // Visual bar
  barVisual: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: Spacing.lg, justifyContent: 'center',
  },
  barEnd: { width: 16, height: 20, backgroundColor: Colors.textTertiary, borderRadius: 3 },
  barShaft: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceAlt, height: 12,
    flex: 1, marginHorizontal: 2, borderRadius: 2,
    overflow: 'visible',
  },
  plateGroup: { flexDirection: 'row', alignItems: 'center' },
  plateVisual: {
    width: 18, borderRadius: 3, marginHorizontal: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  plateVisualText: { fontSize: 7, fontWeight: FontWeight.bold, transform: [{ rotate: '90deg' }] },

  // Plate list
  plateList: { gap: Spacing.sm, marginTop: Spacing.sm },
  plateRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, padding: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
  },
  plateDot: { width: 18, height: 18, borderRadius: 9 },
  plateLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, width: 52 },
  plateTimes: { fontSize: FontSize.sm, color: Colors.textTertiary },
  plateCount: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: FontSize.md, color: Colors.textTertiary, textAlign: 'center' },
});
