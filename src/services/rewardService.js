import rewardsConfig from '../config/rewardsConfig';
import { getUserRewards, unlockReward } from './firestoreService';

/**
 * Prüft nach jedem bestandenen Test (≥90% richtig) ob das nächste Video
 * freigeschaltet wird. Gibt Array der neu freigeschalteten Rewards zurück.
 */
export async function checkAndUnlockRewards(userId, currentTestResult) {
  // Test bestanden? (≥90% richtig)
  const { correctCount, totalProblems } = currentTestResult;
  if (!totalProblems || totalProblems === 0) return [];
  const percentage = correctCount / totalProblems;
  if (percentage < 0.9) return [];

  // Bereits freigeschaltete Rewards laden
  const alreadyUnlocked = await getUserRewards(userId);

  // Rewards nach Reihenfolge sortieren
  const sorted = [...rewardsConfig].sort((a, b) => a.order - b.order);

  // Nächstes noch nicht freigeschaltetes Video finden
  for (const reward of sorted) {
    if (!alreadyUnlocked[reward.id]) {
      await unlockReward(userId, reward.id);
      return [reward];
    }
  }

  // Alle schon freigeschaltet
  return [];
}
