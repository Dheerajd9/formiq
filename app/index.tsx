import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Platform, Linking, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

// On native, skip the landing and go straight to the app
if (Platform.OS !== 'web') {
  router.replace('/(tabs)');
}

const { width: W } = Dimensions.get('window');
const MAX_W = 680; // max content width on large screens

// ─── Feature data ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    emoji: '🫀',
    title: 'Muscle Map',
    desc: 'Tap any muscle on an interactive body map to instantly see exercises for it. Front and back view.',
    color: '#EF4444',
    gradient: ['#EF444420', '#EF444405'],
  },
  {
    emoji: '📋',
    title: 'Workout Planner',
    desc: 'Build a weekly plan with push/pull/legs templates. Set exercises, sets, and reps for every day.',
    color: '#2979FF',
    gradient: ['#2979FF20', '#2979FF05'],
  },
  {
    emoji: '✅',
    title: 'Live Workout Logger',
    desc: 'Log every set as you do it. See your last session\'s weights pre-filled. Get a 🏆 alert when you beat a PR.',
    color: '#00E676',
    gradient: ['#00E67620', '#00E67605'],
  },
  {
    emoji: '🏃',
    title: 'Cardio Tracker',
    desc: 'Log treadmill runs, cycling, rowing and more. Tracks distance, pace, speed, and calories burned.',
    color: '#00B0FF',
    gradient: ['#00B0FF20', '#00B0FF05'],
  },
  {
    emoji: '🧘',
    title: 'Stretch & Warm-Up',
    desc: '5 step-by-step stretch routines with hold timers. Full body, upper, lower, pre-run and quick 5-min.',
    color: '#BD7AFF',
    gradient: ['#BD7AFF20', '#BD7AFF05'],
  },
  {
    emoji: '🏋️',
    title: 'Plate Calculator',
    desc: 'Enter a target weight — instantly see which plates to load on each side. Color-coded like real gym plates.',
    color: '#FF6D00',
    gradient: ['#FF6D0020', '#FF6D0005'],
  },
  {
    emoji: '⚡',
    title: '1RM Calculator',
    desc: 'Enter weight + reps → see your estimated 1 rep max and a full training zone breakdown.',
    color: '#FFD600',
    gradient: ['#FFD60020', '#FFD60005'],
  },
  {
    emoji: '📊',
    title: 'Progress & Streaks',
    desc: '12-week activity heat map, muscle frequency tracker, personal records list, and 🔥 streak counter.',
    color: '#00E676',
    gradient: ['#00E67620', '#00E67605'],
  },
  {
    emoji: '🧠',
    title: 'Smart Suggestions',
    desc: '"What should I train today?" — analyzes your history and suggests the most-neglected muscle groups.',
    color: '#FF5252',
    gradient: ['#FF525220', '#FF525205'],
  },
];

const STEPS = [
  { n: '1', title: 'Open in Safari', desc: 'Visit formiq-navy.vercel.app on your iPhone', emoji: '🌐' },
  { n: '2', title: 'Tap Share ↑', desc: 'Hit the share icon at the bottom of Safari', emoji: '📤' },
  { n: '3', title: 'Add to Home Screen', desc: 'Tap "Add to Home Screen" → it works like a real app', emoji: '📱' },
];

const STATS = [
  { value: '80+', label: 'Exercises' },
  { value: '15', label: 'Muscle groups' },
  { value: '5', label: 'Stretch routines' },
  { value: '6', label: 'Cardio types' },
];

