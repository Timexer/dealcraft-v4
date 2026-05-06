import { Scenario } from './types';
import { case01 } from './case-01';
import { case02 } from './case-02';
import { case03 } from './case-03';
import { case04 } from './case-04';
import { case05 } from './case-05';
import { case06 } from './case-06';
import { case07 } from './case-07';
import { case08 } from './case-08';
import { case09 } from './case-09';
import { case10 } from './case-10';
import { case11 } from './case-11';
import { case12 } from './case-12';
import { case13 } from './case-13';
import { case14 } from './case-14';
import { case15 } from './case-15';

// Cases 06-15 are imported from their own files with rich dialogue trees
// Cases 16-30 use makeCompactScenario with essential metadata and shorter dialogue trees

function makeCompactScenario(partial: Partial<Scenario> & { id: string; title: string; tier: number; category: Scenario['category'] }): Scenario {
  const feeMap: Record<number, number> = { 1: 2000, 2: 5000, 3: 12000, 4: 25000, 5: 50000 };
  return {
    subtitle: partial.subtitle || '',
    fee: partial.fee || feeMap[partial.tier] || 2000,
    stakesLabel: partial.stakesLabel || '',
    difficulty: partial.difficulty || {
      economicComplexity: partial.tier, emotionalComplexity: partial.tier, ethicalComplexity: Math.max(1, partial.tier - 1),
      informationAsymmetry: partial.tier, powerImbalance: Math.max(1, partial.tier - 1), timePressure: Math.max(1, partial.tier - 1),
      relationshipStakes: partial.tier,
    },
    client: partial.client || { name: 'Client', role: 'Client', avatar: '👤', personality: { truthfulness: 50, ego: 50, riskTolerance: 50, patience: 50, trustSensitivity: 50, fairnessSensitivity: 50, authorityLevel: 50, emotionalVolatility: 50, preparationLevel: 50, relationshipOrientation: 50 } },
    counterparty: partial.counterparty || { name: 'Counterparty', role: 'Counterparty', avatar: '👤', personality: { truthfulness: 50, ego: 50, riskTolerance: 50, patience: 50, trustSensitivity: 50, fairnessSensitivity: 50, authorityLevel: 50, emotionalVolatility: 50, preparationLevel: 50, relationshipOrientation: 50 } },
    briefing: partial.briefing || { clientName: '', clientRole: '', situation: '', clientDemands: [], knownFacts: [], missingInformation: [], timePressure: '', stakes: '', clientEmotionalState: '' },
    surfaceDemand: partial.surfaceDemand || '',
    hiddenTruth: partial.hiddenTruth || '',
    issues: partial.issues || [],
    batna: partial.batna || { clientBATNA: '', clientBATNAValue: 0, clientReservationValue: 0, counterpartyBATNA: '', counterpartyBATNAValue: 0, counterpartyReservationValue: 0, estimatedZOPALow: 0, estimatedZOPAHigh: 0, trueZOPALow: 0, trueZOPAHigh: 0 },
    investigationActions: partial.investigationActions || [],
    dialogueTree: partial.dialogueTree || [
      { id: 'start', speaker: 'narrator', text: 'The negotiation begins.', isAuto: true, nextNodeId: 'opening' },
      { id: 'opening', speaker: 'counterparty', text: "Let's discuss the terms.", choices: [
        { id: 'c_diag', text: '"Help me understand your priorities."', type: 'diagnostic', nextNodeId: 'coop_path', effects: { trust: 10, anger: -5 } },
        { id: 'c_assert', text: '"Here is our position."', type: 'aggressive_anchor', nextNodeId: 'hard_path', effects: { trust: -5, anger: 10 } },
        { id: 'c_empathy', text: '"I understand your concerns."', type: 'empathy', nextNodeId: 'coop_path', effects: { trust: 15, anger: -10 } },
      ]},
      { id: 'coop_path', speaker: 'counterparty', text: "I appreciate your approach. Let's find common ground.", choices: [
        { id: 'c_pkg', text: '"Let me propose a package deal."', type: 'package_offer', nextNodeId: 'ending_cooperative', effects: { trust: 10, valueCreated: 15, valueClaimed: 10 } },
        { id: 'c_walk', text: '"I need to think about this."', type: 'silence', nextNodeId: 'ending_cooperative', effects: { trust: 5, valueClaimed: 5 } },
      ]},
      { id: 'hard_path', speaker: 'counterparty', text: "That's quite a position. I'm not sure we can agree.", choices: [
        { id: 'c_push', text: '"This is our best offer."', type: 'aggressive_anchor', nextNodeId: 'ending_hard', effects: { trust: -10, anger: 10, valueClaimed: 15 } },
        { id: 'c_pivot', text: '"Let me reframe this."', type: 'face_saving', nextNodeId: 'ending_cooperative', effects: { trust: 10, valueCreated: 10 } },
      ]},
      { id: 'ending_cooperative', speaker: 'narrator', text: '🤝 A fair deal is reached. Both sides walk away satisfied.', isAuto: true },
      { id: 'ending_hard', speaker: 'narrator', text: '⚡ You get what you want, but the relationship is strained.', isAuto: true },
    ],
    endings: partial.endings || [
      { id: 'cooperative', type: 'cooperative', title: 'Cooperative Deal', description: 'A fair deal reached through mutual understanding.', scores: { clientEconomicValue: 65, jointValueCreated: 70, infoDiscovered: 50, relationshipPreserved: 75, ethicalIntegrity: 80, strategicDiscipline: 65 }, longTermConsequence: 'Both parties maintain a productive relationship.' },
      { id: 'hard_bargain', type: 'hard_bargain', title: 'Hard Bargain', description: 'You claimed value but at a cost to the relationship.', scores: { clientEconomicValue: 70, jointValueCreated: 35, infoDiscovered: 30, relationshipPreserved: 30, ethicalIntegrity: 60, strategicDiscipline: 50 }, longTermConsequence: 'The deal works but future opportunities are limited.' },
    ],
    postmortem: partial.postmortem || { masterSolution: '', keyHiddenFact: '', missedOpportunity: '', lesson: '', bestPossibleDeal: '' },
    biasTraps: partial.biasTraps || [],
    ...partial,
  };
}

