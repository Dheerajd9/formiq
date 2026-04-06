export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'lats'
  | 'traps'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'neck'
  | 'cardio';

export type Equipment = 'dumbbell' | 'barbell' | 'machine' | 'cable' | 'bodyweight' | 'resistance_band';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  secondary_muscles: string[];
  equipment: Equipment;
  instructions: string[];
  video_url: string | null; // YouTube embed URL
  difficulty: Difficulty;
  sets_default: number;
  reps_default: number;
}

export const MUSCLE_GROUPS: { key: MuscleGroup; label: string; emoji: string; color: string }[] = [
  { key: 'chest',      label: 'Chest',      emoji: '🫁', color: '#EF4444' },
  { key: 'back',       label: 'Back',       emoji: '🔙', color: '#3B82F6' },
  { key: 'lats',       label: 'Lats',       emoji: '🦅', color: '#2563EB' },
  { key: 'traps',      label: 'Traps',      emoji: '🏔️', color: '#6366F1' },
  { key: 'shoulders',  label: 'Shoulders',  emoji: '💠', color: '#8B5CF6' },
  { key: 'biceps',     label: 'Biceps',     emoji: '💪', color: '#F59E0B' },
  { key: 'triceps',    label: 'Triceps',    emoji: '🔱', color: '#D97706' },
  { key: 'forearms',   label: 'Forearms',   emoji: '🤜', color: '#92400E' },
  { key: 'core',       label: 'Core / Abs', emoji: '🎯', color: '#10B981' },
  { key: 'glutes',     label: 'Glutes',     emoji: '🍑', color: '#EC4899' },
  { key: 'quads',      label: 'Quads',      emoji: '🦵', color: '#F43F5E' },
  { key: 'hamstrings', label: 'Hamstrings', emoji: '🦿', color: '#BE185D' },
  { key: 'calves',     label: 'Calves',     emoji: '🦶', color: '#9D174D' },
  { key: 'neck',       label: 'Neck',       emoji: '🦒', color: '#78716C' },
  { key: 'cardio',     label: 'Cardio',     emoji: '🏃', color: '#0EA5E9' },
];

export const EQUIPMENT_LIST: { key: Equipment; label: string; emoji: string }[] = [
  { key: 'bodyweight',     label: 'Bodyweight', emoji: '🤸' },
  { key: 'dumbbell',       label: 'Dumbbell',   emoji: '🏋️' },
  { key: 'barbell',        label: 'Barbell',    emoji: '🏋️' },
  { key: 'machine',        label: 'Machine',    emoji: '⚙️' },
  { key: 'cable',          label: 'Cable',      emoji: '🔗' },
  { key: 'resistance_band',label: 'Bands',      emoji: '🎗️' },
];

// YouTube embed base: https://www.youtube.com/embed/{VIDEO_ID}
// We store the embed URL directly for use in a WebView

