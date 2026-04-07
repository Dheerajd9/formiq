import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, Alert, TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme';
import { usePlan, getDayName } from '../../hooks/usePlan';
import { EXERCISES, MUSCLE_GROUPS, Exercise } from '../../constants/exercises';
import ExerciseCard from '../../components/ExerciseCard';

const WORKOUT_TYPES = [
  { key: 'gym', label: 'Gym', emoji: '🏋️', color: Colors.gym },
  { key: 'running', label: 'Run', emoji: '🏃', color: Colors.cardio },
  { key: 'swimming', label: 'Swim', emoji: '🏊', color: Colors.swim },
  { key: 'rest', label: 'Rest', emoji: '😴', color: Colors.textTertiary },
];

const TEMPLATES = [
  {
    name: 'Push / Pull / Legs',
    days: [
      { day: 0, type: 'gym', exercises: ['chest_002', 'chest_005', 'shoulders_001', 'triceps_001'] },
      { day: 1, type: 'gym', exercises: ['lats_001', 'back_001', 'biceps_001', 'traps_001'] },
      { day: 2, type: 'gym', exercises: ['quads_001', 'hamstrings_001', 'calves_001', 'glutes_001'] },
      { day: 3, type: 'rest', exercises: [] },
      { day: 4, type: 'gym', exercises: ['chest_004', 'chest_006', 'shoulders_003', 'triceps_003'] },
      { day: 5, type: 'gym', exercises: ['lats_003', 'back_002', 'biceps_003', 'traps_002'] },
      { day: 6, type: 'rest', exercises: [] },
    ],
  },
  {
    name: 'Full Body 3x Week',
    days: [
      { day: 0, type: 'gym', exercises: ['chest_001', 'back_001', 'quads_002', 'core_001'] },
      { day: 1, type: 'rest', exercises: [] },
      { day: 2, type: 'gym', exercises: ['chest_002', 'lats_003', 'quads_001', 'core_003'] },
      { day: 3, type: 'rest', exercises: [] },
      { day: 4, type: 'gym', exercises: ['chest_003', 'back_002', 'hamstrings_001', 'core_002'] },
      { day: 5, type: 'running', exercises: [] },
      { day: 6, type: 'rest', exercises: [] },
    ],
  },
  {
    name: 'Cardio + Strength',
    days: [
      { day: 0, type: 'gym', exercises: ['chest_001', 'back_001', 'biceps_001', 'triceps_001'] },
      { day: 1, type: 'running', exercises: [] },
      { day: 2, type: 'gym', exercises: ['quads_001', 'hamstrings_001', 'glutes_001', 'core_001'] },
      { day: 3, type: 'swimming', exercises: [] },
      { day: 4, type: 'gym', exercises: ['shoulders_001', 'lats_003', 'traps_001', 'core_006'] },
      { day: 5, type: 'running', exercises: [] },
      { day: 6, type: 'rest', exercises: [] },
    ],
  },
];

