import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme';
import { EXERCISES, MUSCLE_GROUPS, EQUIPMENT_LIST } from '../../constants/exercises';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = EXERCISES.find((e) => e.id === id);

  if (!exercise) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>Exercise not found</Text>
      </SafeAreaView>
    );
  }

  const muscleInfo = MUSCLE_GROUPS.find((m) => m.key === exercise.muscle_group) ?? MUSCLE_GROUPS[0];
  const equipmentInfo = EQUIPMENT_LIST.find((e) => e.key === exercise.equipment) ?? EQUIPMENT_LIST[0];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: muscleInfo.color + '18' }]}>
          <Text style={styles.icon}>{muscleInfo.emoji}</Text>
        </View>
        <Text style={styles.name}>{exercise.name}</Text>
        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: muscleInfo.color + '18' }]}>
            <Text style={[styles.tagText, { color: muscleInfo.color }]}>{muscleInfo.label}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{equipmentInfo.label}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{exercise.difficulty}</Text>
          </View>
        </View>

        {exercise.secondary_muscles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Also works</Text>
            <Text style={styles.secondary}>{exercise.secondary_muscles.join(', ')}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{exercise.sets_default}</Text>
              <Text style={styles.statLbl}>Sets</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{exercise.reps_default}</Text>
              <Text style={styles.statLbl}>Reps</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {exercise.instructions.map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: {},
  backText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 48, alignItems: 'center' },
  iconBox: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 36 },
  name: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  tags: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', justifyContent: 'center' },
  tag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  tagText: { fontSize: FontSize.sm, color: Colors.textSecondary, textTransform: 'capitalize' },
  section: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  secondary: { fontSize: FontSize.sm, color: Colors.textSecondary, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  stat: {
    flex: 1, backgroundColor: Colors.white, borderRadius: Radius.sm,
    padding: Spacing.md, alignItems: 'center', gap: 2,
  },
  statVal: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLbl: { fontSize: FontSize.xs, color: Colors.textSecondary },
  step: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepNumText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  stepText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  notFound: { padding: Spacing.xl, color: Colors.textSecondary },
});
