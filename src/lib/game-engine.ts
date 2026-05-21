import { Scenario, EndingScores, ReputationScores, PlayerStats } from './types';

export function calculateFinalScore(scores: EndingScores): number {
  return Math.round(
    scores.clientEconomicValue * 0.25 +
    scores.jointValueCreated * 0.20 +
    scores.infoDiscovered * 0.15 +
    scores.relationshipPreserved * 0.15 +
    scores.ethicalIntegrity * 0.15 +
    scores.strategicDiscipline * 0.10
  );
}

export function getReputationType(reputation: ReputationScores): { type: string; label: string; description: string } {
  const entries = Object.entries(reputation) as [keyof ReputationScores, number][];
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const top = sorted[0][0];

  const types: Record<string, { label: string; description: string }> = {
    shark: { label: '🦈 The Shark', description: 'High value claimed, low trust. You get the money but leave scorched earth.' },
    architect: { label: '🏗️ The Architect', description: 'Great package deals. You see trades others miss and build value for everyone.' },
    detective: { label: '🔍 The Detective', description: 'Uncovers hidden interests. Your investigations reveal truths that transform deals.' },
    diplomat: { label: '🤝 The Diplomat', description: 'Saves relationships. Both sides walk away satisfied and return for more.' },
    closer: { label: '⚡ The Closer', description: 'Gets deals signed fast. You know when to push and when to seal it.' },
    ethicist: { label: '⚖️ The Ethicist', description: 'Trusted in sensitive cases. Your integrity opens doors that force cannot.' },
    fixer: { label: '🔧 The Fixer', description: 'Handles ugly, emotional disputes. Where others see chaos, you find solutions.' },
  };

  return { type: top, ...types[top] };
}

export function calculateReputationDelta(scenario: Scenario, endingType: string): Partial<ReputationScores> {
  const delta: Partial<ReputationScores> = {};

  switch (endingType) {
    case 'master':
      delta.architect = 3;
      delta.detective = 2;
      delta.diplomat = 2;
      delta.ethicist = 1;
      break;
    case 'cooperative':
      delta.diplomat = 3;
      delta.closer = 2;
      delta.architect = 1;
      break;
    case 'hard_bargain':
      delta.shark = 3;
      delta.closer = 2;
      delta.diplomat = -1;
      break;
    case 'bad_deal':
      delta.shark = -1;
      delta.architect = -1;
      break;
    case 'strategic_no_deal':
      delta.ethicist = 3;
      delta.detective = 2;
      break;
    case 'ethical_failure':
      delta.shark = 2;
      delta.ethicist = -3;
      break;
    case 'no_deal_bad':
      delta.detective = -1;
      delta.closer = -2;
      break;
  }

  return delta;
}

export function calculateStatsDelta(scenario: Scenario, endingType: string, infoDiscovered: number, totalInfo: number): Partial<PlayerStats> {
  const infoRatio = totalInfo > 0 ? infoDiscovered / totalInfo : 0;

  const delta: Partial<PlayerStats> = {
    preparation: endingType === 'master' ? 3 : endingType === 'cooperative' ? 2 : 1,
    investigation: Math.round(infoRatio * 5),
    valueClaiming: endingType === 'hard_bargain' ? 3 : endingType === 'master' ? 2 : 1,
    valueCreation: endingType === 'master' ? 4 : endingType === 'cooperative' ? 2 : 0,
    emotionalControl: endingType === 'hard_bargain' ? 0 : endingType === 'cooperative' ? 2 : 1,
    ethicalJudgment: endingType === 'ethical_failure' ? -1 : endingType === 'master' ? 2 : 1,
    powerStrategy: scenario.difficulty.powerImbalance > 3 ? (endingType === 'master' ? 3 : 1) : 0,
    relationshipMgmt: endingType === 'cooperative' || endingType === 'master' ? 3 : endingType === 'hard_bargain' ? -1 : 0,
    crisisHandling: scenario.difficulty.emotionalComplexity > 3 ? (endingType === 'master' ? 3 : 1) : 0,
    culturalAwareness: scenario.difficulty.ethicalComplexity > 3 ? (endingType === 'master' ? 2 : 1) : 0,
  };

  return delta;
}

