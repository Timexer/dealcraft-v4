'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { CATEGORY_COLORS, CATEGORY_LABELS, type EndingScores } from '@/data/scenarios/types';
import { calculateFinalScore, getScoreGrade, getReputationType, calculateReputationDelta, calculateStatsDelta } from '@/lib/game-engine';
import { StreakIndicator } from '@/components/game/StreakIndicator';
import { NegotiationTranscript } from '@/components/game/NegotiationTranscript';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  ArrowRight,
  Trophy,
  Star,
  Eye,
  Lightbulb,
  Crown,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Hexagon,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  HelpCircle,
  Sparkles,
  Flame,
  FileText,
  XCircle,
  BookOpen,
} from 'lucide-react';

const SCORE_DIMENSIONS: { key: keyof EndingScores; label: string; color: string; maxColor: string }[] = [
  { key: 'clientEconomicValue', label: 'Client Economic Value', color: 'bg-amber-500', maxColor: 'bg-amber-500/30' },
  { key: 'jointValueCreated', label: 'Joint Value Created', color: 'bg-emerald-500', maxColor: 'bg-emerald-500/30' },
  { key: 'infoDiscovered', label: 'Info Discovered', color: 'bg-violet-500', maxColor: 'bg-violet-500/30' },
  { key: 'relationshipPreserved', label: 'Relationship Preserved', color: 'bg-pink-500', maxColor: 'bg-pink-500/30' },
  { key: 'ethicalIntegrity', label: 'Ethical Integrity', color: 'bg-teal-500', maxColor: 'bg-teal-500/30' },
  { key: 'strategicDiscipline', label: 'Strategic Discipline', color: 'bg-cyan-500', maxColor: 'bg-cyan-500/30' },
];

const SCORE_DIMENSION_DETAILS: Record<string, { explanation: string; tip: string }> = {
  clientEconomicValue: {
    explanation: "How well you protected and advanced your client's financial interests in the deal",
    tip: "Always quantify your BATNA before negotiating. A strong alternative gives you leverage to claim more value."
  },
  jointValueCreated: {
    explanation: "How much additional value you created through logrolling, contingency contracts, and creative problem-solving",
    tip: "Look for differences in risk preferences, time preferences, and assessments to create value that both sides can share."
  },
  infoDiscovered: {
    explanation: "How effectively you uncovered hidden information and used it to make better decisions",
    tip: "Ask diagnostic questions before making offers. The more you know about the other side's interests, the more value you can create."
  },
  relationshipPreserved: {
    explanation: "How well you maintained the relationship with the counterparty for future dealings",
    tip: "Separate the people from the problem. Face-saving concessions and empathetic listening preserve relationships without sacrificing value."
  },
  ethicalIntegrity: {
    explanation: "Whether you maintained ethical standards or used deception and manipulation",
    tip: "Ethical negotiation builds long-term reputation. Deception may win a single deal but destroys future opportunities."
  },
  strategicDiscipline: {
    explanation: "How well you stuck to your strategy and avoided common biases and traps",
    tip: "Watch for anchoring bias, fixed-pie assumptions, and escalation of commitment. Discipline prevents costly mistakes."
  }
};

function getScoreQuality(score: number): { icon: React.ReactNode; label: string; colorClass: string } {
  if (score >= 80) {
    return {
      icon: <Star className="h-4 w-4" />,
      label: 'Great',
      colorClass: 'text-emerald-400',
    };
  } else if (score >= 60) {
    return {
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: 'Good',
      colorClass: 'text-cyan-400',
    };
  } else if (score >= 40) {
    return {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: 'Needs Work',
      colorClass: 'text-amber-400',
    };
  } else {
    return {
      icon: <XCircle className="h-4 w-4" />,
      label: 'Critical',
      colorClass: 'text-red-400',
    };
  }
}

const GRADE_COLORS: Record<string, string> = {
  S: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
  A: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10',
  B: 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10',
  C: 'text-amber-400 border-amber-500/50 bg-amber-500/10',
  D: 'text-orange-400 border-orange-500/50 bg-orange-500/10',
  F: 'text-red-400 border-red-500/50 bg-red-500/10',
};

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + (value - startValue) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

