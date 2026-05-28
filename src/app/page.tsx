'use client';

import { useGameStore } from '@/store/game-store';
import { TitleScreen } from '@/components/game/TitleScreen';
import { Dashboard } from '@/components/game/Dashboard';
import { CaseIntake } from '@/components/game/CaseIntake';
import { StrategyBoard } from '@/components/game/StrategyBoard';
import { Investigation } from '@/components/game/Investigation';
import { PreNegotiation } from '@/components/game/PreNegotiation';
import { NegotiationTable } from '@/components/game/NegotiationTable';
import { Postmortem } from '@/components/game/Postmortem';
import { CareerProgression } from '@/components/game/CareerProgression';
import { CaseHistory } from '@/components/game/CaseHistory';
import { GameHeader } from '@/components/game/GameHeader';
import { AnimatePresence, motion } from 'framer-motion';
import { TutorialOverlay } from '@/components/game/TutorialOverlay';
import { KeyboardShortcutsDialog, useKeyboardShortcuts } from '@/components/game/KeyboardShortcuts';

export default function Home() {
  const phase = useGameStore((s) => s.phase);

  // Global keyboard shortcuts handler
  const { showShortcuts, setShowShortcuts, showGlossary, setShowGlossary } = useKeyboardShortcuts();

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
      case 'pre-negotiation':
        return <PreNegotiation />;
      case 'negotiation':
        return <NegotiationTable />;
      case 'postmortem':
        return <Postmortem />;
      case 'career':
        return <CareerProgression />;
      case 'case_history':
        return <CaseHistory />;
      default:
        return <TitleScreen />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <GameHeader />
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
      {/* BUG-002 fix: footer z-index lower than CTA buttons, sticky not fixed */}
      <footer className="mt-auto bg-background/80 backdrop-blur-sm py-3 px-4 text-center border-t border-border/30 relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--theme-primary)]/20 to-transparent mb-2" />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-xs text-muted-foreground">
          <span>© 2026 by Timothy Hannum</span>
          <span className="hidden sm:inline text-muted-foreground/50">·</span>
          <span>Englishbreakfast.pl</span>
        </div>
      </footer>
      <TutorialOverlay />

      {/* Global Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
    </div>
  );
}