export function getEndingFromNegotiation(scenario: Scenario, negotiation: {
  trust: number;
  anger: number;
  valueClaimed: number;
  valueCreated: number;
  relationshipImpact: number;
  ethicalImpact: number;
  choicesMade: string[];
  informationRevealed: string[];
  currentDialogueNodeId: string;
}): string {
  // Check if we reached a specific ending node
  const lastNode = scenario.dialogueTree.find(n => n.id === negotiation.currentDialogueNodeId);
  if (lastNode?.id.startsWith('ending_')) {
    const endingType = lastNode.id.replace('ending_', '');
    if (['master', 'cooperative', 'hard_bargain', 'bad_deal', 'no_deal_bad', 'ethical_failure', 'strategic_no_deal'].includes(endingType)) {
      return endingType;
    }
  }

  // Otherwise, determine ending based on accumulated state
  const totalValue = negotiation.valueClaimed + negotiation.valueCreated;
  const highTrust = negotiation.trust >= 70;
  const lowAnger = negotiation.anger <= 30;
  const goodRelationship = negotiation.relationshipImpact >= 15;

  if (totalValue >= 50 && highTrust && goodRelationship && negotiation.informationRevealed.length >= 2) {
    return 'master';
  }
  if (totalValue >= 30 && (highTrust || goodRelationship)) {
    return 'cooperative';
  }
  if (negotiation.valueClaimed >= 20 && !goodRelationship) {
    return 'hard_bargain';
  }
  // BUG FIX: Added ethical_failure and strategic_no_deal conditions that were previously unreachable
  if (negotiation.ethicalImpact < -15) {
    return 'ethical_failure';
  }
  if (totalValue < 10 && negotiation.trust >= 40 && negotiation.anger <= 40 && negotiation.informationRevealed.length >= 1) {
    return 'strategic_no_deal';
  }
  if (totalValue < 15 && negotiation.anger > 60) {
    return 'bad_deal';
  }
  if (negotiation.trust < 20 && negotiation.anger > 70) {
    return 'no_deal_bad';
  }
  // BUG FIX: Mediocre states should give bad_deal, not cooperative
  if (totalValue < 20 && !highTrust) {
    return 'bad_deal';
  }
  return 'cooperative';
}

export function getDifficultyLabel(difficulty: { economicComplexity: number; emotionalComplexity: number; ethicalComplexity: number; informationAsymmetry: number; powerImbalance: number; timePressure: number; relationshipStakes: number }): string {
  const avg = Object.values(difficulty).reduce((a, b) => a + b, 0) / 7;
  if (avg <= 1.5) return 'Beginner';
  if (avg <= 2.5) return 'Intermediate';
  if (avg <= 3.5) return 'Advanced';
  if (avg <= 4.5) return 'Expert';
  return 'Master';
}

export function getDifficultyColor(difficulty: ReturnType<typeof getDifficultyLabel>): string {
  switch (difficulty) {
    case 'Beginner': return 'text-emerald-400';
    case 'Intermediate': return 'text-cyan-400';
    case 'Advanced': return 'text-amber-400';
    case 'Expert': return 'text-orange-400';
    case 'Master': return 'text-red-400';
    default: return 'text-slate-400';
  }
}

/**
 * Calculate fee as a percentage of stake value.
 * Returns null if stakesValue is not available.
 */
export function getFeeRate(fee: number, stakesValue?: number): number | null {
  if (!stakesValue || stakesValue <= 0) return null;
  return (fee / stakesValue) * 100;
}

/**
 * Format fee display string with optional percentage.
 * E.g., "€1,500 (18.8%)" or "€1,500"
 */
export function formatFeeDisplay(fee: number, stakesValue?: number): string {
  const rate = getFeeRate(fee, stakesValue);
  const formatted = `€${fee.toLocaleString()}`;
  if (rate !== null) {
    return `${formatted} (${rate.toFixed(1)}%)`;
  }
  return formatted;
}

/**
 * Get recommended fee rate based on difficulty level.
 * Higher difficulty = higher fee percentage, reflecting the premium for complexity.
 * Rates decrease for larger stakes (as in real consulting).
 */
export function getRecommendedFeeRate(difficultyAvg: number, stakesValue: number): number {
  // Base rates by difficulty level (higher difficulty = higher rate)
  let baseRate: number;
  if (difficultyAvg <= 1.5) baseRate = 18;       // Beginner: 18%
  else if (difficultyAvg <= 2.5) baseRate = 10;   // Intermediate: 10%
  else if (difficultyAvg <= 3.5) baseRate = 5;    // Advanced: 5%
  else if (difficultyAvg <= 4.5) baseRate = 3;    // Expert: 3%
  else baseRate = 2;                               // Master: 2%

  // Scale down for very large deals (realistic: bigger deals = lower %)
  if (stakesValue >= 1_000_000_000) baseRate *= 0.3;     // €1B+: 0.6% max
  else if (stakesValue >= 100_000_000) baseRate *= 0.5;  // €100M+: 1.5% max
  else if (stakesValue >= 10_000_000) baseRate *= 0.7;   // €10M+: 3.5% max
  else if (stakesValue >= 1_000_000) baseRate *= 0.85;   // €1M+: 4.25% max
  else if (stakesValue >= 100_000) baseRate *= 1.0;      // €100K+: full rate

  return Math.max(0.1, baseRate); // Minimum 0.1%
}

export function getScoreGrade(score: number): { grade: string; color: string; description: string } {
  if (score >= 90) return { grade: 'S', color: 'text-yellow-400', description: 'Legendary' };
  if (score >= 80) return { grade: 'A', color: 'text-emerald-400', description: 'Masterful' };
  if (score >= 70) return { grade: 'B', color: 'text-cyan-400', description: 'Skilled' };
  if (score >= 55) return { grade: 'C', color: 'text-amber-400', description: 'Competent' };
  if (score >= 40) return { grade: 'D', color: 'text-orange-400', description: 'Developing' };
  return { grade: 'F', color: 'text-red-400', description: 'Needs Improvement' };
}
