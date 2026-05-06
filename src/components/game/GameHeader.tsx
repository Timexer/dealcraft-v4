'use client';

import { useGameStore } from '@/store/game-store';
import { TIER_NAMES } from '@/data/scenarios/types';
import { getReputationType } from '@/lib/game-engine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { NotificationPanel } from '@/components/game/NotificationPanel';
import {
  Briefcase,
  Star,
  Trophy,
  BarChart3,
  Home,
  ChevronLeft,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { NegotiationGlossary } from '@/components/game/NegotiationGlossary';

export function GameHeader() {
  const { playerName, careerTier, casesCompleted, totalScore, reputation, phase, setPhase, currentScenarioId } = useGameStore();
  const [showMiniStats, setShowMiniStats] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const repType = getReputationType(reputation);
  const tierName = TIER_NAMES[careerTier];

  // Don't show header on title screen
  if (phase === 'title') return null;

  const nextTierThreshold = [3, 8, 15, 22, 30][careerTier - 1] || 30;
  const tierProgress = Math.min(100, (casesCompleted / nextTierThreshold) * 100);

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        {/* Left: Back + Logo */}
        <div className="flex items-center gap-3 min-w-0">
          {phase !== 'dashboard' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
              onClick={() => {
                const backMap: Record<string, string> = {
                  intake: 'dashboard',
                  strategy: 'intake',
                  investigation: 'strategy',
                  negotiation: 'investigation',
                  postmortem: 'negotiation',
                  career: 'dashboard',
                };
                setPhase((backMap[phase] as any) || 'dashboard');
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <button
            onClick={() => setPhase('dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Briefcase className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:block">
              <span className="text-foreground">DEAL</span>
              <span className="text-amber-500">CRAFT</span>
            </span>
          </button>
        </div>

        {/* Center: Player Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-amber-500/30 text-amber-500">
              {tierName}
            </Badge>
            <span className="truncate max-w-[120px]">{playerName}</span>
            <span>·</span>
            <span>{casesCompleted} cases</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setShowGlossary(true)}
            title="Negotiation Glossary"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden lg:inline">Glossary</span>
          </Button>
          <NotificationPanel />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setShowMiniStats(!showMiniStats)}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden sm:inline">{totalScore}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setPhase('career')}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Career</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setPhase('dashboard')}
          >
            <Home className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Expandable Mini Stats Bar */}
      <AnimatePresence>
        {showMiniStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/30 bg-card/30"
          >
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-xs">
                <Star className="h-3 w-3 text-amber-500" />
                <span className="text-muted-foreground">Score</span>
                <span className="font-bold">{totalScore}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Rep:</span>
                <span className="font-medium">{repType.label}</span>
              </div>
              <div className="flex-1 min-w-[120px] max-w-[200px]">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                  <span>{tierName}</span>
                  <span>{casesCompleted}/{nextTierThreshold}</span>
                </div>
                <Progress value={tierProgress} className="h-1.5" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Negotiation Glossary Dialog */}
      <NegotiationGlossary open={showGlossary} onOpenChange={setShowGlossary} />
    </header>
  );
}