export const EXERCISES: Exercise[] = [

  // ─── CHEST ────────────────────────────────────────────────────────────────
  {
    id: 'chest_001', name: 'Push-Up', muscle_group: 'chest',
    secondary_muscles: ['triceps', 'shoulders', 'core'],
    equipment: 'bodyweight', difficulty: 'beginner',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/IODxDxX7oi4',
    instructions: [
      'Start in a high plank, hands shoulder-width apart, body in a straight line.',
      'Lower your chest to just above the floor, elbows at ~45°.',
      'Press back up to the start.',
      'Keep your core braced and hips level throughout.',
    ],
  },
  {
    id: 'chest_002', name: 'Barbell Bench Press', muscle_group: 'chest',
    secondary_muscles: ['triceps', 'front delts'],
    equipment: 'barbell', difficulty: 'intermediate',
    sets_default: 4, reps_default: 8,
    video_url: 'https://www.youtube.com/embed/SCVCLChPQFY',
    instructions: [
      'Lie flat on bench, grip bar slightly wider than shoulder-width.',
      'Unrack and lower the bar to your mid-chest with control.',
      'Press the bar up until arms are fully extended.',
      'Keep feet flat, maintain slight arch in lower back.',
    ],
  },
  {
    id: 'chest_003', name: 'Dumbbell Flat Press', muscle_group: 'chest',
    secondary_muscles: ['triceps', 'front delts'],
    equipment: 'dumbbell', difficulty: 'beginner',
    sets_default: 3, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/VmB1G1K7v94',
    instructions: [
      'Lie on a flat bench, dumbbells at chest level, palms facing forward.',
      'Press both dumbbells up until arms are extended, then bring them slightly together.',
      'Lower back to chest level slowly.',
    ],
  },
  {
    id: 'chest_004', name: 'Incline Dumbbell Press', muscle_group: 'chest',
    secondary_muscles: ['front delts', 'triceps'],
    equipment: 'dumbbell', difficulty: 'intermediate',
    sets_default: 3, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/8iPEnn-ltC8',
    instructions: [
      'Set bench to 30-45°. Sit back with dumbbells at chest level.',
      'Press the dumbbells up and slightly inward.',
      'Lower slowly, feeling the upper chest stretch.',
    ],
  },
  {
    id: 'chest_005', name: 'Dumbbell Flyes', muscle_group: 'chest',
    secondary_muscles: ['front delts'],
    equipment: 'dumbbell', difficulty: 'intermediate',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/eozdVDA78K0',
    instructions: [
      'Lie on flat bench, dumbbells above chest, palms facing each other, slight bend in elbows.',
      'Lower dumbbells in a wide arc to chest height.',
      'Squeeze chest and bring them back together.',
    ],
  },
  {
    id: 'chest_006', name: 'Cable Chest Fly', muscle_group: 'chest',
    secondary_muscles: ['front delts'],
    equipment: 'cable', difficulty: 'beginner',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/Iwe6AmxVf7o',
    instructions: [
      'Set cables at shoulder height. Stand in the center with one handle in each hand.',
      'Step forward slightly, arms wide.',
      'Bring hands together in front of your chest in a hugging arc.',
      'Return slowly to the start.',
    ],
  },
  {
    id: 'chest_007', name: 'Chest Press Machine', muscle_group: 'chest',
    secondary_muscles: ['triceps'],
    equipment: 'machine', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/xUm0BiZCX_I',
    instructions: [
      'Sit with back flat against the pad, grip handles at chest level.',
      'Press forward until arms are extended.',
      'Return slowly — don\'t let the weight stack touch between reps.',
    ],
  },
  {
    id: 'chest_008', name: 'Diamond Push-Up', muscle_group: 'chest',
    secondary_muscles: ['triceps'],
    equipment: 'bodyweight', difficulty: 'intermediate',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/J0DnG1_S92I',
    instructions: [
      'Form a diamond shape with your index fingers and thumbs on the floor.',
      'Lower your chest to your hands.',
      'Press back up. Targets the inner chest and triceps.',
    ],
  },

  // ─── BACK ─────────────────────────────────────────────────────────────────
  {
    id: 'back_001', name: 'Barbell Bent-Over Row', muscle_group: 'back',
    secondary_muscles: ['biceps', 'rear delts', 'lats'],
    equipment: 'barbell', difficulty: 'intermediate',
    sets_default: 4, reps_default: 8,
    video_url: 'https://www.youtube.com/embed/FWJR5Ve8bnQ',
    instructions: [
      'Hinge at hips with flat back, grip bar slightly wider than shoulders.',
      'Pull the bar to your lower chest, squeezing shoulder blades together.',
      'Lower with control.',
    ],
  },
  {
    id: 'back_002', name: 'Dumbbell Single-Arm Row', muscle_group: 'back',
    secondary_muscles: ['biceps', 'lats'],
    equipment: 'dumbbell', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/pYcpY20QaE8',
    instructions: [
      'Place one knee and hand on a bench. Other hand grips a dumbbell.',
      'Row the dumbbell to your hip, keeping elbow close to your body.',
      'Lower slowly. Repeat on both sides.',
    ],
  },
  {
    id: 'back_003', name: 'Seated Cable Row', muscle_group: 'back',
    secondary_muscles: ['biceps', 'rear delts'],
    equipment: 'cable', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/GZbfZ033f74',
    instructions: [
      'Sit at a cable row, feet on platform, back straight.',
      'Pull handle to your lower abdomen, squeezing shoulder blades.',
      'Return slowly — don\'t round your back.',
    ],
  },
  {
    id: 'back_004', name: 'T-Bar Row', muscle_group: 'back',
    secondary_muscles: ['biceps', 'lats', 'traps'],
    equipment: 'barbell', difficulty: 'intermediate',
    sets_default: 4, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/j3Igk5nyZE4',
    instructions: [
      'Straddle a barbell anchored at one end. Grip with both hands close together.',
      'Hinge forward and row the bar to your chest.',
      'Lower with control.',
    ],
  },
  {
    id: 'back_005', name: 'Chest-Supported Row (Machine)', muscle_group: 'back',
    secondary_muscles: ['biceps', 'rear delts'],
    equipment: 'machine', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/xQNrFHEMhI4',
    instructions: [
      'Lie chest-down on the pad, grip handles.',
      'Row handles toward your body, squeezing shoulder blades.',
      'Lower slowly.',
    ],
  },

  // ─── LATS ─────────────────────────────────────────────────────────────────
  {
    id: 'lats_001', name: 'Pull-Up', muscle_group: 'lats',
    secondary_muscles: ['biceps', 'rear delts', 'core'],
    equipment: 'bodyweight', difficulty: 'intermediate',
    sets_default: 3, reps_default: 8,
    video_url: 'https://www.youtube.com/embed/eGo4IYlbE5g',
    instructions: [
      'Hang from a bar, hands slightly wider than shoulders, palms facing away.',
      'Pull up until chin clears the bar, leading with your elbows.',
      'Lower slowly to a full hang.',
    ],
  },
  {
    id: 'lats_002', name: 'Chin-Up', muscle_group: 'lats',
    secondary_muscles: ['biceps', 'core'],
    equipment: 'bodyweight', difficulty: 'intermediate',
    sets_default: 3, reps_default: 8,
    video_url: 'https://www.youtube.com/embed/52KE4H4mKiE',
    instructions: [
      'Hang from a bar, palms facing toward you, hands shoulder-width.',
      'Pull up until your chin passes the bar.',
      'Lower with control.',
    ],
  },
  {
    id: 'lats_003', name: 'Lat Pulldown', muscle_group: 'lats',
    secondary_muscles: ['biceps', 'rear delts'],
    equipment: 'cable', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/CAwf7n6Luuc',
    instructions: [
      'Sit at a lat pulldown machine, grip bar wide, palms facing away.',
      'Pull bar down to upper chest, driving elbows down and back.',
      'Return slowly — let your lats stretch at the top.',
    ],
  },
  {
    id: 'lats_004', name: 'Close-Grip Lat Pulldown', muscle_group: 'lats',
    secondary_muscles: ['biceps'],
    equipment: 'cable', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/VkSBdFVBtHk',
    instructions: [
      'Use a V-bar or close-grip attachment.',
      'Pull the handle to your upper chest, leaning back slightly.',
      'Squeeze lats at the bottom, return slowly.',
    ],
  },
  {
    id: 'lats_005', name: 'Straight-Arm Pulldown', muscle_group: 'lats',
    secondary_muscles: ['core'],
    equipment: 'cable', difficulty: 'beginner',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/ID1BDsgroTg',
    instructions: [
      'Stand at a high cable, grip a bar with straight arms.',
      'Pull the bar down to your thighs in an arc, keeping arms straight.',
      'Return slowly — great lat isolation.',
    ],
  },

  // ─── TRAPS ────────────────────────────────────────────────────────────────
  {
    id: 'traps_001', name: 'Barbell Shrug', muscle_group: 'traps',
    secondary_muscles: ['neck'],
    equipment: 'barbell', difficulty: 'beginner',
    sets_default: 4, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/g6qbq4Lf1FI',
    instructions: [
      'Stand holding a barbell at hip level, arms straight.',
      'Shrug shoulders as high as possible toward your ears.',
      'Hold 1 second at the top, lower slowly.',
    ],
  },
  {
    id: 'traps_002', name: 'Dumbbell Shrug', muscle_group: 'traps',
    secondary_muscles: ['neck'],
    equipment: 'dumbbell', difficulty: 'beginner',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/cJRVVxmytaM',
    instructions: [
      'Stand holding dumbbells at your sides.',
      'Shrug shoulders straight up toward ears.',
      'Squeeze at the top, lower slowly.',
    ],
  },
  {
    id: 'traps_003', name: 'Upright Row', muscle_group: 'traps',
    secondary_muscles: ['shoulders', 'biceps'],
    equipment: 'barbell', difficulty: 'intermediate',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/VIoioPDdPfw',
    instructions: [
      'Hold a barbell with an overhand grip, hands shoulder-width.',
      'Pull the bar straight up to chin level, elbows flaring out.',
      'Lower slowly.',
    ],
  },
  {
    id: 'traps_004', name: 'Face Pull', muscle_group: 'traps',
    secondary_muscles: ['rear delts', 'rotator cuff'],
    equipment: 'cable', difficulty: 'beginner',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/rep-qVOkqgk',
    instructions: [
      'Set a cable at face height with a rope attachment.',
      'Pull the rope toward your face, separating hands at the end.',
      'Hold briefly — excellent for rear delts and traps.',
    ],
  },

  // ─── SHOULDERS ────────────────────────────────────────────────────────────
  {
    id: 'shoulders_001', name: 'Barbell Overhead Press', muscle_group: 'shoulders',
    secondary_muscles: ['triceps', 'traps', 'core'],
    equipment: 'barbell', difficulty: 'intermediate',
    sets_default: 4, reps_default: 8,
    video_url: 'https://www.youtube.com/embed/2yjwXTZQDDI',
    instructions: [
      'Stand with bar at collarbone level, grip just outside shoulders.',
      'Press bar directly overhead until arms are locked out.',
      'Lower back to collarbone with control.',
    ],
  },
  {
    id: 'shoulders_002', name: 'Dumbbell Shoulder Press', muscle_group: 'shoulders',
    secondary_muscles: ['triceps', 'traps'],
    equipment: 'dumbbell', difficulty: 'beginner',
    sets_default: 3, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/qEwKCR5JCog',
    instructions: [
      'Sit or stand with dumbbells at shoulder level, palms facing forward.',
      'Press both dumbbells overhead until arms are extended.',
      'Lower slowly back to shoulders.',
    ],
  },
  {
    id: 'shoulders_003', name: 'Dumbbell Lateral Raise', muscle_group: 'shoulders',
    secondary_muscles: [],
    equipment: 'dumbbell', difficulty: 'beginner',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/3VcKaXpzqRo',
    instructions: [
      'Stand holding dumbbells at your sides.',
      'Raise both arms out to the sides to shoulder height, slight bend in elbows.',
      'Lower slowly — don\'t use momentum.',
    ],
  },
  {
    id: 'shoulders_004', name: 'Arnold Press', muscle_group: 'shoulders',
    secondary_muscles: ['triceps', 'front delts'],
    equipment: 'dumbbell', difficulty: 'intermediate',
    sets_default: 3, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/6Z15_WdXmVw',
    instructions: [
      'Hold dumbbells in front of you, palms facing you, elbows bent.',
      'As you press up, rotate palms to face forward.',
      'Lower and rotate back to the starting position.',
    ],
  },
  {
    id: 'shoulders_005', name: 'Front Raise', muscle_group: 'shoulders',
    secondary_muscles: ['chest'],
    equipment: 'dumbbell', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/gkSBVb3gP8c',
    instructions: [
      'Stand with dumbbells in front of thighs.',
      'Raise one or both arms straight in front to shoulder height.',
      'Lower slowly.',
    ],
  },
  {
    id: 'shoulders_006', name: 'Cable Lateral Raise', muscle_group: 'shoulders',
    secondary_muscles: [],
    equipment: 'cable', difficulty: 'beginner',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/PPRPaFWMEAQ',
    instructions: [
      'Stand beside a low cable, grip handle with the far hand.',
      'Raise your arm out to shoulder height.',
      'Lower slowly. Cables keep constant tension throughout.',
    ],
  },

  // ─── BICEPS ───────────────────────────────────────────────────────────────
  {
    id: 'biceps_001', name: 'Barbell Curl', muscle_group: 'biceps',
    secondary_muscles: ['forearms'],
    equipment: 'barbell', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/ykJmrZ5v0Oo',
    instructions: [
      'Stand gripping barbell shoulder-width, underhand grip.',
      'Curl the bar to shoulder height, keeping elbows at your sides.',
      'Squeeze bicep at the top. Lower slowly.',
    ],
  },
  {
    id: 'biceps_002', name: 'Dumbbell Curl', muscle_group: 'biceps',
    secondary_muscles: ['forearms'],
    equipment: 'dumbbell', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/sAq_ocpRh_I',
    instructions: [
      'Stand with dumbbells at sides, palms forward.',
      'Curl both (or alternating) dumbbells to shoulder level.',
      'Squeeze at top, lower slowly.',
    ],
  },
  {
    id: 'biceps_003', name: 'Hammer Curl', muscle_group: 'biceps',
    secondary_muscles: ['forearms', 'brachialis'],
    equipment: 'dumbbell', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/zC3nLlEvin4',
    instructions: [
      'Hold dumbbells with neutral grip (palms facing each other).',
      'Curl up while keeping the neutral grip throughout.',
      'Targets the brachialis for arm thickness.',
    ],
  },
  {
    id: 'biceps_004', name: 'Preacher Curl', muscle_group: 'biceps',
    secondary_muscles: [],
    equipment: 'machine', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/fIWP-FRFNU0',
    instructions: [
      'Sit at a preacher bench, upper arms resting on the pad.',
      'Curl the bar up to shoulder level.',
      'Lower fully — the stretch at the bottom is key.',
    ],
  },
  {
    id: 'biceps_005', name: 'Cable Bicep Curl', muscle_group: 'biceps',
    secondary_muscles: ['forearms'],
    equipment: 'cable', difficulty: 'beginner',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/NFzTWp2qpiE',
    instructions: [
      'Stand at a low cable with a straight bar or EZ bar.',
      'Curl the bar up keeping elbows at your sides.',
      'The cable maintains constant tension throughout the movement.',
    ],
  },
  {
    id: 'biceps_006', name: 'Incline Dumbbell Curl', muscle_group: 'biceps',
    secondary_muscles: [],
    equipment: 'dumbbell', difficulty: 'intermediate',
    sets_default: 3, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/soxrZlIl35U',
    instructions: [
      'Set bench to 45-60°. Sit back, arms hanging straight.',
      'Curl both dumbbells up — the stretched starting position maximizes bicep activation.',
      'Lower fully between reps.',
    ],
  },

  // ─── TRICEPS ──────────────────────────────────────────────────────────────
  {
    id: 'triceps_001', name: 'Tricep Dip', muscle_group: 'triceps',
    secondary_muscles: ['chest', 'front delts'],
    equipment: 'bodyweight', difficulty: 'intermediate',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/0326dy_-CzM',
    instructions: [
      'Grip parallel bars, arms straight, body upright.',
      'Lower by bending elbows until upper arms are parallel to floor.',
      'Press back up. Keep torso upright to target triceps.',
    ],
  },
  {
    id: 'triceps_002', name: 'Skull Crusher', muscle_group: 'triceps',
    secondary_muscles: [],
    equipment: 'barbell', difficulty: 'intermediate',
    sets_default: 3, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/d_KZxkY_0cM',
    instructions: [
      'Lie on a bench, hold EZ bar above chest with arms extended.',
      'Lower the bar toward your forehead by bending only at the elbows.',
      'Extend arms back up. Keep upper arms vertical.',
    ],
  },
  {
    id: 'triceps_003', name: 'Cable Tricep Pushdown', muscle_group: 'triceps',
    secondary_muscles: [],
    equipment: 'cable', difficulty: 'beginner',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/2-LAMcpzODU',
    instructions: [
      'Stand at a high cable with a bar or rope attachment.',
      'Push the attachment down until arms are fully extended.',
      'Keep elbows pinned at your sides throughout.',
    ],
  },
  {
    id: 'triceps_004', name: 'Overhead Tricep Extension', muscle_group: 'triceps',
    secondary_muscles: [],
    equipment: 'dumbbell', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/YbX7Wd8jQ-Q',
    instructions: [
      'Hold one dumbbell with both hands overhead, arms extended.',
      'Lower the dumbbell behind your head by bending at the elbows.',
      'Press back up. Great long-head tricep stretch.',
    ],
  },
  {
    id: 'triceps_005', name: 'Close-Grip Bench Press', muscle_group: 'triceps',
    secondary_muscles: ['chest', 'front delts'],
    equipment: 'barbell', difficulty: 'intermediate',
    sets_default: 3, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/nEF0bv2FW94',
    instructions: [
      'Lie on bench, grip bar shoulder-width (narrower than bench press).',
      'Lower the bar to your lower chest, keeping elbows close to body.',
      'Press back up. This shifts work to the triceps.',
    ],
  },
  {
    id: 'triceps_006', name: 'Diamond Push-Up', muscle_group: 'triceps',
    secondary_muscles: ['chest'],
    equipment: 'bodyweight', difficulty: 'intermediate',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/J0DnG1_S92I',
    instructions: [
      'Form a diamond with your thumbs and index fingers on the floor.',
      'Lower your chest to your hands, elbows flaring back.',
      'Press back up. Heavily targets triceps.',
    ],
  },

  // ─── FOREARMS ─────────────────────────────────────────────────────────────
  {
    id: 'forearms_001', name: 'Wrist Curl', muscle_group: 'forearms',
    secondary_muscles: [],
    equipment: 'barbell', difficulty: 'beginner',
    sets_default: 3, reps_default: 20,
    video_url: 'https://www.youtube.com/embed/J3B2PVuuGLg',
    instructions: [
      'Sit, rest forearms on thighs, hold a barbell palms up.',
      'Lower the barbell by extending your wrists.',
      'Curl wrists back up. Full range of motion.',
    ],
  },
  {
    id: 'forearms_002', name: 'Reverse Wrist Curl', muscle_group: 'forearms',
    secondary_muscles: [],
    equipment: 'barbell', difficulty: 'beginner',
    sets_default: 3, reps_default: 20,
    video_url: 'https://www.youtube.com/embed/FLGh5RWr_G4',
    instructions: [
      'Same setup but palms facing down (overhand grip).',
      'Extend and curl your wrists against resistance.',
      'Works the extensor muscles on the top of the forearm.',
    ],
  },
  {
    id: 'forearms_003', name: 'Farmer\'s Carry', muscle_group: 'forearms',
    secondary_muscles: ['traps', 'core', 'shoulders'],
    equipment: 'dumbbell', difficulty: 'beginner',
    sets_default: 3, reps_default: 30,
    video_url: 'https://www.youtube.com/embed/Fkzk_RqlYig',
    instructions: [
      'Hold heavy dumbbells at your sides.',
      'Walk for a set distance or time with an upright posture.',
      'Excellent for grip, forearms, and overall strength.',
    ],
  },
  {
    id: 'forearms_004', name: 'Reverse Barbell Curl', muscle_group: 'forearms',
    secondary_muscles: ['biceps'],
    equipment: 'barbell', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/nRgxYX2Ve9w',
    instructions: [
      'Hold a barbell with an overhand grip.',
      'Curl the bar to shoulder height.',
      'Hits forearm extensors and brachioradialis hard.',
    ],
  },

  // ─── CORE / ABS ───────────────────────────────────────────────────────────
  {
    id: 'core_001', name: 'Plank', muscle_group: 'core',
    secondary_muscles: ['shoulders', 'glutes'],
    equipment: 'bodyweight', difficulty: 'beginner',
    sets_default: 3, reps_default: 45,
    video_url: 'https://www.youtube.com/embed/ASdvN_XEl_c',
    instructions: [
      'Forearm plank position — elbows under shoulders, body straight.',
      'Brace core hard, squeeze glutes.',
      'Hold for target time. Don\'t let hips sag or rise.',
    ],
  },
  {
    id: 'core_002', name: 'Crunches', muscle_group: 'core',
    secondary_muscles: [],
    equipment: 'bodyweight', difficulty: 'beginner',
    sets_default: 3, reps_default: 20,
    video_url: 'https://www.youtube.com/embed/Xyd_fa5zoEU',
    instructions: [
      'Lie back, knees bent, hands behind head.',
      'Lift shoulders off the floor by contracting abs.',
      'Lower without resting head on floor between reps.',
    ],
  },
  {
    id: 'core_003', name: 'Leg Raises', muscle_group: 'core',
    secondary_muscles: ['hip flexors'],
    equipment: 'bodyweight', difficulty: 'intermediate',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/JB2oyawG9KI',
    instructions: [
      'Lie flat on your back, legs straight.',
      'Raise both legs to 90°.',
      'Lower slowly without touching the floor. Keep lower back pressed down.',
    ],
  },
  {
    id: 'core_004', name: 'Russian Twist', muscle_group: 'core',
    secondary_muscles: ['obliques'],
    equipment: 'bodyweight', difficulty: 'intermediate',
    sets_default: 3, reps_default: 20,
    video_url: 'https://www.youtube.com/embed/wkD8rjkodUI',
    instructions: [
      'Sit with knees bent, lean back slightly, feet off floor.',
      'Twist torso left then right — one full twist = one rep.',
      'Add a weight plate or dumbbell to increase difficulty.',
    ],
  },
  {
    id: 'core_005', name: 'Ab Wheel Rollout', muscle_group: 'core',
    secondary_muscles: ['shoulders', 'lats'],
    equipment: 'bodyweight', difficulty: 'advanced',
    sets_default: 3, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/bKYGFPrFM1s',
    instructions: [
      'Kneel on floor with ab wheel in hands.',
      'Roll forward until body is near parallel to floor.',
      'Contract core and pull back to start.',
    ],
  },
  {
    id: 'core_006', name: 'Hanging Knee Raise', muscle_group: 'core',
    secondary_muscles: ['hip flexors'],
    equipment: 'bodyweight', difficulty: 'intermediate',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/Pr1ieGZ5atk',
    instructions: [
      'Hang from a pull-up bar.',
      'Raise knees to chest, curling hips up.',
      'Lower slowly — avoid swinging.',
    ],
  },
  {
    id: 'core_007', name: 'Cable Crunch', muscle_group: 'core',
    secondary_muscles: [],
    equipment: 'cable', difficulty: 'beginner',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/2fbujeH3F0E',
    instructions: [
      'Kneel at a high cable with rope attachment, hold rope behind head.',
      'Crunch downward, bringing elbows toward knees.',
      'Return slowly. Great weighted ab exercise.',
    ],
  },

  // ─── GLUTES ───────────────────────────────────────────────────────────────
  {
    id: 'glutes_001', name: 'Barbell Hip Thrust', muscle_group: 'glutes',
    secondary_muscles: ['hamstrings', 'quads'],
    equipment: 'barbell', difficulty: 'intermediate',
    sets_default: 4, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/SEdqd1n0cvg',
    instructions: [
      'Sit with upper back against a bench, barbell across hips.',
      'Drive hips up until body is in a straight line.',
      'Squeeze glutes hard at the top. Lower slowly.',
    ],
  },
  {
    id: 'glutes_002', name: 'Glute Bridge', muscle_group: 'glutes',
    secondary_muscles: ['hamstrings', 'core'],
    equipment: 'bodyweight', difficulty: 'beginner',
    sets_default: 3, reps_default: 20,
    video_url: 'https://www.youtube.com/embed/OUgsJ8-Vi0E',
    instructions: [
      'Lie on your back, knees bent, feet flat on floor.',
      'Drive hips up by squeezing glutes.',
      'Hold at top for 1 second, lower slowly.',
    ],
  },
  {
    id: 'glutes_003', name: 'Bulgarian Split Squat', muscle_group: 'glutes',
    secondary_muscles: ['quads', 'hamstrings'],
    equipment: 'dumbbell', difficulty: 'intermediate',
    sets_default: 3, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/2C-uNgKwPLE',
    instructions: [
      'Rest rear foot on a bench, hold dumbbells at sides.',
      'Lower your back knee toward the floor.',
      'Drive through the front heel to return. Repeat each side.',
    ],
  },
  {
    id: 'glutes_004', name: 'Cable Kickback', muscle_group: 'glutes',
    secondary_muscles: ['hamstrings'],
    equipment: 'cable', difficulty: 'beginner',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/Ex-YHBcAOC0',
    instructions: [
      'Attach ankle strap to low cable. Face the machine.',
      'Kick leg backward and upward, squeezing glute at top.',
      'Lower slowly. Repeat on both sides.',
    ],
  },
  {
    id: 'glutes_005', name: 'Donkey Kick', muscle_group: 'glutes',
    secondary_muscles: ['core'],
    equipment: 'bodyweight', difficulty: 'beginner',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/SJ1Xuz9D-ZQ',
    instructions: [
      'Start on all fours. Keep core braced.',
      'Kick one leg back and up, keeping knee at 90°.',
      'Squeeze glute at the top. Lower and repeat.',
    ],
  },

  // ─── QUADS ────────────────────────────────────────────────────────────────
  {
    id: 'quads_001', name: 'Barbell Back Squat', muscle_group: 'quads',
    secondary_muscles: ['glutes', 'hamstrings', 'core'],
    equipment: 'barbell', difficulty: 'intermediate',
    sets_default: 4, reps_default: 8,
    video_url: 'https://www.youtube.com/embed/bEv6CCg2BC8',
    instructions: [
      'Bar on upper back, feet shoulder-width, toes slightly out.',
      'Squat down until thighs are parallel to floor.',
      'Drive through heels to stand. Keep chest up throughout.',
    ],
  },
  {
    id: 'quads_002', name: 'Bodyweight Squat', muscle_group: 'quads',
    secondary_muscles: ['glutes', 'core'],
    equipment: 'bodyweight', difficulty: 'beginner',
    sets_default: 3, reps_default: 20,
    video_url: 'https://www.youtube.com/embed/aclHkVaku9U',
    instructions: [
      'Stand feet shoulder-width, toes slightly out.',
      'Lower into a squat, keeping chest up and knees tracking toes.',
      'Return to standing.',
    ],
  },
  {
    id: 'quads_003', name: 'Leg Press', muscle_group: 'quads',
    secondary_muscles: ['glutes', 'hamstrings'],
    equipment: 'machine', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/IZxyjW7MPJQ',
    instructions: [
      'Sit in leg press machine, feet hip-width on platform.',
      'Release safety and lower platform toward your chest.',
      'Press back up without locking knees.',
    ],
  },
  {
    id: 'quads_004', name: 'Leg Extension', muscle_group: 'quads',
    secondary_muscles: [],
    equipment: 'machine', difficulty: 'beginner',
    sets_default: 3, reps_default: 15,
    video_url: 'https://www.youtube.com/embed/YyvSfVjQeL0',
    instructions: [
      'Sit in the leg extension machine, pad on lower shins.',
      'Extend both legs until straight.',
      'Lower slowly — don\'t let weight stack drop.',
    ],
  },
  {
    id: 'quads_005', name: 'Lunge', muscle_group: 'quads',
    secondary_muscles: ['glutes', 'core'],
    equipment: 'bodyweight', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/QOVaHwm-Q6U',
    instructions: [
      'Step forward with one leg, lower back knee toward floor.',
      'Keep front knee behind toes.',
      'Return to standing and alternate legs.',
    ],
  },
  {
    id: 'quads_006', name: 'Hack Squat', muscle_group: 'quads',
    secondary_muscles: ['glutes'],
    equipment: 'machine', difficulty: 'intermediate',
    sets_default: 3, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/EdtfCo5Vq04',
    instructions: [
      'Stand on the hack squat platform, back against pad.',
      'Lower until thighs are parallel to floor.',
      'Press back up through heels.',
    ],
  },

  // ─── HAMSTRINGS ───────────────────────────────────────────────────────────
  {
    id: 'hamstrings_001', name: 'Romanian Deadlift', muscle_group: 'hamstrings',
    secondary_muscles: ['glutes', 'lower back'],
    equipment: 'barbell', difficulty: 'intermediate',
    sets_default: 3, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/jEy_czb3RKA',
    instructions: [
      'Hold barbell at hip level, slight bend in knees.',
      'Hinge at hips, pushing them back as you lower the bar.',
      'Feel the hamstring stretch, then drive hips forward to stand.',
    ],
  },
  {
    id: 'hamstrings_002', name: 'Lying Leg Curl', muscle_group: 'hamstrings',
    secondary_muscles: [],
    equipment: 'machine', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/ELOCsoDSmrg',
    instructions: [
      'Lie face down on the leg curl machine, pad behind ankles.',
      'Curl legs up toward glutes.',
      'Lower slowly — full extension between reps.',
    ],
  },
  {
    id: 'hamstrings_003', name: 'Nordic Hamstring Curl', muscle_group: 'hamstrings',
    secondary_muscles: ['glutes'],
    equipment: 'bodyweight', difficulty: 'advanced',
    sets_default: 3, reps_default: 6,
    video_url: 'https://www.youtube.com/embed/d8_-C10RWWM',
    instructions: [
      'Kneel with ankles secured under a bench or partner.',
      'Lower your body forward toward the floor slowly by extending at the knees.',
      'Use hands to catch yourself, then curl back up.',
    ],
  },
  {
    id: 'hamstrings_004', name: 'Seated Leg Curl', muscle_group: 'hamstrings',
    secondary_muscles: [],
    equipment: 'machine', difficulty: 'beginner',
    sets_default: 3, reps_default: 12,
    video_url: 'https://www.youtube.com/embed/1Tq3QdYUuHs',
    instructions: [
      'Sit in leg curl machine, pad on top of lower shins.',
      'Curl legs down and back.',
      'Lower slowly with full extension.',
    ],
  },
  {
    id: 'hamstrings_005', name: 'Good Morning', muscle_group: 'hamstrings',
    secondary_muscles: ['lower back', 'glutes'],
    equipment: 'barbell', difficulty: 'intermediate',
    sets_default: 3, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/YA-h3n9L4YU',
    instructions: [
      'Bar on upper back, feet shoulder-width, slight knee bend.',
      'Hinge at hips forward until torso is near parallel to floor.',
      'Drive hips back through to standing.',
    ],
  },

  // ─── CALVES ───────────────────────────────────────────────────────────────
  {
    id: 'calves_001', name: 'Standing Calf Raise', muscle_group: 'calves',
    secondary_muscles: [],
    equipment: 'machine', difficulty: 'beginner',
    sets_default: 4, reps_default: 20,
    video_url: 'https://www.youtube.com/embed/-M4-G8p1fCI',
    instructions: [
      'Stand on the calf raise machine, balls of feet on the platform.',
      'Rise up on toes as high as possible.',
      'Lower heel below the platform for a full stretch.',
    ],
  },
  {
    id: 'calves_002', name: 'Seated Calf Raise', muscle_group: 'calves',
    secondary_muscles: [],
    equipment: 'machine', difficulty: 'beginner',
    sets_default: 4, reps_default: 20,
    video_url: 'https://www.youtube.com/embed/JbyjNymZOt0',
    instructions: [
      'Sit in seated calf raise machine, pad on thighs.',
      'Rise up on toes as high as possible.',
      'Lower for a full soleus stretch (targets the deeper calf muscle).',
    ],
  },
  {
    id: 'calves_003', name: 'Bodyweight Calf Raise', muscle_group: 'calves',
    secondary_muscles: [],
    equipment: 'bodyweight', difficulty: 'beginner',
    sets_default: 3, reps_default: 25,
    video_url: 'https://www.youtube.com/embed/gwLzBJYoWlI',
    instructions: [
      'Stand on the edge of a step, balls of feet on the edge.',
      'Rise up on toes, then lower heel below step level.',
      'Use a wall for balance if needed.',
    ],
  },
  {
    id: 'calves_004', name: 'Jump Rope', muscle_group: 'calves',
    secondary_muscles: ['cardio'],
    equipment: 'bodyweight', difficulty: 'beginner',
    sets_default: 3, reps_default: 60,
    video_url: 'https://www.youtube.com/embed/FJmRQ5iTXKE',
    instructions: [
      'Hold rope handles at hip height.',
      'Swing the rope and jump as it passes under your feet.',
      'Land softly on the balls of your feet — excellent calf conditioner.',
    ],
  },

  // ─── NECK ─────────────────────────────────────────────────────────────────
  {
    id: 'neck_001', name: 'Neck Flexion (Isometric)', muscle_group: 'neck',
    secondary_muscles: [],
    equipment: 'bodyweight', difficulty: 'beginner',
    sets_default: 3, reps_default: 30,
    video_url: 'https://www.youtube.com/embed/jcQ4k2o6D7s',
    instructions: [
      'Place palm on your forehead.',
      'Press your head forward against your hand\'s resistance.',
      'Hold for 2-3 seconds. Also do side and rear directions.',
    ],
  },
  {
    id: 'neck_002', name: 'Neck Extension (Isometric)', muscle_group: 'neck',
    secondary_muscles: ['traps'],
    equipment: 'bodyweight', difficulty: 'beginner',
    sets_default: 3, reps_default: 30,
    video_url: 'https://www.youtube.com/embed/jcQ4k2o6D7s',
    instructions: [
      'Place both hands behind your head.',
      'Press head backward against your hands\' resistance.',
      'Hold 2-3 seconds. Builds neck and upper trap strength.',
    ],
  },
  {
    id: 'neck_003', name: 'Neck Side Flexion Stretch', muscle_group: 'neck',
    secondary_muscles: [],
    equipment: 'bodyweight', difficulty: 'beginner',
    sets_default: 2, reps_default: 30,
    video_url: 'https://www.youtube.com/embed/jcQ4k2o6D7s',
    instructions: [
      'Sit or stand tall.',
      'Tilt head sideways, bringing ear toward shoulder.',
      'Hold for 30 seconds each side. Releases tension.',
    ],
  },

  // ─── CARDIO ───────────────────────────────────────────────────────────────
  {
    id: 'cardio_001', name: 'Running', muscle_group: 'cardio',
    secondary_muscles: ['quads', 'hamstrings', 'calves', 'core'],
    equipment: 'bodyweight', difficulty: 'beginner',
    sets_default: 1, reps_default: 30,
    video_url: 'https://www.youtube.com/embed/brFHyOtTwH4',
    instructions: [
      'Warm up with 5 minutes of brisk walking.',
      'Run at a comfortable pace — you should be able to speak in sentences.',
      'Cool down with 5 minutes of walking and stretching.',
    ],
  },
  {
    id: 'cardio_002', name: 'Swimming', muscle_group: 'cardio',
    secondary_muscles: ['back', 'shoulders', 'core'],
    equipment: 'bodyweight', difficulty: 'beginner',
    sets_default: 1, reps_default: 30,
    video_url: 'https://www.youtube.com/embed/gh5mAtmFHKA',
    instructions: [
      'Warm up with 2 easy laps.',
      'Swim at a steady pace focusing on form.',
      'Great full-body, low-impact cardio.',
    ],
  },
  {
    id: 'cardio_003', name: 'Cycling', muscle_group: 'cardio',
    secondary_muscles: ['quads', 'calves'],
    equipment: 'machine', difficulty: 'beginner',
    sets_default: 1, reps_default: 30,
    video_url: 'https://www.youtube.com/embed/Hin5iXeGpjA',
    instructions: [
      'Set seat height so leg is slightly bent at bottom of pedal stroke.',
      'Pedal at a comfortable resistance and cadence.',
      'Target heart rate: 60-80% of max for fat burning.',
    ],
  },
  {
    id: 'cardio_004', name: 'Burpees', muscle_group: 'cardio',
    secondary_muscles: ['chest', 'quads', 'core'],
    equipment: 'bodyweight', difficulty: 'intermediate',
    sets_default: 3, reps_default: 10,
    video_url: 'https://www.youtube.com/embed/dZgVxmf6jkA',
    instructions: [
      'From standing, drop into a squat and place hands on floor.',
      'Jump feet back to plank, do a push-up.',
      'Jump feet back to squat, then jump up with arms overhead.',
    ],
  },
  {
    id: 'cardio_005', name: 'HIIT Sprints', muscle_group: 'cardio',
    secondary_muscles: ['quads', 'hamstrings', 'calves'],
    equipment: 'bodyweight', difficulty: 'advanced',
    sets_default: 8, reps_default: 30,
    video_url: 'https://www.youtube.com/embed/ckLJin0OMfI',
    instructions: [
      'Sprint at maximum effort for 30 seconds.',
      'Rest for 30 seconds.',
      'Repeat 8 rounds. Extremely effective for fat loss.',
    ],
  },
  {
    id: 'cardio_006', name: 'Rowing Machine', muscle_group: 'cardio',
    secondary_muscles: ['back', 'lats', 'core', 'quads'],
    equipment: 'machine', difficulty: 'beginner',
    sets_default: 1, reps_default: 20,
    video_url: 'https://www.youtube.com/embed/zQ_4hCHOBEA',
    instructions: [
      'Sit with feet strapped in, grip handle.',
      'Drive with legs first, then lean back, then pull handle to lower chest.',
      'Great full-body cardio that also builds back strength.',
    ],
  },
];

// Lazy Day Mode — 3 bodyweight exercises, no equipment, 20 min
export const LAZY_DAY_EXERCISES: Exercise[] = [
  EXERCISES.find(e => e.id === 'chest_001')!,   // Push-Up
  EXERCISES.find(e => e.id === 'core_001')!,    // Plank
  EXERCISES.find(e => e.id === 'quads_002')!,   // Bodyweight Squat
];