// Cases 16-30 — concise entries
const case16 = makeCompactScenario({
  id: 'case-16', title: 'Employee vs. MegaCorp', subtitle: 'The precedent they fear', tier: 4, category: 'power_imbalance',
  stakesLabel: 'IP ownership rights',
  client: { name: 'Dr. Sarah Lin', role: 'Senior Engineer', avatar: '👩‍🔬', personality: { truthfulness: 80, ego: 40, riskTolerance: 45, patience: 40, trustSensitivity: 65, fairnessSensitivity: 75, authorityLevel: 15, emotionalVolatility: 50, preparationLevel: 50, relationshipOrientation: 55 } },
  counterparty: { name: 'TechGiant Inc.', role: 'Major Tech Corporation', avatar: '🏢', personality: { truthfulness: 45, ego: 75, riskTolerance: 40, patience: 55, trustSensitivity: 50, fairnessSensitivity: 40, authorityLevel: 95, emotionalVolatility: 25, preparationLevel: 85, relationshipOrientation: 30 } },
  briefing: { clientName: 'Dr. Sarah Lin', clientRole: 'Senior Engineer (departing)', situation: 'TechGiant claims Sarah\'s side project — built on her own time with her own resources — belongs to them under the IP clause of her employment contract.', clientDemands: ['Full ownership of side project', 'Clean departure'], knownFacts: ['Side project was built outside work hours', 'Employment contract has broad IP clause', 'Project uses no company resources'], missingInformation: ['What TechGiant actually fears', 'Whether they really want the project', 'Internal politics'], timePressure: 'Moderate — new job starts soon', stakes: 'IP ownership and career future', clientEmotionalState: 'Angry, feels betrayed' },
  surfaceDemand: 'Sarah wants full ownership of her side project.',
  hiddenTruth: 'TechGiant mainly fears setting a precedent where employees can walk away with IP. They don\'t actually care about this specific project — they care about the pattern it sets.',
  postmortem: { masterSolution: 'Sarah keeps ownership + company receives narrow internal license + no admission of precedent + confidentiality + neutral departure statement.', keyHiddenFact: 'TechGiant fears precedent, not the project itself.', missedOpportunity: 'A public fight creates the precedent TechGiant fears most — a lose-lose.', lesson: 'Large organizations often care about precedent more than the immediate asset.', bestPossibleDeal: 'Full ownership + narrow company license + no precedent + confidential + neutral departure' },
});

const case17 = makeCompactScenario({
  id: 'case-17', title: 'Small Nation Debt Talks', subtitle: 'When creditors fear mercy', tier: 4, category: 'power_imbalance',
  stakesLabel: '€800M sovereign debt',
  client: { name: 'Republic of Mariana', role: 'Island Nation Finance Ministry', avatar: '🏝️', personality: { truthfulness: 70, ego: 40, riskTolerance: 35, patience: 50, trustSensitivity: 55, fairnessSensitivity: 70, authorityLevel: 30, emotionalVolatility: 45, preparationLevel: 55, relationshipOrientation: 50 } },
  counterparty: { name: 'Global Creditors Coalition', role: 'International Creditors', avatar: '🏦', personality: { truthfulness: 50, ego: 65, riskTolerance: 50, patience: 55, trustSensitivity: 40, fairnessSensitivity: 45, authorityLevel: 80, emotionalVolatility: 30, preparationLevel: 80, relationshipOrientation: 25 } },
  briefing: { clientName: 'Republic of Mariana', clientRole: 'Island Nation Finance Ministry', situation: 'After a devastating hurricane, Mariana needs 40% debt forgiveness. Creditors demand full repayment despite the disaster.', clientDemands: ['40% debt forgiveness', 'Interest rate freeze', 'Repayment timeline extension'], knownFacts: ['Hurricane destroyed 30% of infrastructure', 'Current debt is €800M', 'Creditors hold all the cards'], missingInformation: ['What creditors fear most', 'Whether there are ESG pressures', 'Political dynamics among creditors'], timePressure: 'High — rebuilding cannot wait', stakes: 'National economic survival', clientEmotionalState: 'Desperate but dignified' },
  surfaceDemand: 'Mariana wants 40% debt forgiveness.',
  hiddenTruth: 'Creditors fear setting a forgiveness precedent for other nations. However, they\'re under pressure from ESG investors who will penalize them for appearing ruthless.',
  postmortem: { masterSolution: 'Debt-for-Nature swap: nation commits to marine reserve protection (wanted anyway), creditors write off portion while claiming ESG PR victory.', keyHiddenFact: 'Creditors fear precedent but need ESG credibility more than they need full repayment.', missedOpportunity: 'Direct debt forgiveness triggers precedent fears. Find a face-saving alternative.', lesson: 'When negotiating from weakness, find out who the strong party answers to.', bestPossibleDeal: '30% debt converted to marine conservation fund + 10% outright forgiveness + extended timeline' },
});

