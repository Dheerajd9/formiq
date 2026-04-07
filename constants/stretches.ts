export interface Stretch {
  id: string;
  name: string;
  target: string;           // muscle area
  emoji: string;
  hold_seconds: number;     // default hold time
  reps?: number;            // if dynamic (circles, rolls)
  instructions: string[];
  tip: string;
  dynamic?: boolean;        // dynamic = move through it, static = hold
}

export interface StretchRoutine {
  id: string;
  name: string;
  emoji: string;
  description: string;
  duration_minutes: number;
  color: string;
  stretches: Stretch[];
}

// ─── Individual Stretches ─────────────────────────────────────────────────────

const NECK_ROLL: Stretch = {
  id: 'neck_roll',
  name: 'Neck Rolls',
  target: 'Neck & Upper Traps',
  emoji: '🦒',
  hold_seconds: 20,
  dynamic: true,
  instructions: [
    'Sit or stand tall, shoulders relaxed',
    'Slowly drop your right ear to your right shoulder',
    'Roll your chin down toward your chest',
    'Continue to the left ear to left shoulder',
    'Reverse the direction halfway through',
  ],
  tip: 'Move slowly — never force the neck back in a full circle.',
};

const CHEST_OPENER: Stretch = {
  id: 'chest_opener',
  name: 'Chest Opener',
  target: 'Chest & Front Shoulders',
  emoji: '🫁',
  hold_seconds: 30,
  instructions: [
    'Stand or sit upright',
    'Interlace your fingers behind your back',
    'Straighten your arms and squeeze your shoulder blades together',
    'Lift your hands slightly and open your chest toward the ceiling',
    'Hold and breathe deeply',
  ],
  tip: 'Great to do after a long time sitting at a desk.',
};

const SHOULDER_CROSS: Stretch = {
  id: 'shoulder_cross',
  name: 'Cross-Body Shoulder Stretch',
  target: 'Rear Deltoid & Rotator Cuff',
  emoji: '💠',
  hold_seconds: 30,
  instructions: [
    'Bring your right arm straight across your chest',
    'Use your left forearm to gently press the right arm closer to your chest',
    'Keep your right shoulder down — don\'t let it rise',
    'Hold, then switch sides',
  ],
  tip: 'Do both sides equally. Critical warm-up before pressing movements.',
};

const TRICEP_OVERHEAD: Stretch = {
  id: 'tricep_overhead',
  name: 'Overhead Tricep Stretch',
  target: 'Triceps & Lats',
  emoji: '🔱',
  hold_seconds: 25,
  instructions: [
    'Raise your right arm overhead',
    'Bend the elbow so your hand reaches toward your upper back',
    'Use your left hand to gently push the elbow further back and down',
    'Feel the stretch along the back of your arm and side',
    'Switch sides',
  ],
  tip: 'Keep your core tight and don\'t let your lower back arch.',
};

const WRIST_CIRCLES: Stretch = {
  id: 'wrist_circles',
  name: 'Wrist Circles & Flexion',
  target: 'Wrists & Forearms',
  emoji: '🤜',
  hold_seconds: 20,
  dynamic: true,
  instructions: [
    'Extend both arms in front of you',
    'Make slow circles with both wrists — 10 clockwise',
    'Then 10 counter-clockwise',
    'Finish: press one palm against a wall fingers down, hold 15 seconds each side',
  ],
  tip: 'Non-negotiable before any bench press or barbell work.',
};

const CAT_COW: Stretch = {
  id: 'cat_cow',
  name: 'Cat-Cow Spinal Wave',
  target: 'Full Spine & Core',
  emoji: '🐱',
  hold_seconds: 30,
  dynamic: true,
  instructions: [
    'Get on all fours — hands under shoulders, knees under hips',
    'Inhale: drop your belly, lift your head and tailbone (Cow)',
    'Exhale: round your spine to the ceiling, tuck chin and pelvis (Cat)',
    'Flow smoothly between positions with your breath',
    'Keep it slow — 5 full breath cycles',
  ],
  tip: 'The single best spine warm-up. Never skip this.',
};

