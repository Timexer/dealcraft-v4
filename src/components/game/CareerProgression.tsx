'use client';

import { useEffect, useState } from 'react';
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
  Lock,
  Check,
  ChevronRight,
  Sparkles,
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

const STAT_CATEGORIES = [
  {
    name: 'Core Skills',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/5',
    keys: ['preparation', 'investigation', 'valueClaiming', 'valueCreation'] as const,
  },
  {
    name: 'Soft Skills',
    color: 'text-pink-400',
    borderColor: 'border-pink-500/30',
    bgColor: 'bg-pink-500/5',
    keys: ['emotionalControl', 'relationshipMgmt', 'culturalAwareness'] as const,
  },
  {
    name: 'Advanced',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/5',
    keys: ['powerStrategy', 'ethicalJudgment', 'crisisHandling'] as const,
  },
];

const REP_EMOJIS: Record<string, string> = {
  shark: '🦈',
  architect: '🏗️',
  detective: '🔍',
  diplomat: '🤝',
  closer: '⚡',
  ethicist: '⚖️',
  fixer: '🔧',
};

const REP_COLORS: Record<string, string> = {
  shark: 'bg-red-500',
  architect: 'bg-amber-500',
  detective: 'bg-violet-500',
  diplomat: 'bg-emerald-500',
  closer: 'bg-cyan-500',
  ethicist: 'bg-teal-500',
  fixer: 'bg-orange-500',
};

const REP_LABELS: Record<string, string> = {
  shark: 'The Shark',
  architect: 'The Architect',
  detective: 'The Detective',
  diplomat: 'The Diplomat',
  closer: 'The Closer',
  ethicist: 'The Ethicist',
  fixer: 'The Fixer',
};

const TIER_THRESHOLDS = [3, 8, 15, 22, 30];
const TIER_ICONS = ['💼', '✨', '⭐', '🌟', '👑'];

function getStatColor(value: number): string {
  if (value >= 60) return 'bg-emerald-500';
  if (value >= 30) return 'bg-amber-500';
  return 'bg-red-500';
}

function getStatTextColor(value: number): string {
  if (value >= 60) return 'text-emerald-400';
  if (value >= 30) return 'text-amber-400';
  return 'text-red-400';
}

// Animated stat number counter
function AnimatedStatNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1200;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    // Small delay to let the animation feel intentional
    const timer = setTimeout(() => requestAnimationFrame(animate), 400);
    return () => clearTimeout(timer);
  }, [value]);

  return <span>{display}</span>;
}

