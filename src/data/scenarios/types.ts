export interface DifficultyRating {
  economicComplexity: number;
  emotionalComplexity: number;
  ethicalComplexity: number;
  informationAsymmetry: number;
  powerImbalance: number;
  timePressure: number;
  relationshipStakes: number;
}

export interface PersonalityTraits {
  truthfulness: number;
  ego: number;
  riskTolerance: number;
  patience: number;
  trustSensitivity: number;
  fairnessSensitivity: number;
  authorityLevel: number;
  emotionalVolatility: number;
  preparationLevel: number;
  relationshipOrientation: number;
}

export interface CharacterProfile {
  name: string;
  role: string;
  personality: PersonalityTraits;
  avatar: string;
}

export interface NegotiableIssue {
  id: string;
  name: string;
  description: string;
  clientPriority: number;
  counterpartyPriority: number;
  tradeability: 'low' | 'medium' | 'high';
  possibleValues: string[];
  resolved?: boolean;
  resolvedValue?: string;
}

export type BATNAStrength = 'strong' | 'moderate' | 'weak';

export interface BATNAInfo {
  clientBATNA: string;                          // Alternative action description (text-first, not monetary)
  clientBATNAValue: number;                     // Financial equivalent (optional secondary, not BATNA itself)
  clientBATNAStrength?: BATNAStrength;           // Strength of client's alternative (scenario-based, not monetary)
  clientReservationValue: number;               // Walk-away point — minimum acceptable outcome
  clientAspirationPrice?: number;               // Target outcome — ambitious but realistic goal
  counterpartyBATNA: string;                    // Counterparty's alternative action description
  counterpartyBATNAValue: number;               // Counterparty's financial equivalent
  counterpartyBATNAStrength?: BATNAStrength;     // Strength of counterparty's alternative
  counterpartyReservationValue: number;         // Counterparty's walk-away point
  estimatedZOPALow: number;
  estimatedZOPAHigh: number;
  trueZOPALow: number;
  trueZOPAHigh: number;
}

// ─── Display Labels (Microcopy) ──────────────────────────────────────
// Centralized microcopy so all components use the same terminology.
// BATNA = action-first, text-first, strength-based.
// Reservation Value = numeric walk-away threshold.
// Aspiration Price = target goal, not minimum.
// ZOPA = overlap between reservation values.

export const SECTION_LABELS = {
  batna: 'Best Alternative if No Deal',
  reservationValue: 'Walk-Away Point',
  aspirationPrice: 'Target Outcome',
  zopa: 'Possible Deal Zone',
} as const;

export const SECTION_DEFINITIONS = {
  batna: 'What you will realistically do if this negotiation fails.',
  reservationValue: 'The minimum outcome you can accept before choosing your alternative.',
  aspirationPrice: 'Your ideal realistic result if the negotiation goes well.',
  zopa: 'The estimated range where both sides may still prefer a deal over walking away.',
} as const;

export const SECTION_HELPERS = {
  batnaCard: 'BATNA is an action, not a price. Describe the best realistic next step if no agreement is reached.',
  batnaStrength: 'How strong is that alternative in practice, given cost, speed, leverage, and risk?',
  batnaMonetary: 'Optional: estimate the financial effect of your alternative. This is not the BATNA itself, only one way to compare options.',
  reservationValue: 'Set the point where you would stop negotiating and take your BATNA instead.',
  aspirationPrice: 'Set your ambitious but credible target, not your fantasy number.',
  zopa: 'This zone is based on reservation values, not BATNAs.',
} as const;

export const SECTION_TOOLTIPS = {
  batna: 'Your BATNA is your best realistic fallback plan if talks collapse. It may involve money, time, reputation, legal action, delay, or a different partner.',
  reservationValue: 'This is your walk-away threshold. If the deal drops below this point, your BATNA should be better.',
  aspirationPrice: 'Your aspiration is where you want to land. It guides your strategy but is not your minimum.',
  zopa: 'ZOPA exists when your estimated walk-away point and theirs still leave overlap.',
} as const;

export const INLINE_WARNINGS = {
  rvBelowBatnaEquiv: 'Your walk-away point is below your BATNA monetary equivalent. Recheck whether your threshold is too low.',
  noZopa: 'No clear deal zone yet. You may need better information, different issues, or a no-deal strategy.',
  nonMonetaryBatna: 'This case includes non-monetary value. Do not treat BATNA as cash only.',
} as const;

export const ZOPA_LEGEND = {
  clientRV: 'Your walk-away point',
  counterpartyRV: 'Their estimated walk-away point',
  batnaEquiv: 'BATNA monetary estimate',
  zopaZone: 'Possible deal zone',
  yourRV: 'Your walk-away estimate',
  yourAspiration: 'Your target outcome',
} as const;

