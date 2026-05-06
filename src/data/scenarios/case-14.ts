import { Scenario } from './types';

export const case14: Scenario = {
  id: 'case-14',
  title: 'The Vendor With Two Stories',
  subtitle: 'When different teams hear different truths',
  category: 'deception',
  tier: 3,
  fee: 12000,
  stakesLabel: '€3M software contract',
  difficulty: {
    economicComplexity: 3,
    emotionalComplexity: 2,
    ethicalComplexity: 4,
    informationAsymmetry: 5,
    powerImbalance: 2,
    timePressure: 3,
    relationshipStakes: 3,
  },
  client: {
    name: 'MetroTransit',
    role: 'Metropolitan transit authority',
    avatar: '🚇',
    personality: {
      truthfulness: 65,
      ego: 40,
      riskTolerance: 30,
      patience: 45,
      trustSensitivity: 60,
      fairnessSensitivity: 60,
      authorityLevel: 60,
      emotionalVolatility: 25,
      preparationLevel: 50,
      relationshipOrientation: 55,
    },
  },
  counterparty: {
    name: 'TechFlow',
    role: 'Software vendor (Sales VP: Marcus Webb)',
    avatar: '💻',
    personality: {
      truthfulness: 25,
      ego: 65,
      riskTolerance: 55,
      patience: 30,
      trustSensitivity: 30,
      fairnessSensitivity: 30,
      authorityLevel: 70,
      emotionalVolatility: 45,
      preparationLevel: 75,
      relationshipOrientation: 25,
    },
  },
  briefing: {
    clientName: 'MetroTransit',
    clientRole: 'Metropolitan transit authority — IT procurement',
    situation: 'MetroTransit is evaluating TechFlow\'s transit management platform. The sales team promised real-time analytics and predictive maintenance to procurement. But the technical team told MetroTransit\'s engineers these features are "on the roadmap" for next year. The stories don\'t match.',
    clientDemands: [
      'Clarify which features exist now vs. future promises',
      'Get honest assessment of platform capabilities',
      'Contract that protects against vaporware',
    ],
    knownFacts: [
      'Sales promises real-time analytics and predictive maintenance',
      'Technical team says these are "roadmap features"',
      'The base platform is functional and proven',
      'Contract language is vague about delivery timelines',
    ],
    missingInformation: [
      'Which features actually exist today?',
      'What\'s the realistic timeline for roadmap features?',
      'Is TechFlow deliberately misleading or just optimistic?',
    ],
    timePressure: 'Current system needs replacement within 6 months. RFP deadline approaching.',
    stakes: '€3M software contract. Transit system reliability depends on this platform.',
    clientEmotionalState: 'Confused by contradictory information, suspicious, under time pressure',
  },
  surfaceDemand: 'TechFlow\'s sales team promises capabilities that their technical team says don\'t exist yet.',
  hiddenTruth: 'TechFlow is overselling capabilities to win the contract. Their sales team is trained to present roadmap features as current capabilities during procurement. The "real-time analytics" are basic dashboards. "Predictive maintenance" is a proof-of-concept. They\'re not lying exactly — they\'re presenting a future vision as a present reality. The contract needs to be specific about what\'s delivered when.',
  issues: [
    { id: 'capabilities', name: 'Feature Verification', description: 'Which features are current vs. future', clientPriority: 10, counterpartyPriority: 6, tradeability: 'low', possibleValues: ['As pitched', 'Current only', 'Current + committed roadmap', 'Current + penalty-backed roadmap'] },
    { id: 'contract_terms', name: 'Contract Specificity', description: 'How specific the contract is about deliverables', clientPriority: 8, counterpartyPriority: 7, tradeability: 'medium', possibleValues: ['Vague language', 'Feature list only', 'Feature list + dates', 'Feature list + dates + penalties'] },
    { id: 'price', name: 'Pricing', description: 'Contract price and structure', clientPriority: 7, counterpartyPriority: 8, tradeability: 'medium', possibleValues: ['Full price upfront', 'Base + feature modules', 'Milestone payments', 'Pay-per-feature'] },
    { id: 'escalation', name: 'Escalation Rights', description: 'Right to escalate if features are delayed', clientPriority: 6, counterpartyPriority: 4, tradeability: 'high', possibleValues: ['None', 'Service credits', 'Price reduction', 'Contract termination right'] },
  ],
  batna: {
    clientBATNA: 'Select different vendor (6-month delay, less feature-rich)',
    clientBATNAValue: 1200000,
    clientReservationValue: 2500000,
    counterpartyBATNA: 'Lose contract to competitor (weaker market position)',
    counterpartyBATNAValue: 1500000,
    counterpartyReservationValue: 2200000,
    estimatedZOPALow: 2200000,
    estimatedZOPAHigh: 2800000,
    trueZOPALow: 2000000,
    trueZOPAHigh: 3000000,
  },
  investigationActions: [
    {
      id: 'inv_demo', name: 'Demand Live Demo', description: 'Require a live demonstration of every claimed feature',
      cost: 1, reveals: ['feature_gap', 'roadmap_vs_reality'], riskLevel: 'low',
      responseText: 'Live demo reveals: basic dashboards exist but "real-time analytics" is limited to 15-minute delayed data. "Predictive maintenance" is a PowerPoint concept — no working prototype. The base platform is solid but the advanced features are months away.',
    },
    {
      id: 'inv_references', name: 'Contact Reference Clients', description: 'Talk to existing TechFlow customers about their experience',
      cost: 1, reveals: ['client_experience', 'delivery_track_record'], riskLevel: 'low',
      responseText: 'Reference clients confirm: TechFlow\'s base platform is reliable. But every client reports that "roadmap features" took 12-18 months longer than promised. One client said, "They sell the vision and deliver the foundation. The extras come eventually, but don\'t plan on them."',
    },
  ],
  dialogueTree: [
    {
      id: 'start', speaker: 'narrator', text: 'Marcus Webb from TechFlow is smooth, polished, and confident. Your engineering team has already warned you: the features he\'s promising don\'t match what TechFlow\'s technical team described.', isAuto: true, nextNodeId: 'marcus_opening',
    },
    {
      id: 'marcus_opening', speaker: 'counterparty', text: '"Our platform delivers real-time analytics and predictive maintenance out of the box. It\'s the most advanced transit management solution on the market."', choices: [
      { id: 'c1', text: '"Marcus, our engineers spoke with your technical team. They described those features as \'roadmap.\' Which is it?"', type: 'investigative', nextNodeId: 'marcus_deflects', effects: { trust: -5, informationRevealed: ['feature_gap'] } },
      { id: 'c2', text: '"We\'d like a live demo of every feature you\'re promising. Can you arrange that?"', type: 'diagnostic', nextNodeId: 'marcus_hesitates', effects: { trust: 5 } },
      { id: 'c3', text: '"Let\'s write the contract to reflect exactly what exists today and what\'s coming later."', type: 'face_saving', nextNodeId: 'marcus_cautious', effects: { trust: 10, valueCreated: 5 } },
    ],
    },
    {
      id: 'marcus_deflects', speaker: 'counterparty', text: '"The engineering team is conservative — they always qualify everything. The features work. They\'re just being refined for general release."', choices: [
      { id: 'c4', text: '"Then you won\'t mind a live demo and contract language that specifies delivery dates with penalties."', type: 'package_offer', nextNodeId: 'marcus_cornered', effects: { trust: 5, valueClaimed: 10, valueCreated: 10 } },
      { id: 'c5', text: '"\'Being refined\' and \'exist\' are different things. Let\'s align on what\'s real."', type: 'diagnostic', nextNodeId: 'marcus_admits', effects: { trust: 10 } },
    ],
    },
    {
      id: 'marcus_hesitates', speaker: 'counterparty', text: '"A live demo... of course. But some features are in the final stages of optimization. The demo might not show their full capability."', choices: [
      { id: 'c6', text: '"Show us what exists today. We\'ll contract for that, with milestones for what\'s coming."', type: 'face_saving', nextNodeId: 'marcus_admits', effects: { trust: 10, valueCreated: 10 } },
    ],
    },
    {
      id: 'marcus_cautious', speaker: 'counterparty', text: '"Contract specifics... sure. But we need flexibility on timelines. Software development has uncertainties."', choices: [
      { id: 'c7', text: '"We understand uncertainty. That\'s why we structure: current features at full price, roadmap features as milestone payments with service credits for delays. You deliver, you get paid."', type: 'package_offer', nextNodeId: 'marcus_accepts', effects: { trust: 15, valueCreated: 20, valueClaimed: 15 } },
    ],
    },
    {
      id: 'marcus_cornered', speaker: 'counterparty', text: '*shifts* Penalties are unusual for software contracts... but I can see you\'ve done your homework. What specifically do you propose?', choices: [
      { id: 'c8', text: '"Base platform at current price. Roadmap features as paid modules with delivery dates and service credits. Escalation rights if critical features are more than 90 days late."', type: 'package_offer', nextNodeId: 'marcus_accepts', effects: { trust: 10, valueCreated: 15, valueClaimed: 10 } },
    ],
    },
    {
      id: 'marcus_admits', speaker: 'counterparty', text: '*sighs* Alright. The advanced analytics are 15-minute delayed right now. Predictive maintenance is in development — probably Q3. The base platform is production-ready. I was presenting our roadmap as our current state."', choices: [
      { id: 'c9', text: '"I appreciate the honesty. Let\'s contract for what exists today, with milestone payments for roadmap features. Fair deal that protects both sides."', type: 'face_saving', nextNodeId: 'ending_master', effects: { trust: 20, valueCreated: 20, valueClaimed: 15 } },
    ],
    },
    {
      id: 'marcus_accepts', speaker: 'counterparty', text: '"Milestone structure... that\'s actually reasonable. We get paid when we deliver, you get protection. I can sell this internally."', choices: [
      { id: 'c10', text: '"Deal. Current features at base price, roadmap features as milestones, service credits for delays."', type: 'concession', nextNodeId: 'ending_master', effects: { trust: 15, valueClaimed: 15, valueCreated: 15 } },
    ],
    },
    { id: 'ending_master', speaker: 'narrator', text: '👑 MASTER OUTCOME: Contract for current features + milestone payments for roadmap + service credits for delays. When different stakeholders hear different stories, align all parties before signing.', isAuto: true },
    { id: 'ending_cooperative', speaker: 'narrator', text: '🤝 COOPERATIVE WIN: Reduced contract with basic features. Adequate but no advanced capabilities yet.', isAuto: true },
    { id: 'ending_hard_bargain', speaker: 'narrator', text: '⚡ HARD BARGAIN: Demanded all features upfront. TechFlow couldn\'t deliver. Contract collapsed.', isAuto: true },
  ],
  endings: [
    { id: 'ending_master', type: 'master', title: 'Aligned Expectations', description: 'Honest contract that separates current from future, with protections for both sides.', scores: { clientEconomicValue: 85, jointValueCreated: 80, infoDiscovered: 85, relationshipPreserved: 80, ethicalIntegrity: 90, strategicDiscipline: 85 }, longTermConsequence: 'TechFlow delivers roadmap features on schedule (motivated by milestone payments). MetroTransit gets a reliable platform with predictable upgrades. Partnership deepens.' },
    { id: 'ending_cooperative', type: 'cooperative', title: 'Basic Deal', description: 'Contracted only for current features, missing the roadmap opportunity.', scores: { clientEconomicValue: 60, jointValueCreated: 45, infoDiscovered: 55, relationshipPreserved: 65, ethicalIntegrity: 75, strategicDiscipline: 55 }, longTermConsequence: 'Functional but limited platform. Advanced features require a new contract negotiation later.' },
    { id: 'ending_hard_bargain', type: 'hard_bargain', title: 'All or Nothing', description: 'Demanded everything upfront. Got nothing.', scores: { clientEconomicValue: 25, jointValueCreated: 0, infoDiscovered: 40, relationshipPreserved: 15, ethicalIntegrity: 50, strategicDiscipline: 15 }, longTermConsequence: 'Contract falls apart. MetroTransit must start the procurement process over. 6-month delay.' },
  ],
  postmortem: {
    masterSolution: 'Separate current capabilities from roadmap. Contract for what exists today, with milestone payments and service credits for future features.',
    keyHiddenFact: 'TechFlow presents roadmap features as current capabilities during sales. The base platform is real; the advanced features are months away.',
    missedOpportunity: 'Signing a contract based on the sales pitch without verification means paying for features that don\'t exist.',
    lesson: 'When different stakeholders hear different stories, someone is being deceived. Align all parties before signing.',
    bestPossibleDeal: 'Current features at base price + milestone payments for roadmap features + service credits for delays.',
  },
  biasTraps: [
    { id: 'bias_vividness', type: 'vividness', description: 'The polished demo and sales presentation make future features feel real and immediate.', warningText: '⚠️ VIVIDNESS BIAS: A great demo of "coming soon" features isn\'t the same as working software. Demand a live demo of actual features.', countermeasure: 'Separate what you can see working today from what you\'re told is coming. Verify independently.' },
  ],
};
