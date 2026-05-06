import { Scenario } from './types';

export const case13: Scenario = {
  id: 'case-13',
  title: 'The Inflated Valuation',
  subtitle: '"Basically signed" is not signed',
  category: 'deception',
  tier: 3,
  fee: 12000,
  stakesLabel: '€20M investment',
  difficulty: {
    economicComplexity: 4,
    emotionalComplexity: 2,
    ethicalComplexity: 3,
    informationAsymmetry: 5,
    powerImbalance: 2,
    timePressure: 3,
    relationshipStakes: 3,
  },
  client: {
    name: 'VentureBuyer',
    role: 'Growth equity firm',
    avatar: '💰',
    personality: {
      truthfulness: 55,
      ego: 50,
      riskTolerance: 55,
      patience: 40,
      trustSensitivity: 50,
      fairnessSensitivity: 50,
      authorityLevel: 65,
      emotionalVolatility: 25,
      preparationLevel: 65,
      relationshipOrientation: 35,
    },
  },
  counterparty: {
    name: 'CloudSync',
    role: 'SaaS startup (CEO: Raj Patel)',
    avatar: '☁️',
    personality: {
      truthfulness: 30,
      ego: 70,
      riskTolerance: 65,
      patience: 30,
      trustSensitivity: 35,
      fairnessSensitivity: 30,
      authorityLevel: 75,
      emotionalVolatility: 50,
      preparationLevel: 80,
      relationshipOrientation: 25,
    },
  },
  briefing: {
    clientName: 'VentureBuyer',
    clientRole: 'Growth equity firm — investment team',
    situation: 'VentureBuyer is evaluating a €20M investment in CloudSync, a SaaS startup. CEO Raj Patel claims a major enterprise customer has "basically signed" and uses this to justify the €20M valuation. But VentureBuyer\'s diligence has found inconsistencies in the customer pipeline.',
    clientDemands: [
      'Accurate valuation based on verified revenue',
      'Transparency about customer pipeline status',
      'Investment terms that reflect real risk',
    ],
    knownFacts: [
      'CloudSync claims a major enterprise deal is "basically signed"',
      'Valuation is based partly on this expected revenue',
      'CloudSync\'s technology is solid and well-regarded',
      'Current revenue is €2M ARR — growth depends on new customers',
    ],
    missingInformation: [
      'What does "basically signed" actually mean?',
      'Is there a Letter of Intent or just verbal interest?',
      'What\'s the true revenue pipeline?',
    ],
    timePressure: 'Investment window closes in 30 days. Other investors are circling.',
    stakes: '€20M investment. Valuation accuracy could mean the difference between a 3x and 10x return.',
    clientEmotionalState: 'Cautiously optimistic, skeptical of the "basically signed" claim, under pressure to deploy capital',
  },
  surfaceDemand: 'CloudSync claims a major customer has "basically signed," justifying a €20M valuation.',
  hiddenTruth: 'The "basically signed" customer is still in preliminary discussions with no LOI, no budget approval, and no timeline. The startup is using verbal assurances to inflate perceived value. The technology is genuine, but the revenue projections are speculative. Raj is a charismatic founder who believes his own pitch — he\'s not malicious, but he\'s dangerously optimistic.',
  issues: [
    { id: 'valuation', name: 'Valuation', description: 'Company valuation for investment', clientPriority: 9, counterpartyPriority: 9, tradeability: 'medium', possibleValues: ['€12M', '€15M', '€18M', '€20M'] },
    { id: 'milestones', name: 'Revenue Milestones', description: 'Investment tied to revenue verification', clientPriority: 8, counterpartyPriority: 5, tradeability: 'high', possibleValues: ['No milestones', 'Signed LOI trigger', 'Revenue threshold', 'Customer count threshold'] },
    { id: 'tranche', name: 'Tranche Structure', description: 'Investment disbursed in tranches', clientPriority: 7, counterpartyPriority: 6, tradeability: 'high', possibleValues: ['Full upfront', '2 tranches', '3 tranches', '4 tranches'] },
    { id: 'governance', name: 'Board Seats', description: 'Investor board representation', clientPriority: 6, counterpartyPriority: 7, tradeability: 'medium', possibleValues: ['No board seat', '1 observer', '1 voting seat', '1 voting + 1 observer'] },
  ],
  batna: {
    clientBATNA: 'Invest in different startup (less interesting technology)',
    clientBATNAValue: 8000000,
    clientReservationValue: 15000000,
    counterpartyBATNA: 'Accept lower valuation from other investors',
    counterpartyBATNAValue: 12000000,
    counterpartyReservationValue: 16000000,
    estimatedZOPALow: 14000000,
    estimatedZOPAHigh: 18000000,
    trueZOPALow: 12000000,
    trueZOPAHigh: 18000000,
  },
  investigationActions: [
    {
      id: 'inv_customer', name: 'Verify Customer Status', description: 'Independently verify the status of the "basically signed" customer',
      cost: 2, reveals: ['no_loi', 'preliminary_only'], riskLevel: 'medium',
      responseText: 'The "basically signed" customer has had preliminary meetings only. No LOI, no budget approval, no procurement process initiated. The contact at the customer company called it "exploratory." The deal is months away from signing, if it happens at all.',
    },
    {
      id: 'inv_pipeline', name: 'Audit Full Pipeline', description: 'Review the complete customer pipeline with verified status',
      cost: 1, reveals: ['pipeline_inflation', 'real_arr'], riskLevel: 'low',
      responseText: 'CloudSync\'s pipeline is 40% inflated. Several "probable" deals are actually at the awareness stage. Real ARR is solid at €2M, and the technology is genuinely competitive, but the growth story depends on deals that don\'t exist yet.',
    },
  ],
  dialogueTree: [
    {
      id: 'start', speaker: 'narrator', text: 'Raj Patel is charismatic and confident. His pitch is polished — you can see why other investors are interested. But the "basically signed" claim doesn\'t pass the smell test.', isAuto: true, nextNodeId: 'raj_opening',
    },
    {
      id: 'raj_opening', speaker: 'counterparty', text: '"Our enterprise customer is basically signed. It\'s a €5M ARR deal that transforms our trajectory. At €20M valuation, you\'re getting in before the inflection point."', choices: [
        { id: 'c1', text: '"What does \'basically signed\' mean exactly? Is there an LOI?"', type: 'investigative', nextNodeId: 'raj_evasive', effects: { trust: 5, informationRevealed: ['no_loi'] } },
        { id: 'c2', text: '"€20M seems steep for €2M ARR. Even with that deal, it\'s aggressive."', type: 'aggressive_anchor', nextNodeId: 'raj_defends', effects: { anger: 10, trust: -5 } },
        { id: 'c3', text: '"I like the technology. Let\'s structure the investment to reflect both the potential and the uncertainty."', type: 'face_saving', nextNodeId: 'raj_open', effects: { trust: 10 } },
      ],
    },
    {
      id: 'raj_evasive', speaker: 'counterparty', text: '"The LOI is a formality. We\'ve had multiple meetings, their CIO loves the product. It\'s moving through their procurement process."', choices: [
      { id: 'c4', text: '"Raj, I checked. There\'s no LOI and no budget approval. It\'s exploratory. I can\'t value a company on exploratory conversations."', type: 'investigative', nextNodeId: 'raj_cornered', effects: { trust: -5, anger: 10, informationRevealed: ['preliminary_only'] } },
      { id: 'c5', text: '"What if we structured the valuation as a tranched investment? Full valuation if the deal closes, adjusted if it doesn\'t?"', type: 'package_offer', nextNodeId: 'raj_considers', effects: { trust: 10, valueCreated: 15 } },
    ],
    },
    {
      id: 'raj_defends', speaker: 'counterparty', text: '"The valuation includes the pipeline. Every startup is valued on forward revenue. You\'re getting a discount."', choices: [
      { id: 'c6', text: '"Forward revenue that\'s verified. Let\'s tie the valuation to actual milestones."', type: 'face_saving', nextNodeId: 'raj_considers', effects: { trust: 5, valueCreated: 10 } },
    ],
    },
    {
      id: 'raj_open', speaker: 'counterparty', text: '"Structure that reflects uncertainty... I\'m listening. What do you have in mind?"', choices: [
      { id: 'c7', text: '"€15M base valuation with €5M in milestone tranches triggered by verified revenue. Board seat for oversight. You get the full valuation if the pipeline delivers."', type: 'package_offer', nextNodeId: 'raj_hooked', effects: { trust: 15, valueCreated: 20, valueClaimed: 15 } },
    ],
    },
    {
      id: 'raj_cornered', speaker: 'counterparty', text: '*pause* The procurement process is... more complex than I presented. But the deal is real. It\'s just taking longer than expected.', choices: [
      { id: 'c8', text: '"I believe the deal is real. But I can\'t invest based on belief. Let\'s structure around verified milestones."', type: 'face_saving', nextNodeId: 'raj_considers', effects: { trust: 10, valueCreated: 10 } },
    ],
    },
    {
      id: 'raj_considers', speaker: 'counterparty', text: '"Milestones... tranches... I could work with that. But I need the base valuation to be credible."', choices: [
      { id: 'c9', text: '"€15M base + €5M in revenue milestones + board observer. If your pipeline delivers, you get the full €20M and more. Fair?"', type: 'package_offer', nextNodeId: 'raj_hooked', effects: { trust: 15, valueCreated: 15, valueClaimed: 10 } },
    ],
    },
    {
      id: 'raj_hooked', speaker: 'counterparty', text: '"That\'s actually smart. I get the capital I need, you get risk protection, and if we deliver — which we will — everyone wins."', choices: [
      { id: 'c10', text: '"Deal. €15M base, milestone tranches, board observer. Let\'s build something great."', type: 'concession', nextNodeId: 'ending_master', effects: { trust: 15, valueClaimed: 15, valueCreated: 15 } },
    ],
    },
    { id: 'ending_master', speaker: 'narrator', text: '👑 MASTER OUTCOME: €15M base valuation + milestone tranches + board oversight. "Basically signed" and "signed" are worlds apart. You invested in the technology with risk protection.', isAuto: true },
    { id: 'ending_cooperative', speaker: 'narrator', text: '🤝 COOPERATIVE WIN: Reduced valuation with some milestone terms. Decent deal.', isAuto: true },
    { id: 'ending_hard_bargain', speaker: 'narrator', text: '⚡ HARD BARGAIN: Demanded €12M valuation. Raj walked. Lost the deal.', isAuto: true },
  ],
  endings: [
    { id: 'ending_master', type: 'master', title: 'Smart Money', description: 'Tranched investment with milestones protects against inflated claims while preserving upside.', scores: { clientEconomicValue: 90, jointValueCreated: 80, infoDiscovered: 85, relationshipPreserved: 85, ethicalIntegrity: 90, strategicDiscipline: 90 }, longTermConsequence: 'CloudSync\'s enterprise deal closes 4 months later. Milestone tranches trigger. Investment returns 8x. Raj appreciates the smart structure.' },
    { id: 'ending_cooperative', type: 'cooperative', title: 'Reduced Valuation', description: 'Lower base valuation with some milestone protections.', scores: { clientEconomicValue: 70, jointValueCreated: 55, infoDiscovered: 55, relationshipPreserved: 70, ethicalIntegrity: 75, strategicDiscipline: 65 }, longTermConsequence: 'Good return but less upside protection. Relationship is functional.' },
    { id: 'ending_hard_bargain', type: 'hard_bargain', title: 'Deal Lost', description: 'Pushed too hard on valuation and lost the investment opportunity.', scores: { clientEconomicValue: 20, jointValueCreated: 0, infoDiscovered: 40, relationshipPreserved: 15, ethicalIntegrity: 50, strategicDiscipline: 20 }, longTermConsequence: 'CloudSync gets funding elsewhere at €18M. Technology becomes industry standard. VentureBuyer missed a 10x opportunity.' },
  ],
  postmortem: {
    masterSolution: 'Don\'t argue about whether the deal is "basically signed." Structure the investment so it doesn\'t matter — tranche based on verified milestones.',
    keyHiddenFact: 'The "basically signed" customer has no LOI, no budget approval, and no procurement process. It\'s exploratory.',
    missedOpportunity: 'Investing at full valuation based on unverified claims. The risk isn\'t worth the return without milestone protection.',
    lesson: '"Basically signed" and "signed" are worlds apart. Verify before you value.',
    bestPossibleDeal: '€15M base + €5M milestone tranches + board observer seat.',
  },
  biasTraps: [
    { id: 'bias_overconfidence', type: 'overconfidence', description: 'Raj\'s confidence is infectious. You may start believing the deal is more certain than it is.', warningText: '⚠️ OVERCONFIDENCE BIAS: A charismatic founder\'s certainty doesn\'t make uncertain deals certain. Check the data, not the delivery.', countermeasure: 'Require verification for every material claim. Confidence is not evidence.' },
  ],
};
