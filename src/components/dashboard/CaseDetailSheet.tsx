'use client';

import { getScenarioById } from '@/data/scenarios';
import type { CaseResult } from '@/data/scenarios/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/constants';
import { getScoreGrade } from '@/lib/game-engine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { BarChart3, FileText, RotateCcw } from 'lucide-react';
import { GRADE_BADGE_COLORS, GRADE_ICON_MAP, SCORE_DIMENSIONS } from '@/lib/constants';
import { getScoreBarColor, getScoreBarBg } from '@/lib/constants';
import { OutcomeBadge } from './shared';

interface CaseDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseResult: CaseResult | null;
  onReplay: (scenarioId: string) => void;
  onViewTranscript: (scenarioId: string) => void;
}

export function CaseDetailSheet({ open, onOpenChange, caseResult, onReplay, onViewTranscript }: CaseDetailSheetProps) {
  if (!caseResult) return null;

  const scenario = getScenarioById(caseResult.scenarioId);
  if (!scenario) return null;

  const grade = getScoreGrade(caseResult.finalScore);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        {/* Glass-card header with gradient border */}
        <div className="relative">
          {/* Gradient top border */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />
          <div className="glass-card p-5 pt-6">
            <SheetHeader className="p-0 gap-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{scenario.client.avatar}</span>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-lg leading-tight truncate">{scenario.title}</SheetTitle>
                  <SheetDescription className="sr-only">Case details and score breakdown for {scenario.title}</SheetDescription>
                  <p className="text-xs text-muted-foreground mt-0.5">{scenario.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={`text-[11px] px-2 py-0 ${CATEGORY_COLORS[scenario.category]}`}>
                  {CATEGORY_LABELS[scenario.category]}
                </Badge>
                <Badge variant="outline" className="text-[11px] px-2 py-0">
                  Tier {scenario.tier}
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
                  {caseResult.finalScore}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <Badge variant="outline" className={`text-sm font-bold px-3 py-1 ${GRADE_BADGE_COLORS[grade.grade]}`}>
                {GRADE_ICON_MAP[grade.grade]} {grade.grade}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <OutcomeBadge outcome={caseResult.outcome} />
              <span className="text-xs text-muted-foreground">{grade.description}</span>
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
              const value = caseResult.scores[dim.key];
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
              onViewTranscript(caseResult.scenarioId);
              onOpenChange(false);
            }}
          >
            <FileText className="h-4 w-4" />
            View Transcript
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              onReplay(caseResult.scenarioId);
              onOpenChange(false);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Replay Case
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