const case18 = makeCompactScenario({
  id: 'case-18', title: 'The Family Business Buyout', subtitle: 'Math vs. identity', tier: 4, category: 'relationship',
  stakesLabel: '€20M family business',
  client: { name: 'Lisa Weiss', role: 'Younger Sibling / CEO', avatar: '💼', personality: { truthfulness: 70, ego: 55, riskTolerance: 50, patience: 40, trustSensitivity: 65, fairnessSensitivity: 70, authorityLevel: 60, emotionalVolatility: 50, preparationLevel: 60, relationshipOrientation: 70 } },
  counterparty: { name: 'Karl Weiss Sr.', role: 'Older Sibling / Co-owner', avatar: '👴', personality: { truthfulness: 65, ego: 80, riskTolerance: 30, patience: 45, trustSensitivity: 75, fairnessSensitivity: 70, authorityLevel: 65, emotionalVolatility: 65, preparationLevel: 50, relationshipOrientation: 55 } },
  briefing: { clientName: 'Lisa Weiss', clientRole: 'CEO & Younger Sibling', situation: 'Lisa wants to buy out her older brother Karl\'s share of the family logistics company. Karl rejects every valuation as "insulting."', clientDemands: ['Buy out Karl at fair market value', 'Maintain family relationship'], knownFacts: ['Company valued at €20M', 'Karl owns 50%', 'Lisa has been running the company for 5 years'], missingInformation: ['Why Karl finds every valuation insulting', 'What Karl really wants', 'Whether this is about money or something else'], timePressure: 'Low — but tension is growing', stakes: '€20M business + family relationship', clientEmotionalState: 'Hurt, confused, wants resolution' },
  surfaceDemand: 'Lisa wants to buy out Karl at fair market value.',
  hiddenTruth: 'Karl feels erased from the company their parents built. He fears losing his identity, not his money. Every valuation feels like a price tag on his life\'s meaning.',
  postmortem: { masterSolution: 'Fair market value + "Legacy Chairman" title + name on flagship warehouse + family charity in his name.', keyHiddenFact: 'Karl is fighting for identity and respect, not money.', missedOpportunity: 'Using corporate valuation tools on a family dispute is like doing surgery with a hammer.', lesson: 'Family disputes are rarely about math; they are about respect and identity.', bestPossibleDeal: '€10M buyout + Legacy Chairman title + warehouse naming + family charity' },
});

const case19 = makeCompactScenario({
  id: 'case-19', title: 'The Apology Clause', subtitle: 'Saving face on both sides', tier: 4, category: 'relationship',
  stakesLabel: '€12M client contract',
  client: { name: 'SoftGuard', role: 'B2B Software Vendor', avatar: '🛡️', personality: { truthfulness: 65, ego: 55, riskTolerance: 45, patience: 45, trustSensitivity: 55, fairnessSensitivity: 60, authorityLevel: 65, emotionalVolatility: 40, preparationLevel: 65, relationshipOrientation: 55 } },
  counterparty: { name: 'EnterpriseCorp', role: 'Major Enterprise Client', avatar: '🏢', personality: { truthfulness: 55, ego: 70, riskTolerance: 35, patience: 30, trustSensitivity: 60, fairnessSensitivity: 50, authorityLevel: 80, emotionalVolatility: 55, preparationLevel: 60, relationshipOrientation: 40 } },
  briefing: { clientName: 'SoftGuard', clientRole: 'Enterprise Software Vendor', situation: 'A data leak affected EnterpriseCorp. They demand a massive financial penalty AND a public apology. SoftGuard refuses to apologize publicly, fearing legal liability.', clientDemands: ['Avoid public apology', 'Minimize financial penalty', 'Retain the client'], knownFacts: ['Data leak occurred', 'Client demands are escalating', 'Legal team warns against public apology'], missingInformation: ['Why the public apology matters so much', 'What the CIO actually needs', 'Internal politics at client'], timePressure: 'High — client threatening to terminate', stakes: '€12M annual contract', clientEmotionalState: 'Defensive, legally cautious' },
  surfaceDemand: 'SoftGuard refuses to issue a public apology.',
  hiddenTruth: 'EnterpriseCorp\'s CIO is about to be fired over the leak and desperately needs to show the board that the vendor is taking the blame.',
  postmortem: { masterSolution: 'Joint press release emphasizing "shared commitment to next-gen security" + heavy service credits + joint security audit funding. CIO looks proactive, SoftGuard avoids admitting legal negligence.', keyHiddenFact: 'The CIO needs to save their job, not punish SoftGuard.', missedOpportunity: 'You can save the other party\'s face without destroying your own.', lesson: 'You can save the other party\'s face without destroying your own.', bestPossibleDeal: 'Joint security commitment statement + service credits + security audit funding + CIO saves job' },
});

