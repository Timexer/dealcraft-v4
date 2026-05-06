import { Scenario } from './types';

export const case16: Scenario = {
  id: 'case-16',
  title: 'Employee vs. MegaCorp',
  subtitle: 'They don\'t want your invention — they want it buried',
  category: 'power_imbalance',
  tier: 4,
  fee: 25000,
  stakesLabel: '€5M IP dispute',
  difficulty: { economicComplexity: 4, emotionalComplexity: 4, ethicalComplexity: 3, informationAsymmetry: 4, powerImbalance: 5, timePressure: 3, relationshipStakes: 4 },
  client: { name: 'Dr. Sarah Chen', role: 'Senior Engineer', avatar: '👩‍🔬', personality: { truthfulness: 75, ego: 45, riskTolerance: 35, patience: 40, trustSensitivity: 70, fairnessSensitivity: 80, authorityLevel: 25, emotionalVolatility: 45, preparationLevel: 40, relationshipOrientation: 55 } },
  counterparty: { name: 'TechGiant Legal', role: 'Corporate legal department', avatar: '🏢', personality: { truthfulness: 35, ego: 60, riskTolerance: 50, patience: 55, trustSensitivity: 30, fairnessSensitivity: 25, authorityLevel: 90, emotionalVolatility: 15, preparationLevel: 85, relationshipOrientation: 15 } },
  briefing: { clientName: 'Dr. Sarah Chen', clientRole: 'Senior Engineer, inventor of side-project technology', situation: 'Dr. Chen developed a breakthrough algorithm in her spare time using her own resources. TechGiant claims IP ownership under her employment contract\'s broad IP clause. They\'re demanding she hand over the invention.', clientDemands: ['Retain ownership of her invention', 'Continue developing the technology', 'Clear her name from IP infringement claims'], knownFacts: ['Employment contract has a broad IP clause covering "any invention related to company business"', 'Sarah developed the algorithm on personal time with personal equipment', 'The algorithm could disrupt TechGiant\'s core product line', 'TechGiant has offered a €50K "recognition bonus" for the IP'], missingInfo: ['What does TechGiant plan to do with the invention?', 'Is the IP clause enforceable for personal projects?', 'Why is TechGiant so aggressive about this?'], timePressure: 'TechGiant gave 30 days to comply or face legal action.', stakes: '€5M potential value of the invention. Career and reputation at risk.', clientEmotionalState: 'Scared, outraged, feeling powerless against corporate machine' },
  surfaceDemand: 'TechGiant claims ownership of Dr. Chen\'s side-project invention under her employment contract IP clause.',
  hiddenTruth: 'TechGiant\'s real motivation is fear: the invention could disrupt their core product line. They want to shelve it, not develop it. The IP claim is defensive — they\'re not trying to commercialize it, they\'re trying to bury it. If Sarah knew this, she\'d have different leverage.',
  issues: [
    { id: 'ownership', name: 'IP Ownership', description: 'Who owns the invention', clientPriority: 10, counterpartyPriority: 9, tradeability: 'low', possibleValues: ['Full TechGiant ownership', 'Shared ownership', 'Sarah retains with license', 'Sarah retains fully'] },
    { id: 'development', name: 'Development Rights', description: 'Right to continue developing the technology', clientPriority: 9, counterpartyPriority: 7, tradeability: 'medium', possibleValues: ['No development', 'Internal use only', 'License to develop', 'Full development rights'] },
    { id: 'noncompete', name: 'Non-Compete Scope', description: 'Scope of non-compete restrictions', clientPriority: 7, counterpartyPriority: 8, tradeability: 'medium', possibleValues: ['Full industry ban', 'Narrow product ban', 'Time-limited restriction', 'No non-compete'] },
    { id: 'recognition', name: 'Public Recognition', description: 'Public acknowledgment of Sarah\'s invention', clientPriority: 6, counterpartyPriority: 3, tradeability: 'high', possibleValues: ['None', 'Internal recognition', 'Public attribution', 'Named inventor credit'] },
  ],
  batna: { clientBATNA: 'Legal fight (expensive, uncertain, career-damaging)', clientBATNAValue: 500000, clientReservationValue: 2000000, counterpartyBATNA: 'Force IP transfer via contract (public backlash risk)', counterpartyBATNAValue: 1500000, counterpartyReservationValue: 3500000, estimatedZOPALow: 2000000, estimatedZOPAHigh: 4000000, trueZOPALow: 1500000, trueZOPAHigh: 5000000 },
  investigationActions: [
    { id: 'inv_plan', name: 'Investigate TechGiant\'s Plans', description: 'Find out what TechGiant intends to do with the invention', cost: 2, reveals: ['shelving_intent', 'defensive_motive'], riskLevel: 'medium', responseText: 'Internal sources reveal: TechGiant has no plans to develop the invention. It\'s been flagged as "competitive threat" and assigned to the IP defense team, not the innovation team. They want to bury it to protect their existing product line.' },
    { id: 'inv_contract', name: 'Legal Review of IP Clause', description: 'Assess enforceability of the employment contract IP clause', cost: 1, reveals: ['clause_weakness', 'precedent_cases'], riskLevel: 'low', responseText: 'The IP clause is unusually broad and may not be enforceable for inventions created entirely on personal time with personal resources. Several recent court rulings have favored employees in similar cases. TechGiant knows this — their legal position is weaker than they\'re letting on.' },
  ],
  dialogueTree: [
    { id: 'start', speaker: 'narrator', text: 'TechGiant\'s legal team sends a stern letter: surrender the IP or face consequences. Dr. Chen is terrified but determined.', isAuto: true, nextNodeId: 'legal_opening' },
    { id: 'legal_opening', speaker: 'counterparty', text: '"The IP clause in your employment contract is clear. Any invention related to our business belongs to us. Hand it over, and we\'ll give you a €50K recognition bonus."', choices: [
      { id: 'c1', text: '"What do you plan to do with my invention? Are you going to develop it?"', type: 'investigative', nextNodeId: 'legal_evasive', effects: { trust: 5, informationRevealed: ['defensive_motive'] } },
      { id: 'c2', text: '"I developed this on my own time with my own resources. Your IP clause doesn\'t cover personal projects."', type: 'aggressive_anchor', nextNodeId: 'legal_pushback', effects: { anger: 10, trust: -5 } },
      { id: 'c3', text: '"I\'m open to finding a solution that works for both sides. But I need to understand your real interest."', type: 'face_saving', nextNodeId: 'legal_curious', effects: { trust: 10 } },
    ] },
    { id: 'legal_evasive', speaker: 'counterparty', text: '"Our plans for the IP are internal. The contract is clear — you need to comply."', choices: [
      { id: 'c4', text: '"I\'ve been told you have no development plans. You want to shelve it. That changes everything."', type: 'investigative', nextNodeId: 'legal_caught', effects: { trust: -5, informationRevealed: ['shelving_intent'] }, requirement: { type: 'info_discovered', factId: 'shelving_intent' } },
      { id: 'c5', text: '"If you\'re not going to develop it, why do you need it? Let me propose an alternative."', type: 'face_saving', nextNodeId: 'legal_listening', effects: { trust: 10 } },
    ] },
    { id: 'legal_pushback', speaker: 'counterparty', text: '"Our legal team is confident in the contract. We\'d rather not escalate this, but we will if necessary."', choices: [
      { id: 'c6', text: '"Recent court rulings favor employees in these cases. Your legal position isn\'t as strong as you think."', type: 'aggressive_anchor', nextNodeId: 'legal_reconsiders', effects: { trust: -5, valueClaimed: 10, informationRevealed: ['clause_weakness'] } },
    ] },
    { id: 'legal_curious', speaker: 'counterparty', text: '"What alternative do you have in mind?"', choices: [
      { id: 'c7', text: '"I retain ownership and grant TechGiant a free license. You get the technology, I keep my invention. Plus I sign a narrow non-compete protecting your core products."', type: 'package_offer', nextNodeId: 'legal_listening', effects: { trust: 15, valueCreated: 20 } },
    ] },
    { id: 'legal_caught', speaker: 'counterparty', text: '*pause* I\'m not at liberty to discuss internal strategy. But... if you have a proposal that addresses our concerns, I\'ll listen.', choices: [
      { id: 'c8', text: '"Sarah retains ownership + free license to TechGiant + narrow non-compete + named inventor credit. You get protection from competition, I get to develop my invention. No one buries anything."', type: 'package_offer', nextNodeId: 'ending_master', effects: { trust: 15, valueCreated: 25, valueClaimed: 20 } },
    ] },
    { id: 'legal_listening', speaker: 'counterparty', text: '"A license arrangement... that\'s not standard. But if it includes proper protections, I could explore it."', choices: [
      { id: 'c9', text: '"Free license + narrow non-compete on your direct products + named inventor credit. You get the technology and the protection. I get my invention."', type: 'package_offer', nextNodeId: 'ending_master', effects: { trust: 15, valueCreated: 20, valueClaimed: 15 } },
    ] },
    { id: 'legal_reconsiders', speaker: 'counterparty', text: '"We\'re aware of the legal landscape. A protracted lawsuit helps no one. What are you proposing?"', choices: [
      { id: 'c10', text: '"License arrangement that gives you what you need without destroying my career."', type: 'face_saving', nextNodeId: 'legal_listening', effects: { trust: 10, valueCreated: 10 } },
    ] },
    { id: 'ending_master', speaker: 'narrator', text: '👑 MASTER OUTCOME: Sarah retains IP ownership + free license to TechGiant + narrow non-compete + named inventor credit. When a company claims your IP, ask what they plan to do with it — sometimes they want to bury it, not build it.', isAuto: true },
    { id: 'ending_cooperative', speaker: 'narrator', text: '🤝 COOPERATIVE WIN: Shared ownership with development rights. Compromise that lets both sides move forward.', isAuto: true },
    { id: 'ending_hard_bargain', speaker: 'narrator', text: '⚡ HARD BARGAIN: Legal battle ensues. Sarah wins eventually but at enormous cost. Career damaged.', isAuto: true },
  ],
  endings: [
    { id: 'ending_master', type: 'master', title: 'License & Independence', description: 'Kept ownership while giving TechGiant what they actually needed — protection, not control.', scores: { clientEconomicValue: 90, jointValueCreated: 80, infoDiscovered: 85, relationshipPreserved: 80, ethicalIntegrity: 90, strategicDiscipline: 85 }, longTermConsequence: 'Sarah develops her invention into a successful company. TechGiant uses the license to improve their products. Both sides win.' },
    { id: 'ending_cooperative', type: 'cooperative', title: 'Shared Ownership', description: 'Compromise with shared IP rights.', scores: { clientEconomicValue: 65, jointValueCreated: 55, infoDiscovered: 50, relationshipPreserved: 65, ethicalIntegrity: 75, strategicDiscipline: 60 }, longTermConsequence: 'Workable but complicated. Joint ownership creates friction over time.' },
    { id: 'ending_hard_bargain', type: 'hard_bargain', title: 'Legal Victory, Personal Cost', description: 'Won in court but lost years and reputation.', scores: { clientEconomicValue: 50, jointValueCreated: 5, infoDiscovered: 40, relationshipPreserved: 10, ethicalIntegrity: 60, strategicDiscipline: 30 }, longTermConsequence: 'Legal costs consume savings. Industry blacklisting. Victory feels hollow.' },
  ],
  postmortem: { masterSolution: 'Retain ownership with a free license to TechGiant + narrow non-compete. They get protection from disruption; Sarah gets to develop her invention.', keyHiddenFact: 'TechGiant wants to shelve the invention, not develop it. The IP claim is defensive, not commercial.', missedOpportunity: 'Accepting the €50K bonus means your invention gets buried. Understanding their real motive unlocks a better deal for everyone.', lesson: 'When a company claims your IP, ask what they plan to do with it. Sometimes they want to bury it, not build it.', bestPossibleDeal: 'Sarah retains ownership + free license to TechGiant + narrow non-compete + named inventor credit.' },
  biasTraps: [{ id: 'bias_fixed_pie', type: 'fixed_pie', description: 'You may see this as binary: keep the IP or lose it.', warningText: '⚠️ FIXED-PIE BIAS: There are multiple tradeable issues — ownership, licensing, non-compete scope, and recognition. A license arrangement can give both sides what they need.', countermeasure: 'Consider licensing arrangements, non-compete scope, and recognition as tradeable items.' }],
};
