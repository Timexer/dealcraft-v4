import type { EndingScores, PlayerStats, ReputationScores, NegotiationState } from '@/data/scenarios/types';

// ─── Career Tier Names & Descriptions ──────────────────────────────────────────
/** Display names for each career tier (1-indexed) */
export const TIER_NAMES: Record<number, string> = {
  1: 'Junior Associate',
  2: 'Deal Associate',
  3: 'Senior Negotiator',
  4: 'Crisis Partner',
  5: 'Master Negotiator',
};

/** Short descriptions for each career tier (1-indexed) */
export const TIER_DESCRIPTIONS: Record<number, string> = {
  1: 'Small disputes, simple BATNA/ZOPA, one or two issues',
  2: 'Corporate clients, multi-issue contracts, hidden interests',
  3: 'Higher stakes, deception, aggressive counterparts, internal politics',
  4: 'Public pressure, moral ambiguity, multiple parties',
  5: 'Global, historical-scale, multi-party, high-consequence negotiations',
};

// ─── Category Display Constants ───────────────────────────────────────────────
/** Tailwind badge color classes for each scenario category */
export const CATEGORY_COLORS: Record<string, string> = {
  fundamentals: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  hidden_interests: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  multi_issue: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  deadline: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  deception: 'bg-red-500/20 text-red-400 border-red-500/30',
  power_imbalance: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  relationship: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  ugly: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  ethics: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  master: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

/** Human-readable labels for each scenario category */
export const CATEGORY_LABELS: Record<string, string> = {
  fundamentals: 'Fundamentals',
  hidden_interests: 'Hidden Interests',
  multi_issue: 'Multi-Issue Deals',
  deadline: 'Deadline Pressure',
  deception: 'Deception',
  power_imbalance: 'Power Imbalance',
  relationship: 'Relationship & Reputation',
  ugly: 'Ugly Negotiations',
  ethics: 'Ethics',
  master: 'Master Cases',
};

// ─── Tier Progression ────────────────────────────────────────────────────────
/** Number of completed cases required to reach each tier (1-indexed) */
export const TIER_THRESHOLDS: Record<number, number> = {
  1: 3,
  2: 8,
  3: 15,
  4: 22,
  5: 30,
};

/** Ordered threshold array for computed tier lookups */
export const TIER_THRESHOLD_LIST = [3, 8, 15, 22, 30];

/** Maximum career tier */
export const MAX_CAREER_TIER = 5;

/** Derive career tier from completed cases count */
export function getTierFromCases(casesCompleted: number): number {
  if (casesCompleted < TIER_THRESHOLD_LIST[0]) return 1;
  if (casesCompleted < TIER_THRESHOLD_LIST[1]) return 2;
  if (casesCompleted < TIER_THRESHOLD_LIST[2]) return 3;
  if (casesCompleted < TIER_THRESHOLD_LIST[3]) return 4;
  return 5;
}

// ─── Score Grading ───────────────────────────────────────────────────────────
/** Score thresholds for grade assignment */
export const GRADE_THRESHOLDS = {
  S: 90,
  A: 80,
  B: 70,
  C: 55,
  D: 40,
} as const;

/** Grade badge Tailwind color classes */
export const GRADE_BADGE_COLORS: Record<string, string> = {
  S: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  A: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  B: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  C: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  D: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  F: 'bg-red-500/20 text-red-400 border-red-500/40',
};

/** Grade letter to emoji icon */
export const GRADE_ICON_MAP: Record<string, string> = {
  S: '👑',
  A: '🌟',
  B: '⭐',
  C: '✓',
  D: '↑',
  F: '✗',
};

// ─── Score Bar Color Thresholds ──────────────────────────────────────────────
export const SCORE_BAR_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50,
} as const;

export const getScoreBarColor = (value: number) => {
  if (value >= SCORE_BAR_THRESHOLDS.HIGH) return 'bg-emerald-500';
  if (value >= SCORE_BAR_THRESHOLDS.MEDIUM) return 'bg-amber-500';
  return 'bg-red-500';
};

export const getScoreBarBg = (value: number) => {
  if (value >= SCORE_BAR_THRESHOLDS.HIGH) return 'bg-emerald-500/20';
  if (value >= SCORE_BAR_THRESHOLDS.MEDIUM) return 'bg-amber-500/20';
  return 'bg-red-500/20';
};

// ─── Score Dimensions (Detail Sheet) ─────────────────────────────────────────
export const SCORE_DIMENSIONS: { key: keyof EndingScores; label: string }[] = [
  { key: 'clientEconomicValue', label: 'Client Economic Value' },
  { key: 'jointValueCreated', label: 'Joint Value Created' },
  { key: 'infoDiscovered', label: 'Info Discovered' },
  { key: 'relationshipPreserved', label: 'Relationship Preserved' },
  { key: 'ethicalIntegrity', label: 'Ethical Integrity' },
  { key: 'strategicDiscipline', label: 'Strategic Discipline' },
];