const HIP_CIRCLES: Stretch = {
  id: 'hip_circles',
  name: 'Hip Circles',
  target: 'Hips & Lower Back',
  emoji: '🌀',
  hold_seconds: 20,
  dynamic: true,
  instructions: [
    'Stand with feet hip-width apart, hands on hips',
    'Make slow large circles with your hips — 10 clockwise',
    'Then 10 counter-clockwise',
    'Keep your upper body relatively still',
  ],
  tip: 'Loosens the hip flexors and SI joint. Great before leg day.',
};

const STANDING_QUAD: Stretch = {
  id: 'standing_quad',
  name: 'Standing Quad Stretch',
  target: 'Quadriceps & Hip Flexor',
  emoji: '🦵',
  hold_seconds: 30,
  instructions: [
    'Stand on your left foot, use a wall for balance if needed',
    'Bend your right knee and hold your right ankle with your right hand',
    'Pull the heel toward your glutes — keep knees together',
    'Stand tall, push hips slightly forward for a deeper hip flexor stretch',
    'Switch legs',
  ],
  tip: 'Critical before squats and leg press. Hip flexors get tight from sitting.',
};

const STANDING_HAMSTRING: Stretch = {
  id: 'standing_hamstring',
  name: 'Standing Hamstring Stretch',
  target: 'Hamstrings & Lower Back',
  emoji: '🦿',
  hold_seconds: 30,
  instructions: [
    'Stand and step your right foot forward about 12 inches',
    'Flex your right toes up, keeping the leg straight',
    'Hinge at your hips and lean your torso forward',
    'Rest your hands on your left thigh for support',
    'Feel the stretch behind your right knee and thigh',
    'Switch legs',
  ],
  tip: 'Don\'t round your lower back — the stretch comes from the hip hinge.',
};

const PIGEON_POSE: Stretch = {
  id: 'pigeon_pose',
  name: 'Figure-4 Glute Stretch',
  target: 'Glutes, Piriformis & IT Band',
  emoji: '🍑',
  hold_seconds: 40,
  instructions: [
    'Lie on your back, knees bent, feet flat',
    'Cross your right ankle over your left knee (figure-4)',
    'Flex your right foot to protect the knee',
    'Thread your right hand between your legs and clasp both hands behind your left thigh',
    'Gently pull your left knee toward your chest',
    'Switch sides',
  ],
  tip: 'The deepest glute stretch you can do lying down. Great before deadlifts.',
};

const CALF_WALL: Stretch = {
  id: 'calf_wall',
  name: 'Wall Calf Stretch',
  target: 'Calves & Achilles',
  emoji: '🦶',
  hold_seconds: 30,
  instructions: [
    'Stand facing a wall, hands on the wall at shoulder height',
    'Step your right foot back about 2 feet',
    'Keep the right heel flat on the floor and the leg straight',
    'Lean into the wall until you feel the calf stretch',
    'For deeper stretch: slightly bend the back knee (hits soleus)',
    'Switch legs',
  ],
  tip: 'Prevents shin splints and Achilles issues — essential before running.',
};

const ANKLE_CIRCLES: Stretch = {
  id: 'ankle_circles',
  name: 'Ankle Circles',
  target: 'Ankles & Feet',
  emoji: '🔄',
  hold_seconds: 20,
  dynamic: true,
  instructions: [
    'Sit on a bench or stand on one foot',
    'Lift one foot slightly off the ground',
    'Draw large circles with your toes — 10 each direction',
    'Switch feet',
  ],
  tip: 'Underrated. Stiff ankles limit squat depth and running efficiency.',
};

const WORLD_GREATEST: Stretch = {
  id: 'world_greatest',
  name: 'World\'s Greatest Stretch',
  target: 'Full Body — Hips, Thoracic, Hamstrings',
  emoji: '🌍',
  hold_seconds: 30,
  dynamic: true,
  instructions: [
    'Start in a high plank position',
    'Step your right foot to the outside of your right hand (lunge position)',
    'Drop your right elbow toward the floor, then rotate and reach to the sky',
    'Return hand to floor, straighten your right leg for a hamstring stretch',
    'Return to plank and repeat on the left',
    'That\'s one rep — do 5 per side',
  ],
  tip: 'One stretch that hits everything. If you only do one pre-workout stretch, make it this.',
};

