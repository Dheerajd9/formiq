import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, TextInput,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme';
import { VOCAB_CATEGORIES, VocabCategory } from '../../constants/frenchVocab';
import { useVocab, VocabWithProgress } from '../../hooks/useVocab';
import VocabCard from '../../components/VocabCard';
import VocabFlashcard from '../../components/VocabFlashcard';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FrenchScreen() {
  const { words, stats, setStatus, toggleFavorite, recordAnswer } = useVocab();

  const [selectedCategory, setSelectedCategory] = useState<VocabCategory | null>(null);
  const [search, setSearch] = useState('');
  const [showGrid, setShowGrid] = useState(true);
  const [selectedWord, setSelectedWord] = useState<VocabWithProgress | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [practiceQueue, setPracticeQueue] = useState<VocabWithProgress[] | null>(null);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceScore, setPracticeScore] = useState({ right: 0, wrong: 0 });

  const filtered = words.filter((w) => {
    if (selectedCategory && w.category !== selectedCategory) return false;
    if (favoritesOnly && !w.is_favorite) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!w.french.toLowerCase().includes(q) && !w.english.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleCategorySelect = (key: VocabCategory) => {
    setSelectedCategory(key);
    setShowGrid(false);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setShowGrid(true);
    setSearch('');
    setFavoritesOnly(false);
  };

  const startPractice = (scope: VocabWithProgress[]) => {
    const due = scope.filter((w) => w.status !== 'known');
    const pool = due.length >= 5 ? due : scope;
    if (pool.length === 0) return;
    setPracticeQueue(shuffle(pool).slice(0, 20));
    setPracticeIndex(0);
    setPracticeScore({ right: 0, wrong: 0 });
  };

  const handlePracticeAnswer = (correct: boolean) => {
    if (!practiceQueue) return;
    const current = practiceQueue[practiceIndex];
    recordAnswer(current.id, correct);
    setPracticeScore((s) => ({ right: s.right + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }));
    setPracticeIndex((i) => i + 1);
  };

  const practiceDone = practiceQueue !== null && practiceIndex >= practiceQueue.length;
  const currentCard = practiceQueue && !practiceDone ? practiceQueue[practiceIndex] : null;

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
            {selectedCategory
              ? VOCAB_CATEGORIES.find((c) => c.key === selectedCategory)?.label ?? 'French'
              : '🇫🇷 French Vocab'}
          </Text>
          <Text style={styles.subtitle}>
            {stats.known} known · {stats.learning} learning · {stats.newCount} new
          </Text>
        </View>
        <TouchableOpacity style={styles.practiceBtn} onPress={() => startPractice(filtered.length ? filtered : words)}>
          <Text style={styles.practiceBtnText}>Practice</Text>
        </TouchableOpacity>
      </View>

      {/* Category Grid */}
      {showGrid && !search ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContainer}>
          <View style={styles.searchBoxInner}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search all words..."
              value={search}
              onChangeText={(t) => { setSearch(t); if (t) setShowGrid(false); }}
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <TouchableOpacity
            style={[styles.favChip, favoritesOnly && styles.favChipActive]}
            onPress={() => { setFavoritesOnly((f) => !f); setShowGrid(false); }}
          >
            <Text style={[styles.favChipText, favoritesOnly && styles.favChipTextActive]}>★ Favorites only</Text>
          </TouchableOpacity>

          <Text style={styles.gridLabel}>Tap a category</Text>
          <View style={styles.categoryGrid}>
            {VOCAB_CATEGORIES.map((c) => {
              const count = words.filter((w) => w.category === c.key).length;
              const known = words.filter((w) => w.category === c.key && w.status === 'known').length;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.categoryCard, { borderColor: c.color + '40', backgroundColor: c.color + '0D' }]}
                  onPress={() => handleCategorySelect(c.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryEmoji}>{c.emoji}</Text>
                  <Text style={[styles.categoryLabel, { color: c.color }]}>{c.label}</Text>
                  <Text style={styles.categoryCount}>{known}/{count} known</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <>
          {/* Search */}
          <View style={styles.searchBoxInner}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search words..."
              value={search}
              onChangeText={(t) => { setSearch(t); if (!t && !selectedCategory) setShowGrid(true); }}
              placeholderTextColor={Colors.textTertiary}
              autoFocus={!selectedCategory}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(''); if (!selectedCategory) setShowGrid(true); }}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Results */}
          <ScrollView style={styles.list} contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 32 }}>
            {filtered.map((w) => (
              <VocabCard
                key={w.id}
                word={w}
                onPress={() => setSelectedWord(w)}
                onToggleFavorite={() => toggleFavorite(w.id)}
              />
            ))}
            {filtered.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyText}>No words found</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* Word Detail Modal */}
      <Modal visible={!!selectedWord} animationType="slide" presentationStyle="pageSheet">
        {selectedWord && (
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedWord(null)}>
                <Text style={styles.modalClose}>✕ Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.detailFrench}>{selectedWord.french}</Text>
              <Text style={styles.detailPhonetic}>/{selectedWord.phonetic}/</Text>
              <Text style={styles.detailEnglish}>{selectedWord.english}</Text>

              {selectedWord.example_fr && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Example</Text>
                  <Text style={styles.exampleFr}>{selectedWord.example_fr}</Text>
                  <Text style={styles.exampleEn}>{selectedWord.example_en}</Text>
                </View>
              )}

              <View style={styles.statusRow}>
                {(['new', 'learning', 'known'] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusBtn, selectedWord.status === s && styles.statusBtnActive]}
                    onPress={() => { setStatus(selectedWord.id, s); setSelectedWord({ ...selectedWord, status: s }); }}
                  >
                    <Text style={[styles.statusBtnText, selectedWord.status === s && styles.statusBtnTextActive]}>
                      {s === 'new' ? 'New' : s === 'learning' ? 'Learning' : 'Known'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.favBtn}
                onPress={() => {
                  toggleFavorite(selectedWord.id);
                  setSelectedWord({ ...selectedWord, is_favorite: !selectedWord.is_favorite });
                }}
              >
                <Text style={styles.favBtnText}>
                  {selectedWord.is_favorite ? '★ Remove from favorites' : '☆ Add to favorites'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Practice Modal */}
      <Modal visible={practiceQueue !== null} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setPracticeQueue(null)}>
              <Text style={styles.modalClose}>✕ Close</Text>
            </TouchableOpacity>
            {practiceQueue && !practiceDone && (
              <Text style={styles.practiceProgress}>{practiceIndex + 1} / {practiceQueue.length}</Text>
            )}
          </View>

          <View style={styles.practiceBody}>
            {currentCard && (
              <VocabFlashcard word={currentCard} onAnswer={handlePracticeAnswer} />
            )}
            {practiceDone && (
              <View style={styles.doneBox}>
                <Text style={styles.doneEmoji}>🎉</Text>
                <Text style={styles.doneTitle}>Session complete!</Text>
                <Text style={styles.doneScore}>
                  {practiceScore.right} correct · {practiceScore.wrong} to review again
                </Text>
                <TouchableOpacity style={styles.doneBtn} onPress={() => setPracticeQueue(null)}>
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
  practiceBtn: {
    backgroundColor: Colors.btnPrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  practiceBtnText: { color: Colors.btnPrimaryText, fontWeight: FontWeight.bold, fontSize: FontSize.sm },

  gridContainer: { paddingHorizontal: Spacing.md, paddingBottom: 32 },
  gridLabel: { fontSize: FontSize.sm, color: Colors.textTertiary, marginBottom: Spacing.sm, marginTop: Spacing.xs },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  categoryCard: {
    width: '47%',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 4,
  },
  categoryEmoji: { fontSize: 28 },
  categoryLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, textAlign: 'center' },
  categoryCount: { fontSize: FontSize.xs, color: Colors.textTertiary },

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

  favChip: {
    alignSelf: 'flex-start',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  favChipActive: { backgroundColor: Colors.btnSecondary, borderColor: Colors.btnSecondary },
  favChipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  favChipTextActive: { color: Colors.white },

  list: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.xs },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary },

  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalClose: { fontSize: FontSize.md, color: Colors.accent, fontWeight: FontWeight.medium },
  modalContent: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 48, alignItems: 'center' },

  detailFrench: { fontSize: FontSize.hero, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  detailPhonetic: { fontSize: FontSize.lg, color: Colors.accent, fontStyle: 'italic' },
  detailEnglish: { fontSize: FontSize.xl, color: Colors.textSecondary, textAlign: 'center' },
  detailSection: {
    width: '100%', backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, gap: 4,
  },
  detailSectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  exampleFr: { fontSize: FontSize.md, color: Colors.textPrimary, fontStyle: 'italic' },
  exampleEn: { fontSize: FontSize.sm, color: Colors.textSecondary },

  statusRow: { flexDirection: 'row', gap: Spacing.sm, width: '100%', marginTop: Spacing.sm },
  statusBtn: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center',
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  statusBtnActive: { backgroundColor: Colors.btnSecondary, borderColor: Colors.btnSecondary },
  statusBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  statusBtnTextActive: { color: Colors.white },

  favBtn: { paddingVertical: 12 },
  favBtnText: { color: Colors.accent, fontSize: FontSize.md, fontWeight: FontWeight.medium },

  practiceProgress: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  practiceBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },

  doneBox: { alignItems: 'center', gap: Spacing.sm },
  doneEmoji: { fontSize: 48 },
  doneTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  doneScore: { fontSize: FontSize.md, color: Colors.textSecondary },
  doneBtn: {
    marginTop: Spacing.md, backgroundColor: Colors.btnPrimary,
    paddingHorizontal: Spacing.xl, paddingVertical: 12, borderRadius: Radius.md,
  },
  doneBtnText: { color: Colors.btnPrimaryText, fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