export function CareerProgression() {
  const {
    playerName, careerTier, casesCompleted, totalScore,
    stats, reputation, caseResults, achievements,
    setPhase,
  } = useGameStore();

  const tierName = TIER_NAMES[careerTier];
  const tierDesc = TIER_DESCRIPTIONS[careerTier];
  const repType = getReputationType(reputation);
  const nextTierThreshold = TIER_THRESHOLDS[careerTier - 1] || 30;
  const tierProgress = Math.min(100, (casesCompleted / nextTierThreshold) * 100);
  const nextTierName = TIER_NAMES[Math.min(careerTier + 1, 5)];

  // Get top 2 reputation types for profile
  const sortedReps = (Object.entries(reputation) as [keyof typeof reputation, number][])
    .sort((a, b) => b[1] - a[1]);
  const topRep1 = sortedReps[0];
  const topRep2 = sortedReps[1];

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
          {/* Achievement count badge with animated number */}
          <Badge variant="outline" className="ml-auto gap-1.5 border-amber-500/30 text-amber-400 bg-amber-500/10">
            <Sparkles className="h-3.5 w-3.5" />
            <AnimatedStatNumber value={achievements.length} />
            <span className="text-[10px] text-amber-500/60">achievements</span>
          </Badge>
        </motion.div>

        <ScrollArea className="max-h-[calc(100vh-140px)]">
          <div className="space-y-6 pr-2">
            {/* Player Card - Glass Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="glass-card p-6 relative overflow-hidden">
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/3 pointer-events-none" />

                <div className="relative text-center">
                  <div className="text-5xl mb-3">
                    {TIER_ICONS[careerTier - 1]}
                  </div>
                  <h2 className="text-2xl font-bold gradient-text ambient-name-glow">{playerName}</h2>
                  <p className="text-amber-500 font-semibold mt-1">{tierName}</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">{tierDesc}</p>

                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-black"><AnimatedStatNumber value={casesCompleted} /></p>
                      <p className="text-[10px] text-muted-foreground">Cases</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-amber-500"><AnimatedStatNumber value={totalScore} /></p>
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
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden tier-progress-bar breathing-animation">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${tierProgress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Visual Tier Map - with hover trail effect */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-border/30 bg-gradient-to-r from-amber-500/5 to-transparent">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-amber-400" />
                    Career Tier Map
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="relative">
                    {/* Vertical timeline */}
                    {(Object.entries(TIER_NAMES) as [string, string][]).map(([tier, name], idx) => {
                      const tierNum = Number(tier);
                      const isCurrent = tierNum === careerTier;
                      const isUnlocked = tierNum <= careerTier;
                      const isFuture = tierNum > careerTier;
                      const threshold = TIER_THRESHOLDS[tierNum - 1] || 30;
                      const isLast = idx === 4;

                      return (
                        <div key={tier} className={`relative ${isCurrent ? 'tier-hover-trail' : ''}`}>
                          {/* Connector line */}
                          {!isLast && (
                            <div
                              className={`absolute left-[19px] top-[44px] w-0.5 h-[calc(100%-24px)] ${
                                tierNum < careerTier
                                  ? 'bg-emerald-500/40'
                                  : tierNum === careerTier
                                  ? 'bg-gradient-to-b from-amber-500/40 to-amber-500/10'
                                  : 'bg-border/20'
                              }`}
                            />
                          )}

                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            className={`flex items-start gap-4 py-3 ${isLast ? '' : ''}`}
                          >
                            {/* Tier node */}
                            <div className="relative shrink-0">
                              {isCurrent ? (
                                <motion.div
                                  animate={{
                                    boxShadow: [
                                      '0 0 8px oklch(0.77 0.16 75 / 20%), 0 0 20px oklch(0.77 0.16 75 / 10%)',
                                      '0 0 16px oklch(0.77 0.16 75 / 40%), 0 0 40px oklch(0.77 0.16 75 / 20%)',
                                      '0 0 8px oklch(0.77 0.16 75 / 20%), 0 0 20px oklch(0.77 0.16 75 / 10%)',
                                    ],
                                  }}
                                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                  className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center"
                                >
                                  <span className="text-base">{TIER_ICONS[tierNum - 1]}</span>
                                </motion.div>
                              ) : isUnlocked ? (
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-emerald-400" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-muted/20 border-2 border-border/30 flex items-center justify-center">
                                  <Lock className="h-4 w-4 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>

                            {/* Tier info */}
                            <div className="flex-1 min-w-0 pt-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm font-semibold ${
                                  isCurrent ? 'text-amber-400' : isUnlocked ? 'text-emerald-400' : 'text-muted-foreground/50'
                                }`}>
                                  Tier {tier}: {name}
                                </span>
                                {isCurrent && (
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-amber-500/20 text-amber-400 border-amber-500/30">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <p className={`text-[10px] mt-0.5 ${
                                isFuture ? 'text-muted-foreground/30' : 'text-muted-foreground/60'
                              }`}>
                                {TIER_DESCRIPTIONS[tierNum]}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[9px] text-muted-foreground/40">{threshold} cases</span>
                                {isUnlocked && tierNum < careerTier && (
                                  <span className="text-[9px] text-emerald-400/60">✅ Completed</span>
                                )}
                                {isCurrent && (
                                  <span className="text-[9px] text-amber-400/60">{casesCompleted}/{threshold}</span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats - Categorized with animated bars */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-border/30 bg-gradient-to-r from-cyan-500/5 to-transparent">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    Player Stats
                  </h3>
                </div>
                <div className="p-4 sm:p-6 space-y-5">
                  {STAT_CATEGORIES.map((category, catIdx) => (
                    <div key={category.name}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${category.color}`}>
                          {category.name}
                        </span>
                        <div className={`flex-1 h-px ${category.borderColor} opacity-30`} />
                      </div>
                      <div className="space-y-3">
                        {category.keys.map((key, i) => {
                          const value = stats[key] || 0;
                          const Icon = STAT_ICONS[key] || Target;
                          const label = STAT_LABELS[key] || key;
                          const globalIdx = catIdx * 4 + i;
                          return (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + globalIdx * 0.05 }}
                              className="space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <Icon className="h-3.5 w-3.5" />
                                  {label}
                                </span>
                                <span className={`text-xs font-bold ${getStatTextColor(value)}`}>
                                  <AnimatedStatNumber value={value} />/100
                                </span>
                              </div>
                              <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-full ${getStatColor(value)}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${value}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 + globalIdx * 0.05 }}
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      {catIdx < STAT_CATEGORIES.length - 1 && (
                        <Separator className="mt-4 opacity-30" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Reputation - Enhanced with shimmer bars */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-border/30 bg-gradient-to-r from-violet-500/5 to-transparent">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4 text-violet-400" />
                    Reputation Profile
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  {/* Profile Summary */}
                  <div className="text-center mb-5 p-4 rounded-xl bg-gradient-to-br from-violet-500/5 via-transparent to-amber-500/5 border border-violet-500/10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-3xl">{REP_EMOJIS[topRep1[0]]}</span>
                      <span className="text-lg">+</span>
                      <span className="text-2xl">{REP_EMOJIS[topRep2[0]]}</span>
                    </div>
                    <h4 className="text-sm font-bold gradient-text mb-1">Your Negotiator Profile</h4>
                    <p className="text-xs text-muted-foreground">
                      {REP_LABELS[topRep1[0]]} + {REP_LABELS[topRep2[0]]}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{repType.description}</p>
                  </div>

                  {/* Dominant Reputation Highlight */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 relative overflow-hidden sparkle-effect"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative flex items-center gap-3">
                      <motion.span
                        className="text-3xl"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {REP_EMOJIS[topRep1[0]]}
                      </motion.span>
                      <div>
                        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Dominant Style</p>
                        <p className="text-sm font-bold">{REP_LABELS[topRep1[0]]}</p>
                        <p className="text-[10px] text-muted-foreground">{topRep1[1]} points</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Horizontal Bar Chart with shimmer */}
                  <div className="space-y-3">
                    {(Object.entries(reputation) as [keyof typeof reputation, number][]).map(([key, value], i) => {
                      const isTop = key === topRep1[0];
                      const isSecond = key === topRep2[0];
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + i * 0.05 }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base w-6 text-center shrink-0">{REP_EMOJIS[key]}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className={`text-xs capitalize ${isTop ? 'font-bold text-amber-400' : isSecond ? 'font-semibold text-violet-300' : 'text-muted-foreground'}`}>
                                  {key}
                                  {isTop && <span className="ml-1 text-[9px] text-amber-500">#1</span>}
                                  {isSecond && <span className="ml-1 text-[9px] text-violet-400">#2</span>}
                                </span>
                                <span className="text-xs font-bold">{value}</span>
                              </div>
                              <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-full ${REP_COLORS[key] || 'bg-violet-500'} reputation-shimmer`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, Math.max(value, 0))}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.8 + i * 0.05 }}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Completed Cases */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-border/30 bg-gradient-to-r from-emerald-500/5 to-transparent">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-emerald-400" />
                    Completed Cases
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
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
                            transition={{ delay: 0.6 + i * 0.05 }}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-background/50 border border-border/30 hover:border-amber-500/20 transition-colors sealed-card"
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
                </div>
              </div>
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
