'use client';

import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { CATEGORY_COLORS, CATEGORY_LABELS, type BATNAStrength, SECTION_LABELS, SECTION_DEFINITIONS, SECTION_HELPERS, SECTION_TOOLTIPS, INLINE_WARNINGS, ZOPA_LEGEND } from '@/data/scenarios/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Lightbulb,
  Plus,
  X,
  Shield,
  Target,
  MessageSquare,
  Handshake,
  BarChart3,
  Info,
  Swords,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { PreNegotiationChecklist } from '@/components/game/PreNegotiationChecklist';

const ADVISOR_TIPS: Record<string, string> = {
  fundamentals: 'Start with your best alternative — know your alternative if talks fail, then set your walk-away point.',
  hidden_interests: 'Ask why. The stated demand is rarely the real need.',
  multi_issue: "Don't negotiate issues one at a time. Build package offers.",
  deadline: 'Urgency creates pressure on both sides. Find out whose deadline it really is.',
  deception: 'Verify claims independently. Trust is earned, not assumed.',
  power_imbalance: 'Your weakness may be their necessity. Find what they need from you.',
  relationship: 'The relationship IS the deal. Protect it.',
  ugly: 'Emotions are data. Don\'t fight them — read them.',
  ethics: 'Consider who is NOT at the table. Outsider harm is still harm.',
  master: 'Combine every skill you\'ve learned. The master sees the whole board.',
};

const CATEGORY_TIPS: Record<string, { icon: string; title: string; tips: string[] }> = {
  fundamentals: {
    icon: '📚',
    title: 'Fundamentals Strategy',
    tips: [
      'Always identify your best alternative before entering negotiation — a strong alternative gives you leverage.',
      'Anchor high but justify your position with objective criteria.',
      'Listen more than you speak in the opening phase.',
    ],
  },
  hidden_interests: {
    icon: '🔍',
    title: 'Hidden Interests Strategy',
    tips: [
      'Ask diagnostic questions to uncover what the other side truly values.',
      'Look for differences in risk preferences — they create trading opportunities.',
      "Don't assume their priorities match their stated positions.",
    ],
  },
  multi_issue: {
    icon: '🎯',
    title: 'Multi-Issue Strategy',
    tips: [
      'Never negotiate issues one at a time — package them for logrolling.',
      'Identify which issues matter more to you vs. the other side.',
      'Create contingency contracts when you disagree about future outcomes.',
    ],
  },
  deadline: {
    icon: '⏰',
    title: 'Deadline Strategy',
    tips: [
      'Never reveal your true deadline — it becomes a weapon against you.',
      'Use time pressure strategically: let the other side feel the clock.',
      'Prepare your best alternative before the deadline approaches.',
    ],
  },
  deception: {
    icon: '🎭',
    title: 'Deception Defense',
    tips: [
      'Verify claims independently — trust but verify.',
      "Use contingent agreements to test the other side's assertions.",
      'Watch for inconsistencies between their words and actions.',
    ],
  },
  power_imbalance: {
    icon: '⚖️',
    title: 'Power Balance Strategy',
    tips: [
      'Your BATNA is your greatest source of power — strengthen it before negotiating.',
      "Don't negotiate against yourself by making unilateral concessions.",
      'Find areas where you have unique value that the stronger party needs.',
    ],
  },
  relationship: {
    icon: '🤝',
    title: 'Relationship Strategy',
    tips: [
      'Separate the people from the problem — be soft on the person, hard on the issue.',
      'Use face-saving language: "I understand your position" before disagreeing.',
      'Build trust incrementally through small commitments.',
    ],
  },
  ethics: {
    icon: '⚖️',
    title: 'Ethical Strategy',
    tips: [
      'Ethical negotiation builds long-term reputation and repeat business.',
      'Deception may win a single deal but destroys future opportunities.',
      'Use objective standards and fair procedures to legitimize your proposals.',
    ],
  },
  ugly: {
    icon: '🔥',
    title: 'Ugly Negotiation Strategy',
    tips: [
      'Stay calm under pressure — emotional reactions are weapons used against you.',
      'Name the tactic: "I notice we\'re being pressed for an immediate decision."',
      'Always have your alternative ready — your best fallback if talks fail.',
    ],
  },
  master: {
    icon: '👑',
    title: 'Master Strategy',
    tips: [
      'Combine every technique — alternatives, logrolling, contingencies, and relationship.',
      'Read the whole board: economic value, emotional stakes, and future implications.',
      'The master creates value that neither side saw coming.',
    ],
  },
};

const BATNA_TIPS: Record<string, { text: string; variant: 'low' | 'medium' | 'high' }> = {
  low: { text: '⚠️ Your alternative seems weak — consider improving your options before negotiating.', variant: 'low' },
  medium: { text: '💡 A moderate alternative gives you some leverage. Can you strengthen it further?', variant: 'medium' },
  high: { text: '✅ A strong alternative gives you confidence. Don\'t accept less than you deserve.', variant: 'high' },
};

