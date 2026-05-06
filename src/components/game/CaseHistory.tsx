'use client';

import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { CATEGORY_COLORS, CATEGORY_LABELS, type CaseResult } from '@/data/scenarios/types';
import { getScoreGrade } from '@/lib/game-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { NegotiationTranscript } from './NegotiationTranscript';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  ArrowLeft,
  Trophy,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Clock,
  Award,
  Target,
  Flame,
  BarChart3,
  History,
  Crown,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OUTCOME_COLORS: Record<string, string> = {
  master: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/15',
  cooperative: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/15',
  hard_bargain: 'text-amber-400 border-amber-500/40 bg-amber-500/15',
  bad_deal: 'text-red-400 border-red-500/40 bg-red-500/15',
  strategic_no_deal: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/15',
  ethical_failure: 'text-rose-400 border-rose-500/40 bg-rose-500/15',
  no_deal_bad: 'text-orange-400 border-orange-500/40 bg-orange-500/15',
};

const OUTCOME_DOT_COLORS: Record<string, string> = {
  master: 'bg-yellow-400',
  cooperative: 'bg-emerald-400',
  hard_bargain: 'bg-amber-400',
  bad_deal: 'bg-red-400',
  strategic_no_deal: 'bg-cyan-400',
  ethical_failure: 'bg-rose-400',
  no_deal_bad: 'bg-orange-400',
};

const OUTCOME_ICON: Record<string, string> = {
  master: '👑',
  cooperative: '🤝',
  hard_bargain: '💪',
  bad_deal: '💔',
  strategic_no_deal: '🚶',
  ethical_failure: '⚖️',
  no_deal_bad: '❌',
};

const OUTCOME_LABELS: Record<string, string> = {
  master: 'Master Deal',
  cooperative: 'Cooperative',
  hard_bargain: 'Hard Bargain',
  bad_deal: 'Bad Deal',
  strategic_no_deal: 'Strategic No Deal',
  ethical_failure: 'Ethical Failure',
  no_deal_bad: 'No Deal (Bad)',
};

const GRADE_BADGE_COLORS: Record<string, string> = {
  S: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  A: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  B: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  C: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  D: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  F: 'bg-red-500/20 text-red-400 border-red-500/40',
};

type SortOption = 'date' | 'score' | 'title';

