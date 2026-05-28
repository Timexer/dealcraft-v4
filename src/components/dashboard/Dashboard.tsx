'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { allScenarios, getScenarioById } from '@/data/scenarios';
import { TIER_NAMES, TIER_DESCRIPTIONS } from '@/lib/constants';
import { getScoreGrade } from '@/lib/game-engine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Trophy, BarChart3, Award, History, AlertTriangle, Trash2, RotateCcw, FileText, Star, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { AchievementGallery } from '../game/AchievementGallery';
import { ChallengeModeSelector } from '../game/ChallengeModeSelector';
import { StreakIndicator } from '../game/StreakIndicator';
import { NegotiationTranscript } from '../game/NegotiationTranscript';
import { useSound } from '@/hooks/use-sound';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { OutcomeBadge } from './shared';
import { GRADE_BADGE_COLORS } from '@/lib/constants';
import { StatOverview } from './StatOverview';
import { ActivityCharts } from './ActivityCharts';
import { CaseGrid } from './CaseGrid';
import { CaseDetailSheet } from './CaseDetailSheet';
import { RecentActivity } from './RecentActivity';

export function Dashboard() {
  const {
    playerName, careerTier, casesCompleted, caseResults, setPhase, setCurrentScenarioId, setCaseAccepted,
    setIsReplay, achievements, resetGame,
  } = useGameStore();

  const tierName = TIER_NAMES[careerTier];

  // Achievement gallery dialog state
  const [showAchievements, setShowAchievements] = useState(false);

  // Transcript dialog state
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptScenarioId, setTranscriptScenarioId] = useState<string | null>(null);

  // Challenge mode dialog state
  const [showChallengeMode, setShowChallengeMode] = useState(false);
  const [pendingScenarioId, setPendingScenarioId] = useState<string | null>(null);

  // Case detail sheet state
  const [detailCaseId, setDetailCaseId] = useState<string | null>(null);

  // Sound effects
  const { playClick, playNegotiation } = useSound();

  // Available cases for current tier (excluding completed ones)
  const availableCases = allScenarios.filter(
    s => s.tier <= careerTier && !caseResults.some(r => r.scenarioId === s.id)
  );

  const handleSelectCase = (scenarioId: string) => {
    playClick();
    setPendingScenarioId(scenarioId);
    setShowChallengeMode(true);
  };

  const handleProceedWithCase = () => {
    if (!pendingScenarioId) return;
    const scenarioId = pendingScenarioId;
    playNegotiation();
    setCurrentScenarioId(scenarioId);
    setCaseAccepted(false);
    setIsReplay(false);
    useGameStore.getState().resetInvestigation();
    useGameStore.getState().resetNegotiation();
    useGameStore.getState().setBatnaEstimate(0);
    useGameStore.getState().setReservationEstimate(0);
    useGameStore.getState().setOpeningStrategy('');
    useGameStore.getState().assumptions = [];
    useGameStore.getState().setChallengeTimer(0);
    setShowChallengeMode(false);
    setPendingScenarioId(null);
    setPhase('intake');
  };

  const handleReplayCase = (scenarioId: string) => {
    playClick();
    setCurrentScenarioId(scenarioId);
    setCaseAccepted(false);
    setIsReplay(true);
    useGameStore.getState().resetInvestigation();
    useGameStore.getState().resetNegotiation();
    useGameStore.getState().setBatnaEstimate(0);
    useGameStore.getState().setReservationEstimate(0);
    useGameStore.getState().setOpeningStrategy('');
    useGameStore.getState().assumptions = [];
    setPhase('intake');
  };

  // Find the selected case result for the detail sheet
  const detailCaseResult = detailCaseId ? caseResults.find(r => r.scenarioId === detailCaseId) ?? null : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, <span className="gradient-text-themed ambient-name-glow">{playerName}</span>
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground">{TIER_NAMES[careerTier]} — {TIER_DESCRIPTIONS[careerTier]}</p>
              <StreakIndicator compact />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowAchievements(true)} className="gap-1.5 sm:gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Achievements</span>
              <span className="sm:hidden">{achievements.length}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPhase('career')} className="gap-1.5 sm:gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Career Stats</span>
              <span className="sm:hidden">Stats</span>
            </Button>
            {caseResults.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setPhase('case_history')} className="gap-1.5 sm:gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            )}
            {/* Reset Game Button with Confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 text-muted-foreground hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-colors">
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Reset</span>
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
                          <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-red-400" />Achievements ({achievements.length})</li>
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
                    onClick={resetGame}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold mt-0"
                  >
                    <RotateCcw className="h-4 w-4 mr-1.5" />
                    Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <StatOverview />

        {/* Activity Charts */}
        <ActivityCharts />

        {/* Available Cases */}
        <CaseGrid availableCases={availableCases} onSelectCase={handleSelectCase} />

        {/* Completed Cases */}
        {caseResults.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-500" />
              Completed Cases
              <span className="ml-1 text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                {caseResults.length} closed
              </span>
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {caseResults.map((result, i) => {
                const scenario = getScenarioById(result.scenarioId);
                if (!scenario) return null;
                const grade = getScoreGrade(result.finalScore);
                return (
                  <motion.div
                    key={`${result.scenarioId}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card
                      className="bg-card/30 border-border/30 hover:bg-card/50 hover:border-amber-500/15 transition-all duration-200 sealed-card cursor-pointer"
                      onClick={() => {
                        playClick();
                        setDetailCaseId(result.scenarioId);
                      }}
                    >
                      <CardContent className="p-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-xl shrink-0">{scenario.client.avatar}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{scenario.title}</p>
                            <OutcomeBadge outcome={result.outcome} />
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
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTranscriptScenarioId(result.scenarioId);
                              setShowTranscript(true);
                            }}
                            className="h-8 px-2 gap-1 text-xs text-muted-foreground hover:text-cyan-500 hover:bg-cyan-500/10"
                            title="Review transcript"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReplayCase(result.scenarioId);
                            }}
                            className="h-8 px-2 gap-1 text-xs text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                            title="Replay this case"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Replay</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <RecentActivity />
      </div>

      {/* Challenge Mode Dialog */}
      <Dialog open={showChallengeMode} onOpenChange={setShowChallengeMode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Start Case
            </DialogTitle>
            <DialogDescription>
              Choose a challenge mode before starting this case
            </DialogDescription>
          </DialogHeader>
          <ChallengeModeSelector />
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowChallengeMode(false);
                setPendingScenarioId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold premium-button-themed"
              onClick={handleProceedWithCase}
            >
              Start Case
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievement Gallery Dialog */}
      <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto sm:max-w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Achievement Gallery
            </DialogTitle>
            <DialogDescription>
              Track your negotiation milestones and accomplishments
            </DialogDescription>
          </DialogHeader>
          <AchievementGallery />
        </DialogContent>
      </Dialog>

      {/* Transcript Review Dialog */}
      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto sm:max-w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              {transcriptScenarioId ? (getScenarioById(transcriptScenarioId)?.title || 'Case Transcript') : 'Case Transcript'}
            </DialogTitle>
            <DialogDescription>
              Review the full negotiation dialogue for this case
            </DialogDescription>
          </DialogHeader>
          {transcriptScenarioId && (() => {
            const result = caseResults.find(r => r.scenarioId === transcriptScenarioId);
            if (!result) return <p className="text-sm text-muted-foreground">No transcript data available.</p>;
            return (
              <NegotiationTranscript
                scenarioId={transcriptScenarioId}
                transcript={result.transcript}
                choicesMade={result.choicesMade}
              />
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Case Detail Sheet */}
      <CaseDetailSheet
        open={!!detailCaseId}
        onOpenChange={(open) => { if (!open) setDetailCaseId(null); }}
        caseResult={detailCaseResult}
        onReplay={handleReplayCase}
        onViewTranscript={(scenarioId) => {
          setTranscriptScenarioId(scenarioId);
          setShowTranscript(true);
        }}
      />
    </div>
  );
}
