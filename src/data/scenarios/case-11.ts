import { Scenario } from './types';

export const case11: Scenario = {
  id: 'case-11',
  title: 'The Product Launch Clause',
  subtitle: 'A cancellation clause hiding a holiday panic',
  category: 'deadline',
  tier: 3,
  fee: 12000,
  stakesLabel: '€8M product launch',
  difficulty: {
    economicComplexity: 3,
    emotionalComplexity: 2,
    ethicalComplexity: 2,
    informationAsymmetry: 4,
    powerImbalance: 3,
    timePressure: 5,
    relationshipStakes: 3,
  },
  client: {
    name: 'AsterWear',
    role: 'Consumer tech company',
    avatar: '📱',
    personality: {
      truthfulness: 55,
      ego: 50,
      riskTolerance: 45,
      patience: 35,
      trustSensitivity: 55,
      fairnessSensitivity: 50,
      authorityLevel: 60,
      emotionalVolatility: 35,
      preparationLevel: 55,
      relationshipOrientation: 45,
    },
  },
  counterparty: {
    name: 'RetailMax',
    role: 'National retail chain',
    avatar: '🛍️',
    personality: {
      truthfulness: 40,
      ego: 55,
      riskTolerance: 30,
      patience: 25,
      trustSensitivity: 45,
      fairnessSensitivity: 40,
      authorityLevel: 70,
      emotionalVolatility: 45,
      preparationLevel: 60,
      relationshipOrientation: 35,
    },
  },
  briefing: {
    clientName: 'AsterWear',
    clientRole: 'Consumer tech company — retail partnerships',
    situation: 'AsterWear is launching a flagship wearable device. Their exclusive retail partner, RetailMax, insists on a cancellation clause that lets them walk away if the product isn\'t delivered 60 days before the holiday season. AsterWear considers this unacceptable — it puts all the risk on them.',
    clientDemands: [
      'Remove or soften the cancellation clause',
      'Maintain the exclusive retail partnership',
      'Launch on schedule without catastrophic risk',
    ],
    knownFacts: [
      'RetailMax demands cancellation rights if delivery is 60+ days late',
      'AsterWear\'s product is on track for October delivery',
      'The holiday shopping season is critical for first-year sales',
      'RetailMax is the only national chain offering prime shelf space',
    ],
    missingInformation: [
      'Why does RetailMax need 60 days specifically?',
      'What is RetailMax actually protecting against?',
      'Is there a way to address their concern without the clause?',
    ],
    timePressure: 'Holiday season starts in 5 months. Product must be on shelves by October.',
    stakes: '€8M in projected first-year sales. Exclusivity with the biggest retailer in the country.',
    clientEmotionalState: 'Frustrated by the clause, worried about losing the partnership, under launch pressure',
  },
  surfaceDemand: 'RetailMax demands cancellation rights if the product launch is delayed beyond 60 days before holiday season.',
  hiddenTruth: 'RetailMax isn\'t worried about the delivery date — they\'re worried about their holiday advertising investment. They\'ve already committed €3M to a holiday campaign featuring the AsterWear product. The cancellation clause is really about protecting their ad spend, not the shelf date. If AsterWear guarantees co-op advertising or campaign flexibility, the clause becomes unnecessary.',
  issues: [
    { id: 'cancellation', name: 'Cancellation Clause', description: 'Retailer\'s right to cancel if delivery is late', clientPriority: 9, counterpartyPriority: 7, tradeability: 'medium', possibleValues: ['Full cancellation right', '30-day grace period', 'Shared risk clause', 'No cancellation'] },
    { id: 'ad_support', name: 'Advertising Commitment', description: 'Co-op advertising and marketing support', clientPriority: 4, counterpartyPriority: 9, tradeability: 'high', possibleValues: ['None', '€500K co-op', '€1M co-op', 'Full campaign partnership'] },
    { id: 'exclusivity', name: 'Exclusivity Duration', description: 'Length of retail exclusivity', clientPriority: 7, counterpartyPriority: 8, tradeability: 'high', possibleValues: ['3 months', '6 months', '9 months', 'Full holiday season'] },
    { id: 'shelf_placement', name: 'Shelf Placement', description: 'In-store display and placement commitment', clientPriority: 8, counterpartyPriority: 5, tradeability: 'high', possibleValues: ['Standard placement', 'End-cap display', 'Featured window', 'Hero display + digital'] },
  ],
  batna: {
    clientBATNA: 'Distribute through smaller retailers (lower reach, slower growth)',
    clientBATNAValue: 3000000,
    clientReservationValue: 5000000,
    counterpartyBATNA: 'Feature a competitor\'s product (less innovative, weaker draw)',
    counterpartyBATNAValue: 4000000,
    counterpartyReservationValue: 6000000,
    estimatedZOPALow: 5000000,
    estimatedZOPAHigh: 7000000,
    trueZOPALow: 4500000,
    trueZOPAHigh: 8000000,
  },
  investigationActions: [
    {
      id: 'inv_ad_spend',
      name: 'Investigate RetailMax\'s Ad Campaign',
      description: 'Find out what RetailMax has committed to for holiday marketing',
      cost: 1,
      reveals: ['ad_investment', 'campaign_risk'],
      riskLevel: 'low',
      responseText: 'RetailMax has committed €3M to a holiday advertising campaign centered on the AsterWear product. TV spots, digital ads, and in-store displays are all in production. The cancellation clause is really insurance for this ad investment — if the product isn\'t there, the ads are wasted.',
    },
    {
      id: 'inv_competitor',
      name: 'Check Competitor Retail Deals',
      description: 'Understand what other retailers are offering',
      cost: 1,
      reveals: ['competitor_deals', 'market_position'],
      riskLevel: 'low',
      responseText: 'Two competitors have approached RetailMax with similar products but less innovative features. RetailMax chose AsterWear because it\'s the strongest product, but they need a backup plan. Understanding this reveals they WANT the product — they just need risk mitigation.',
    },
    {
      id: 'inv_supply_chain',
      name: 'Audit Supply Chain Reliability',
      description: 'Assess real delivery risk for the product launch',
      cost: 1,
      reveals: ['delivery_confidence', 'risk_factors'],
      riskLevel: 'low',
      responseText: 'AsterWear\'s supply chain is solid. Manufacturing is on track with 2 weeks of buffer. The real risk is only 10-15% — far lower than the cancellation clause implies. This data strengthens your negotiating position.',
    },
  ],
  dialogueTree: [
    {
      id: 'start', speaker: 'narrator', text: 'The RetailMax procurement team sits across the table. Their lead negotiator, Dana, has the cancellation clause highlighted in yellow. She looks like she\'s ready for a fight.', isAuto: true, nextNodeId: 'retailmax_opening',
    },
    {
      id: 'retailmax_opening', speaker: 'counterparty', text: '"The cancellation clause is non-negotiable. If we don\'t have the product on shelves 60 days before Black Friday, we need the right to walk. We can\'t risk empty shelf space during the biggest retail season."', choices: [
        { id: 'c1', text: '"Why 60 days specifically? What are you really protecting against?"', type: 'investigative', nextNodeId: 'retailmax_hesitates', effects: { trust: 10 } },
        { id: 'c2', text: '"That clause puts all the risk on us. It\'s a dealbreaker."', type: 'aggressive_anchor', nextNodeId: 'retailmax_pushback', effects: { anger: 10, trust: -10 } },
        { id: 'c3', text: '"I understand you need security. What if we addressed the real risk instead of a blanket cancellation right?"', type: 'face_saving', nextNodeId: 'retailmax_curious', effects: { trust: 10 } },
      ],
    },
    {
      id: 'retailmax_hesitates', speaker: 'counterparty', text: '"We\'ve committed significant resources to the holiday campaign. If the product isn\'t there, we\'re not just missing sales — we\'re wasting our entire marketing investment."', choices: [
        { id: 'c4', text: '"Your marketing investment — how much are we talking about?"', type: 'investigative', nextNodeId: 'retailmax_reveals', effects: { trust: 5, informationRevealed: ['ad_investment'] } },
        { id: 'c5', text: '"What if we guaranteed the campaign investment directly instead of the cancellation clause?"', type: 'package_offer', nextNodeId: 'retailmax_interested', effects: { trust: 15, valueCreated: 15 } },
      ],
    },
    {
      id: 'retailmax_pushback', speaker: 'counterparty', text: '"We\'re not trying to punish you. But we can\'t have our holiday strategy depend entirely on your delivery timeline. We need protection."', choices: [
        { id: 'c6', text: '"Fair enough. Let me understand what you\'re really protecting so we can find a smarter solution."', type: 'face_saving', nextNodeId: 'retailmax_curious', effects: { trust: 10, anger: -5 } },
      ],
    },
    {
      id: 'retailmax_curious', speaker: 'counterparty', text: '"What do you mean, addressed the real risk?"', choices: [
        { id: 'c7', text: '"Instead of cancellation rights, what if we guaranteed your advertising investment? If we\'re late, we cover your campaign costs. Plus co-op advertising support and full holiday exclusivity."', type: 'package_offer', nextNodeId: 'retailmax_interested', effects: { trust: 15, valueCreated: 20, informationRevealed: ['ad_investment'] } },
      ],
    },
    {
      id: 'retailmax_reveals', speaker: 'counterparty', text: '"€3M. We\'ve committed €3M to a holiday campaign with TV spots and digital ads featuring your product. If it\'s not on shelves, that money is gone."', choices: [
        { id: 'c8', text: '"Then let\'s protect that directly. We guarantee your ad investment if we\'re late. In exchange, we drop the cancellation clause and extend exclusivity through the full holiday season."', type: 'package_offer', nextNodeId: 'retailmax_hooked', effects: { trust: 20, valueCreated: 20, valueClaimed: 10 } },
      ],
    },
    {
      id: 'retailmax_interested', speaker: 'counterparty', text: '"Protecting our ad spend directly... that\'s actually smarter than a cancellation clause. We don\'t WANT to cancel — we want the product. We just can\'t afford to lose the marketing investment."', choices: [
        { id: 'c9', text: '"Exactly. Ad investment guarantee + co-op advertising partnership + full holiday exclusivity. No cancellation needed. Deal?"', type: 'package_offer', nextNodeId: 'ending_master', effects: { trust: 20, valueCreated: 20, valueClaimed: 15 } },
      ],
    },
    {
      id: 'retailmax_hooked', speaker: 'counterparty', text: '"That makes sense for both sides. We keep the product, you keep the partnership, and our investment is protected. I can sell this to my team."', choices: [
        { id: 'c10', text: '"Then we have a deal. No cancellation clause, ad guarantee, co-op partnership, full holiday exclusivity."', type: 'concession', nextNodeId: 'ending_master', effects: { trust: 15, valueClaimed: 15, valueCreated: 15 } },
      ],
    },
    {
      id: 'ending_master', speaker: 'narrator', text: '👑 MASTER OUTCOME: No cancellation clause + ad investment guarantee + co-op advertising partnership + full holiday exclusivity. A cancellation clause was really about protecting a €3M ad investment — and you addressed the fear directly.', isAuto: true,
    },
    {
      id: 'ending_cooperative', speaker: 'narrator', text: '🤝 COOPERATIVE WIN: Reduced cancellation window with some concessions. Fair deal, though the partnership could have been deeper.', isAuto: true,
    },
    {
      id: 'ending_hard_bargain', speaker: 'narrator', text: '⚡ HARD BARGAIN: Clause remains but with a grace period. Risk still falls heavily on AsterWear. Partnership is functional but fragile.', isAuto: true,
    },
  ],
  endings: [
    {
      id: 'ending_master', type: 'master', title: 'Investment Protection', description: 'You discovered the clause was about ad spend, not delivery. Replaced cancellation with guaranteed investment protection.',
      scores: { clientEconomicValue: 90, jointValueCreated: 85, infoDiscovered: 85, relationshipPreserved: 90, ethicalIntegrity: 85, strategicDiscipline: 85 },
      longTermConsequence: 'AsterWear launches successfully. RetailMax becomes a loyal partner. The co-op advertising doubles projected sales. Partnership extends to future products.',
    },
    {
      id: 'ending_cooperative', type: 'cooperative', title: 'Compromise Position', description: 'Shortened cancellation window with minor concessions.',
      scores: { clientEconomicValue: 65, jointValueCreated: 50, infoDiscovered: 45, relationshipPreserved: 65, ethicalIntegrity: 75, strategicDiscipline: 55 },
      longTermConsequence: 'Product launches but with residual risk. Partnership continues but without the depth of a true alliance.',
    },
    {
      id: 'ending_hard_bargain', type: 'hard_bargain', title: 'Risk Remains', description: 'Fought the clause but didn\'t address the root concern.',
      scores: { clientEconomicValue: 40, jointValueCreated: 15, infoDiscovered: 20, relationshipPreserved: 30, ethicalIntegrity: 60, strategicDiscipline: 25 },
      longTermConsequence: 'Clause remains a sword over AsterWear. Any supply chain hiccup could trigger cancellation. Stressful partnership.',
    },
  ],
  postmortem: {
    masterSolution: 'Replace the cancellation clause with an advertising investment guarantee. RetailMax doesn\'t want to cancel — they want to protect their €3M campaign. Address the fear, not the demand.',
    keyHiddenFact: 'The cancellation clause is about protecting a €3M advertising investment, not about the delivery date itself.',
    missedOpportunity: 'Fighting the clause as a binary yes/no misses the chance to create a deeper partnership through co-op advertising and extended exclusivity.',
    lesson: 'A cancellation clause may really be about protecting specific investments. Offer co-marketing guarantees instead.',
    bestPossibleDeal: 'No cancellation clause + ad investment guarantee + co-op advertising + full holiday exclusivity.',
  },
  biasTraps: [
    {
      id: 'bias_anchor', type: 'anchor_shock', description: 'The 60-day cancellation clause anchors you into negotiating the number of days instead of questioning the clause itself.',
      warningText: '⚠️ ANCHOR BIAS: Don\'t negotiate the number of days. Question what the clause is really protecting. The number may be irrelevant.',
      countermeasure: 'Ask what RetailMax is actually protecting against. The answer may lead to a completely different solution.',
    },
  ],
};