const case20 = makeCompactScenario({
  id: 'case-20', title: 'The Supplier You Still Need', subtitle: 'Winning the battle, losing the war', tier: 4, category: 'relationship',
  stakesLabel: '€2M in machinery',
  client: { name: 'Valley Health Network', role: 'Regional Hospital Network', avatar: '🏥', personality: { truthfulness: 70, ego: 50, riskTolerance: 35, patience: 40, trustSensitivity: 55, fairnessSensitivity: 65, authorityLevel: 70, emotionalVolatility: 55, preparationLevel: 55, relationshipOrientation: 50 } },
  counterparty: { name: 'MedDeviceCo', role: 'Medical Device Supplier', avatar: '🔧', personality: { truthfulness: 50, ego: 55, riskTolerance: 50, patience: 45, trustSensitivity: 50, fairnessSensitivity: 45, authorityLevel: 65, emotionalVolatility: 40, preparationLevel: 60, relationshipOrientation: 40 } },
  briefing: { clientName: 'Valley Health Network', clientRole: 'Regional Hospital Network', situation: 'MedDeviceCo breached their contract, costing Valley Health €200,000. The hospital wants to sue and terminate.', clientDemands: ['Sue for damages', 'Terminate the contract'], knownFacts: ['Breach cost €200,000', 'Contract allows termination', 'Supplier admits the breach'], missingInformation: ['Whether there are alternative suppliers', 'What replacing the supplier would cost', 'Whether the supplier is truly irreplaceable'], timePressure: 'Moderate — legal deadline approaching', stakes: '€200K damages vs. €2M+ replacement cost', clientEmotionalState: 'Angry, wants justice' },
  surfaceDemand: 'Valley Health wants to sue for damages and terminate the contract.',
  hiddenTruth: 'MedDeviceCo is the only supplier in the region that can service Valley Health\'s existing medical machinery. Replacing all machinery would cost over €2 million.',
  postmortem: { masterSolution: 'Waive cash damages in exchange for 5-year maintenance extension at discounted rate + free machinery upgrades.', keyHiddenFact: 'You can\'t afford to terminate. Your BATNA is terrible.', missedOpportunity: 'Desire for revenge blinds the client to their own weak BATNA.', lesson: 'Winning the battle but losing the war is a failure of preparation.', bestPossibleDeal: 'Waive €200K damages + 5-year discounted maintenance + free upgrades + improved SLA' },
});

const case21 = makeCompactScenario({
  id: 'case-21', title: 'The Angry Union', subtitle: 'Political currency', tier: 5, category: 'ugly',
  stakesLabel: 'National rail system',
  client: { name: 'National Rail Corp', role: 'National Rail Operator', avatar: '🚂', personality: { truthfulness: 60, ego: 60, riskTolerance: 40, patience: 30, trustSensitivity: 45, fairnessSensitivity: 50, authorityLevel: 75, emotionalVolatility: 50, preparationLevel: 65, relationshipOrientation: 35 } },
  counterparty: { name: 'Frank Torres', role: 'Union Leader', avatar: '✊', personality: { truthfulness: 55, ego: 80, riskTolerance: 65, patience: 25, trustSensitivity: 50, fairnessSensitivity: 60, authorityLevel: 70, emotionalVolatility: 70, preparationLevel: 70, relationshipOrientation: 35 } },
  briefing: { clientName: 'National Rail Corp', clientRole: 'National Railway Operator', situation: 'The transit union threatens a paralyzing strike over a 4% wage dispute just days before a major holiday travel period.', clientDemands: ['Prevent the strike', 'Hold wage increase to 2%'], knownFacts: ['Union demands 4% wage increase', 'Strike would paralyze holiday travel', 'Public opinion is volatile'], missingInformation: ['What the union leader really needs', 'Internal union politics', 'Whether the wage is the real issue'], timePressure: 'Critical — strike deadline in 48 hours', stakes: 'Millions in daily revenue + public trust', clientEmotionalState: 'Panicked, feels cornered' },
  surfaceDemand: 'Rail Corp wants to hold firm at 2% to prevent future extortion.',
  hiddenTruth: 'Union leader Frank Torres faces a tough re-election and needs a highly visible "win" against management. The actual percentage matters less than the political narrative.',
  postmortem: { masterSolution: 'Hold wage at 2% + highly visible low-cost concessions: better break rooms, updated uniforms, public signing ceremony where union leader is credited with a historic victory.', keyHiddenFact: 'The union leader needs a political win, not necessarily the full 4%.', missedOpportunity: 'In public negotiations, visible victories are valid currency.', lesson: 'In highly public negotiations, political victories are a valid currency.', bestPossibleDeal: '2% wage + visible concessions + public ceremony + union leader saves face' },
});

