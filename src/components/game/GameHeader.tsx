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
  Keyboard,
  Zap,
  ChevronDown,
  ChevronUp,
  Flame,
  RotateCcw,
  AlertTriangle,
  Coffee,
  Lock,
} from 'lucide-react';
import { MONETIZATION_CONFIG, getLemonSqueezyLink } from '@/lib/monetization-config';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useEffect } from 'react';
import { NegotiationGlossary } from '@/components/game/NegotiationGlossary';
import { KeyboardShortcutsDialog } from '@/components/game/KeyboardShortcuts';
import { useThemeApplication } from '@/components/game/ThemeSelector';
import { TutorialHelpButton } from '@/components/game/TutorialOverlay';
import { ThemeToggle } from '@/components/game/ThemeToggle';
import { ExitWarningDialog } from '@/components/game/ExitWarningDialog';
import { useSound } from '@/hooks/use-sound';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function GameHeader() {
  const { 
    playerName, careerTier, casesCompleted, totalScore, reputation, 
    phase, setPhase, currentScenarioId, challengeMode, currentStreak, 
    streakType, clearCaseSession
  } = useGameStore();
  const [showMiniStats, setShowMiniStats] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [quickStatsCollapsed, setQuickStatsCollapsed] = useState(false);
  const { soundEnabled, toggleSound } = useSound();

  // Apply theme on mount
  useThemeApplication();

  const repType = getReputationType(reputation);
  const tierName = TIER_NAMES[careerTier];

  // Reset handler
  const handleResetGame = () => {
    useGameStore.getState().resetGame();
    setShowResetConfirm(false);
  };

  // Check if user is in an active case phase (where leaving loses progress)
  const isActiveCasePhase = ['intake', 'strategy', 'investigation', 'negotiation'].includes(phase) && currentScenarioId !== null;

  // Navigate back or to dashboard — clears session when leaving postmortem
  const handleBackOrDashboard = () => {
    if (phase === 'postmortem') {
      clearCaseSession();
      setPhase('dashboard');
    } else if (isActiveCasePhase) {
      // Show exit warning instead of navigating immediately
      setShowExitWarning(true);
    } else {
      const backMap: Record<string, string> = {
        career: 'dashboard',
      };
      setPhase((backMap[phase] as any) || 'dashboard');
    }
  };

  // Navigate to dashboard — clears session when leaving postmortem
  const handleGoDashboard = () => {
    if (phase === 'postmortem') {
      clearCaseSession();
      setPhase('dashboard');
    } else if (isActiveCasePhase) {
      // Show exit warning instead of navigating immediately
      setShowExitWarning(true);
    } else {
      setPhase('dashboard');
    }
  };

  // Listen for keyboard shortcut to show reset confirmation
  useEffect(() => {
    const handleShowReset = () => setShowResetConfirm(true);
    window.addEventListener('dealcraft:show-reset', handleShowReset);
    return () => window.removeEventListener('dealcraft:show-reset', handleShowReset);
  }, []);

  // Listen for keyboard shortcut to show exit warning
  useEffect(() => {
    const handleShowExitWarning = () => setShowExitWarning(true);
    window.addEventListener('dealcraft:show-exit-warning', handleShowExitWarning);
    return () => window.removeEventListener('dealcraft:show-exit-warning', handleShowExitWarning);
  }, []);

  // Don't show header on title screen
  if (phase === 'title') return null;

  const nextTierThreshold = [3, 8, 15, 22, 30][careerTier - 1] || 30;
  const tierProgress = Math.min(100, (casesCompleted / nextTierThreshold) * 100);

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md" style={{ '--header-height': 'auto' } as React.CSSProperties}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        {/* Left: Back + Logo */}
        <div className="flex items-center gap-3 min-w-0">
          {phase !== 'dashboard' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
              onClick={handleBackOrDashboard}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <button
            onClick={handleGoDashboard}
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
            <Badge variant="outline" className="text-[11px] px-1.5 py-0 h-5 border-amber-500/30 text-amber-500">
              {tierName}
            </Badge>
            <span className="truncate max-w-[120px]">{playerName}</span>
            <span>·</span>
            <span>{casesCompleted} cases</span>
            {currentStreak > 0 && (
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                {streakType === 'master' ? '👑' : <Flame className="h-3 w-3" />}
                x{currentStreak}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setShowGlossary(true)}
            title="Negotiation Glossary (G)"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden lg:inline">Glossary</span>
          </Button>
          <NotificationPanel />
          {/* Sound toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 transition-colors ${!soundEnabled ? 'text-muted-foreground' : ''}`}
                  onClick={toggleSound}
                >
                  {soundEnabled ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{soundEnabled ? 'Sound on — click to mute (S)' : 'Sound off — click to unmute (S)'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Support / Lemon Squeezy payment button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
                  asChild
                >
                  <a
                    href={getLemonSqueezyLink(false)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Coffee className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Support Dealcraft's development (Lemon Squeezy)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
            className="h-8 w-8 p-0"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="h-3.5 w-3.5 text-amber-500" />
          </Button>
          <TutorialHelpButton />
          {/* Dark/Light mode toggle */}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-emerald-400 opacity-60 hover:opacity-100"
            onClick={() => { window.location.href = '/admin'; }}
            title="Trainer Dashboard"
          >
            <Lock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Admin</span>
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
            onClick={handleGoDashboard}
          >
            <Home className="h-3.5 w-3.5" />
          </Button>
          {/* Game Reset Button (RotateCcw loop icon) */}
          <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Reset Game"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  Reset Game?
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      This will permanently delete all your game progress. This action cannot be undone.
                    </p>
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-1.5">
                      <p className="text-xs font-medium text-red-400">The following will be lost:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-red-400" />All case results and scores ({casesCompleted} case{casesCompleted !== 1 ? 's' : ''})</li>
                        <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-red-400" />Career progress (Tier {careerTier} — {tierName})</li>
                        <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-red-400" />Achievements ({useGameStore.getState().achievements.length})</li>
                        <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-red-400" />Reputation and stats</li>
                        <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-red-400" />Streak history and challenge records</li>
                      </ul>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 sm:gap-0">
                <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetGame}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold mt-0"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
                <span className="text-medium">{repType.label}</span>
              </div>
              <div className="flex-1 min-w-[120px] max-w-[200px]">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-0.5">
                  <span>{tierName}</span>
                  <span>{casesCompleted}/{nextTierThreshold}</span>
                </div>
                <Progress value={tierProgress} className="h-1.5" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats Bar - Desktop only */}
      {!quickStatsCollapsed && (
        <div className="hidden md:block border-b border-border/20 bg-card/15">
          <div className="max-w-7xl mx-auto px-4 py-1 flex items-center gap-4 text-xs">
            <Badge variant="outline" className="text-[11px] px-1.5 py-0 h-5 border-amber-500/25 text-amber-400 bg-amber-500/5">
              {tierName}
            </Badge>
            <span className="text-muted-foreground flex items-center gap-1 whitespace-nowrap">
              <Briefcase className="h-3 w-3" />
              {casesCompleted} case{casesCompleted !== 1 ? 's' : ''}
            </span>
            <span className="text-muted-foreground flex items-center gap-1 whitespace-nowrap">
              <Star className="h-3 w-3 text-amber-400" />
              <span className="font-semibold text-foreground">{totalScore}</span> pts
            </span>
            {challengeMode !== 'none' && (
              <Badge variant="outline" className="text-[11px] px-1.5 py-0 h-5 border-amber-500/20 text-amber-300 bg-amber-500/5">
                <Zap className="h-2.5 w-2.5 mr-0.5" />
                {challengeMode === 'speed' ? 'Speed Run' : challengeMode === 'limited_choices' ? 'Limited Choices' : 'Ethics Lock'}
              </Badge>
            )}
            {currentStreak > 0 && (
              <Badge variant="outline" className="text-[11px] px-1.5 py-0 h-5 border-amber-500/20 text-amber-300 bg-amber-500/5">
                {streakType === 'master' ? '👑' : <Flame className="h-2.5 w-2.5 mr-0.5" />}
                x{currentStreak}
              </Badge>
            )}
            <button
              onClick={() => setQuickStatsCollapsed(true)}
              className="ml-auto text-muted-foreground hover:text-muted-foreground transition-colors"
              aria-label="Collapse quick stats"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
      {quickStatsCollapsed && (
        <div className="hidden md:flex items-center justify-center border-b border-border/10 bg-card/5">
          <button
            onClick={() => setQuickStatsCollapsed(false)}
            className="text-[11px] text-muted-foreground hover:text-muted-foreground transition-colors py-0.5 flex items-center gap-1"
            aria-label="Expand quick stats"
          >
            <ChevronDown className="h-2.5 w-2.5" />
            Stats
          </button>
        </div>
      )}

      {/* Exit Warning Dialog */}
      <ExitWarningDialog open={showExitWarning} onOpenChange={setShowExitWarning} />

      {/* Negotiation Glossary Dialog */}
      <NegotiationGlossary open={showGlossary} onOpenChange={setShowGlossary} />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
    </header>
  );
}
