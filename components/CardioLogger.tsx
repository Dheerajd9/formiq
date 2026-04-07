import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Modal, ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { CARDIO_TYPES, CardioType } from '../hooks/useCardio';

type Unit = 'km' | 'mi';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (type: CardioType, distanceKm: number, durationMin: number, speed?: number, notes?: string) => void;
}

export default function CardioLogger({ visible, onClose, onSave }: Props) {
  const [type, setType] = useState<CardioType>('treadmill');
  const [distStr, setDistStr] = useState('');
  const [durStr, setDurStr] = useState('');
  const [speedStr, setSpeedStr] = useState('');
  const [notes, setNotes] = useState('');
  const [unit, setUnit] = useState<Unit>('km');

  const typeInfo = CARDIO_TYPES.find((t) => t.key === type) ?? CARDIO_TYPES[0];
  const dist = parseFloat(distStr) || 0;
  const dur = parseInt(durStr) || 0;
  const speed = parseFloat(speedStr) || 0;

  // Auto-compute speed from distance + duration
  const autoSpeed = dist > 0 && dur > 0 ? (dist / dur) * 60 : 0;
  const displaySpeed = speedStr ? speed : autoSpeed;

  // Estimated pace
  const paceMin = displaySpeed > 0 ? 60 / displaySpeed : 0;
  const paceMM = Math.floor(paceMin);
  const paceSS = Math.round((paceMin - paceMM) * 60);
  const paceStr = displaySpeed > 0 ? `${paceMM}:${paceSS.toString().padStart(2, '0')} min/${unit}` : '—';

  const distKm = unit === 'mi' ? dist * 1.60934 : dist;

  const canSave = dist > 0 && dur > 0;

  const handleSave = () => {
    if (!canSave) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave(type, distKm, dur, displaySpeed > 0 ? displaySpeed : undefined, notes || undefined);
    // Reset
    setDistStr('');
    setDurStr('');
    setSpeedStr('');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Log Cardio</Text>
            <Text style={styles.sub}>Track your run or cardio session</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Type selector */}
          <Text style={styles.label}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            <View style={styles.typeRow}>
              {CARDIO_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeChip, type === t.key && { borderColor: t.color, backgroundColor: t.color + '18' }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setType(t.key); }}
                >
                  <Text style={styles.typeEmoji}>{t.emoji}</Text>
                  <Text style={[styles.typeLabel, type === t.key && { color: t.color }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Unit toggle */}
          <View style={styles.unitRow}>
            {(['km', 'mi'] as Unit[]).map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setUnit(u); }}
              >
                <Text style={[styles.unitBtnText, unit === u && styles.unitBtnTextActive]}>{u.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input row */}
          <View style={styles.inputsRow}>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Distance</Text>
              <View style={styles.inputInner}>
                <TextInput
                  style={styles.inputVal}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor={Colors.textTertiary}
                  value={distStr}
                  onChangeText={setDistStr}
                  selectTextOnFocus
                />
                <Text style={styles.inputUnit}>{unit}</Text>
              </View>
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Duration</Text>
              <View style={styles.inputInner}>
                <TextInput
                  style={styles.inputVal}
                  keyboardType="number-pad"
                  placeholder="30"
                  placeholderTextColor={Colors.textTertiary}
                  value={durStr}
                  onChangeText={setDurStr}
                  selectTextOnFocus
                />
                <Text style={styles.inputUnit}>min</Text>
              </View>
            </View>
          </View>

          {/* Speed (optional) */}
          <View style={styles.speedRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Speed (optional — auto-calculated)</Text>
              <View style={[styles.inputInner, styles.speedInput]}>
                <TextInput
                  style={styles.inputVal}
                  keyboardType="decimal-pad"
                  placeholder={autoSpeed > 0 ? autoSpeed.toFixed(1) : '0.0'}
                  placeholderTextColor={Colors.textTertiary}
                  value={speedStr}
                  onChangeText={setSpeedStr}
                  selectTextOnFocus
                />
                <Text style={styles.inputUnit}>{unit}/h</Text>
              </View>
            </View>
          </View>

          {/* Live stats preview */}
          {(dist > 0 || dur > 0) && (
            <LinearGradient
              colors={[typeInfo.color + '22', typeInfo.color + '08']}
              style={styles.preview}
            >
              <View style={styles.previewStat}>
                <Text style={[styles.previewVal, { color: typeInfo.color }]}>
                  {unit === 'mi' ? (distKm * 0.621371).toFixed(2) : distKm.toFixed(2)}
                </Text>
                <Text style={styles.previewLabel}>{unit}</Text>
              </View>
              <View style={styles.previewDivider} />
              <View style={styles.previewStat}>
                <Text style={[styles.previewVal, { color: typeInfo.color }]}>{dur || '—'}</Text>
                <Text style={styles.previewLabel}>min</Text>
              </View>
              <View style={styles.previewDivider} />
              <View style={styles.previewStat}>
                <Text style={[styles.previewVal, { color: typeInfo.color }]}>
                  {displaySpeed > 0 ? displaySpeed.toFixed(1) : '—'}
                </Text>
                <Text style={styles.previewLabel}>{unit}/h</Text>
              </View>
              <View style={styles.previewDivider} />
              <View style={styles.previewStat}>
                <Text style={[styles.previewVal, { color: typeInfo.color }]}>{paceStr.split(' ')[0]}</Text>
                <Text style={styles.previewLabel}>pace</Text>
              </View>
            </LinearGradient>
          )}

          {/* Notes */}
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="e.g. Felt strong today, intervals 1min on/off..."
            placeholderTextColor={Colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={canSave ? [typeInfo.color, typeInfo.color + 'AA'] : [Colors.surfaceHigh, Colors.surfaceHigh]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.saveBtnGrad}
            >
              <Text style={[styles.saveBtnText, !canSave && { color: Colors.textTertiary }]}>
                {canSave ? `Save ${typeInfo.emoji} ${typeInfo.label}` : 'Enter distance & duration'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.heavy, color: Colors.textPrimary },
  sub: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  close: { fontSize: FontSize.lg, color: Colors.textTertiary, padding: 4 },
  scroll: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 60 },

  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: -Spacing.xs },

  // Type
  typeScroll: { marginHorizontal: -Spacing.md },
  typeRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  typeEmoji: { fontSize: 16 },
  typeLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },

  // Unit
  unitRow: {
    flexDirection: 'row', backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md, padding: 3, gap: 3,
  },
  unitBtn: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: Radius.sm },
  unitBtnActive: { backgroundColor: Colors.btnPrimary },
  unitBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textTertiary },
  unitBtnTextActive: { color: Colors.btnPrimaryText },

  // Inputs
  inputsRow: { flexDirection: 'row', gap: Spacing.sm },
  inputBox: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: 6,
  },
  inputLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.4 },
  inputInner: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  inputVal: {
    flex: 1, fontSize: FontSize.xxxl, fontWeight: FontWeight.heavy,
    color: Colors.textPrimary, padding: 0,
  },
  inputUnit: { fontSize: FontSize.sm, color: Colors.textTertiary, paddingBottom: 4 },

  speedRow: { flexDirection: 'row', gap: Spacing.sm },
  speedInput: {
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md,
    padding: Spacing.sm, paddingHorizontal: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },

  // Preview
  preview: {
    flexDirection: 'row', borderRadius: Radius.lg,
    padding: Spacing.md, gap: 0,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  previewStat: { flex: 1, alignItems: 'center', gap: 2 },
  previewVal: { fontSize: FontSize.xl, fontWeight: FontWeight.heavy },
  previewLabel: { fontSize: FontSize.xs, color: Colors.textTertiary },
  previewDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },

  // Notes
  notesInput: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, fontSize: FontSize.sm,
    color: Colors.textPrimary, minHeight: 72,
    textAlignVertical: 'top',
  },

  // Save
  saveBtn: { borderRadius: Radius.lg, overflow: 'hidden' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.black },
});
