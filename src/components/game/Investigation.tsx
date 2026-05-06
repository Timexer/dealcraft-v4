'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/scenarios/types';
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
  };

  const handleProceed = () => {
    useGameStore.getState().resetNegotiation();
    setPhase('negotiation');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
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
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Investigation Points</span>
                </div>
                <span className="text-sm font-bold text-amber-400">
                  {investigationPoints}/{maxInvestigationPoints}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Spend points wisely to uncover hidden information before the negotiation begins.
              </p>
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
                      className={`bg-card/50 border-border/50 transition-all ${
                        isUsed ? 'opacity-60' : 'hover:border-amber-500/30 cursor-pointer'
                      }`}
                      onClick={() => !isDisabled && handleInvestigate(action.id)}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{action.name}</p>
                          <Badge variant="outline" className={`text-[10px] shrink-0 ${RISK_COLORS[action.riskLevel]}`}>
                            {action.riskLevel} risk
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Cost: {action.cost} point{action.cost > 1 ? 's' : ''}
                          </span>
                          {isUsed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
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
                              <p className="text-xs text-amber-200/80 italic leading-relaxed">{response}</p>
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
                      <Card key={factId} className="bg-emerald-500/10 border-emerald-500/20">
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
                                className="text-xs text-emerald-200/70 mt-2 leading-relaxed"
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
                      <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">
                        No intelligence gathered yet. Spend investigation points to uncover information.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <Separator />

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
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
            size="lg"
          >
            Proceed to Negotiation
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
