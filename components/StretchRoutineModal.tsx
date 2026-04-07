import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { STRETCH_ROUTINES, StretchRoutine, Stretch } from '../constants/stretches';

// ── Routine picker ────────────────────────────────────────────────────────────
interface PickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (r: StretchRoutine) => void;
}

export function StretchPicker({ visible, onClose, onSelect }: PickerProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={ps.container}>
        <View style={ps.header}>
          <View>
            <Text style={ps.title}>Stretch & Warm-Up</Text>
            <Text style={ps.sub}>Choose a routine to start</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={ps.close}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={ps.list}>
          {STRETCH_ROUTINES.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={ps.card}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onSelect(r); }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[r.color + 'CC', r.color + '44']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={ps.cardGrad}
              >
                <Text style={ps.cardEmoji}>{r.emoji}</Text>
              </LinearGradient>
              <View style={ps.cardInfo}>
                <Text style={ps.cardName}>{r.name}</Text>
                <Text style={ps.cardDesc}>{r.description}</Text>
                <View style={ps.cardMeta}>
                  <Text style={[ps.cardBadge, { color: r.color }]}>
                    ⏱ {r.duration_minutes} min
                  </Text>
                  <Text style={ps.cardBadgeGrey}>
                    {r.stretches.length} stretches
                  </Text>
                </View>
              </View>
              <Text style={ps.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Active routine (step-by-step) ────────────────────────────────────────────
interface ActiveProps {
  routine: StretchRoutine | null;
  onClose: () => void;
  onComplete: () => void;
}

export function StretchActiveModal({ routine, onClose, onComplete }: ActiveProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [phase, setPhase] = useState<'preview' | 'hold' | 'done'>('preview');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const stretch: Stretch | null = routine ? routine.stretches[stepIdx] : null;
  const isLast = routine ? stepIdx === routine.stretches.length - 1 : false;

  const startHold = useCallback(() => {
    if (!stretch) return;
    setPhase('hold');
    setSecondsLeft(stretch.hold_seconds);
    progressAnim.setValue(1);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: stretch.hold_seconds * 1000,
      useNativeDriver: false,
    }).start();
  }, [stretch, progressAnim]);

  useEffect(() => {
    if (phase !== 'hold') return;
    if (secondsLeft <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase('preview');
      return;
    }
    if (secondsLeft === 5) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft]);

  // Slide animation on step change
  useEffect(() => {
    slideAnim.setValue(40);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 90, friction: 12 }).start();
  }, [stepIdx]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isLast) {
      onComplete();
    } else {
      setStepIdx((i) => i + 1);
      setPhase('preview');
    }
  };

  const handleSkip = () => {
    if (isLast) { onComplete(); return; }
    setStepIdx((i) => i + 1);
    setPhase('preview');
  };

  if (!routine || !stretch) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={!!routine} animationType="slide" presentationStyle="fullScreen">
      <LinearGradient colors={['#000000', '#0A0A0A']} style={as.container}>

        {/* Top bar */}
        <View style={as.topBar}>
          <TouchableOpacity onPress={onClose} style={as.closeBtn}>
            <Text style={as.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={as.topCenter}>
            <Text style={as.routineLabel}>{routine.name}</Text>
            <Text style={as.stepCounter}>{stepIdx + 1} / {routine.stretches.length}</Text>
          </View>
          <TouchableOpacity onPress={handleSkip} style={as.skipBtn}>
            <Text style={as.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Progress dots */}
        <View style={as.dotsRow}>
          {routine.stretches.map((_, i) => (
            <View
              key={i}
              style={[
                as.dot,
                i < stepIdx && { backgroundColor: routine.color },
                i === stepIdx && { backgroundColor: routine.color, width: 20 },
              ]}
            />
          ))}
        </View>

        {/* Main content */}
        <Animated.View style={[as.content, { transform: [{ translateY: slideAnim }] }]}>
          {/* Emoji circle */}
          <LinearGradient
            colors={[routine.color + '30', routine.color + '08']}
            style={as.emojiCircle}
          >
            <Text style={as.emoji}>{stretch.emoji}</Text>
          </LinearGradient>

          <Text style={as.stretchName}>{stretch.name}</Text>
          <Text style={[as.targetLabel, { color: routine.color }]}>{stretch.target}</Text>

          {/* Hold timer ring — shown during hold */}
          {phase === 'hold' && (
            <View style={as.timerWrap}>
              <View style={as.timerTrack}>
                <Animated.View style={[as.timerFill, { width: progressWidth, backgroundColor: routine.color }]} />
              </View>
              <Text style={[as.timerNum, { color: routine.color }]}>{secondsLeft}s</Text>
              <Text style={as.timerSub}>{stretch.dynamic ? 'keep moving' : 'hold & breathe'}</Text>
            </View>
          )}

          {/* Instructions */}
          {phase === 'preview' && (
            <ScrollView style={as.instructionsScroll} showsVerticalScrollIndicator={false}>
              {stretch.instructions.map((step, i) => (
                <View key={i} style={as.stepRow}>
                  <View style={[as.stepNum, { backgroundColor: routine.color }]}>
                    <Text style={as.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={as.stepText}>{step}</Text>
                </View>
              ))}
              <View style={as.tipBox}>
                <Text style={as.tipIcon}>💡</Text>
                <Text style={as.tipText}>{stretch.tip}</Text>
              </View>
            </ScrollView>
          )}
        </Animated.View>

        {/* CTA buttons */}
        <View style={as.footer}>
          {phase === 'preview' ? (
            <TouchableOpacity
              style={[as.holdBtn, { backgroundColor: routine.color }]}
              onPress={startHold}
              activeOpacity={0.85}
            >
              <Text style={as.holdBtnText}>
                {stretch.dynamic ? `▶  Start (${stretch.hold_seconds}s)` : `⏱  Start Hold (${stretch.hold_seconds}s)`}
              </Text>
            </TouchableOpacity>
          ) : secondsLeft > 0 ? (
            <TouchableOpacity
              style={[as.holdBtn, { backgroundColor: routine.color + '30', borderWidth: 1, borderColor: routine.color }]}
              onPress={() => { setPhase('preview'); progressAnim.stopAnimation(); }}
            >
              <Text style={[as.holdBtnText, { color: routine.color }]}>⏸  Pause</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[as.holdBtn, { backgroundColor: routine.color }]}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={as.holdBtnText}>
                {isLast ? '🎉  Finish Warm-Up' : `Next: ${routine.stretches[stepIdx + 1]?.name}  ›`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Modal>
  );
}

// ─── Picker styles ────────────────────────────────────────────────────────────
const ps = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.heavy, color: Colors.textPrimary },
  sub: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  close: { fontSize: FontSize.lg, color: Colors.textTertiary, padding: 4 },
  list: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 40 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', gap: Spacing.md,
  },
  cardGrad: { width: 72, height: 80, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 30 },
  cardInfo: { flex: 1, paddingVertical: Spacing.md, gap: 3 },
  cardName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cardDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16 },
  cardMeta: { flexDirection: 'row', gap: Spacing.sm, marginTop: 3 },
  cardBadge: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  cardBadgeGrey: { fontSize: FontSize.xs, color: Colors.textTertiary },
  arrow: { color: Colors.textTertiary, fontSize: 22, paddingRight: Spacing.md },
});

