'use client';

import { useGameStore } from '@/store/game-store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, LogOut, ShieldAlert } from 'lucide-react';

interface ExitWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTIVE_CASE_PHASES = ['intake', 'strategy', 'investigation', 'negotiation'] as const;

export function ExitWarningDialog({ open, onOpenChange }: ExitWarningDialogProps) {
  const { clearCaseSession, setPhase, phase, currentScenarioId } = useGameStore();

  // Only relevant when in an active case phase with a scenario loaded
  const isActiveCase = ACTIVE_CASE_PHASES.includes(phase as typeof ACTIVE_CASE_PHASES[number]) && currentScenarioId !== null;

  const handleLeave = () => {
    clearCaseSession();
    setPhase('dashboard');
    onOpenChange(false);
  };

  // If not an active case, don't render the dialog content meaningfully
  if (!isActiveCase) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border-amber-500/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
            </div>
            Leave Case?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your progress in this case will be lost. Are you sure you want to leave?
              </p>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-1.5">
                <p className="text-xs font-medium text-amber-400">Progress that will be lost:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-amber-400" />Investigation findings and discovered facts</li>
                  <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-amber-400" />Strategy choices (alternative estimate, walk-away point, target outcome, opening strategy)</li>
                  <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-amber-400" />Negotiation dialogue progress and choices</li>
                  <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-amber-400" />Case notes and discovered black swans</li>
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="mt-0">Stay in Case</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeave}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold mt-0"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Leave Case
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
