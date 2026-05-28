'use client';

import { useGameStore } from '@/store/game-store';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Crown, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';

const MILESTONE_MAP: Record<number, { name: string; color: string; bgColor: string; borderColor: string }> = {
  3: { name: 'Bronze', color: 'text-amber-600', bgColor: 'bg-amber-500/15', borderColor: 'border-amber-500/30' },
  5: { name: 'Silver', color: 'text-slate-300', bgColor: 'bg-slate-400/15', borderColor: 'border-slate-400/30' },
  7: { name: 'Gold', color: 'text-yellow-400', bgColor: 'bg-yellow-500/15', borderColor: 'border-yellow-500/30' },
  10: { name: 'Platinum', color: 'text-cyan-300', bgColor: 'bg-cyan-500/15', borderColor: 'border-cyan-500/30' },
};

function getMilestone(streak: number) {
  if (streak >= 10) return MILESTONE_MAP[10];
  if (streak >= 7) return MILESTONE_MAP[7];
  if (streak >= 5) return MILESTONE_MAP[5];
  if (streak >= 3) return MILESTONE_MAP[3];
  return null;
}

export function StreakIndicator({ compact = false }: { compact?: boolean }) {
  const { currentStreak, bestStreak, streakType } = useGameStore();
  const [animateStreak, setAnimateStreak] = useState(false);

  useEffect(() => {
    if (currentStreak > 0) {
      const timer = setTimeout(() => {
        setAnimateStreak(true);
        setTimeout(() => setAnimateStreak(false), 600);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentStreak]);

  if (currentStreak === 0) return null;

  const milestone = getMilestone(currentStreak);
  const isMaster = streakType === 'master';
  const streakEmoji = isMaster ? '👑' : '🔥';

  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1.5"
      >
        <span className="text-sm">{streakEmoji}</span>
        <span className="text-xs font-bold tabular-nums">
          {isMaster ? 'Master' : 'Win'} x{currentStreak}
        </span>
        {milestone && (
          <Badge
            variant="outline"
            className={`text-[11px] px-1.5 py-0 h-4 ${milestone.bgColor} ${milestone.color} ${milestone.borderColor}`}
          >
            {milestone.name}
          </Badge>
        )}
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: animateStreak ? 1.05 : 1 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex items-center gap-3"
      >
        {/* Streak icon with glow */}
        <motion.div
          animate={animateStreak ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.4 }}
          className={`relative flex items-center justify-center w-10 h-10 rounded-xl ${
            isMaster
              ? 'bg-yellow-500/15 border border-yellow-500/30'
              : 'bg-amber-500/15 border border-amber-500/30'
          }`}
        >
          {isMaster ? (
            <Crown className="h-5 w-5 text-yellow-400" />
          ) : (
            <Flame className="h-5 w-5 text-amber-400" />
          )}
          {/* Pulse ring */}
          {currentStreak >= 3 && (
            <div className={`absolute inset-0 rounded-xl pointer-events-none ${
              isMaster ? 'animate-ping bg-yellow-500/10' : 'animate-pulse bg-amber-500/10'
            }`} />
          )}
        </motion.div>

        {/* Streak info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">
              {isMaster ? 'Master' : 'Win'} Streak
            </span>
            <motion.span
              key={currentStreak}
              initial={{ scale: 1.4, color: isMaster ? '#facc15' : '#f59e0b' }}
              animate={{ scale: 1, color: 'inherit' }}
              transition={{ duration: 0.3 }}
              className="text-lg font-black tabular-nums"
            >
              x{currentStreak}
            </motion.span>
          </div>

          <div className="flex items-center gap-2">
            {milestone && (
              <Badge
                variant="outline"
                className={`text-[11px] px-1.5 py-0 h-4 ${milestone.bgColor} ${milestone.color} ${milestone.borderColor}`}
              >
                {milestone.name}
              </Badge>
            )}
            {bestStreak > currentStreak && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Trophy className="h-2.5 w-2.5" />
                Best: {bestStreak}
              </span>
            )}
          </div>
        </div>

        {/* Streak bonus indicator */}
        {currentStreak >= 3 && (
          <Badge
            variant="outline"
            className="text-[11px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ml-1"
          >
            +{Math.min(50, (currentStreak - 2) * 5)}% bonus
          </Badge>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
