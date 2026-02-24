import appConfig from '../config/appConfig';

/**
 * Create a unique key for a problem
 */
export function problemKey(operation, a, b) {
  return `${operation}_${a}_${b}`;
}

/**
 * Create an empty learning entry for a problem
 */
export function createLearningEntry(operation, a, b) {
  return {
    key: problemKey(operation, a, b),
    operation,
    a,
    b,
    difficultyScore: 0,
    timesCorrect: 0,
    timesWrong: 0,
    consecutiveCorrect: 0,
    averageResponseTime: 0,
    lastSeen: null,
    lastCorrect: null,
  };
}

/**
 * Update learning entry after a correct answer
 */
export function updateOnCorrect(entry, responseTimeMs, config = appConfig.adaptive) {
  const updated = { ...entry };
  updated.difficultyScore = Math.max(0, updated.difficultyScore - config.correctAnswerScoreReduction);
  updated.consecutiveCorrect += 1;
  updated.timesCorrect += 1;
  updated.lastSeen = Date.now();
  updated.lastCorrect = Date.now();

  // Slow but correct = still somewhat hard
  if (responseTimeMs > config.slowAnswerThreshold) {
    updated.difficultyScore = Math.min(
      config.maxDifficultyScore,
      updated.difficultyScore + config.slowAnswerScoreIncrease
    );
  }

  // Update rolling average response time
  const total = updated.timesCorrect + updated.timesWrong;
  updated.averageResponseTime =
    (updated.averageResponseTime * (total - 1) + responseTimeMs) / total;

  return updated;
}

/**
 * Update learning entry after a wrong answer
 */
export function updateOnWrong(entry, responseTimeMs, config = appConfig.adaptive) {
  const updated = { ...entry };
  updated.difficultyScore = Math.min(
    config.maxDifficultyScore,
    updated.difficultyScore + config.wrongAnswerScoreIncrease
  );
  updated.consecutiveCorrect = 0;
  updated.timesWrong += 1;
  updated.lastSeen = Date.now();

  const total = updated.timesCorrect + updated.timesWrong;
  updated.averageResponseTime =
    (updated.averageResponseTime * (total - 1) + responseTimeMs) / total;

  return updated;
}

/**
 * Apply time-based difficulty decay
 */
export function applyDecay(entry, config = appConfig.adaptive) {
  if (!entry.lastSeen) return entry;
  const daysSince = (Date.now() - entry.lastSeen) / (1000 * 60 * 60 * 24);
  if (daysSince < 0.1) return entry; // Less than ~2.4 hours, no decay
  const decayed = { ...entry };
  decayed.difficultyScore *= Math.pow(config.difficultyDecayFactor, daysSince);
  if (decayed.difficultyScore < 0.1) decayed.difficultyScore = 0;
  return decayed;
}

/**
 * Calculate selection weight for a problem
 */
export function getSelectionWeight(entry, config = appConfig.adaptive) {
  if (!entry) return 2; // Never seen = slight boost
  if (entry.difficultyScore <= 0) return 1; // Easy problem = base weight
  return 1 + entry.difficultyScore * config.priorityProblemWeight;
}

/**
 * Select a problem using weighted random selection from a pool
 * @param {Array} pool - Array of { operation, a, b, correctAnswer }
 * @param {Object} learningData - Map of problemKey -> learningEntry
 * @param {Array} forcedRepeatQueue - Queue of forced repeats
 * @param {Object} config - Adaptive config
 * @returns {{ problem, updatedQueue }}
 */
export function selectWeightedProblem(pool, learningData, forcedRepeatQueue = [], config = appConfig.adaptive) {
  // Check forced repeat queue first
  const updatedQueue = forcedRepeatQueue
    .map((item) => ({ ...item, countdown: item.countdown - 1 }))
    .filter((item) => item.countdown > 0);

  const readyRepeat = forcedRepeatQueue.find((item) => item.countdown <= 1);
  if (readyRepeat) {
    const forcedProblem = pool.find(
      (p) => problemKey(p.operation, p.a, p.b) === readyRepeat.key
    );
    if (forcedProblem) {
      return {
        problem: forcedProblem,
        updatedQueue: updatedQueue.filter((item) => item.key !== readyRepeat.key),
      };
    }
  }

  // Weighted random selection
  const weights = pool.map((p) => {
    const key = problemKey(p.operation, p.a, p.b);
    const entry = learningData[key];
    return getSelectionWeight(entry, config);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < pool.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return { problem: pool[i], updatedQueue };
    }
  }

  return { problem: pool[pool.length - 1], updatedQueue };
}

/**
 * Check if a problem should be added to the forced repeat queue
 */
export function shouldForceRepeat(entry, config = appConfig.adaptive) {
  return entry.timesWrong > 0 && entry.timesWrong % config.wrongAnswerRepeatThreshold === 0;
}

/**
 * Create a forced repeat entry
 */
export function createForcedRepeat(key, config = appConfig.adaptive) {
  const [min, max] = config.repeatInsertRange;
  const countdown = Math.floor(Math.random() * (max - min + 1)) + min;
  return { key, countdown };
}
