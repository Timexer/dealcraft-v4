'use client';

import { useMemo, useState, useEffect } from 'react';
import { useGameStore } from '@/store/game-store';
import { getScenarioById, allScenarios } from '@/data/scenarios';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/scenarios/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Clock,
  AlertTriangle,
  Heart,
  ClipboardList,
  Target,
  FileText,
  BarChart3,
  User,
  Brain,
  Flame,
  Shield,
  Repeat,
} from 'lucide-react';

// Difficulty dimension labels and icons
const DIFFICULTY_DIMENSIONS = [
  { key: 'economicComplexity', label: 'Economic', icon: BarChart3 },
  { key: 'emotionalComplexity', label: 'Emotional', icon: Heart },
  { key: 'ethicalComplexity', label: 'Ethical', icon: Shield },
  { key: 'informationAsymmetry', label: 'Information', icon: HelpCircle },
  { key: 'powerImbalance', label: 'Power', icon: AlertTriangle },
  { key: 'timePressure', label: 'Time', icon: Clock },
  { key: 'relationshipStakes', label: 'Relationship', icon: Repeat },
] as const;

// Personality trait labels for the counterparty preview — values are 0-100
const PERSONALITY_TRAITS = [
  { key: 'truthfulness', label: 'Truthfulness', lowLabel: 'Deceptive', highLabel: 'Honest', gradientFrom: 'from-red-500', gradientTo: 'to-emerald-400', barBg: 'bg-emerald-500/20', barFill: 'bg-gradient-to-r from-emerald-600 to-emerald-400' },
  { key: 'ego', label: 'Ego', lowLabel: 'Humble', highLabel: 'Dominant', gradientFrom: 'from-emerald-500', gradientTo: 'to-amber-400', barBg: 'bg-amber-500/20', barFill: 'bg-gradient-to-r from-amber-600 to-amber-400' },
  { key: 'riskTolerance', label: 'Risk Tolerance', lowLabel: 'Risk-averse', highLabel: 'Risk-seeker', gradientFrom: 'from-cyan-500', gradientTo: 'to-orange-400', barBg: 'bg-orange-500/20', barFill: 'bg-gradient-to-r from-orange-600 to-orange-400' },
  { key: 'patience', label: 'Patience', lowLabel: 'Impulsive', highLabel: 'Patient', gradientFrom: 'from-red-500', gradientTo: 'to-cyan-400', barBg: 'bg-cyan-500/20', barFill: 'bg-gradient-to-r from-cyan-600 to-cyan-400' },
  { key: 'fairnessSensitivity', label: 'Fairness', lowLabel: 'Pragmatic', highLabel: 'Idealistic', gradientFrom: 'from-violet-500', gradientTo: 'to-violet-400', barBg: 'bg-violet-500/20', barFill: 'bg-gradient-to-r from-violet-600 to-violet-400' },
  { key: 'emotionalVolatility', label: 'Volatility', lowLabel: 'Calm', highLabel: 'Explosive', gradientFrom: 'from-emerald-500', gradientTo: 'to-red-400', barBg: 'bg-red-500/20', barFill: 'bg-gradient-to-r from-red-600 to-red-400' },
  { key: 'preparationLevel', label: 'Preparation', lowLabel: 'Unprepared', highLabel: 'Thorough', gradientFrom: 'from-slate-500', gradientTo: 'to-teal-400', barBg: 'bg-teal-500/20', barFill: 'bg-gradient-to-r from-teal-600 to-teal-400' },
  { key: 'relationshipOrientation', label: 'Relationship', lowLabel: 'Transactional', highLabel: 'Relational', gradientFrom: 'from-slate-500', gradientTo: 'to-pink-400', barBg: 'bg-pink-500/20', barFill: 'bg-gradient-to-r from-pink-600 to-pink-400' },
] as const;

