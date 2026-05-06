import { Scenario } from './types';

export const case21: Scenario = {
  id: 'case-21',
  title: 'The Angry Union',
  subtitle: 'Sometimes the fight is about respect, not the number',
  category: 'ugly',
  tier: 5,
  fee: 50000,
  stakesLabel: '€200M wage bill',
  difficulty: { economicComplexity: 4, emotionalComplexity: 5, ethicalComplexity: 3, informationAsymmetry: 3, powerImbalance: 3, timePressure: 5, relationshipStakes: 5 },
  client: { name: 'RailCorp', role: 'National rail company', avatar: '🚂', personality: { truthfulness: 55, ego: 50, riskTolerance: 35, patience: 25, trustSensitivity: 45, fairnessSensitivity: 50, authorityLevel: 75, emotionalVolatility: 40, preparationLevel: 60, relationshipOrientation: 35 } },
  counterparty: { name: 'Union Leader Tom Brennan', role: 'United Rail Workers Union', avatar: '✊', personality: { truthfulness: 50, ego: 70, riskTolerance: 55, patience: 20, trustSensitivity: 60, fairnessSensitivity: 65, authorityLevel: 65, emotionalVolatility: 70, preparationLevel: 55, relationshipOrientation: 50 } },
  briefing: { clientName: 'RailCorp', clientRole: 'National rail company — management', situation: 'The rail workers\' union is on strike over a 4% wage demand. RailCorp says 2% is the maximum affordable. Public anger is mounting as trains stop running. Neither side will budge.', clientDemands: ['End the strike', 'Keep wage increase to 2%', 'Maintain public service'], knownFacts: ['Union demands 4% wage increase', 'RailCorp offers 2%', 'Strike is entering its second week', 'Public pressure on both sides is intense'], missingInfo: ['Is the union\'s real goal 4%?', 'What does the union leader need to sell a deal?', 'Is there a face-saving path for both sides?'], timePressure: 'Strike costs €5M/day. Public patience exhausted.', stakes: '€200M annual wage bill. National transportation gridlocked.', clientEmotionalState: 'Frustrated, under political pressure, wants the strike ended' },
  surfaceDemand: 'Union demands 4% wage increase; RailCorp offers 2%. Neither side will budge.',
  hiddenTruth: 'Union leader Tom Brennan knows 4% is ambitious. But he needs a visible fight to maintain member trust after being criticized as too conciliatory. He needs a "win" he can sell — not necessarily 4%, but something he can frame as a victory. The fight is about respect and visibility, not just the number.',
  issues: [
    { id: 'wage', name: 'Wage Increase', description: 'Annual wage increase percentage', clientPriority: 9, counterpartyPriority: 8, tradeability: 'medium', possibleValues: ['2%', '2.5%', '3%', '3.5%', '4%'] },
    { id: 'safety', name: 'Safety Investment', description: 'Additional safety equipment and training', clientPriority: 5, counterpartyPriority: 9, tradeability: 'high', possibleValues: ['None', '€5M package', '€10M package', '€15M comprehensive'] },
    { id: 'recognition', name: 'Union Recognition', description: 'Formal union role in decision-making', clientPriority: 4, counterpartyPriority: 10, tradeability: 'high', possibleValues: ['None', 'Advisory role', 'Joint committee', 'Co-decision on safety'] },
    { id: 'retroactive', name: 'Retroactive Pay', description: 'Pay increase applied retroactively', clientPriority: 6, counterpartyPriority: 7, tradeability: 'high', possibleValues: ['None', '3 months', '6 months', '12 months'] },
  ],
  batna: { clientBATNA: 'Wait out the strike (expensive, public anger)', clientBATNAValue: 80000000, clientReservationValue: 120000000, counterpartyBATNA: 'Continue strike (members losing wages)', counterpartyBATNAValue: 90000000, counterpartyReservationValue: 110000000, estimatedZOPALow: 100000000, estimatedZOPAHigh: 130000000, trueZOPALow: 95000000, trueZOPAHigh: 140000000 },
  investigationActions: [
    { id: 'inv_union_politics', name: 'Analyze Union Internal Politics', description: 'Understand Tom Brennan\'s position within the union', cost: 1, reveals: ['leadership_pressure', 'face_saving_need'], riskLevel: 'low', responseText: 'Brennan was elected on a promise to "fight harder." Dissident members have criticized his previous deals as "sellouts." He needs a visible victory — something he can present as a win at the next union meeting. The 4% is his opening position, but he\'d settle for less if he can claim a broader win.' },
    { id: 'inv_safety', name: 'Assess Safety Concerns', description: 'Investigate real worker safety issues', cost: 1, reveals: ['safety_gaps', 'worker_fears'], riskLevel: 'low', responseText: 'Workers have genuine safety concerns — outdated equipment, insufficient training, and fatigue from extended shifts. A safety investment package would address real worker needs AND give Brennan something to sell as a victory beyond wages.' },
  ],
  dialogueTree: [
    { id: 'start', speaker: 'narrator', text: 'Tom Brennan stands at the picket line, megaphone in hand. The union is energized. Public sentiment is turning against both sides. The clock is ticking.', isAuto: true, nextNodeId: 'tom_opening' },
    { id: 'tom_opening', speaker: 'counterparty', text: '"4%. Not a penny less. Our members deserve it, and they\'re ready to stay out as long as it takes."', choices: [
      { id: 'c1', text: '"Tom, what do your members actually need? Let\'s talk about the full picture, not just one number."', type: 'investigative', nextNodeId: 'tom_opens', effects: { trust: 10 } },
      { id: 'c2', text: '"The country is grinding to a halt. 4% is not affordable. We need to find common ground."', type: 'face_saving', nextNodeId: 'tom_defiant', effects: { trust: 5, anger: -5 } },
      { id: 'c3', text: '"We can do 3% with safety investments and a formal union role in safety decisions."', type: 'package_offer', nextNodeId: 'tom_interested', effects: { trust: 10, valueCreated: 15, informationRevealed: ['safety_gaps'] } },
    ] },
    { id: 'tom_opens', speaker: 'counterparty', text: '"They need respect. They need safe working conditions. They need to know management gives a damn. The 4% is symbolic."', choices: [
      { id: 'c4', text: '"Then let\'s make the deal about more than wages. 3% wage increase + €15M safety investment + joint safety committee with real decision power + 6 months retroactive. You can tell your members you got everything they needed."', type: 'package_offer', nextNodeId: 'tom_hooked', effects: { trust: 15, valueCreated: 25, valueClaimed: 15, informationRevealed: ['face_saving_need'] } },
    ] },
    { id: 'tom_defiant', speaker: 'counterparty', text: '"Common ground means meeting us at 4%. Anything less is a defeat."', choices: [
      { id: 'c5', text: '"What if the total package was worth more than 4%? Wage plus safety plus recognition plus retroactive. You\'d be delivering more value to your members than a flat 4%. "', type: 'face_saving', nextNodeId: 'tom_interested', effects: { trust: 10, valueCreated: 10 } },
    ] },
    { id: 'tom_interested', speaker: 'counterparty', text: '"A package deal... *considers* If I can go back to my members with more than just a wage number, that changes things. What are you proposing?"', choices: [
      { id: 'c6', text: '"3% wage + €15M safety package + joint safety committee + 6 months retroactive. Total value exceeds 4% wage-only, and you deliver on safety AND respect."', type: 'package_offer', nextNodeId: 'tom_hooked', effects: { trust: 15, valueCreated: 20, valueClaimed: 15 } },
    ] },
    { id: 'tom_hooked', speaker: 'counterparty', text: '"Joint safety committee with real power... €15M in safety... That\'s something I can sell as a victory. My members get safer working conditions AND a raise."', choices: [
      { id: 'c7', text: '"Then we have a deal. 3% wage + safety investment + joint committee + retroactive. You fight for your members, we keep the trains running."', type: 'concession', nextNodeId: 'ending_master', effects: { trust: 15, valueClaimed: 15, valueCreated: 15, relationshipImpact: 15 } },
    ] },
    { id: 'ending_master', speaker: 'narrator', text: '👑 MASTER OUTCOME: 3% wage + €15M safety investment + joint safety committee + 6 months retroactive. Sometimes the fight is about respect and visibility, not the number — create a path that lets both sides claim victory.', isAuto: true },
    { id: 'ending_cooperative', speaker: 'narrator', text: '🤝 COOPERATIVE WIN: 3% wage with minor concessions. Strike ends but union members feel shortchanged.', isAuto: true },
    { id: 'ending_hard_bargain', speaker: 'narrator', text: '⚡ HARD BARGAIN: Held at 2%. Strike continues. Government intervention looming.', isAuto: true },
  ],
  endings: [
    { id: 'ending_master', type: 'master', title: 'Respect & Safety', description: 'Delivered more total value than 4% through a comprehensive package that addresses the real needs.', scores: { clientEconomicValue: 80, jointValueCreated: 90, infoDiscovered: 85, relationshipPreserved: 85, ethicalIntegrity: 85, strategicDiscipline: 85 }, longTermConsequence: 'Safety investment reduces accidents. Joint committee improves labor relations. Union members feel heard. Brennan\'s leadership strengthened.' },
    { id: 'ending_cooperative', type: 'cooperative', title: 'Wage Compromise', description: '3% wage with minor additions. Functional but not transformative.', scores: { clientEconomicValue: 65, jointValueCreated: 45, infoDiscovered: 40, relationshipPreserved: 55, ethicalIntegrity: 70, strategicDiscipline: 55 }, longTermConsequence: 'Strike ends but underlying safety concerns remain. Union leadership weakened. Next negotiation will be harder.' },
    { id: 'ending_hard_bargain', type: 'hard_bargain', title: 'Prolonged Strike', description: 'Neither side backed down. Government forced to intervene.', scores: { clientEconomicValue: 25, jointValueCreated: -15, infoDiscovered: 20, relationshipPreserved: 5, ethicalIntegrity: 35, strategicDiscipline: 15 }, longTermConsequence: 'Government-imposed settlement satisfies nobody. Both sides lose credibility. Long-term relationship damaged.' },
  ],
  postmortem: { masterSolution: 'Build a package that delivers more total value than 4% wage-only: 3% wage + safety investment + joint safety committee + retroactive pay.', keyHiddenFact: 'The union leader needs a visible win, not necessarily 4%. The fight is about respect and visibility. Safety concerns are genuine and tradeable.', missedOpportunity: 'Fighting over the percentage alone misses the opportunity to address worker safety and union recognition — issues that create more value than wages.', lesson: 'Sometimes the fight is about respect and visibility, not the number. Create a path that lets both sides claim victory.', bestPossibleDeal: '3% wage + €15M safety package + joint safety committee + 6 months retroactive.' },
  biasTraps: [{ id: 'bias_fixed_pie', type: 'fixed_pie', description: 'You may think this is only about the wage percentage.', warningText: '⚠️ FIXED-PIE BIAS: This isn\'t just about 2% vs 4%. Safety investment, union recognition, and retroactive pay are all tradeable. The total package can exceed the value of a 4% wage increase.', countermeasure: 'Expand the negotiation beyond wages. Address the underlying needs: safety, respect, recognition.' }],
};
