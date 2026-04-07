export const Colors = {
  // === Core backgrounds (pure Apple dark) ===
  background: '#000000',
  surface: '#111111',
  surfaceAlt: '#1C1C1E',
  surfaceHigh: '#2C2C2E',
  border: '#2C2C2E',
  borderLight: '#1C1C1E',

  // === Text ===
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',

  // === Core accents ===
  white: '#FFFFFF',
  black: '#000000',
  accent: '#00E676',         // electric green — primary CTA
  accentLight: '#00E67618',

  // === Workout type colors (vibrant on dark) ===
  gym: '#00E676',
  gymLight: '#00E67618',
  cardio: '#2979FF',
  cardioLight: '#2979FF18',
  swim: '#00B0FF',
  swimLight: '#00B0FF18',
  rest: '#48484A',
  restLight: '#1C1C1E',
  missed: '#FF5252',
  missedLight: '#FF525218',
  missedDark: '#FF5252',

  // === Muscle recovery ===
  recovering: '#FF5252',
  recoveringLight: '#FF525218',
  ready: '#00E676',
  readyLight: '#00E67618',

  // === Gradient stops (used with expo-linear-gradient) ===
  gradientStart: '#00E676',
  gradientMid: '#1DE9B6',
  gradientEnd: '#00B0FF',

  // === Glassmorphism overlay ===
  glass: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.10)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 34,
  hero: 48,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};