export function CaseHistory() {
  const { caseResults, setPhase, setCurrentScenarioId } = useGameStore();

  const [filterOutcome, setFilterOutcome] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let results = [...caseResults];

    // Filter by outcome
    if (filterOutcome !== 'all') {
      results = results.filter(r => r.outcome === filterOutcome);
    }

    // Sort
    switch (sortBy) {
      case 'date':
        // Already in chronological order
        break;
      case 'score':
        results.sort((a, b) => b.finalScore - a.finalScore);
        break;
      case 'title':
        results.sort((a, b) => {
          const sa = getScenarioById(a.scenarioId);
          const sb = getScenarioById(b.scenarioId);
          return (sa?.title || '').localeCompare(sb?.title || '');
        });
        break;
    }

    return results;
  }, [caseResults, filterOutcome, sortBy]);

  // Score trend data for chart
  const chartData = useMemo(() => {
    return caseResults.map((result, i) => {
      const scenario = getScenarioById(result.scenarioId);
      return {
        name: `#${i + 1}`,
        score: result.finalScore,
        title: scenario?.title || 'Unknown',
        outcome: result.outcome,
      };
    });
  }, [caseResults]);

  // Statistics
  const stats = useMemo(() => {
    if (caseResults.length === 0) return null;

    const totalCases = caseResults.length;
    const avgScore = Math.round(caseResults.reduce((sum, r) => sum + r.finalScore, 0) / totalCases);
    const bestScore = Math.max(...caseResults.map(r => r.finalScore));
    const bestCase = caseResults.find(r => r.finalScore === bestScore);

    // Most common outcome
    const outcomeCounts: Record<string, number> = {};
    caseResults.forEach(r => { outcomeCounts[r.outcome] = (outcomeCounts[r.outcome] || 0) + 1; });
    const mostCommonOutcome = Object.entries(outcomeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Win streak (consecutive cooperative/master outcomes)
    let maxStreak = 0;
    let currentStreak = 0;
    for (const r of caseResults) {
      if (r.outcome === 'master' || r.outcome === 'cooperative') {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // Current form: last 3 cases average vs overall average
    const last3 = caseResults.slice(-3);
    const last3Avg = last3.length > 0 ? Math.round(last3.reduce((sum, r) => sum + r.finalScore, 0) / last3.length) : 0;
    const formDiff = last3Avg - avgScore;

    return {
      totalCases,
      avgScore,
      bestScore,
      bestCaseId: bestCase?.scenarioId,
      mostCommonOutcome,
      maxStreak,
      currentStreak,
      last3Avg,
      formDiff,
    };
  }, [caseResults]);

  // Get trend between two consecutive scores
  const getTrend = (current: number, previous: number): 'improving' | 'declining' | 'stable' => {
    const diff = current - previous;
    if (diff > 3) return 'improving';
    if (diff < -3) return 'declining';
    return 'stable';
  };

  const selectedResult = selectedCaseId ? caseResults.find(r => r.scenarioId === selectedCaseId) : null;
  const selectedScenario = selectedCaseId ? getScenarioById(selectedCaseId) : null;

  // Get unique outcomes for filter
  const availableOutcomes = useMemo(() => {
    const outcomes = [...new Set(caseResults.map(r => r.outcome))];
    return outcomes.filter(Boolean);
  }, [caseResults]);

  if (caseResults.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <History className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold text-muted-foreground">No Cases Completed Yet</h2>
          <p className="text-sm text-muted-foreground">Complete your first case to see your history here.</p>
          <Button variant="outline" onClick={() => setPhase('dashboard')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setPhase('dashboard')} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                <History className="h-7 w-7 text-amber-500" />
                Case History
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Your complete negotiation timeline</p>
            </div>
          </div>
        </motion.div>

        {/* Statistics Summary */}
        {stats && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Card className="glass-card">
                <CardContent className="p-3 text-center">
                  <Trophy className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{stats.totalCases}</p>
                  <p className="text-[11px] text-muted-foreground">Total Cases</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-3 text-center">
                  <BarChart3 className="h-4 w-4 text-cyan-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{stats.avgScore}</p>
                  <p className="text-[11px] text-muted-foreground">Average Score</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-3 text-center">
                  <Star className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{stats.bestScore}</p>
                  <p className="text-[11px] text-muted-foreground">Best Score</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-3 text-center">
                  <Crown className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{stats.maxStreak}</p>
                  <p className="text-[11px] text-muted-foreground">Win Streak</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-3 text-center">
                  <Target className="h-4 w-4 text-violet-500 mx-auto mb-1" />
                  <p className="text-sm font-bold truncate">{OUTCOME_LABELS[stats.mostCommonOutcome] || 'N/A'}</p>
                  <p className="text-[11px] text-muted-foreground">Most Common</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-3 text-center">
                  {stats.formDiff > 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                  ) : stats.formDiff < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500 mx-auto mb-1" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  )}
                  <p className={`text-lg font-bold ${stats.formDiff > 0 ? 'text-emerald-400' : stats.formDiff < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {stats.formDiff > 0 ? '+' : ''}{stats.formDiff}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Current Form</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Score Trend Chart */}
        {chartData.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-400" />
                  Score Progression
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[200px] sm:h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        axisLine={{ stroke: 'hsl(var(--border))', strokeOpacity: 0.3 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        axisLine={{ stroke: 'hsl(var(--border))', strokeOpacity: 0.3 }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: 'hsl(var(--card-foreground))',
                        }}
                        formatter={(value: number, name: string) => [`${value} pts`, 'Score']}
                        labelFormatter={(label: string) => {
                          const idx = parseInt(label.replace('#', '')) - 1;
                          const item = chartData[idx];
                          return item?.title || label;
                        }}
                      />
                      <ReferenceLine
                        y={stats?.avgScore || 50}
                        stroke="#f59e0b"
                        strokeDasharray="6 4"
                        strokeOpacity={0.5}
                        label={{
                          value: `Avg: ${stats?.avgScore || 0}`,
                          position: 'right',
                          fill: '#f59e0b',
                          fontSize: 11,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        fill="url(#scoreGradient)"
                        dot={{ r: 4, fill: '#f59e0b', stroke: '#f59e0b', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#f59e0b', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filter & Sort Controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Outcome Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <button
                onClick={() => setFilterOutcome('all')}
                className={`text-[11px] px-2 py-1 rounded-full border transition-all ${
                  filterOutcome === 'all'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-card/50 text-muted-foreground border-border/30 hover:border-amber-500/20'
                }`}
              >
                All
              </button>
              {availableOutcomes.map(outcome => (
                <button
                  key={outcome}
                  onClick={() => setFilterOutcome(outcome)}
                  className={`text-[11px] px-2 py-1 rounded-full border transition-all ${
                    filterOutcome === outcome
                      ? OUTCOME_COLORS[outcome] || 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-card/50 text-muted-foreground border-border/30 hover:border-amber-500/20'
                  }`}
                >
                  {OUTCOME_ICON[outcome]} {OUTCOME_LABELS[outcome]}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] text-muted-foreground">Sort:</span>
              {(['date', 'score', 'title'] as SortOption[]).map(option => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={`text-[11px] px-2 py-1 rounded-full border transition-all capitalize ${
                    sortBy === option
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-card/50 text-muted-foreground border-border/30 hover:border-amber-500/20'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-0">
          <AnimatePresence mode="popLayout">
            {filteredResults.map((result, i) => {
              const scenario = getScenarioById(result.scenarioId);
              if (!scenario) return null;
              const grade = getScoreGrade(result.finalScore);
              const outcomeColor = OUTCOME_COLORS[result.outcome] || OUTCOME_COLORS.bad_deal;
              const dotColor = OUTCOME_DOT_COLORS[result.outcome] || OUTCOME_DOT_COLORS.bad_deal;

              // Performance trend: compare with previous case
              let trendColor = 'bg-border/30';
              if (i > 0) {
                const prevScore = caseResults[i - 1]?.finalScore;
                if (prevScore !== undefined) {
                  const trend = getTrend(result.finalScore, prevScore);
                  trendColor = trend === 'improving' ? 'bg-emerald-500/50' : trend === 'declining' ? 'bg-red-500/50' : 'bg-muted-foreground/30';
                }
              }

              // Find the actual index in caseResults (not filteredResults)
              const actualIndex = caseResults.findIndex(r => r.scenarioId === result.scenarioId);

              return (
                <motion.div
                  key={result.scenarioId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative"
                >
                  <div className="flex gap-4">
                    {/* Timeline column */}
                    <div className="flex flex-col items-center w-8 shrink-0">
                      {/* Dot */}
                      <div className={`w-4 h-4 rounded-full ${dotColor} shrink-0 ring-2 ring-background z-10 mt-4`} />
                      {/* Connecting line */}
                      {i < filteredResults.length - 1 && (
                        <div className={`w-0.5 flex-1 ${trendColor} min-h-[40px]`} />
                      )}
                    </div>

                    {/* Content card */}
                    <div className="flex-1 pb-4">
                      <Card
                        className="bg-card/30 border-border/30 hover:bg-card/50 hover:border-amber-500/20 transition-all duration-200 cursor-pointer group"
                        onClick={() => setSelectedCaseId(result.scenarioId)}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="text-xl shrink-0">{scenario.client.avatar}</span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-medium truncate group-hover:text-amber-500 transition-colors">{scenario.title}</p>
                                  <Badge variant="outline" className={`text-[11px] px-1.5 py-0 shrink-0 ${CATEGORY_COLORS[scenario.category]}`}>
                                    {CATEGORY_LABELS[scenario.category]}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[11px] text-muted-foreground">Case #{actualIndex + 1}</span>
                                  <span className="text-[11px] text-muted-foreground">·</span>
                                  <Badge variant="outline" className={`text-[11px] px-1.5 py-0 shrink-0 ${outcomeColor}`}>
                                    {OUTCOME_ICON[result.outcome]} {OUTCOME_LABELS[result.outcome]}
                                  </Badge>
                                </div>
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
                                <p className="text-[11px] text-muted-foreground">points</p>
                              </div>
                              <FileText className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredResults.length === 0 && (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No cases match the selected filter.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setFilterOutcome('all')}>
                  Clear Filter
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Transcript Dialog */}
      <Dialog open={!!selectedCaseId} onOpenChange={(open) => { if (!open) setSelectedCaseId(null); }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto sm:max-w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              {selectedScenario?.title || 'Case Transcript'}
            </DialogTitle>
            <DialogDescription>
              Review the full negotiation dialogue for this case
            </DialogDescription>
          </DialogHeader>
          {selectedResult && selectedScenario && (
            <NegotiationTranscript
              scenarioId={selectedResult.scenarioId}
              transcript={selectedResult.transcript}
              choicesMade={selectedResult.choicesMade}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
