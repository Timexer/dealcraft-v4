'use client';

import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { StrategyAdvisorSidebar } from './StrategyAdvisorSidebar';
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
import { Slider } from '@/components/ui/slider';
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
import { useSound } from '@/hooks/use-sound';

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
    issueEstimates, setIssueEstimates,
  } = useGameStore();

  const scenario = currentScenarioId ? getScenarioById(currentScenarioId) : null;
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [newAssumption, setNewAssumption] = useState('');
  const [isAdvisorExpanded, setIsAdvisorExpanded] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isEstimatesVerified, setIsEstimatesVerified] = useState(false);

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
            <Button variant="ghost" size="sm" onClick={() => wizardStep > 1 ? setWizardStep(1) : setPhase('intake')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {wizardStep > 1 ? 'Back' : 'Back to Case Intake'}
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Strategy Board</h1>
              <p className="text-xs text-muted-foreground">{scenario.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className={`h-2 w-8 rounded-full transition-colors duration-300 ${wizardStep >= 1 ? 'bg-amber-500' : 'bg-border'}`} />
             <div className={`h-2 w-8 rounded-full transition-colors duration-300 ${wizardStep >= 2 ? 'bg-amber-500' : 'bg-border'}`} />
             <span className="text-xs text-muted-foreground ml-2 hidden sm:inline-block">Step {wizardStep} of 2</span>
          </div>
        </motion.div>

        {/* Two-column layout: main content + Strategy Advisor Panel */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: main content */}
          <div className="flex-1 min-w-0">
          <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="space-y-6 pr-2">
            <AnimatePresence mode="wait">
              {wizardStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
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
            
            <div className="flex justify-end pt-4 pb-4">
              <Button onClick={() => setWizardStep(2)} className="bg-amber-600 hover:bg-amber-700 text-white gap-2" size="lg">
                Next: Prioritize Issues <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            </motion.div>
            )}
            
            {wizardStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
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
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {issues.map((issue) => {
                      const estimate = issueEstimates[issue.id] || { clientPriority: 5, counterpartyPriority: 5 };
                      
                      let coachingComment = null;
                      if (isEstimatesVerified) {
                        const clientDiff = Math.abs(estimate.clientPriority - issue.clientPriority);
                        const cpDiff = Math.abs(estimate.counterpartyPriority - issue.counterpartyPriority);
                        const totalDiff = clientDiff + cpDiff;
                        
                        if (totalDiff === 0) {
                          coachingComment = { text: "🎯 Spot on! You read them perfectly.", color: "text-emerald-400" };
                        } else if (totalDiff <= 2) {
                          coachingComment = { text: "✅ Very close! Good read.", color: "text-emerald-400" };
                        } else if (totalDiff <= 5) {
                          coachingComment = { text: "💡 You're in the right ballpark, but missing some nuances.", color: "text-yellow-400" };
                        } else {
                          if (estimate.counterpartyPriority < issue.counterpartyPriority && cpDiff > 3) {
                            coachingComment = { text: "⚠️ You underestimated how much they care about this.", color: "text-red-400" };
                          } else if (estimate.clientPriority < issue.clientPriority && clientDiff > 3) {
                            coachingComment = { text: "⚠️ You underestimated how important this is to your client.", color: "text-red-400" };
                          } else {
                            coachingComment = { text: "⚠️ Your estimates are quite far off from the reality.", color: "text-red-400" };
                          }
                        }
                      }

                      return (
                        <div
                          key={issue.id}
                          className="p-4 rounded-xl bg-background/50 border border-border/30 space-y-4 priority-issue-card"
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
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {/* Importance to Us */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <Label className="text-xs text-amber-500">Importance to Us</Label>
                                <span className="text-xs font-mono font-semibold text-amber-400">{estimate.clientPriority}/10</span>
                              </div>
                              <Slider
                                disabled={isEstimatesVerified}
                                min={1}
                                max={10}
                                step={1}
                                value={[estimate.clientPriority]}
                                onValueChange={(val) => setIssueEstimates({ ...issueEstimates, [issue.id]: { ...estimate, clientPriority: val[0] } })}
                                className="[&_[role=slider]]:bg-amber-400 [&_[role=slider]]:border-amber-400 [&>.relative>.absolute]:bg-amber-400/50"
                              />
                              {isEstimatesVerified && (
                                <div className="flex items-center gap-1.5 text-[11px] mt-1">
                                  <span className="text-muted-foreground">True value:</span>
                                  <span className="font-semibold text-amber-400">{issue.clientPriority}/10</span>
                                </div>
                              )}
                            </div>

                            {/* Importance to Them */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <Label className="text-xs text-cyan-500">Importance to Them</Label>
                                <span className="text-xs font-mono font-semibold text-cyan-400">{estimate.counterpartyPriority}/10</span>
                              </div>
                              <Slider
                                disabled={isEstimatesVerified}
                                min={1}
                                max={10}
                                step={1}
                                value={[estimate.counterpartyPriority]}
                                onValueChange={(val) => setIssueEstimates({ ...issueEstimates, [issue.id]: { ...estimate, counterpartyPriority: val[0] } })}
                                className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400 [&>.relative>.absolute]:bg-cyan-400/50"
                              />
                              {isEstimatesVerified && (
                                <div className="flex items-center gap-1.5 text-[11px] mt-1">
                                  <span className="text-muted-foreground">True value:</span>
                                  <span className="font-semibold text-cyan-400">{issue.counterpartyPriority}/10</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Coaching Comment */}
                          {isEstimatesVerified && coachingComment && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: 'auto' }} 
                              className="pt-3 border-t border-border/20"
                            >
                              <div className="flex flex-col gap-1.5">
                                <span className={`text-xs font-medium ${coachingComment.color}`}>
                                  {coachingComment.text}
                                </span>
                                {issue.clientPriority !== issue.counterpartyPriority && (
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <Lightbulb className="h-3 w-3 text-amber-400/70" />
                                    <span className="text-[11px] text-muted-foreground italic">
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
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {!isEstimatesVerified ? (
                    <div className="mt-6 flex justify-center">
                      <Button 
                        onClick={() => setIsEstimatesVerified(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Verify Estimates
                      </Button>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                    >
                      <div className="flex items-center gap-2 text-emerald-400 font-medium">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Estimates Verified</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Your estimates are locked in. You can now proceed to the investigation phase.
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            
            <div className="flex justify-end pt-4 pb-4">
              <Button
                onClick={() => {
                  if (isTransitioning) return;
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setPhase('investigation');
                    setIsTransitioning(false);
                  }, 50);
                }}
                disabled={isTransitioning || !isEstimatesVerified}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2 relative z-30 disabled:opacity-50"
                size="lg"
              >
                {isTransitioning ? 'Loading...' : 'Proceed to Investigation'}
                {!isTransitioning && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
            </motion.div>
            )}
            </AnimatePresence>
          </div>
        </ScrollArea>
        </div>

        {/* Right column: Strategy Advisor Panel */}
        <StrategyAdvisorSidebar batnaEstimate={batnaEstimate} />
        </div>

      </div>
    </div>
  );
}
