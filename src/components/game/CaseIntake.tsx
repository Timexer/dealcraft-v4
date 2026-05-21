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

// Personality trait labels for the counterparty preview
const PERSONALITY_TRAITS = [
  { key: 'truthfulness', label: 'Truthfulness', color: 'bg-emerald-500/60' },
  { key: 'ego', label: 'Ego', color: 'bg-amber-500/60' },
  { key: 'riskTolerance', label: 'Risk Tolerance', color: 'bg-orange-500/60' },
  { key: 'patience', label: 'Patience', color: 'bg-cyan-500/60' },
  { key: 'fairnessSensitivity', label: 'Fairness', color: 'bg-violet-500/60' },
  { key: 'emotionalVolatility', label: 'Volatility', color: 'bg-red-500/60' },
  { key: 'preparationLevel', label: 'Preparation', color: 'bg-teal-500/60' },
  { key: 'relationshipOrientation', label: 'Relationship', color: 'bg-pink-500/60' },
] as const;

function getDifficultyLevel(value: number): { level: string; cssClass: string } {
  if (value <= 1) return { level: 'Low', cssClass: 'low' };
  if (value <= 3) return { level: 'Medium', cssClass: 'medium' };
  if (value <= 4) return { level: 'High', cssClass: 'high' };
  return { level: 'Extreme', cssClass: 'extreme' };
}

export function CaseIntake() {
  const { currentScenarioId, setPhase, setCaseAccepted, setCurrentScenarioId, caseResults } = useGameStore();
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
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-violet-400" />
                Counterparty Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Avatar card */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30 shrink-0">
                  <div className="text-4xl">{counterparty.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold">{counterparty.name}</p>
                    <p className="text-xs text-muted-foreground">{counterparty.role}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Flame className={`h-3 w-3 ${counterparty.personality.emotionalVolatility > 3 ? 'text-red-400' : 'text-emerald-400'}`} />
                      <span className="text-[11px] text-muted-foreground">
                        {counterparty.personality.emotionalVolatility > 3 ? 'Volatile' : 'Calm'}
                      </span>
                      <span className="text-[11px] text-muted-foreground mx-1">•</span>
                      <span className="text-[11px] text-muted-foreground">
                        {counterparty.personality.riskTolerance > 3 ? 'Risk-taker' : 'Risk-averse'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Personality trait bars */}
                <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
                  {PERSONALITY_TRAITS.map((trait) => {
                    const value = counterparty.personality[trait.key as keyof typeof counterparty.personality];
                    return (
                      <div key={trait.key} className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground w-20 shrink-0 truncate">{trait.label}</span>
                        <div className="flex-1 personality-bar">
                          <div
                            className="fill"
                            style={{ width: `${(value / 5) * 100}%`, background: trait.color }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground w-4 text-right">{value}</span>
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