const case22 = makeCompactScenario({
  id: 'case-22', title: 'The Threat Letter', subtitle: 'Calling the bluff', tier: 5, category: 'ugly',
  stakesLabel: '€500K or shutdown',
  client: { name: 'LaunchPad', role: 'E-commerce Startup', avatar: '🚀', personality: { truthfulness: 75, ego: 40, riskTolerance: 55, patience: 40, trustSensitivity: 50, fairnessSensitivity: 65, authorityLevel: 30, emotionalVolatility: 60, preparationLevel: 40, relationshipOrientation: 45 } },
  counterparty: { name: 'IP Shield LLC', role: 'Patent Assertion Entity', avatar: '📜', personality: { truthfulness: 30, ego: 50, riskTolerance: 30, patience: 70, trustSensitivity: 20, fairnessSensitivity: 15, authorityLevel: 40, emotionalVolatility: 20, preparationLevel: 80, relationshipOrientation: 10 } },
  briefing: { clientName: 'LaunchPad', clientRole: 'E-commerce Startup', situation: 'A notorious patent troll sends a cease-and-desist demanding €500K licensing fee or they\'ll shut down the startup\'s website.', clientDemands: ['Fight the claim', 'Avoid paying the fee'], knownFacts: ['Cease-and-desist received', '€500K licensing fee demanded', 'Threat of injunction'], missingInformation: ['Validity of the patent claim', 'Whether the troll will actually sue', 'Cost of fighting in court'], timePressure: 'High — 14-day deadline', stakes: '€500K or business shutdown', clientEmotionalState: 'Terrified, feels trapped' },
  surfaceDemand: 'LaunchPad wants to fight the patent claim on principle.',
  hiddenTruth: 'IP Shield\'s entire business model relies on cheap settlements. They don\'t have the capital to actually litigate against a determined defendant.',
  postmortem: { masterSolution: 'Respond with detailed, legally strong refusal signaling dedicated litigation budget. Offer €15K "go-away" nuisance settlement. Troll accepts and moves on.', keyHiddenFact: 'The troll can\'t afford to actually go to court.', missedOpportunity: 'A threat is only as strong as the willingness to execute it.', lesson: 'A threat is only as strong as the other side\'s willingness to execute it.', bestPossibleDeal: '€15K nuisance settlement + full release + no admission' },
});

const case23 = makeCompactScenario({
  id: 'case-23', title: 'The Founder Meltdown', subtitle: 'Regret wearing anger\'s mask', tier: 5, category: 'ugly',
  stakesLabel: '€50M deal',
  client: { name: 'Tech Founder', role: 'Acquisition Target Founder', avatar: '😤', personality: { truthfulness: 70, ego: 90, riskTolerance: 35, patience: 20, trustSensitivity: 80, fairnessSensitivity: 65, authorityLevel: 75, emotionalVolatility: 85, preparationLevel: 55, relationshipOrientation: 40 } },
  counterparty: { name: 'AcquireCorp', role: 'Acquiring Company', avatar: '🏦', personality: { truthfulness: 55, ego: 60, riskTolerance: 50, patience: 45, trustSensitivity: 50, fairnessSensitivity: 55, authorityLevel: 80, emotionalVolatility: 30, preparationLevel: 75, relationshipOrientation: 40 } },
  briefing: { clientName: 'Tech Founder', clientRole: 'Selling Founder', situation: 'During final hours of a lucrative €50M acquisition, the buyer asks for a standard non-compete. The founder throws a tantrum and threatens to walk away.', clientDemands: ['Remove the non-compete clause', 'Close the deal on original terms'], knownFacts: ['Non-compete is standard for this type of deal', '€50M deal is on the table', 'Founder is emotionally volatile'], missingInformation: ['Why the non-compete triggers such a reaction', 'Whether the founder really wants to sell', 'What\'s behind the emotional outburst'], timePressure: 'Critical — deal closing window closing', stakes: '€50M acquisition', clientEmotionalState: 'Volcanic, may be self-sabotaging' },
  surfaceDemand: 'Founder refuses to sign the non-compete.',
  hiddenTruth: 'The founder is experiencing extreme regret panic about selling their life\'s work. The non-compete isn\'t the real issue — it\'s a subconscious excuse to blow up the deal they\'re terrified of completing.',
  postmortem: { masterSolution: 'Call a break session. Let the founder vent. Validate their legacy. Reframe the non-compete as proof of how valuable the buyer considers the founder\'s genius. Founder signs.', keyHiddenFact: 'The founder wants the deal but fears the loss of identity. The non-compete is a proxy for that fear.', missedOpportunity: 'Never counter an emotional outburst with a logical spreadsheet.', lesson: 'Never counter an emotional outburst with a logical spreadsheet.', bestPossibleDeal: 'Non-compete reframed as validation + legacy preservation + deal closes at full value' },
});

const case24 = makeCompactScenario({
  id: 'case-24', title: 'The Quiet Collusion', subtitle: 'Value created by destroying outsiders', tier: 5, category: 'ethics',
  stakesLabel: 'Industry standard control',
  client: { name: 'VP of TelecomCo', role: 'Telecommunications VP', avatar: '📡', personality: { truthfulness: 55, ego: 60, riskTolerance: 50, patience: 55, trustSensitivity: 50, fairnessSensitivity: 55, authorityLevel: 70, emotionalVolatility: 35, preparationLevel: 70, relationshipOrientation: 45 } },
  counterparty: { name: 'CompetiNet', role: 'Biggest Competitor', avatar: '🏢', personality: { truthfulness: 40, ego: 65, riskTolerance: 55, patience: 50, trustSensitivity: 40, fairnessSensitivity: 35, authorityLevel: 80, emotionalVolatility: 30, preparationLevel: 75, relationshipOrientation: 25 } },
  briefing: { clientName: 'VP of TelecomCo', clientRole: 'Telecommunications VP', situation: 'Your biggest competitor proposes a "technical standard" that would benefit both companies\' efficiency. It sounds reasonable.', clientDemands: ['Evaluate the standard honestly', 'Protect against antitrust risk'], knownFacts: ['Proposed standard would reduce costs for both', 'Standard would streamline operations', 'Competitor seems cooperative'], missingInformation: ['Impact on smaller competitors', 'Antitrust implications', 'Whether this is actually collusion'], timePressure: 'Low — industry standards process is slow', stakes: 'Industry standard control + antitrust risk', clientEmotionalState: 'Tempted by efficiency gains, cautious about legality' },
  surfaceDemand: 'The VP wants to evaluate the standard on its merits.',
  hiddenTruth: 'The proposed standard is deliberately engineered to bankrupt a new, innovative third competitor who relies on a different protocol. This is parasitic value creation.',
  postmortem: { masterSolution: 'Propose modified standard that achieves efficiency gains but remains open-source enough to avoid regulatory backlash and antitrust lawsuits.', keyHiddenFact: 'The standard is designed to eliminate a competitor, not improve technology.', missedOpportunity: 'Value created at the unethical expense of an outsider is a liability, not a victory.', lesson: 'Value created at the unethical expense of an outsider is a liability, not a victory.', bestPossibleDeal: 'Open-standard compromise + efficiency gains + no antitrust risk + competitor survives' },
});

