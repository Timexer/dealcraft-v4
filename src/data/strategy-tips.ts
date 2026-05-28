export const ADVISOR_TIPS: Record<string, string> = {
  fundamentals: 'Focus on understanding their underlying interests rather than arguing over positions.',
  hidden_interests: 'Listen carefully for what they AREN\'T saying. The real issue is often buried.',
  multi_issue: 'Look for trades. What\'s cheap for you to give but valuable for them to get?',
  deadline: 'Don\'t let the clock force a bad deal. Remember your BATNA.',
  deception: 'Verify everything. Ask questions you already know the answers to as a test.',
  power_imbalance: 'You don\'t need more power, you just need a better alternative.',
  relationship: 'Hard on the problem, soft on the people. Preserve the relationship for tomorrow.',
  ethics: 'A deal won through deceit is a vulnerability, not a victory.',
  ugly: 'Don\'t react to provocation. Name their tactic to neutralize its power.',
  master: 'Combine every skill you\'ve learned. The master sees the whole board.',
};

export const CATEGORY_TIPS: Record<string, { icon: string; title: string; tips: string[] }> = {
  fundamentals: {
    icon: '📚',
    title: 'Fundamentals Strategy',
    tips: [
      'Always identify your best alternative before entering negotiation — a strong alternative gives you leverage.',
      'Anchor high but justify your position with objective criteria.',
      'Listen more than you speak in the opening phase.',
    ],
  },
  hidden_interests: {
    icon: '🔍',
    title: 'Hidden Interests Strategy',
    tips: [
      'Ask diagnostic questions to uncover what the other side truly values.',
      'Look for differences in risk preferences — they create trading opportunities.',
      "Don't assume their priorities match their stated positions.",
    ],
  },
  multi_issue: {
    icon: '🎯',
    title: 'Multi-Issue Strategy',
    tips: [
      'Never negotiate issues one at a time — package them for logrolling.',
      'Identify which issues matter more to you vs. the other side.',
      'Create contingency contracts when you disagree about future outcomes.',
    ],
  },
  deadline: {
    icon: '⏰',
    title: 'Deadline Strategy',
    tips: [
      'Never reveal your true deadline — it becomes a weapon against you.',
      'Use time pressure strategically: let the other side feel the clock.',
      'Prepare your best alternative before the deadline approaches.',
    ],
  },
  deception: {
    icon: '🎭',
    title: 'Deception Defense',
    tips: [
      'Verify claims independently — trust but verify.',
      "Use contingent agreements to test the other side's assertions.",
      'Watch for inconsistencies between their words and actions.',
    ],
  },
  power_imbalance: {
    icon: '⚖️',
    title: 'Power Balance Strategy',
    tips: [
      'Your BATNA is your greatest source of power — strengthen it before negotiating.',
      "Don't negotiate against yourself by making unilateral concessions.",
      'Find areas where you have unique value that the stronger party needs.',
    ],
  },
  relationship: {
    icon: '🤝',
    title: 'Relationship Strategy',
    tips: [
      'Separate the people from the problem — be soft on the person, hard on the issue.',
      'Use face-saving language: "I understand your position" before disagreeing.',
      'Build trust incrementally through small commitments.',
    ],
  },
  ethics: {
    icon: '⚖️',
    title: 'Ethical Strategy',
    tips: [
      'Ethical negotiation builds long-term reputation and repeat business.',
      'Deception may win a single deal but destroys future opportunities.',
      'Use objective standards and fair procedures to legitimize your proposals.',
    ],
  },
  ugly: {
    icon: '🔥',
    title: 'Ugly Negotiation Strategy',
    tips: [
      'Stay calm under pressure — emotional reactions are weapons used against you.',
      'Name the tactic: "I notice we\'re being pressed for an immediate decision."',
      'Always have your alternative ready — your best fallback if talks fail.',
    ],
  },
  master: {
    icon: '👑',
    title: 'Master Strategy',
    tips: [
      'Combine every technique — alternatives, logrolling, contingencies, and relationship.',
      'Read the whole board: economic value, emotional stakes, and future implications.',
      'The master creates value that neither side saw coming.',
    ],
  },
};

export const BATNA_TIPS: Record<string, { text: string; variant: 'low' | 'medium' | 'high' }> = {
  low: { text: '⚠️ Your alternative seems weak — consider improving your options before negotiating.', variant: 'low' },
  medium: { text: '💡 A moderate alternative gives you some leverage. Can you strengthen it further?', variant: 'medium' },
  high: { text: '✅ A strong alternative gives you confidence. Don\'t accept less than you deserve.', variant: 'high' },
};

export const STRATEGY_TIPS: Record<string, string> = {
  make_first_offer: '🎯 Making the first offer anchors the negotiation. Set an ambitious but justifiable anchor.',
  invite_their_offer: '👀 Letting them go first reveals information — but risks being anchored.',
  diagnostic_questions: '🔍 Diagnostic questions uncover hidden interests before you commit to a position.',
  build_rapport: '🤝 Building rapport creates trust — essential for value-creating negotiations.',
};

// Map store strategy IDs to STRATEGY_TIPS keys
export const STRATEGY_ID_MAP: Record<string, string> = {
  first_offer: 'make_first_offer',
  invite_offer: 'invite_their_offer',
  diagnostic: 'diagnostic_questions',
  rapport: 'build_rapport',
};
