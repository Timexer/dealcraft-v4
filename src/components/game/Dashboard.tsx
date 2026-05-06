'use client';

import { useGameStore } from '@/store/game-store';
import { allScenarios, getScenarioById } from '@/data/scenarios';
import { CATEGORY_COLORS, CATEGORY_LABELS, TIER_NAMES, TIER_DESCRIPTIONS, type Scenario } from '@/data/scenarios/types';
import { getReputationType, getDifficultyLabel, getDifficultyColor } from '@/lib/game-engine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Trophy, Star, ChevronRight, BarChart3, Users, BookOpen, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function Dashboard() {
  const {
    playerName, careerTier, casesCompleted, totalScore, stats,
    reputation, caseResults, unlockedCases, setPhase, setCurrentScenarioId, setCaseAccepted
  } = useGameStore();
  const repType = getReputationType(reputation);
  const tierName = TIER_NAMES[careerTier];
  const tierDesc = TIER_DESCRIPTIONS[careerTier];
  const nextTierThreshold = [3, 8, 15, 22, 30][careerTier - 1] || 30;
  const tierProgress = Math.min(100, (casesCompleted / nextTierThreshold) * 100);

  // Available cases for current tier
  const availableCases = allScenarios.filter(
    s => s.tier <= careerTier && !caseResults.some(r => r.scenarioId === s.id)
  );

  const completedCases = caseResults.length;

  const handleSelectCase = (scenarioId: string) => {
    setCurrentScenarioId(scenarioId);
    setCaseAccepted(false);
    useGameStore.getState().resetInvestigation();
    useGameStore.getState().resetNegotiation();
    useGameStore.getState().setBatnaEstimate(0);
    useGameStore.getState().setReservationEstimate(0);
    useGameStore.getState().setOpeningStrategy('');
    useGameStore.getState().assumptions = [];
    setPhase('intake');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, <span className="text-amber-500">{playerName}</span>
            </h1>
            <p className="text-muted-foreground mt-1">{tierName} — {tierDesc}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setPhase('career')} className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Career Stats
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Tier', value: tierName, icon: Briefcase, color: 'text-amber-500' },
            { label: 'Cases Closed', value: completedCases.toString(), icon: BookOpen, color: 'text-cyan-500' },
            { label: 'Total Score', value: totalScore.toString(), icon: Trophy, color: 'text-emerald-500' },
            { label: 'Reputation', value: repType.label, icon: Users, color: 'text-violet-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="text-lg font-semibold truncate">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tier Progress */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress to {TIER_NAMES[Math.min(careerTier + 1, 5)]}</span>
              <span className="text-sm text-muted-foreground">{casesCompleted}/{nextTierThreshold} cases</span>
            </div>
            <Progress value={tierProgress} className="h-2" />
          </CardContent>
        </Card>

        {/* Available Cases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Available Cases
            </h2>
            <span className="text-sm text-muted-foreground">{availableCases.length} cases available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCases.map((scenario, i) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="bg-card/50 border-border/50 hover:border-amber-500/30 transition-all cursor-pointer group"
                  onClick={() => handleSelectCase(scenario.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{scenario.client.avatar}</span>
                        <div>
                          <CardTitle className="text-base leading-tight">{scenario.title}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">{scenario.subtitle}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0 ${CATEGORY_COLORS[scenario.category]}`}>
                        {CATEGORY_LABELS[scenario.category]}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-2 py-0">
                        Tier {scenario.tier}
                      </Badge>
                      <span className={`text-[10px] font-medium ${getDifficultyColor(getDifficultyLabel(scenario.difficulty))}`}>
                        {getDifficultyLabel(scenario.difficulty)}
                      </span>
                    </div>

                    {scenario.stakesLabel && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>Stakes: {scenario.stakesLabel}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">Fee: €{scenario.fee.toLocaleString()}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {availableCases.length === 0 && (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No cases available. Complete career progression to unlock more!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Completed Cases */}
        {caseResults.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-500" />
              Completed Cases
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {caseResults.map((result, i) => {
                const scenario = getScenarioById(result.scenarioId);
                if (!scenario) return null;
                return (
                  <Card key={i} className="bg-card/30 border-border/30">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{scenario.client.avatar}</span>
                        <div>
                          <p className="text-sm font-medium">{scenario.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{result.outcome.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-amber-500">{result.finalScore}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
