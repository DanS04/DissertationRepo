// EMG activation data expressed as % MVC (Maximum Voluntary Contraction)
// Values represent mean peak EMG from peer-reviewed EMG studies.
// Taken from the emg dataset within the DissProject folder

export const EXERCISE_DATA = {
  'Bench Press': {
    category: 'Push',
    primaryGroup: 'Chest',
    muscles: {
      PecCostal: 83, PecClavicular: 72, TricepsLateral: 61,
      TricepsMedialLong: 56, DeltFront: 46, SerratusAnterior: 28,
    },
  },
  'Incline Bench Press': {
    category: 'Push',
    primaryGroup: 'Chest',
    muscles: {
      PecClavicular: 88, PecCostal: 58, TricepsLateral: 54,
      TricepsMedialLong: 49, DeltFront: 54, SerratusAnterior: 31,
    },
  },
  'Squat': {
    category: 'Legs',
    primaryGroup: 'Legs',
    muscles: {
      QuadsRecFem: 88, QuadsVasti: 83, Glutes: 67,
      Hamstrings: 47, Calves: 27, ErectorSpinae: 43, Obliques: 22,
    },
  },
  'Deadlift': {
    category: 'Pull',
    primaryGroup: 'Back',
    muscles: {
      Glutes: 91, ErectorSpinae: 84, Hamstrings: 78,
      QuadsRecFem: 61, QuadsVasti: 66, Lats: 52, Traps: 47,
      ForearmFlexor: 38,
    },
  },
  'Pull-Up': {
    category: 'Pull',
    primaryGroup: 'Back',
    muscles: {
      Lats: 90, Biceps: 72, Rhomboids: 57,
      Traps: 45, DeltRear: 37, SerratusAnterior: 24, ForearmFlexor: 42,
    },
  },
  'Shoulder Press': {
    category: 'Push',
    primaryGroup: 'Shoulders',
    muscles: {
      DeltFront: 84, DeltSide: 79, TricepsLateral: 53,
      TricepsMedialLong: 48, Traps: 39, SerratusAnterior: 21,
    },
  },
  'Lateral Raise': {
    category: 'Push',
    primaryGroup: 'Shoulders',
    muscles: {
      DeltSide: 92, DeltFront: 31, Traps: 24, SerratusAnterior: 14,
    },
  },
  'Bicep Curl': {
    category: 'Arms',
    primaryGroup: 'Arms',
    muscles: {
      Biceps: 96, ForearmFlexor: 53, DeltFront: 17,
    },
  },
  'Tricep Pushdown': {
    category: 'Arms',
    primaryGroup: 'Arms',
    muscles: {
      TricepsLateral: 84, TricepsMedialLong: 79, ForearmExtensor: 34,
    },
  },
  'Romanian Deadlift': {
    category: 'Legs',
    primaryGroup: 'Legs',
    muscles: {
      Hamstrings: 89, Glutes: 74, ErectorSpinae: 67,
      QuadsRecFem: 24, Calves: 17,
    },
  },
  'Bent-Over Row': {
    category: 'Pull',
    primaryGroup: 'Back',
    muscles: {
      Rhomboids: 84, Lats: 73, Traps: 57,
      Biceps: 53, ErectorSpinae: 47, DeltRear: 31, ForearmFlexor: 36,
    },
  },
  'Leg Press': {
    category: 'Legs',
    primaryGroup: 'Legs',
    muscles: {
      QuadsRecFem: 77, QuadsVasti: 83, Glutes: 56,
      Hamstrings: 37, Calves: 21,
    },
  },
  'Face Pull': {
    category: 'Pull',
    primaryGroup: 'Shoulders',
    muscles: {
      DeltRear: 88, Rhomboids: 51, Traps: 43,
      TricepsLateral: 17, ForearmFlexor: 27,
    },
  },
  'Plank': {
    category: 'Core',
    primaryGroup: 'Core',
    muscles: {
      Abs: 46, Obliques: 41, ErectorSpinae: 34,
      SerratusAnterior: 27, QuadsRecFem: 17,
    },
  },
  'Cable Row': {
    category: 'Pull',
    primaryGroup: 'Back',
    muscles: {
      Rhomboids: 78, Lats: 67, Traps: 51,
      Biceps: 47, ErectorSpinae: 37, DeltRear: 27, ForearmFlexor: 32,
    },
  },
  'Hip Thrust': {
    category: 'Legs',
    primaryGroup: 'Legs',
    muscles: {
      Glutes: 97, Hamstrings: 58, QuadsRecFem: 33,
      QuadsVasti: 29, ErectorSpinae: 22,
    },
  },
  'Overhead Tricep Extension': {
    category: 'Arms',
    primaryGroup: 'Arms',
    muscles: {
      TricepsMedialLong: 92, TricepsLateral: 71, ForearmExtensor: 29,
    },
  },
  'Lunges': {
    category: 'Legs',
    primaryGroup: 'Legs',
    muscles: {
      QuadsRecFem: 74, QuadsVasti: 69, Glutes: 63,
      Hamstrings: 44, Calves: 24,
    },
  },
  'Cable Fly': {
    category: 'Push',
    primaryGroup: 'Chest',
    muscles: {
      PecCostal: 78, PecClavicular: 72, DeltFront: 36,
      SerratusAnterior: 22,
    },
  },
  'Upright Row': {
    category: 'Pull',
    primaryGroup: 'Shoulders',
    muscles: {
      Traps: 84, DeltSide: 74, DeltFront: 52,
      Biceps: 44, ForearmFlexor: 31,
    },
  },
}

export const EXERCISE_NAMES = Object.keys(EXERCISE_DATA)
export const EXERCISE_CATEGORIES = ['Push', 'Pull', 'Legs', 'Arms', 'Core']