export interface InvestigationAction {
  id: string;
  name: string;
  description: string;
  cost: number;
  reveals: string[];
  riskLevel: 'low' | 'medium' | 'high';
  responseText: string;
}

export interface StateEffect {
  trust?: number;
  anger?: number;
  patience?: number;
  informationRevealed?: string[];
  concessionMade?: string;
  valueClaimed?: number;
  valueCreated?: number;
  relationshipImpact?: number;
  ethicalImpact?: number;
  reputationImpact?: number;
  clientSatisfaction?: number;
  counterpartySatisfaction?: number;
}

export type NegotiationTechnique =
  | 'mirror'          // Repeat last 1-3 words (Voss Ch2)
  | 'label'           // "It seems like..." / "It sounds like..." (Voss Ch3)
  | 'calibrated_q'    // "How/What" open questions (Voss Ch7)
  | 'accusation_audit' // Preemptively naming negatives (Voss Ch3)
  | 'tactical_empathy' // Understanding feelings strategically (Voss Ch3)
  | 'strategic_no'    // Using "No" to create safety (Voss Ch4)
  | 'that_right'      // Seeking "That's right" not "You're right" (Voss Ch5)
  | 'ackerman'        // Incremental offer system (Voss Ch9)
  | 'black_swan'      // Revealing unknown unknowns (Voss Ch10)
  | 'loss_aversion'   // Framing as loss prevention (Voss Ch6)
  | 'contribution'    // Mapping contribution not blame (Difficult Conversations Ch4)
  | 'intent_impact'   // Separating intent from impact (Difficult Conversations Ch3)
  | 'third_story'     // Starting from neutral observer (Difficult Conversations Ch8)
  | 'feelings_first'  // Addressing feelings before substance (Difficult Conversations Ch5)
  | 'identity_ground' // Grounding identity before conversation (Difficult Conversations Ch6)
  | 'none';           // No specific technique

export type CounterpartyStyle = 'analyst' | 'accommodator' | 'assertive';

export interface DialogueChoice {
  id: string;
  text: string;
  type: 'diagnostic' | 'aggressive_anchor' | 'face_saving' | 'concession' | 'silence' | 'investigative' | 'threat' | 'empathy' | 'walk_away' | 'package_offer';
  nextNodeId: string;
  effects: StateEffect;
  requirement?: { type: 'info_discovered'; factId: string } | { type: 'min_trust'; value: number } | { type: 'max_anger'; value: number };
  disabledReason?: string;
  technique?: NegotiationTechnique;
}

export interface DialogueNode {
  id: string;
  speaker: 'client' | 'counterparty' | 'narrator' | 'advisor';
  text: string;
  choices?: DialogueChoice[];
  isAuto?: boolean;
  effects?: StateEffect;
  nextNodeId?: string;
}

export interface EndingScores {
  clientEconomicValue: number;
  jointValueCreated: number;
  infoDiscovered: number;
  relationshipPreserved: number;
  ethicalIntegrity: number;
  strategicDiscipline: number;
}

export interface CaseEnding {
  id: string;
  type: 'bad_deal' | 'no_deal_bad' | 'hard_bargain' | 'cooperative' | 'master' | 'ethical_failure' | 'strategic_no_deal';
  title: string;
  description: string;
  scores: EndingScores;
  longTermConsequence: string;
}

export interface PostmortemInfo {
  masterSolution: string;
  keyHiddenFact: string;
  missedOpportunity: string;
  lesson: string;
  bestPossibleDeal: string;
}

export interface BiasEvent {
  id: string;
  type: 'fixed_pie' | 'escalation' | 'vividness' | 'egocentrism' | 'overconfidence' | 'regret_aversion' | 'anchor_shock';
  triggerDialogueNodeId?: string;
  description: string;
  warningText: string;
  countermeasure: string;
}

export interface CaseBriefing {
  clientName: string;
  clientRole: string;
  situation: string;
  clientDemands: string[];
  knownFacts: string[];
  missingInformation: string[];
  timePressure: string;
  stakes: string;
  clientEmotionalState: string;
}

