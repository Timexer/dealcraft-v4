'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/store/game-store';
import { allScenarios, getScenarioById } from '@/data/scenarios';
import { TIER_NAMES, CATEGORY_LABELS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, Activity } from 'lucide-react';
import { CATEGORY_BAR_COLORS, MAX_CAREER_TIER, TIER_THRESHOLD_LIST, PROGRESS_RING_COLOR } from '@/lib/constants';
import { CircularProgress } from './shared';

export function ActivityCharts() {
  const careerTier = useGameStore(s => s.careerTier);
  const casesCompleted = useGameStore(s => s.casesCompleted);
  const caseResults = useGameStore(s => s.caseResults);

  const nextTierThreshold = TIER_THRESHOLD_LIST[careerTier - 1] || TIER_THRESHOLD_LIST[TIER_THRESHOLD_LIST.length - 1];
  const tierProgress = Math.min(100, (casesCompleted / nextTierThreshold) * 100);

  // Session progress indicator
  const sessionProgress = useMemo(() => ({
    completed: caseResults.length,
    total: allScenarios.length,
    percentage: allScenarios.length > 0 ? Math.round((caseResults.length / allScenarios.length) * 100) : 0,
  }), [caseResults.length]);

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Tier Progress + Completion Ring */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Progress to {TIER_NAMES[Math.min(careerTier + 1, MAX_CAREER_TIER)]}
            </span>
            <span className="text-sm text-muted-foreground">{casesCompleted}/{nextTierThreshold} cases</span>
          </div>
          <div className="tier-progress-bar rounded-full overflow-hidden breathing-animation">
            <Progress value={tierProgress} className="h-2.5" />
          </div>
          {/* Session Progress + Completion Ring */}
          <div className="mt-3 flex items-center gap-3">
            <div className="relative shrink-0">
              <CircularProgress value={sessionProgress.percentage} size={36} strokeWidth={3} color={PROGRESS_RING_COLOR} />
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
  );
}