const STRATEGY_TIPS: Record<string, string> = {
  make_first_offer: '🎯 Making the first offer anchors the negotiation. Set an ambitious but justifiable anchor.',
  invite_their_offer: '👀 Letting them go first reveals information — but risks being anchored.',
  diagnostic_questions: '🔍 Diagnostic questions uncover hidden interests before you commit to a position.',
  build_rapport: '🤝 Building rapport creates trust — essential for value-creating negotiations.',
};

// Map store strategy IDs to STRATEGY_TIPS keys
const STRATEGY_ID_MAP: Record<string, string> = {
  first_offer: 'make_first_offer',
  invite_offer: 'invite_their_offer',
  diagnostic: 'diagnostic_questions',
  rapport: 'build_rapport',
};

const TRADEABILITY_COLORS = {
  high: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  low: 'text-red-400 bg-red-500/20 border-red-500/30',
};

const TRADEABILITY_TOOLTIPS = {
  high: 'Easily tradeable — this issue has low cost to concede but high value to the other side. Great for logrolling.',
  medium: 'Moderately tradeable — some flexibility exists, but both sides have real interests at stake.',
  low: 'Difficult to trade — this issue is core to your client\'s interests. Concede only for major gains elsewhere.',
};

const OPENING_STRATEGIES = [
  { id: 'first_offer', label: 'Make First Offer', icon: Target, description: 'Anchor the negotiation with your opening position' },
  { id: 'invite_offer', label: 'Invite Their Offer', icon: MessageSquare, description: 'Let them show their hand first' },
  { id: 'diagnostic', label: 'Ask Diagnostic Questions', icon: BarChart3, description: 'Gather information before positioning' },
  { id: 'rapport', label: 'Build Rapport First', icon: Handshake, description: 'Establish trust before discussing terms' },
];

// FIX 7: Derive BATNA strength from scenario data when explicit field is not provided
function deriveBATNAStrength(clientValue: number, counterpartyValue: number, side: 'client' | 'counterparty'): BATNAStrength {
  const value = side === 'client' ? clientValue : counterpartyValue;
  const otherValue = side === 'client' ? counterpartyValue : clientValue;
  if (value === 0) return 'weak';
  const ratio = otherValue > 0 ? value / otherValue : 1;
  if (ratio >= 1.3) return 'strong';
  if (ratio >= 0.7) return 'moderate';
  return 'weak';
}

// FIX 7: Get BATNA advantage based on strength, not monetary value
function getBATNAAdvantage(batna: { clientBATNAStrength?: BATNAStrength; counterpartyBATNAStrength?: BATNAStrength; clientBATNAValue: number; counterpartyBATNAValue: number }): 'client' | 'counterparty' | 'equal' {
  const clientStrength = batna.clientBATNAStrength ?? deriveBATNAStrength(batna.clientBATNAValue, batna.counterpartyBATNAValue, 'client');
  const cpStrength = batna.counterpartyBATNAStrength ?? deriveBATNAStrength(batna.clientBATNAValue, batna.counterpartyBATNAValue, 'counterparty');
  const strengthOrder: Record<BATNAStrength, number> = { strong: 3, moderate: 2, weak: 1 };
  if (strengthOrder[clientStrength] > strengthOrder[cpStrength]) return 'client';
  if (strengthOrder[cpStrength] > strengthOrder[clientStrength]) return 'counterparty';
  return 'equal';
}

// FIX 7: Generate descriptive text for BATNA advantage
function getBATNAAdvantageDescription(batna: { clientBATNA: string; counterpartyBATNA: string; clientBATNAStrength?: BATNAStrength; counterpartyBATNAStrength?: BATNAStrength; clientBATNAValue: number; counterpartyBATNAValue: number }): string {
  const advantage = getBATNAAdvantage(batna);
  if (advantage === 'client') {
    return `Your client's alternative (${batna.clientBATNA.toLowerCase().split('.')[0]}) is stronger than the counterparty's (${batna.counterpartyBATNA.toLowerCase().split('.')[0]}).`;
  }
  if (advantage === 'counterparty') {
    return `The counterparty's alternative (${batna.counterpartyBATNA.toLowerCase().split('.')[0]}) is stronger than your client's (${batna.clientBATNA.toLowerCase().split('.')[0]}).`;
  }
  return 'Both sides have roughly equal alternatives if negotiations fail.';
}

