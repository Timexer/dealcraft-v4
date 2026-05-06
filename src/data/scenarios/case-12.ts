import { Scenario } from './types';

export const case12: Scenario = {
  id: 'case-12',
  title: 'The Missing Shipment',
  subtitle: 'A convenient excuse hides an inconvenient truth',
  category: 'deception',
  tier: 3,
  fee: 12000,
  stakesLabel: '€4M supply contract',
  difficulty: {
    economicComplexity: 3,
    emotionalComplexity: 3,
    ethicalComplexity: 3,
    informationAsymmetry: 5,
    powerImbalance: 2,
    timePressure: 4,
    relationshipStakes: 3,
  },
  client: {
    name: 'BlueHarbor Trading',
    role: 'International trading company',
    avatar: '🚢',
    personality: {
      truthfulness: 60,
      ego: 45,
      riskTolerance: 40,
      patience: 35,
      trustSensitivity: 60,
      fairnessSensitivity: 55,
      authorityLevel: 55,
      emotionalVolatility: 30,
      preparationLevel: 60,
      relationshipOrientation: 50,
    },
  },
  counterparty: {
    name: 'PacificTraders',
    role: 'Export supplier',
    avatar: '📦',
    personality: {
      truthfulness: 25,
      ego: 50,
      riskTolerance: 55,
      patience: 40,
      trustSensitivity: 30,
      fairnessSensitivity: 35,
      authorityLevel: 60,
      emotionalVolatility: 50,
      preparationLevel: 70,
      relationshipOrientation: 30,
    },
  },
  briefing: {
    clientName: 'BlueHarbor Trading',
    clientRole: 'International trading company — procurement division',
    situation: 'BlueHarbor\'s critical shipment from PacificTraders is three weeks late. PacificTraders blames a port strike, claiming force majeure. But BlueHarbor\'s timeline analysis shows the delay started before the strike was announced. Something doesn\'t add up.',
    clientDemands: [
      'Immediate shipment or full refund',
      'Compensation for delay damages',
      'Transparent explanation of what actually happened',
    ],
    knownFacts: [
      'Shipment is 3 weeks late',
      'PacificTraders claims port strike as force majeure',
      'A port strike did occur, but it started 1 week ago — not 3 weeks ago',
      'Other PacificTraders clients received their shipments on time',
    ],
    missingInformation: [
      'Why is this specific shipment delayed when others weren\'t?',
      'Was the port strike really the cause?',
      'What was PacificTraders doing during those first two weeks?',
    ],
    timePressure: 'Client commitments depend on this shipment. 2 weeks before contractual penalties activate.',
    stakes: '€4M annual supply contract. BlueHarbor\'s reputation with downstream clients at risk.',
    clientEmotionalState: 'Suspicious, frustrated, feeling deceived but can\'t prove it yet',
  },
  surfaceDemand: 'PacificTraders blames a port strike for a 3-week shipment delay, invoking force majeure.',
  hiddenTruth: 'PacificTraders missed their own production deadline because they overcommitted to larger clients. They prioritized bigger orders and let BlueHarbor\'s shipment slide. The port strike was real but brief — it was a convenient cover for their own production failure. The timelines don\'t lie, but you need to verify independently.',
  issues: [
    { id: 'delay_cause', name: 'Delay Cause', description: 'Root cause of the shipment delay', clientPriority: 9, counterpartyPriority: 8, tradeability: 'low', possibleValues: ['Force majeure (strike)', 'Shared responsibility', 'Supplier production failure', 'Supplier prioritized others'] },
    { id: 'compensation', name: 'Delay Compensation', description: 'Financial compensation for the delay', clientPriority: 8, counterpartyPriority: 7, tradeability: 'medium', possibleValues: ['None', '5% credit', '10% credit', 'Full refund'] },
    { id: 'priority', name: 'Future Priority Status', description: 'Guaranteed priority for future shipments', clientPriority: 7, counterpartyPriority: 5, tradeability: 'high', possibleValues: ['None', 'Standard queue', 'Priority queue', 'Guaranteed priority'] },
    { id: 'transparency', name: 'Shipment Tracking', description: 'Real-time production and shipment tracking', clientPriority: 6, counterpartyPriority: 4, tradeability: 'high', possibleValues: ['No tracking', 'Periodic updates', 'Real-time tracking', 'Independent verification'] },
  ],
  batna: {
    clientBATNA: 'Find alternative supplier (3-month transition, higher costs)',
    clientBATNAValue: 1500000,
    clientReservationValue: 3000000,
    counterpartyBATNA: 'Lose BlueHarbor account, face reputation damage',
    counterpartyBATNAValue: 2000000,
    counterpartyReservationValue: 3500000,
    estimatedZOPALow: 2800000,
    estimatedZOPAHigh: 3800000,
    trueZOPALow: 2500000,
    trueZOPAHigh: 4200000,
  },
  investigationActions: [
    {
      id: 'inv_timeline', name: 'Analyze Shipping Timelines', description: 'Cross-reference PacificTraders\' claims with port records and shipment data',
      cost: 1, reveals: ['timeline_gap', 'production_failure'], riskLevel: 'low',
      responseText: 'Port records confirm: the strike started 8 days ago. PacificTraders\' shipment was already 13 days late when the strike began. The "force majeure" claim doesn\'t hold up. They missed their production deadline and used the strike as cover.',
    },
    {
      id: 'inv_other_clients', name: 'Check Other Client Shipments', description: 'Verify whether PacificTraders prioritized other clients',
      cost: 2, reveals: ['client_prioritization', 'capacity_issue'], riskLevel: 'medium',
      responseText: 'Two larger PacificTraders clients received their shipments on schedule during the same period. PacificTraders has limited production capacity and chose to prioritize bigger orders. BlueHarbor was de-prioritized without being informed.',
    },
  ],
  dialogueTree: [
    {
      id: 'start', speaker: 'narrator', text: 'PacificTraders\' representative, Chen, sits across the table looking confident. He has the force majeure documentation ready. But the timeline doesn\'t add up, and you both know it.', isAuto: true, nextNodeId: 'chen_opening',
    },
    {
      id: 'chen_opening', speaker: 'counterparty', text: '"The port strike was an act of God. Force majeure applies. We couldn\'t have predicted it, and we shouldn\'t be penalized for it."', choices: [
        { id: 'c1', text: '"The strike started 8 days ago. Your shipment was already 13 days late when it began. How do you explain that?"', type: 'investigative', nextNodeId: 'chen_caught', effects: { trust: -5, anger: 10, informationRevealed: ['timeline_gap'] } },
        { id: 'c2', text: '"I understand strikes are unpredictable. But I need to understand the full timeline."', type: 'diagnostic', nextNodeId: 'chen_evasive', effects: { trust: 5 } },
        { id: 'c3', text: '"We don\'t accept force majeure. You owe us compensation for the full delay."', type: 'aggressive_anchor', nextNodeId: 'chen_defiant', effects: { anger: 15, trust: -10 } },
      ],
    },
    {
      id: 'chen_caught', speaker: 'counterparty', text: '*pause* There were... production challenges before the strike. But the strike made everything worse. It\'s still force majeure.', choices: [
        { id: 'c4', text: '"Chen, your other clients got their shipments on time. Ours was the only one delayed before the strike. What really happened?"', type: 'investigative', nextNodeId: 'chen_admits', effects: { trust: 5, informationRevealed: ['client_prioritization'] } },
        { id: 'c5', text: '"What if we focus on fixing this going forward instead of arguing about the past?"', type: 'face_saving', nextNodeId: 'chen_relief', effects: { trust: 10, anger: -5 } },
      ],
    },
    {
      id: 'chen_evasive', speaker: 'counterparty', text: '"The timeline is complicated. There were pre-strike logistics issues, then the strike compounded them. The root cause is still force majeure."', choices: [
        { id: 'c6', text: '"Show me the production records. I need to verify the timeline independently."', type: 'investigative', nextNodeId: 'chen_caught', effects: { trust: -5, informationRevealed: ['timeline_gap'] } },
      ],
    },
    {
      id: 'chen_defiant', speaker: 'counterparty', text: '"We have our legal position. Force majeure is in the contract. If you want to challenge it, that\'s your prerogative."', choices: [
      { id: 'c7', text: '"I don\'t want a legal fight. I want the truth and a solution. What really happened?"', type: 'face_saving', nextNodeId: 'chen_caught', effects: { trust: 5, anger: -10 } },
    ],
    },
    {
      id: 'chen_admits', speaker: 'counterparty', text: '*sighs* We overcommitted. Bigger orders took priority. By the time we got to your shipment, we were already behind. Then the strike hit and... it was a convenient explanation. I\'m sorry.', choices: [
      { id: 'c8', text: '"I appreciate the honesty. Now let\'s fix this: compensation for the delay, priority status for future shipments, and real-time tracking. No more surprises."', type: 'package_offer', nextNodeId: 'ending_master', effects: { trust: 15, valueCreated: 20, valueClaimed: 15 } },
      { id: 'c9', text: '"Thank you for admitting that. We need compensation and a guarantee this won\'t happen again."', type: 'face_saving', nextNodeId: 'ending_cooperative', effects: { trust: 10, valueClaimed: 10, valueCreated: 10 } },
    ],
    },
    {
      id: 'chen_relief', speaker: 'counterparty', text: '"Forward-looking... yes. We want to keep the relationship. What do you propose?"', choices: [
      { id: 'c10', text: '"Priority status + real-time tracking + compensation for delay. And full transparency going forward."', type: 'package_offer', nextNodeId: 'ending_cooperative', effects: { trust: 10, valueCreated: 10, valueClaimed: 10 } },
    ],
    },
    {
      id: 'ending_master', speaker: 'narrator', text: '👑 MASTER OUTCOME: Compensation for delay + guaranteed priority status + real-time production tracking + independent verification rights. When timelines don\'t add up, verify the story independently.', isAuto: true,
    },
    {
      id: 'ending_cooperative', speaker: 'narrator', text: '🤝 COOPERATIVE WIN: Fair compensation and improved terms. The relationship continues with better safeguards.', isAuto: true,
    },
    {
      id: 'ending_hard_bargain', speaker: 'narrator', text: '⚡ HARD BARGAIN: Demanded full refund and threatened legal action. PacificTraders paid but the relationship is damaged. Future service may suffer.', isAuto: true,
    },
  ],
  endings: [
    { id: 'ending_master', type: 'master', title: 'Truth & Transparency', description: 'Uncovered the deception and built a stronger framework for the future.', scores: { clientEconomicValue: 85, jointValueCreated: 80, infoDiscovered: 90, relationshipPreserved: 80, ethicalIntegrity: 85, strategicDiscipline: 85 }, longTermConsequence: 'PacificTraders becomes more reliable under the new transparency framework. BlueHarbor gains priority status and never faces undisclosed delays again.' },
    { id: 'ending_cooperative', type: 'cooperative', title: 'Moving Forward', description: 'Reasonable deal that addresses the delay without fully exposing the deception.', scores: { clientEconomicValue: 65, jointValueCreated: 55, infoDiscovered: 55, relationshipPreserved: 70, ethicalIntegrity: 70, strategicDiscipline: 60 }, longTermConsequence: 'Relationship continues but without full trust. PacificTraders may try to obscure future issues.' },
    { id: 'ending_hard_bargain', type: 'hard_bargain', title: 'Compensation Extracted', description: 'Got money back but damaged the relationship and didn\'t fix the underlying problem.', scores: { clientEconomicValue: 50, jointValueCreated: 10, infoDiscovered: 30, relationshipPreserved: 20, ethicalIntegrity: 55, strategicDiscipline: 30 }, longTermConsequence: 'PacificTraders pays compensation but becomes adversarial. Future shipments may face "unforeseen" delays.' },
  ],
  postmortem: {
    masterSolution: 'Verify the timeline independently, confront with facts, and negotiate for structural changes: priority status, real-time tracking, and compensation.',
    keyHiddenFact: 'PacificTraders missed their production deadline because they prioritized larger clients. The port strike was a convenient cover story.',
    missedOpportunity: 'Accepting force majeure at face value means you never discover the real problem — your order isn\'t a priority.',
    lesson: 'When timelines don\'t add up, verify the story independently. A convenient excuse may hide an inconvenient truth.',
    bestPossibleDeal: 'Full compensation + guaranteed priority status + real-time tracking + independent verification rights.',
  },
  biasTraps: [
    { id: 'bias_vividness', type: 'vividness', description: 'The dramatic port strike story is vivid and memorable, making it easy to accept without verification.', warningText: '⚠️ VIVIDNESS BIAS: The port strike story is dramatic and convenient. But the data tells a different story. Check the timelines.', countermeasure: 'Always verify dramatic claims with data. The more vivid the excuse, the more important the verification.' },
  ],
};
