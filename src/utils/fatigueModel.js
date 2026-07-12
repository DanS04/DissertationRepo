import { MUSCLE_CONFIG } from '../data/muscleConfig'
import { EXERCISE_DATA } from '../data/exerciseData'

// Fatigue model based on exponential decay: F(t) = F0 * e^(-t * ln(5) / recoveryHours)
// recoveryHours is the time when fatigue gets to 20% of peak (guidline for ready to train based on research).
// Derivation: 0.20 = e^(-recoveryHours * k) → k = ln(5) / recoveryHours
// This ensures F(recoveryHours) = 20% regardless of muscle type.

const INTENSITY_MULTIPLIERS = { light: 0.5, moderate: 0.8, heavy: 1.0 }

// Per-set fatigue contribution: activation% / 100 * 25 normalised so that fatigue builds at a realistic level

const PER_SET_FACTOR = 25

// ln(5) ≈ 1.6094: the decay constant that ensures F(recoveryHours) = 20%
const LN5 = Math.log(5)

// During a bad-sleep 24h window, recovery slows by this factor
const SLEEP_PENALTY = 1.4

// Convert a date string ('yyyy-MM-dd') to its 24h window [startMs, endMs]
function sleepWindow(dateStr) {
  const start = new Date(dateStr + 'T00:00:00').getTime()
  return [start, start + 86_400_000]
}

// Piecewise exponential decay accounting for bad sleep windows.
// Fatigue decays normally outside sleep windows, and at 1/SLEEP_PENALTY rate inside them.
function piecewiseDecay(sessionFatigue, workoutTime, evalTime, recoveryHours, badSleepDates) {
  if (!badSleepDates || badSleepDates.length === 0) {
    const hours = Math.max(0, (evalTime - workoutTime) / 3_600_000)
    return sessionFatigue * Math.exp(-hours * LN5 / recoveryHours)
  }

  // Build windows that overlap [workoutTime, evalTime]
  const windows = badSleepDates
    .map(sleepWindow)
    .filter(([s, e]) => e > workoutTime && s < evalTime)
    .sort((a, b) => a[0] - b[0])

  if (windows.length === 0) {
    const hours = Math.max(0, (evalTime - workoutTime) / 3_600_000)
    return sessionFatigue * Math.exp(-hours * LN5 / recoveryHours)
  }

  let fatigue = sessionFatigue
  let cursor  = workoutTime

  for (const [winStart, winEnd] of windows) {
    // Normal decay up to start of this window
    const normalEnd = Math.min(winStart, evalTime)
    if (normalEnd > cursor) {
      const hours = (normalEnd - cursor) / 3_600_000
      fatigue *= Math.exp(-hours * LN5 / recoveryHours)
      cursor = normalEnd
    }
    if (cursor >= evalTime) break

    // Slowed decay inside sleep window
    const sleepEnd = Math.min(winEnd, evalTime)
    if (sleepEnd > cursor) {
      const hours = (sleepEnd - cursor) / 3_600_000
      fatigue *= Math.exp(-hours * LN5 / (recoveryHours * SLEEP_PENALTY))
      cursor = sleepEnd
    }
    if (cursor >= evalTime) break
  }

  // Normal decay after all windows
  if (evalTime > cursor) {
    const hours = (evalTime - cursor) / 3_600_000
    fatigue *= Math.exp(-hours * LN5 / recoveryHours)
  }

  return fatigue
}

export function calculateFatigue(workouts, badSleepDates = []) {
  const now = Date.now()
  const result = {}

  for (const muscleName of Object.keys(MUSCLE_CONFIG)) {
    const { recoveryHours } = MUSCLE_CONFIG[muscleName]
    let totalFatigue = 0

    for (const workout of workouts) {
      const workoutTime = new Date(workout.date + 'T00:00:00').getTime()
      if (workoutTime > now) continue

      let sessionFatigue = 0
      for (const ex of workout.exercises) {
        const activation = EXERCISE_DATA[ex.name]?.muscles[muscleName] ?? 0
        if (activation === 0) continue
        const intensityMod = INTENSITY_MULTIPLIERS[ex.intensity] ?? 0.8
        const sets = ex.sets ?? 3
        sessionFatigue += (activation / 100) * PER_SET_FACTOR * sets * intensityMod
      }

      totalFatigue += piecewiseDecay(sessionFatigue, workoutTime, now, recoveryHours, badSleepDates)
    }

    result[muscleName] = Math.min(Math.round(totalFatigue), 100)
  }

  return result
}

// Returns hours remaining until muscle fatigue drops below threshold (default 20%)
export function hoursToRecovery(workouts, muscleName, badSleepDates = [], threshold = 20) {
  const fatigueMap = calculateFatigue(workouts, badSleepDates)
  const currentFatigue = fatigueMap[muscleName] ?? 0
  if (currentFatigue <= threshold) return 0

  const { recoveryHours } = MUSCLE_CONFIG[muscleName]
  // Future projection uses simple formula (bad sleep is a past event)
  const t = recoveryHours * Math.log(currentFatigue / threshold) / LN5
  return Math.ceil(t)
}

// Historical fatigue time series for a muscle
export function buildFatigueTimeSeries(workouts, muscleName, badSleepDates = [], days = 14) {
  const series = []
  const now = Date.now()
  const { recoveryHours } = MUSCLE_CONFIG[muscleName]

  for (let i = days; i >= 0; i--) {
    const targetTime = now - i * 86_400_000
    const label = new Date(targetTime).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })

    let totalFatigue = 0
    for (const workout of workouts) {
      const workoutTime = new Date(workout.date + 'T00:00:00').getTime()
      if (workoutTime > targetTime) continue

      let sessionFatigue = 0
      for (const ex of workout.exercises) {
        const activation = EXERCISE_DATA[ex.name]?.muscles[muscleName] ?? 0
        if (activation === 0) continue
        const intensityMod = INTENSITY_MULTIPLIERS[ex.intensity] ?? 0.8
        const sets = ex.sets ?? 3
        sessionFatigue += (activation / 100) * PER_SET_FACTOR * sets * intensityMod
      }

      totalFatigue += piecewiseDecay(sessionFatigue, workoutTime, targetTime, recoveryHours, badSleepDates)
    }

    series.push({ date: label, fatigue: Math.min(Math.round(totalFatigue), 100) })
  }

  return series
}