const case25 = makeCompactScenario({
  id: 'case-25', title: 'The Biased Procurement Score', subtitle: 'Structural integrity vs. authority', tier: 5, category: 'ethics',
  stakesLabel: '€50M government contract',
  client: { name: 'Procurement Director', role: 'Government Procurement Director', avatar: '📋', personality: { truthfulness: 80, ego: 40, riskTolerance: 35, patience: 50, trustSensitivity: 65, fairnessSensitivity: 80, authorityLevel: 50, emotionalVolatility: 40, preparationLevel: 65, relationshipOrientation: 55 } },
  counterparty: { name: 'Deputy Minister', role: 'Boss / Political Appointee', avatar: '👔', personality: { truthfulness: 40, ego: 80, riskTolerance: 55, patience: 35, trustSensitivity: 35, fairnessSensitivity: 30, authorityLevel: 90, emotionalVolatility: 50, preparationLevel: 45, relationshipOrientation: 25 } },
  briefing: { clientName: 'Procurement Director', clientRole: 'Government Procurement Director', situation: 'Your boss subtly pressures you to weight the vendor scoring matrix so a specific vendor — a personal contact — wins the €50M contract.', clientDemands: ['Select the best vendor', 'Keep your job'], knownFacts: ['Three vendors competing', 'Boss has preferred vendor', 'Favored vendor is 15% more expensive'], missingInformation: ['How far the boss will push', 'Whether whistleblowing is viable', 'How to structure the scoring fairly'], timePressure: 'Moderate — selection deadline approaching', stakes: '€50M contract + career + integrity', clientEmotionalState: 'Conflicted, afraid of retaliation' },
  surfaceDemand: 'The director wants to secure the best vendor while keeping their job.',
  hiddenTruth: 'The favored vendor is 15% more expensive and has a history of cost overruns. Rigging the scoring would be corrupt and expose the government to audit risk.',
  postmortem: { masterSolution: 'Redesign scoring matrix to heavily weight "cost overrun penalties" and "historical adherence." The favored vendor must either adopt strict terms or naturally lose on objective metrics.', keyHiddenFact: 'You can use structural rules to neutralize unethical pressure without direct confrontation.', missedOpportunity: 'Refusing directly gets you fired. Complying makes you complicit. Structure the rules to make fairness the default.', lesson: 'Use structural rules to neutralize unethical pressure.', bestPossibleDeal: 'Objective scoring criteria + cost overrun penalties + favored vendor competes on merit or loses' },
});

const case26 = makeCompactScenario({
  id: 'case-26', title: 'The Dangerous Settlement', subtitle: 'What the NDA hides', tier: 5, category: 'ethics',
  stakesLabel: 'Public safety',
  client: { name: 'AutoCo', role: 'Automotive Manufacturer', avatar: '🚗', personality: { truthfulness: 45, ego: 70, riskTolerance: 45, patience: 50, trustSensitivity: 40, fairnessSensitivity: 40, authorityLevel: 80, emotionalVolatility: 35, preparationLevel: 75, relationshipOrientation: 30 } },
  counterparty: { name: 'The Martinez Family', role: 'Injured Family', avatar: '👨‍👩‍👧', personality: { truthfulness: 80, ego: 30, riskTolerance: 40, patience: 30, trustSensitivity: 70, fairnessSensitivity: 80, authorityLevel: 15, emotionalVolatility: 70, preparationLevel: 40, relationshipOrientation: 60 } },
  briefing: { clientName: 'AutoCo', clientRole: 'Automotive Manufacturer', situation: 'A family is suing AutoCo over a brake failure that injured their child. AutoCo wants to settle out of court with a strict NDA.', clientDemands: ['Settle quickly', 'Seal the case with NDA', 'Avoid public scrutiny'], knownFacts: ['Brake failure caused accident', 'Family is injured', 'AutoCo wants confidentiality'], missingInformation: ['Whether the brake failure is systemic', 'Other incidents', 'Risk to other drivers'], timePressure: 'High — media attention growing', stakes: 'Public safety + company reputation', clientEmotionalState: 'Defensive, focused on damage control' },
  surfaceDemand: 'AutoCo wants to settle with a strict NDA.',
  hiddenTruth: 'The brake failure is a systemic manufacturing defect. Sealing the settlement means other drivers will not be warned and could be injured or killed.',
  postmortem: { masterSolution: 'Convince AutoCo to do a proactive recall. Negotiate fair financial settlement with the family, citing commitment to safety improvements. Short-term cost, long-term trust.', keyHiddenFact: 'The defect is systemic. Sealing the settlement will lead to more injuries and eventually a criminal investigation.', missedOpportunity: 'A negotiator\'s job includes protecting the client from their own shortsightedness.', lesson: 'A negotiator\'s job includes protecting the client from their own shortsightedness.', bestPossibleDeal: 'Proactive recall + fair family settlement + safety commitment statement + long-term brand recovery' },
});

