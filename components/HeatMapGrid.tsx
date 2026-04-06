import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight } from '../constants/theme';
import { DayLog } from '../hooks/useProgress';

interface Props {
  days: DayLog[];
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getCellColor(day: DayLog): string {
  if (!day.workout_type) return Colors.surface;
  if (day.completed !== 1) return Colors.missedLight ?? '#FEE2E2';
  switch (day.workout_type) {
    case 'gym': return Colors.gym;
    case 'running': return Colors.cardio;
    case 'swimming': return Colors.swim;
    case 'cardio': return Colors.cardio;
    case 'lazy_day': return '#A78BFA';
    default: return Colors.gym;
  }
}

export default function HeatMapGrid({ days }: Props) {
  // Pad so it starts on Monday
  const firstDay = days[0];
  const firstDate = new Date(firstDay.date);
  const startDow = firstDate.getDay(); // 0=Sun
  const padStart = startDow === 0 ? 6 : startDow - 1; // convert to Mon=0

  const paddedDays: (DayLog | null)[] = [
    ...Array(padStart).fill(null),
    ...days,
  ];

  // Split into weeks (columns of 7)
  const weeks: (DayLog | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      <View style={styles.dayLabels}>
        {DAY_LABELS.map((d, i) => (
          <Text key={i} style={styles.dayLabel}>{d}</Text>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.week}>
              {week.map((day, di) => (
                <View
                  key={di}
                  style={[
                    styles.cell,
                    { backgroundColor: day ? getCellColor(day) : 'transparent' },
                    day && new Date(day.date).toDateString() === new Date().toDateString() && styles.today,
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem color={Colors.gym} label="Gym" />
        <LegendItem color={Colors.cardio} label="Cardio" />
        <LegendItem color="#A78BFA" label="Lazy Day" />
        <LegendItem color={Colors.surface} label="Rest" />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  dayLabels: {
    flexDirection: 'column',
    gap: 3,
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  dayLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    width: 12,
    height: 12,
    textAlign: 'center',
    lineHeight: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 3,
    paddingLeft: 16,
  },
  week: {
    flexDirection: 'column',
    gap: 3,
  },
  cell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  today: {
    borderWidth: 1.5,
    borderColor: Colors.textPrimary,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
