import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { VocabWithProgress } from '../hooks/useVocab';

interface Props {
  word: VocabWithProgress;
  onAnswer: (correct: boolean) => void;
}

export default function VocabFlashcard({ word, onAnswer }: Props) {
  const [revealed, setRevealed] = useState(false);

  const reveal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRevealed(true);
  };

  const answer = (correct: boolean) => {
    Haptics.notificationAsync(
      correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
    );
    setRevealed(false);
    onAnswer(correct);
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.card} onPress={reveal} activeOpacity={0.85} disabled={revealed}>
        <Text style={styles.french}>{word.french}</Text>
        <Text style={styles.phonetic}>/{word.phonetic}/</Text>

        {revealed ? (
          <View style={styles.reveal}>
            <Text style={styles.english}>{word.english}</Text>
            {word.example_fr && (
              <View style={styles.example}>
                <Text style={styles.exampleFr}>{word.example_fr}</Text>
                <Text style={styles.exampleEn}>{word.example_en}</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.hint}>Tap to reveal meaning</Text>
        )}
      </TouchableOpacity>

      {revealed && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.btnWrong]} onPress={() => answer(false)}>
            <Text style={styles.btnWrongText}>✕ Still learning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnRight]} onPress={() => answer(true)}>
            <Text style={styles.btnRightText}>✓ I knew it</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: Spacing.md },
  card: {
    width: '100%',
    minHeight: 220,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  french: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  phonetic: { fontSize: FontSize.lg, color: Colors.accent, fontStyle: 'italic' },
  hint: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: Spacing.md },
  reveal: { alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  english: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'center' },
  example: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, padding: Spacing.sm, gap: 2 },
  exampleFr: { fontSize: FontSize.sm, color: Colors.textPrimary, fontStyle: 'italic' },
  exampleEn: { fontSize: FontSize.xs, color: Colors.textSecondary },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  btn: { flex: 1, paddingVertical: 14, borderRadius: Radius.md, alignItems: 'center' },
  btnWrong: { backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border },
  btnWrongText: { color: Colors.textSecondary, fontWeight: FontWeight.semibold, fontSize: FontSize.md },
  btnRight: { backgroundColor: Colors.btnPrimary },
  btnRightText: { color: Colors.btnPrimaryText, fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
