import { Scenario, EndingScores, ReputationScores, PlayerStats, NegotiationTechnique } from '../data/scenarios/types';

// ─── Weight Configuration for Final Score ────────────────────────────────────
const SCORE_WEIGHTS = {
  clientEconomicValue: 0.25,
  jointValueCreated: 0.20,
  infoDiscovered: 0.15,
  relationshipPreserved: 0.15,
  ethicalIntegrity: 0.15,
  strategicDiscipline: 0.10,
} as const;

// ─── Final Score from Weighted Dimension Scores ──────────────────────────────
export function calculateFinalScore(scores: EndingScores): number {
  return Math.round(
    scores.clientEconomicValue * SCORE_WEIGHTS.clientEconomicValue +
    scores.jointValueCreated * SCORE_WEIGHTS.jointValueCreated +
    scores.infoDiscovered * SCORE_WEIGHTS.infoDiscovered +
    scores.relationshipPreserved * SCORE_WEIGHTS.relationshipPreserved +
    scores.ethicalIntegrity * SCORE_WEIGHTS.ethicalIntegrity +
    scores.strategicDiscipline * SCORE_WEIGHTS.strategicDiscipline
  );
}

// ─── Dynamic Score Calculation ───────────────────────────────────────────────
// Instead of using static ending scores, we compute scores based on actual
// player behavior during the negotiation. This makes every playthrough unique
// and ensures all dimensions are consistently scored out of 100.

export interface BehaviorContext {
  // Negotiation state at end of game
  trust: number;
  anger: number;
  patience: number;
  valueClaimed: number;
  valueCreated: number;
  relationshipImpact: number;
  ethicalImpact: number;
  clientSatisfaction: number;
  counterpartySatisfaction: number;
  concessionsGiven: string[];
  concessionsReceived: string[];
  biasTrapsTriggered: string[];
  choicesMade: string[];
  informationRevealed: string[];
  // Investigation
  discoveredFacts: string[];
  totalFactsAvailable: number;
  // Strategy preparation
  batnaEstimate: number;
  openingStrategy: string;
  assumptionsCount: number;
  // Techniques used
  techniquesUsed: NegotiationTechnique[];
  // Challenge mode modifier
  challengeMode: 'none' | 'speed' | 'limited_choices' | 'ethics_lock';
}

/**
 * Calculate dynamic scores based on actual player behavior.
 * 
 * Scoring Logic Overview:
 * ───────────────────────
 * Each dimension starts from a BASE determined by the ending type,
 * then gets MODIFIED by the player's actual choices and behaviors.
 * 
 * The base represents the "floor" for that ending type - even the worst
 * master deal is still better than the best bad deal.
 * 
 * Modifiers range from -15 to +15, allowing differentiation within
 * an ending type while keeping the ending as the primary score driver.
 * 
 * All scores are clamped to 0-100.
 */
