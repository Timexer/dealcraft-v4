'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronRight, X, HelpCircle, LayoutDashboard, FileSearch, Brain, Search, MessageSquare, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useGameStore } from '@/store/game-store';
import type { GamePhase } from '@/data/scenarios/types';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface TutorialPhaseConfig {
  steps: TutorialStep[];
}

const TUTORIAL_CONTENT: Partial<Record<GamePhase, TutorialPhaseConfig>> = {
  dashboard: {
    steps: [
      {
        title: 'Welcome to your Office!',
        description:
          'Browse available cases and choose one to start. Your career progresses as you complete cases. Check your stats and reputation in the Career section.',
        icon: <LayoutDashboard className="size-5 text-amber-500" />,
      },
    ],
  },
  intake: {
    steps: [
      {
        title: 'Client Briefing',
        description:
          "A client has come to you with a case. Review the briefing carefully — pay attention to what's NOT said. The missing information section reveals what you need to investigate.",
        icon: <FileSearch className="size-5 text-amber-500" />,
      },
    ],
  },
  strategy: {
    steps: [
      {
        title: 'Plan Your Approach',
        description:
          'Before negotiating, prepare your strategy. Estimate your BATNA (walk-away point), identify trade opportunities in the Issue Priority Matrix, and choose your opening approach.',
        icon: <Brain className="size-5 text-amber-500" />,
      },
    ],
  },
  investigation: {
    steps: [
      {
        title: 'Gather Intelligence',
        description:
          'Spend investigation points wisely to uncover hidden information. More intel leads to better negotiation outcomes. Some discoveries unlock special dialogue options.',
        icon: <Search className="size-5 text-amber-500" />,
      },
    ],
  },
  negotiation: {
    steps: [
      {
        title: 'The Negotiation Table',
        description:
          "Watch the live metrics on the right — trust and anger affect available choices. Different tactics work for different counterparts. Investigative questions often reveal the best paths.",
        icon: <MessageSquare className="size-5 text-amber-500" />,
      },
    ],
  },
  postmortem: {
    steps: [
      {
        title: 'Review Your Performance',
        description:
          "The radar chart shows your strengths and weaknesses. 'What You Missed' reveals hidden facts, and 'The Master Deal' shows the best possible outcome.",
        icon: <BarChart3 className="size-5 text-amber-500" />,
      },
    ],
  },
};

// Track which phases have had their tutorial shown this session
const shownPhasesThisSession = new Set<GamePhase>();

export function TutorialOverlay() {
  const phase = useGameStore((s) => s.phase);
  const tutorialCompleted = useGameStore((s) => s.tutorialCompleted);
  const setTutorialCompleted = useGameStore((s) => s.setTutorialCompleted);

  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Track phase changes to auto-show tutorial (React pattern: adjusting state when props change)
  const [prevPhase, setPrevPhase] = useState(phase);
  if (prevPhase !== phase) {
    setPrevPhase(phase);
    const tutorialConfig = TUTORIAL_CONTENT[phase];
    if (
      tutorialConfig &&
      phase !== 'title' &&
      phase !== 'career' &&
      !tutorialCompleted &&
      !shownPhasesThisSession.has(phase)
    ) {
      shownPhasesThisSession.add(phase);
      setCurrentStep(0);
      setIsVisible(true);
    }
  }

  const tutorialConfig = TUTORIAL_CONTENT[phase];

  // Listen for manual re-trigger from TutorialHelpButton
  useEffect(() => {
    const handleShowTutorial = () => {
      if (TUTORIAL_CONTENT[phase]) {
        shownPhasesThisSession.delete(phase);
        setCurrentStep(0);
        setDontShowAgain(false);
        setIsVisible(true);
      }
    };

    window.addEventListener('dealcraft:show-tutorial', handleShowTutorial);
    return () => window.removeEventListener('dealcraft:show-tutorial', handleShowTutorial);
  }, [phase]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    if (dontShowAgain) {
      setTutorialCompleted();
    }
  }, [dontShowAgain, setTutorialCompleted]);

  const handleNext = useCallback(() => {
    if (!tutorialConfig) return;
    if (currentStep < tutorialConfig.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  }, [currentStep, tutorialConfig, handleDismiss]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    if (dontShowAgain) {
      setTutorialCompleted();
    }
  }, [dontShowAgain, setTutorialCompleted]);

  // Keyboard support
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleNext, handleSkip]);

  if (!tutorialConfig || !isVisible) return null;

  const step = tutorialConfig.steps[currentStep];
  const isLastStep = currentStep === tutorialConfig.steps.length - 1;
  const totalSteps = tutorialConfig.steps.length;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="tutorial-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
            onClick={handleSkip}
          />

          {/* Tutorial Card */}
          <motion.div
            key="tutorial-card"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.05 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
          >
            <Card
              className="pointer-events-auto w-full max-w-md border-amber-500/30 bg-card shadow-2xl shadow-amber-500/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Amber accent bar */}
              <div className="h-1 rounded-t-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/25">
                      {step.icon || <Lightbulb className="size-5 text-amber-500" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-amber-500">
                        {step.title}
                      </CardTitle>
                      {totalSteps > 1 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Step {currentStep + 1} of {totalSteps}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground -mt-1 -mr-1"
                    onClick={handleSkip}
                    aria-label="Skip tutorial"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>

                {/* Progress dots for multi-step */}
                {totalSteps > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-4">
                    {tutorialConfig.steps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentStep
                            ? 'w-6 bg-amber-500'
                            : idx < currentStep
                            ? 'w-1.5 bg-amber-500/50'
                            : 'w-1.5 bg-muted-foreground/25'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex-col gap-3 border-t border-border/50 pt-4">
                <div className="flex items-center w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="dont-show-again"
                      checked={dontShowAgain}
                      onCheckedChange={(checked) =>
                        setDontShowAgain(checked === true)
                      }
                      className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <Label
                      htmlFor="dont-show-again"
                      className="text-xs text-muted-foreground cursor-pointer select-none"
                    >
                      Don&apos;t show tutorials
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isLastStep && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={handleSkip}
                      >
                        Skip
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
                      onClick={handleNext}
                    >
                      {isLastStep ? 'Got it!' : 'Next'}
                      {!isLastStep && <ChevronRight className="size-3.5" />}
                      {isLastStep && <Lightbulb className="size-3.5" />}
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Help button that can re-trigger the tutorial for the current phase
 */
export function TutorialHelpButton() {
  const phase = useGameStore((s) => s.phase);

  const handleHelp = useCallback(() => {
    // Re-show tutorial by dispatching a custom event that TutorialOverlay listens to
    if (TUTORIAL_CONTENT[phase]) {
      window.dispatchEvent(new CustomEvent('dealcraft:show-tutorial', { detail: { phase } }));
    }
  }, [phase]);

  if (!TUTORIAL_CONTENT[phase]) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/10"
      onClick={handleHelp}
      aria-label="Show tutorial"
      title="Show tutorial for this phase"
    >
      <HelpCircle className="size-4" />
    </Button>
  );
}