export function StrategyBoard() {
  const {
    currentScenarioId, setPhase,
    batnaEstimate, setBatnaEstimate,
    reservationEstimate, setReservationEstimate,
    aspirationEstimate, setAspirationEstimate,
    openingStrategy, setOpeningStrategy,
    assumptions, addAssumption, removeAssumption,
  } = useGameStore();

  const scenario = currentScenarioId ? getScenarioById(currentScenarioId) : null;
  const [newAssumption, setNewAssumption] = useState('');
  const [isAdvisorExpanded, setIsAdvisorExpanded] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Determine BATNA level based on player estimate vs actual client BATNA
  const batnaLevel = useMemo<'low' | 'medium' | 'high' | null>(() => {
    if (!batnaEstimate || !scenario) return null;
    const clientValue = scenario.batna.clientBATNAValue;
    if (clientValue === 0) return 'medium';
    const ratio = batnaEstimate / clientValue;
    if (ratio < 0.8) return 'low';
    if (ratio > 1.2) return 'high';
    return 'medium';
  }, [batnaEstimate, scenario]);

  // Get the mapped strategy tip key
  const strategyTipKey = openingStrategy ? STRATEGY_ID_MAP[openingStrategy] : null;
  const categoryTip = scenario ? (CATEGORY_TIPS[scenario.category] || CATEGORY_TIPS.fundamentals) : null;

  if (!scenario) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No case selected.</p>
        <Button variant="outline" onClick={() => setPhase('dashboard')} className="ml-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const { batna, issues, category } = scenario;

  const handleAddAssumption = () => {
    const trimmed = newAssumption.trim();
    if (trimmed) {
      addAssumption(trimmed);
      setNewAssumption('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddAssumption();
    }
  };

  // BATNA and ZOPA calculations for visualization
  // FIX 5: ZOPA is bounded by Reservation Values, NOT BATNA values
  const clientRV = batna.clientReservationValue;
  const cpRV = batna.counterpartyReservationValue;
  const maxVal = Math.max(clientRV, cpRV, batna.estimatedZOPAHigh, batna.clientBATNAValue, batna.counterpartyBATNAValue) * 1.1;
  const zopaLow = batna.estimatedZOPALow;
  const zopaHigh = batna.estimatedZOPAHigh;

  // Calculate position percentages for ZOPA visualization — using Reservation Values
  const clientPos = maxVal > 0 ? (clientRV / maxVal) * 100 : 0;
  const cpPos = maxVal > 0 ? (cpRV / maxVal) * 100 : 0;
  const zopaLeft = maxVal > 0 ? (zopaLow / maxVal) * 100 : 0;
  const zopaWidth = maxVal > 0 ? ((zopaHigh - zopaLow) / maxVal) * 100 : 0;

  // Reservation value position
  const rvPos = reservationEstimate > 0 && maxVal > 0 ? (reservationEstimate / maxVal) * 100 : 0;

  // Aspiration value position
  const aspirationPos = aspirationEstimate > 0 && maxVal > 0 ? (aspirationEstimate / maxVal) * 100 : 0;

  // Client BATNA equivalent position (for ghost marker detection)
  const clientBatnaPos = maxVal > 0 ? (batna.clientBATNAValue / maxVal) * 100 : 0;
  const clientBatnaOutOfRange = batna.clientBATNAValue > 0 && (clientBatnaPos < 0 || clientBatnaPos > 100);

  // Counterparty BATNA equivalent position
  const cpBatnaPos = maxVal > 0 ? (batna.counterpartyBATNAValue / maxVal) * 100 : 0;
  const cpBatnaOutOfRange = batna.counterpartyBATNAValue > 0 && (cpBatnaPos < 0 || cpBatnaPos > 100);

  // Player BATNA estimate position
  const batnaEstimatePos = maxVal > 0 && batnaEstimate > 0 ? (batnaEstimate / maxVal) * 100 : 0;
  const batnaEstimateOutOfRange = batnaEstimate > 0 && (batnaEstimatePos < 0 || batnaEstimatePos > 100);

  // ZOPA width in euros for indicator text
  const zopaWidthEuros = zopaHigh - zopaLow;
  const noZopa = zopaWidth <= 0;
  const noZopaGap = noZopa ? Math.abs(zopaLow - zopaHigh) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setPhase('intake')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Strategy Board</h1>
              <p className="text-xs text-muted-foreground">{scenario.title}</p>
            </div>
          </div>
          <Badge variant="outline" className={CATEGORY_COLORS[category]}>
            {CATEGORY_LABELS[category]}
          </Badge>
        </motion.div>

        {/* Two-column layout: main content + Strategy Advisor Panel */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: main content */}
          <div className="flex-1 min-w-0">
          <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="space-y-6 pr-2">
            {/* BATNA Analysis with Scenario Cards + ZOPA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help underline decoration-dotted decoration-amber-500/40 underline-offset-4">
                            {SECTION_LABELS.batna}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[280px] text-xs">
                          <p>{SECTION_TOOLTIPS.batna}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {SECTION_DEFINITIONS.batna}
                  </CardDescription>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">
                    {SECTION_HELPERS.batnaCard}
                  </p>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {/* FIX 1: Scenario cards instead of progress bars */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Swords className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-xs font-medium">Alternative Power Comparison</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Client BATNA scenario card */}
                      <div className="p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-emerald-400">🟢 Client&apos;s Alternative</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0 border-0 ${
                              (batna.clientBATNAStrength ?? deriveBATNAStrength(batna.clientBATNAValue, batna.counterpartyBATNAValue, 'client')) === 'strong'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : (batna.clientBATNAStrength ?? deriveBATNAStrength(batna.clientBATNAValue, batna.counterpartyBATNAValue, 'client')) === 'moderate'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {(batna.clientBATNAStrength ?? deriveBATNAStrength(batna.clientBATNAValue, batna.counterpartyBATNAValue, 'client')) === 'strong' ? 'Strong' :
                             (batna.clientBATNAStrength ?? deriveBATNAStrength(batna.clientBATNAValue, batna.counterpartyBATNAValue, 'client')) === 'moderate' ? 'Moderate' : 'Weak'}
                          </Badge>
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed italic">&ldquo;{batna.clientBATNA}&rdquo;</p>
                        {batna.clientBATNAValue > 0 && (
                          <p className="text-[11px] text-muted-foreground">Financial equivalent: €{batna.clientBATNAValue.toLocaleString()}</p>
                        )}
                      </div>

                      {/* Counterparty BATNA scenario card */}
                      <div className="p-3 rounded-lg bg-orange-500/8 border border-orange-500/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-orange-400">🔴 Counterparty&apos;s Alternative</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0 border-0 ${
                              (batna.counterpartyBATNAStrength ?? deriveBATNAStrength(batna.clientBATNAValue, batna.counterpartyBATNAValue, 'counterparty')) === 'strong'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : (batna.counterpartyBATNAStrength ?? deriveBATNAStrength(batna.clientBATNAValue, batna.counterpartyBATNAValue, 'counterparty')) === 'moderate'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {(batna.counterpartyBATNAStrength ?? deriveBATNAStrength(batna.clientBATNAValue, batna.counterpartyBATNAValue, 'counterparty')) === 'strong' ? 'Strong' :
                             (batna.counterpartyBATNAStrength ?? deriveBATNAStrength(batna.clientBATNAValue, batna.counterpartyBATNAValue, 'counterparty')) === 'moderate' ? 'Moderate' : 'Weak'}
                          </Badge>
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed italic">&ldquo;{batna.counterpartyBATNA}&rdquo;</p>
                        {batna.counterpartyBATNAValue > 0 && (
                          <p className="text-[11px] text-muted-foreground">Financial equivalent: €{batna.counterpartyBATNAValue.toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    {/* Helper text for strength badges */}
                    <p className="text-[11px] text-muted-foreground/60">{SECTION_HELPERS.batnaStrength}</p>

                    {/* FIX 7: Strength comparison based on scenario, not money */}
                    <div className={`flex items-center gap-2 p-2 rounded-md text-xs ${
                      getBATNAAdvantage(batna) === 'client'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                        : getBATNAAdvantage(batna) === 'counterparty'
                        ? 'bg-orange-500/10 border border-orange-500/20 text-orange-300'
                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                    }`}>
                      <Info className="h-3 w-3 shrink-0" />
                      <span>{getBATNAAdvantageDescription(batna)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Input fields: 3-column grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* BATNA Monetary Equivalent */}
                    <div className="space-y-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Label className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                              BATNA Monetary Equivalent (€)
                              <Info className="h-2.5 w-2.5 text-muted-foreground/50" />
                            </Label>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[240px] text-xs">
                            <p>{SECTION_TOOLTIPS.batna}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Estimate the financial outcome..."
                        value={batnaEstimate || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setBatnaEstimate(Math.max(0, val));
                        }}
                      />
                      <p className="text-[11px] text-muted-foreground/70">
                        {SECTION_HELPERS.batnaMonetary}
                      </p>
                      {/* Inline error for negative values */}
                      {batnaEstimate < 0 && (
                        <p className="text-[11px] text-red-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          BATNA monetary equivalent can&apos;t be negative.
                        </p>
                      )}
                    </div>
                    {/* Walk-Away Point (Reservation Value) */}
                    <div className="space-y-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Label className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                              {SECTION_LABELS.reservationValue} (€)
                              <Info className="h-2.5 w-2.5 text-muted-foreground/50" />
                            </Label>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[240px] text-xs">
                            <p>{SECTION_TOOLTIPS.reservationValue}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Minimum acceptable outcome..."
                        value={reservationEstimate || ''}
                        onChange={(e) => setReservationEstimate(Math.max(0, Number(e.target.value)))}
                      />
                      <p className="text-[11px] text-muted-foreground/70">
                        {SECTION_HELPERS.reservationValue}
                      </p>
                      {/* Cross-field validation RV < BATNA estimate */}
                      {reservationEstimate > 0 && batnaEstimate > 0 && reservationEstimate < batnaEstimate && (
                        <p className="text-[11px] text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {INLINE_WARNINGS.rvBelowBatnaEquiv}
                        </p>
                      )}
                    </div>
                    {/* Target Outcome (Aspiration Estimate) */}
                    <div className="space-y-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Label className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                              {SECTION_LABELS.aspirationPrice} (€)
                              <Info className="h-2.5 w-2.5 text-muted-foreground/50" />
                            </Label>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[240px] text-xs">
                            <p>{SECTION_TOOLTIPS.aspirationPrice}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Your ideal realistic result..."
                        value={aspirationEstimate || ''}
                        onChange={(e) => setAspirationEstimate(Math.max(0, Number(e.target.value)))}
                      />
                      <p className="text-[11px] text-muted-foreground/70">
                        {SECTION_HELPERS.aspirationPrice}
                      </p>
                      {/* Cross-field validation: aspiration < reservation */}
                      {aspirationEstimate > 0 && reservationEstimate > 0 && aspirationEstimate < reservationEstimate && (
                        <p className="text-[11px] text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Your target outcome is below your walk-away point. Your target should be higher than your minimum.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ZOPA Visualization — FIX 5: Bounded by Reservation Values, not BATNAs */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs font-medium cursor-help underline decoration-dotted decoration-amber-500/40 underline-offset-4">
                              {SECTION_LABELS.zopa}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[260px] text-xs">
                            <p>{SECTION_TOOLTIPS.zopa}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="text-xs text-muted-foreground">
                        €{zopaLow.toLocaleString()} — €{zopaHigh.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/60">{SECTION_HELPERS.zopa}</p>
                    <div className="zopa-bar">
                      {/* ZOPA overlap zone — bounded by Reservation Values */}
                      {noZopa ? (
                        /* No-ZOPA state: show two reservation markers with gap */
                        <>
                          <div
                            className="absolute top-0 h-full bg-emerald-500/10"
                            style={{ left: '0%', width: `${Math.min(clientPos, cpPos)}%` }}
                          />
                          <div
                            className="absolute top-0 h-full bg-orange-500/10"
                            style={{ left: `${Math.max(clientPos, cpPos)}%`, width: `${100 - Math.max(clientPos, cpPos)}%` }}
                          />
                          {/* Gap zone between RVs */}
                          <div
                            className="absolute top-0 h-full flex items-center justify-center border-x border-dashed border-red-400/30 bg-red-500/5"
                            style={{ left: `${Math.min(clientPos, cpPos)}%`, width: `${Math.abs(clientPos - cpPos)}%` }}
                          >
                            <span className="text-[11px] font-semibold text-red-400 whitespace-nowrap">
                              No overlap
                            </span>
                          </div>
                        </>
                      ) : (
                        <div
                          className="overlap-zone"
                          style={{ left: `${zopaLeft}%`, width: `${zopaWidth}%` }}
                        />
                      )}
                      {/* Client Reservation Value marker */}
                      <div
                        className="marker client"
                        style={{ left: `${clientPos}%` }}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] text-emerald-400 whitespace-nowrap font-medium">
                          {ZOPA_LEGEND.clientRV}
                        </span>
                      </div>
                      {/* Counterparty Reservation Value marker */}
                      <div
                        className="marker counterparty"
                        style={{ left: `${cpPos}%` }}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] text-orange-400 whitespace-nowrap font-medium">
                          {ZOPA_LEGEND.counterpartyRV}
                        </span>
                      </div>
                      {/* ZOPA label — only shown when there IS a ZOPA */}
                      {!noZopa && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-[11px] font-bold text-amber-400">{SECTION_LABELS.zopa}</span>
                        </div>
                      )}
                      {/* Reservation value marker (user's estimate) */}
                      {rvPos > 0 && (
                        <div
                          className="absolute top-0 h-full w-0.5 bg-red-500 z-10"
                          style={{ left: `${Math.min(100, rvPos)}%` }}
                        >
                          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[11px] text-red-400 whitespace-nowrap font-medium">
                            {ZOPA_LEGEND.yourRV}
                          </span>
                        </div>
                      )}
                      {/* Aspiration marker (green diamond) */}
                      {aspirationPos > 0 && (
                        <div
                          className="absolute top-0 h-full flex items-center z-10"
                          style={{ left: `${Math.min(100, aspirationPos)}%` }}
                        >
                          <div className="w-2 h-2 rotate-45 bg-emerald-400" />
                          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[11px] text-emerald-400 whitespace-nowrap font-medium">
                            Target
                          </span>
                        </div>
                      )}
                      {/* Client BATNA estimate ghost marker */}
                      {batnaEstimate !== 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute top-0 h-full w-0.5 border-l-2 border-dashed border-cyan-400/60 z-10 cursor-help"
                                style={{ left: `${Math.max(0, Math.min(100, batnaEstimatePos))}%` }}
                              >
                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[11px] text-cyan-400 whitespace-nowrap font-medium">
                                  {ZOPA_LEGEND.batnaEquiv}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[260px]">
                              <p>Your BATNA monetary equivalent: €{batnaEstimate.toLocaleString()}</p>
                              {batnaEstimateOutOfRange && (
                                <p className="text-amber-400 mt-1">Your BATNA equivalent (€{batnaEstimate.toLocaleString()}) is outside the visible range.</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {/* Ghost arrow for out-of-range client BATNA estimate */}
                      {batnaEstimateOutOfRange && batnaEstimate !== 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`absolute top-0 h-full z-20 cursor-help ${batnaEstimatePos > 100 ? 'right-0' : 'left-0'}`}
                              >
                                <div className={`flex items-center h-full ${batnaEstimatePos > 100 ? 'flex-row' : 'flex-row-reverse'}`}>
                                  <div className={`w-0 h-0 ${batnaEstimatePos > 100 ? 'border-t-[5px] border-b-[5px] border-r-[6px] border-transparent border-r-cyan-400/80' : 'border-t-[5px] border-b-[5px] border-l-[6px] border-transparent border-l-cyan-400/80'}`} />
                                  <div className="w-1.5 h-full bg-cyan-400/40 border-dashed" />
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[260px]">
                              <p>Your BATNA equivalent (€{batnaEstimate.toLocaleString()}) is outside the visible range.</p>
                            <p className="text-muted-foreground mt-1">The actual value is {batnaEstimatePos > 100 ? 'above' : 'below'} the chart scale.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {/* Counterparty BATNA equivalent ghost marker (orange dashed) */}
                      {batna.counterpartyBATNAValue > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute top-0 h-full w-0.5 border-l-2 border-dashed border-orange-400/60 z-10 cursor-help"
                                style={{ left: `${Math.max(0, Math.min(100, cpBatnaPos))}%` }}
                              >
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-orange-400 whitespace-nowrap font-medium">
                                  CP {ZOPA_LEGEND.batnaEquiv}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[260px]">
                              <p>Counterparty BATNA monetary equivalent: €{batna.counterpartyBATNAValue.toLocaleString()}</p>
                              {cpBatnaOutOfRange && (
                                <p className="text-amber-400 mt-1">Counterparty BATNA equivalent (€{batna.counterpartyBATNAValue.toLocaleString()}) is outside the visible range.</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {/* Ghost arrow for out-of-range counterparty BATNA equivalent */}
                      {cpBatnaOutOfRange && batna.counterpartyBATNAValue > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`absolute top-0 h-full z-20 cursor-help ${cpBatnaPos > 100 ? 'right-0 -mr-1' : 'left-0 -ml-1'}`}
                              >
                                <div className={`flex items-center h-full ${cpBatnaPos > 100 ? 'flex-row' : 'flex-row-reverse'}`}>
                                  <div className={`w-0 h-0 ${cpBatnaPos > 100 ? 'border-t-[5px] border-b-[5px] border-r-[6px] border-transparent border-r-orange-400/80' : 'border-t-[5px] border-b-[5px] border-l-[6px] border-transparent border-l-orange-400/80'}`} />
                                  <div className="w-1.5 h-full bg-orange-400/40 border-dashed" />
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[260px]">
                              <p>Counterparty BATNA equivalent (€{batna.counterpartyBATNAValue.toLocaleString()}) is outside the visible range.</p>
                              <p className="text-muted-foreground mt-1">The actual value is {cpBatnaPos > 100 ? 'above' : 'below'} the chart scale.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {/* Scale labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                        <span className="text-[11px] text-muted-foreground">€0</span>
                        <span className="text-[11px] text-muted-foreground">€{Math.round(maxVal).toLocaleString()}</span>
                      </div>
                    </div>
                    {/* ZOPA width indicator */}
                    <div className="flex items-center gap-2 mt-1">
                      {!noZopa ? (
                        <span className="text-[11px] text-amber-400/80 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Deal zone: €{zopaWidthEuros.toLocaleString()} wide
                        </span>
                      ) : (
                        <span className="text-[11px] text-red-400/80 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          No deal zone (gap: €{noZopaGap.toLocaleString()})
                        </span>
                      )}
                    </div>
                    {/* No-ZOPA warning */}
                    {noZopa && (
                      <p className="text-[11px] text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {INLINE_WARNINGS.noZopa}
                      </p>
                    )}
                    {/* FIX 5: Legend uses microcopy constants */}
                    <div className="flex flex-wrap items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-[11px] text-muted-foreground">{ZOPA_LEGEND.clientRV}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                        <span className="text-[11px] text-muted-foreground">{ZOPA_LEGEND.counterpartyRV}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-amber-500/50" />
                        <span className="text-[11px] text-muted-foreground">{ZOPA_LEGEND.zopaZone}</span>
                      </div>
                      {rvPos > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-0.5 bg-red-500" />
                          <span className="text-[11px] text-muted-foreground">{ZOPA_LEGEND.yourRV}</span>
                        </div>
                      )}
                      {aspirationPos > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rotate-45 bg-emerald-400" />
                          <span className="text-[11px] text-muted-foreground">{ZOPA_LEGEND.yourAspiration}</span>
                        </div>
                      )}
                      {batnaEstimate !== 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-0.5 border-l-2 border-dashed border-cyan-400/60" />
                          <span className="text-[11px] text-muted-foreground">{ZOPA_LEGEND.batnaEquiv}</span>
                        </div>
                      )}
                      {batna.counterpartyBATNAValue > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-0.5 border-l-2 border-dashed border-orange-400/60" />
                          <span className="text-[11px] text-muted-foreground">CP {ZOPA_LEGEND.batnaEquiv}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Issue Priority Matrix with Tooltips */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    Issue Priority Matrix
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Identify trade opportunities where priorities differ. Each issue rated out of 10.
                  </CardDescription>
                  {/* Star legend */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] text-muted-foreground">Client Priority</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3 w-3 text-cyan-400 fill-cyan-400" />
                      <span className="text-[10px] text-muted-foreground">CP Priority</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3 w-3 text-emerald-400 fill-emerald-400" />
                      <span className="text-[10px] text-muted-foreground">Value to Client</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
                      <span className="text-[10px] text-muted-foreground">Value to CP</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <Star className="h-3 w-3 text-muted-foreground/15 fill-muted-foreground/8" />
                      <span className="text-[10px] text-muted-foreground">Remaining capacity</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {issues.map((issue) => (
                      <div
                        key={issue.id}
                        className="p-3 rounded-lg bg-background/50 border border-border/30 space-y-2 priority-issue-card"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{issue.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{issue.description}</p>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={`text-[11px] shrink-0 cursor-help ${TRADEABILITY_COLORS[issue.tradeability]}`}>
                                  {issue.tradeability} trade
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[240px] text-xs">
                                <p>{TRADEABILITY_TOOLTIPS[issue.tradeability]}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {/* Priority Stars - Client & Counterparty */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                          {/* Client Priority */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">Client Priority</span>
                              <span className="text-[11px] font-semibold text-amber-400 tabular-nums">{issue.clientPriority}/10</span>
                            </div>
                            <div className="flex items-center gap-[2px]">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 transition-all duration-200 ${
                                    i < issue.clientPriority
                                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]'
                                      : 'text-muted-foreground/15 fill-muted-foreground/8'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {/* Counterparty Priority */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">Counterparty Priority</span>
                              <span className="text-[11px] font-semibold text-cyan-400 tabular-nums">{issue.counterpartyPriority}/10</span>
                            </div>
                            <div className="flex items-center gap-[2px]">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 transition-all duration-200 ${
                                    i < issue.counterpartyPriority
                                      ? 'text-cyan-400 fill-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.4)]'
                                      : 'text-muted-foreground/15 fill-muted-foreground/8'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {/* Value to Client - derived from counterparty priority (logrolling opportunity) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 cursor-help">
                                      Value to Client
                                      <Info className="h-2.5 w-2.5 text-muted-foreground/50" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                                    <p>How much trade value this issue represents for your client. Higher counterparty priority = more leverage in logrolling.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span className="text-[11px] font-semibold text-emerald-400 tabular-nums">{issue.counterpartyPriority}/10</span>
                            </div>
                            <div className="flex items-center gap-[2px]">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 transition-all duration-200 ${
                                    i < issue.counterpartyPriority
                                      ? 'text-emerald-400 fill-emerald-400 drop-shadow-[0_0_3px_rgba(52,211,153,0.4)]'
                                      : 'text-muted-foreground/15 fill-muted-foreground/8'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {/* Value to Counterparty - derived from client priority */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 cursor-help">
                                      Value to Counterparty
                                      <Info className="h-2.5 w-2.5 text-muted-foreground/50" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                                    <p>How much trade value this issue represents for the counterparty. Higher client priority = more they can demand in exchange.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span className="text-[11px] font-semibold text-orange-400 tabular-nums">{issue.clientPriority}/10</span>
                            </div>
                            <div className="flex items-center gap-[2px]">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 transition-all duration-200 ${
                                    i < issue.clientPriority
                                      ? 'text-orange-400 fill-orange-400 drop-shadow-[0_0_3px_rgba(251,146,60,0.4)]'
                                      : 'text-muted-foreground/15 fill-muted-foreground/8'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Trade opportunity indicator */}
                        {issue.clientPriority !== issue.counterpartyPriority && (
                          <div className="flex items-center gap-1.5 pt-1 border-t border-border/20 mt-1">
                            <Lightbulb className="h-3 w-3 text-amber-400" />
                            <span className="text-[11px] text-amber-400">
                              {Math.abs(issue.clientPriority - issue.counterpartyPriority) >= 4
                                ? issue.clientPriority > issue.counterpartyPriority
                                  ? '🔥 Strong trade opportunity — you value this much more, consider conceding for a bigger gain elsewhere'
                                  : '🎯 High logrolling potential — they value this much more, trade it for something you want'
                                : issue.clientPriority > issue.counterpartyPriority
                                  ? 'You value this more — potential concession for the counterparty'
                                  : 'They value this more — opportunity to trade for something you want'
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Opening Strategy */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-violet-400" />
                    Opening Strategy
                  </CardTitle>
                  <CardDescription className="text-xs">
                    How will you begin the negotiation?
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <RadioGroup
                    value={openingStrategy}
                    onValueChange={setOpeningStrategy}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {OPENING_STRATEGIES.map((strategy) => (
                      <Label
                        key={strategy.id}
                        htmlFor={strategy.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          openingStrategy === strategy.id
                            ? 'border-amber-500/50 bg-amber-500/10'
                            : 'border-border/30 bg-background/50 hover:border-border/60'
                        }`}
                      >
                        <RadioGroupItem value={strategy.id} id={strategy.id} className="mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <strategy.icon className="h-4 w-4 text-amber-400" />
                            <span className="text-sm font-medium">{strategy.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{strategy.description}</p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>

            {/* Assumption Tracker */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-400" />
                    Assumption Tracker
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Track what you believe to be true — verify them during investigation
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {assumptions.length > 0 && (
                    <ul className="space-y-2">
                      {assumptions.map((assumption, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/50 border border-border/30"
                        >
                          <span className="text-sm text-muted-foreground flex-1">{assumption}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAssumption(i)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an assumption..."
                      value={newAssumption}
                      onChange={(e) => setNewAssumption(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddAssumption}
                      disabled={!newAssumption.trim()}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Advisor Tip */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:hidden">
              <Card className="bg-amber-500/10 border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-400 mb-1">Advisor Tip</p>
                      <p className="text-sm text-amber-200 italic">
                        {ADVISOR_TIPS[category] || ADVISOR_TIPS.fundamentals}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pre-Negotiation Checklist (NAP Method) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <PreNegotiationChecklist />
            </motion.div>
          </div>
        </ScrollArea>
        </div>

        {/* Right column: Strategy Advisor Panel (sticky on desktop) */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <div className="lg:sticky lg:top-24 space-y-4">
            {/* Mobile toggle button */}
            <Button
              variant="outline"
              onClick={() => setIsAdvisorExpanded(!isAdvisorExpanded)}
              className="w-full lg:hidden flex items-center justify-between bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Strategy Tips
              </span>
              {isAdvisorExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {/* Desktop always-visible header */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <h2 className="text-sm font-semibold text-amber-400">Strategy Advisor</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdvisorExpanded(!isAdvisorExpanded)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-amber-400"
              >
                {isAdvisorExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
            </div>

            {/* Advisor content */}
            <AnimatePresence>
              {isAdvisorExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden space-y-3"
                >
                  {/* Category Tips Card */}
                  {categoryTip && (
                    <div className="glass-card p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{categoryTip.icon}</span>
                        <h3 className="text-xs font-semibold text-amber-400">{categoryTip.title}</h3>
                      </div>
                      <ul className="space-y-2">
                        {categoryTip.tips.map((tip, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <Zap className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                            <span>{tip}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* BATNA Assessment Card */}
                  {batnaLevel && (
                    <div className={`glass-card p-4 space-y-2 ${
                      batnaLevel === 'low'
                        ? 'border-orange-500/30'
                        : batnaLevel === 'high'
                        ? 'border-emerald-500/30'
                        : 'border-amber-500/30'
                    }`}>
                      <div className="flex items-center gap-2">
                        {batnaLevel === 'low' ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
                        ) : batnaLevel === 'high' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                        )}
                        <h3 className="text-xs font-semibold text-amber-400">Alternative Assessment</h3>
                      </div>
                      <p className={`text-xs ${
                        batnaLevel === 'low'
                          ? 'text-orange-300'
                          : batnaLevel === 'high'
                          ? 'text-emerald-300'
                          : 'text-amber-300'
                      }`}>
                        {BATNA_TIPS[batnaLevel].text}
                      </p>
                      {batnaEstimate > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-background/50 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                batnaLevel === 'low'
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                                  : batnaLevel === 'high'
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                  : 'bg-gradient-to-r from-amber-500 to-amber-400'
                              }`}
                              style={{
                                width: `${Math.min(100, Math.max(10, (batnaEstimate / (scenario.batna.clientBATNAValue * 1.5 || 1)) * 100))}%`,
                              }}
                            />
                          </div>
                          <span className="text-[11px] text-muted-foreground">€{batnaEstimate.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Strategy Recommendation Card */}
                  {strategyTipKey && STRATEGY_TIPS[strategyTipKey] && (
                    <div className="glass-card p-4 space-y-2 border-violet-500/20">
                      <div className="flex items-center gap-2">
                        <Target className="h-3.5 w-3.5 text-violet-400" />
                        <h3 className="text-xs font-semibold text-amber-400">Opening Strategy</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {STRATEGY_TIPS[strategyTipKey]}
                      </p>
                    </div>
                  )}

                  {/* Quick Advisor Tip (from original) */}
                  <div className="glass-card p-4 space-y-2 border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-200 italic">
                        {ADVISOR_TIPS[category] || ADVISOR_TIPS.fundamentals}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        </div>

        {/* Proceed Button — BUG-001 fix: add loading state, guard against double-click, reset negotiation state */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-end pb-4"
        >
          <Button
            onClick={() => {
              if (isTransitioning) return;
              setIsTransitioning(true);
              // Reset negotiation state before entering investigation
              useGameStore.getState().resetNegotiation();
              // Use a small timeout to prevent AnimatePresence race conditions
              setTimeout(() => {
                setPhase('investigation');
                setIsTransitioning(false);
              }, 50);
            }}
            disabled={isTransitioning}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2 relative z-30"
            size="lg"
          >
            {isTransitioning ? 'Loading...' : 'Proceed to Investigation'}
            {!isTransitioning && <ArrowRight className="h-4 w-4" />}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
