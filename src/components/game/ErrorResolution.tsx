'use client';

/**
 * ErrorResolution — Friendly error resolution landing page.
 *
 * Shown when a navigation guard intercepts a back-action during
 * an active negotiation. Offers the player a clear explanation
 * and options to restore their session or return to dashboard.
 */
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/game-store';
import { getEmergencyCache, clearEmergencyCache } from '@/hooks/use-navigation-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, Home, ShieldCheck } from 'lucide-react';

export function ErrorResolution() {
  const { setPhase, updateNegotiation, setCurrentScenarioId } = useGameStore();
  const [cache, setCache] = useState<ReturnType<typeof getEmergencyCache>>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    const saved = getEmergencyCache();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCache(saved);
  }, []);

  const handleRestore = () => {
    if (!cache) return;
    setRestoring(true);

    try {
      // Restore the cached negotiation state
      if (cache.negotiation) {
        updateNegotiation(cache.negotiation as Partial<typeof cache.negotiation>);
      }
      if (cache.currentScenarioId) {
        setCurrentScenarioId(cache.currentScenarioId);
      }

      // Navigate back to the interrupted phase
      const targetPhase = cache.phase as 'negotiation' | 'investigation' | 'strategy';
      clearEmergencyCache();
      setPhase(targetPhase);
    } catch (err) {
      console.error('[ErrorResolution] Failed to restore cache:', err);
      clearEmergencyCache();
      setPhase('dashboard');
    } finally {
      setRestoring(false);
    }
  };

  const handleDashboard = () => {
    clearEmergencyCache();
    setPhase('dashboard');
  };

  const timeAgo = cache
    ? (() => {
        const seconds = Math.floor((Date.now() - cache.timestamp) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minute(s) ago`;
        return `${Math.floor(seconds / 3600)} hour(s) ago`;
      })()
    : '';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-card/80 backdrop-blur-md border-amber-500/20 shadow-lg shadow-amber-500/5">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"
            >
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </motion.div>
            <CardTitle className="text-xl font-bold">Session Interrupted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Your active negotiation was interrupted by a navigation action.
                This can happen when using the browser&apos;s back button during a
                live simulation thread.
              </p>
              <p className="text-sm text-muted-foreground">
                Don&apos;t worry — your progress has been safely cached.
              </p>
            </div>

            {cache && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-medium text-emerald-400">Recovery data available</span>
                </div>
                <div className="text-[11px] text-muted-foreground space-y-0.5 pl-6">
                  <p>Phase: <span className="text-foreground font-medium capitalize">{cache.phase}</span></p>
                  <p>Saved: <span className="text-foreground font-medium">{timeAgo}</span></p>
                  {cache.currentScenarioId && (
                    <p>Case: <span className="text-foreground font-medium">{cache.currentScenarioId}</span></p>
                  )}
                  <p>Choices made: <span className="text-foreground font-medium">
                    {(cache.negotiation as Record<string, unknown>)?.choicesMade
                      ? String(((cache.negotiation as Record<string, unknown>).choicesMade as unknown[]).length)
                      : '0'}
                  </span></p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              {cache && (
                <Button
                  onClick={handleRestore}
                  disabled={restoring}
                  className="h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {restoring ? 'Restoring...' : 'Resume Negotiation'}
                </Button>
              )}
              <Button
                onClick={handleDashboard}
                variant="outline"
                className="h-11 font-medium gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50"
              >
                <Home className="h-4 w-4" />
                Return to Dashboard
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground/60 text-center pt-1">
              Tip: Use the in-app navigation buttons instead of the browser&apos;s back button
              to avoid interrupting active simulations.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
