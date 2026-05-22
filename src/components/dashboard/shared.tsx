'use client';

import { useState, useEffect } from 'react';

// Re-export all constants from the single source of truth
export {
  OUTCOME_BADGE_CONFIG,
  GRADE_BADGE_COLORS,
  GRADE_ICON_MAP,
  CATEGORY_BAR_COLORS,
  STAT_GRADIENTS,
  getScoreBarColor,
  getScoreBarBg,
  SCORE_BAR_THRESHOLDS,
} from '@/lib/constants';

import { Badge } from '@/components/ui/badge';
import { Crown, Handshake, Shield, AlertTriangle, Footprints } from 'lucide-react';
import { OUTCOME_BADGE_CONFIG } from '@/lib/constants';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

// Icon mapping for OutcomeBadge (needs component references, can't be in constants.ts)
const OUTCOME_ICON_MAP: Record<string, typeof Crown> = {
  master: Crown,
  cooperative: Handshake,
  hard_bargain: Shield,
  bad_deal: AlertTriangle,
  strategic_no_deal: Footprints,
  ethical_failure: AlertTriangle,
  no_deal_bad: AlertTriangle,
};

// ─── SVG Circular Progress Ring ────────────────────────────────────────────
export function CircularProgress({ value, size = 80, strokeWidth = 4, color = '#f59e0b', animate = true }: { value: number; size?: number; strokeWidth?: number; color?: string; animate?: boolean }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value, animate]);

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

// ─── Outcome Badge Component ────────────────────────────────────────────────
export function OutcomeBadge({ outcome }: { outcome: string }) {
  const config = OUTCOME_BADGE_CONFIG[outcome];
  if (!config) {
    return (
      <Badge variant="outline" className="text-[11px] px-2 py-0 capitalize">
        {outcome.replace(/_/g, ' ')}
      </Badge>
    );
  }
  const IconComponent = OUTCOME_ICON_MAP[outcome] || AlertTriangle;
  return (
    <Badge variant="outline" className={`text-[11px] px-2 py-0.5 gap-1 ${config.color}`}>
      <IconComponent className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// ─── Score Trend Indicator Component ────────────────────────────────────────
export function ScoreTrend({ currentScore, previousScore }: { currentScore: number; previousScore?: number }) {
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
