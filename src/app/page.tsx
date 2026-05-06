'use client';

import { useGameStore } from '@/store/game-store';
import { TitleScreen } from '@/components/game/TitleScreen';
import { Dashboard } from '@/components/game/Dashboard';
import { CaseIntake } from '@/components/game/CaseIntake';
import { StrategyBoard } from '@/components/game/StrategyBoard';
import { Investigation } from '@/components/game/Investigation';
import { NegotiationTable } from '@/components/game/NegotiationTable';
import { Postmortem } from '@/components/game/Postmortem';
import { CareerProgression } from '@/components/game/CareerProgression';
import { GameHeader } from '@/components/game/GameHeader';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeToggle } from '@/components/game/ThemeToggle';
import { TutorialOverlay, TutorialHelpButton } from '@/components/game/TutorialOverlay';

export default function Home() {
  const phase = useGameStore((s) => s.phase);

  const renderPhase = () => {
    switch (phase) {
      case 'title':
        return <TitleScreen />;
      case 'dashboard':
        return <Dashboard />;
      case 'intake':
        return <CaseIntake />;
      case 'strategy':
        return <StrategyBoard />;
      case 'investigation':
        return <Investigation />;
      case 'negotiation':
        return <NegotiationTable />;
      case 'postmortem':
        return <Postmortem />;
      case 'career':
        return <CareerProgression />;
      default:
        return <TitleScreen />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <GameHeader />
      <div className="fixed top-2 right-2 z-50 flex items-center gap-1">
        <TutorialHelpButton />
        <ThemeToggle />
      </div>
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {renderPhase()}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="mt-auto bg-background/80 backdrop-blur-sm py-3 px-4 text-center border-t border-border/30">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent mb-3" />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-[11px] text-muted-foreground/60">
          <span className="font-semibold tracking-wider text-amber-500/80">DEALCRAFT</span>
          <span className="hidden sm:inline text-border/50">·</span>
          <span>Negotiation Career Simulator</span>
          <span className="hidden sm:inline text-border/50">·</span>
          <span>Season 1</span>
          <span className="hidden sm:inline text-border/50">·</span>
          <span>v2.0</span>
          <span className="hidden sm:inline text-border/50">·</span>
          <span>30 Cases · 8 Endings</span>
        </div>
      </footer>
      <TutorialOverlay />
    </div>
  );
}