export function calculateDynamicScores(
  endingType: string,
  baseScores: EndingScores,
  behavior: BehaviorContext,
): EndingScores {
  // Start with the ending's base scores
  const scores = { ...baseScores };

  // ── 1. Client Economic Value ────────────────────────────────────────────
  // How well you protected/advanced your client's financial interests
  // Key drivers: value claimed, client satisfaction, alternative preparedness
  {
    let mod = 0;
    // Value claimed bonus: 0-8 points for claiming 0-50+ value
    mod += Math.min(8, Math.round(behavior.valueClaimed / 6));
    // Client satisfaction bonus: up to 5 points for high satisfaction
    if (behavior.clientSatisfaction >= 80) mod += 5;
    else if (behavior.clientSatisfaction >= 60) mod += 3;
    else if (behavior.clientSatisfaction < 30) mod -= 3;
    // Alternative preparation bonus: having a BATNA estimate shows preparation
    if (behavior.batnaEstimate > 0) mod += 2;
    // Penalty for making many concessions without receiving any
    if (behavior.concessionsGiven.length > 2 && behavior.concessionsReceived.length === 0) mod -= 3;
    scores.clientEconomicValue = clampScore(scores.clientEconomicValue + mod);
  }

  // ── 2. Joint Value Created ──────────────────────────────────────────────
  // How much additional value you created through creative problem-solving
  // Key drivers: value created, counterparty satisfaction, balanced concessions
  {
    let mod = 0;
    // Value created bonus: 0-8 points for creating 0-50+ value
    mod += Math.min(8, Math.round(behavior.valueCreated / 6));
    // Counterparty satisfaction: high means you found solutions for both sides
    if (behavior.counterpartySatisfaction >= 80) mod += 4;
    else if (behavior.counterpartySatisfaction >= 60) mod += 2;
    else if (behavior.counterpartySatisfaction < 30) mod -= 2;
    // Balanced concessions: giving AND receiving = logrolling (value creation)
    if (behavior.concessionsGiven.length > 0 && behavior.concessionsReceived.length > 0) mod += 3;
    // Techniques that create value
    if (behavior.techniquesUsed.includes('ackerman')) mod += 2;
    if (behavior.techniquesUsed.includes('tactical_empathy')) mod += 1;
    scores.jointValueCreated = clampScore(scores.jointValueCreated + mod);
  }

  // ── 3. Info Discovered ──────────────────────────────────────────────────
  // How effectively you uncovered hidden information
  // Key drivers: facts discovered, info revealed, investigative techniques
  {
    let mod = 0;
    // Investigation facts bonus: up to 6 points for discovering facts
    const factRatio = behavior.totalFactsAvailable > 0
      ? behavior.discoveredFacts.length / behavior.totalFactsAvailable
      : 0;
    mod += Math.round(factRatio * 6);
    // Information revealed during negotiation: up to 4 points
    mod += Math.min(4, behavior.informationRevealed.length * 1.5);
    // Investigative techniques bonus
    if (behavior.techniquesUsed.includes('calibrated_q')) mod += 2;
    if (behavior.techniquesUsed.includes('mirror')) mod += 1;
    if (behavior.techniquesUsed.includes('label')) mod += 1;
    // Assumptions logged = shows investigative mindset
    if (behavior.assumptionsCount >= 3) mod += 2;
    else if (behavior.assumptionsCount >= 1) mod += 1;
    scores.infoDiscovered = clampScore(scores.infoDiscovered + mod);
  }

  // ── 4. Relationship Preserved ───────────────────────────────────────────
  // How well you maintained the relationship with the counterparty
  // Key drivers: trust level, anger level, relationship impact, empathy
  {
    let mod = 0;
    // Trust: high trust = good relationship management
    if (behavior.trust >= 80) mod += 5;
    else if (behavior.trust >= 60) mod += 3;
    else if (behavior.trust < 30) mod -= 4;
    // Anger: high anger = damaged relationship
    if (behavior.anger <= 20) mod += 3;
    else if (behavior.anger >= 70) mod -= 5;
    else if (behavior.anger >= 50) mod -= 2;
    // Direct relationship impact modifier
    if (behavior.relationshipImpact >= 20) mod += 4;
    else if (behavior.relationshipImpact >= 10) mod += 2;
    else if (behavior.relationshipImpact < -10) mod -= 4;
    else if (behavior.relationshipImpact < 0) mod -= 2;
    // Empathetic techniques preserve relationships
    if (behavior.techniquesUsed.includes('tactical_empathy')) mod += 2;
    if (behavior.techniquesUsed.includes('label')) mod += 1;
    if (behavior.techniquesUsed.includes('that_right')) mod += 1;
    scores.relationshipPreserved = clampScore(scores.relationshipPreserved + mod);
  }

  // ── 5. Ethical Integrity ────────────────────────────────────────────────
  // Whether you maintained ethical standards
  // Key drivers: ethical impact, techniques used, bias traps
  {
    let mod = 0;
    // Direct ethical impact modifier
    if (behavior.ethicalImpact >= 15) mod += 6;
    else if (behavior.ethicalImpact >= 5) mod += 3;
    else if (behavior.ethicalImpact < -10) mod -= 8;
    else if (behavior.ethicalImpact < 0) mod -= 4;
    // Threats and aggressive tactics reduce ethical score
    const aggressiveChoices = behavior.choicesMade.filter(c =>
      c.includes('threat') || c.includes('aggressive')
    ).length;
    mod -= Math.min(5, aggressiveChoices * 2);
    // Ethical techniques boost
    if (behavior.techniquesUsed.includes('accusation_audit')) mod += 2; // transparency
    if (behavior.techniquesUsed.includes('feelings_first')) mod += 1; // respect
    // Ethics lock challenge bonus (playing with ethics constraint = higher score)
    if (behavior.challengeMode === 'ethics_lock') mod += 3;
    scores.ethicalIntegrity = clampScore(scores.ethicalIntegrity + mod);
  }

  // ── 6. Strategic Discipline ─────────────────────────────────────────────
  // How well you stuck to your strategy and avoided biases
  // Key drivers: bias traps, patience, strategy preparation, techniques
  {
    let mod = 0;
    // Bias traps triggered: each one reduces discipline score
    mod -= Math.min(10, behavior.biasTrapsTriggered.length * 3);
    // Patience: high patience = disciplined approach
    if (behavior.patience >= 70) mod += 3;
    else if (behavior.patience >= 50) mod += 1;
    else if (behavior.patience < 30) mod -= 3;
    // Strategy preparation: having a plan shows discipline
    if (behavior.openingStrategy && behavior.openingStrategy.length > 0) mod += 2;
    if (behavior.batnaEstimate > 0) mod += 1;
    if (behavior.assumptionsCount >= 2) mod += 1; // documenting assumptions = discipline
    // Strategic techniques show discipline
    if (behavior.techniquesUsed.includes('strategic_no')) mod += 2;
    if (behavior.techniquesUsed.includes('ackerman')) mod += 1;
    if (behavior.techniquesUsed.includes('calibrated_q')) mod += 1;
    // Challenge mode bonuses: harder constraints = more discipline needed
    if (behavior.challengeMode === 'speed') mod += 2; // completing under time = disciplined
    if (behavior.challengeMode === 'limited_choices') mod += 2; // working within constraints
    scores.strategicDiscipline = clampScore(scores.strategicDiscipline + mod);
  }

  return scores;
}

