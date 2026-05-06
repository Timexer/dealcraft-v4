'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Search, Lightbulb, ChevronDown, X } from 'lucide-react';

// ─── Type Definitions ──────────────────────────────────────────────

type GlossaryCategory = 'core' | 'biases' | 'strategies' | 'ethics';

interface GlossaryTerm {
  name: string;
  short: string;
  explanation: string;
  tip: string;
  category: GlossaryCategory;
}

// ─── Data ──────────────────────────────────────────────────────────

const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Core Concepts
  {
    name: 'BATNA',
    short: 'Best Alternative to a Negotiated Agreement — Your walk-away option',
    explanation:
      'Your BATNA is the most advantageous alternative course of action you can take if negotiations fail and an agreement cannot be reached. It represents your source of power in any negotiation: the better your BATNA, the greater your ability to walk away from an unsatisfactory deal. Before entering any negotiation, you must identify and improve your BATNA. A strong BATNA transforms your psychology from needy to confident, allowing you to negotiate from strength rather than desperation.',
    tip: 'Never enter a negotiation without knowing your BATNA. Spend time improving it before you sit at the table — even a small improvement in your alternative dramatically shifts the power balance in your favor.',
    category: 'core',
  },
  {
    name: 'ZOPA',
    short: 'Zone of Possible Agreement — The range where both sides can agree',
    explanation:
      'The ZOPA is the overlap between each party\'s reservation values — the range of outcomes that both sides would accept over their respective BATNAs. If no ZOPA exists, no deal is possible. The key insight is that identifying the ZOPA requires information about the other side\'s reservation value, which they have every incentive to conceal. Skilled negotiators probe for the boundaries of the ZOPA without revealing their own.',
    tip: 'Map out the ZOPA mentally before negotiating. If you suspect no ZOPA exists, focus on creating one by adding issues, changing the structure, or finding creative solutions that expand the zone.',
    category: 'core',
  },
  {
    name: 'Reservation Value',
    short: 'The worst acceptable outcome you would still agree to',
    explanation:
      'Your reservation value is the point at which you are indifferent between accepting the deal and walking away to your BATNA. It is the absolute minimum (or maximum, depending on which side you\'re on) that you would accept. Anything worse than your reservation value should lead you to walk away. Crucially, your reservation value should be determined before the negotiation begins and should not shift based on the other party\'s offers or persuasive tactics.',
    tip: 'Write down your reservation value before every negotiation and commit to it. The most dangerous moment is when you start rationalizing why "just a little bit worse" is still acceptable — that\'s the slippery slope to a bad deal.',
    category: 'core',
  },
  {
    name: 'Aspiration Price',
    short: 'Your ideal outcome — the best realistically achievable result',
    explanation:
      'Your aspiration price is the ambitious but realistic target you aim to achieve in a negotiation. Research consistently shows that negotiators who set higher aspirations achieve better outcomes, because aspirations shape your behavior, your first offers, and your persistence. The key is to distinguish between aspiration (ambitious but possible) and fantasy (wishful thinking). Aspirations should be grounded in research and analysis of what the market or situation can bear.',
    tip: 'Set your aspiration price high but justifiable. Negotiators who make ambitious first offers anchored in credible reasoning consistently outperform those who start moderate — the first offer anchors the entire conversation.',
    category: 'core',
  },
  {
    name: 'Anchoring',
    short: 'The first number placed on the table — it sets the frame for everything',
    explanation:
      'Anchoring refers to the powerful psychological effect whereby the first number introduced in a negotiation disproportionately influences the final outcome. Even when the anchor is arbitrary, it creates a gravitational pull that shapes subsequent offers and counteroffers. The anchoring effect is one of the most robust findings in behavioral economics. Skilled negotiators use it deliberately by making the first move with an ambitious but defensible offer.',
    tip: 'When you have good information, make the first offer to set the anchor. When the other side anchors first, immediately reframe by stating your own number and explaining why theirs is off-base — don\'t negotiate against their anchor, reset it.',
    category: 'core',
  },
  {
    name: 'Value Claiming',
    short: 'Capturing as much value as possible for your side of the table',
    explanation:
      'Value claiming is the competitive dimension of negotiation — the effort to capture the largest possible share of the available value. It involves tactics like aggressive anchoring, strategic information disclosure, and leveraging your BATNA. While important, value claiming is a zero-sum game: every dollar you gain is a dollar the other side loses. Negotiators who focus exclusively on claiming value often leave potential deals on the table and damage relationships.',
    tip: 'Claim value strategically but never at the expense of value creation. The best negotiators first expand the pie, then claim their share — and they do it in ways the other side can accept without feeling exploited.',
    category: 'core',
  },
  {
    name: 'Value Creation',
    short: 'Expanding the total pie so both sides can get more',
    explanation:
      'Value creation is the collaborative dimension of negotiation — finding ways to increase the total value available so that both parties can achieve more than they initially thought possible. It requires identifying differences in preferences, priorities, risk attitudes, and time horizons across issues, then structuring deals that exploit these differences. Trade-offs, contingencies, and creative packaging are the primary tools of value creation.',
    tip: 'Always ask: "What is cheap for me to give but valuable for them to receive?" The best deals are built on differences between the parties — the more you understand their priorities, the more value you can create.',
    category: 'core',
  },
  {
    name: 'Logrolling',
    short: 'Trading off issues of different priority to create mutual gain',
    explanation:
      'Logrolling is the practice of making concessions on low-priority issues in exchange for gains on high-priority issues. When two parties have different priorities across multiple issues, logrolling allows both sides to get more of what they care about most. For example, if you care more about price and the other side cares more about delivery speed, you can trade a faster delivery for a better price — both sides win on their priority dimensions.',
    tip: 'Never negotiate issues one at a time. Bundle them together so you can find logrolling opportunities. When you negotiate sequentially, you miss the chance to trade across issues and create value for both sides.',
    category: 'core',
  },
  {
    name: 'Contingency Contract',
    short: 'A bet on future outcomes — resolving disagreement through conditional terms',
    explanation:
      'A contingency contract is a clause in a deal where the outcome depends on a future event. When two parties disagree about what will happen — say, whether a market will grow or shrink — they can resolve the impasse by making the terms contingent on the outcome. If you believe growth will occur and they believe it won\'t, you can agree to a higher price if the market grows and a lower price if it doesn\'t. Both sides get terms they believe are favorable based on their own predictions.',
    tip: 'When you and the other party disagree about the future and you\'re confident in your forecast, propose a contingency contract. It turns disagreement into a creative solution — and if you\'re right, you profit from your superior information.',
    category: 'core',
  },
  {
    name: 'Package Offer',
    short: 'Bundling multiple issues together into a single, unified proposal',
    explanation:
      'A package offer presents multiple issues as a single, integrated proposal rather than negotiating each issue separately. This approach prevents the other side from cherry-picking your concessions on each issue and enables value-creating trade-offs across issues. Package offers also create a psychological sense of completeness and make it harder for the other side to evaluate each component in isolation, which can work in your favor when you\'re making strategic trade-offs.',
    tip: 'Present package offers rather than discussing issues piecemeal. This gives you control over the trade-offs, prevents the other side from conceding only on items they don\'t care about, and makes your overall proposal look more balanced.',
    category: 'core',
  },

  // Biases & Traps
  {
    name: 'Fixed Pie Bias',
    short: 'The dangerous assumption that the negotiation pie can\'t grow',
    explanation:
      'Fixed pie bias is the automatic assumption that the negotiation is purely zero-sum — that one party\'s gain must be the other\'s loss. This cognitive trap prevents negotiators from even looking for value-creating opportunities. Research shows that most people enter negotiations assuming a fixed pie, which leads to purely distributive strategies and leaves mutual gains unrealized. The bias is especially strong under time pressure and when trust is low.',
    tip: 'Before every negotiation, write down at least three ways the pie could be expanded. Force yourself to think about differences in priorities, risk preferences, and time horizons — these differences are where value creation hides.',
    category: 'biases',
  },
  {
    name: 'Vividness Bias',
    short: 'Overweighting dramatic, memorable information over more relevant data',
    explanation:
      'The vividness bias causes negotiators to give disproportionate weight to information that is dramatic, emotional, or recent, while discounting more relevant but less vivid data. A single shocking anecdote can outweigh comprehensive statistics. In negotiations, this bias is often exploited through emotional storytelling, dramatic presentations, or cherry-picked examples. The more vivid the information, the more influence it exerts on your judgment — regardless of its actual probative value.',
    tip: 'When the other side tells a compelling story or presents dramatic examples, pause and ask: "What does the full data set actually show?" Never let a vivid anecdote override systematic evidence in your decision-making.',
    category: 'biases',
  },
  {
    name: 'Escalation of Commitment',
    short: 'Throwing good money after bad — the trap of increasing investment in a losing position',
    explanation:
      'Escalation of commitment occurs when a negotiator continues to invest resources — time, money, or reputation — into a course of action that is clearly failing, simply because they\'ve already invested in it. The sunk cost fallacy drives this bias: having already committed so much, walking away feels like admitting defeat and wasting the prior investment. In negotiations, this manifests as refusing to compromise after a long standoff, or making ever-larger concessions to salvage a deal that no longer makes sense.',
    tip: 'Set clear walk-away points before you negotiate and honor them regardless of how much time or effort you\'ve already invested. The resources you\'ve already spent are gone — your decision should be based only on future costs and benefits.',
    category: 'biases',
  },
  {
    name: 'Egocentrism',
    short: 'Overvaluing your own perspective and underweighting the other side\'s',
    explanation:
      'Egocentrism in negotiation is the tendency to view the situation primarily from your own perspective, giving excessive weight to your own constraints, fairness standards, and priorities while minimizing those of the other party. This bias leads to unrealistic expectations, unfair proposals, and impasses that could be avoided. Most people genuinely believe their perspective is objective, making this bias particularly insidious because it operates below conscious awareness.',
    tip: 'Before every negotiation, write down the other party\'s perspective in detail — their constraints, their BATNA, their priorities, and what they consider fair. You\'ll be surprised how often this exercise reveals opportunities you would have missed.',
    category: 'biases',
  },
  {
    name: 'Overconfidence',
    short: 'Believing you know more than you actually do — and acting on it',
    explanation:
      'Overconfidence is the tendency to be more certain about your judgments and predictions than the evidence warrants. In negotiation, overconfident parties make extreme demands, dismiss valid information, and fail to prepare adequately. Research shows that overconfidence is strongest in domains where people have some knowledge — the partially informed are more overconfident than the completely ignorant. This bias leads to missed deals, avoidable impasses, and walking into negotiations unprepared.',
    tip: 'Deliberately seek disconfirming evidence for your beliefs about the negotiation. Ask yourself: "If I\'m wrong, what would the truth look like?" Acknowledging uncertainty makes you a more careful, effective negotiator.',
    category: 'biases',
  },
  {
    name: 'Regret Aversion',
    short: 'The fear of making the wrong choice leading to overly cautious decisions',
    explanation:
      'Regret aversion is the tendency to avoid decisions that might lead to future regret, even when those decisions are statistically optimal. In negotiations, this manifests as accepting a sure but inferior deal rather than pursuing a better but uncertain outcome, or refusing to make concessions for fear of later discovering you gave up too much. The anticipation of regret can paralyze decision-making and lead to suboptimal outcomes that are ironically more regrettable in hindsight.',
    tip: 'Reframe regret by asking: "Which decision will I regret more — taking the risk or playing it safe?" Often, the long-term regret of inaction exceeds the short-term discomfort of a bold move. Focus on process quality, not outcome quality.',
    category: 'biases',
  },
  {
    name: 'Anchoring Bias',
    short: 'Being unduly influenced by the first number — even when you know better',
    explanation:
      'The anchoring bias is distinct from the strategic use of anchors. It refers to the unconscious cognitive pull that any initial number exerts on your subsequent judgments, even when you\'re aware of the effect. Studies show that even random, clearly irrelevant numbers can influence estimates and offers. In negotiation, this means the other side\'s opening offer can shift your perception of what\'s reasonable, even when you know they\'re deliberately setting an extreme anchor.',
    tip: 'When you encounter an extreme anchor, don\'t simply counter with a moderate number in the middle — that\'s still being pulled toward their frame. Instead, explicitly reject their anchor, restate your own, and justify it with independent criteria.',
    category: 'biases',
  },

  // Strategies
  {
    name: 'Strategic Waiting',
    short: 'Using patience as a weapon — letting time pressure work in your favor',
    explanation:
      'Strategic waiting is the deliberate use of patience and timing to gain advantage in negotiations. When the other side faces deadlines, urgency, or declining alternatives, time becomes your ally. By waiting — or appearing willing to wait — you increase the pressure on the other party to make concessions. The key is genuine patience backed by a strong BATNA; if you need the deal urgently, waiting is not a viable strategy because your desperation will show.',
    tip: 'Identify who faces more time pressure before you negotiate. If it\'s them, be patient and let the clock work for you. Never reveal your own deadlines, and if you don\'t have a genuine deadline, don\'t manufacture urgency.',
    category: 'strategies',
  },
  {
    name: 'Information Gathering',
    short: 'Investigating before negotiating — knowledge is your greatest asset',
    explanation:
      'Information gathering is the systematic process of collecting intelligence about the other party\'s interests, constraints, BATNA, and priorities before and during negotiations. The party with better information almost always negotiates a better outcome. This includes researching market data, talking to industry contacts, understanding the other party\'s organizational pressures, and using careful questioning during the negotiation itself. The goal is to reduce uncertainty and identify opportunities for value creation.',
    tip: 'Invest 80% of your negotiation preparation time in information gathering. The more you know about their true interests and constraints, the more effectively you can frame proposals that they find irresistible.',
    category: 'strategies',
  },
  {
    name: 'Face-saving',
    short: 'Protecting the other party\'s dignity — because a humiliated opponent becomes an enemy',
    explanation:
      'Face-saving is the strategic practice of ensuring the other party can accept your proposals without feeling embarrassed or defeated. When negotiators are backed into a corner where accepting a deal would mean losing face, they often reject even favorable terms. By providing plausible justifications, framing concessions as wins, or building in graceful exit ramps, you make it easier for the other side to say yes. This is not about being nice — it\'s about being effective.',
    tip: 'Always give the other side a narrative they can tell their stakeholders. If they need to justify the deal to their boss, give them the ammunition: objective criteria, market benchmarks, or a framing that makes the outcome look like a victory.',
    category: 'strategies',
  },
  {
    name: 'Empathic Listening',
    short: 'Understanding before responding — the most underused negotiation skill',
    explanation:
      'Empathic listening goes beyond hearing words — it involves genuinely understanding the other party\'s perspective, emotions, and underlying interests. In negotiation, empathic listening serves multiple purposes: it builds rapport, reveals information, helps you identify value-creating opportunities, and makes the other party feel respected and understood. Most negotiators listen just enough to formulate their next argument, missing crucial signals about what the other side truly wants and needs.',
    tip: 'In your next negotiation, spend twice as much time listening as talking. Paraphrase what you hear to confirm understanding: "So what matters most to you is..." This simple technique reveals priorities and builds trust simultaneously.',
    category: 'strategies',
  },
  {
    name: 'Threat vs. Warning',
    short: 'The critical difference: one destroys trust, the other preserves it',
    explanation:
      'A threat is a statement about what you will do to hurt the other party — it\'s coercive and creates hostility. A warning is a statement about the natural consequences of the other party\'s actions — it\'s informative and preserves the relationship. "If you don\'t accept this price, I\'ll walk away" is a threat. "At that price, I wouldn\'t be able to justify the deal to my stakeholders" is a warning. The substance may be identical, but the framing is crucial. Warnings maintain your credibility and the other party\'s dignity.',
    tip: 'Replace every threat with a warning. Instead of "Do this or else," explain the consequences as natural outcomes rather than punitive actions. The message lands just as forcefully but without the collateral damage to the relationship.',
    category: 'strategies',
  },
  {
    name: 'Silence as a Tool',
    short: 'Let them fill the void — silence creates pressure and reveals information',
    explanation:
      'Strategic silence is the deliberate use of pauses in conversation to create discomfort that compels the other party to speak — and in speaking, they often reveal information, make concessions, or undermine their own position. Most people find silence intolerable and rush to fill it, often with concessions or disclosures they hadn\'t planned to make. After making an offer or asking a question, stop talking. Let the silence do its work. This is one of the simplest yet most powerful negotiation techniques.',
    tip: 'After you make an offer or ask a tough question, close your mouth and count slowly to ten. Resist the urge to fill the silence — the other person will almost always speak first, and what they say will be informative.',
    category: 'strategies',
  },
  {
    name: 'Walk Away Strategy',
    short: 'When no deal is better — the most powerful move requires genuine strength',
    explanation:
      'The walk away strategy is the willingness to end negotiations rather than accept terms that fall below your reservation value. It is the ultimate expression of BATNA power. However, a credible walk-away requires that you actually have a viable alternative and that the other party believes you\'ll use it. Empty threats to walk away destroy credibility. The most effective walk-away is calm, respectful, and genuine — it communicates that you value the relationship but not at the cost of a bad deal.',
    tip: 'Only threaten to walk away if you\'re truly prepared to do it. A credible walk-away, executed once, builds enormous reputation capital. A bluff, once called, destroys your leverage for all future negotiations.',
    category: 'strategies',
  },

  // Ethics
  {
    name: 'Parasitic Value Creation',
    short: 'Value created by harming outsiders — the dark side of win-win deals',
    explanation:
      'Parasitic value creation occurs when negotiators create value for themselves by imposing costs on parties not represented at the table. For example, two companies might negotiate a deal that enriches both but harms the environment, exploits workers, or defrauds consumers. The deal looks like a win-win because the harmed parties are invisible. Ethical negotiators must look beyond the table and consider the external effects of their agreements — value creation that relies on parasitism is not truly value creation.',
    tip: 'Before celebrating a win-win deal, ask: "Who isn\'t at this table who will be affected by this agreement?" If your value creation relies on shifting costs to outsiders, it\'s parasitic — and it\'s only a matter of time before it comes back to bite you.',
    category: 'ethics',
  },
  {
    name: 'Limited Ethical Boundaries',
    short: 'How good people do bad things in negotiations — and why it matters',
    explanation:
      'Research in behavioral ethics shows that well-intentioned people routinely engage in unethical behavior in negotiations without realizing it. Small lies escalate, conflicts of interest are rationalized, and ambiguous situations are interpreted self-servingly. The slippery slope is real: minor ethical compromises make larger ones feel acceptable. Organizations and individuals who believe they are ethical are often the most vulnerable, because they don\'t monitor their own behavior for ethical lapses.',
    tip: 'Set your ethical boundaries before the negotiation begins and write them down. When you\'re in the heat of the moment, you\'ll rationalize — but pre-commitment to clear standards gives you an anchor that\'s harder to shift.',
    category: 'ethics',
  },
  {
    name: 'Deception vs. Puffery',
    short: 'Where the line is — and why crossing it destroys long-term value',
    explanation:
      'Deception involves making statements you know to be false — claiming your BATNA is stronger than it is, misrepresenting your costs, or lying about your authority. Puffery involves exaggerated claims that no reasonable person would take as literal truth — "This is the best product on the market." The legal and ethical line between the two is often debated, but in negotiation, the practical line is clearer: deception about material facts destroys trust and can void agreements, while puffery is expected and accepted. The problem is that negotiators often deceive themselves about which category their statements fall into.',
    tip: 'Ask yourself: "If the other party discovered the full truth about this statement, would they feel betrayed?" If yes, you\'ve crossed from puffery into deception. The short-term gain of a lie is never worth the long-term cost to your reputation.',
    category: 'ethics',
  },
  {
    name: 'Fiduciary Duty',
    short: 'Your obligation to the client — when their interests must come first',
    explanation:
      'A fiduciary duty is the legal and ethical obligation to act in the best interest of your client or principal, putting their interests ahead of your own. In negotiation, this creates complex ethical dilemmas: what if the best outcome for your client requires you to sacrifice your own fees? What if your client\'s interests conflict with your ethical standards? Fiduciary duty means you must disclose conflicts of interest, cannot profit from the relationship without consent, and must exercise the care that a reasonably prudent person would exercise in managing the affairs of another.',
    tip: 'Never let your own financial interests drive your negotiation advice. If there\'s a potential conflict, disclose it immediately. Clients who trust your fiduciary integrity become long-term partners; those who discover a conflict never come back.',
    category: 'ethics',
  },
];