const DOWNWARD_DOG: Stretch = {
  id: 'downward_dog',
  name: 'Downward Dog',
  target: 'Hamstrings, Calves, Shoulders & Spine',
  emoji: '🐕',
  hold_seconds: 30,
  instructions: [
    'Start on hands and knees',
    'Tuck your toes and push your hips up toward the ceiling',
    'Straighten your arms and legs as much as comfortable',
    'Press your heels toward the floor (they don\'t need to touch)',
    'Let your head hang and look toward your knees',
  ],
  tip: 'Alternate between pushing one heel down at a time to walk the dog.',
};

const THORACIC_ROTATION: Stretch = {
  id: 'thoracic_rotation',
  name: 'Thoracic Spine Rotation',
  target: 'Upper Back & Thoracic Spine',
  emoji: '🌀',
  hold_seconds: 25,
  dynamic: true,
  instructions: [
    'Sit upright in a chair or on the floor cross-legged',
    'Place both hands behind your head, elbows wide',
    'Rotate your upper body slowly to the right as far as comfortable',
    'Hold 2 seconds, return to center',
    'Rotate to the left',
    'Do 10 reps each side',
  ],
  tip: 'Unlocks the mid-back that gets stiff from sitting and bench pressing.',
};

const DOORWAY_PECS: Stretch = {
  id: 'doorway_pecs',
  name: 'Doorway Pec Stretch',
  target: 'Chest & Front Deltoids',
  emoji: '🚪',
  hold_seconds: 30,
  instructions: [
    'Stand in a doorway, arms at 90 degrees (like a goalpost)',
    'Place your forearms on the door frame',
    'Step one foot forward through the doorway',
    'Lean your body forward until you feel a stretch across your chest',
    'Hold and breathe — don\'t push through pain',
  ],
  tip: 'Must-do if you do any bench work. Prevents rounded shoulders over time.',
};

// ─── Routines ─────────────────────────────────────────────────────────────────

export const STRETCH_ROUTINES: StretchRoutine[] = [
  {
    id: 'full_body',
    name: 'Full Body Warm-Up',
    emoji: '🌍',
    description: 'Head to toe. Do this before every workout.',
    duration_minutes: 8,
    color: '#00E676',
    stretches: [
      NECK_ROLL,
      CHEST_OPENER,
      SHOULDER_CROSS,
      WRIST_CIRCLES,
      CAT_COW,
      WORLD_GREATEST,
      HIP_CIRCLES,
      STANDING_QUAD,
      STANDING_HAMSTRING,
      CALF_WALL,
      ANKLE_CIRCLES,
    ],
  },
  {
    id: 'upper_body',
    name: 'Upper Body Warm-Up',
    emoji: '💪',
    description: 'Chest, shoulders, arms & back. Perfect before push/pull day.',
    duration_minutes: 5,
    color: '#2979FF',
    stretches: [
      NECK_ROLL,
      CHEST_OPENER,
      DOORWAY_PECS,
      SHOULDER_CROSS,
      TRICEP_OVERHEAD,
      THORACIC_ROTATION,
      WRIST_CIRCLES,
    ],
  },
  {
    id: 'lower_body',
    name: 'Lower Body Warm-Up',
    emoji: '🦵',
    description: 'Hips, quads, hamstrings & calves. Essential before leg day.',
    duration_minutes: 6,
    color: '#FF6D00',
    stretches: [
      CAT_COW,
      HIP_CIRCLES,
      PIGEON_POSE,
      STANDING_QUAD,
      STANDING_HAMSTRING,
      CALF_WALL,
      ANKLE_CIRCLES,
      DOWNWARD_DOG,
    ],
  },
  {
    id: 'pre_run',
    name: 'Pre-Run Warm-Up',
    emoji: '🏃',
    description: 'Legs, ankles & hips. Do this before treadmill or outdoor runs.',
    duration_minutes: 4,
    color: '#00B0FF',
    stretches: [
      ANKLE_CIRCLES,
      CALF_WALL,
      STANDING_QUAD,
      STANDING_HAMSTRING,
      HIP_CIRCLES,
      WORLD_GREATEST,
    ],
  },
  {
    id: 'quick_5',
    name: 'Quick 5-Min Stretch',
    emoji: '⚡',
    description: 'Short on time? Hit the essentials fast.',
    duration_minutes: 5,
    color: '#BD7AFF',
    stretches: [
      WORLD_GREATEST,
      CHEST_OPENER,
      STANDING_QUAD,
      CAT_COW,
      DOWNWARD_DOG,
    ],
  },
];