const case27 = makeCompactScenario({
  id: 'case-27', title: 'The Sports League Lockout', subtitle: 'Changing the game', tier: 5, category: 'master',
  stakesLabel: '€2B season revenue',
  client: { name: 'Players\' Association', role: 'Professional Athletes Union', avatar: '⚽', personality: { truthfulness: 65, ego: 70, riskTolerance: 50, patience: 35, trustSensitivity: 55, fairnessSensitivity: 60, authorityLevel: 60, emotionalVolatility: 55, preparationLevel: 65, relationshipOrientation: 45 } },
  counterparty: { name: 'League Owners', role: 'Team Owners Coalition', avatar: '💼', personality: { truthfulness: 50, ego: 75, riskTolerance: 45, patience: 40, trustSensitivity: 40, fairnessSensitivity: 45, authorityLevel: 85, emotionalVolatility: 50, preparationLevel: 80, relationshipOrientation: 30 } },
  briefing: { clientName: 'Players\' Association', clientRole: 'Professional Athletes Union', situation: 'Billionaire owners and millionaire players are locked in a revenue-sharing dispute. A canceled season looms. Both sides have made public commitments they can\'t back down from.', clientDemands: ['No hard salary cap', 'Fair revenue sharing', 'Save the season'], knownFacts: ['Season cancellation would cost €2B+', 'Both sides entrenched', 'Fans turning against both parties'], missingInformation: ['Whether either side can back down', 'Political constraints on both sides', 'Creative solutions'], timePressure: 'Critical — season deadline weeks away', stakes: '€2B+ season revenue + fan loyalty + long-term league health', clientEmotionalState: 'Defiant but worried' },
  surfaceDemand: 'Players refuse a hard salary cap. Owners refuse to start without one.',
  hiddenTruth: 'Both sides are trapped in an escalation of commitment. The fans are turning against both parties, threatening long-term revenue for everyone.',
  postmortem: { masterSolution: 'Season starts immediately. All revenues into escrow. If no deal in 30 days, 10% goes to charity daily. Extreme pressure forces rational compromise without punishing fans.', keyHiddenFact: 'Both sides are trapped by public commitments. They need a mechanism that allows compromise without appearing weak.', missedOpportunity: 'When egos cause a stalemate, change the rules of the game.', lesson: 'When egos cause a stalemate, change the rules of the game.', bestPossibleDeal: 'Escrow mechanism + charity pressure + season proceeds + rational compromise' },
});

const case28 = makeCompactScenario({
  id: 'case-28', title: 'The City Water Treaty', subtitle: 'Solving scarcity\'s root cause', tier: 5, category: 'master',
  stakesLabel: 'Regional water supply',
  client: { name: 'Mayor of Riverside', role: 'Upstream Agricultural City', avatar: '🌾', personality: { truthfulness: 65, ego: 60, riskTolerance: 40, patience: 50, trustSensitivity: 55, fairnessSensitivity: 60, authorityLevel: 70, emotionalVolatility: 45, preparationLevel: 60, relationshipOrientation: 50 } },
  counterparty: { name: 'Mayor of Portside', role: 'Downstream Industrial City', avatar: '🏭', personality: { truthfulness: 60, ego: 65, riskTolerance: 45, patience: 40, trustSensitivity: 50, fairnessSensitivity: 55, authorityLevel: 75, emotionalVolatility: 50, preparationLevel: 65, relationshipOrientation: 40 } },
  briefing: { clientName: 'Mayor of Riverside', clientRole: 'Upstream Agricultural City', situation: 'Your city controls a river\'s headwaters. A downstream industrial city demands you release more water during a drought. They threaten to cut off power grid subsidies.', clientDemands: ['Maintain water for farmers', 'Keep power subsidies'], knownFacts: ['Drought is severe', 'Downstream city needs water for industry', 'Power subsidies are leverage'], missingInformation: ['How much water is actually needed', 'Whether farmers are using water efficiently', 'Infrastructure solutions'], timePressure: 'High — drought worsening', stakes: 'Regional water supply + economic stability', clientEmotionalState: 'Defensive, protecting farmers' },
  surfaceDemand: 'Riverside refuses to release more water, prioritizing farmers.',
  hiddenTruth: 'The farmers are using outdated, water-wasting irrigation because they can\'t afford upgrades. The real solution is capital investment, not water allocation.',
  postmortem: { masterSolution: 'Downstream city funds modern drip-irrigation infrastructure for upstream farmers. Farmers maintain crop yield using 40% less water, allowing excess to flow downstream.', keyHiddenFact: 'The scarcity is artificial — caused by outdated irrigation, not genuine shortage.', missedOpportunity: 'Solve the root cause of the scarcity, not the allocation of the scarcity.', lesson: 'Solve the root cause of the scarcity, not the allocation of the scarcity.', bestPossibleDeal: 'Downstream funds drip irrigation + farmers keep yield + 40% water savings + both cities win' },
});

