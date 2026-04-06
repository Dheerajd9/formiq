import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, Dimensions, Linking,
} from 'react-native';
import Body, { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme';
import { EXERCISES, MUSCLE_GROUPS, EQUIPMENT_LIST, Exercise, MuscleGroup } from '../../constants/exercises';
import ExerciseCard from '../../components/ExerciseCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Map body highlighter slugs → our MuscleGroup keys
const SLUG_TO_MUSCLE: Partial<Record<Slug, MuscleGroup>> = {
  chest: 'chest',
  biceps: 'biceps',
  triceps: 'triceps',
  forearm: 'forearms',
  abs: 'core',
  obliques: 'core',
  'upper-back': 'lats',
  'lower-back': 'back',
  trapezius: 'traps',
  deltoids: 'shoulders',
  quadriceps: 'quads',
  hamstring: 'hamstrings',
  calves: 'calves',
  gluteal: 'glutes',
  neck: 'neck',
  adductors: 'quads',
};

// Map our MuscleGroup keys → body highlighter slugs
const MUSCLE_TO_SLUGS: Partial<Record<MuscleGroup, Slug[]>> = {
  chest: ['chest'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  forearms: ['forearm'],
  core: ['abs', 'obliques'],
  lats: ['upper-back'],
  back: ['lower-back'],
  traps: ['trapezius'],
  shoulders: ['deltoids'],
  quads: ['quadriceps', 'adductors'],
  hamstrings: ['hamstring'],
  calves: ['calves'],
  glutes: ['gluteal'],
  neck: ['neck'],
};

export default function MusclesScreen() {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Build highlight data for the body component
  const highlightData: ExtendedBodyPart[] = MUSCLE_GROUPS
    .filter(mg => mg.key !== 'cardio')
    .flatMap(mg => {
      const slugs = MUSCLE_TO_SLUGS[mg.key] ?? [];
      return slugs.map(slug => ({
        slug,
        color: selectedMuscle === mg.key ? mg.color : mg.color + '60',
        intensity: selectedMuscle === mg.key ? 1 : 0.4,
      }));
    });

  const filteredExercises = selectedMuscle
    ? EXERCISES.filter(e => e.muscle_group === selectedMuscle)
    : [];

  const selectedMuscleInfo = selectedMuscle
    ? MUSCLE_GROUPS.find(m => m.key === selectedMuscle)
    : null;

  const handleBodyPartPress = (part: ExtendedBodyPart) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!part.slug) return;
    const mapped = SLUG_TO_MUSCLE[part.slug];
    if (mapped) {
      setSelectedMuscle(prev => prev === mapped ? null : mapped);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Muscle Map</Text>
          <Text style={styles.subtitle}>Tap a muscle to see exercises</Text>
        </View>

        {/* Front / Back Toggle */}
        <View style={styles.sideToggle}>
          <TouchableOpacity
            style={[styles.sideBtn, side === 'front' && styles.sideBtnActive]}
            onPress={() => setSide('front')}
          >
            <Text style={[styles.sideBtnText, side === 'front' && styles.sideBtnTextActive]}>Front</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sideBtn, side === 'back' && styles.sideBtnActive]}
            onPress={() => setSide('back')}
          >
            <Text style={[styles.sideBtnText, side === 'back' && styles.sideBtnTextActive]}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Interactive Body Map */}
        <View style={styles.bodyContainer}>
          <Body
            data={highlightData}
            gender="male"
            side={side}
            scale={1.1}
            colors={{ fill: '#AAAAAA', stroke: '#CCCCCC' }}
            onBodyPartPress={handleBodyPartPress}
          />
        </View>

        {/* Selected muscle label */}
        {selectedMuscle && selectedMuscleInfo ? (
          <View style={[styles.selectedBadge, { borderColor: selectedMuscleInfo.color }]}>
            <Text style={styles.selectedEmoji}>{selectedMuscleInfo.emoji}</Text>
            <Text style={[styles.selectedLabel, { color: selectedMuscleInfo.color }]}>
              {selectedMuscleInfo.label}
            </Text>
            <Text style={styles.selectedCount}>
              {filteredExercises.length} exercises
            </Text>
            <TouchableOpacity onPress={() => setSelectedMuscle(null)} style={styles.clearSel}>
              <Text style={styles.clearSelText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>👆 Tap any highlighted area on the body</Text>
          </View>
        )}

        {/* Muscle group quick select pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          {MUSCLE_GROUPS.filter(mg => mg.key !== 'cardio').map(mg => (
            <TouchableOpacity
              key={mg.key}
              style={[
                styles.pill,
                { borderColor: mg.color + '60' },
                selectedMuscle === mg.key && { backgroundColor: mg.color, borderColor: mg.color },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedMuscle(prev => prev === mg.key ? null : mg.key);
              }}
            >
              <Text style={styles.pillEmoji}>{mg.emoji}</Text>
              <Text style={[
                styles.pillText,
                { color: mg.color },
                selectedMuscle === mg.key && { color: Colors.white },
              ]}>
                {mg.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Exercise list for selected muscle */}
        {selectedMuscle && filteredExercises.length > 0 && (
          <View style={styles.exerciseSection}>
            <Text style={styles.exerciseSectionTitle}>
              {selectedMuscleInfo?.emoji} {selectedMuscleInfo?.label} Exercises
            </Text>
            {filteredExercises.map(ex => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                onPress={() => setSelectedExercise(ex)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Exercise Detail Modal */}
      <Modal visible={!!selectedExercise} animationType="slide" presentationStyle="pageSheet">
        {selectedExercise && (
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedExercise(null)}>
                <Text style={styles.modalClose}>✕ Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              {(() => {
                const mg = MUSCLE_GROUPS.find(m => m.key === selectedExercise.muscle_group) ?? MUSCLE_GROUPS[0];
                const eq = EQUIPMENT_LIST.find(e => e.key === selectedExercise.equipment) ?? EQUIPMENT_LIST[0];
                return (
                  <>
                    <View style={[styles.detailIconBox, { backgroundColor: mg.color + '18' }]}>
                      <Text style={styles.detailIcon}>{mg.emoji}</Text>
                    </View>
                    <Text style={styles.detailName}>{selectedExercise.name}</Text>

                    <View style={styles.detailTags}>
                      <View style={[styles.tag, { backgroundColor: mg.color + '18' }]}>
                        <Text style={[styles.tagText, { color: mg.color }]}>{mg.label}</Text>
                      </View>
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>{eq.label}</Text>
                      </View>
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>{selectedExercise.difficulty}</Text>
                      </View>
                    </View>

                    {selectedExercise.video_url && (
                      <TouchableOpacity
                        style={styles.videoBtn}
                        onPress={() => {
                          const ytUrl = selectedExercise.video_url!.replace('/embed/', '/watch?v=');
                          Linking.openURL(ytUrl);
                        }}
                      >
                        <Text style={styles.videoBtnIcon}>▶</Text>
                        <Text style={styles.videoBtnText}>Watch Exercise Video</Text>
                      </TouchableOpacity>
                    )}

                    {selectedExercise.secondary_muscles.length > 0 && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Also works</Text>
                        <Text style={styles.detailSecondary}>
                          {selectedExercise.secondary_muscles.join(', ')}
                        </Text>
                      </View>
                    )}

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Recommended</Text>
                      <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                          <Text style={styles.statVal}>{selectedExercise.sets_default}</Text>
                          <Text style={styles.statLbl}>Sets</Text>
                        </View>
                        <View style={styles.statBox}>
                          <Text style={styles.statVal}>{selectedExercise.reps_default}</Text>
                          <Text style={styles.statLbl}>Reps</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>How to do it</Text>
                      {selectedExercise.instructions.map((step, i) => (
                        <View key={i} style={styles.step}>
                          <View style={styles.stepNum}>
                            <Text style={styles.stepNumText}>{i + 1}</Text>
                          </View>
                          <Text style={styles.stepText}>{step}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                );
              })()}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  sideToggle: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sideBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  sideBtnActive: { backgroundColor: Colors.textPrimary },
  sideBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  sideBtnTextActive: { color: Colors.white },
  bodyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  selectedEmoji: { fontSize: 20 },
  selectedLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, flex: 1 },
  selectedCount: { fontSize: FontSize.sm, color: Colors.textSecondary },
  clearSel: { padding: 4 },
  clearSelText: { color: Colors.textTertiary, fontSize: FontSize.md },
  hintBox: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  hintText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  pillRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    backgroundColor: Colors.white,
    gap: 4,
  },
  pillEmoji: { fontSize: 12 },
  pillText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  exerciseSection: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  exerciseSectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  // Modal styles
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalClose: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  modalContent: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 48, alignItems: 'center' },
  detailIconBox: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  detailIcon: { fontSize: 36 },
  detailName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  detailTags: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', justifyContent: 'center' },
  tag: { backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  tagText: { fontSize: FontSize.sm, color: Colors.textSecondary, textTransform: 'capitalize' },
  videoBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    borderRadius: Radius.md, gap: Spacing.sm,
    width: '100%', justifyContent: 'center',
  },
  videoBtnIcon: { color: Colors.white, fontSize: FontSize.lg },
  videoBtnText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  detailSection: {
    width: '100%', backgroundColor: Colors.surface,
    borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm,
  },
  detailSectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  detailSecondary: { fontSize: FontSize.sm, color: Colors.textSecondary, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statBox: {
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
});
