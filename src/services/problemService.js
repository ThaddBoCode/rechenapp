function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomIntExcluding(min, max, excluded = []) {
  const valid = [];
  for (let i = min; i <= max; i++) {
    if (!excluded.includes(i)) valid.push(i);
  }
  if (valid.length === 0) return randomInt(min, max); // fallback
  return valid[Math.floor(Math.random() * valid.length)];
}

export function generateProblem(operation, range, excluded = []) {
  const { min, max } = range;
  let a, b, correctAnswer;

  switch (operation) {
    case 'addition':
      a = randomIntExcluding(min, max, excluded);
      b = randomIntExcluding(min, max, excluded);
      correctAnswer = a + b;
      break;

    case 'subtraction':
      a = randomIntExcluding(min, max, excluded);
      b = randomIntExcluding(min, max, excluded);
      if (a < b) [a, b] = [b, a];
      correctAnswer = a - b;
      break;

    case 'multiplication':
      a = randomIntExcluding(min, max, excluded);
      b = randomIntExcluding(min, max, excluded);
      correctAnswer = a * b;
      break;

    case 'division': {
      b = randomIntExcluding(Math.max(min, 1), max, excluded);
      const quotient = randomIntExcluding(min, max, excluded);
      a = b * quotient;
      correctAnswer = quotient;
      break;
    }

    default:
      a = randomIntExcluding(min, max, excluded);
      b = randomIntExcluding(min, max, excluded);
      correctAnswer = a + b;
  }

  return { a, b, operation, correctAnswer };
}

export function generateChoices(correctAnswer, count, distractorConfig) {
  const { nearbyRange, avoidNegativeDistractors, avoidZeroDistractor, strategy } = distractorConfig;
  const choices = new Set([correctAnswer]);

  const maxAttempts = 100;
  let attempts = 0;

  while (choices.size < count && attempts < maxAttempts) {
    attempts++;
    let distractor;

    if (strategy === 'nearby') {
      const offset = randomInt(1, nearbyRange) * (Math.random() < 0.5 ? -1 : 1);
      distractor = correctAnswer + offset;
    } else {
      distractor = correctAnswer + randomInt(-nearbyRange * 2, nearbyRange * 2);
    }

    if (avoidNegativeDistractors && distractor < 0) continue;
    if (avoidZeroDistractor && distractor === 0 && correctAnswer !== 0) continue;
    if (distractor === correctAnswer) continue;

    choices.add(distractor);
  }

  // Fill remaining if needed
  let fill = 1;
  while (choices.size < count) {
    const d = correctAnswer + fill;
    if (!choices.has(d)) choices.add(d);
    fill = fill > 0 ? -fill : -fill + 1;
  }

  return shuffle([...choices]);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getOperationSymbol(operation) {
  const symbols = {
    addition: '+',
    subtraction: '−',
    multiplication: '×',
    division: '÷',
  };
  return symbols[operation] || '+';
}

export function getOperationEmoji(operation) {
  const emojis = {
    addition: '➕',
    subtraction: '➖',
    multiplication: '✖️',
    division: '➗',
  };
  return emojis[operation] || '➕';
}

export function getOperationLabel(operation) {
  const labels = {
    addition: 'Plus',
    subtraction: 'Minus',
    multiplication: 'Mal',
    division: 'Geteilt',
  };
  return labels[operation] || 'Plus';
}
