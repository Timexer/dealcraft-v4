'use client';

import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { TIER_NAMES, TIER_DESCRIPTIONS } from '@/data/scenarios/types';
import { getReputationType, getScoreGrade } from '@/lib/game-engine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  Briefcase,
  Star,
  BarChart3,
  Target,
  Shield,
  Heart,
  Brain,
  Scale,
  Zap,
  Users,
  AlertTriangle,
  Globe,
} from 'lucide-react';

const STAT_ICONS: Record<string, React.ElementType> = {
  preparation: Target,
  valueClaiming: BarChart3,
  valueCreation: Zap,
  investigation: Shield,
  emotionalControl: Heart,
  ethicalJudgment: Scale,
  powerStrategy: Brain,
  relationshipMgmt: Users,
  crisisHandling: AlertTriangle,
  culturalAwareness: Globe,
};

const STAT_LABELS: Record<string, string> = {
  preparation: 'Preparation',
  valueClaiming: 'Value Claiming',
  valueCreation: 'Value Creation',
  investigation: 'Investigation',
  emotionalControl: 'Emotional Control',
  ethicalJudgment: 'Ethical Judgment',
  powerStrategy: 'Power Strategy',
  relationshipMgmt: 'Relationship Mgmt',
  crisisHandling: 'Crisis Handling',
  culturalAwareness: 'Cultural Awareness',
};

const REP_EMOJIS: Record<string, string> = {
  shark: '🦈',
  architect: '🏗️',
  detective: '🔍',
  diplomat: '🤝',
  closer: '⚡',
  ethicist: '⚖️',
  fixer: '🔧',
};

export function CareerProgression() {
  const {
    playerName, careerTier, casesCompleted, totalScore,
    stats, reputation, caseResults,
    setPhase,
  } = useGameStore();

  const tierName = TIER_NAMES[careerTier];
  const tierDesc = TIER_DESCRIPTIONS[careerTier];
  const repType = getReputationType(reputation);
  const nextTierThreshold = [3, 8, 15, 22, 30][careerTier - 1] || 30;
  const tierProgress = Math.min(100, (casesCompleted / nextTierThreshold) * 100);
  const nextTierName = TIER_NAMES[Math.min(careerTier + 1, 5)];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
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
          <h1 className="text-xl sm:text-2xl font-bold">Career Progression</h1>
        </motion.div>

        <ScrollArea className="max-h-[calc(100vh-140px)]">
          <div className="space-y-6 pr-2">
            {/* Player Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-5xl mb-3">
                      {careerTier >= 5 ? '👑' : careerTier >= 4 ? '🌟' : careerTier >= 3 ? '⭐' : careerTier >= 2 ? '✨' : '💼'}
                    </div>
                    <h2 className="text-2xl font-bold">{playerName}</h2>
                    <p className="text-amber-500 font-semibold mt-1">{tierName}</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">{tierDesc}</p>

                    <div className="flex items-center justify-center gap-6 mt-4">
                      <div className="text-center">
                        <p className="text-2xl font-black">{casesCompleted}</p>
                        <p className="text-[10px] text-muted-foreground">Cases</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-amber-500">{totalScore}</p>
                        <p className="text-[10px] text-muted-foreground">Total Score</p>
                      </div>
                    </div>

                    {/* Tier Progress */}
                    {careerTier < 5 && (
                      <div className="mt-4 max-w-sm mx-auto">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">Progress to {nextTierName}</span>
                          <span className="text-[10px] text-muted-foreground">{casesCompleted}/{nextTierThreshold}</span>
                        </div>
                        <Progress value={tierProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-amber-400" />
                    Player Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {(Object.entries(stats) as [keyof typeof stats, number][]).map(([key, value], i) => {
                    const Icon = STAT_ICONS[key] || Target;
                    const label = STAT_LABELS[key] || key;
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                          </span>
                          <span className="text-xs font-bold">{value}/100</span>
                        </div>
                        <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-amber-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 + i * 0.05 }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Reputation */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4 text-violet-400" />
                    Reputation
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {repType.label} — {repType.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {(Object.entries(reputation) as [keyof typeof reputation, number][]).map(([key, value], i) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span>{REP_EMOJIS[key]}</span>
                          <span className="capitalize">{key}</span>
                        </span>
                        <span className="text-xs font-bold">{value}</span>
                      </div>
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-violet-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, value)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 + i * 0.05 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Completed Cases */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-emerald-400" />
                    Completed Cases
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {caseResults.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {caseResults.map((result, i) => {
                        const caseScenario = getScenarioById(result.scenarioId);
                        const grade = getScoreGrade(result.finalScore);
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + i * 0.05 }}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-background/50 border border-border/30"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{caseScenario?.client.avatar || '📁'}</span>
                              <div>
                                <p className="text-sm font-medium">{caseScenario?.title || result.scenarioId}</p>
                                <p className="text-[10px] text-muted-foreground capitalize">{result.outcome.replace(/_/g, ' ')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{result.finalScore}</span>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${GRADE_COLORS_BG[grade.grade] || ''}`}>
                                {grade.grade}
                              </Badge>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No cases completed yet.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Tier Advancement */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-amber-400" />
                    Tier Advancement
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {(Object.entries(TIER_NAMES) as [string, string][]).map(([tier, name]) => {
                      const tierNum = Number(tier);
                      const isCurrent = tierNum === careerTier;
                      const isUnlocked = tierNum <= careerTier;
                      const threshold = [3, 8, 15, 22, 30][tierNum - 1] || 30;

                      return (
                        <div
                          key={tier}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                            isCurrent
                              ? 'bg-amber-500/10 border-amber-500/30'
                              : isUnlocked
                              ? 'bg-emerald-500/5 border-emerald-500/20'
                              : 'bg-background/30 border-border/20 opacity-50'
                          }`}
                        >
                          <span className="text-lg">
                            {isUnlocked ? '✅' : '🔒'}
                          </span>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${isCurrent ? 'text-amber-400' : ''}`}>
                              Tier {tier}: {name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {TIER_DESCRIPTIONS[tierNum]} — {threshold} cases required
                            </p>
                          </div>
                          {isCurrent && (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30">
                              Current
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

const GRADE_COLORS_BG: Record<string, string> = {
  S: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  A: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  B: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  C: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  D: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  F: 'bg-red-500/20 text-red-400 border-red-500/30',
};