// ─── Category Config ───────────────────────────────────────────────

interface CategoryConfig {
  label: string;
  value: GlossaryCategory;
  color: string;
  bg: string;
  border: string;
  badge: string;
  gradient: string;
  icon: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    label: 'Core Concepts',
    value: 'core',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    gradient: 'from-amber-500/20 via-amber-600/10 to-transparent',
    icon: '⚖️',
  },
  {
    label: 'Biases & Traps',
    value: 'biases',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    gradient: 'from-violet-500/20 via-violet-600/10 to-transparent',
    icon: '🧠',
  },
  {
    label: 'Strategies',
    value: 'strategies',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    gradient: 'from-cyan-500/20 via-cyan-600/10 to-transparent',
    icon: '🎯',
  },
  {
    label: 'Ethics',
    value: 'ethics',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    gradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
    icon: '⚖️',
  },
];

// ─── Expandable Term Card ──────────────────────────────────────────

function GlossaryCard({
  term,
  categoryConfig,
  index,
}: {
  term: GlossaryTerm;
  categoryConfig: CategoryConfig;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: 'easeOut' }}
      layout
      className="group"
    >
      <div
        className={`
          relative overflow-hidden rounded-xl border
          transition-all duration-300 cursor-pointer
          ${categoryConfig.border}
          hover:shadow-lg hover:shadow-amber-500/5
          hover:border-opacity-60
        `}
        style={{
          background: 'oklch(1 0 0 / 6%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Gradient top accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${categoryConfig.gradient}`}
        />

        {/* Hover glow overlay */}
        <div
          className={`
            absolute inset-0 bg-gradient-to-br ${categoryConfig.gradient}
            opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
          `}
        />

        <div className="relative p-4 sm:p-5">
          {/* Header row */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <h3
                  className={`text-base sm:text-lg font-bold ${categoryConfig.color} tracking-tight`}
                >
                  {term.name}
                </h3>
                <Badge
                  variant="outline"
                  className={`text-[11px] px-1.5 py-0 h-5 border ${categoryConfig.badge}`}
                >
                  {categoryConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {term.short}
              </p>
            </div>

            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="shrink-0 mt-1"
            >
              <ChevronDown
                className={`h-5 w-5 ${categoryConfig.color} opacity-60`}
              />
            </motion.div>
          </div>

          {/* Expanded content */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  {/* Explanation */}
                  <div
                    className={`p-3.5 rounded-lg border ${categoryConfig.bg} ${categoryConfig.border}`}
                  >
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {term.explanation}
                    </p>
                  </div>

                  {/* Negotiation Genius Tip */}
                  <div className="relative overflow-hidden p-3.5 rounded-lg border border-amber-500/25 bg-amber-500/8">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/60 via-amber-400/40 to-transparent" />
                    <div className="flex items-start gap-2.5">
                      <div className="shrink-0 mt-0.5">
                        <Lightbulb className="h-4 w-4 text-amber-400" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block mb-1.5">
                          Negotiation Genius Tip
                        </span>
                        <p className="text-sm text-amber-200 leading-relaxed">
                          {term.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

interface NegotiationGlossaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NegotiationGlossary({
  open,
  onOpenChange,
}: NegotiationGlossaryProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<GlossaryCategory | 'all'>(
    'all'
  );

  const filteredTerms = useMemo(() => {
    const query = search.toLowerCase().trim();
    return GLOSSARY_TERMS.filter((term) => {
      const matchesCategory =
        activeCategory === 'all' || term.category === activeCategory;
      const matchesSearch =
        !query ||
        term.name.toLowerCase().includes(query) ||
        term.short.toLowerCase().includes(query) ||
        term.explanation.toLowerCase().includes(query) ||
        term.tip.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const getCategoryConfig = useCallback(
    (category: GlossaryCategory) =>
      CATEGORIES.find((c) => c.value === category) ?? CATEGORIES[0],
    []
  );

  const termCounts = useMemo(() => {
    const counts: Record<string, number> = { all: GLOSSARY_TERMS.length };
    for (const cat of CATEGORIES) {
      counts[cat.value] = GLOSSARY_TERMS.filter(
        (t) => t.category === cat.value
      ).length;
    }
    return counts;
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[92vh] p-0 gap-0 overflow-hidden border-amber-500/20 bg-zinc-950/95 backdrop-blur-xl"
        showCloseButton={false}
      >
        {/* ─── Glassmorphism Header ─── */}
        <div
          className="relative overflow-hidden border-b border-amber-500/15"
          style={{
            background:
              'linear-gradient(135deg, oklch(1 0 0 / 8%) 0%, oklch(1 0 0 / 4%) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Ambient gradient orbs */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-10 -right-20 w-48 h-48 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />

          {/* Top gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

          <div className="relative px-5 sm:px-6 pt-5 pb-4">
            {/* Title row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/25">
                  <BookOpen className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-amber-50 tracking-tight">
                    Negotiation Glossary
                  </h2>
                  <p className="text-xs text-amber-500 mt-0.5">
                    Key terms from <em>Negotiation Genius</em>
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
                aria-label="Close glossary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Animated Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search terms, concepts, or tips..."
                className="
                  w-full h-10 pl-9 pr-4 rounded-lg
                  bg-white/5 border border-amber-500/15
                  text-sm text-amber-50 placeholder:text-amber-500
                  focus:border-amber-500/40 focus:ring-amber-500/20
                  transition-all duration-300
                "
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-400 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </motion.div>
          </div>
        </div>

        {/* ─── Category Tabs ─── */}
        <div className="px-5 sm:px-6 pt-4 pb-2">
          <Tabs
            value={activeCategory}
            onValueChange={(v) => setActiveCategory(v as GlossaryCategory | 'all')}
          >
            <TabsList className="w-full h-auto flex flex-wrap gap-1.5 bg-white/5 p-1.5 rounded-xl border border-white/5">
              {/* All tab */}
              <TabsTrigger
                value="all"
                className={`
                  flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                  data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300
                  data-[state=active]:border-amber-500/30 data-[state=active]:shadow-sm
                  text-zinc-400 hover:text-zinc-300 transition-all border border-transparent
                `}
              >
                <span>All</span>
                <span className="text-[11px] opacity-60 tabular-nums">
                  {termCounts.all}
                </span>
              </TabsTrigger>

              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className={`
                    flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                    border border-transparent transition-all
                    data-[state=active]:shadow-sm
                    text-zinc-400 hover:text-zinc-300
                    ${
                      cat.value === 'core'
                        ? 'data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 data-[state=active]:border-amber-500/30'
                        : cat.value === 'biases'
                        ? 'data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 data-[state=active]:border-violet-500/30'
                        : cat.value === 'strategies'
                        ? 'data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-500/30'
                        : 'data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border-emerald-500/30'
                    }
                  `}
                >
                  <span>{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.label}</span>
                  <span className="sm:hidden">
                    {cat.label.split(' ')[0]}
                  </span>
                  <span className="text-[11px] opacity-60 tabular-nums">
                    {termCounts[cat.value]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Single TabsContent that reacts to tab + search */}
            <TabsContent value={activeCategory} className="mt-3 outline-none">
              <ScrollArea className="h-[calc(92vh-280px)] sm:h-[calc(92vh-260px)]">
                <div className="pr-3 pb-6 space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filteredTerms.length > 0 ? (
                      filteredTerms.map((term, index) => (
                        <GlossaryCard
                          key={term.name}
                          term={term}
                          categoryConfig={getCategoryConfig(term.category)}
                          index={index}
                        />
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-16 text-center"
                      >
                        <BookOpen className="h-10 w-10 text-amber-500 mb-3" />
                        <p className="text-sm text-zinc-500">
                          No terms found for &ldquo;{search}&rdquo;
                        </p>
                        <button
                          onClick={() => setSearch('')}
                          className="mt-2 text-xs text-amber-500 hover:text-amber-400 transition-colors underline underline-offset-2"
                        >
                          Clear search
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
