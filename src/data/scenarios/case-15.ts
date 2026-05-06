import { Scenario } from './types';

export const case15: Scenario = {
  id: 'case-15',
  title: 'Startup vs. Platform Giant',
  subtitle: 'When they want control, not your data',
  category: 'power_imbalance',
  tier: 4,
  fee: 25000,
  stakesLabel: '€50M valuation',
  difficulty: {
    economicComplexity: 4,
    emotionalComplexity: 3,
    ethicalComplexity: 3,
    informationAsymmetry: 4,
    powerImbalance: 5,
    timePressure: 3,
    relationshipStakes: 4,
  },
  client: {
    name: 'VerityMesh',
    role: 'AI startup (CEO: Lin Zhao)',
    avatar: '🧠',
    personality: {
      truthfulness: 70,
      ego: 55,
      riskTolerance: 60,
      patience: 35,
      trustSensitivity: 65,
      fairnessSensitivity: 70,
      authorityLevel: 40,
      emotionalVolatility: 40,
      preparationLevel: 50,
      relationshipOrientation: 55,
    },
  },
  counterparty: {
    name: 'OmniCorp',
    role: 'Platform giant (VP Partnerships: Sarah Keene)',
    avatar: '🏢',
    personality: {
      truthfulness: 30,
      ego: 60,
      riskTolerance: 45,
      patience: 50,
      trustSensitivity: 35,
      fairnessSensitivity: 30,
      authorityLevel: 90,
      emotionalVolatility: 20,
      preparationLevel: 80,
      relationshipOrientation: 20,
    },
  },
  briefing: {
    clientName: 'VerityMesh',
    clientRole: 'AI startup — founder & CEO',
    situation: 'VerityMesh, a breakthrough AI startup, has been offered distribution on OmniCorp\'s platform — reaching 200M users. The catch: OmniCorp demands full data rights as a condition. VerityMesh\'s board is split — the distribution is tempting, but the data rights feel like giving away the crown jewels.',
    clientDemands: [
      'Access to OmniCorp\'s platform for distribution',
      'Protect data rights and AI model independence',
      'Maintain strategic autonomy as a company',
    ],
    knownFacts: [
      'OmniCorp demands full data rights as condition for distribution',
      'Distribution would reach 200M potential users',
      'VerityMesh\'s AI models are trained on proprietary data',
      'OmniCorp is the dominant platform in this space',
    ],
    missingInformation: [
      'Why does OmniCorp really want the data rights?',
      'Does OmniCorp actually need the data or want something else?',
      'What leverage does VerityMesh actually have?',
    ],
    timePressure: 'OmniCorp\'s offer expires in 21 days. Competitors are also building AI features.',
    stakes: '€50M company valuation. Distribution could 10x revenue. Data rights could be worth everything.',
    clientEmotionalState: 'Torn between opportunity and fear, feeling pressured, worried about being swallowed whole',
  },
  surfaceDemand: 'OmniCorp demands full data rights as a condition for distributing VerityMesh\'s AI product.',
  hiddenTruth: 'OmniCorp doesn\'t need VerityMesh\'s data — they have plenty of their own. They want the data rights to make VerityMesh dependent on their infrastructure, effectively acquiring the startup\'s innovation without paying for it. The data rights demand is a control mechanism. But OmniCorp actually needs VerityMesh for regulatory optics — they\'re facing antitrust scrutiny and need to show they support independent AI developers. VerityMesh has more leverage than it thinks.',
  issues: [
    { id: 'data_rights', name: 'Data Rights', description: 'Who owns and controls the training data and model outputs', clientPriority: 10, counterpartyPriority: 7, tradeability: 'low', possibleValues: ['Full OmniCorp control', 'Shared rights', 'VerityMesh retains with license', 'VerityMesh retains fully'] },
    { id: 'distribution', name: 'Distribution Terms', description: 'Reach and exclusivity of platform distribution', clientPriority: 8, counterpartyPriority: 8, tradeability: 'high', possibleValues: ['Limited distribution', 'Standard distribution', 'Featured placement', 'Exclusive partner'] },
    { id: 'regulatory', name: 'Regulatory Partnership', description: 'Public regulatory partnership designation', clientPriority: 5, counterpartyPriority: 9, tradeability: 'high', possibleValues: ['None', 'Listed partner', 'Featured partner', 'Co-announced initiative'] },
    { id: 'independence', name: 'Independence Guarantee', description: 'Contractual guarantee of VerityMesh\'s operational independence', clientPriority: 9, counterpartyPriority: 4, tradeability: 'medium', possibleValues: ['None', 'Non-exclusivity clause', 'Full independence guarantee', 'Independence + portability rights'] },
  ],
  batna: {
    clientBATNA: 'Build own distribution (slow, expensive, limited reach)',
    clientBATNAValue: 10000000,
    clientReservationValue: 30000000,
    counterpartyBATNA: 'Build in-house AI (18 months, antitrust risk)',
    counterpartyBATNAValue: 25000000,
    counterpartyReservationValue: 40000000,
    estimatedZOPALow: 30000000,
    estimatedZOPAHigh: 45000000,
    trueZOPALow: 25000000,
    trueZOPAHigh: 55000000,
  },
  investigationActions: [
    {
      id: 'inv_regulatory', name: 'Research Regulatory Pressure', description: 'Investigate OmniCorp\'s regulatory and antitrust situation',
      cost: 1, reveals: ['antitrust_pressure', 'regulatory_need'], riskLevel: 'low',
      responseText: 'OmniCorp is facing antitrust scrutiny in three jurisdictions. Regulators are examining whether they use platform dominance to crush competitors. A public partnership with an independent AI startup would be valuable regulatory optics. VerityMesh has leverage it doesn\'t realize.',
    },
    {
      id: 'inv_data_value', name: 'Analyze Data Value to OmniCorp', description: 'Assess whether OmniCorp actually needs VerityMesh\'s data',
      cost: 1, reveals: ['data_not_needed', 'control_motive'], riskLevel: 'low',
      responseText: 'OmniCorp has 50x more training data than VerityMesh. They don\'t need the data — they want the dependency. If VerityMesh\'s models run on OmniCorp infrastructure with OmniCorp data rights, the startup becomes a feature, not a company. This is a control play.',
    },
  ],
  dialogueTree: [
    {
      id: 'start', speaker: 'narrator', text: 'Sarah Keene from OmniCorp exudes corporate confidence. The meeting is in their offices — 40th floor, glass walls, the implicit power dynamic impossible to ignore.', isAuto: true, nextNodeId: 'sarah_opening',
    },
    {
      id: 'sarah_opening', speaker: 'counterparty', text: '"We love what VerityMesh is building. 200M users could transform your business. The data rights are standard for platform partners — it ensures seamless integration."', choices: [
        { id: 'c1', text: '"Why does a company with 50x our data need our data rights? What\'s the real purpose?"', type: 'investigative', nextNodeId: 'sarah_evasive', effects: { trust: -5, informationRevealed: ['data_not_needed'] } },
        { id: 'c2', text: '"We\'re open to partnership, but not to giving up our independence. What if we structured this differently?"', type: 'face_saving', nextNodeId: 'sarah_curious', effects: { trust: 10 } },
        { id: 'c3', text: '"Data rights are non-negotiable for us. We won\'t give them up."', type: 'aggressive_anchor', nextNodeId: 'sarah_pressure', effects: { anger: 5, trust: -5 } },
      ],
    },
    {
      id: 'sarah_evasive', speaker: 'counterparty', text: '"It\'s about integration quality, not data ownership. We need seamless data flows for the best user experience."', choices: [
        { id: 'c4', text: '"We can provide API access for integration without transferring data rights. Different thing entirely."', type: 'diagnostic', nextNodeId: 'sarah_reconsiders', effects: { trust: 5, valueCreated: 10 } },
        { id: 'c5', text: '"I notice OmniCorp is facing antitrust scrutiny. A public partnership with an independent AI startup would be excellent regulatory optics. Maybe we can help each other."', type: 'package_offer', nextNodeId: 'sarah_surprised', effects: { trust: 5, valueClaimed: 15, informationRevealed: ['antitrust_pressure'] } },
      ],
    },
    {
      id: 'sarah_curious', speaker: 'counterparty', text: '"Structured differently? I\'m listening, but the data rights are important to our platform strategy."', choices: [
        { id: 'c6', text: '"What if VerityMesh retains data rights, provides full API integration, and becomes your featured AI partner — with a co-announced regulatory initiative? You get the optics, we get distribution without dependency."', type: 'package_offer', nextNodeId: 'sarah_calculating', effects: { trust: 15, valueCreated: 20, valueClaimed: 15, informationRevealed: ['regulatory_need'] } },
      ],
    },
    {
      id: 'sarah_pressure', speaker: 'counterparty', text: '"Without data rights, the partnership doesn\'t work for us. We have other AI options."', choices: [
        { id: 'c7', text: '"Those other options don\'t have our technology or your regulatory problem. We both know that."', type: 'aggressive_anchor', nextNodeId: 'sarah_surprised', effects: { trust: -5, anger: 5, valueClaimed: 10, informationRevealed: ['antitrust_pressure'] } },
        { id: 'c8', text: '"Let me propose a structure that gives you what you actually need without stripping our independence."', type: 'face_saving', nextNodeId: 'sarah_listening', effects: { trust: 10 } },
      ],
    },
    {
      id: 'sarah_reconsiders', speaker: 'counterparty', text: '"API access without data rights... *thinking* that\'s technically feasible. But we need more than just technical integration."', choices: [
        { id: 'c9', text: '"What about a regulatory partnership? VerityMesh becomes your featured independent AI partner. Public announcement. Regulatory optics. Full distribution."', type: 'package_offer', nextNodeId: 'sarah_calculating', effects: { trust: 15, valueCreated: 20, valueClaimed: 15 } },
      ],
    },
    {
      id: 'sarah_surprised', speaker: 'counterparty', text: '*slight pause* You\'ve done your homework. *measured tone* The regulatory angle is... relevant. Let me think about how to frame this internally."', choices: [
        { id: 'c10', text: '"Here\'s the frame: VerityMesh retains data rights + API integration + featured partnership + co-announced regulatory initiative. You get the platform story AND the regulatory optics. We get distribution AND independence."', type: 'package_offer', nextNodeId: 'sarah_hooked', effects: { trust: 20, valueCreated: 25, valueClaimed: 20 } },
      ],
    },
    {
      id: 'sarah_listening', speaker: 'counterparty', text: '"Alright. What structure do you have in mind?"', choices: [
        { id: 'c11', text: '"VerityMesh keeps data rights. We provide full API integration. We become a featured partner. And we co-announce a regulatory compliance initiative. You get what you need, we keep what we need."', type: 'package_offer', nextNodeId: 'sarah_calculating', effects: { trust: 15, valueCreated: 20, valueClaimed: 15 } },
      ],
    },
    {
      id: 'sarah_calculating', speaker: 'counterparty', text: '"The regulatory partnership angle is smart. Our legal team has been asking for this kind of initiative. But I need to show we\'re getting real value, not just optics."', choices: [
        { id: 'c12', text: '"You get exclusive platform distribution rights for 2 years, co-branded AI features, and a public partnership that helps with regulators. That\'s real value."', type: 'package_offer', nextNodeId: 'sarah_hooked', effects: { trust: 15, valueCreated: 15, valueClaimed: 15 } },
      ],
    },
    {
      id: 'sarah_hooked', speaker: 'counterparty', text: '*nods* I can sell this internally. It\'s a smarter deal than just grabbing data rights. Partnership, not acquisition. *slight smile* You\'re better prepared than most startups we deal with."', choices: [
        { id: 'c13', text: '"Then we have a deal. VerityMesh retains data rights, full API integration, featured partnership, co-announced regulatory initiative. Partnership, not dependency."', type: 'concession', nextNodeId: 'ending_master', effects: { trust: 15, valueClaimed: 15, valueCreated: 15, relationshipImpact: 15 } },
      ],
    },
    { id: 'ending_master', speaker: 'narrator', text: '👑 MASTER OUTCOME: VerityMesh retains data rights + API integration + featured partnership + co-announced regulatory initiative. When a powerful party demands something they don\'t need, they\'re seeking control, not value. Protect your independence.', isAuto: true },
    { id: 'ending_cooperative', speaker: 'narrator', text: '🤝 COOPERATIVE WIN: Distribution with limited data sharing. Compromise that gives some ground on data but preserves core independence.', isAuto: true },
    { id: 'ending_hard_bargain', speaker: 'narrator', text: '⚡ HARD BARGAIN: Rejected all data sharing. Lost the distribution deal. Building own channel will take years.', isAuto: true },
  ],
  endings: [
    { id: 'ending_master', type: 'master', title: 'Smart Independence', description: 'Kept data rights AND got distribution by leveraging OmniCorp\'s regulatory needs.', scores: { clientEconomicValue: 90, jointValueCreated: 85, infoDiscovered: 85, relationshipPreserved: 85, ethicalIntegrity: 90, strategicDiscipline: 90 }, longTermConsequence: 'VerityMesh becomes the model for independent AI partnerships. Distribution drives 8x revenue growth. OmniCorp\'s regulatory optics improve. Both sides win.' },
    { id: 'ending_cooperative', type: 'cooperative', title: 'Partial Ground', description: 'Gave some data access for distribution. Compromise.', scores: { clientEconomicValue: 65, jointValueCreated: 55, infoDiscovered: 50, relationshipPreserved: 65, ethicalIntegrity: 70, strategicDiscipline: 55 }, longTermConsequence: 'Distribution achieved but with some dependency risk. Manageable but not ideal.' },
    { id: 'ending_hard_bargain', type: 'hard_bargain', title: 'Independence at a Cost', description: 'Refused all concessions. Kept independence but lost distribution.', scores: { clientEconomicValue: 35, jointValueCreated: 10, infoDiscovered: 40, relationshipPreserved: 40, ethicalIntegrity: 75, strategicDiscipline: 30 }, longTermConsequence: 'VerityMesh stays independent but growth is slow. OmniCorp partners with a competitor instead.' },
  ],
  postmortem: {
    masterSolution: 'Leverage OmniCorp\'s regulatory needs to negotiate a partnership without data surrender. API integration + featured partnership + regulatory initiative = distribution without dependency.',
    keyHiddenFact: 'OmniCorp doesn\'t need the data — they need the dependency and the regulatory optics. VerityMesh has hidden leverage through OmniCorp\'s antitrust problems.',
    missedOpportunity: 'Accepting data rights demands without understanding why they\'re demanded means giving away independence for no reason.',
    lesson: 'When a powerful party demands something they don\'t need, they may be seeking control, not value. Protect your independence.',
    bestPossibleDeal: 'Retain data rights + API integration + featured partnership + co-announced regulatory initiative.',
  },
  biasTraps: [
    { id: 'bias_anchor', type: 'anchor_shock', description: 'OmniCorp\'s power and the 200M user number may make you feel like you have no leverage.', warningText: '⚠️ ANCHOR BIAS: The 200M user number makes the data rights feel like a fair trade. But OmniCorp needs something from you too — you just don\'t know it yet.', countermeasure: 'Research why OmniCorp really wants this deal. The apparent power imbalance may hide hidden leverage.' },
  ],
};
