const appConfig = {

  // ──────────────────────────────────────────────
  // GAMEPLAY
  // ──────────────────────────────────────────────
  gameplay: {
    numberOfChoices: 4,
    delayAfterCorrect: 1200,
    delayAfterWrong: 2500,
    testDuration: 60,
    showCorrectAnswerOnWrong: true,
    enableHaptic: true,
  },

  // ──────────────────────────────────────────────
  // OPERATIONS
  // ──────────────────────────────────────────────
  operations: {
    addition: {
      symbol: '+',
      label: 'Plus',
      emoji: '➕',
      enabled: true,
    },
    subtraction: {
      symbol: '−',
      label: 'Minus',
      emoji: '➖',
      enabled: true,
    },
    multiplication: {
      symbol: '×',
      label: 'Mal',
      emoji: '✖️',
      enabled: true,
    },
    division: {
      symbol: '÷',
      label: 'Geteilt',
      emoji: '➗',
      enabled: true,
    },
  },

  // ──────────────────────────────────────────────
  // NUMBER RANGES
  // ──────────────────────────────────────────────
  numberRanges: {
    smallTable: { min: 1, max: 10 },
    largeTable: { min: 11, max: 20 },
    additionRange: { min: 1, max: 100 },
  },

  // ──────────────────────────────────────────────
  // EXCLUDED NUMBERS (per operation, comma-separated)
  // These numbers will be excluded from BOTH operands.
  // E.g. addition: [0, 1] means no "X+0", "0+X", "X+1", "1+X"
  // ──────────────────────────────────────────────
  excludedNumbers: {
    addition: [0, 1],
    subtraction: [0, 1],
    multiplication: [0, 1],
    division: [1],
  },

  // ──────────────────────────────────────────────
  // ADAPTIVE LEARNING
  // ──────────────────────────────────────────────
  adaptive: {
    wrongAnswerRepeatThreshold: 1,   // Force repeat after every wrong answer
    repeatInsertRange: [2, 4],       // Repeat 2-4 problems later
    difficultyDecayFactor: 0.9,
    maxDifficultyScore: 10,
    correctAnswerScoreReduction: 1,
    wrongAnswerScoreIncrease: 3,
    slowAnswerThreshold: 8000,
    slowAnswerScoreIncrease: 1,
    priorityProblemWeight: 5,        // Hard problems 5x more likely
  },

  // ──────────────────────────────────────────────
  // UI
  // ──────────────────────────────────────────────
  ui: {
    answerButtonMinHeight: 72,
    answerButtonMinWidth: 140,
    answerButtonFontSize: 28,
    problemFontSize: 48,
    headerFontSize: 24,
    borderRadius: 16,
    maxContentWidth: 480,
    navBarHeight: 64,
    avatarSize: 48,
  },

  // ──────────────────────────────────────────────
  // ANIMATIONS
  // ──────────────────────────────────────────────
  animations: {
    correctAnimationDuration: 600,
    wrongAnimationDuration: 800,
    feedbackOverlayDuration: 1000,
    transitionDuration: 300,
  },

  // ──────────────────────────────────────────────
  // DISTRACTORS
  // ──────────────────────────────────────────────
  distractors: {
    strategy: 'nearby',
    nearbyRange: 5,
    avoidNegativeDistractors: true,
    avoidZeroDistractor: true,
    avoidDuplicates: true,
  },

  // ──────────────────────────────────────────────
  // RANKING
  // ──────────────────────────────────────────────
  ranking: {
    topNDisplay: 20,
    rankingMetric: 'bestScore',
    minTestsForRanking: 3,
  },

  // ──────────────────────────────────────────────
  // FIREBASE
  // ──────────────────────────────────────────────
  firebase: {
    enableOfflinePersistence: true,
    maxHistoryEntries: 100,
  },

  // ──────────────────────────────────────────────
  // AVATARS
  // ──────────────────────────────────────────────
  avatars: ['🦊', '🐱', '🚀', '🌟', '🐻', '🦄', '🐶', '🦁', '🐸', '🎯'],
};

export default appConfig;
