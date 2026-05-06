import { Scenario } from './types';

export const case22: Scenario = {
  id: 'case-22',
  title: 'The Threat Letter',
  subtitle: 'They can\'t afford court either',
  category: 'ugly',
  tier: 5,
  fee: 50000,
  stakesLabel: '€500K demand',
  difficulty: { economicComplexity: 3, emotionalComplexity: 4, ethicalComplexity: 3, informationAsymmetry: 5, powerImbalance: 4, timePressure: 3, relationshipStakes: 2 },
  client: { name: 'InnovateTech', role: 'AI startup', avatar: '🚀', personality: { truthfulness: 70, ego: 40, riskTolerance: 50, patience: 40, trustSensitivity: 60, fairnessSensitivity: 70, authorityLevel: 35, emotionalVolatility: 45, preparationLevel: 35, relationshipOrientation: 50 } },
  counterparty: { name: 'PatentHoover LLC', role: 'Patent assertion entity', avatar: '📜', personality: { truthfulness: 20, ego: 55, riskTolerance: 40, patience: 60, trustSensitivity: 15, fairnessSensitivity: 10, authorityLevel: 50, emotionalVolatility: 20, preparationLevel: 80, relationshipOrientation: 5 } },
  briefing: { clientName: 'InnovateTech', clientRole: 'AI startup — founders', situation: 'PatentHoover LLC sent a demand letter: pay €500K or face patent infringement litigation. The patent covers "automated data classification" — broadly written and potentially applicable to any AI system. The startup can\'t afford to fight in court.', clientDemands: ['Resolve the patent claim without paying €500K', 'Protect the company from future patent claims', 'Avoid costly litigation'], knownFacts: ['PatentHoover demands €500K settlement', 'The patent is broadly written but questionable', 'Litigation would cost €1M+ even if InnovateTech wins', 'PatentHoover has sent similar letters to 20+ startups'], missingInfo: ['How strong is the patent really?', 'Can PatentHoover afford to litigate?', 'What\'s PatentHoover\'s actual business model?'], timePressure: '14-day deadline in the demand letter.', stakes: '€500K demand vs. €1M+ litigation cost. Company survival at stake.', clientEmotionalState: 'Scared, feeling trapped, considering paying just to make it go away' },
  surfaceDemand: 'Patent troll demands €500K for a questionable patent claim, threatening expensive litigation.',
  hiddenTruth: 'PatentHoover\'s patent is weak and would likely fail in court. But their business model relies on the cost of fighting exceeding the settlement amount. They target companies that can\'t afford litigation. However, PatentHoover can\'t afford to actually go to court either — their model depends on settlements, not trials. A strong, informed response that shows willingness to fight makes them drop the claim.',
  issues: [
    { id: 'payment', name: 'Settlement Amount', description: 'Whether and how much to pay', clientPriority: 9, counterpartyPriority: 8, tradeability: 'low', possibleValues: ['€500K', '€250K', '€50K', '€0'] },
    { id: 'license', name: 'License Agreement', description: 'Whether to agree to a licensing arrangement', clientPriority: 7, counterpartyPriority: 7, tradeability: 'medium', possibleValues: ['No license', 'Narrow license', 'Broad license', 'Cross-license'] },
    { id: 'future_claims', name: 'Future Protection', description: 'Protection from future patent claims', clientPriority: 8, counterpartyPriority: 3, tradeability: 'high', possibleValues: ['None', 'Non-assert for this patent', 'Non-assert for portfolio', 'Industry coalition defense'] },
    { id: 'publicity', name: 'Public Stance', description: 'Whether to publicize the patent claim', clientPriority: 5, counterpartyPriority: 9, tradeability: 'high', possibleValues: ['Confidential', 'Industry discussion', 'Public blog post', 'Media coverage'] },
  ],
  batna: { clientBATNA: 'Litigation (€1M+ cost, uncertain outcome)', clientBATNAValue: 100000, clientReservationValue: 300000, counterpartyBATNA: 'Litigation (they can\'t afford it either)', counterpartyBATNAValue: 50000, counterpartyReservationValue: 200000, estimatedZOPALow: 0, estimatedZOPAHigh: 200000, trueZOPALow: 0, trueZOPAHigh: 100000 },
  investigationActions: [
    { id: 'inv_patent', name: 'Patent Validity Analysis', description: 'Assess the strength of PatentHoover\'s patent claim', cost: 1, reveals: ['weak_patent', 'prior_art'], riskLevel: 'low', responseText: 'The patent is vulnerable. Prior art exists from 3 years before the filing date. The claims are overly broad and likely invalid. PatentHoover has never taken a case to trial — they always settle. Their model depends on intimidation, not legal merit.' },
    { id: 'inv_troll', name: 'Research PatentHoover\'s Track Record', description: 'Find out how PatentHoover operates and their litigation history', cost: 1, reveals: ['no_trials', 'settlement_model'], riskLevel: 'low', responseText: 'PatentHoover has sent 50+ demand letters in the past 2 years. Zero have gone to trial. When targets push back with informed responses, PatentHoover drops the claim 80% of the time. They can\'t afford to litigate — it would destroy their business model.' },
  ],
  dialogueTree: [
    { id: 'start', speaker: 'narrator', text: 'The demand letter sits on the table. €500K or court. Your client is terrified. But the patent might be worthless, and PatentHoover might be bluffing.', isAuto: true, nextNodeId: 'troll_opening' },
    { id: 'troll_opening', speaker: 'counterparty', text: '"Our patent covers automated data classification. Your AI system infringes. €500K settles this today. Otherwise, we file Monday."', choices: [
      { id: 'c1', text: '"We\'ve reviewed your patent. The prior art predates your filing by 3 years. This patent wouldn\'t survive a validity challenge."', type: 'aggressive_anchor', nextNodeId: 'troll_rattled', effects: { trust: -10, anger: 5, valueClaimed: 20, informationRevealed: ['prior_art'] } },
      { id: 'c2', text: '"We know you\'ve never taken a case to trial. Your business model depends on settlements, not litigation. We\'re prepared to fight."', type: 'aggressive_anchor', nextNodeId: 'troll_nervous', effects: { trust: -15, valueClaimed: 25, informationRevealed: ['no_trials'] } },
      { id: 'c3', text: '"We\'re not paying €500K for a questionable patent. But we\'re open to discussing a resolution that works for both sides."', type: 'face_saving', nextNodeId: 'troll_calculating', effects: { trust: 5 } },
    ] },
    { id: 'troll_rattled', speaker: 'counterparty', text: '"Prior art claims are common. Our patent has been granted. Are you really prepared to spend €1M proving it\'s invalid?"', choices: [
      { id: 'c4', text: '"We\'ve already identified the prior art and lined up counsel. And we\'ll file an inter partes review that costs us €50K and puts your patent at risk. You sure you want that?"', type: 'threat', nextNodeId: 'troll_backs_down', effects: { trust: -10, valueClaimed: 30 } },
    ] },
    { id: 'troll_nervous', speaker: 'counterparty', text: '"We... have resources to litigate. This is a valid patent."', choices: [
      { id: 'c5', text: '"Then file. We\'ll see you in court. Or we can resolve this sensibly — you walk away, we don\'t publicize how you operate."', type: 'face_saving', nextNodeId: 'troll_backs_down', effects: { trust: 5, valueClaimed: 20 } },
    ] },
    { id: 'troll_calculating', speaker: 'counterparty', text: '"What kind of resolution? We need something to show for our IP."', choices: [
      { id: 'c6', text: '"€0 payment. You grant a non-assert for this patent. We keep this confidential. No one needs to know this didn\'t go your way."', type: 'package_offer', nextNodeId: 'troll_accepts', effects: { trust: 5, valueClaimed: 25, valueCreated: 10 } },
    ] },
    { id: 'troll_backs_down', speaker: 'counterparty', text: '"...Perhaps we were overzealous. What are you proposing?"', choices: [
      { id: 'c7', text: '"Drop the claim entirely. Non-assert agreement. Confidential. Everyone walks away."', type: 'face_saving', nextNodeId: 'ending_master', effects: { trust: 5, valueClaimed: 30, valueCreated: 10 } },
    ] },
    { id: 'troll_accepts', speaker: 'counterparty', text: '"A non-assert with confidentiality... *reluctantly* We can agree to that."', choices: [
      { id: 'c8', text: '"Done. No payment, no admission, no publicity."', type: 'concession', nextNodeId: 'ending_master', effects: { trust: 5, valueClaimed: 25 } },
    ] },
    { id: 'ending_master', speaker: 'narrator', text: '👑 MASTER OUTCOME: Zero payment + non-assert agreement + confidentiality. When the cost of fighting exceeds the demand, the threat works — but a strong, informed response can flip the cost equation.', isAuto: true },
    { id: 'ending_cooperative', speaker: 'narrator', text: '🤝 COOPERATIVE WIN: Small payment (€25K) for non-assert. Annoying but affordable.', isAuto: true },
    { id: 'ending_hard_bargain', speaker: 'narrator', text: '⚡ HARD BARGAIN: Paid €250K to settle. Extortion works if you let it.', isAuto: true },
  ],
  endings: [
    { id: 'ending_master', type: 'master', title: 'Called the Bluff', description: 'Used knowledge of the weak patent and PatentHoover\'s business model to resolve for zero.', scores: { clientEconomicValue: 95, jointValueCreated: 50, infoDiscovered: 90, relationshipPreserved: 40, ethicalIntegrity: 80, strategicDiscipline: 95 }, longTermConsequence: 'InnovateTech operates freely. PatentHoover moves on to easier targets. Other startups learn from this approach.' },
    { id: 'ending_cooperative', type: 'cooperative', title: 'Cheap Resolution', description: 'Small payment to make it go away.', scores: { clientEconomicValue: 70, jointValueCreated: 40, infoDiscovered: 60, relationshipPreserved: 50, ethicalIntegrity: 65, strategicDiscipline: 55 }, longTermConsequence: 'Settled but sets a precedent. PatentHoover may come back with other claims.' },
    { id: 'ending_hard_bargain', type: 'hard_bargain', title: 'Extortion Paid', description: 'Paid a significant settlement to avoid litigation.', scores: { clientEconomicValue: 30, jointValueCreated: 10, infoDiscovered: 20, relationshipPreserved: 30, ethicalIntegrity: 40, strategicDiscipline: 20 }, longTermConsequence: '€250K gone. PatentHoover targets other startups. Payment marks InnovateTech as an easy target.' },
  ],
  postmortem: { masterSolution: 'Research the patent and PatentHoover\'s track record. Respond with informed confidence. Threaten inter partes review. Most patent trolls back down when the target shows it can fight.', keyHiddenFact: 'PatentHoover has never gone to trial. Their business model depends on settlements. A strong, informed response makes them walk away.', missedOpportunity: 'Paying without investigation rewards extortion and marks you as an easy target.', lesson: 'When the cost of fighting exceeds the demand, the threat works. But a strong, informed response can flip the cost equation.', bestPossibleDeal: 'Zero payment + non-assert + confidentiality.' },
  biasTraps: [{ id: 'bias_anchor', type: 'anchor_shock', description: 'The €500K demand and threat of litigation create fear that may make you overvalue settlement.', warningText: '⚠️ ANCHOR BIAS: The €500K number and litigation threat are designed to trigger fear. Investigate before you negotiate — the threat may be hollow.', countermeasure: 'Research the patent validity and the patent troll\'s track record before responding. Information is your best weapon.' }],
};