export default function PlanScreen() {
  const {
    plans, activePlan, createPlan, setActivePlanById, deletePlan,
    upsertPlanDay, addExerciseToPlanDay, removeExerciseFromPlanDay,
    ensurePlanDayExists,
  } = usePlan();

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [searchEx, setSearchEx] = useState('');

  const viewingPlan = plans.find((p) => p.id === selectedPlanId) ?? activePlan ?? plans[0] ?? null;

  const handleApplyTemplate = (template: typeof TEMPLATES[0]) => {
    const name = template.name;
    createPlan(name);
    // We'll apply after creation in next render - use timeout
    setTimeout(() => {
      // Re-fetch plans to get the new one
      setShowTemplates(false);
    }, 300);
    Alert.alert('Template Applied', `"${name}" plan created! Activate it to use it.`);
  };

  const handleCreatePlan = () => {
    if (!newPlanName.trim()) return;
    createPlan(newPlanName.trim());
    setNewPlanName('');
    setShowNewPlan(false);
  };

  const handleAddExercise = (exercise: Exercise) => {
    if (!viewingPlan) return;
    const dayId = ensurePlanDayExists(viewingPlan.id, selectedDay, 'gym');
    if (dayId) {
      addExerciseToPlanDay(dayId, exercise.id, exercise.sets_default, exercise.reps_default);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowExercisePicker(false);
  };

  const currentDay = viewingPlan?.days.find((d) => d.day_of_week === selectedDay);
  const filteredExercises = EXERCISES.filter((e) =>
    searchEx ? e.name.toLowerCase().includes(searchEx.toLowerCase()) : true
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Plan</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowNewPlan(true)}>
          <Text style={styles.addBtnText}>+ New Plan</Text>
        </TouchableOpacity>
      </View>

      {/* Plan Selector */}
      {plans.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.planTabs}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planTab, viewingPlan?.id === plan.id && styles.planTabActive]}
              onPress={() => setSelectedPlanId(plan.id)}
            >
              {plan.is_active === 1 && <Text style={styles.activeDot}>●</Text>}
              <Text style={[styles.planTabText, viewingPlan?.id === plan.id && styles.planTabTextActive]}>
                {plan.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* No plans state */}
      {plans.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyTitle}>No workout plan yet</Text>
          <Text style={styles.emptySub}>Create a new plan or use a template</Text>
          <TouchableOpacity style={styles.templateBtn} onPress={() => setShowTemplates(true)}>
            <Text style={styles.templateBtnText}>Use a Template</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.newPlanBtn} onPress={() => setShowNewPlan(true)}>
            <Text style={styles.newPlanBtnText}>Create Blank Plan</Text>
          </TouchableOpacity>
        </View>
      )}

      {viewingPlan && (
        <>
          {/* Plan Actions */}
          <View style={styles.planActions}>
            {viewingPlan.is_active !== 1 ? (
              <TouchableOpacity
                style={styles.activateBtn}
                onPress={() => { setActivePlanById(viewingPlan.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
              >
                <Text style={styles.activateBtnText}>Activate Plan</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.activeLabel}>
                <Text style={styles.activeLabelText}>✓ Active Plan</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => Alert.alert('Delete Plan', 'Are you sure?', [
                { text: 'Cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deletePlan(viewingPlan.id) },
              ])}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>

          {/* Day Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabs}>
            {[0, 1, 2, 3, 4, 5, 6].map((dow) => {
              const dayData = viewingPlan.days.find((d) => d.day_of_week === dow);
              const wt = WORKOUT_TYPES.find((w) => w.key === (dayData?.workout_type ?? 'rest'));
              return (
                <TouchableOpacity
                  key={dow}
                  style={[styles.dayTab, selectedDay === dow && styles.dayTabActive]}
                  onPress={() => setSelectedDay(dow)}
                >
                  <Text style={styles.dayEmoji}>{wt?.emoji ?? '😴'}</Text>
                  <Text style={[styles.dayTabText, selectedDay === dow && styles.dayTabTextActive]}>
                    {getDayName(dow).slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Workout Type Picker for selected day */}
          <View style={styles.typeRow}>
            {WORKOUT_TYPES.map((wt) => (
              <TouchableOpacity
                key={wt.key}
                style={[
                  styles.typeChip,
                  currentDay?.workout_type === wt.key && { backgroundColor: wt.color },
                ]}
                onPress={() => upsertPlanDay(viewingPlan.id, selectedDay, wt.key)}
              >
                <Text style={styles.typeEmoji}>{wt.emoji}</Text>
                <Text style={[
                  styles.typeChipText,
                  currentDay?.workout_type === wt.key && styles.typeChipTextActive,
                ]}>{wt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Exercises for this day */}
          <ScrollView style={styles.exList} contentContainerStyle={{ padding: Spacing.md, paddingBottom: 32 }}>
            {currentDay?.exercises.map((pde) => (
              <View key={pde.id} style={styles.planExRow}>
                <View style={styles.planExInfo}>
                  <Text style={styles.planExName}>{pde.exercise?.name ?? pde.exercise_id}</Text>
                  <Text style={styles.planExSets}>{pde.sets} sets × {pde.reps} reps</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeExerciseFromPlanDay(pde.id)}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {(currentDay?.workout_type === 'gym' || currentDay?.workout_type === undefined) && (
              <TouchableOpacity
                style={styles.addExBtn}
                onPress={() => setShowExercisePicker(true)}
              >
                <Text style={styles.addExBtnText}>+ Add Exercise</Text>
              </TouchableOpacity>
            )}

            {(!currentDay || currentDay.exercises.length === 0) && currentDay?.workout_type === 'rest' && (
              <View style={styles.restDay}>
                <Text style={styles.restEmoji}>😴</Text>
                <Text style={styles.restText}>Rest Day</Text>
                <Text style={styles.restSub}>Recovery is part of the plan</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* Template selector for existing plans */}
      {plans.length > 0 && (
        <TouchableOpacity style={styles.templateHint} onPress={() => setShowTemplates(true)}>
          <Text style={styles.templateHintText}>Browse Templates</Text>
        </TouchableOpacity>
      )}

      {/* New Plan Modal */}
      <Modal visible={showNewPlan} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Plan</Text>
            <TouchableOpacity onPress={() => setShowNewPlan(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <TextInput
              style={styles.nameInput}
              placeholder="Plan name (e.g. My Bulk Phase)"
              value={newPlanName}
              onChangeText={setNewPlanName}
              autoFocus
            />
            <TouchableOpacity style={styles.createBtn} onPress={handleCreatePlan}>
              <Text style={styles.createBtnText}>Create Plan</Text>
            </TouchableOpacity>
            <Text style={styles.orText}>— or —</Text>
            <TouchableOpacity style={styles.templateBtn2} onPress={() => { setShowNewPlan(false); setShowTemplates(true); }}>
              <Text style={styles.templateBtn2Text}>Use a Template</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Templates Modal */}
      <Modal visible={showTemplates} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Templates</Text>
            <TouchableOpacity onPress={() => setShowTemplates(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: Spacing.md, gap: Spacing.md }}>
            {TEMPLATES.map((t) => (
              <TouchableOpacity
                key={t.name}
                style={styles.templateCard}
                onPress={() => handleApplyTemplate(t)}
              >
                <Text style={styles.templateName}>{t.name}</Text>
                <Text style={styles.templateDesc}>
                  {t.days.filter((d) => d.type !== 'rest').length} training days per week
                </Text>
                <View style={styles.templateDays}>
                  {t.days.map((d, i) => {
                    const wt = WORKOUT_TYPES.find((w) => w.key === d.type);
                    return (
                      <View key={i} style={[styles.templateDayDot, { backgroundColor: wt?.color + '30' }]}>
                        <Text style={{ fontSize: 10 }}>{wt?.emoji}</Text>
                      </View>
                    );
                  })}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Exercise Picker Modal */}
      <Modal visible={showExercisePicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchEx}
              onChangeText={setSearchEx}
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 32 }}>
            {filteredExercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                showAddButton
                onAdd={() => handleAddExercise(ex)}
              />
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  addBtn: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  addBtnText: { color: Colors.btnPrimaryText, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  planTabs: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.xs },
  planTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  planTabActive: { backgroundColor: Colors.btnSecondary, borderColor: Colors.btnSecondary },
  activeDot: { color: Colors.gym, fontSize: 8 },
  planTabText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  planTabTextActive: { color: Colors.white },
  planActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  activateBtn: {
    backgroundColor: Colors.btnPrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  activateBtnText: { color: Colors.white, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  activeLabel: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.gymLight,
  },
  activeLabelText: { color: Colors.gym, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  deleteBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 6 },
  deleteBtnText: { color: Colors.textTertiary, fontSize: FontSize.sm },
  dayTabs: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.xs },
  dayTab: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 52,
    gap: 2,
  },
  dayTabActive: { backgroundColor: Colors.btnSecondary, borderColor: Colors.btnSecondary },
  dayEmoji: { fontSize: 14 },
  dayTabText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  dayTabTextActive: { color: Colors.white },
  typeRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.xs },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 3,
  },
  typeEmoji: { fontSize: 12 },
  typeChipText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  typeChipTextActive: { color: Colors.white },
  exList: { flex: 1 },
  planExRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planExInfo: { flex: 1 },
  planExName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  planExSets: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  removeBtn: { padding: 4 },
  removeBtnText: { color: Colors.textTertiary, fontSize: FontSize.md },
  addExBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: 4,
  },
  addExBtnText: { color: Colors.textSecondary, fontWeight: FontWeight.medium },
  restDay: { alignItems: 'center', paddingTop: 40, gap: Spacing.sm },
  restEmoji: { fontSize: 40 },
  restText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  restSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  templateHint: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  templateHintText: { color: Colors.textSecondary, fontSize: FontSize.sm, textDecorationLine: 'underline' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xl },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptySub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
  templateBtn: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },
  templateBtnText: { color: Colors.btnPrimaryText, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  newPlanBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  newPlanBtnText: { color: Colors.textPrimary, fontWeight: FontWeight.medium, fontSize: FontSize.md },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  modalClose: { fontSize: FontSize.md, color: Colors.textSecondary },
  modalBody: { padding: Spacing.md, gap: Spacing.md },
  nameInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  createBtn: {
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  createBtnText: { color: Colors.btnPrimaryText, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  orText: { textAlign: 'center', color: Colors.textTertiary, fontSize: FontSize.sm },
  templateBtn2: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  templateBtn2Text: { color: Colors.textPrimary, fontWeight: FontWeight.medium, fontSize: FontSize.md },
  searchBox: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  templateCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  templateName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  templateDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
  templateDays: { flexDirection: 'row', gap: 4 },
  templateDayDot: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
