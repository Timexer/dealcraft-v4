'use client';

import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '@/store/game-store';
import { allScenarios, getScenarioById } from '@/data/scenarios';
import { CATEGORY_COLORS, CATEGORY_LABELS, TIER_NAMES, TIER_DESCRIPTIONS } from '@/data/scenarios/types';
import { getReputationType, getDifficultyLabel, getDifficultyColor, getScoreGrade } from '@/lib/game-engine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Briefcase, Trophy, Star, ChevronRight, BarChart3, Users, BookOpen, TrendingUp, RotateCcw, Award, Search, Filter, X, Clock, Activity, Zap, History, FileText, Crown, Handshake, Shield, AlertTriangle, Footprints, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaseResult, EndingScores } from '@/data/scenarios/types';
import { AchievementGallery } from './AchievementGallery';
import { ChallengeModeSelector } from './ChallengeModeSelector';
import { StreakIndicator } from './StreakIndicator';
import { NegotiationTranscript } from './NegotiationTranscript';
import { Input } from '@/components/ui/input';
import { useSound } from '@/hooks/use-sound';

// Category distribution color map for mini chart
const CATEGORY_BAR_COLORS: Record<string, string> = {
  fundamentals: 'bg-emerald-500',
  hidden_interests: 'bg-violet-500',
  multi_issue: 'bg-cyan-500',
  deadline: 'bg-orange-500',
  deception: 'bg-red-500',
  power_imbalance: 'bg-amber-500',
  relationship: 'bg-pink-500',
  ugly: 'bg-rose-500',
  ethics: 'bg-teal-500',
  master: 'bg-yellow-500',
};

// Stat card gradient backgrounds matching the stat theme
const STAT_GRADIENTS = [
  'from-cyan-500/8 via-cyan-500/3 to-transparent',
  'from-emerald-500/8 via-emerald-500/3 to-transparent',
  'from-violet-500/8 via-violet-500/3 to-transparent',
];

// Outcome badge configuration
const OUTCOME_BADGE_CONFIG: Record<string, { color: string; icon: typeof Crown; label: string }> = {
  master: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', icon: Crown, label: 'Master' },
  cooperative: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', icon: Handshake, label: 'Cooperative' },
  hard_bargain: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/40', icon: Shield, label: 'Hard Bargain' },
  bad_deal: { color: 'bg-red-500/20 text-red-400 border-red-500/40', icon: AlertTriangle, label: 'Bad Deal' },
  strategic_no_deal: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40', icon: Footprints, label: 'Strategic No Deal' },
  ethical_failure: { color: 'bg-rose-500/20 text-rose-400 border-rose-500/40', icon: AlertTriangle, label: 'Ethical Failure' },
  no_deal_bad: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/40', icon: AlertTriangle, label: 'No Deal (Bad)' },
};

// SVG Circular Progress Ring Component
function CircularProgress({ value, size = 80, strokeWidth = 4, color = '#f59e0b', animate = true }: { value: number; size?: number; strokeWidth?: number; color?: string; animate?: boolean }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value, animate]);

  // If not animating, just use the value directly
  const displayValue = animate ? animatedValue : value;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - displayValue / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
        opacity={0.3}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

// Score Trend Indicator Component
function ScoreTrend({ currentScore, previousScore }: { currentScore: number; previousScore?: number }) {
  if (previousScore === undefined) return null;
  const diff = currentScore - previousScore;
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span>0</span>
      </span>
    );
  }
  const isUp = diff > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      <span>{isUp ? '+' : ''}{diff}</span>
    </span>
  );
}