function clampScore(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)));
}

// ─── Ending Determination ────────────────────────────────────────────────────

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
  if (totalValue < 20 && !highTrust) {
    return 'bad_deal';
  }
  return 'cooperative';
}

// ─── Reputation System ───────────────────────────────────────────────────────

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

// ─── Stats Delta Calculation ─────────────────────────────────────────────────

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

// ─── Utility Functions ────────────────────────────────────────────────────────

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

export function getFeeRate(fee: number, stakesValue?: number): number | null {
  if (!stakesValue || stakesValue <= 0) return null;
  return (fee / stakesValue) * 100;
}

export function formatFeeDisplay(fee: number, stakesValue?: number): string {
  const rate = getFeeRate(fee, stakesValue);
  const formatted = `€${fee.toLocaleString()}`;
  if (rate !== null) {
    return `${formatted} (${rate.toFixed(1)}%)`;
  }
  return formatted;
}

export function getRecommendedFeeRate(difficultyAvg: number, stakesValue: number): number {
  let baseRate: number;
  if (difficultyAvg <= 1.5) baseRate = 18;
  else if (difficultyAvg <= 2.5) baseRate = 10;
  else if (difficultyAvg <= 3.5) baseRate = 5;
  else if (difficultyAvg <= 4.5) baseRate = 3;
  else baseRate = 2;

  if (stakesValue >= 1_000_000_000) baseRate *= 0.3;
  else if (stakesValue >= 100_000_000) baseRate *= 0.5;
  else if (stakesValue >= 10_000_000) baseRate *= 0.7;
  else if (stakesValue >= 1_000_000) baseRate *= 0.85;
  else if (stakesValue >= 100_000) baseRate *= 1.0;

  return Math.max(0.1, baseRate);
}

export function getScoreGrade(score: number): { grade: string; color: string; description: string } {
  if (score >= 90) return { grade: 'S', color: 'text-yellow-400', description: 'Legendary' };
  if (score >= 80) return { grade: 'A', color: 'text-emerald-400', description: 'Masterful' };
  if (score >= 70) return { grade: 'B', color: 'text-cyan-400', description: 'Skilled' };
  if (score >= 55) return { grade: 'C', color: 'text-amber-400', description: 'Competent' };
  if (score >= 40) return { grade: 'D', color: 'text-orange-400', description: 'Developing' };
  return { grade: 'F', color: 'text-red-400', description: 'Needs Improvement' };
}

// ─── Score Explanation Generator ─────────────────────────────────────────────
// Generates human-readable explanations for why a score is what it is