// Intensity level for personality traits (0-100 scale)
function getIntensityLevel(value: number): { label: string; colorClass: string; dotClass: string } {
  if (value <= 15) return { label: 'Very Low', colorClass: 'text-slate-400', dotClass: 'bg-slate-400' };
  if (value <= 30) return { label: 'Low', colorClass: 'text-blue-400', dotClass: 'bg-blue-400' };
  if (value <= 50) return { label: 'Moderate', colorClass: 'text-amber-400', dotClass: 'bg-amber-400' };
  if (value <= 70) return { label: 'High', colorClass: 'text-orange-400', dotClass: 'bg-orange-400' };
  if (value <= 85) return { label: 'Very High', colorClass: 'text-red-400', dotClass: 'bg-red-400' };
  return { label: 'Extreme', colorClass: 'text-rose-500', dotClass: 'bg-rose-500' };
}

// Thomas-Kilmann conflict style derivation from personality traits
type ConflictStyle = 'competing' | 'collaborating' | 'compromising' | 'avoiding' | 'accommodating';

const CONFLICT_STYLES: Record<ConflictStyle, { label: string; icon: string; description: string; color: string; bg: string }> = {
  competing: { label: 'Competing', icon: '⚔️', description: 'Assertive & uncooperative — pursues own interests at others\' expense', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' },
  collaborating: { label: 'Collaborating', icon: '🤝', description: 'Assertive & cooperative — seeks mutually beneficial solutions', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  compromising: { label: 'Compromising', icon: '⚖️', description: 'Moderate on both — finds acceptable middle ground', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  avoiding: { label: 'Avoiding', icon: '🚪', description: 'Unassertive & uncooperative — sidesteps or postpones conflict', color: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/30' },
  accommodating: { label: 'Accommodating', icon: '🙏', description: 'Unassertive & cooperative — yields to others\' interests', color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' },
};

function deriveConflictStyle(p: { ego: number; riskTolerance: number; patience: number; fairnessSensitivity: number; emotionalVolatility: number; relationshipOrientation: number }): ConflictStyle {
  // Assertiveness = ego + riskTolerance (high = assertive)
  const assertiveness = (p.ego + p.riskTolerance) / 2;
  // Cooperativeness = patience + fairness + relationship (high = cooperative)
  const cooperativeness = (p.patience + p.fairnessSensitivity + p.relationshipOrientation) / 3;

  if (assertiveness > 60 && cooperativeness > 60) return 'collaborating';
  if (assertiveness > 60 && cooperativeness <= 60) return 'competing';
  if (assertiveness <= 60 && cooperativeness > 60) return 'accommodating';
  if (assertiveness <= 40 && cooperativeness <= 40) return 'avoiding';
  return 'compromising';
}

function getDifficultyLevel(value: number): { level: string; cssClass: string } {
  if (value <= 1) return { level: 'Low', cssClass: 'low' };
  if (value <= 3) return { level: 'Medium', cssClass: 'medium' };
  if (value <= 4) return { level: 'High', cssClass: 'high' };
  return { level: 'Extreme', cssClass: 'extreme' };
}

export function CaseIntake() {
  const { currentScenarioId, setPhase, setCaseAccepted, setCurrentScenarioId, caseResults, initInvestigationPoints } = useGameStore();
  const scenario = currentScenarioId ? getScenarioById(currentScenarioId) : null;

  // Typewriter effect state for stakes
  const [displayedStakes, setDisplayedStakes] = useState('');
  const [stakesComplete, setStakesComplete] = useState(false);

  // Typewriter effect for stakes description - must be before early return
  const stakesText = scenario?.briefing.stakes ?? '';
  useEffect(() => {
    if (!stakesText) return;
    setDisplayedStakes('');
    setStakesComplete(false);
    let i = 0;
    const timer = setInterval(() => {
      if (i < stakesText.length) {
        setDisplayedStakes(stakesText.slice(0, i + 1));
        i++;
      } else {
        setStakesComplete(true);
        clearInterval(timer);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [stakesText]);

  // Check for similar cases in same category
  const similarCasesDone = useMemo(() => {
    if (!scenario) return [];
    return caseResults.filter(result => {
      const s = getScenarioById(result.scenarioId);
      return s && s.category === scenario.category && s.id !== scenario.id;
    });
  }, [scenario, caseResults]);

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

  const { briefing, client, counterparty, difficulty } = scenario;

  const handleAccept = () => {
    // Initialize investigation points based on case tier (difficulty scaling)
    if (scenario) {
      initInvestigationPoints(scenario.tier);
    }
    setCaseAccepted(true);
    setPhase('strategy');
  };

  const handleRequestMoreInfo = () => {
    toast.info('Additional information requires investigation phase', {
      description: 'Accept the case to unlock the investigation phase where you can gather more intel.',
    });
  };

  const handleDecline = () => {
    setCurrentScenarioId(null);
    setCaseAccepted(false);
    setPhase('dashboard');
    toast('Case declined', {
      description: 'You chose not to take this case.',
    });
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' },
    }),
  };

  return (
    <div className={`min-h-screen bg-background case-bg-${scenario.category}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 dramatic-entrance">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" size="sm" onClick={() => setPhase('dashboard')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Badge variant="outline" className={CATEGORY_COLORS[scenario.category]}>
            {CATEGORY_LABELS[scenario.category]}
          </Badge>
        </motion.div>

        {/* Client Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/50 border-border/50 gradient-top-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl client-avatar-glow rounded-full">{client.avatar}</div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{scenario.title}</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">{scenario.subtitle}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-medium">{briefing.clientName}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{briefing.clientRole}</span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-xs">Tier {scenario.tier}</Badge>
                  <span className="fee-badge text-[11px]">
                    €{scenario.fee.toLocaleString()}
                    {scenario.stakesValue ? <span className="fee-percent">({((scenario.fee / scenario.stakesValue) * 100).toFixed(1)}%)</span> : ''}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Difficulty Preview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-500" />
                Difficulty Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {DIFFICULTY_DIMENSIONS.map((dim) => {
                  const value = difficulty[dim.key as keyof typeof difficulty];
                  const { level, cssClass } = getDifficultyLevel(value);
                  const DimIcon = dim.icon;
                  return (
                    <div key={dim.key} className="flex items-center gap-2.5">
                      <DimIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground w-24 shrink-0">{dim.label}</span>
                      <div className="flex-1 difficulty-bar">
                        <div
                          className={`fill ${cssClass} difficulty-fill-animate`}
                          style={{ width: `${(value / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-medium w-12 text-right ${
                        cssClass === 'low' ? 'text-emerald-400' :
                        cssClass === 'medium' ? 'text-amber-400' :
                        cssClass === 'high' ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {level}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Counterparty Personality Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card/50 border-border/50 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-violet-400" />
                Counterparty Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-4">
                {/* Top row: Avatar card + Conflict Style */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Avatar card */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30 shrink-0">
                    <div className="text-4xl">{counterparty.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold">{counterparty.name}</p>
                      <p className="text-xs text-muted-foreground">{counterparty.role}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Flame className={`h-3 w-3 ${counterparty.personality.emotionalVolatility > 50 ? 'text-red-400' : 'text-emerald-400'}`} />
                        <span className={`text-[11px] font-medium ${counterparty.personality.emotionalVolatility > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {counterparty.personality.emotionalVolatility > 50 ? 'Volatile' : counterparty.personality.emotionalVolatility > 25 ? 'Tempered' : 'Calm'}
                        </span>
                        <span className="text-[11px] text-muted-foreground mx-0.5">•</span>
                        <span className={`text-[11px] font-medium ${counterparty.personality.riskTolerance > 50 ? 'text-orange-400' : 'text-cyan-400'}`}>
                          {counterparty.personality.riskTolerance > 50 ? 'Risk-taker' : counterparty.personality.riskTolerance > 25 ? 'Balanced' : 'Risk-averse'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conflict Style Badge — derived from Thomas-Kilmann model */}
                  {(() => {
                    const style = deriveConflictStyle(counterparty.personality);
                    const styleInfo = CONFLICT_STYLES[style];
                    return (
                      <div className={`flex-1 flex items-center gap-3 p-3 rounded-lg border ${styleInfo.bg}`}>
                        <span className="text-2xl">{styleInfo.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${styleInfo.color}`}>{styleInfo.label}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-[240px] text-xs">
                                  Based on Thomas-Kilmann Conflict Mode Instrument. Derived from assertiveness (ego + risk tolerance) vs. cooperativeness (patience + fairness + relationship orientation).
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">{styleInfo.description}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Personality trait bars — redesigned with 0-100 fill + intensity labels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
                  {PERSONALITY_TRAITS.map((trait) => {
                    const value = counterparty.personality[trait.key as keyof typeof counterparty.personality];
                    const clampedValue = Math.max(0, Math.min(100, value));
                    const intensity = getIntensityLevel(clampedValue);
                    return (
                      <div key={trait.key} className="group">
                        {/* Label row */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium text-muted-foreground">{trait.label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${intensity.dotClass}`} />
                            <span className={`text-[10px] font-medium ${intensity.colorClass}`}>{intensity.label}</span>
                            <span className="text-[10px] text-muted-foreground tabular-nums ml-0.5">{clampedValue}</span>
                          </div>
                        </div>
                        {/* Bar */}
                        <div className={`h-2 rounded-full ${trait.barBg} overflow-hidden`}>
                          <motion.div
                            className={`h-full rounded-full ${trait.barFill}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${clampedValue}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                          />
                        </div>
                        {/* Contextual hint: what this value means */}
                        <p className="text-[9px] text-muted-foreground/50 mt-0.5 h-3">
                          {clampedValue <= 30 ? trait.lowLabel : clampedValue >= 70 ? trait.highLabel : ''}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Similar Cases Hint */}
        {similarCasesDone.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <User className="h-4.5 w-4.5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-400 mb-1">Similar Cases Experience</p>
                    <p className="text-xs text-amber-200">
                      You&apos;ve completed {similarCasesDone.length} case{similarCasesDone.length > 1 ? 's' : ''} in the{' '}
                      <span className="font-medium text-amber-300">{CATEGORY_LABELS[scenario.category]}</span> category.
                      Your experience with{' '}
                      {similarCasesDone.slice(0, 2).map((r, i) => {
                        const s = getScenarioById(r.scenarioId);
                        return s ? (
                          <span key={r.scenarioId}>
                            {i > 0 ? ' and ' : ''}<span className="font-medium text-amber-300">{s.title}</span>
                          </span>
                        ) : null;
                      })}
                      {' '}may give you insight into this case.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Case Briefing Sections */}
        <ScrollArea className="max-h-[50vh] overflow-y-auto">
          <div className="space-y-4 pr-2">
            {/* Situation */}
            <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-500" />
                    Situation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">{briefing.situation}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Client Demands */}
            <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-red-400" />
                    Client Demands
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {briefing.clientDemands.map((demand, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{demand}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Known Facts */}
            <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Known Facts
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {briefing.knownFacts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Missing Information */}
            <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-violet-400" />
                    Missing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {briefing.missingInformation.map((info, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <HelpCircle className="h-3.5 w-3.5 text-violet-500 mt-0.5 shrink-0" />
                        <span>{info}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Time Pressure & Stakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-400" />
                      Time Pressure
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <p className="text-sm text-muted-foreground">{briefing.timePressure}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible">
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      What&apos;s at Stake
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      {displayedStakes}
                      {!stakesComplete && <span className="typewriter-cursor" />}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Client Emotional State */}
            <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="visible">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-400" />
                    Client Emotional State
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{briefing.clientEmotionalState}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </ScrollArea>

        <Separator />

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            onClick={handleAccept}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-2 accept-button-glow"
            size="lg"
          >
            <CheckCircle2 className="h-5 w-5" />
            Accept Case
          </Button>
          <Button
            variant="outline"
            onClick={handleRequestMoreInfo}
            className="flex-1 gap-2"
            size="lg"
          >
            <HelpCircle className="h-5 w-5" />
            Request More Info
          </Button>
          <Button
            variant="ghost"
            onClick={handleDecline}
            className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
            size="lg"
          >
            Decline Case
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
