'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { CATEGORY_COLORS, CATEGORY_LABELS, type EndingScores } from '@/data/scenarios/types';
import { calculateFinalScore, getScoreGrade, getReputationType, calculateReputationDelta, calculateStatsDelta } from '@/lib/game-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
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
} from 'lucide-react';

const SCORE_DIMENSIONS: { key: keyof EndingScores; label: string; color: string }[] = [
  { key: 'clientEconomicValue', label: 'Client Economic Value', color: 'bg-amber-500' },
  { key: 'jointValueCreated', label: 'Joint Value Created', color: 'bg-emerald-500' },
  { key: 'infoDiscovered', label: 'Info Discovered', color: 'bg-violet-500' },
  { key: 'relationshipPreserved', label: 'Relationship Preserved', color: 'bg-pink-500' },
  { key: 'ethicalIntegrity', label: 'Ethical Integrity', color: 'bg-teal-500' },
  { key: 'strategicDiscipline', label: 'Strategic Discipline', color: 'bg-cyan-500' },
];

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

function AnimatedBar({ value, delay = 0 }: { value: number; delay?: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), delay + 200);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: delay / 1000 }}
      />
    </div>
  );
}

export function Postmortem() {
  const {
    currentScenarioId, setPhase,
    caseResults, negotiation,
    discoveredFacts, stats, addStats,
    reputation, addReputation,
  } = useGameStore();

  const scenario = currentScenarioId ? getScenarioById(currentScenarioId) : null;
  const latestResult = caseResults[caseResults.length - 1];

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

  // Calculate deltas
  const repDelta = calculateReputationDelta(scenario, endingType);
  const totalInfo = scenario.investigationActions.reduce((sum, a) => sum + a.reveals.length, 0);
  const infoFound = (negotiation.informationRevealed?.length || 0) + discoveredFacts.length;
  const statsDelta = calculateStatsDelta(scenario, endingType, infoFound, totalInfo);

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
            {/* Score Card */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Card className="bg-card/50 border-border/50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Grade Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                      className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${GRADE_COLORS[grade.grade]}`}
                    >
                      <span className="text-4xl font-black">{grade.grade}</span>
                    </motion.div>

                    {/* Score & Description */}
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                        <span className="text-4xl font-black">
                          <AnimatedNumber value={finalScore} />
                        </span>
                        <span className="text-lg text-muted-foreground">/100</span>
                      </div>
                      <p className={`text-sm font-medium mt-1 ${grade.color}`}>{grade.description}</p>
                      <p className="text-sm text-muted-foreground mt-2">{ending.description}</p>
                      <p className="text-xs text-muted-foreground mt-1 italic">{ending.longTermConsequence}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Radar Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Hexagon className="h-4 w-4 text-amber-400" />
                    Performance Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="w-full h-[300px] sm:h-[340px]">
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

            {/* Score Dimensions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {SCORE_DIMENSIONS.map((dim, i) => (
                    <div key={dim.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{dim.label}</span>
                        <span className="text-xs font-bold">
                          <AnimatedNumber value={latestResult.scores[dim.key]} duration={1200} />
                        </span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${dim.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${latestResult.scores[dim.key]}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 + i * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* What You Missed */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
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

            {/* The Master Deal */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Card className="bg-amber-500/10 border-amber-500/20">
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

            {/* Lesson Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
              <Card className="bg-emerald-500/10 border-emerald-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-400 mb-1">Key Takeaway</p>
                      <p className="text-sm text-emerald-200 italic font-medium">
                        &ldquo;{scenario.postmortem.lesson}&rdquo;
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reputation Impact */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>
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
          </div>
        </ScrollArea>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="flex justify-center"
        >
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
    </div>
  );
}