export function getScoreExplanation(
  dimension: keyof EndingScores,
  score: number,
  behavior: BehaviorContext,
): string {
  const explanations: string[] = [];

  switch (dimension) {
    case 'clientEconomicValue': {
      if (behavior.valueClaimed >= 30) explanations.push(`Strong value claimed (+${Math.min(8, Math.round(behavior.valueClaimed / 6))} pts)`);
      if (behavior.clientSatisfaction >= 80) explanations.push('Client highly satisfied (+5 pts)');
      else if (behavior.clientSatisfaction < 30) explanations.push('Client dissatisfied (-3 pts)');
      if (behavior.batnaEstimate > 0) explanations.push('Alternative prepared (+2 pts)');
      if (behavior.concessionsGiven.length > 2 && behavior.concessionsReceived.length === 0) explanations.push('One-sided concessions (-3 pts)');
      break;
    }
    case 'jointValueCreated': {
      if (behavior.valueCreated >= 30) explanations.push(`Creative value created (+${Math.min(8, Math.round(behavior.valueCreated / 6))} pts)`);
      if (behavior.counterpartySatisfaction >= 80) explanations.push('Counterparty highly satisfied (+4 pts)');
      if (behavior.concessionsGiven.length > 0 && behavior.concessionsReceived.length > 0) explanations.push('Mutual concessions/logrolling (+3 pts)');
      break;
    }
    case 'infoDiscovered': {
      const factRatio = behavior.totalFactsAvailable > 0 ? behavior.discoveredFacts.length / behavior.totalFactsAvailable : 0;
      if (factRatio >= 0.7) explanations.push(`Thorough investigation (+${Math.round(factRatio * 6)} pts)`);
      if (behavior.informationRevealed.length >= 2) explanations.push(`Revealed ${behavior.informationRevealed.length} key insights during negotiation`);
      if (behavior.techniquesUsed.includes('calibrated_q')) explanations.push('Used calibrated questions (+2 pts)');
      if (behavior.assumptionsCount >= 3) explanations.push('Logged assumptions showing investigative mindset (+2 pts)');
      break;
    }
    case 'relationshipPreserved': {
      if (behavior.trust >= 80) explanations.push('Built high trust (+5 pts)');
      else if (behavior.trust < 30) explanations.push('Trust eroded (-4 pts)');
      if (behavior.anger <= 20) explanations.push('Kept emotions calm (+3 pts)');
      else if (behavior.anger >= 70) explanations.push('Escalated tensions (-5 pts)');
      if (behavior.relationshipImpact >= 20) explanations.push('Strong positive relationship impact (+4 pts)');
      else if (behavior.relationshipImpact < -10) explanations.push('Damaged relationship (-4 pts)');
      if (behavior.techniquesUsed.includes('tactical_empathy')) explanations.push('Used tactical empathy (+2 pts)');
      break;
    }
    case 'ethicalIntegrity': {
      if (behavior.ethicalImpact >= 15) explanations.push('Strong ethical conduct (+6 pts)');
      else if (behavior.ethicalImpact < -10) explanations.push('Ethical concerns raised (-8 pts)');
      const aggressiveChoices = behavior.choicesMade.filter(c => c.includes('threat') || c.includes('aggressive')).length;
      if (aggressiveChoices > 0) explanations.push(`${aggressiveChoices} aggressive tactic${aggressiveChoices > 1 ? 's' : ''} used (-${Math.min(5, aggressiveChoices * 2)} pts)`);
      if (behavior.challengeMode === 'ethics_lock') explanations.push('Completed with ethics constraint (+3 pts)');
      break;
    }
    case 'strategicDiscipline': {
      if (behavior.biasTrapsTriggered.length > 0) explanations.push(`${behavior.biasTrapsTriggered.length} bias trap${behavior.biasTrapsTriggered.length > 1 ? 's' : ''} triggered (-${Math.min(10, behavior.biasTrapsTriggered.length * 3)} pts)`);
      if (behavior.patience >= 70) explanations.push('Maintained patience (+3 pts)');
      else if (behavior.patience < 30) explanations.push('Lost patience (-3 pts)');
      if (behavior.openingStrategy) explanations.push('Had opening strategy (+2 pts)');
      if (behavior.batnaEstimate > 0) explanations.push('Prepared alternative (+1 pt)');
      break;
    }
  }

  if (explanations.length === 0) {
    explanations.push('Base score from negotiation outcome');
  }

  return explanations.join(' · ');
}