// Outcome Badge Component
function OutcomeBadge({ outcome }: { outcome: string }) {
  const config = OUTCOME_BADGE_CONFIG[outcome];
  if (!config) {
    return (
      <Badge variant="outline" className="text-[11px] px-2 py-0 capitalize">
        {outcome.replace(/_/g, ' ')}
      </Badge>
    );
  }
  const IconComponent = config.icon;
  return (
    <Badge variant="outline" className={`text-[11px] px-2 py-0.5 gap-1 ${config.color}`}>
      <IconComponent className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

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

  // Transcript dialog state
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptScenarioId, setTranscriptScenarioId] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Challenge mode dialog state
  const [showChallengeMode, setShowChallengeMode] = useState(false);
  const [pendingScenarioId, setPendingScenarioId] = useState<string | null>(null);

  // Case detail sheet state
  const [detailCaseId, setDetailCaseId] = useState<string | null>(null);

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

  // Recent Activity: last 3 completed cases with scores and grade badges
  const recentActivity = useMemo(() => {
    return caseResults.slice(-3).reverse().map(result => {
      const scenario = getScenarioById(result.scenarioId);
      if (!scenario) return null;
      const grade = getScoreGrade(result.finalScore);
      return { result, scenario, grade };
    }).filter(Boolean) as { result: typeof caseResults[0]; scenario: NonNullable<ReturnType<typeof getScenarioById>>; grade: ReturnType<typeof getScoreGrade> }[];
  }, [caseResults]);

  // Category distribution for mini chart
  const categoryDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    caseResults.forEach(result => {
      const scenario = getScenarioById(result.scenarioId);
      if (scenario) {
        dist[scenario.category] = (dist[scenario.category] || 0) + 1;
      }
    });
    return Object.entries(dist).sort((a, b) => b[1] - a[1]);
  }, [caseResults]);

  // Session progress indicator - cases completed this session
  // We use caseResults.length as a proxy since we track total completions
  const sessionProgress = useMemo(() => {
    return {
      completed: caseResults.length,
      total: allScenarios.length,
      percentage: allScenarios.length > 0 ? Math.round((caseResults.length / allScenarios.length) * 100) : 0,
    };
  }, [caseResults.length]);

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

  // Score dimension labels for the detail sheet
  const SCORE_DIMENSIONS: { key: keyof EndingScores; label: string }[] = [
    { key: 'clientEconomicValue', label: 'Client Economic Value' },
    { key: 'jointValueCreated', label: 'Joint Value Created' },
    { key: 'infoDiscovered', label: 'Info Discovered' },
    { key: 'relationshipPreserved', label: 'Relationship Preserved' },
    { key: 'ethicalIntegrity', label: 'Ethical Integrity' },
    { key: 'strategicDiscipline', label: 'Strategic Discipline' },
  ];

  // Find the selected case result for the detail sheet
  const detailCaseResult = detailCaseId ? caseResults.find(r => r.scenarioId === detailCaseId) : null;
  const detailScenario = detailCaseResult ? getScenarioById(detailCaseResult.scenarioId) : null;
  const detailGrade = detailCaseResult ? getScoreGrade(detailCaseResult.finalScore) : null;

  // Helper: score bar color based on value
  const getScoreBarColor = (value: number) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getScoreBarBg = (value: number) => {
    if (value >= 80) return 'bg-emerald-500/20';
    if (value >= 50) return 'bg-amber-500/20';
    return 'bg-red-500/20';
  };

  const GRADE_BADGE_COLORS: Record<string, string> = {
    S: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    A: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    B: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    C: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    D: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    F: 'bg-red-500/20 text-red-400 border-red-500/40',
  };

  const GRADE_ICON_MAP: Record<string, string> = {
    S: '👑',
    A: '🌟',
    B: '⭐',
    C: '✓',
    D: '↑',
    F: '✗',
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
              Welcome back, <span className="gradient-text-themed ambient-name-glow">{playerName}</span>
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground">{tierName} — {tierDesc}</p>
              <StreakIndicator compact />
            </div>
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
            {caseResults.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setPhase('case_history')} className="gap-1.5 sm:gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            )}
            {/* Reset is available via the header reset button (↻ icon) */}
          </div>
        </motion.div>

        {/* Stats Overview - Visual Tier Badge + stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Visual Tier Badge - replacing plain Tier card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="fade-scale-in"
          >
            <Card className="glass-card animated-border hover:border-amber-500/20 transition-all duration-200 bg-gradient-to-br from-amber-500/10 via-amber-500/4 to-transparent">
              <CardContent className="p-4 flex items-center gap-3">
                {/* Circular progress ring showing tier progress */}
                <div className="relative shrink-0">
                  <CircularProgress value={tierProgress} size={56} strokeWidth={4} color="#f59e0b" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-lg font-bold bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent">
                      {careerTier}
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Tier</span>
                  <p className="text-sm font-semibold truncate bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    {tierName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{Math.round(tierProgress)}% to next</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Remaining stat cards */}
          {[
            { label: 'Cases Closed', value: completedCases.toString(), icon: BookOpen, color: 'text-cyan-500', gradient: STAT_GRADIENTS[0] },
            { label: 'Total Score', value: totalScore.toString(), icon: Trophy, color: 'text-emerald-500', gradient: STAT_GRADIENTS[1] },
            { label: 'Reputation', value: repType.label, icon: Users, color: 'text-violet-500', gradient: STAT_GRADIENTS[2] },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + 1) * 0.1 }}
              className="fade-scale-in"
            >
              <Card className={`glass-card animated-border hover:border-amber-500/20 transition-all duration-200 bg-gradient-to-br ${stat.gradient}`}>
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

        {/* Weekly Progress + Category Distribution - side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tier Progress + Completion Ring - with breathing animation + animated gradient */}
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Progress to {TIER_NAMES[Math.min(careerTier + 1, 5)]}
                </span>
                <span className="text-sm text-muted-foreground">{casesCompleted}/{nextTierThreshold} cases</span>
              </div>
              <div className="tier-progress-bar rounded-full overflow-hidden breathing-animation">
                <Progress value={tierProgress} className="h-2.5" />
              </div>
              {/* Session Progress + Completion Ring */}
              <div className="mt-3 flex items-center gap-3">
                <div className="relative shrink-0">
                  <CircularProgress value={sessionProgress.percentage} size={36} strokeWidth={3} color="#f59e0b" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[11px] font-bold text-amber-500">{sessionProgress.percentage}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="weekly-pulse h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-xs text-muted-foreground">
                    {sessionProgress.completed} of {sessionProgress.total} total cases completed
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution Mini Chart */}
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-amber-500" />
                  Category Distribution
                </span>
                {caseResults.length > 0 && (
                  <span className="text-xs text-muted-foreground">{caseResults.length} cases</span>
                )}
              </div>
              {categoryDistribution.length > 0 ? (
                <div className="space-y-2">
                  {/* Mini bar chart */}
                  <div className="category-dist-bar">
                    {categoryDistribution.map(([cat, count]) => (
                      <div
                        key={cat}
                        className={`segment ${CATEGORY_BAR_COLORS[cat] || 'bg-amber-500'}`}
                        style={{ width: `${(count / caseResults.length) * 100}%` }}
                      />
                    ))}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {categoryDistribution.map(([cat, count]) => (
                      <div key={cat} className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${CATEGORY_BAR_COLORS[cat] || 'bg-amber-500'}`} />
                        <span className="text-[11px] text-muted-foreground">{CATEGORY_LABELS[cat]} ({count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Complete cases to see distribution</p>
              )}
            </CardContent>
          </Card>
        </div>

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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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
                    className={`text-[11px] px-2 py-1 rounded-full border transition-all ${
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
                      className={`text-[11px] px-2 py-1 rounded-full border transition-all ${
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
                      <Badge variant="outline" className={`text-[11px] px-2 py-0 ${CATEGORY_COLORS[scenario.category]}`}>
                        {CATEGORY_LABELS[scenario.category]}
                      </Badge>
                      <Badge variant="outline" className="text-[11px] px-2 py-0">
                        Tier {scenario.tier}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <span className={`text-[11px] font-medium ${getDifficultyColor(getDifficultyLabel(scenario.difficulty))}`}>
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
                                className={`h-3 w-3 ${starIdx < starRating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`}
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
                    <Card
                      className="bg-card/30 border-border/30 hover:bg-card/50 hover:border-amber-500/15 transition-all duration-200 sealed-card cursor-pointer"
                      onClick={() => {
                        playClick();
                        setDetailCaseId(result.scenarioId);
                      }}
                    >
                      <CardContent className="p-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-xl shrink-0">{scenario.client.avatar}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{scenario.title}</p>
                            <OutcomeBadge outcome={result.outcome} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-amber-500">{result.finalScore}</p>
                              <Badge variant="outline" className={`text-[11px] px-1.5 py-0 font-bold ${GRADE_BADGE_COLORS[grade.grade]}`}>
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
                              setTranscriptScenarioId(result.scenarioId);
                              setShowTranscript(true);
                            }}
                            className="h-8 px-2 gap-1 text-xs text-muted-foreground hover:text-cyan-500 hover:bg-cyan-500/10"
                            title="Review transcript"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
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

        {/* Recent Activity Section */}
        {recentActivity.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Recent Activity
              <span className="ml-1 text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Last {recentActivity.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <AnimatePresence>
                {recentActivity.map((item, i) => (
                  <motion.div
                    key={item.result.scenarioId}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="fade-scale-in"
                  >
                    <Card className="glass-card-hover overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{item.scenario.client.avatar}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.scenario.title}</p>
                            <OutcomeBadge outcome={item.result.outcome} />
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className={`text-xs font-bold px-2 py-0.5 ${GRADE_BADGE_COLORS[item.grade.grade]}`}>
                              {GRADE_ICON_MAP[item.grade.grade]} {item.grade.grade}
                            </Badge>
                            <ScoreTrend currentScore={item.result.finalScore} previousScore={caseResults.length > 1 ? caseResults[caseResults.length - 2 - i]?.finalScore : undefined} />
                          </div>
                        </div>
                        {/* Mini score bar */}
                        <div className="comparison-bar mt-2">
                          <div
                            className="bar-fill bg-gradient-to-r from-amber-500/60 to-amber-400/80 stat-bar-gradient"
                            style={{ width: `${item.result.finalScore}%` }}
                          />
                          <span className="bar-label bar-label-left">{item.result.finalScore} pts</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
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
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold premium-button-themed"
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

      {/* Transcript Review Dialog */}
      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto sm:max-w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              {transcriptScenarioId ? (getScenarioById(transcriptScenarioId)?.title || 'Case Transcript') : 'Case Transcript'}
            </DialogTitle>
            <DialogDescription>
              Review the full negotiation dialogue for this case
            </DialogDescription>
          </DialogHeader>
          {transcriptScenarioId && (() => {
            const result = caseResults.find(r => r.scenarioId === transcriptScenarioId);
            if (!result) return <p className="text-sm text-muted-foreground">No transcript data available.</p>;
            return (
              <NegotiationTranscript
                scenarioId={transcriptScenarioId}
                transcript={result.transcript}
                choicesMade={result.choicesMade}
              />
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Case Detail Sheet - slides in from right when completed case is clicked */}
      <Sheet open={!!detailCaseId} onOpenChange={(open) => { if (!open) setDetailCaseId(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
          {detailCaseResult && detailScenario && detailGrade && (
            <>
              {/* Glass-card header with gradient border */}
              <div className="relative">
                {/* Gradient top border */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />
                <div className="glass-card p-5 pt-6">
                  <SheetHeader className="p-0 gap-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{detailScenario.client.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <SheetTitle className="text-lg leading-tight truncate">{detailScenario.title}</SheetTitle>
                        <SheetDescription className="sr-only">Case details and score breakdown for {detailScenario.title}</SheetDescription>
                        <p className="text-xs text-muted-foreground mt-0.5">{detailScenario.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={`text-[11px] px-2 py-0 ${CATEGORY_COLORS[detailScenario.category]}`}>
                        {CATEGORY_LABELS[detailScenario.category]}
                      </Badge>
                      <Badge variant="outline" className="text-[11px] px-2 py-0">
                        Tier {detailScenario.tier}
                      </Badge>
                    </div>
                  </SheetHeader>
                </div>
              </div>

              {/* Score Card */}
              <div className="px-5 py-4">
                <div className="glass-card rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-amber-500 score-counter">
                        {detailCaseResult.finalScore}
                      </span>
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                    <Badge variant="outline" className={`text-sm font-bold px-3 py-1 ${GRADE_BADGE_COLORS[detailGrade.grade]}`}>
                      {GRADE_ICON_MAP[detailGrade.grade]} {detailGrade.grade}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <OutcomeBadge outcome={detailCaseResult.outcome} />
                    <span className="text-xs text-muted-foreground">{detailGrade.description}</span>
                  </div>
                </div>
              </div>

              {/* 6-Dimension Score Breakdown */}
              <div className="px-5 pb-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-amber-500" />
                  Score Breakdown
                </h3>
                <div className="space-y-3">
                  {SCORE_DIMENSIONS.map((dim) => {
                    const value = detailCaseResult.scores[dim.key];
                    return (
                      <div key={dim.key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{dim.label}</span>
                          <span className={`text-xs font-bold ${value >= 80 ? 'text-emerald-400' : value >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                            {value}
                          </span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${getScoreBarBg(value)}`}>
                          <div
                            className={`h-full rounded-full ${getScoreBarColor(value)} stat-bar-gradient transition-all duration-700 ease-out`}
                            style={{ width: `${Math.max(value, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 pb-6 space-y-2">
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold premium-button-themed gap-2"
                  onClick={() => {
                    setTranscriptScenarioId(detailCaseResult.scenarioId);
                    setShowTranscript(true);
                    setDetailCaseId(null);
                  }}
                >
                  <FileText className="h-4 w-4" />
                  View Transcript
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    handleReplayCase(detailCaseResult.scenarioId);
                    setDetailCaseId(null);
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Replay Case
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