// ─── Active styles ────────────────────────────────────────────────────────────
const as = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm,
  },
  closeBtn: { width: 44, alignItems: 'flex-start' },
  closeText: { fontSize: FontSize.lg, color: Colors.textTertiary },
  topCenter: { flex: 1, alignItems: 'center' },
  routineLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  stepCounter: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  skipBtn: { width: 44, alignItems: 'flex-end' },
  skipText: { fontSize: FontSize.sm, color: Colors.textTertiary },

  dotsRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 5, paddingVertical: Spacing.sm,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.surfaceHigh,
  },

  content: { flex: 1, paddingHorizontal: Spacing.md, alignItems: 'center', gap: Spacing.md },

  emojiCircle: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  emoji: { fontSize: 52 },
  stretchName: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.heavy,
    color: Colors.textPrimary, textAlign: 'center',
  },
  targetLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  timerWrap: { alignItems: 'center', gap: Spacing.sm, width: '100%' },
  timerTrack: {
    width: '100%', height: 8,
    backgroundColor: Colors.surfaceHigh, borderRadius: 4, overflow: 'hidden',
  },
  timerFill: { height: '100%', borderRadius: 4 },
  timerNum: { fontSize: FontSize.hero, fontWeight: FontWeight.heavy },
  timerSub: { fontSize: FontSize.sm, color: Colors.textTertiary },

  instructionsScroll: { width: '100%' },
  stepRow: {
    flexDirection: 'row', gap: Spacing.sm,
    alignItems: 'flex-start', marginBottom: Spacing.sm,
  },
  stepNum: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  stepNumText: { color: Colors.black, fontSize: 11, fontWeight: FontWeight.bold },
  stepText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  tipBox: {
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md,
    padding: Spacing.md, marginTop: Spacing.sm, marginBottom: Spacing.xl,
  },
  tipIcon: { fontSize: 16 },
  tipText: { flex: 1, fontSize: FontSize.xs, color: Colors.textTertiary, lineHeight: 18 },

  footer: { padding: Spacing.md, paddingBottom: 40 },
  holdBtn: {
    borderRadius: Radius.lg, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  holdBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.black },
});
