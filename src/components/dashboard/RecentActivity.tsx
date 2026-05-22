'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { getScoreGrade } from '@/lib/game-engine';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OutcomeBadge, ScoreTrend } from './shared';
import { GRADE_BADGE_COLORS, GRADE_ICON_MAP } from '@/lib/constants';

interface RecentActivityItem {
  result: {
    scenarioId: string;
    finalScore: number;
    outcome: string;
  };
  scenario: NonNullable<ReturnType<typeof getScenarioById>>;
  grade: ReturnType<typeof getScoreGrade>;
}

export function RecentActivity() {
  const caseResults = useGameStore(s => s.caseResults);

  const recentActivity = useMemo(() => {
    return caseResults.slice(-3).reverse().map(result => {
      const scenario = getScenarioById(result.scenarioId);
      if (!scenario) return null;
      const grade = getScoreGrade(result.finalScore);
      return { result, scenario, grade };
    }).filter(Boolean) as RecentActivityItem[];
  }, [caseResults]);

  if (recentActivity.length === 0) return null;

  return (
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
              key={`${item.result.scenarioId}-${i}`}
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
  );
}
