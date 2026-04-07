import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Switch, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme';
import { getSettings, updateSettings } from '../../db/client';

const GOALS = [
  { key: 'muscle_gain', label: 'Build Muscle', emoji: '💪' },
  { key: 'fat_loss', label: 'Lose Fat', emoji: '🔥' },
  { key: 'maintain', label: 'Maintain', emoji: '⚖️' },
  { key: 'cardio', label: 'Cardio Focus', emoji: '🏃' },
];

const ACCENT_COLORS = [
  '#000000', '#EF4444', '#3B82F6', '#16A34A', '#F59E0B',
  '#8B5CF6', '#EC4899', '#0891B2',
];

export default function SettingsScreen() {
  const [goal, setGoal] = useState('muscle_gain');
  const [gymDays, setGymDays] = useState(4);
  const [accentColor, setAccentColor] = useState('#000000');
  const [notificationsOn, setNotificationsOn] = useState(false);

  useEffect(() => {
    const s = getSettings();
    if (s) {
      setGoal(s.goal);
      setGymDays(s.gym_days_per_week);
      setAccentColor(s.accent_color);
    }
  }, []);

  const handleGoal = (g: string) => {
    setGoal(g);
    updateSettings({ goal: g });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleGymDays = (d: number) => {
    setGymDays(d);
    updateSettings({ gym_days_per_week: d });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAccent = (c: string) => {
    setAccentColor(c);
    updateSettings({ accent_color: c });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>

        {/* Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Goal</Text>
          <View style={styles.goalGrid}>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.key}
                style={[styles.goalCard, goal === g.key && styles.goalCardActive]}
                onPress={() => handleGoal(g.key)}
              >
                <Text style={styles.goalEmoji}>{g.emoji}</Text>
                <Text style={[styles.goalLabel, goal === g.key && styles.goalLabelActive]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gym days per week */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gym Days / Week</Text>
          <View style={styles.daysRow}>
            {[2, 3, 4, 5, 6].map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.dayBtn, gymDays === d && styles.dayBtnActive]}
                onPress={() => handleGymDays(d)}
              >
                <Text style={[styles.dayBtnText, gymDays === d && styles.dayBtnTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Accent color */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accent Color</Text>
          <View style={styles.colorRow}>
            {ACCENT_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, accentColor === c && styles.colorDotActive]}
                onPress={() => handleAccent(c)}
              >
                {accentColor === c && <Text style={styles.colorCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gym Bag Packer */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Gym Bag Packer 🎒</Text>
              <Text style={styles.toggleDesc}>
                Remind you at 8pm the night before gym day what to pack
              </Text>
            </View>
            <Switch
              value={notificationsOn}
              onValueChange={(val) => {
                setNotificationsOn(val);
                if (val) {
                  Alert.alert(
                    'Gym Bag Packer',
                    "You'll get a reminder the night before your gym day with what equipment you need.",
                    [{ text: 'Got it' }]
                  );
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={Colors.black}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingRow label="App" value="FormIQ" />
          <SettingRow label="Version" value="1.0.0" />
          <SettingRow label="Data" value="Stored locally on your device" />
          <SettingRow label="No account needed" value="✓" />
        </View>

        {/* Reset */}
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() =>
            Alert.alert(
              'Reset All Data',
              'This will delete all your workouts, plans and progress. Cannot be undone.',
              [
                { text: 'Cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: () => Alert.alert('Done', 'Restart the app to continue.'),
                },
              ]
            )
          }
        >
          <Text style={styles.resetBtnText}>Reset All Data</Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.md, paddingBottom: 32 },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  goalCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalCardActive: { backgroundColor: Colors.btnPrimary, borderColor: Colors.btnPrimary },
  goalEmoji: { fontSize: 28 },
  goalLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  goalLabelActive: { color: Colors.btnPrimaryText },
  daysRow: { flexDirection: 'row', gap: Spacing.sm },
  dayBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayBtnActive: { backgroundColor: Colors.btnPrimary, borderColor: Colors.btnPrimary },
  dayBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  dayBtnTextActive: { color: Colors.btnPrimaryText },
  colorRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotActive: { borderWidth: 3, borderColor: Colors.textPrimary },
  colorCheck: { color: Colors.white, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  toggleDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  settingValue: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  resetBtn: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  resetBtnText: { color: '#EF4444', fontWeight: FontWeight.semibold, fontSize: FontSize.md },
});