// ─── Animated entrance hook ───────────────────────────────────────────────────
function useEntrance(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(32)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 700, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ emoji, title, desc, color, gradient, delay }: typeof FEATURES[0] & { delay: number }) {
  const anim = useEntrance(delay);
  return (
    <Animated.View style={[fc.card, anim]}>
      <LinearGradient colors={gradient as [string, string]} style={fc.grad}>
        <View style={[fc.iconWrap, { borderColor: color + '40' }]}>
          <Text style={fc.icon}>{emoji}</Text>
        </View>
        <Text style={fc.title}>{title}</Text>
        <Text style={fc.desc}>{desc}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const fc = StyleSheet.create({
  card: { width: W > 600 ? '48%' : '100%' },
  grad: {
    borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: '#FFFFFF0D',
    gap: 12,
  },
  iconWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#FFFFFF08',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  icon: { fontSize: 26 },
  title: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  desc: { fontSize: 14, color: '#8E8E93', lineHeight: 21 },
});

// ─── Main landing page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const heroAnim = useEntrance(0);
  const subtitleAnim = useEntrance(150);
  const statsAnim = useEntrance(300);
  const ctaAnim = useEntrance(400);

  const handleOpen = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    router.push('/(tabs)');
  };

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── Nav ── */}
        <View style={s.nav}>
          <View style={s.navInner}>
            <Text style={s.navLogo}>
              <Text style={s.navLogoAccent}>Form</Text>IQ
            </Text>
            <TouchableOpacity style={s.navCta} onPress={handleOpen}>
              <Text style={s.navCtaText}>Open App →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hero ── */}
        <View style={s.hero}>
          {/* Background glow blobs */}
          <View style={[s.glow, s.glowGreen]} />
          <View style={[s.glow, s.glowBlue]} />

          <Animated.View style={[s.heroContent, heroAnim]}>
            <View style={s.badge}>
              <Text style={s.badgeDot}>●</Text>
              <Text style={s.badgeText}>Free · No account · Works offline</Text>
            </View>

            <Text style={s.heroTitle}>
              Your gym brain.{'\n'}
              <Text style={s.heroTitleAccent}>Plan. Log. Never</Text>
              {'\n'}wonder.
            </Text>

            <Animated.Text style={[s.heroSub, subtitleAnim]}>
              The fitness tracker that works exactly how you think at the gym —
              tap a muscle, see exercises, log your sets, track your runs,
              stretch properly and come home knowing you crushed it.
            </Animated.Text>

            {/* Stats row */}
            <Animated.View style={[s.statsRow, statsAnim]}>
              {STATS.map((st) => (
                <View key={st.label} style={s.stat}>
                  <Text style={s.statVal}>{st.value}</Text>
                  <Text style={s.statLabel}>{st.label}</Text>
                </View>
              ))}
            </Animated.View>

            {/* CTA buttons */}
            <Animated.View style={[s.ctaRow, ctaAnim]}>
              <TouchableOpacity onPress={handleOpen} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#00E676', '#1DE9B6']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.ctaPrimary}
                >
                  <Text style={s.ctaPrimaryText}>Start Tracking  →</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.ctaSecondary}
                onPress={() => Linking.openURL('https://github.com/Dheerajd9/formiq')}
                activeOpacity={0.7}
              >
                <Text style={s.ctaSecondaryText}>View on GitHub</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Hero mockup card */}
          <View style={s.mockupWrap}>
            <LinearGradient colors={['#1A1A1A', '#0D0D0D']} style={s.mockup}>
              {/* Fake phone screen preview */}
              <View style={s.mockupHeader}>
                <LinearGradient colors={['#00E676', '#1DE9B6']} style={s.mockupBar} />
                <Text style={s.mockupGreeting}>Good Morning</Text>
                <Text style={s.mockupDate}>Monday, April 7</Text>
              </View>
              <View style={s.mockupStatRow}>
                {[
                  { v: '14', l: 'Streak 🔥', c: '#00E676' },
                  { v: '5:32', l: 'Elapsed ⏱', c: '#00B0FF' },
                  { v: '3/6', l: 'Done 💪', c: '#BD7AFF' },
                ].map((s2) => (
                  <View key={s2.l} style={s.mockupStat}>
                    <Text style={[s.mockupStatVal, { color: s2.c }]}>{s2.v}</Text>
                    <Text style={s.mockupStatLabel}>{s2.l}</Text>
                  </View>
                ))}
              </View>
              <LinearGradient colors={['#00E676', '#1DE9B6']} style={s.mockupBtn}>
                <Text style={s.mockupBtnText}>🧠 What should I train today?</Text>
              </LinearGradient>
              {[
                { name: 'Bench Press', sets: '4×8 · 80kg', done: true },
                { name: 'Incline Dumbbell', sets: '3×10 · 26kg', done: true },
                { name: 'Cable Fly', sets: '3×12 · 15kg', done: false },
              ].map((ex) => (
                <View key={ex.name} style={s.mockupEx}>
                  <View style={[s.mockupExDot, ex.done && { backgroundColor: '#00E676' }]} />
                  <Text style={[s.mockupExName, ex.done && { color: '#48484A' }]}>{ex.name}</Text>
                  <Text style={s.mockupExSets}>{ex.sets}</Text>
                </View>
              ))}
              <View style={s.mockupFade} />
            </LinearGradient>
          </View>
        </View>

        {/* ── Section: Features ── */}
        <View style={s.section}>
          <Text style={s.sectionTag}>Everything you need</Text>
          <Text style={s.sectionTitle}>Built for the gym floor,{'\n'}not for the boardroom.</Text>
          <Text style={s.sectionSub}>
            No bloat, no subscriptions, no login. Open it in the gym and it just works.
          </Text>

          <View style={s.featuresGrid}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 60} />
            ))}
          </View>
        </View>

        {/* ── Section: How to install ── */}
        <View style={[s.section, s.installSection]}>
          <LinearGradient colors={['#00E67610', '#00B0FF08']} style={s.installGrad}>
            <Text style={s.sectionTag}>📱 iPhone / Android</Text>
            <Text style={s.sectionTitle}>Add to home screen.{'\n'}Feels like a real app.</Text>
            <Text style={s.sectionSub}>
              No App Store. No Google Play. Open in your browser and add it — done in 10 seconds.
            </Text>

            <View style={s.steps}>
              {STEPS.map((step) => (
                <View key={step.n} style={s.step}>
                  <View style={s.stepNumWrap}>
                    <LinearGradient colors={['#00E676', '#1DE9B6']} style={s.stepNum}>
                      <Text style={s.stepNumText}>{step.n}</Text>
                    </LinearGradient>
                    {step.n !== '3' && <View style={s.stepLine} />}
                  </View>
                  <View style={s.stepContent}>
                    <Text style={s.stepEmoji}>{step.emoji}</Text>
                    <View>
                      <Text style={s.stepTitle}>{step.title}</Text>
                      <Text style={s.stepDesc}>{step.desc}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={handleOpen} activeOpacity={0.85}>
              <LinearGradient
                colors={['#00E676', '#1DE9B6']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.installBtn}
              >
                <Text style={s.installBtnText}>Open FormIQ Now  →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* ── Section: Zero friction callouts ── */}
        <View style={s.section}>
          <View style={s.callouts}>
            {[
              { emoji: '🔒', title: 'No account needed', desc: 'Your data stays in your browser. No sign-up, no email, no password.' },
              { emoji: '📶', title: 'Works offline', desc: 'Log workouts without internet. Perfect for gyms with bad signal.' },
              { emoji: '💸', title: 'Completely free', desc: 'No premium tier. No ads. No limits. Everything unlocked, forever.' },
              { emoji: '🔓', title: 'Open source', desc: 'Full code on GitHub. See exactly how it works, fork it, improve it.' },
            ].map((c) => (
              <View key={c.title} style={s.callout}>
                <Text style={s.calloutEmoji}>{c.emoji}</Text>
                <Text style={s.calloutTitle}>{c.title}</Text>
                <Text style={s.calloutDesc}>{c.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Final CTA ── */}
        <View style={s.finalCta}>
          <LinearGradient colors={['#00E676', '#1DE9B6', '#00B0FF']} style={s.finalGradLine} />
          <Text style={s.finalTitle}>Ready to stop{'\n'}guessing at the gym?</Text>
          <Text style={s.finalSub}>Open FormIQ, start your warm-up, log your first set.</Text>
          <TouchableOpacity onPress={handleOpen} activeOpacity={0.85}>
            <LinearGradient
              colors={['#00E676', '#1DE9B6']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.finalBtn}
            >
              <Text style={s.finalBtnText}>Start Tracking Free  →</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={s.finalNote}>No account · No download · No credit card</Text>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Text style={s.footerLogo}>
            <Text style={s.navLogoAccent}>Form</Text>IQ
          </Text>
          <Text style={s.footerTagline}>Your gym brain — plan, log, never wonder.</Text>
          <View style={s.footerLinks}>
            <TouchableOpacity onPress={() => Linking.openURL('https://github.com/Dheerajd9/formiq')}>
              <Text style={s.footerLink}>GitHub</Text>
            </TouchableOpacity>
            <Text style={s.footerDot}>·</Text>
            <TouchableOpacity onPress={handleOpen}>
              <Text style={s.footerLink}>Open App</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.footerCopy}>Built with ❤️ · Free forever · Open source</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  scroll: { alignItems: 'center' },

  // Nav
  nav: {
    width: '100%', paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#FFFFFF0D',
    backgroundColor: '#00000099',
  },
  navInner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    maxWidth: MAX_W, width: '100%', alignSelf: 'center',
  },
  navLogo: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  navLogoAccent: { color: '#00E676' },
  navCta: {
    backgroundColor: '#FFFFFF0F', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 100, borderWidth: 1, borderColor: '#FFFFFF15',
  },
  navCtaText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },

  // Hero
  hero: {
    width: '100%', maxWidth: MAX_W, paddingHorizontal: 20,
    paddingTop: 60, paddingBottom: 40, alignItems: 'center', gap: 40,
  },
  glow: { position: 'absolute', borderRadius: 999, opacity: 0.15 },
  glowGreen: {
    width: 500, height: 500, backgroundColor: '#00E676',
    top: -100, left: -100,
    // blur not supported in RN — use opacity fade instead
  },
  glowBlue: { width: 400, height: 400, backgroundColor: '#00B0FF', top: 50, right: -150 },
  heroContent: { width: '100%', alignItems: 'center', gap: 24 },

  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#00E67612', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 100, borderWidth: 1, borderColor: '#00E67630',
  },
  badgeDot: { color: '#00E676', fontSize: 8 },
  badgeText: { fontSize: 12, color: '#00E676', fontWeight: '600' },

  heroTitle: {
    fontSize: W > 500 ? 52 : 40, fontWeight: '900', color: '#FFFFFF',
    textAlign: 'center', lineHeight: W > 500 ? 60 : 48, letterSpacing: -1.5,
  },
  heroTitleAccent: { color: '#00E676' },
  heroSub: {
    fontSize: 16, color: '#8E8E93', textAlign: 'center',
    lineHeight: 26, maxWidth: 460,
  },

  statsRow: {
    flexDirection: 'row', gap: 0,
    backgroundColor: '#FFFFFF08', borderRadius: 16,
    borderWidth: 1, borderColor: '#FFFFFF0D',
    overflow: 'hidden',
  },
  stat: {
    flex: 1, alignItems: 'center', paddingVertical: 16,
    borderRightWidth: 1, borderRightColor: '#FFFFFF0D',
  },
  statVal: { fontSize: 24, fontWeight: '800', color: '#00E676' },
  statLabel: { fontSize: 11, color: '#8E8E93', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

  ctaRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  ctaPrimary: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 100 },
  ctaPrimaryText: { fontSize: 16, fontWeight: '800', color: '#000000' },
  ctaSecondary: {
    paddingHorizontal: 24, paddingVertical: 16, borderRadius: 100,
    borderWidth: 1, borderColor: '#FFFFFF20',
    backgroundColor: '#FFFFFF08',
  },
  ctaSecondaryText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

  // Mockup
  mockupWrap: { width: '100%', maxWidth: 360, alignSelf: 'center' },
  mockup: {
    borderRadius: 28, padding: 24, gap: 14,
    borderWidth: 1, borderColor: '#FFFFFF12',
    overflow: 'hidden',
  },
  mockupHeader: { gap: 4 },
  mockupBar: { height: 2, width: 48, borderRadius: 1, marginBottom: 8 },
  mockupGreeting: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  mockupDate: { fontSize: 12, color: '#8E8E93' },
  mockupStatRow: {
    flexDirection: 'row', backgroundColor: '#FFFFFF08',
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#FFFFFF0D',
  },
  mockupStat: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  mockupStatVal: { fontSize: 18, fontWeight: '800' },
  mockupStatLabel: { fontSize: 10, color: '#48484A', marginTop: 2 },
  mockupBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  mockupBtnText: { fontSize: 13, fontWeight: '700', color: '#000000' },
  mockupEx: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 6,
  },
  mockupExDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2C2C2E' },
  mockupExName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  mockupExSets: { fontSize: 11, color: '#48484A' },
  mockupFade: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
    backgroundColor: '#0D0D0D',
    opacity: 0.8,
  },

  // Sections
  section: { width: '100%', maxWidth: MAX_W, paddingHorizontal: 20, paddingVertical: 60 },
  sectionTag: {
    fontSize: 12, fontWeight: '700', color: '#00E676',
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12,
  },
  sectionTitle: {
    fontSize: W > 500 ? 40 : 32, fontWeight: '800', color: '#FFFFFF',
    lineHeight: W > 500 ? 48 : 40, letterSpacing: -0.8, marginBottom: 12,
  },
  sectionSub: { fontSize: 16, color: '#8E8E93', lineHeight: 26, marginBottom: 40, maxWidth: 500 },
  featuresGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12,
  },

  // Install section
  installSection: { paddingVertical: 0, marginBottom: 60 },
  installGrad: {
    borderRadius: 28, padding: 32,
    borderWidth: 1, borderColor: '#FFFFFF0D',
    gap: 24,
  },
  steps: { gap: 0 },
  step: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', minHeight: 80 },
  stepNumWrap: { alignItems: 'center', gap: 0 },
  stepNum: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: 16, fontWeight: '800', color: '#000000' },
  stepLine: { width: 2, flex: 1, minHeight: 24, backgroundColor: '#00E67630', marginVertical: 4 },
  stepContent: { flex: 1, flexDirection: 'row', gap: 12, paddingBottom: 24 },
  stepEmoji: { fontSize: 28, marginTop: 2 },
  stepTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  stepDesc: { fontSize: 14, color: '#8E8E93', lineHeight: 20 },
  installBtn: { borderRadius: 100, paddingVertical: 16, alignItems: 'center' },
  installBtnText: { fontSize: 16, fontWeight: '800', color: '#000000' },

  // Callouts
  callouts: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  callout: {
    width: W > 600 ? '47%' : '100%',
    backgroundColor: '#FFFFFF05', borderRadius: 20,
    padding: 24, gap: 8,
    borderWidth: 1, borderColor: '#FFFFFF0A',
  },
  calloutEmoji: { fontSize: 28 },
  calloutTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  calloutDesc: { fontSize: 14, color: '#8E8E93', lineHeight: 21 },

  // Final CTA
  finalCta: {
    width: '100%', maxWidth: MAX_W, paddingHorizontal: 20,
    paddingTop: 60, paddingBottom: 80, alignItems: 'center', gap: 20,
  },
  finalGradLine: { height: 3, width: 80, borderRadius: 2 },
  finalTitle: {
    fontSize: W > 500 ? 48 : 36, fontWeight: '900', color: '#FFFFFF',
    textAlign: 'center', lineHeight: W > 500 ? 56 : 44, letterSpacing: -1,
  },
  finalSub: { fontSize: 16, color: '#8E8E93', textAlign: 'center', lineHeight: 26 },
  finalBtn: { paddingHorizontal: 40, paddingVertical: 18, borderRadius: 100 },
  finalBtnText: { fontSize: 18, fontWeight: '800', color: '#000000' },
  finalNote: { fontSize: 12, color: '#48484A' },

  // Footer
  footer: {
    width: '100%', alignItems: 'center', gap: 8,
    paddingVertical: 40, paddingHorizontal: 20,
    borderTopWidth: 1, borderTopColor: '#FFFFFF0D',
  },
  footerLogo: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  footerTagline: { fontSize: 13, color: '#48484A' },
  footerLinks: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 },
  footerLink: { fontSize: 13, color: '#8E8E93' },
  footerDot: { color: '#48484A' },
  footerCopy: { fontSize: 12, color: '#2C2C2E', marginTop: 8 },
});
