import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, FontSize, FontWeight, Spacing } from '../constants/theme';

interface Props {
  onDismiss: () => void;
  defaultSeconds?: number;
}

export default function RestTimer({ onDismiss, defaultSeconds = 90 }: Props) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [slideAnim]);

  useEffect(() => {
    if (seconds <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onDismiss();
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, onDismiss]);

  // Pulse haptic at 10s warning
  useEffect(() => {
    if (seconds === 10) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [seconds]);

  const progress = seconds / defaultSeconds;
  const color = seconds > 30 ? Colors.gym : seconds > 10 ? '#F59E0B' : '#EF4444';

  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  const timeStr = `${mm}:${ss.toString().padStart(2, '0')}`;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.bar}>
        {/* Progress fill */}
        <View style={[styles.fill, { width: `${progress * 100}%` as `${number}%`, backgroundColor: color }]} />

        <View style={styles.content}>
          <Text style={styles.label}>Rest</Text>
          <Text style={[styles.time, { color }]}>{timeStr}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setSeconds((s) => s + 30)}
            >
              <Text style={styles.addBtnText}>+30s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneBtn} onPress={onDismiss}>
              <Text style={styles.doneBtnText}>Done Resting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  bar: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    opacity: 0.08,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    fontVariant: ['tabular-nums'],
    flex: 1,
  },
  actions: { flexDirection: 'row', gap: Spacing.xs },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  doneBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accent,
  },
  doneBtnText: { fontSize: FontSize.sm, color: Colors.black, fontWeight: FontWeight.bold },
});
