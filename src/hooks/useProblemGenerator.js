import { useCallback, useRef } from 'react';
import { generateProblem, generateChoices } from '../services/problemService';
import { selectWeightedProblem } from '../services/adaptiveService';

/**
 * Build a pool of possible problems for given operations and table ranges
 */
function buildProblemPool(operations, tables, numberRanges, excludedNumbers = {}) {
  const pool = [];

  for (const op of operations) {
    const excluded = excludedNumbers[op] || [];
    const ranges = [];
    if (tables.includes('small')) ranges.push(numberRanges.smallTable);
    if (tables.includes('large')) ranges.push(numberRanges.largeTable);

    for (const range of ranges) {
      for (let a = range.min; a <= range.max; a++) {
        if (excluded.includes(a)) continue;
        for (let b = range.min; b <= range.max; b++) {
          if (excluded.includes(b)) continue;

          let correctAnswer;
          let effectiveA = a;
          let effectiveB = b;

          switch (op) {
            case 'addition':
              correctAnswer = a + b;
              break;
            case 'subtraction':
              effectiveA = Math.max(a, b);
              effectiveB = Math.min(a, b);
              correctAnswer = effectiveA - effectiveB;
              if (excluded.includes(effectiveB)) continue;
              break;
            case 'multiplication':
              correctAnswer = a * b;
              break;
            case 'division':
              effectiveA = a * b;
              effectiveB = b;
              correctAnswer = a;
              if (effectiveB === 0) continue;
              break;
            default:
              correctAnswer = a + b;
          }

          pool.push({
            a: effectiveA,
            b: effectiveB,
            operation: op,
            correctAnswer,
          });
        }
      }
    }
  }

  // Remove duplicates (e.g., subtraction 5-3 and 3-5 both become 5-3)
  const seen = new Set();
  return pool.filter((p) => {
    const key = `${p.operation}_${p.a}_${p.b}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function useProblemGenerator(config) {
  const poolRef = useRef([]);
  const lastProblemRef = useRef(null);

  const initPool = useCallback(
    (operations, tables) => {
      poolRef.current = buildProblemPool(operations, tables, config.numberRanges, config.excludedNumbers);
    },
    [config.numberRanges, config.excludedNumbers]
  );

  const getNextProblem = useCallback(
    (learningData, forcedRepeatQueue) => {
      const pool = poolRef.current;
      if (pool.length === 0) return null;

      const { problem, updatedQueue } = selectWeightedProblem(
        pool,
        learningData,
        forcedRepeatQueue,
        config.adaptive
      );

      // Avoid showing the exact same problem twice in a row
      if (
        lastProblemRef.current &&
        problem.a === lastProblemRef.current.a &&
        problem.b === lastProblemRef.current.b &&
        problem.operation === lastProblemRef.current.operation &&
        pool.length > 1
      ) {
        // Pick a random different one
        const others = pool.filter(
          (p) =>
            p.a !== problem.a || p.b !== problem.b || p.operation !== problem.operation
        );
        const alt = others[Math.floor(Math.random() * others.length)];
        lastProblemRef.current = alt;
        const choices = generateChoices(alt.correctAnswer, config.gameplay.numberOfChoices, config.distractors);
        return { problem: alt, choices, updatedQueue };
      }

      lastProblemRef.current = problem;
      const choices = generateChoices(problem.correctAnswer, config.gameplay.numberOfChoices, config.distractors);
      return { problem, choices, updatedQueue };
    },
    [config]
  );

  return { initPool, getNextProblem };
}
