import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, TextInput, Linking,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme';
import {
  EXERCISES, MUSCLE_GROUPS, EQUIPMENT_LIST,
  Exercise, MuscleGroup, Equipment,
} from '../../constants/exercises';
import ExerciseCard from '../../components/ExerciseCard';

export default function LibraryScreen() {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [search, setSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showGrid, setShowGrid] = useState(true); // muscle group grid view

  const filtered = EXERCISES.filter((ex) => {
    if (selectedMuscle && ex.muscle_group !== selectedMuscle) return false;
    if (selectedEquipment && ex.equipment !== selectedEquipment) return false;
    if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleMuscleSelect = (key: MuscleGroup) => {
    setSelectedMuscle(key);
    setShowGrid(false);
  };

  const handleBack = () => {
    setSelectedMuscle(null);
    setShowGrid(true);
    setSearch('');
    setSelectedEquipment(null);
  };

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        {!showGrid && (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>← All</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerTitles}>
          <Text style={styles.title}>
            {selectedMuscle
              ? MUSCLE_GROUPS.find(m => m.key === selectedMuscle)?.label ?? 'Exercises'
              : 'Exercise Library'}
          </Text>
          <Text style={styles.subtitle}>
            {showGrid ? `${MUSCLE_GROUPS.length} muscle groups · ${EXERCISES.length} exercises` : `${filtered.length} exercises`}
          </Text>
        </View>
      </View>

      {/* Muscle Group Grid */}
      {showGrid && !search ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContainer}>
          <View style={styles.searchBoxInner}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search all exercises..."
              value={search}
              onChangeText={(t) => { setSearch(t); if (t) setShowGrid(false); }}
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
          <Text style={styles.gridLabel}>Tap a muscle group</Text>
          <View style={styles.muscleGrid}>
            {MUSCLE_GROUPS.map((mg) => {
              const count = EXERCISES.filter(e => e.muscle_group === mg.key).length;
              return (
                <TouchableOpacity
                  key={mg.key}
                  style={[styles.muscleCard, { borderColor: mg.color + '40', backgroundColor: mg.color + '0D' }]}
                  onPress={() => handleMuscleSelect(mg.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.muscleEmoji}>{mg.emoji}</Text>
                  <Text style={[styles.muscleLabel, { color: mg.color }]}>{mg.label}</Text>
                  <Text style={styles.muscleCount}>{count} exercises</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <>
          {/* Search + Equipment Filter */}
          <View style={styles.searchBoxInner}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              value={search}
              onChangeText={(t) => { setSearch(t); if (!t && !selectedMuscle) setShowGrid(true); }}
              placeholderTextColor={Colors.textTertiary}
              autoFocus={!selectedMuscle}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(''); if (!selectedMuscle) setShowGrid(true); }}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Equipment chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <TouchableOpacity
              style={[styles.chip, !selectedEquipment && styles.chipActive]}
              onPress={() => setSelectedEquipment(null)}
            >
              <Text style={[styles.chipText, !selectedEquipment && styles.chipTextActive]}>All Equipment</Text>
            </TouchableOpacity>
            {EQUIPMENT_LIST.map((eq) => (
              <TouchableOpacity
                key={eq.key}
                style={[styles.chip, selectedEquipment === eq.key && styles.chipActive]}
                onPress={() => setSelectedEquipment(selectedEquipment === eq.key ? null : eq.key)}
              >
                <Text style={styles.chipEmoji}>{eq.emoji}</Text>
                <Text style={[styles.chipText, selectedEquipment === eq.key && styles.chipTextActive]}>
                  {eq.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Results */}
          <ScrollView style={styles.list} contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 32 }}>
            {filtered.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                onPress={() => setSelectedExercise(ex)}
              />
            ))}
            {filtered.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyText}>No exercises found</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}

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
              {/* Big muscle icon */}
              {(() => {
                const mg = MUSCLE_GROUPS.find((m) => m.key === selectedExercise.muscle_group) ?? MUSCLE_GROUPS[0];
                const eq = EQUIPMENT_LIST.find((e) => e.key === selectedExercise.equipment) ?? EQUIPMENT_LIST[0];
                return (
                  <>
                    <View style={[styles.detailIconBox, { backgroundColor: mg.color + '18' }]}>
                      <Text style={styles.detailIcon}>{mg.emoji}</Text>
                    </View>
                    <Text style={styles.detailName}>{selectedExercise.name}</Text>
                    <View style={styles.detailTags}>
                      <Tag label={mg.label} color={mg.color} />
                      <Tag label={eq.label} />
                      <Tag label={selectedExercise.difficulty} />
                    </View>

                    {/* Watch Video Button */}
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

                    {/* Secondary muscles */}
                    {selectedExercise.secondary_muscles.length > 0 && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Also works</Text>
                        <Text style={styles.detailSecondary}>
                          {selectedExercise.secondary_muscles.join(', ')}
                        </Text>
                      </View>
                    )}

                    {/* Sets/Reps */}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Recommended</Text>
                      <View style={styles.detailStats}>
                        <StatBox value={selectedExercise.sets_default.toString()} label="Sets" />
                        <StatBox value={selectedExercise.reps_default.toString()} label="Reps" />
                      </View>
                    </View>

                    {/* Instructions */}
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

function Tag({ label, color }: { label: string; color?: string }) {
  return (
    <View style={[styles.detailTag, color && { backgroundColor: color + '18' }]}>
      <Text style={[styles.detailTagText, color && { color }]}>{label}</Text>
    </View>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: { paddingRight: Spacing.xs },
  backText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  headerTitles: { flex: 1 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  // Grid
  gridContainer: { paddingHorizontal: Spacing.md, paddingBottom: 32 },
  gridLabel: { fontSize: FontSize.sm, color: Colors.textTertiary, marginBottom: Spacing.sm, marginTop: Spacing.xs },
  muscleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  muscleCard: {
    width: '47%',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 4,
  },
  muscleEmoji: { fontSize: 28 },
  muscleLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, textAlign: 'center' },
  muscleCount: { fontSize: FontSize.xs, color: Colors.textTertiary },

  // Search
  searchBoxInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: FontSize.md, color: Colors.textPrimary },
  clearBtn: { color: Colors.textTertiary, fontSize: FontSize.md },

  // Filters
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.xs },
  chip: {
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
  chipActive: { backgroundColor: Colors.btnSecondary, borderColor: Colors.btnSecondary },
  chipEmoji: { fontSize: 12 },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  chipTextActive: { color: Colors.white },

  list: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.xs },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary },

  // Modal
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalClose: { fontSize: FontSize.md, color: Colors.accent, fontWeight: FontWeight.medium },
  modalContent: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 48, alignItems: 'center' },
  detailIconBox: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  detailIcon: { fontSize: 36 },
  detailName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  detailTags: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', justifyContent: 'center' },
  detailTag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  detailTagText: { fontSize: FontSize.sm, color: Colors.textSecondary, textTransform: 'capitalize' },
  videoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Radius.md,
    gap: Spacing.sm,
    width: '100%',
    justifyContent: 'center',
  },
  videoBtnIcon: { color: Colors.white, fontSize: FontSize.lg },
  videoBtnText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  detailSection: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  detailSectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  detailSecondary: { fontSize: FontSize.sm, color: Colors.textSecondary, textTransform: 'capitalize' },
  detailStats: { flexDirection: 'row', gap: Spacing.sm },
  statBox: {
    flex: 1, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.sm,
    padding: Spacing.md, alignItems: 'center', gap: 2,
  },
  statValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  step: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepNumText: { color: Colors.stepText, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  stepText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
});