export interface BlackSwan {
  id: string;
  fact: string;         // The hidden fact
  discoveredVia: string[]; // investigation action IDs that can reveal it
  dialogueNodeId?: string; // dialogue node that can reveal it (optional)
  impact: string;       // What happens when discovered
  value: number;        // Score bonus for discovering it (10-30 points)
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  category: 'fundamentals' | 'hidden_interests' | 'multi_issue' | 'deadline' | 'deception' | 'power_imbalance' | 'relationship' | 'ugly' | 'ethics' | 'master';
  tier: number;
  difficulty: DifficultyRating;
  client: CharacterProfile;
  counterparty: CharacterProfile;
  briefing: CaseBriefing;
  surfaceDemand: string;
  hiddenTruth: string;
  issues: NegotiableIssue[];
  batna: BATNAInfo;
  investigationActions: InvestigationAction[];
  dialogueTree: DialogueNode[];
  endings: CaseEnding[];
  postmortem: PostmortemInfo;
  biasTraps: BiasEvent[];
  blackSwans?: BlackSwan[];
  counterpartyStyle: CounterpartyStyle;
  fee: number;
  stakesLabel: string;
  stakesValue?: number; // Numeric stake value for fee percentage calculation
}

export interface PlayerStats {
  preparation: number;
  valueClaiming: number;
  valueCreation: number;
  investigation: number;
  emotionalControl: number;
  ethicalJudgment: number;
  powerStrategy: number;
  relationshipMgmt: number;
  crisisHandling: number;
  culturalAwareness: number;
}

export interface ReputationScores {
  shark: number;
  architect: number;
  detective: number;
  diplomat: number;
  closer: number;
  ethicist: number;
  fixer: number;
}

export type GamePhase = 'title' | 'dashboard' | 'intake' | 'strategy' | 'investigation' | 'negotiation' | 'postmortem' | 'career' | 'case_history';

export interface NegotiationState {
  trust: number;
  anger: number;
  patience: number;
  currentDialogueNodeId: string;
  choicesMade: string[];
  informationRevealed: string[];
  valueClaimed: number;
  valueCreated: number;
  relationshipImpact: number;
  ethicalImpact: number;
  clientSatisfaction: number;
  counterpartySatisfaction: number;
  concessionsGiven: string[];
  concessionsReceived: string[];
  biasTrapsTriggered: string[];
  issuesResolved: Record<string, string>;
  endingTriggered?: string;
}

export interface TranscriptEntry {
  nodeId: string;
  speaker: string;
  text: string;
  chosenChoiceId?: string;
  chosenChoiceText?: string;
  availableChoices?: { id: string; text: string; type: string; wasTaken: boolean }[];
}

export interface CaseResult {
  scenarioId: string;
  outcome: string;
  scores: EndingScores;
  finalScore: number;
  choicesMade: string[];
  hiddenFactsFound: string[];
  postmortemRead: boolean;
  transcript?: TranscriptEntry[];
  elapsedTime?: number; // seconds spent in negotiation
}

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

export const CHOICE_TYPE_STYLES: Record<string, { color: string; icon: string; label: string }> = {
  diagnostic: { color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30', icon: '🔍', label: 'Diagnostic' },
  aggressive_anchor: { color: 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30', icon: '💪', label: 'Assertive' },
  face_saving: { color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30', icon: '🤝', label: 'Face-saving' },
  concession: { color: 'bg-slate-500/20 border-slate-500/40 text-slate-300 hover:bg-slate-500/30', icon: '↩️', label: 'Concession' },
  silence: { color: 'bg-slate-600/20 border-slate-600/40 text-slate-400 hover:bg-slate-600/30', icon: '😐', label: 'Silence' },
  investigative: { color: 'bg-violet-500/20 border-violet-500/40 text-violet-300 hover:bg-violet-500/30', icon: '🔎', label: 'Investigative' },
  threat: { color: 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30', icon: '⚠️', label: 'Threat' },
  empathy: { color: 'bg-pink-500/20 border-pink-500/40 text-pink-300 hover:bg-pink-500/30', icon: '💙', label: 'Empathy' },
  walk_away: { color: 'bg-red-600/20 border-red-600/40 text-red-400 hover:bg-red-600/30', icon: '🚪', label: 'Walk Away' },
  package_offer: { color: 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30', icon: '📦', label: 'Package' },
};

export const TIER_NAMES: Record<number, string> = {
  1: 'Junior Associate',
  2: 'Deal Associate',
  3: 'Senior Negotiator',
  4: 'Crisis Partner',
  5: 'Master Negotiator',
};

export const TIER_DESCRIPTIONS: Record<number, string> = {
  1: 'Small disputes, simple BATNA/ZOPA, one or two issues',
  2: 'Corporate clients, multi-issue contracts, hidden interests',
  3: 'Higher stakes, deception, aggressive counterparts, internal politics',
  4: 'Public pressure, moral ambiguity, multiple parties',
  5: 'Global, historical-scale, multi-party, high-consequence negotiations',
};
