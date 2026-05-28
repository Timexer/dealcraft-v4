'use client';

import { useEffect, useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/game-store';
import { useSound } from '@/hooks/use-sound';
import { Keyboard, X } from 'lucide-react';

// ─── Shortcut Definition ──────────────────────────────────────────

interface ShortcutDef {
  key: string;
  label: string;
  description: string;
  category: 'navigation' | 'game' | 'ui';
}

const SHORTCUTS: ShortcutDef[] = [
  { key: 'Escape', label: 'Esc', description: 'Go back / Close dialogs', category: 'navigation' },
  { key: '1-4', label: '1-4', description: 'Select choice 1-4 in negotiation', category: 'game' },
  { key: '?', label: '?', description: 'Show keyboard shortcuts', category: 'ui' },
  { key: 'G', label: 'G', description: 'Open glossary', category: 'ui' },
  { key: 'N', label: 'N', description: 'Toggle notification panel', category: 'ui' },
  { key: 'S', label: 'S', description: 'Toggle sound on/off', category: 'ui' },
  { key: 'T', label: 'T', description: 'Toggle tutorial', category: 'ui' },
  { key: 'R', label: 'R', description: 'Reset game (with confirmation)', category: 'ui' },
  { key: 'Space', label: 'Space', description: 'Advance dialogue (auto-advance/ending)', category: 'game' },
];

const CATEGORY_LABELS: Record<string, string> = {
  navigation: 'Navigation',
  game: 'Game',
  ui: 'Interface',
};

const CATEGORY_ICONS: Record<string, string> = {
  navigation: '🧭',
  game: '🎮',
  ui: '🖥️',
};

// ─── Keyboard Badge ───────────────────────────────────────────────

function KeyBadge({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md border border-amber-500/30 bg-amber-500/10 text-xs font-mono font-bold text-amber-400 shadow-sm">
      {children}
    </kbd>
  );
}

// ─── KeyboardShortcutsDialog ──────────────────────────────────────

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md p-0 gap-0 overflow-hidden border-amber-500/20 bg-card/95 backdrop-blur-xl"
        showCloseButton={false}
      >
        {/* Gold accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        <DialogHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-500/15 border border-amber-500/25">
                <Keyboard className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                  Keyboard Shortcuts
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Quick controls for power users
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => onOpenChange(false)}
              aria-label="Close shortcuts"
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-5 pb-5 space-y-4">
          {(['navigation', 'game', 'ui'] as const).map((category) => {
            const categoryShortcuts = SHORTCUTS.filter((s) => s.category === category);
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{CATEGORY_ICONS[category]}</span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {CATEGORY_LABELS[category]}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-sm text-foreground">{shortcut.description}</span>
                      <KeyBadge>{shortcut.label}</KeyBadge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Choice Hint Badge ────────────────────────────────────────────

export function ChoiceHintBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground ml-2">
      <kbd className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded border border-amber-500/20 bg-amber-500/5 text-[11px] font-mono font-bold text-amber-500">
        1-4
      </kbd>
    </span>
  );
}

// ─── Global Keyboard Handler Hook ─────────────────────────────────

export function useKeyboardShortcuts() {
  const { phase, setPhase } = useGameStore();
  const { soundEnabled, toggleSound } = useSound();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Dispatch custom events for other components to handle
      switch (e.key) {
        case 'Escape': {
          // Go back / close dialogs
          e.preventDefault();
          // Check if user is in an active case phase (show exit warning instead of navigating)
          const activeCasePhases = ['intake', 'strategy', 'investigation', 'negotiation'];
          const scenarioId = useGameStore.getState().currentScenarioId;
          if (activeCasePhases.includes(phase) && scenarioId !== null) {
            window.dispatchEvent(new CustomEvent('dealcraft:show-exit-warning'));
          } else {
            const backMap: Record<string, string> = {
              postmortem: 'negotiation',
              career: 'dashboard',
            };
            if (phase !== 'title' && phase !== 'dashboard') {
              setPhase((backMap[phase] as typeof phase) || 'dashboard');
            }
          }
          // Also dispatch a general escape event for dialogs
          window.dispatchEvent(new CustomEvent('dealcraft:escape'));
          break;
        }
        case '?': {
          // Show keyboard shortcuts help
          e.preventDefault();
          setShowShortcuts(true);
          break;
        }
        case 'g':
        case 'G': {
          // Open glossary
          e.preventDefault();
          setShowGlossary(true);
          break;
        }
        case 'n':
        case 'N': {
          // Toggle notification panel
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('dealcraft:toggle-notifications'));
          break;
        }
        case 's':
        case 'S': {
          // Toggle sound
          e.preventDefault();
          toggleSound();
          break;
        }
        case 't':
        case 'T': {
          // Toggle tutorial
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('dealcraft:show-tutorial'));
          break;
        }
        case 'r':
        case 'R': {
          // Show reset confirmation
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('dealcraft:show-reset'));
          break;
        }
        case ' ': {
          // Space: advance dialogue (only in negotiation phase)
          if (phase === 'negotiation') {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('dealcraft:advance-dialogue'));
          }
          break;
        }
        default: {
          // Number keys 1-4 for negotiation choices
          if (phase === 'negotiation') {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 4) {
              e.preventDefault();
              window.dispatchEvent(
                new CustomEvent('dealcraft:select-choice', { detail: { index: num - 1 } })
              );
            }
          }
          break;
        }
      }
    },
    [phase, setPhase, toggleSound]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    showShortcuts,
    setShowShortcuts,
    showGlossary,
    setShowGlossary,
  };
}
