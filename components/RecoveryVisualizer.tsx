import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { MuscleStatus } from '../hooks/useRecovery';
import { MUSCLE_GROUPS } from '../constants/exercises';

interface Props {
  statuses: MuscleStatus[];
}

export default function RecoveryVisualizer({ statuses }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {statuses.map((status) => {
          const mg = MUSCLE_GROUPS.find((m) => m.key === status.muscle_group);
          const bgColor =
            status.status === 'recovering'
              ? Colors.recoveringLight
              : status.status === 'ready'
              ? Colors.readyLight
              : Colors.surface;
          const dotColor =
            status.status === 'recovering'
              ? Colors.recovering
              : status.status === 'ready'
              ? Colors.ready
              : Colors.textTertiary;

          return (
            <View key={status.muscle_group} style={[styles.muscle, { backgroundColor: bgColor }]}>
              <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
              <Text style={styles.emoji}>{mg?.emoji ?? '💪'}</Text>
              <Text style={styles.name}>{mg?.label ?? status.muscle_group}</Text>
              <Text style={[styles.label, { color: dotColor }]}>{status.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  muscle: {
    width: '30%',
    flexGrow: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 2,
    position: 'relative',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  emoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  name: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  label: {
    fontSize: 9,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },
});
