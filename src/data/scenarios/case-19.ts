import { Scenario } from './types';

export const case19: Scenario = {
  id: 'case-19',
  title: 'The Apology Clause',
  subtitle: 'They need acknowledgment, not legal admission',
  category: 'relationship',
  tier: 4,
  fee: 25000,
  stakesLabel: '€15M settlement',
  difficulty: { economicComplexity: 3, emotionalComplexity: 4, ethicalComplexity: 3, informationAsymmetry: 3, powerImbalance: 3, timePressure: 3, relationshipStakes: 5 },
  client: { name: 'SoftGuard', role: 'Cybersecurity company', avatar: '🛡️', personality: { truthfulness: 50, ego: 55, riskTolerance: 40, patience: 35, trustSensitivity: 50, fairnessSensitivity: 45, authorityLevel: 65, emotionalVolatility: 30, preparationLevel: 60, relationshipOrientation: 40 } },
  counterparty: { name: 'EnterpriseCorp', role: 'Corporate client (CIO: Patricia Wells)', avatar: '🏢', personality: { truthfulness: 55, ego: 65, riskTolerance: 30, patience: 25, trustSensitivity: 70, fairnessSensitivity: 60, authorityLevel: 70, emotionalVolatility: 55, preparationLevel: 50, relationshipOrientation: 45 } },
  briefing: { clientName: 'SoftGuard', clientRole: 'Cybersecurity company — legal & executive team', situation: 'After a data breach affecting 500K of EnterpriseCorp\'s customers, the client demands a public apology as part of the settlement. SoftGuard\'s lawyers advise against any apology language that could be construed as legal admission of liability.', clientDemands: ['Settle the breach claim without public apology', 'Limit legal exposure', 'Preserve the business relationship'], knownFacts: ['Data breach affected 500K EnterpriseCorp customers', 'SoftGuard\'s systems had a known vulnerability', 'EnterpriseCorp demands public apology in settlement', 'SoftGuard\'s lawyers say apology = legal admission'], missingInfo: ['Why does EnterpriseCorp insist on a public apology?', 'Is this about legal protection or something else?', 'Is there language that satisfies both sides?'], timePressure: 'Media coverage is increasing. Settlement needed within 2 weeks.', stakes: '€15M settlement. Reputation damage. Ongoing client relationship.', clientEmotionalState: 'Defensive, legally constrained, worried about precedent' },
  surfaceDemand: 'EnterpriseCorp demands a public apology as part of the data breach settlement. SoftGuard\'s lawyers refuse.',
  hiddenTruth: 'EnterpriseCorp\'s CIO, Patricia Wells, needs to show her board she\'s in control after the breach. The apology isn\'t about legal liability — it\'s about demonstrating to the board that she extracted accountability. A carefully worded statement of responsibility that acknowledges the impact without admitting legal negligence would satisfy both sides. The lawyers are fighting the wrong battle.',
  issues: [
    { id: 'apology', name: 'Public Statement', description: 'Nature of public statement about the breach', clientPriority: 9, counterpartyPriority: 9, tradeability: 'medium', possibleValues: ['No statement', 'Private acknowledgment', 'Statement of responsibility', 'Full public apology'] },
    { id: 'settlement', name: 'Settlement Amount', description: 'Financial settlement for breach damages', clientPriority: 8, counterpartyPriority: 7, tradeability: 'medium', possibleValues: ['€10M', '€12M', '€15M', '€18M'] },
    { id: 'security_upgrade', name: 'Security Investment', description: 'Commitment to security improvements', clientPriority: 5, counterpartyPriority: 8, tradeability: 'high', possibleValues: ['None', 'Audit commitment', '€2M upgrade', '€5M upgrade + monitoring'] },
    { id: 'board_briefing', name: 'Board Briefing', description: 'Joint briefing to EnterpriseCorp board', clientPriority: 4, counterpartyPriority: 9, tradeability: 'high', possibleValues: ['None', 'Written report', 'Virtual briefing', 'In-person board presentation'] },
  ],
  batna: { clientBATNA: 'Litigation (expensive, public, uncertain outcome)', clientBATNAValue: 8000000, clientReservationValue: 12000000, counterpartyBATNA: 'Litigation (damaging publicity, uncertain outcome)', counterpartyBATNAValue: 9000000, counterpartyReservationValue: 14000000, estimatedZOPALow: 12000000, estimatedZOPAHigh: 16000000, trueZOPALow: 10000000, trueZOPAHigh: 18000000 },
  investigationActions: [
    { id: 'inv_cio', name: 'Understand CIO\'s Position', description: 'Learn what Patricia Wells really needs from this settlement', cost: 1, reveals: ['board_pressure', 'control_need'], riskLevel: 'low', responseText: 'Patricia Wells faces a board review next month. After the breach, she needs to demonstrate she extracted accountability from SoftGuard. The public apology is her evidence. But what she actually needs is something she can present to the board as a "win" — acknowledgment, not legal admission.' },
    { id: 'inv_language', name: 'Research Apology Language', description: 'Find legal precedents for responsibility without admission', cost: 1, reveals: ['safe_language', 'precedent'], riskLevel: 'low', responseText: 'Legal precedents show: "statements of responsibility" that acknowledge impact without admitting negligence are common in breach settlements. Language like "We take responsibility for the impact on EnterpriseCorp\'s customers and have invested in preventing recurrence" satisfies the emotional need without creating legal liability.' },
  ],
  dialogueTree: [
    { id: 'start', speaker: 'narrator', text: 'Patricia Wells is under enormous pressure. Her board wants accountability, her customers want answers, and she needs to show she\'s in control.', isAuto: true, nextNodeId: 'patricia_opening' },
    { id: 'patricia_opening', speaker: 'counterparty', text: '"I need a public apology. My board demands it, my customers deserve it, and I won\'t settle without one."', choices: [
      { id: 'c1', text: '"Patricia, our lawyers can\'t allow language that admits legal liability. But I think we can find words that give you what you actually need."', type: 'face_saving', nextNodeId: 'patricia_curious', effects: { trust: 10 } },
      { id: 'c2', text: '"What does your board actually need to see? Is it the word \'apology\' or something else?"', type: 'investigative', nextNodeId: 'patricia_opens', effects: { trust: 10, informationRevealed: ['board_pressure'] } },
      { id: 'c3', text: '"We can\'t do a public apology. Full stop. Let\'s discuss the financial terms."', type: 'aggressive_anchor', nextNodeId: 'patricia_firm', effects: { anger: 15, trust: -10 } },
    ] },
    { id: 'patricia_curious', speaker: 'counterparty', text: '"What I actually need? I need to show my board that I held you accountable. I need our customers to hear that someone is taking responsibility."', choices: [
      { id: 'c4', text: '"What if we issued a joint statement of responsibility — acknowledging the impact on your customers and committing to security improvements — without legal admission of negligence? Plus a direct board briefing from our CEO."', type: 'package_offer', nextNodeId: 'patricia_interested', effects: { trust: 15, valueCreated: 20, informationRevealed: ['safe_language'] } },
    ] },
    { id: 'patricia_opens', speaker: 'counterparty', text: '"My board needs to see accountability. The word matters less than the substance. But I can\'t go back empty-handed — they\'ll think I caved."', choices: [
      { id: 'c5', text: '"You won\'t go back empty-handed. Joint statement of responsibility + board briefing + €15M settlement + €5M security upgrade. That\'s a win you can present."', type: 'package_offer', nextNodeId: 'patricia_hooked', effects: { trust: 15, valueCreated: 25, valueClaimed: 15 } },
    ] },
    { id: 'patricia_firm', speaker: 'counterparty', text: '"Then we go to court. The publicity will be worse for you than a simple apology."', choices: [
      { id: 'c6', text: '"Let me propose a path that gives you accountability without our legal exposure. A statement of responsibility, not legal admission."', type: 'face_saving', nextNodeId: 'patricia_curious', effects: { trust: 5, anger: -5 } },
    ] },
    { id: 'patricia_interested', speaker: 'counterparty', text: '"Statement of responsibility... *thinking* If it acknowledges the impact on our customers and commits to action, I could present that to the board. The board briefing helps too."', choices: [
      { id: 'c7', text: '"Done. Joint statement of responsibility, board briefing, fair settlement, and security upgrade commitment. You get accountability, we get legal protection."', type: 'concession', nextNodeId: 'ending_master', effects: { trust: 15, valueClaimed: 15, valueCreated: 15 } },
    ] },
    { id: 'patricia_hooked', speaker: 'counterparty', text: '"That\'s actually a comprehensive package. The board sees accountability, our customers see responsibility, and SoftGuard doesn\'t hang itself legally. Smart."', choices: [
      { id: 'c8', text: '"Partnership, not punishment. Deal?"', type: 'concession', nextNodeId: 'ending_master', effects: { trust: 15, valueClaimed: 10, valueCreated: 15, relationshipImpact: 15 } },
    ] },
    { id: 'ending_master', speaker: 'narrator', text: '👑 MASTER OUTCOME: Joint statement of responsibility + board briefing + settlement + security upgrade. When one side demands an apology, they may need acknowledgment, not legal admission.', isAuto: true },
    { id: 'ending_cooperative', speaker: 'narrator', text: '🤝 COOPERATIVE WIN: Financial settlement with private acknowledgment. No public statement. Patricia saves face internally.', isAuto: true },
    { id: 'ending_hard_bargain', speaker: 'narrator', text: '⚡ HARD BARGAIN: No acknowledgment, larger financial settlement. Relationship damaged. Public litigation risk remains.', isAuto: true },
  ],
  endings: [
    { id: 'ending_master', type: 'master', title: 'Acknowledgment Without Admission', description: 'Found language that satisfies the emotional need without creating legal liability.', scores: { clientEconomicValue: 85, jointValueCreated: 80, infoDiscovered: 80, relationshipPreserved: 90, ethicalIntegrity: 85, strategicDiscipline: 85 }, longTermConsequence: 'Settlement resolves the crisis. Board is satisfied. SoftGuard retains the client. Security upgrade rebuilds trust.' },
    { id: 'ending_cooperative', type: 'cooperative', title: 'Private Resolution', description: 'Private acknowledgment with financial settlement.', scores: { clientEconomicValue: 70, jointValueCreated: 55, infoDiscovered: 50, relationshipPreserved: 65, ethicalIntegrity: 70, strategicDiscipline: 60 }, longTermConsequence: 'Settled but board pressure continues. Patricia has less to show for her efforts.' },
    { id: 'ending_hard_bargain', type: 'hard_bargain', title: 'Financial Only', description: 'Larger payout but no acknowledgment. Relationship severely damaged.', scores: { clientEconomicValue: 50, jointValueCreated: 15, infoDiscovered: 25, relationshipPreserved: 20, ethicalIntegrity: 55, strategicDiscipline: 30 }, longTermConsequence: 'Client lost. Public narrative is unresolved. Both sides look bad.' },
  ],
  postmortem: { masterSolution: 'Replace "apology" with "statement of responsibility" that acknowledges impact without admitting negligence. Add board briefing and security commitment.', keyHiddenFact: 'The CIO needs to show her board she extracted accountability. The word "apology" matters less than the substance of acknowledgment.', missedOpportunity: 'Refusing any statement means fighting the wrong battle. The need is for acknowledgment, not legal admission.', lesson: 'When one side demands an apology, they may need acknowledgment, not legal admission. Find the language that works for both.', bestPossibleDeal: 'Joint statement of responsibility + board briefing + settlement + security upgrade commitment.' },
  biasTraps: [{ id: 'bias_fixed_pie', type: 'fixed_pie', description: 'You may see this as a binary choice: apologize or don\'t.', warningText: '⚠️ FIXED-PIE BIAS: This isn\'t binary. There\'s a spectrum between "no statement" and "full apology." Statement of responsibility, board briefings, and security commitments are all tradeable.', countermeasure: 'Consider the full range of acknowledgment options, not just "apology" vs. "silence."' }],
};
