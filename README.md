# FormIQ — Your Gym Brain 💪

> Plan, log, and track every workout. Free, offline, no account needed.

**Live PWA → [formiq-navy.vercel.app](https://formiq-navy.vercel.app)**

---

## What is FormIQ?

FormIQ is a full-featured fitness tracker built as a **Progressive Web App (PWA)**. Open it in Safari on iPhone, tap "Add to Home Screen", and it works like a native app — completely offline, no App Store, no account, no backend.

All your data lives in your browser. Nothing is sent anywhere.

---

## Features

### Core Tracking
- **Daily Workout Logger** — start a session, log sets/reps/weight per exercise, check off each set, see a live stopwatch and progress bar
- **Weekly Planner** — assign exercises to each day of the week (Gym / Run / Swim / Rest), set up push/pull/legs or any split
- **Personal Records** — automatically tracked when you complete a workout; tap any PR to open the 1RM calculator

### Exercise Library
- **80+ exercises** across 15 muscle groups
- Filter by muscle group (visual grid) or equipment (chips)
- Full-text search
- Each exercise has step-by-step instructions, difficulty, sets/reps recommendation, and YouTube video link

### Smart Features
- **"What Should I Train Today?"** — analyzes last 14 days of logs, finds the most neglected muscle groups, suggests a workout. No AI API — works fully offline
- **Muscle Recovery Visualizer** — body map showing which muscles are recovering (red = <48h since trained, green = ready)
- **Lazy Day Mode** — too tired? Get a quick 3-exercise bodyweight session that keeps your streak alive

### Cardio Tracker
- Log: Treadmill, Outdoor Run, Cycling, Elliptical, Rowing, Stair Climber
- km / miles toggle
- Auto-calculates speed, pace, and calories (MET-based formula)
- Today's totals + weekly summary

### Stretch & Warm-Up
- 5 built-in routines: Full Body (8 min), Upper Body (5 min), Lower Body (6 min), Pre-Run (4 min), Quick 5-Min
- 15 stretches total with hold timers, animated progress bar, haptic feedback at 5s and completion
- Step-by-step coach view — skip or pause any stretch

### Step Counter
- iPhone accelerometer-based pedometer (no HealthKit — works in Safari PWA)
- Daily goal: 10,000 steps
- Live ring progress, distance (km), calories burned
- 7-day history bar chart
- Persists across page reloads

### Gym Tools (Progress Tab)
- **Plate Calculator** — enter target weight, see exactly which plates to load on an Olympic bar (kg/lb toggle, color-coded visual)
- **1RM Calculator** — Epley formula, shows training zones (Max / Strength / Hypertrophy / Endurance) with % and rep ranges

### Progress & Stats
- **12-week activity heat map** — GitHub-style, color by workout type
- Streak counter + weekly/monthly consistency %
- Muscle frequency chart — see which groups you've been neglecting
- Shareable weekly summary card

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React Native + Expo SDK 54 |
| Navigation | Expo Router (file-based) |
| Database | expo-sqlite (native) + localStorage SQL interpreter (web) |
| Styling | StyleSheet + expo-linear-gradient |
| Animations | React Native Animated API |
| Haptics | expo-haptics |
| Charts | react-native-body-highlighter, react-native-gifted-charts |
| Sharing | expo-sharing |
| PWA Hosting | Vercel |

### How the web database works
On native, FormIQ uses `expo-sqlite` (real SQLite via C). On web, there's a custom `db/client.web.ts` — a tiny SQL interpreter backed by `localStorage`. It supports SELECT (with JOINs, WHERE, ORDER BY, LIMIT), INSERT (with ON CONFLICT upsert), UPDATE, and DELETE. Expo Router automatically picks the `.web.ts` file on web builds.

---

## Project Structure

```
formiq/
├── app/
│   ├── index.tsx              # Landing page (web) / redirect (native)
│   ├── +html.tsx              # PWA meta tags, Inter font, dark body
│   ├── _layout.tsx            # Root Stack navigator
│   ├── (tabs)/
│   │   ├── index.tsx          # Home — today's workout, step counter, cardio
│   │   ├── plan.tsx           # Weekly planner
│   │   ├── library.tsx        # Exercise library
│   │   ├── muscles.tsx        # Interactive muscle body map
│   │   ├── progress.tsx       # Stats, heat map, PRs, gym tools
│   │   └── settings.tsx       # Goals, gym days, preferences
│   └── exercise/[id].tsx      # Exercise detail modal
│
├── components/
│   ├── CardioLogger.tsx        # Cardio session logging UI
│   ├── ExerciseCard.tsx        # Exercise list card
│   ├── HeatMapGrid.tsx         # 12-week activity heat map
│   ├── OneRMCalculator.tsx     # 1RM + training zones modal
│   ├── PlateCalculator.tsx     # Plate loading visual calculator
│   ├── RecoveryVisualizer.tsx  # Muscle recovery body map
│   ├── RestTimer.tsx           # Floating rest timer between sets
│   ├── SetLogger.tsx           # Set/rep/weight input row
│   ├── StepCounter.tsx         # Accelerometer step counter card
│   └── StretchRoutineModal.tsx # Stretch picker + step-by-step coach
│
├── hooks/
│   ├── useCardio.ts           # Cardio CRUD + totals
│   ├── usePlan.ts             # Weekly plan CRUD
│   ├── useProgress.ts         # Stats, heat map, PRs, muscle frequency
│   ├── useRecovery.ts         # Muscle recovery status
│   ├── useStepCounter.ts      # Accelerometer pedometer
│   ├── useWhatToday.ts        # Smart workout suggestion
│   └── useWorkoutLog.ts       # Daily log session CRUD
│
├── db/
│   ├── client.ts              # expo-sqlite native client + schema init
│   └── client.web.ts          # localStorage SQL interpreter (web only)
│
└── constants/
    ├── exercises.ts            # 80+ exercises, muscle groups, equipment
    ├── stretches.ts            # 15 stretches, 5 routines
    └── theme.ts                # Dark mode design tokens
```

---

## Database Schema

```sql
-- Exercises (static, bundled)
exercises: id, name, muscle_group, secondary_muscles, equipment,
           instructions, video_url, difficulty, sets_default, reps_default

-- Weekly plan
plans: id, name, is_active, created_at
plan_days: id, plan_id, day_of_week, workout_type
plan_day_exercises: id, plan_day_id, exercise_id, sets, reps, order_index

-- Daily logs
workout_logs: id, date, workout_type, duration_minutes, notes, completed, started_at
log_exercises: id, log_id, exercise_id, completed
log_sets: id, log_exercise_id, set_number, reps, weight_kg, completed

-- Cardio
cardio_logs: id, date, type, distance_km, duration_minutes,
             avg_speed_kmh, calories, notes, created_at

-- PRs and settings
personal_records: id, exercise_id, weight_kg, reps, achieved_at
user_settings: id, goal, gym_days_per_week, accent_color, notification_time, onboarding_done
```

---

## Install as iPhone App (PWA)

1. Open **[formiq-navy.vercel.app](https://formiq-navy.vercel.app)** in **Safari**
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add**

FormIQ appears on your home screen like a native app. Works fully offline after first load.

---

## Run Locally

```bash
git clone https://github.com/Dheerajd9/formiq.git
cd formiq
npm install
npx expo start
```

- Press `w` to open in browser
- Scan QR code with Expo Go for native preview

### Build for web

```bash
npx expo export --platform web
# Output in /dist — ready to deploy to Vercel, Netlify, etc.
```

---

## Design System

- **Background:** `#000000` pure black
- **Accent:** `#00E676` electric green
- **Surface levels:** `#111111` → `#1C1C1E` → `#2C2C2E`
- **Font:** Inter (Google Fonts)
- **Glassmorphism cards, LinearGradient CTAs, Animated entrance effects**

---

## Deployment

Deployed on **Vercel** via CLI. `vercel.json` sets COOP/COEP headers required for SharedArrayBuffer (expo-sqlite web), and points the build at `npx expo export --platform web`.

---

## License

MIT — free to use, fork, and build on.
