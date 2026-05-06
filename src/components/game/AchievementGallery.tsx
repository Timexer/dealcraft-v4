'use client';

import { useGameStore, type Achievement } from '@/store/game-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  hint: string;
}

const ALL_ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_case',
    title: 'First Case Closed',
    description: 'Complete your first negotiation case',
    icon: '📋',
    hint: 'Start your career by closing a case',
  },
  {
    id: 'first_master',
    title: 'Master Negotiator',
    description: 'Achieve a master deal outcome',
    icon: '👑',
    hint: 'Find the hidden truth and create maximum value',
  },
  {
    id: 'five_cases',
    title: 'Rising Star',
    description: 'Complete 5 negotiation cases',
    icon: '⭐',
    hint: 'Keep closing cases to rise through the ranks',
  },
  {
    id: 'ten_cases',
    title: 'Deal Maker',
    description: 'Complete 10 negotiation cases',
    icon: '🎯',
    hint: 'A proven track record of closed deals',
  },
  {
    id: 'twenty_cases',
    title: 'Veteran Negotiator',
    description: 'Complete 20 negotiation cases',
    icon: '🏅',
    hint: 'Reach the pinnacle of case experience',
  },
  {
    id: 'all_fundamentals',
    title: 'Fundamentals Master',
    description: 'Complete all fundamentals cases',
    icon: '📚',
    hint: 'Master the basics of negotiation',
  },
  {
    id: 'perfect_score',
    title: 'Perfect Deal',
    description: 'Score 90+ on a case',
    icon: '💎',
    hint: 'Near-flawless execution on every dimension',
  },
  {
    id: 'shark_rep',
    title: 'The Shark',
    description: 'Reach shark reputation 15+',
    icon: '🦈',
    hint: 'Claim value aggressively and dominate deals',
  },
  {
    id: 'diplomat_rep',
    title: 'The Peacemaker',
    description: 'Reach diplomat reputation 15+',
    icon: '🕊️',
    hint: 'Build bridges and preserve relationships',
  },
  {
    id: 'detective_rep',
    title: 'Truth Seeker',
    description: 'Reach detective reputation 15+',
    icon: '🔍',
    hint: 'Uncover hidden interests and reveal the truth',
  },
  {
    id: 'five_cooperative',
    title: 'Cooperative Champion',
    description: 'Get 5 cooperative outcomes',
    icon: '🤝',
    hint: 'Create win-win outcomes consistently',
  },
  {
    id: 'no_deal_strategist',
    title: 'Strategic Walker',
    description: 'Get a strategic no-deal outcome',
    icon: '🚶',
    hint: 'Know when walking away is the best move',
  },
  {
    id: 'comeback_kid',
    title: 'Comeback Kid',
    description: 'Get a master outcome after a bad deal',
    icon: '🔄',
    hint: 'Bounce back from failure with excellence',
  },
];

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AchievementGallery() {
  const achievements = useGameStore((s) => s.achievements);

  const unlockedMap = new Map<string, Achievement>();
  for (const a of achievements) {
    unlockedMap.set(a.id, a);
  }

  const unlockedCount = achievements.length;
  const totalCount = ALL_ACHIEVEMENTS.length;

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium">
            {unlockedCount} / {totalCount} Unlocked
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30"
        >
          {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}% Complete
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {ALL_ACHIEVEMENTS.map((def, i) => {
          const unlocked = unlockedMap.get(def.id);
          const isUnlocked = !!unlocked;

          return (
            <motion.div
              key={def.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Card
                className={`relative overflow-hidden transition-all duration-300 ${
                  isUnlocked
                    ? 'glass-card border-amber-500/30 hover:border-amber-500/50'
                    : 'bg-muted/10 border-border/20 opacity-70 hover:opacity-90'
                }`}
              >
                {/* Glow effect for unlocked */}
                {isUnlocked && (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-500/0 pointer-events-none" />
                )}

                <CardContent className="p-3 sm:p-4 relative">
                  {/* Icon */}
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`text-2xl sm:text-3xl ${
                        isUnlocked ? 'animate-subtle-float' : 'grayscale opacity-50'
                      }`}
                    >
                      {isUnlocked ? def.icon : '🔒'}
                    </span>
                    {isUnlocked && (
                      <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-xs sm:text-sm font-semibold leading-tight mb-1 ${
                      isUnlocked ? 'text-amber-200' : 'text-muted-foreground'
                    }`}
                  >
                    {def.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-[10px] sm:text-xs leading-snug ${
                      isUnlocked ? 'text-amber-100/70' : 'text-muted-foreground/50'
                    }`}
                  >
                    {isUnlocked ? def.description : def.hint}
                  </p>

                  {/* Unlock date */}
                  {isUnlocked && unlocked.unlockedAt && (
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 mt-2">
                      Unlocked {formatDate(unlocked.unlockedAt)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
