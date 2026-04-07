import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { Exercise, EQUIPMENT_LIST, MUSCLE_GROUPS } from '../constants/exercises';

interface Props {
  exercise: Exercise;
  onPress?: () => void;
  showAddButton?: boolean;
  onAdd?: () => void;
}

export default function ExerciseCard({ exercise, onPress, showAddButton, onAdd }: Props) {
  const muscleInfo = MUSCLE_GROUPS.find((m) => m.key === exercise.muscle_group) ?? MUSCLE_GROUPS[0];
  const equipmentInfo = EQUIPMENT_LIST.find((e) => e.key === exercise.equipment) ?? EQUIPMENT_LIST[0];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Icon placeholder */}
      <View style={[styles.iconBox, { backgroundColor: muscleInfo.color + '18' }]}>
        <Text style={styles.iconText}>{muscleInfo?.emoji ?? '💪'}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{exercise.name}</Text>
        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: muscleInfo.color + '18' }]}>
            <Text style={[styles.tagText, { color: muscleInfo.color }]}>
              {muscleInfo.label}
            </Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{equipmentInfo.label}</Text>
          </View>
          <View style={[styles.tag, styles.diffTag]}>
            <Text style={styles.tagText}>{exercise.difficulty}</Text>
          </View>
        </View>
      </View>

      {showAddButton && (
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  tags: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  diffTag: {
    backgroundColor: Colors.surfaceAlt,
  },
  tagText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.btnPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: Colors.btnPrimaryText,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    lineHeight: 20,
  },
});
