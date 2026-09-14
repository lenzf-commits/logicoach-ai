export const levelThresholds = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 },
  { level: 6, xp: 1500 },
  { level: 7, xp: 2500 },
  { level: 8, xp: 4000 },
  { level: 9, xp: 6000 },
  { level: 10, xp: 10000 }
] as const;

export function calculateLevel(xp: number) {
  return levelThresholds.reduce((currentLevel, threshold) => {
    return xp >= threshold.xp ? threshold.level : currentLevel;
  }, 1);
}

export function getNextLevelThreshold(level: number) {
  return levelThresholds.find((threshold) => threshold.level === level + 1) ?? null;
}

export function getCurrentLevelThreshold(level: number) {
  return levelThresholds.find((threshold) => threshold.level === level)?.xp ?? 0;
}

export function calculateDifficultyBonus(interviewLevel: number | null) {
  const level = interviewLevel ?? 1;

  if (level >= 9) {
    return 100;
  }

  if (level >= 7) {
    return 50;
  }

  if (level >= 4) {
    return 25;
  }

  return 0;
}

export function calculateInterviewXp(interviewLevel: number | null) {
  return 100 + calculateDifficultyBonus(interviewLevel);
}
