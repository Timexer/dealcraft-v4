'use client';

import { useGameStore } from '@/store/game-store';
import { TIER_NAMES, TIER_DESCRIPTIONS } from '@/lib/constants';
import { getReputationType } from '@/lib/game-engine';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, BookOpen, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { STAT_GRADIENTS, TIER_THRESHOLD_LIST, PROGRESS_RING_COLOR } from '@/lib/constants';
import { CircularProgress } from './shared';

export function StatOverview() {
  const careerTier = useGameStore(s => s.careerTier);
  const casesCompleted = useGameStore(s => s.casesCompleted);
  const totalScore = useGameStore(s => s.totalScore);
  const reputation = useGameStore(s => s.reputation);
  const caseResults = useGameStore(s => s.caseResults);

  const tierName = TIER_NAMES[careerTier];
  const tierDesc = TIER_DESCRIPTIONS[careerTier];
  const nextTierThreshold = TIER_THRESHOLD_LIST[careerTier - 1] || TIER_THRESHOLD_LIST[TIER_THRESHOLD_LIST.length - 1];
  const tierProgress = Math.min(100, (casesCompleted / nextTierThreshold) * 100);
  const repType = getReputationType(reputation);
  const completedCases = caseResults.length;

  const stats = [
    { label: 'Cases Closed', value: completedCases.toString(), icon: BookOpen, color: 'text-cyan-500', gradient: STAT_GRADIENTS[0] },
    { label: 'Total Score', value: totalScore.toString(), icon: Trophy, color: 'text-emerald-500', gradient: STAT_GRADIENTS[1] },
    { label: 'Reputation', value: repType.label, icon: Users, color: 'text-violet-500', gradient: STAT_GRADIENTS[2] },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {/* Visual Tier Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
        className="fade-scale-in"
      >
        <Card className="glass-card animated-border hover:border-amber-500/20 transition-all duration-200 bg-gradient-to-br from-amber-500/10 via-amber-500/4 to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="relative shrink-0">
              <CircularProgress value={tierProgress} size={56} strokeWidth={4} color={PROGRESS_RING_COLOR} />
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

      {/* Stat cards */}
      {stats.map((stat, i) => (
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
  );
}
