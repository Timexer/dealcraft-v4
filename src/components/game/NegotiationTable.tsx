'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { CHOICE_TYPE_STYLES, type DialogueNode, type DialogueChoice, type BiasEvent } from '@/data/scenarios/types';
import { getEndingFromNegotiation, calculateFinalScore, getScoreGrade, calculateReputationDelta, calculateStatsDelta } from '@/lib/game-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BiasTrapAlertContainer } from '@/components/game/BiasTrapAlert';
import { InGameAdvisor } from '@/components/game/InGameAdvisor';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Flame,
  Hourglass,
  TrendingUp,
  Handshake,
  CheckCircle2,
  Info,
  Eye,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface DialogueEntry {
  node: DialogueNode;
  chosenChoiceId?: string;
  chosenChoiceText?: string;
}

function getStartNode(scenario: ReturnType<typeof getScenarioById>): DialogueNode | null {
  if (!scenario) return null;
  return scenario.dialogueTree.find(n => n.id === 'start') || null;
}

export function NegotiationTable() {
  const {
    currentScenarioId, setPhase,
    negotiation, updateNegotiation, makeChoice, addCaseResult, replayCaseResult,
    discoveredFacts, addStats, addReputation, isReplay,
  } = useGameStore();

  const scenario = currentScenarioId ? getScenarioById(currentScenarioId) : null;

  // Initialize with start node via lazy state
  const startNode = useMemo(() => getStartNode(scenario), [scenario]);

  const [dialogueHistory, setDialogueHistory] = useState<DialogueEntry[]>(() => {
    const node = getStartNode(scenario);
    return node ? [{ node }] : [];
  });
  const [currentNode, setCurrentNode] = useState<DialogueNode | null>(() => getStartNode(scenario));
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [activeBiasAlerts, setActiveBiasAlerts] = useState<BiasEvent[]>([]);
  const dialogueEndRef = useRef<HTMLDivElement>(null);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);
  const currentNodeIdRef = useRef<string | null>(currentNode?.id || null);

  // Update ref when currentNode changes
  useEffect(() => {
    currentNodeIdRef.current = currentNode?.id || null;
  }, [currentNode?.id]);

  const triggerBiasTrap = useCallback((biasEvent: BiasEvent) => {
    const neg = useGameStore.getState().negotiation;
    if (neg.biasTrapsTriggered.includes(biasEvent.id)) return;

    // Add to negotiation state
    updateNegotiation({
      biasTrapsTriggered: [...neg.biasTrapsTriggered, biasEvent.id],
    });

    // Show the alert
    setActiveBiasAlerts(prev => {
      if (prev.find(a => a.id === biasEvent.id)) return prev;
      return [...prev, biasEvent];
    });
  }, [updateNegotiation]);

  const dismissBiasAlert = useCallback((id: string) => {
    setActiveBiasAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const advanceToNode = useCallback((nodeId: string) => {
    if (!scenario) return;
    const nextNode = scenario.dialogueTree.find(n => n.id === nodeId);
    if (nextNode) {
      setCurrentNode(nextNode);
      setDialogueHistory(prev => [...prev, { node: nextNode }]);
    }
  }, [scenario]);

  // Check for bias traps triggered by dialogue node
  useEffect(() => {
    if (!scenario || !currentNode) return;

    const neg = useGameStore.getState().negotiation;
    const trapsToTrigger: BiasEvent[] = [];
    for (const biasTrap of scenario.biasTraps) {
      if (biasTrap.triggerDialogueNodeId && biasTrap.triggerDialogueNodeId === currentNode.id) {
        if (!neg.biasTrapsTriggered.includes(biasTrap.id)) {
          trapsToTrigger.push(biasTrap);
        }
      }
    }

    if (trapsToTrigger.length > 0) {
      // Defer setState calls to avoid synchronous setState in effect
      const rafId = requestAnimationFrame(() => {
        for (const trap of trapsToTrigger) {
          triggerBiasTrap(trap);
        }
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [currentNode?.id, scenario, triggerBiasTrap]);

  // Apply node effects when entering a new node (defensive: ensure effects is always an object)
  useEffect(() => {
    if (!currentNode || !currentNode.effects) return;

    const eff = currentNode.effects || {};
    const effects: Record<string, number> = {};
    if (eff.trust) effects.trust = eff.trust;
    if (eff.anger) effects.anger = eff.anger;
    if (eff.patience) effects.patience = eff.patience;
    if (eff.valueClaimed) effects.valueClaimed = eff.valueClaimed;
    if (eff.valueCreated) effects.valueCreated = eff.valueCreated;
    if (eff.relationshipImpact) effects.relationshipImpact = eff.relationshipImpact;
    if (eff.ethicalImpact) effects.ethicalImpact = eff.ethicalImpact;
    if (eff.clientSatisfaction) effects.clientSatisfaction = eff.clientSatisfaction;
    if (eff.counterpartySatisfaction) effects.counterpartySatisfaction = eff.counterpartySatisfaction;

    if (Object.keys(effects).length > 0) {
      useGameStore.getState().applyEffects(effects);
    }

    if (eff.informationRevealed && eff.informationRevealed.length > 0) {
      updateNegotiation({
        informationRevealed: [...new Set([...useGameStore.getState().negotiation.informationRevealed, ...eff.informationRevealed])],
      });
    }

    if (eff.concessionMade) {
      updateNegotiation({
        concessionsGiven: [...useGameStore.getState().negotiation.concessionsGiven, eff.concessionMade],
      });
    }
  // We intentionally only depend on the node ID, not the full negotiation state
  }, [currentNode?.id, updateNegotiation]);

  // Typing animation & auto-advance - use requestAnimationFrame to defer state updates
  useEffect(() => {
    if (!currentNode) return;

    // Use rAF to defer the synchronous setState out of the effect body
    const rafId = requestAnimationFrame(() => {
      setIsTyping(true);
      setShowChoices(false);
    });

    const typingDuration = Math.min(1500, currentNode.text.length * 15);

    const typingTimer = setTimeout(() => {
      setIsTyping(false);

      if (currentNode.isAuto && currentNode.nextNodeId) {
        setShowChoices(false);
        autoAdvanceRef.current = setTimeout(() => {
          advanceToNode(currentNode.nextNodeId!);
        }, 2000);
      } else {
        setShowChoices(true);
      }
    }, typingDuration);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(typingTimer);
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, [currentNode?.id, advanceToNode]);

  // Scroll to bottom on new messages
  useEffect(() => {
    dialogueEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueHistory.length, isTyping]);

  const handleChoiceClick = useCallback((choice: DialogueChoice) => {
    const neg = useGameStore.getState().negotiation;
    const facts = useGameStore.getState().discoveredFacts;

    // Check requirements
    if (choice.requirement) {
      if (choice.requirement.type === 'info_discovered') {
        const allInfo = [...facts, ...neg.informationRevealed];
        if (!allInfo.includes(choice.requirement.factId)) return;
      }
      if (choice.requirement.type === 'min_trust' && neg.trust < choice.requirement.value) return;
      if (choice.requirement.type === 'max_anger' && neg.anger > choice.requirement.value) return;
    }

    // Apply choice effects (defensive: ensure effects is always an object)
    const eff = choice.effects || {};
    const effects: Record<string, number> = {};
    if (eff.trust) effects.trust = eff.trust;
    if (eff.anger) effects.anger = eff.anger;
    if (eff.patience) effects.patience = eff.patience;
    if (eff.valueClaimed) effects.valueClaimed = eff.valueClaimed;
    if (eff.valueCreated) effects.valueCreated = eff.valueCreated;
    if (eff.relationshipImpact) effects.relationshipImpact = eff.relationshipImpact;
    if (eff.ethicalImpact) effects.ethicalImpact = eff.ethicalImpact;
    if (eff.clientSatisfaction) effects.clientSatisfaction = eff.clientSatisfaction;
    if (eff.counterpartySatisfaction) effects.counterpartySatisfaction = eff.counterpartySatisfaction;
    if (eff.reputationImpact) effects.reputationImpact = eff.reputationImpact;

    const infoRevealed = Array.isArray(eff.informationRevealed) ? eff.informationRevealed : [];

    makeChoice(choice.id, effects, infoRevealed.length > 0 ? infoRevealed : undefined);

    // Check for pattern-based bias traps
    if (scenario) {
      const updatedChoices = [...neg.choicesMade, choice.id];

      // Re-scan all choices to count aggressive_anchor choices
      // We need to look at the dialogue tree to find the choice types
      let aggressiveAnchorCount = 0;
      for (const choiceId of updatedChoices) {
        for (const node of scenario.dialogueTree) {
          if (node.choices) {
            const found = node.choices.find(c => c.id === choiceId);
            if (found && found.type === 'aggressive_anchor') {
              aggressiveAnchorCount++;
              break;
            }
          }
        }
      }

      // Fixed-pie bias: 3+ aggressive_anchor choices
      if (aggressiveAnchorCount >= 3) {
        const fixedPieTrap = scenario.biasTraps.find(b => b.type === 'fixed_pie' && !b.triggerDialogueNodeId);
        if (fixedPieTrap && !neg.biasTrapsTriggered.includes(fixedPieTrap.id)) {
          triggerBiasTrap(fixedPieTrap);
        }
      }

      // Escalation bias: anger > 70 and another aggressive_anchor
      if (neg.anger > 70 && choice.type === 'aggressive_anchor') {
        const escalationTrap = scenario.biasTraps.find(b => b.type === 'escalation' && !b.triggerDialogueNodeId);
        if (escalationTrap && !neg.biasTrapsTriggered.includes(escalationTrap.id)) {
          triggerBiasTrap(escalationTrap);
        }
      }
    }

    // Update history entry with chosen choice
    setDialogueHistory(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        chosenChoiceId: choice.id,
        chosenChoiceText: choice.text,
      };
      return updated;
    });

    setShowChoices(false);

    // Advance to next node
    if (choice.nextNodeId) {
      setTimeout(() => advanceToNode(choice.nextNodeId), 300);
    }
  }, [advanceToNode, makeChoice, scenario, triggerBiasTrap]);

  const isChoiceDisabled = (choice: DialogueChoice): boolean => {
    if (!choice.requirement) return false;
    if (choice.requirement.type === 'info_discovered') {
      const allInfo = [...discoveredFacts, ...negotiation.informationRevealed];
      return !allInfo.includes(choice.requirement.factId);
    }
    if (choice.requirement.type === 'min_trust') return negotiation.trust < choice.requirement.value;
    if (choice.requirement.type === 'max_anger') return negotiation.anger > choice.requirement.value;
    return false;
  };

  const getDisabledReason = (choice: DialogueChoice): string => {
    if (!choice.requirement) return choice.disabledReason || 'Requirements not met';
    if (choice.requirement.type === 'info_discovered') {
      return 'Requires discovered information you haven\'t found yet';
    }
    if (choice.requirement.type === 'min_trust') {
      return `Requires trust level of ${choice.requirement.value} (current: ${negotiation.trust})`;
    }
    if (choice.requirement.type === 'max_anger') {
      return `Requires anger level below ${choice.requirement.value} (current: ${negotiation.anger})`;
    }
    return choice.disabledReason || 'Requirements not met';
  };

  const isEndingNode = currentNode?.id.startsWith('ending_');

  const handleViewResults = () => {
    if (!scenario || !currentNode) return;

    const endingType = getEndingFromNegotiation(scenario, {
      ...negotiation,
      currentDialogueNodeId: currentNode.id,
    });

    const ending = scenario.endings.find(e => e.type === endingType) || scenario.endings[0];
    const finalScore = calculateFinalScore(ending.scores);

    const caseResult = {
      scenarioId: scenario.id,
      outcome: endingType,
      scores: ending.scores,
      finalScore,
      choicesMade: negotiation.choicesMade,
      hiddenFactsFound: negotiation.informationRevealed,
      postmortemRead: false,
    };

    if (isReplay) {
      replayCaseResult(caseResult);
    } else {
      addCaseResult(caseResult);
    }

    // Apply reputation and stats
    const repDelta = calculateReputationDelta(scenario, endingType);
    addReputation(repDelta);

    const totalInfo = scenario.investigationActions.reduce((sum, a) => sum + a.reveals.length, 0);
    const infoFound = negotiation.informationRevealed.length + discoveredFacts.length;
    const statsDelta = calculateStatsDelta(scenario, endingType, infoFound, totalInfo);
    addStats(statsDelta);

    // Store ending info for postmortem
    updateNegotiation({ endingTriggered: endingType });
    setPhase('postmortem');
  };

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

  const { counterparty, client, title } = scenario;

  // Emotion indicator helper
  const getEmotionIndicator = (trust: number, anger: number) => {
    if (trust >= 70 && anger <= 30) return { emoji: '😊', label: 'Receptive' };
    if (trust >= 50 && anger <= 50) return { emoji: '😐', label: 'Neutral' };
    if (anger >= 70) return { emoji: '😤', label: 'Hostile' };
    if (anger >= 50) return { emoji: '😠', label: 'Frustrated' };
    if (trust <= 30) return { emoji: '🤨', label: 'Suspicious' };
    return { emoji: '😐', label: 'Guarded' };
  };

  const emotion = getEmotionIndicator(negotiation.trust, negotiation.anger);

  const speakerStyles: Record<string, string> = {
    narrator: 'narrator-text text-muted-foreground bg-muted/20',
    counterparty: 'text-foreground bg-card/50 border-l-2 border-cyan-500/40 shadow-sm shadow-cyan-500/5',
    client: 'text-foreground bg-amber-500/10 border-l-2 border-amber-500/40 shadow-sm shadow-amber-500/5',
    advisor: 'text-amber-200 bg-amber-500/10 border-l-2 border-amber-400/50 shadow-sm shadow-amber-400/5',
  };

  const speakerLabels: Record<string, { label: string; icon: string }> = {
    narrator: { label: 'Narrator', icon: '📖' },
    counterparty: { label: counterparty.name, icon: counterparty.avatar },
    client: { label: client.name, icon: client.avatar },
    advisor: { label: 'Advisor', icon: '💡' },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

      {/* Top Bar */}
      <div className="relative border-b border-border/50 bg-card/30 backdrop-blur-sm px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{counterparty.avatar}</div>
            <div>
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="text-xs text-muted-foreground">vs. {counterparty.name}, {counterparty.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">{emotion.emoji}</span>
              <Badge variant="outline" className="text-[10px]">
                {emotion.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex max-w-6xl w-full mx-auto">
        {/* Dialogue Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4 sm:p-6">
            <div className="space-y-3 max-w-2xl mx-auto">
              {dialogueHistory.map((entry, i) => (
                <div key={`${entry.node.id}-${i}`}>
                  {/* Message Bubble */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`p-3 rounded-lg ${speakerStyles[entry.node.speaker]}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{speakerLabels[entry.node.speaker]?.icon}</span>
                      <span className="text-xs font-semibold">
                        {speakerLabels[entry.node.speaker]?.label}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{entry.node.text}</p>
                  </motion.div>

                  {/* Chosen choice display */}
                  {entry.chosenChoiceText && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mt-2 ml-8 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20"
                    >
                      <p className="text-xs text-amber-300">
                        → {entry.chosenChoiceText}
                      </p>
                    </motion.div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && currentNode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-3 rounded-lg ${speakerStyles[currentNode.speaker]}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{speakerLabels[currentNode.speaker]?.icon}</span>
                    <span className="text-xs font-semibold">
                      {speakerLabels[currentNode.speaker]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-amber-400 rounded-full typing-dot" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-amber-400 rounded-full typing-dot" style={{ animationDelay: '200ms' }} />
                    <span className="w-2 h-2 bg-amber-400 rounded-full typing-dot" style={{ animationDelay: '400ms' }} />
                  </div>
                </motion.div>
              )}

              <div ref={dialogueEndRef} />
            </div>
          </ScrollArea>

          {/* Choice Area */}
          <div className="border-t border-border/50 bg-card/30 backdrop-blur-sm p-4">
            <div className="max-w-2xl mx-auto">
              <AnimatePresence>
                {showChoices && currentNode?.choices && !isEndingNode && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <p className="text-xs text-muted-foreground mb-2">Choose your response:</p>
                    <TooltipProvider delayDuration={300}>
                      {currentNode.choices.map((choice) => {
                        const disabled = isChoiceDisabled(choice);
                        const style = CHOICE_TYPE_STYLES[choice.type];

                        return (
                          <Tooltip key={choice.id}>
                            <TooltipTrigger asChild>
                              <motion.button
                                whileHover={!disabled ? { scale: 1.015, boxShadow: '0 0 16px oklch(0.77 0.16 75 / 12%)' } : {}}
                                whileTap={!disabled ? { scale: 0.985 } : {}}
                                onClick={() => !disabled && handleChoiceClick(choice)}
                                disabled={disabled}
                                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 choice-hover-trail ${
                                  disabled
                                    ? 'opacity-40 cursor-not-allowed bg-muted/20 border-border/20'
                                    : `${style.color} cursor-pointer hover:border-amber-500/30`
                                }`}
                              >
                                <span className="text-lg shrink-0">{style.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{choice.text}</p>
                                  <p className="text-[10px] opacity-70 mt-0.5">{style.label}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                              </motion.button>
                            </TooltipTrigger>
                            {disabled && (
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-xs">{getDisabledReason(choice)}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        );
                      })}
                    </TooltipProvider>
                  </motion.div>
                )}

                {/* Ending node - View Results */}
                {isEndingNode && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <p className="text-lg font-bold mb-4">The negotiation has concluded.</p>
                      <motion.div
                        animate={{ boxShadow: [
                          '0 0 20px oklch(0.77 0.16 75 / 15%)',
                          '0 0 30px oklch(0.77 0.16 75 / 25%)',
                          '0 0 20px oklch(0.77 0.16 75 / 15%)',
                        ] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Button
                          onClick={handleViewResults}
                          size="lg"
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold gap-2 text-base px-8 h-12 premium-button"
                        >
                          View Results
                          <TrendingUp className="h-5 w-5" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Desktop only */}
        <div className="hidden lg:block w-72 border-l border-border/50 bg-card/20 backdrop-blur-sm p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Metrics</h3>

          {/* Trust Meter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5" />
                Trust
              </span>
              <span className={`text-xs font-bold ${negotiation.trust >= 60 ? 'text-emerald-400' : negotiation.trust >= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                {negotiation.trust}
              </span>
            </div>
            <Progress value={negotiation.trust} className="h-1.5" />
          </div>

          {/* Anger Meter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" />
                Anger
              </span>
              <span className={`text-xs font-bold ${negotiation.anger >= 60 ? 'text-red-400' : negotiation.anger >= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {negotiation.anger}
              </span>
            </div>
            <Progress value={negotiation.anger} className="h-1.5" />
          </div>

          {/* Patience Meter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs flex items-center gap-1.5">
                <Hourglass className="h-3.5 w-3.5" />
                Patience
              </span>
              <span className="text-xs font-bold text-cyan-400">{negotiation.patience}</span>
            </div>
            <Progress value={negotiation.patience} className="h-1.5" />
          </div>

          <Separator />

          {/* Value Counters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Value Claimed
              </span>
              <span className="text-xs font-bold text-amber-400">{negotiation.valueClaimed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs flex items-center gap-1.5">
                <Handshake className="h-3.5 w-3.5" />
                Value Created
              </span>
              <span className="text-xs font-bold text-emerald-400">{negotiation.valueCreated}</span>
            </div>
          </div>

          <Separator />

          {/* Issues Resolved */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Issues Resolved
            </h4>
            {Object.keys(negotiation.issuesResolved).length > 0 ? (
              Object.entries(negotiation.issuesResolved).map(([issue, value]) => (
                <div key={issue} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span className="text-[10px] text-muted-foreground">{issue}: {value}</span>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-muted-foreground">No issues resolved yet</p>
            )}
          </div>

          <Separator />

          {/* Discovered Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Discovered Info
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[...discoveredFacts, ...negotiation.informationRevealed].map((fact) => (
                <Badge key={fact} variant="outline" className="text-[9px] px-1.5 py-0 bg-violet-500/10 text-violet-300 border-violet-500/20">
                  <Eye className="h-2.5 w-2.5 mr-1" />
                  {fact.replace(/_/g, ' ')}
                </Badge>
              ))}
              {[...discoveredFacts, ...negotiation.informationRevealed].length === 0 && (
                <p className="text-[10px] text-muted-foreground">No info discovered yet</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Bias Traps Triggered */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              Bias Traps
            </h4>
            {negotiation.biasTrapsTriggered.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {negotiation.biasTrapsTriggered.map((trapId) => {
                  const trap = scenario?.biasTraps.find(b => b.id === trapId);
                  const BIAS_SIDEBAR_ICONS: Record<string, string> = {
                    anchor_shock: '⚠️',
                    fixed_pie: '🎯',
                    escalation: '🔥',
                    vividness: '👁️',
                    egocentrism: '🧠',
                    overconfidence: '💎',
                    regret_aversion: '😰',
                  };
                  return (
                    <Badge key={trapId} variant="outline" className="text-[9px] px-1.5 py-0 bg-amber-500/10 text-amber-300 border-amber-500/20">
                      {BIAS_SIDEBAR_ICONS[trap?.type || ''] || '⚠️'}
                      <span className="ml-1">{trap?.type.replace(/_/g, ' ') || trapId}</span>
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground">No bias traps triggered yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Bias Trap Alerts */}
      <BiasTrapAlertContainer
        activeAlerts={activeBiasAlerts}
        onDismiss={dismissBiasAlert}
      />

      {/* In-Game Advisor */}
      <InGameAdvisor
        negotiation={negotiation}
        discoveredFacts={discoveredFacts}
        scenarioCategory={scenario.category}
      />

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <MobileSidebar
          negotiation={negotiation}
          discoveredFacts={discoveredFacts}
        />
      </div>
    </div>
  );
}

// Mobile sidebar as a dialog/drawer
function MobileSidebar({ negotiation, discoveredFacts }: {
  negotiation: {
    trust: number;
    anger: number;
    patience: number;
    valueClaimed: number;
    valueCreated: number;
    issuesResolved: Record<string, string>;
    informationRevealed: string[];
  };
  discoveredFacts: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="rounded-full bg-card/80 backdrop-blur-sm border-border/50 gap-1.5 shadow-lg"
      >
        <TrendingUp className="h-4 w-4" />
        Metrics
      </Button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-16 right-4 left-4 z-50 max-h-[60vh] overflow-y-auto rounded-xl bg-card border border-border/50 p-4 shadow-xl"
            >
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Metrics</h3>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <Heart className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
                    <p className="text-xs text-muted-foreground">Trust</p>
                    <p className="text-sm font-bold">{negotiation.trust}</p>
                  </div>
                  <div className="text-center">
                    <Flame className="h-4 w-4 mx-auto mb-1 text-red-400" />
                    <p className="text-xs text-muted-foreground">Anger</p>
                    <p className="text-sm font-bold">{negotiation.anger}</p>
                  </div>
                  <div className="text-center">
                    <Hourglass className="h-4 w-4 mx-auto mb-1 text-cyan-400" />
                    <p className="text-xs text-muted-foreground">Patience</p>
                    <p className="text-sm font-bold">{negotiation.patience}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Value Claimed</p>
                    <p className="text-sm font-bold text-amber-400">{negotiation.valueClaimed}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Value Created</p>
                    <p className="text-sm font-bold text-emerald-400">{negotiation.valueCreated}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Discovered Info</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[...discoveredFacts, ...negotiation.informationRevealed].map((fact) => (
                      <Badge key={fact} variant="outline" className="text-[9px] px-1.5 py-0 bg-violet-500/10 text-violet-300 border-violet-500/20">
                        {fact.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