// ─── Category Bar Colors (Mini Chart) ────────────────────────────────────────
export const CATEGORY_BAR_COLORS: Record<string, string> = {
  fundamentals: 'bg-emerald-500',
  hidden_interests: 'bg-violet-500',
  multi_issue: 'bg-cyan-500',
  deadline: 'bg-orange-500',
  deception: 'bg-red-500',
  power_imbalance: 'bg-amber-500',
  relationship: 'bg-pink-500',
  ugly: 'bg-rose-500',
  ethics: 'bg-teal-500',
  master: 'bg-yellow-500',
};

// ─── Stat Card Gradients ─────────────────────────────────────────────────────
export const STAT_GRADIENTS = [
  'from-cyan-500/8 via-cyan-500/3 to-transparent',
  'from-emerald-500/8 via-emerald-500/3 to-transparent',
  'from-violet-500/8 via-violet-500/3 to-transparent',
];

// ─── Outcome Badge Configuration ─────────────────────────────────────────────
export const OUTCOME_BADGE_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  master: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', icon: 'Crown', label: 'Master' },
  cooperative: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', icon: 'Handshake', label: 'Cooperative' },
  hard_bargain: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/40', icon: 'Shield', label: 'Hard Bargain' },
  bad_deal: { color: 'bg-red-500/20 text-red-400 border-red-500/40', icon: 'AlertTriangle', label: 'Bad Deal' },
  strategic_no_deal: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40', icon: 'Footprints', label: 'Strategic No Deal' },
  ethical_failure: { color: 'bg-rose-500/20 text-rose-400 border-rose-500/40', icon: 'AlertTriangle', label: 'Ethical Failure' },
  no_deal_bad: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/40', icon: 'AlertTriangle', label: 'No Deal (Bad)' },
};

// ─── Streak System ───────────────────────────────────────────────────────────
/** Minimum streak length before bonus kicks in */
export const STREAK_BONUS_MIN = 3;

/** Maximum streak multiplier (1 + bonus) */
export const STREAK_MULTIPLIER_CAP = 1.5;

/** Bonus per streak level above minimum */
export const STREAK_BONUS_PER_LEVEL = 0.05;

/** Streak milestone names */
export const STREAK_MILESTONES: Record<number, { name: string; emoji: string }> = {
  3: { name: 'Bronze Negotiator', emoji: '🔥' },
  5: { name: 'Silver Negotiator', emoji: '🔥' },
  7: { name: 'Gold Negotiator', emoji: '👑' },
  10: { name: 'Platinum Negotiator', emoji: '👑' },
};

// ─── Default Game State Values ───────────────────────────────────────────────
export const DEFAULT_INVESTIGATION_POINTS = 5;

export const INITIAL_UNLOCKED_CASES = ['case-01', 'case-02', 'case-03'];

export const DEFAULT_STATS: PlayerStats = {
  preparation: 10,
  valueClaiming: 10,
  valueCreation: 10,
  investigation: 10,
  emotionalControl: 10,
  ethicalJudgment: 10,
  powerStrategy: 10,
  relationshipMgmt: 10,
  crisisHandling: 10,
  culturalAwareness: 10,
};

export const DEFAULT_REPUTATION: ReputationScores = {
  shark: 0,
  architect: 0,
  detective: 0,
  diplomat: 0,
  closer: 0,
  ethicist: 0,
  fixer: 0,
};

export const DEFAULT_NEGOTIATION: NegotiationState = {
  trust: 50,
  anger: 20,
  patience: 70,
  currentDialogueNodeId: 'start',
  choicesMade: [],
  informationRevealed: [],
  valueClaimed: 0,
  valueCreated: 0,
  relationshipImpact: 0,
  ethicalImpact: 0,
  clientSatisfaction: 50,
  counterpartySatisfaction: 50,
  concessionsGiven: [],
  concessionsReceived: [],
  biasTrapsTriggered: [],
  issuesResolved: {},
};

// ─── Achievement Thresholds ──────────────────────────────────────────────────
export const ACHIEVEMENT_THRESHOLDS = {
  PERFECT_SCORE: 90,
  REPUTATION_MILESTONE: 15,
  COOPERATIVE_COUNT: 5,
  CASES_FIRST: 1,
  CASES_RISING_STAR: 5,
  CASES_DEAL_MAKER: 10,
  CASES_VETERAN: 20,
} as const;

// ─── UI Constants ────────────────────────────────────────────────────────────
/** Default SVG progress ring color (amber-500 hex) */
export const PROGRESS_RING_COLOR = '#f59e0b';
