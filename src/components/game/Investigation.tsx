'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/scenarios/types';
import type { BlackSwan } from '@/data/scenarios/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Shield,
  Sparkles,
} from 'lucide-react';

const RISK_COLORS = {
  low: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  high: 'text-red-400 bg-red-500/20 border-red-500/30',
};

export function Investigation() {
  const {
    currentScenarioId, setPhase,
    investigationPoints, maxInvestigationPoints,
    discoveredFacts, investigationHistory,
    spendInvestigationPoint,
  } = useGameStore();

  const scenario = currentScenarioId ? getScenarioById(currentScenarioId) : null;
  const [expandedFact, setExpandedFact] = useState<string | null>(null);
  const [revealedActions, setRevealedActions] = useState<Set<string>>(new Set(investigationHistory));
  const [actionResponses, setActionResponses] = useState<Record<string, string>>({});
  const [discoveryFlash, setDiscoveryFlash] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [discoveredSwans, setDiscoveredSwans] = useState<BlackSwan[]>([]);
  const [latestSwan, setLatestSwan] = useState<BlackSwan | null>(null);
  const prevFactsCount = useRef(discoveredFacts.length);

  // Track discovery flash animation - must be before early return
  useEffect(() => {
    if (discoveredFacts.length > prevFactsCount.current) {
      const latestFact = discoveredFacts[discoveredFacts.length - 1];
      if (latestFact) {
        const raf = requestAnimationFrame(() => {
          setDiscoveryFlash(latestFact);
        });
        const timer = setTimeout(() => setDiscoveryFlash(null), 800);
        prevFactsCount.current = discoveredFacts.length;
        return () => {
          cancelAnimationFrame(raf);
          clearTimeout(timer);
        };
      }
    }
    prevFactsCount.current = discoveredFacts.length;
  }, [discoveredFacts.length]);

  if (!scenario) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No case selected.</p>
        <Button variant="outline" onClick={() => setPhase('dashboard')} className="ml-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const { investigationActions } = scenario;
  const pointsUsed = maxInvestigationPoints - investigationPoints;
  const progressPercent = (pointsUsed / maxInvestigationPoints) * 100;

  const handleInvestigate = (actionId: string) => {
    if (investigationPoints <= 0) return;

    const action = investigationActions.find(a => a.id === actionId);
    if (!action || revealedActions.has(actionId)) return;

    spendInvestigationPoint(actionId, action.reveals);
    setRevealedActions(prev => new Set([...prev, actionId]));
    setActionResponses(prev => ({ ...prev, [actionId]: action.responseText }));

    // Check for Black Swan discovery
    if (scenario?.blackSwans) {
      for (const swan of scenario.blackSwans) {
        if (swan.discoveredVia.includes(actionId) && !discoveredSwans.find(s => s.id === swan.id)) {
          setDiscoveredSwans(prev => [...prev, swan]);
          setLatestSwan(swan);
          useGameStore.getState().discoverBlackSwan(swan.id);
          // Auto-hide after 5 seconds
          setTimeout(() => setLatestSwan(null), 5000);
        }
      }
    }
  };

  const handleProceed = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    useGameStore.getState().resetNegotiation();
    // Small delay to prevent AnimatePresence race conditions
    setTimeout(() => {
      setPhase('negotiation');
      setIsTransitioning(false);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setPhase('strategy')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Investigation Phase</h1>
              <p className="text-xs text-muted-foreground">{scenario.title}</p>
            </div>
          </div>
          <Badge variant="outline" className={CATEGORY_COLORS[scenario.category]}>
            {CATEGORY_LABELS[scenario.category]}
          </Badge>
        </motion.div>

        {/* Action Points Tracker */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card/50 border-border/50 glass-card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Investigation Points: {pointsUsed}/{maxInvestigationPoints}</span>
                </div>
                <div className="flex items-center gap-2">
                  {investigationPoints === 0 && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[11px]">
                      All Spent
                    </Badge>
                  )}
                </div>
              </div>
              <div className="investigation-progress-bar">
                <div
                  className="fill"
                  style={{ width: `${progressPercent}%` }}
                />
                {/* Milestone markers at 25%, 50%, 75%, 100% */}
                {[25, 50, 75, 100].map(milestone => (
                  <div
                    key={milestone}
                    className="progress-milestone"
                    style={{
                      left: `${milestone}%`,
                      opacity: progressPercent >= milestone ? 1 : 0.3,
                      background: progressPercent >= milestone ? 'oklch(0.77 0.16 75)' : 'oklch(1 0 0 / 15%)',
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Spend points wisely to uncover hidden information before the negotiation begins.
                </p>
                <div className="flex gap-0.5">
                  {Array.from({ length: maxInvestigationPoints }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i < pointsUsed ? 'bg-amber-500 scale-110' : 'bg-border/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Investigation Actions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Search className="h-4 w-4 text-violet-400" />
              Available Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {investigationActions.map((action, i) => {
                const isUsed = revealedActions.has(action.id);
                const isDisabled = isUsed || investigationPoints <= 0;
                const response = actionResponses[action.id];

                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card
                      className={`glass-card investigation-card risk-border-${action.riskLevel} ${
                        isUsed
                          ? 'opacity-60'
                          : 'cursor-pointer'
                      } ${discoveryFlash && action.reveals.includes(discoveryFlash) ? 'discovery-reveal' : ''}`}
                      onClick={() => !isDisabled && handleInvestigate(action.id)}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{action.name}</p>
                          <Badge variant="outline" className={`text-[11px] shrink-0 ${RISK_COLORS[action.riskLevel]}`}>
                            {action.riskLevel} risk
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Cost: {action.cost} point{action.cost > 1 ? 's' : ''}
                          </span>
                          {isUsed ? (
                            <Badge variant="outline" className="text-[11px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20 checkmark-animate">
                              ✓ Done
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isDisabled}
                              className="h-7 text-xs gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInvestigate(action.id);
                              }}
                            >
                              <Search className="h-3 w-3" />
                              Investigate
                            </Button>
                          )}
                        </div>

                        {/* Show response after investigation */}
                        <AnimatePresence>
                          {response && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pt-2 border-t border-border/30"
                            >
                              <p className="text-xs text-amber-200 italic leading-relaxed">{response}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {investigationActions.length === 0 && (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground text-sm">No investigation actions available for this case.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Intelligence Gathered Sidebar */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Intelligence Gathered
            </h2>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-2 pr-2">
                {discoveredFacts.length > 0 ? (
                  discoveredFacts.map((factId) => {
                    const isExpanded = expandedFact === factId;
                    const matchingAction = investigationActions.find(a => a.reveals.includes(factId));
                    return (
                      <Card key={factId} className={`bg-emerald-500/10 border-emerald-500/20 ${discoveryFlash === factId ? 'discovery-reveal' : ''}`}>
                        <CardContent className="p-3">
                          <button
                            onClick={() => setExpandedFact(isExpanded ? null : factId)}
                            className="w-full flex items-center justify-between gap-2 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span className="text-xs font-medium text-emerald-300">
                                {factId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </button>
                          <AnimatePresence>
                            {isExpanded && matchingAction && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-xs text-emerald-200 mt-2 leading-relaxed"
                              >
                                {matchingAction.responseText}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card className="bg-card/30 border-border/30">
                    <CardContent className="p-6 text-center">
                      <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">
                        No intelligence gathered yet. Spend investigation points to uncover information.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>

            {/* Black Swans Discovered */}
            {discoveredSwans.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <span>🦢</span>
                  Black Swans
                </h3>
                {discoveredSwans.map(swan => (
                  <Card key={swan.id} className="bg-violet-500/10 border-violet-500/20">
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                        <span className="text-xs font-medium text-violet-300">{swan.fact}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground ml-5.5">{swan.impact}</p>
                      <Badge variant="outline" className="text-[11px] bg-amber-500/10 text-amber-400 border-amber-500/20 ml-5.5">
                        +{swan.value} bonus
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Black Swan Discovery Popup */}
        <AnimatePresence>
          {latestSwan && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md"
            >
              <Card className="bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-transparent border-violet-500/30 shadow-lg shadow-violet-500/10">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🦢</span>
                    <div>
                      <p className="text-sm font-bold text-violet-300">Black Swan Discovered!</p>
                      <p className="text-[11px] text-muted-foreground">Unknown unknown that transforms the negotiation</p>
                    </div>
                  </div>
                  <p className="text-xs text-foreground font-medium">{latestSwan.fact}</p>
                  <p className="text-[11px] text-muted-foreground">{latestSwan.impact}</p>
                  <div className="flex items-center justify-between pt-1">
                    <Badge variant="outline" className="text-[11px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                      +{latestSwan.value} bonus points
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">📖 Voss Ch.10 — Find the Black Swan</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="animated-line" />

        {/* Proceed Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p className="text-xs text-muted-foreground">
            {investigationPoints > 0
              ? `You have ${investigationPoints} investigation point${investigationPoints > 1 ? 's' : ''} remaining. More intel leads to better outcomes.`
              : 'All investigation points spent. Ready to negotiate!'}
          </p>
          <Button
            onClick={handleProceed}
            disabled={isTransitioning}
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white gap-2 premium-button dramatic-glow relative z-30"
            size="lg"
          >
            {isTransitioning ? 'Loading...' : 'Proceed to Negotiation'}
            {!isTransitioning && <ArrowRight className="h-4 w-4" />}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
