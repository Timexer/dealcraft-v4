'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { allScenarios, getScenarioById } from '@/data/scenarios';
import { CATEGORY_COLORS, CATEGORY_LABELS, TIER_NAMES, TIER_DESCRIPTIONS } from '@/data/scenarios/types';
import { getReputationType, getDifficultyLabel, getDifficultyColor, getScoreGrade } from '@/lib/game-engine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Briefcase, Trophy, Star, ChevronRight, BarChart3, Users, BookOpen, TrendingUp, RotateCcw, Award, Search, Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { AchievementGallery } from './AchievementGallery';
import { ChallengeModeSelector } from './ChallengeModeSelector';
import { Input } from '@/components/ui/input';
import { useSound } from '@/hooks/use-sound';

export function Dashboard() {
  const {
    playerName, careerTier, casesCompleted, totalScore, stats,
    reputation, caseResults, unlockedCases, setPhase, setCurrentScenarioId, setCaseAccepted,
    setIsReplay, achievements,
  } = useGameStore();
  const repType = getReputationType(reputation);
  const tierName = TIER_NAMES[careerTier];
  const tierDesc = TIER_DESCRIPTIONS[careerTier];
  const nextTierThreshold = [3, 8, 15, 22, 30][careerTier - 1] || 30;
  const tierProgress = Math.min(100, (casesCompleted / nextTierThreshold) * 100);

  // Achievement gallery dialog state
  const [showAchievements, setShowAchievements] = useState(false);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Challenge mode dialog state
  const [showChallengeMode, setShowChallengeMode] = useState(false);
  const [pendingScenarioId, setPendingScenarioId] = useState<string | null>(null);

  // Sound effects
  const { playClick, playNegotiation } = useSound();

  // Available cases for current tier (excluding completed ones)
  const availableCases = allScenarios.filter(
    s => s.tier <= careerTier && !caseResults.some(r => r.scenarioId === s.id)
  );

  // Filtered cases based on search and category
  const filteredCases = availableCases.filter(s => {
    const matchesSearch = !searchQuery || 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || s.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from available cases
  const availableCategories = [...new Set(availableCases.map(s => s.category))];

  const completedCases = caseResults.length;

  const handleSelectCase = (scenarioId: string) => {
    // Show challenge mode selector first
    playClick();
    setPendingScenarioId(scenarioId);
    setShowChallengeMode(true);
  };

  const handleProceedWithCase = () => {
    if (!pendingScenarioId) return;
    const scenarioId = pendingScenarioId;
    playNegotiation();
    setCurrentScenarioId(scenarioId);
    setCaseAccepted(false);
    setIsReplay(false);
    useGameStore.getState().resetInvestigation();
    useGameStore.getState().resetNegotiation();
    useGameStore.getState().setBatnaEstimate(0);
    useGameStore.getState().setReservationEstimate(0);
    useGameStore.getState().setOpeningStrategy('');
    useGameStore.getState().assumptions = [];
    useGameStore.getState().setChallengeTimer(0);
    setShowChallengeMode(false);
    setPendingScenarioId(null);
    setPhase('intake');
  };

  const handleReplayCase = (scenarioId: string) => {
    playClick();
    setCurrentScenarioId(scenarioId);
    setCaseAccepted(false);
    setIsReplay(true);
    useGameStore.getState().resetInvestigation();
    useGameStore.getState().resetNegotiation();
    useGameStore.getState().setBatnaEstimate(0);
    useGameStore.getState().setReservationEstimate(0);
    useGameStore.getState().setOpeningStrategy('');
    useGameStore.getState().assumptions = [];
    setPhase('intake');
  };

  const GRADE_BADGE_COLORS: Record<string, string> = {
    S: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    A: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    B: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    C: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    D: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    F: 'bg-red-500/20 text-red-400 border-red-500/40',
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
              Welcome back, <span className="gradient-text ambient-name-glow">{playerName}</span>
            </h1>
            <p className="text-muted-foreground mt-1">{tierName} — {tierDesc}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowAchievements(true)} className="gap-1.5 sm:gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Achievements</span>
              <span className="sm:hidden">{achievements.length}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPhase('career')} className="gap-1.5 sm:gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Career Stats</span>
              <span className="sm:hidden">Stats</span>
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview - Glassmorphism cards with animated borders */}
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
              <Card className="glass-card animated-border hover:border-amber-500/20 transition-all duration-200">
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

        {/* Tier Progress - with breathing animation + animated gradient */}
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress to {TIER_NAMES[Math.min(careerTier + 1, 5)]}</span>
              <span className="text-sm text-muted-foreground">{casesCompleted}/{nextTierThreshold} cases</span>
            </div>
            <div className="tier-progress-bar rounded-full overflow-hidden breathing-animation">
              <Progress value={tierProgress} className="h-2.5" />
            </div>
          </CardContent>
        </Card>

        {/* Available Cases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Available Cases
              <span className="ml-1 text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                {filteredCases.length} of {availableCases.length} available
              </span>
            </h2>
          </div>

          {/* Search & Filter Bar with focus glow */}
          {availableCases.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 search-focus-glow rounded-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cases by title, subtitle, or client..."
                  className="pl-9 bg-card/50 border-border/50 h-9 text-sm focus:border-amber-500/50 focus:ring-amber-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {availableCategories.length > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
                      filterCategory === 'all'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-card/50 text-muted-foreground border-border/30 hover:border-amber-500/20'
                    }`}
                  >
                    All
                  </button>
                  {availableCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
                        filterCategory === cat
                          ? CATEGORY_COLORS[cat]
                          : 'bg-card/50 text-muted-foreground border-border/30 hover:border-amber-500/20'
                      }`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCases.map((scenario, i) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="game-card card-hover-lift cursor-pointer group hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200"
                  onClick={() => handleSelectCase(scenario.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{scenario.client.avatar}</span>
                        <div>
                          <CardTitle className="text-base leading-tight group-hover:text-amber-500 transition-colors duration-200">{scenario.title}</CardTitle>
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
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-medium ${getDifficultyColor(getDifficultyLabel(scenario.difficulty))}`}>
                          {getDifficultyLabel(scenario.difficulty)}
                        </span>
                        <div className="flex items-center">
                          {(() => {
                            const avgDifficulty = (
                              scenario.difficulty.economicComplexity +
                              scenario.difficulty.emotionalComplexity +
                              scenario.difficulty.ethicalComplexity +
                              scenario.difficulty.informationAsymmetry +
                              scenario.difficulty.powerImbalance +
                              scenario.difficulty.timePressure +
                              scenario.difficulty.relationshipStakes
                            ) / 7;
                            const starRating = Math.round(avgDifficulty);
                            return Array.from({ length: 5 }).map((_, starIdx) => (
                              <Star
                                key={starIdx}
                                className={`h-3 w-3 ${starIdx < starRating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
                              />
                            ));
                          })()}
                        </div>
                      </div>
                    </div>

                    {scenario.stakesLabel && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>Stakes: {scenario.stakesLabel}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">Fee: €{scenario.fee.toLocaleString()}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all duration-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredCases.length === 0 && availableCases.length > 0 && (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No cases match your search. Try a different query or category.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => { setSearchQuery(''); setFilterCategory('all'); }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {availableCases.length === 0 && (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No new cases available. Complete career progression to unlock more, or replay completed cases!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Completed Cases - with sealed stamp effect */}
        {caseResults.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-500" />
              Completed Cases
              <span className="ml-1 text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                {caseResults.length} closed
              </span>
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {caseResults.map((result, i) => {
                const scenario = getScenarioById(result.scenarioId);
                if (!scenario) return null;
                const grade = getScoreGrade(result.finalScore);
                return (
                  <motion.div
                    key={result.scenarioId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className="bg-card/30 border-border/30 hover:bg-card/50 hover:border-amber-500/15 transition-all duration-200 sealed-card">
                      <CardContent className="p-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-xl shrink-0">{scenario.client.avatar}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{scenario.title}</p>
                            <p className="text-xs text-muted-foreground capitalize">{result.outcome.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-amber-500">{result.finalScore}</p>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-bold ${GRADE_BADGE_COLORS[grade.grade]}`}>
                                {grade.grade}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReplayCase(result.scenarioId);
                            }}
                            className="h-8 px-2 gap-1 text-xs text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                            title="Replay this case"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Replay</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Challenge Mode Dialog */}
      <Dialog open={showChallengeMode} onOpenChange={setShowChallengeMode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Start Case
            </DialogTitle>
            <DialogDescription>
              Choose a challenge mode before starting this case
            </DialogDescription>
          </DialogHeader>
          <ChallengeModeSelector />
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowChallengeMode(false);
                setPendingScenarioId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold premium-button"
              onClick={handleProceedWithCase}
            >
              Start Case
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievement Gallery Dialog */}
      <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto sm:max-w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Achievement Gallery
            </DialogTitle>
            <DialogDescription>
              Track your negotiation milestones and accomplishments
            </DialogDescription>
          </DialogHeader>
          <AchievementGallery />
        </DialogContent>
      </Dialog>
    </div>
  );
}