const case29 = makeCompactScenario({
  id: 'case-29', title: 'The AI Data Accord', subtitle: 'Inventing the system', tier: 5, category: 'master',
  stakesLabel: 'AI industry future',
  client: { name: 'Tech Consortium', role: 'AI Technology Companies', avatar: '🤖', personality: { truthfulness: 55, ego: 70, riskTolerance: 55, patience: 45, trustSensitivity: 45, fairnessSensitivity: 50, authorityLevel: 80, emotionalVolatility: 35, preparationLevel: 75, relationshipOrientation: 35 } },
  counterparty: { name: 'Authors\' Guild', role: 'Content Creators Coalition', avatar: '📚', personality: { truthfulness: 70, ego: 55, riskTolerance: 40, patience: 40, trustSensitivity: 60, fairnessSensitivity: 75, authorityLevel: 50, emotionalVolatility: 55, preparationLevel: 55, relationshipOrientation: 50 } },
  briefing: { clientName: 'Tech Consortium', clientRole: 'AI Technology Companies', situation: 'Global regulators, authors, and tech giants are deadlocked over AI training data usage. Regulators threaten to shut down AI models entirely.', clientDemands: ['Maintain AI development capability', 'Find acceptable licensing framework', 'Avoid draconian regulation'], knownFacts: ['Authors want compensation for training data', 'Tech companies fear tracking logistics', 'Regulators are losing patience'], missingInformation: ['What authors actually want', 'Whether a licensing model works', 'How to handle attribution at scale'], timePressure: 'High — regulatory deadline approaching', stakes: 'Future of AI development', clientEmotionalState: 'Urgent, needs a framework' },
  surfaceDemand: 'Authors want AI banned from using their work. Tech giants want fair use.',
  hiddenTruth: 'Authors don\'t actually expect to ban AI — they want a permanent monetization stream. Tech giants don\'t mind paying — they fear the logistical nightmare of tracking individual pennies per query.',
  postmortem: { masterSolution: 'Macro-Licensing Pool (like ASCAP in music): Tech companies pay flat annual % of revenue into a global fund. Authors register work to receive dividends based on broad market-share analytics, not micro-tracking.', keyHiddenFact: 'Both sides want a monetization system, not a ban. The logistics of tracking is the real barrier.', missedOpportunity: 'The highest level of negotiation is inventing the system that makes the deal possible.', lesson: 'The highest level of negotiation is inventing the system that makes the deal possible.', bestPossibleDeal: 'Macro-licensing pool + annual revenue percentage + market-share dividends + registration system' },
});

const case30 = makeCompactScenario({
  id: 'case-30', title: 'The Peace Accord', subtitle: 'Designing dignity for all sides', tier: 5, category: 'master',
  stakesLabel: 'Regional stability',
  client: { name: 'Peace Coalition', role: 'International Mediation Body', avatar: '🌍', personality: { truthfulness: 70, ego: 40, riskTolerance: 40, patience: 60, trustSensitivity: 65, fairnessSensitivity: 75, authorityLevel: 45, emotionalVolatility: 30, preparationLevel: 70, relationshipOrientation: 70 } },
  counterparty: { name: 'Multiple Factions', role: 'Disputing Regional Parties', avatar: '🤝', personality: { truthfulness: 40, ego: 85, riskTolerance: 30, patience: 25, trustSensitivity: 75, fairnessSensitivity: 60, authorityLevel: 70, emotionalVolatility: 70, preparationLevel: 50, relationshipOrientation: 20 } },
  briefing: { clientName: 'Peace Coalition', clientRole: 'International Mediation Body', situation: 'Three regional factions have been in conflict for years. A peace framework is on the table, but each faction has different non-negotiable demands that conflict with the others.', clientDemands: ['Achieve peace framework', 'All factions must sign', 'Framework must be durable'], knownFacts: ['Three factions with competing claims', 'Previous peace attempts failed', 'External pressure mounting'], missingInformation: ['What each faction truly needs vs. demands', 'Face-saving requirements', 'Hidden flexibility in positions'], timePressure: 'Critical — ceasefire fragile', stakes: 'Regional stability + thousands of lives', clientEmotionalState: 'Determined but realistic' },
  surfaceDemand: 'Each faction demands terms that are incompatible with the others\' bottom lines.',
  hiddenTruth: 'Each faction needs different face-saving guarantees. The demands are incompatible on paper but not in substance — each faction cares most about a different dimension of dignity.',
  postmortem: { masterSolution: 'Sequential bilateral agreements with different face-saving mechanisms for each faction. Staggered implementation that gives each faction a "win" visible to their constituents.', keyHiddenFact: 'Each faction needs a different kind of dignity. Their demands conflict on paper but not in substance.', missedOpportunity: 'Multi-party peace requires designing dignity, not dividing resources.', lesson: 'Multi-party peace requires designing dignity, not dividing resources.', bestPossibleDeal: 'Sequential agreements + different face-saving mechanisms per faction + staggered implementation' },
});

export const allScenarios: Scenario[] = [
  case01, case02, case03, case04, case05,
  case06, case07, case08, case09, case10,
  case11, case12, case13, case14, case15,
  case16, case17, case18, case19, case20,
  case21, case22, case23, case24, case25,
  case26, case27, case28, case29, case30,
];

export function getScenarioById(id: string): Scenario | undefined {
  return allScenarios.find(s => s.id === id);
}

export function getScenariosByTier(tier: number): Scenario[] {
  return allScenarios.filter(s => s.tier === tier);
}

export function getScenariosByCategory(category: string): Scenario[] {
  return allScenarios.filter(s => s.category === category);
}