// Sparkle particles component for master/cooperative endings
function SparkleOverlay() {
  const sparkles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      top: `${10 + Math.random() * 80}%`,
      delay: `${i * 0.3}s`,
      size: 6 + Math.random() * 10,
    })),
  []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map(s => (
        <span
          key={s.id}
          className="absolute text-amber-400/30 animate-subtle-float"
          style={{
            left: s.left,
            top: s.top,
            fontSize: `${s.size}px`,
            animationDelay: s.delay,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

// Comparison bar for player vs max score
function ComparisonBar({ playerScore, maxScore, label, playerColor, maxColor, delay }: {
  playerScore: number;
  maxScore: number;
  label: string;
  playerColor: string;
  maxColor: string;
  delay: number;
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">{playerScore}</span>
          <span className="text-[10px] text-muted-foreground">/</span>
          <span className="text-[10px] text-muted-foreground">{maxScore}</span>
        </div>
      </div>
      <div className="comparison-bar">
        {/* Max score background */}
        <div
          className={`bar-fill ${maxColor}`}
          style={{ width: animated ? `${maxScore}%` : '0%' }}
        />
        {/* Player score overlay */}
        <div
          className={`absolute top-0 left-0 h-full rounded-l-md ${playerColor} stat-bar-gradient`}
          style={{
            width: animated ? `${playerScore}%` : '0%',
            transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 1,
          }}
        />
      </div>
    </div>
  );
}

export function Postmortem() {
  const {
    currentScenarioId, setPhase,
    caseResults, negotiation,
    discoveredFacts, stats, addStats,
    reputation, addReputation,
    currentStreak, bestStreak, streakType,
  } = useGameStore();

  const scenario = currentScenarioId ? getScenarioById(currentScenarioId) : null;
  const latestResult = currentScenarioId
    ? caseResults.find(r => r.scenarioId === currentScenarioId)
    : caseResults[caseResults.length - 1];

  // Track if radar should animate
  const [showRadar, setShowRadar] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowRadar(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // Transcript dialog state
  const [showTranscript, setShowTranscript] = useState(false);

  // Expanded bias traps state
  const [expandedTraps, setExpandedTraps] = useState<Set<string>>(new Set());

  const toggleTrap = useCallback((trapId: string) => {
    setExpandedTraps(prev => {
      const next = new Set(prev);
      if (next.has(trapId)) {
        next.delete(trapId);
      } else {
        next.add(trapId);
      }
      return next;
    });
  }, []);

  // Expanded score dimensions state
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set());

  const toggleDimension = useCallback((dimKey: string) => {
    setExpandedDimensions(prev => {
      const next = new Set(prev);
      if (next.has(dimKey)) {
        next.delete(dimKey);
      } else {
        next.add(dimKey);
      }
      return next;
    });
  }, []);

  if (!scenario || !latestResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No case results found.</p>
        <Button variant="outline" onClick={() => setPhase('dashboard')} className="ml-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const finalScore = latestResult.finalScore;
  const grade = getScoreGrade(finalScore);
  const repType = getReputationType(reputation);
  const endingType = latestResult.outcome;
  const ending = scenario.endings.find(e => e.type === endingType) || scenario.endings[0];

  // Calculate streak bonus info
  const streakMultiplier = currentStreak >= 3 ? Math.min(1.5, 1 + (currentStreak - 2) * 0.05) : 1;
  const streakBonus = streakMultiplier > 1 ? Math.round(finalScore * (streakMultiplier - 1)) : 0;

  // Calculate deltas
  const repDelta = calculateReputationDelta(scenario, endingType);
  const totalInfo = scenario.investigationActions.reduce((sum, a) => sum + a.reveals.length, 0);
  const infoFound = (negotiation.informationRevealed?.length || 0) + discoveredFacts.length;
  const statsDelta = calculateStatsDelta(scenario, endingType, infoFound, totalInfo);

  // Determine if this is a good ending for sparkle effect
  const isGoodEnding = endingType === 'master' || endingType === 'cooperative';

  // Get master ending scores for "What If?" comparison
  const masterEnding = scenario.endings.find(e => e.type === 'master');
  const masterScores = masterEnding?.scores || null;
  const masterFinalScore = masterScores ? calculateFinalScore(masterScores) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl sm:text-3xl font-bold">Case Review</h1>
          <p className="text-sm text-muted-foreground mt-1">{scenario.title}</p>
          <Badge variant="outline" className={`mt-2 ${CATEGORY_COLORS[scenario.category]}`}>
            {CATEGORY_LABELS[scenario.category]}
          </Badge>
        </motion.div>

        <ScrollArea className="max-h-[calc(100vh-180px)]">
          <div className="space-y-6 pr-2">
            {/* Score Card - with grade flip animation and score counter */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Card className={`bg-card/50 border-border/50 overflow-hidden relative ${isGoodEnding ? 'sparkle-effect' : ''}`}>
                {isGoodEnding && <SparkleOverlay />}
                <CardContent className="p-6 relative z-10">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Grade Badge - with 3D flip animation */}
                    <motion.div
                      initial={{ scale: 0, rotateY: 90 }}
                      animate={{ scale: 1, rotateY: 0 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.5, duration: 1 }}
                      className={`w-24 h-24 rounded-full border-4 flex items-center justify-center grade-flip ${GRADE_COLORS[grade.grade]}`}
                    >
                      <span className="text-4xl font-black">{grade.grade}</span>
                    </motion.div>

                    {/* Score & Description - with animated counter */}
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                        <span className="text-4xl font-black score-counter">
                          <AnimatedNumber value={finalScore} duration={2000} />
                        </span>
                        <span className="text-lg text-muted-foreground">/100</span>
                      </div>
                      <p className={`text-sm font-medium mt-1 ${grade.color}`}>{grade.description}</p>
                      <p className="text-sm text-muted-foreground mt-2">{ending.description}</p>
                      <p className="text-xs text-muted-foreground mt-1 italic">{ending.longTermConsequence}</p>
                      {/* Streak Bonus Info */}
                      {streakBonus > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.5 }}
                          className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
                        >
                          <Flame className="h-4 w-4 text-amber-400" />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-amber-300">
                              Streak Bonus: +{streakBonus} pts ({Math.round((streakMultiplier - 1) * 100)}%)
                            </p>
                            <p className="text-[10px] text-amber-400/60">
                              From {currentStreak}x {streakType === 'master' ? 'master' : 'win'} streak
                            </p>
                          </div>
                        </motion.div>
                      )}
                      {/* Streak Indicator */}
                      {currentStreak > 0 && (
                        <div className="mt-2">
                          <StreakIndicator />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Key Takeaway Card - prominent with amber accent */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="bg-amber-500/15 border-amber-500/30 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600" />
                <CardContent className="p-5 pl-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Lightbulb className="h-4.5 w-4.5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">Key Takeaway</p>
                      <p className="text-sm text-amber-100 italic font-medium leading-relaxed">
                        &ldquo;{scenario.postmortem.lesson}&rdquo;
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Radar Chart - with animated reveal */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Hexagon className="h-4 w-4 text-amber-400" />
                    Performance Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className={`w-full h-[300px] sm:h-[340px] ${showRadar ? 'radar-reveal' : 'opacity-0'}`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        data={SCORE_DIMENSIONS.map(dim => ({
                          dimension: dim.label,
                          score: latestResult.scores[dim.key],
                          fullMark: 100,
                        }))}
                      >
                        <PolarGrid
                          stroke="hsl(var(--border))"
                          strokeOpacity={0.4}
                          gridType="polygon"
                        />
                        <PolarAngleAxis
                          dataKey="dimension"
                          tick={{
                            fill: 'hsl(var(--muted-foreground))',
                            fontSize: 10,
                            fontWeight: 500,
                          }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={{
                            fill: 'hsl(var(--muted-foreground))',
                            fontSize: 9,
                          }}
                          tickCount={5}
                          axisLine={false}
                        />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: 'hsl(var(--card-foreground))',
                          }}
                          formatter={(value: number) => [`${value}/100`, 'Score']}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Score Dimensions with Expandable Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    Score Breakdown
                    <span className="text-[10px] font-normal text-muted-foreground ml-1">Click to expand</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {SCORE_DIMENSIONS.map((dim, i) => {
                    const playerScore = latestResult.scores[dim.key];
                    const maxScore = masterScores ? masterScores[dim.key] : 100;
                    const isExpanded = expandedDimensions.has(dim.key);
                    const quality = getScoreQuality(playerScore);
                    const details = SCORE_DIMENSION_DETAILS[dim.key];
                    const scoreGap = maxScore - playerScore;

                    return (
                      <motion.div
                        key={dim.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.08 }}
                        className={`rounded-lg border transition-colors duration-200 cursor-pointer ${
                          isExpanded
                            ? 'bg-card/80 border-border/60'
                            : 'bg-card/30 border-border/30 hover:bg-card/50 hover:border-border/50'
                        }`}
                        onClick={() => toggleDimension(dim.key)}
                      >
                        {/* Collapsed header row */}
                        <div className="flex items-center gap-3 p-3">
                          {/* Score Quality Indicator */}
                          <div className={`shrink-0 flex items-center justify-center ${quality.colorClass}`}>
                            {quality.icon}
                          </div>

                          {/* Label and score bar */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-medium truncate">{dim.label}</span>
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <span className="text-xs font-bold">{playerScore}</span>
                                <span className="text-[10px] text-muted-foreground">/</span>
                                <span className="text-[10px] text-muted-foreground">{maxScore}</span>
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] px-1.5 py-0 border-0 ${
                                    playerScore >= 80
                                      ? 'bg-emerald-500/15 text-emerald-400'
                                      : playerScore >= 60
                                      ? 'bg-cyan-500/15 text-cyan-400'
                                      : playerScore >= 40
                                      ? 'bg-amber-500/15 text-amber-400'
                                      : 'bg-red-500/15 text-red-400'
                                  }`}
                                >
                                  {quality.label}
                                </Badge>
                              </div>
                            </div>
                            {/* Mini progress bar */}
                            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${dim.color}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${playerScore}%` }}
                                transition={{ duration: 0.8, delay: 0.7 + i * 0.08, ease: 'easeOut' }}
                              />
                            </div>
                          </div>

                          {/* Expand/collapse chevron */}
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="shrink-0 text-muted-foreground"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </div>

                        {/* Expandable detail section */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 pt-0 space-y-3 border-t border-border/20">
                                {/* Explanation */}
                                <div className="mt-3">
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {details?.explanation}
                                  </p>
                                </div>

                                {/* Mini comparison: you vs master */}
                                <div className="flex items-center gap-3 p-2.5 rounded-md bg-muted/20">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] text-muted-foreground">Your Score</span>
                                      <span className="text-[10px] font-bold">{playerScore}</span>
                                    </div>
                                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${dim.color} stat-bar-gradient`}
                                        style={{ width: `${playerScore}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] text-yellow-300 flex items-center gap-1">
                                        <Crown className="h-2.5 w-2.5" />
                                        Master
                                      </span>
                                      <span className="text-[10px] font-bold text-yellow-300">{maxScore}</span>
                                    </div>
                                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-yellow-500/50 stat-bar-gradient"
                                        style={{ width: `${maxScore}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Score gap indicator */}
                                {scoreGap > 0 && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400/70">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{scoreGap} points away from master deal in this dimension</span>
                                  </div>
                                )}
                                {scoreGap <= 0 && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                                    <Star className="h-3 w-3" />
                                    <span>You matched or exceeded the master deal in this dimension!</span>
                                  </div>
                                )}

                                {/* Improvement Tip */}
                                <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/15">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <BookOpen className="h-3 w-3 text-amber-400" />
                                    <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                                      Improvement Tip
                                    </p>
                                  </div>
                                  <p className="text-xs text-amber-200/80 leading-relaxed italic">
                                    {details?.tip}
                                  </p>
                                  <p className="text-[9px] text-amber-400/40 mt-1">
                                    — From &ldquo;Negotiation Genius&rdquo; by Malhotra & Bazerman
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* What If? - Master Deal Comparison */}
            {masterEnding && masterScores && masterFinalScore !== null && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="bg-amber-500/10 border-amber-500/20 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-300">
                      <HelpCircle className="h-4 w-4" />
                      What If?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <p className="text-xs text-amber-200/60">
                      How your deal compares to the master deal — the best possible outcome for this case
                    </p>
                    
                    {/* Score comparison bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-amber-300">Your Score</span>
                        <span className="text-xs font-bold text-amber-300">{finalScore}/100</span>
                      </div>
                      <div className="comparison-bar">
                        <div
                          className="bar-fill bg-gradient-to-r from-amber-600/60 to-amber-500/70 stat-bar-gradient"
                          style={{ width: `${finalScore}%` }}
                        />
                        <span className="bar-label bar-label-left">{finalScore}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-yellow-300 flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          Master Deal
                        </span>
                        <span className="text-xs font-bold text-yellow-300">{masterFinalScore}/100</span>
                      </div>
                      <div className="comparison-bar">
                        <div
                          className="bar-fill bg-gradient-to-r from-yellow-500/40 to-yellow-400/50 stat-bar-gradient"
                          style={{ width: `${masterFinalScore}%` }}
                        />
                        <span className="bar-label bar-label-left">{masterFinalScore}</span>
                      </div>
                    </div>

                    {/* Score gap indicator */}
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/15">
                      <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-xs text-amber-200">
                        {finalScore < masterFinalScore 
                          ? `You were ${masterFinalScore - finalScore} points away from the master deal`
                          : finalScore >= masterFinalScore 
                          ? '🎉 You achieved the master deal score!'
                          : 'Great result!'
                        }
                      </span>
                    </div>

                    <Separator className="bg-amber-500/20" />

                    {/* Master solution text */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">The Master Deal</p>
                      <p className="text-sm text-amber-200">{scenario.postmortem.bestPossibleDeal}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">How It Works</p>
                      <p className="text-sm text-amber-200/80">{scenario.postmortem.masterSolution}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* What You Missed */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Card className="bg-violet-500/10 border-violet-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-violet-300">
                    <Eye className="h-4 w-4" />
                    What You Missed
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <p className="text-xs text-muted-foreground mb-1">Key Hidden Fact</p>
                    <p className="text-sm text-violet-200">{scenario.postmortem.keyHiddenFact}</p>
                  </motion.div>
                  <Separator className="bg-violet-500/20" />
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <p className="text-xs text-muted-foreground mb-1">Missed Opportunity</p>
                    <p className="text-sm text-violet-200/80">{scenario.postmortem.missedOpportunity}</p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* The Master Deal - kept for cases where we don't have "What If" comparison */}
            {!masterEnding && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                <Card className={`bg-amber-500/10 border-amber-500/20 ${endingType === 'master' ? 'sparkle-effect' : ''}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-300">
                      <Crown className="h-4 w-4" />
                      The Master Deal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Best Possible Outcome</p>
                      <p className="text-sm text-amber-200">{scenario.postmortem.bestPossibleDeal}</p>
                    </div>
                    <Separator className="bg-amber-500/20" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Master Solution</p>
                      <p className="text-sm text-amber-200/80">{scenario.postmortem.masterSolution}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Reputation Impact */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400" />
                    Reputation Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{repType.label.split(' ')[0]}</span>
                    <div>
                      <p className="text-sm font-medium">{repType.label}</p>
                      <p className="text-xs text-muted-foreground">{repType.description}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {Object.entries(repDelta).map(([key, delta]) => {
                      const value = delta as number;
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground capitalize">{key}</span>
                          <span className={`text-xs font-bold flex items-center gap-1 ${value > 0 ? 'text-emerald-400' : value < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                            {value > 0 ? <TrendingUp className="h-3 w-3" /> : value < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                            {value > 0 ? '+' : ''}{value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats Improvement */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-cyan-400" />
                    Stats Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {Object.entries(statsDelta).map(([key, delta]) => {
                    const value = delta as number;
                    const currentVal = stats[key as keyof typeof stats] || 0;
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{currentVal}</span>
                          <span className={`text-xs font-bold ${value > 0 ? 'text-emerald-400' : value < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                            {value > 0 ? '+' : ''}{value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Bias Traps - with expandable countermeasures */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}>
              <Card className="bg-amber-500/10 border-amber-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-300">
                    <ShieldAlert className="h-4 w-4" />
                    Bias Traps
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {scenario.biasTraps.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-amber-400/70">
                          {negotiation.biasTrapsTriggered.length} of {scenario.biasTraps.length} traps triggered
                        </span>
                        <div className="flex-1 h-1.5 bg-amber-500/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500/50 rounded-full transition-all duration-500"
                            style={{ width: `${scenario.biasTraps.length > 0 ? (negotiation.biasTrapsTriggered.length / scenario.biasTraps.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      {scenario.biasTraps.map((trap, i) => {
                        const wasTriggered = negotiation.biasTrapsTriggered.includes(trap.id);
                        const isExpanded = expandedTraps.has(trap.id);
                        const BIAS_POSTMORTEM_ICONS: Record<string, string> = {
                          anchor_shock: '⚠️',
                          fixed_pie: '🎯',
                          escalation: '🔥',
                          vividness: '👁️',
                          egocentrism: '🧠',
                          overconfidence: '💎',
                          regret_aversion: '😰',
                        };
                        return (
                          <motion.div
                            key={trap.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.4 + i * 0.1 }}
                            className={`p-3 rounded-lg border transition-colors duration-200 ${
                              wasTriggered
                                ? 'bg-amber-500/10 border-amber-500/30'
                                : 'bg-emerald-500/5 border-emerald-500/20'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-lg shrink-0">{BIAS_POSTMORTEM_ICONS[trap.type] || '⚠️'}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs font-semibold uppercase tracking-wider ${wasTriggered ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {trap.type.replace(/_/g, ' ')}
                                  </span>
                                  {wasTriggered ? (
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-amber-500/20 text-amber-400 border-amber-500/30">
                                      <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                                      Triggered
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                                      Avoided
                                    </Badge>
                                  )}
                                  {/* Expand toggle button */}
                                  <button
                                    onClick={() => toggleTrap(trap.id)}
                                    className="ml-auto shrink-0 p-0.5 rounded hover:bg-amber-500/10 transition-all"
                                  >
                                    <ChevronDown
                                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                  </button>
                                </div>
                                <p className="text-xs text-amber-200/70 mb-1">{trap.description}</p>
                                
                                {/* Expandable countermeasure section */}
                                <div className={`expand-toggle ${isExpanded ? 'expanded' : ''}`}>
                                  <div className="mt-2 p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Sparkles className="h-3 w-3 text-emerald-400" />
                                      <p className="text-[10px] text-emerald-400 font-semibold">Countermeasure</p>
                                    </div>
                                    <p className="text-xs text-emerald-300/80">{trap.countermeasure}</p>
                                  </div>
                                  {wasTriggered && (
                                    <p className="text-[10px] text-amber-400/50 mt-1.5 italic">
                                      This trap was triggered during your negotiation. Apply the countermeasure next time.
                                    </p>
                                  )}
                                  {!wasTriggered && (
                                    <p className="text-[10px] text-emerald-400/50 mt-1.5 italic">
                                      You successfully avoided this trap — keep it up!
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </>
                  ) : (
                    <p className="text-xs text-amber-300/50 text-center py-2">No bias traps defined for this case.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </ScrollArea>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col sm:flex-row justify-center gap-3"
        >
          <Button
            variant="outline"
            onClick={() => setShowTranscript(true)}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Review Transcript
          </Button>
          <Button
            onClick={() => setPhase('dashboard')}
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
          >
            Continue Career
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Transcript Review Dialog */}
      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden sm:max-w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              {scenario.title} — Transcript
            </DialogTitle>
            <DialogDescription>
              Review the full negotiation dialogue for this case
            </DialogDescription>
          </DialogHeader>
          {latestResult && (
            <NegotiationTranscript
              scenarioId={latestResult.scenarioId}
              transcript={latestResult.transcript}
              choicesMade={latestResult.choicesMade}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
