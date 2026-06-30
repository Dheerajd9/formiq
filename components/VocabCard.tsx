import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { VocabWithProgress } from '../hooks/useVocab';

const STATUS_LABEL: Record<string, string> = { new: 'New', learning: 'Learning', known: 'Known' };
const STATUS_COLOR: Record<string, string> = { new: Colors.textTertiary, learning: '#FFA726', known: Colors.accent };

interface Props {
  word: VocabWithProgress;
  onPress?: () => void;
  onToggleFavorite?: () => void;
}

export default function VocabCard({ word, onPress, onToggleFavorite }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.french} numberOfLines={1}>{word.french}</Text>
          {word.gender && <Text style={styles.gender}>{word.gender === 'm' ? '(m)' : '(f)'}</Text>}
        </View>
        <Text style={styles.phonetic} numberOfLines={1}>/{word.phonetic}/</Text>
        <Text style={styles.english} numberOfLines={1}>{word.english}</Text>
      </View>

      <View style={styles.right}>
        <TouchableOpacity onPress={onToggleFavorite} hitSlop={8}>
          <Text style={styles.star}>{word.is_favorite ? '★' : '☆'}</Text>
        </TouchableOpacity>
        <View style={[styles.statusTag, { backgroundColor: STATUS_COLOR[word.status] + '22' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLOR[word.status] }]}>{STATUS_LABEL[word.status]}</Text>
        </View>
      </View>
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
  info: { flex: 1, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  french: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  gender: { fontSize: FontSize.xs, color: Colors.textTertiary },
  phonetic: { fontSize: FontSize.sm, color: Colors.accent, fontStyle: 'italic' },
  english: { fontSize: FontSize.sm, color: Colors.textSecondary },
  right: { alignItems: 'flex-end', gap: 6 },
  star: { fontSize: FontSize.xl, color: Colors.accent },
  statusTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
});
