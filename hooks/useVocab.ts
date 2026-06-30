import { useState, useEffect, useCallback } from 'react';
import { getDB, today } from '../db/client';
import { VOCAB_WORDS, VocabWord } from '../constants/frenchVocab';

export type VocabStatus = 'new' | 'learning' | 'known';

export interface VocabProgressRow {
  word_id: string;
  status: VocabStatus;
  review_count: number;
  correct_count: number;
  is_favorite: number;
  last_reviewed: string | null;
}

export interface VocabWithProgress extends VocabWord {
  status: VocabStatus;
  review_count: number;
  correct_count: number;
  is_favorite: boolean;
  last_reviewed: string | null;
}

const DEFAULT_PROGRESS: Omit<VocabProgressRow, 'word_id'> = {
  status: 'new',
  review_count: 0,
  correct_count: 0,
  is_favorite: 0,
  last_reviewed: null,
};

function upsertProgress(wordId: string, fields: Partial<Omit<VocabProgressRow, 'word_id'>>, existing?: VocabProgressRow) {
  const merged = { ...DEFAULT_PROGRESS, ...existing, ...fields };
  const db = getDB();
  db.runSync(
    `INSERT INTO vocab_progress (word_id, status, review_count, correct_count, is_favorite, last_reviewed)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(word_id) DO UPDATE SET status = ?, review_count = ?, correct_count = ?, is_favorite = ?, last_reviewed = ?`,
    [
      wordId, merged.status, merged.review_count, merged.correct_count, merged.is_favorite, merged.last_reviewed,
      merged.status, merged.review_count, merged.correct_count, merged.is_favorite, merged.last_reviewed,
    ]
  );
}

export function useVocab() {
  const [words, setWords] = useState<VocabWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const db = getDB();
    const rows = db.getAllSync<VocabProgressRow>('SELECT * FROM vocab_progress');
    const byId = new Map(rows.map((r) => [r.word_id, r]));

    const merged = VOCAB_WORDS.map((w) => {
      const p = byId.get(w.id);
      return {
        ...w,
        status: (p?.status ?? 'new') as VocabStatus,
        review_count: p?.review_count ?? 0,
        correct_count: p?.correct_count ?? 0,
        is_favorite: !!p?.is_favorite,
        last_reviewed: p?.last_reviewed ?? null,
      };
    });

    setWords(merged);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const getProgressRow = (wordId: string): VocabProgressRow | undefined => {
    const db = getDB();
    return db.getFirstSync<VocabProgressRow>('SELECT * FROM vocab_progress WHERE word_id = ?', [wordId]) ?? undefined;
  };

  const setStatus = useCallback((wordId: string, status: VocabStatus) => {
    const existing = getProgressRow(wordId);
    upsertProgress(wordId, { status, last_reviewed: today() }, existing);
    load();
  }, [load]);

  const toggleFavorite = useCallback((wordId: string) => {
    const existing = getProgressRow(wordId);
    const next = existing?.is_favorite ? 0 : 1;
    upsertProgress(wordId, { is_favorite: next }, existing);
    load();
  }, [load]);

  /** Record a flashcard quiz answer; auto-advances status with a 3-correct-in-a-row streak. */
  const recordAnswer = useCallback((wordId: string, correct: boolean) => {
    const existing = getProgressRow(wordId);
    const prevStatus = (existing?.status ?? 'new') as VocabStatus;
    const reviewCount = (existing?.review_count ?? 0) + 1;

    let streak = existing?.correct_count ?? 0;
    let status: VocabStatus = prevStatus;

    if (correct) {
      streak += 1;
      if (streak >= 3) status = 'known';
      else if (prevStatus === 'new') status = 'learning';
    } else {
      streak = 0;
      if (prevStatus !== 'new') status = 'learning';
    }

    upsertProgress(wordId, {
      status,
      review_count: reviewCount,
      correct_count: streak,
      last_reviewed: today(),
    }, existing);
    load();
  }, [load]);

  const stats = {
    total: words.length,
    known: words.filter((w) => w.status === 'known').length,
    learning: words.filter((w) => w.status === 'learning').length,
    newCount: words.filter((w) => w.status === 'new').length,
    favorites: words.filter((w) => w.is_favorite).length,
  };

  return { words, loading, stats, setStatus, toggleFavorite, recordAnswer, reload: load };
}
