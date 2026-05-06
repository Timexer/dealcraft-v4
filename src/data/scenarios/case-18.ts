import { Scenario } from './types';

export const case18: Scenario = {
  id: 'case-18',
  title: 'The Family Business Buyout',
  subtitle: 'Money is never just money in a family',
  category: 'relationship',
  tier: 4,
  fee: 25000,
  stakesLabel: '€6M buyout',
  difficulty: { economicComplexity: 3, emotionalComplexity: 5, ethicalComplexity: 2, informationAsymmetry: 3, powerImbalance: 2, timePressure: 2, relationshipStakes: 5 },
  client: { name: 'Alex Chen', role: 'Younger sibling, buyer', avatar: '💼', personality: { truthfulness: 65, ego: 40, riskTolerance: 45, patience: 45, trustSensitivity: 70, fairnessSensitivity: 75, authorityLevel: 45, emotionalVolatility: 50, preparationLevel: 50, relationshipOrientation: 70 } },
  counterparty: { name: 'Jordan Chen', role: 'Older sibling, seller', avatar: '👴', personality: { truthfulness: 50, ego: 55, riskTolerance: 30, patience: 30, trustSensitivity: 80, fairnessSensitivity: 70, authorityLevel: 65, emotionalVolatility: 65, preparationLevel: 35, relationshipOrientation: 80 } },
  briefing: { clientName: 'Alex Chen', clientRole: 'Younger sibling — wants to buy out older sibling\'s share', situation: 'Alex wants to buy Jordan\'s 50% share of their parents\' family business. Jordan is asking for €6M — well above the €4M valuation. The price dispute is getting personal, and family gatherings have become unbearable.', clientDemands: ['Buy Jordan\'s share at a fair price', 'Keep the business in the family', 'Preserve the sibling relationship'], knownFacts: ['Business is valued at €8M total (€4M per half)', 'Jordan demands €6M for their 50%', 'Parents built the business over 40 years', 'Both siblings worked in the business at different times'], missingInfo: ['Why is Jordan asking for so much above valuation?', 'What does Jordan really want?', 'Is this about money or something deeper?'], timePressure: 'Jordan is considering selling to an outside buyer. Family tension is at breaking point.', stakes: '€6M buyout + family relationship + parents\' legacy.', clientEmotionalState: 'Hurt, confused, desperate to save both the business and the relationship' },
  surfaceDemand: 'Jordan demands €6M for a 50% share valued at €4M — 50% above market.',
  hiddenTruth: 'Jordan doesn\'t really want to sell. The business was their parents\' legacy, and leaving feels like abandoning the family. The price dispute is a proxy for grief and guilt. Jordan needs to feel like they\'re still part of the family, even without the business. The premium isn\'t about money — it\'s about the emotional cost of letting go.',
  issues: [
    { id: 'price', name: 'Buyout Price', description: 'Price for Jordan\'s 50% share', clientPriority: 9, counterpartyPriority: 6, tradeability: 'medium', possibleValues: ['€4M', '€4.5M', '€5M', '€6M'] },
    { id: 'ongoing_role', name: 'Ongoing Role', description: 'Jordan\'s continued involvement in the business', clientPriority: 5, counterpartyPriority: 9, tradeability: 'high', possibleValues: ['No role', 'Advisory', 'Board seat', 'Quarterly consultant'] },
    { id: 'family_ritual', name: 'Family Connection', description: 'Formal family business connection', clientPriority: 6, counterpartyPriority: 10, tradeability: 'high', possibleValues: ['None', 'Annual family dinner at business', 'Named room/scholarship', 'Permanent family legacy designation'] },
    { id: 'transition', name: 'Transition Period', description: 'How the handover is managed', clientPriority: 7, counterpartyPriority: 7, tradeability: 'high', possibleValues: ['Immediate', '6-month transition', '1-year transition', 'Phased 2-year transition'] },
  ],
  batna: { clientBATNA: 'Let Jordan sell to outside buyer (lose family business)', clientBATNAValue: 2000000, clientReservationValue: 4000000, counterpartyBATNA: 'Sell to outside buyer (emotional cost + less favorable terms)', counterpartyBATNAValue: 3000000, counterpartyReservationValue: 5000000, estimatedZOPALow: 4000000, estimatedZOPAHigh: 5500000, trueZOPALow: 3500000, trueZOPAHigh: 6000000 },
  investigationActions: [
    { id: 'inv_family', name: 'Talk to Family Members', description: 'Understand the family dynamics and Jordan\'s real feelings', cost: 1, reveals: ['grief_proxy', 'belonging_need'], riskLevel: 'low', responseText: 'Family members reveal: Jordan has been emotional about selling since the conversation started. They\'ve said things like "It feels like we\'re erasing Mom and Dad." The price premium isn\'t about money — it\'s Jordan\'s way of making the emotional cost tangible. They need to feel like they still belong.' },
    { id: 'inv_legacy', name: 'Research Family Business Legacy Options', description: 'Find ways to preserve the family legacy within the business structure', cost: 1, reveals: ['legacy_options', 'ritual_ideas'], riskLevel: 'low', responseText: 'Many family businesses create legacy structures: named scholarships, annual family days, permanent "founder" designations, and ongoing advisory roles. These cost little but mean everything to departing family members. They address the emotional need without inflating the price.' },
  ],
  dialogueTree: [
    { id: 'start', speaker: 'narrator', text: 'Jordan sits across the kitchen table — the same table where your parents signed the business over to you both. Old photos line the walls. The emotional weight is enormous.', isAuto: true, nextNodeId: 'jordan_opening' },
    { id: 'jordan_opening', speaker: 'counterparty', text: '"€6M. That\'s my price. This business is worth more than any appraisal says — it\'s our parents\' life. You can\'t put a discount on that."', choices: [
      { id: 'c1', text: '"Jordan, I love this business too. But €6M isn\'t about the valuation. What\'s really going on?"', type: 'empathy', nextNodeId: 'jordan_emotional', effects: { trust: 15, informationRevealed: ['grief_proxy'] } },
      { id: 'c2', text: '"The valuation is €4M. I can\'t pay 50% above market."', type: 'aggressive_anchor', nextNodeId: 'jordan_hurt', effects: { anger: 15, trust: -10 } },
      { id: 'c3', text: '"What if we structured this differently? Not just a price, but a way for you to stay connected to what Mom and Dad built."', type: 'face_saving', nextNodeId: 'jordan_curious', effects: { trust: 15, valueCreated: 10 } },
    ] },
    { id: 'jordan_emotional', speaker: 'counterparty', text: '*voice cracks* I know it sounds crazy. But selling my half feels like... like I\'m cutting the last thread to Mom and Dad. Like I\'m saying their life\'s work didn\'t matter."', choices: [
      { id: 'c4', text: '"It matters. And you still belong to this family, with or without the business. What if we made that formal — a permanent family legacy in the business, plus a continuing role for you?"', type: 'package_offer', nextNodeId: 'jordan_hopeful', effects: { trust: 20, valueCreated: 20, informationRevealed: ['belonging_need'] } },
    ] },
    { id: 'jordan_hurt', speaker: 'counterparty', text: '"Of course you\'d say that. You want the business on the cheap. Just like everyone else in this family who thinks I don\'t matter."', choices: [
      { id: 'c5', text: '"That\'s not what I think. You matter to this family and this business. Let me show you how."', type: 'empathy', nextNodeId: 'jordan_curious', effects: { trust: 10, anger: -10 } },
    ] },
    { id: 'jordan_curious', speaker: 'counterparty', text: '"Stay connected... how? If I sell, I\'m out. That\'s how it works."', choices: [
      { id: 'c6', text: '"€4.5M buyout + annual family business day + permanent founder designation in the company charter + advisory board seat for 3 years + your name on the scholarship fund Mom always wanted. You\'re never out of this family."', type: 'package_offer', nextNodeId: 'jordan_moved', effects: { trust: 20, valueCreated: 25, valueClaimed: 15 } },
    ] },
    { id: 'jordan_hopeful', speaker: 'counterparty', text: '"A permanent legacy... *wipes eye* That\'s... that\'s more than I expected. But what about the money?"', choices: [
      { id: 'c7', text: '"€4.5M — above valuation because you\'re family. Plus all the legacy pieces. The total value to you exceeds €6M, and you keep your connection to what Mom and Dad built."', type: 'package_offer', nextNodeId: 'jordan_moved', effects: { trust: 20, valueCreated: 20, valueClaimed: 15 } },
    ] },
    { id: 'jordan_moved', speaker: 'counterparty', text: '*long pause* The scholarship fund... Mom always wanted that. *small smile* You\'re not trying to cut me out, are you? You\'re trying to keep me in."', choices: [
      { id: 'c8', text: '"Exactly. This business is our parents\' legacy. And so are we. Deal?"', type: 'concession', nextNodeId: 'ending_master', effects: { trust: 20, valueClaimed: 15, valueCreated: 20, relationshipImpact: 25 } },
    ] },
    { id: 'ending_master', speaker: 'narrator', text: '👑 MASTER OUTCOME: €4.5M buyout + permanent founder designation + advisory role + annual family day + scholarship fund. In family negotiations, money is never just money — address the emotional meaning behind the financial positions.', isAuto: true },
    { id: 'ending_cooperative', speaker: 'narrator', text: '🤝 COOPERATIVE WIN: €5M buyout with some family provisions. Decent outcome but emotional needs partially addressed.', isAuto: true },
    { id: 'ending_hard_bargain', speaker: 'narrator', text: '⚡ HARD BARGAIN: Jordan sells to outside buyer. Family rift. Parents\' legacy fractured.', isAuto: true },
  ],
  endings: [
    { id: 'ending_master', type: 'master', title: 'Family Preserved', description: 'Addressed the emotional truth behind the price dispute. Both siblings feel valued.', scores: { clientEconomicValue: 80, jointValueCreated: 90, infoDiscovered: 85, relationshipPreserved: 95, ethicalIntegrity: 90, strategicDiscipline: 85 }, longTermConsequence: 'Sibling relationship heals. Business thrives. Scholarship fund becomes a family tradition. The next generation inherits both the business and a healthy family.' },
    { id: 'ending_cooperative', type: 'cooperative', title: 'Financial Settlement', description: 'Fair price with some emotional acknowledgment.', scores: { clientEconomicValue: 65, jointValueCreated: 50, infoDiscovered: 45, relationshipPreserved: 60, ethicalIntegrity: 75, strategicDiscipline: 55 }, longTermConsequence: 'Deal done but some emotional distance remains. Family gatherings are awkward.' },
    { id: 'ending_hard_bargain', type: 'hard_bargain', title: 'Family Broken', description: 'Jordan sells outside. Family rift may be permanent.', scores: { clientEconomicValue: 30, jointValueCreated: -10, infoDiscovered: 20, relationshipPreserved: 5, ethicalIntegrity: 40, strategicDiscipline: 15 }, longTermConsequence: 'Outside buyer changes the business. Family doesn\'t speak at holidays. Parents\' legacy damaged.' },
  ],
  postmortem: { masterSolution: 'Address the grief and belonging needs directly. Lower price + permanent legacy designations + ongoing role + family rituals.', keyHiddenFact: 'Jordan\'s price premium is a proxy for grief and fear of losing family connection. Money is the language, but belonging is the meaning.', missedOpportunity: 'Negotiating on price alone means missing the emotional reality. Jordan would accept less money for more belonging.', lesson: 'In family negotiations, money is never just money. Address the emotional meaning behind the financial positions.', bestPossibleDeal: '€4.5M + permanent founder designation + advisory role + annual family day + scholarship fund.' },
  biasTraps: [{ id: 'bias_fixed_pie', type: 'fixed_pie', description: 'You may think this is just a price negotiation.', warningText: '⚠️ FIXED-PIE BIAS: This isn\'t just about the buyout price. Legacy, belonging, rituals, and ongoing roles are all tradeable — and they cost far less than the price premium Jordan is asking.', countermeasure: 'Think about what non-monetary terms address Jordan\'s emotional needs. Often these cost little but mean everything.' }],
};
