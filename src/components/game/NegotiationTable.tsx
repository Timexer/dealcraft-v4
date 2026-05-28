'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { CHOICE_TYPE_STYLES, type DialogueNode, type DialogueChoice, type BiasEvent, type TranscriptEntry } from '@/data/scenarios/types';
import { getEndingFromNegotiation, calculateFinalScore, calculateDynamicScores, calculateReputationDelta, calculateStatsDelta, type BehaviorContext } from '@/lib/game-engine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BiasTrapAlertContainer } from '@/components/game/BiasTrapAlert';
import { InGameAdvisor } from '@/components/game/InGameAdvisor';
import { ChoiceHintBadge } from '@/components/game/KeyboardShortcuts';
import { TechniqueBadge } from '@/components/game/TechniqueBadge';
import { useSound } from '@/hooks/use-sound';
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
  GitBranch,
  Clock,
  Compass,
  Activity,
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

const formatDialogueText = (text: string) => {
  if (!text) return '';
  const parts = text.split('*');
  if (parts.length === 1) return text;
  return parts.map((part, index) => {
    // Odd indices are text inside asterisks (i.e. *action*)
    if (index % 2 !== 0) {
      return (
        <span key={index} className="italic text-muted-foreground font-light">
          {part}
        </span>
      );
    }
    return part;
  });
};


export function NegotiationTable() {
  const {
    currentScenarioId, setPhase,
    negotiation, updateNegotiation, makeChoice, addCaseResult, replayCaseResult,
    discoveredFacts, addStats, addReputation, isReplay,
    challengeMode, challengeTimer, setChallengeTimer,
    negotiationStartTime, setNegotiationStartTime,
    techniquesUsed, addTechniqueUsed,
  } = useGameStore();

  const scenario = currentScenarioId ? getScenarioById(currentScenarioId) : null;

  // Initialize from store's currentDialogueNodeId if available (for page reload restoration)
  const getInitialNode = useCallback((): DialogueNode | null => {
    if (!scenario) return null;
    const savedNodeId = useGameStore.getState().negotiation.currentDialogueNodeId;
    if (savedNodeId && savedNodeId !== 'start') {
      const savedNode = scenario.dialogueTree.find(n => n.id === savedNodeId);
      if (savedNode) return savedNode;
    }
    return getStartNode(scenario);
  }, [scenario]);

  // Build initial dialogue history by replaying from start to current node
  const getInitialHistory = useCallback((): DialogueEntry[] => {
    if (!scenario) return [];
    const savedNodeId = useGameStore.getState().negotiation.currentDialogueNodeId;
    const startNode = getStartNode(scenario);
    if (!startNode) return [];

    // If we have a saved node and it's not start, rebuild the path
    if (savedNodeId && savedNodeId !== 'start') {
      const choicesMade = useGameStore.getState().negotiation.choicesMade;
      const history: DialogueEntry[] = [{ node: startNode }];
      
      // Walk the dialogue tree following the choices made
      let currentId: string | undefined = startNode.nextNodeId || undefined;
      let choiceIdx = 0;
      
      while (currentId && currentId !== savedNodeId) {
        const node = scenario.dialogueTree.find(n => n.id === currentId);
        if (!node) break;
        history.push({ node });
        
        // If this node has choices, follow the choice the player made
        if (node.choices && choiceIdx < choicesMade.length) {
          const choice = node.choices.find(c => c.id === choicesMade[choiceIdx]);
          if (choice) {
            history[history.length - 1] = {
              ...history[history.length - 1],
              chosenChoiceId: choice.id,
              chosenChoiceText: choice.text,
            };
            currentId = choice.nextNodeId;
            choiceIdx++;
          } else {
            break;
          }
        } else if (node.nextNodeId) {
          currentId = node.nextNodeId;
        } else {
          break;
        }
      }
      
      // Add the final saved node
      const savedNode = scenario.dialogueTree.find(n => n.id === savedNodeId);
      if (savedNode && history[history.length - 1]?.node.id !== savedNodeId) {
        history.push({ node: savedNode });
      }
      
      return history;
    }
    
    return [{ node: startNode }];
  }, [scenario]);

  const startNode = useMemo(() => getStartNode(scenario), [scenario]);

  const [dialogueHistory, setDialogueHistory] = useState<DialogueEntry[]>(getInitialHistory);
  const [currentNode, setCurrentNode] = useState<DialogueNode | null>(getInitialNode);
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [activeBiasAlerts, setActiveBiasAlerts] = useState<BiasEvent[]>([]);
  const dialogueEndRef = useRef<HTMLDivElement>(null);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);
  const currentNodeIdRef = useRef<string | null>(currentNode?.id || null);
  const speedTimerStartedRef = useRef<boolean>(false);
  const appliedEffectsRef = useRef<Set<string>>(new Set());
  const isProcessingChoiceRef = useRef<boolean>(false);

  // Sound effects
  const { playClick, playSuccess, playWarning, playNegotiation } = useSound();

  // Mobile metrics panel state (toggled by swipe or button)
  const [mobileMetricsOpen, setMobileMetricsOpen] = useState(false);

  // Negotiation Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerStartedRef = useRef<boolean>(false);

  // Start negotiation timer when component mounts
  useEffect(() => {
    if (!negotiationStartTime) {
      setNegotiationStartTime(Date.now());
    }
  }, [negotiationStartTime, setNegotiationStartTime]);

  // Tick the timer every second
  useEffect(() => {
    const startTime = negotiationStartTime || Date.now();
    if (!timerStartedRef.current) {
      timerStartedRef.current = true;
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [negotiationStartTime]);

  // Haptic feedback helper
  const hapticFeedback = useCallback((pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Update ref when currentNode changes
  useEffect(() => {
    currentNodeIdRef.current = currentNode?.id || null;
  }, [currentNode?.id]);

  const isEndingNode = currentNode?.id.startsWith('ending_');

  // Speed mode timer
  useEffect(() => {
    if (challengeMode !== 'speed') {
      // BUG FIX: Reset speed timer ref when not in speed mode
      speedTimerStartedRef.current = false;
      return;
    }
    if (isEndingNode) return;
    if (!speedTimerStartedRef.current && currentNode) {
      speedTimerStartedRef.current = true;
      setChallengeTimer(90);
    }
    if (challengeTimer <= 0) return;

    const interval = setInterval(() => {
      const currentTimer = useGameStore.getState().challengeTimer;
      if (currentTimer <= 1) {
        setChallengeTimer(0);
        clearInterval(interval);
        return;
      }
      setChallengeTimer(currentTimer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [challengeMode, challengeTimer, currentNode, isEndingNode, setChallengeTimer]);

  const triggerBiasTrap = useCallback((biasEvent: BiasEvent) => {
    const neg = useGameStore.getState().negotiation;
    if (neg.biasTrapsTriggered.includes(biasEvent.id)) return;

    // Play warning sound for bias trap
    playWarning();

    // Add to negotiation state
    updateNegotiation({
      biasTrapsTriggered: [...neg.biasTrapsTriggered, biasEvent.id],
    });

    // Show the alert
    setActiveBiasAlerts(prev => {
      if (prev.find(a => a.id === biasEvent.id)) return prev;
      return [...prev, biasEvent];
    });
  }, [updateNegotiation, playWarning]);

  const dismissBiasAlert = useCallback((id: string) => {
    setActiveBiasAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const advanceToNode = useCallback((nodeId: string) => {
    // Clear any pending auto-advance timer to prevent double-advance
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
    if (!scenario) return;
    const nextNode = scenario.dialogueTree.find(n => n.id === nodeId);
    if (nextNode) {
      setCurrentNode(nextNode);
      setDialogueHistory(prev => [...prev, { node: nextNode }]);
      // Persist dialogue position for page reload restoration
      updateNegotiation({ currentDialogueNodeId: nodeId });
    }
  }, [scenario, updateNegotiation]);

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
      const rafId = requestAnimationFrame(() => {
        for (const trap of trapsToTrigger) {
          triggerBiasTrap(trap);
        }
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [currentNode?.id, scenario, triggerBiasTrap]);

  // Apply node effects when entering a new node
  useEffect(() => {
    if (!currentNode || !currentNode.effects) return;
    // BUG FIX: Prevent re-applying effects on page refresh by tracking which nodes have been processed
    if (appliedEffectsRef.current.has(currentNode.id)) return;
    appliedEffectsRef.current.add(currentNode.id);

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
      // BUG FIX: Use set callback to ensure latest state is read, preventing data loss
      useGameStore.setState((s) => ({
        negotiation: {
          ...s.negotiation,
          informationRevealed: [...new Set([...s.negotiation.informationRevealed, ...eff.informationRevealed!])],
        },
      }));
    }

    if (eff.concessionMade) {
      useGameStore.setState((s) => ({
        negotiation: {
          ...s.negotiation,
          concessionsGiven: [...s.negotiation.concessionsGiven, eff.concessionMade!],
        },
      }));
    }
  }, [currentNode?.id]);

  // Typing animation & auto-advance
  useEffect(() => {
    if (!currentNode) return;

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
    // BUG FIX: Prevent double-application from rapid clicks or keyboard shortcuts
    if (isProcessingChoiceRef.current) return;
    isProcessingChoiceRef.current = true;

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

    // Play click sound + haptic feedback
    playClick();
    hapticFeedback(10);

    // Track technique if tagged
    if (choice.technique && choice.technique !== 'none') {
      addTechniqueUsed(choice.technique);
    }

    // Apply choice effects
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

      if (aggressiveAnchorCount >= 3) {
        const fixedPieTrap = scenario.biasTraps.find(b => b.type === 'fixed_pie' && !b.triggerDialogueNodeId);
        if (fixedPieTrap && !neg.biasTrapsTriggered.includes(fixedPieTrap.id)) {
          triggerBiasTrap(fixedPieTrap);
        }
      }

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
      setTimeout(() => {
        advanceToNode(choice.nextNodeId);
        isProcessingChoiceRef.current = false;
      }, 300);
    } else {
      isProcessingChoiceRef.current = false;
    }
  }, [advanceToNode, makeChoice, scenario, triggerBiasTrap, playClick, addTechniqueUsed]);

  const isChoiceDisabledByChallenge = (choice: DialogueChoice, choiceIndex: number): { disabled: boolean; reason: string } => {
    // Limited Choices mode: disable even-indexed choices (0-indexed: indices 1, 3, 5...)
    if (challengeMode === 'limited_choices' && choiceIndex % 2 === 1) {
      return { disabled: true, reason: 'Limited Choices: This option is locked' };
    }
    // Ethics Lock mode: disable choices that would reduce ethicalImpact
    if (challengeMode === 'ethics_lock' && choice.effects && choice.effects.ethicalImpact && choice.effects.ethicalImpact < 0) {
      return { disabled: true, reason: 'Ethics Lock: This choice would compromise ethical standards' };
    }
    return { disabled: false, reason: '' };
  };

  const isChoiceDisabled = (choice: DialogueChoice, choiceIndex?: number): boolean => {
    // Check challenge mode restrictions
    if (choiceIndex !== undefined) {
      const challengeResult = isChoiceDisabledByChallenge(choice, choiceIndex);
      if (challengeResult.disabled) return true;
    }
    // Check normal requirements
    if (!choice.requirement) return false;
    if (choice.requirement.type === 'info_discovered') {
      const allInfo = [...discoveredFacts, ...negotiation.informationRevealed];
      return !allInfo.includes(choice.requirement.factId);
    }
    if (choice.requirement.type === 'min_trust') return negotiation.trust < choice.requirement.value;
    if (choice.requirement.type === 'max_anger') return negotiation.anger > choice.requirement.value;
    return false;
  };

  const getDisabledReason = (choice: DialogueChoice, choiceIndex?: number): string => {
    // Check challenge mode first
    if (choiceIndex !== undefined) {
      const challengeResult = isChoiceDisabledByChallenge(choice, choiceIndex);
      if (challengeResult.disabled) return challengeResult.reason;
    }
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

  const handleViewResults = useCallback(() => {
    if (!scenario || !currentNode) return;

    // Play success sound
    playSuccess();

    const endingType = getEndingFromNegotiation(scenario, {
      ...negotiation,
      currentDialogueNodeId: currentNode.id,
    });

    const ending = scenario.endings.find(e => e.type === endingType) || scenario.endings[0];

    // Calculate dynamic scores based on actual player behavior
    const totalFactsAvailable = scenario.investigationActions.reduce((sum, a) => sum + a.reveals.length, 0);
    const behaviorContext: BehaviorContext = {
      trust: negotiation.trust,
      anger: negotiation.anger,
      patience: negotiation.patience,
      valueClaimed: negotiation.valueClaimed,
      valueCreated: negotiation.valueCreated,
      relationshipImpact: negotiation.relationshipImpact,
      ethicalImpact: negotiation.ethicalImpact,
      clientSatisfaction: negotiation.clientSatisfaction,
      counterpartySatisfaction: negotiation.counterpartySatisfaction,
      concessionsGiven: negotiation.concessionsGiven,
      concessionsReceived: negotiation.concessionsReceived,
      biasTrapsTriggered: negotiation.biasTrapsTriggered,
      choicesMade: negotiation.choicesMade,
      informationRevealed: negotiation.informationRevealed,
      discoveredFacts: discoveredFacts,
      totalFactsAvailable,
      batnaEstimate: useGameStore.getState().batnaEstimate,
      openingStrategy: useGameStore.getState().openingStrategy,
      assumptionsCount: useGameStore.getState().assumptions.length,
      techniquesUsed: techniquesUsed,
      challengeMode: challengeMode,
    };
    const dynamicScores = calculateDynamicScores(endingType, ending.scores, behaviorContext);
    const finalScore = calculateFinalScore(dynamicScores);

    // Build transcript from dialogue history
    const transcript: TranscriptEntry[] = dialogueHistory.map(entry => {
      const transcriptEntry: TranscriptEntry = {
        nodeId: entry.node.id,
        speaker: entry.node.speaker,
        text: entry.node.text,
      };

      if (entry.chosenChoiceId) {
        transcriptEntry.chosenChoiceId = entry.chosenChoiceId;
        transcriptEntry.chosenChoiceText = entry.chosenChoiceText;
      }

      // Include all available choices at this point
      if (entry.node.choices && entry.node.choices.length > 0) {
        transcriptEntry.availableChoices = entry.node.choices.map(choice => ({
          id: choice.id,
          text: choice.text,
          type: choice.type,
          wasTaken: choice.id === entry.chosenChoiceId,
        }));
      }

      return transcriptEntry;
    });

    const caseResult = {
      scenarioId: scenario.id,
      outcome: endingType,
      scores: dynamicScores,
      finalScore,
      choicesMade: negotiation.choicesMade,
      hiddenFactsFound: negotiation.informationRevealed,
      postmortemRead: false,
      transcript,
      elapsedTime: elapsedSeconds,
    };

    if (isReplay) {
      replayCaseResult(caseResult);
    } else {
      addCaseResult(caseResult);

      // BUG FIX: Only apply reputation and stats on first play, not on replay
      // (replayCaseResult already handles score adjustments)
      const repDelta = calculateReputationDelta(scenario, endingType);
      addReputation(repDelta);

      const totalInfo = scenario.investigationActions.reduce((sum, a) => sum + a.reveals.length, 0);
      const infoFound = negotiation.informationRevealed.length + discoveredFacts.length;
      const statsDelta = calculateStatsDelta(scenario, endingType, infoFound, totalInfo);
      addStats(statsDelta);
    }

    // Store ending info for postmortem
    updateNegotiation({ endingTriggered: endingType });
    setPhase('postmortem');
  }, [scenario, currentNode, negotiation, isReplay, replayCaseResult, addCaseResult, addReputation, addStats, discoveredFacts, updateNegotiation, setPhase, playSuccess, dialogueHistory]);

  // Auto-trigger view results when speed timer hits 0
  useEffect(() => {
    if (challengeMode === 'speed' && challengeTimer === 0 && speedTimerStartedRef.current && currentNode && !isEndingNode) {
      handleViewResults();
    }
  }, [challengeTimer, challengeMode, currentNode, isEndingNode, handleViewResults]);

  // Keyboard shortcut listeners for negotiation choices
  useEffect(() => {
    const handleSelectChoice = (e: CustomEvent<{ index: number }>) => {
      if (!showChoices || !currentNode?.choices) return;
      const choiceIndex = e.detail.index;
      const choice = currentNode.choices[choiceIndex];
      if (choice && !isChoiceDisabled(choice, choiceIndex)) {
        handleChoiceClick(choice);
      }
    };

    const handleAdvanceDialogue = () => {
      // Space can advance: auto-advance nodes or trigger View Results on ending
      if (currentNode?.isAuto && currentNode.nextNodeId) {
        advanceToNode(currentNode.nextNodeId);
      } else if (isEndingNode) {
        handleViewResults();
      }
    };

    const handleEscape = () => {
      // Close mobile metrics if open, otherwise go back
      if (mobileMetricsOpen) {
        setMobileMetricsOpen(false);
      }
    };

    window.addEventListener('dealcraft:select-choice', handleSelectChoice as EventListener);
    window.addEventListener('dealcraft:advance-dialogue', handleAdvanceDialogue);
    window.addEventListener('dealcraft:escape', handleEscape);

    return () => {
      window.removeEventListener('dealcraft:select-choice', handleSelectChoice as EventListener);
      window.removeEventListener('dealcraft:advance-dialogue', handleAdvanceDialogue);
      window.removeEventListener('dealcraft:escape', handleEscape);
    };
  }, [showChoices, currentNode, isEndingNode, handleChoiceClick, advanceToNode, handleViewResults, mobileMetricsOpen, isChoiceDisabled]);

  // Swipe gesture detection for mobile metrics toggle
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Only trigger on horizontal swipes (not vertical scrolling)
      if (Math.abs(diffX) > 80 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        if (diffX > 0) {
          // Swipe right - open metrics
          setMobileMetricsOpen(true);
        } else {
          // Swipe left - close metrics
          setMobileMetricsOpen(false);
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Calculate dialogue progress for node indicator
  const dialogueProgress = useMemo(() => {
    if (!scenario || !currentNode) return { current: 0, total: 0 };
    const total = scenario.dialogueTree.length;
    const currentIndex = scenario.dialogueTree.findIndex(n => n.id === currentNode.id);
    return { current: currentIndex + 1, total };
  }, [scenario, currentNode]);

  // Calculate phase progress
  const progressPercent = dialogueProgress.total > 0 ? (dialogueProgress.current / dialogueProgress.total) * 100 : 0;
  const PHASES = ['Opening', 'Discovery', 'Bargaining', 'Closing'] as const;
  const currentPhase = progressPercent <= 25 ? 'Opening' : progressPercent <= 50 ? 'Discovery' : progressPercent <= 75 ? 'Bargaining' : 'Closing';

  // Build choice timeline from dialogue history
  const choiceTimeline = useMemo(() => {
    if (!scenario) return [];
    const timeline: Array<{ choiceText: string; choiceType: string; choiceIcon: string; choiceLabel: string }> = [];
    for (const entry of dialogueHistory) {
      if (entry.chosenChoiceId && entry.chosenChoiceText) {
        let choiceType = 'diagnostic';
        for (const node of scenario.dialogueTree) {
          if (node.choices) {
            const found = node.choices.find(c => c.id === entry.chosenChoiceId);
            if (found) {
              choiceType = found.type;
              break;
            }
          }
        }
        const style = CHOICE_TYPE_STYLES[choiceType] || CHOICE_TYPE_STYLES.diagnostic;
        timeline.push({
          choiceText: entry.chosenChoiceText,
          choiceType,
          choiceIcon: style.icon,
          choiceLabel: style.label,
        });
      }
    }
    return timeline;
  }, [scenario, dialogueHistory]);

  // Negotiation Health Score: combines trust, anger, patience into 0-100
  const negotiationHealth = useMemo(() => {
    return Math.round(
      negotiation.trust * 0.4 +
      (100 - negotiation.anger) * 0.35 +
      negotiation.patience * 0.25
    );
  }, [negotiation.trust, negotiation.anger, negotiation.patience]);

  const healthStatus = negotiationHealth >= 70
    ? { label: 'Thriving', color: 'text-emerald-400', bgColor: 'bg-emerald-500', ringColor: 'ring-emerald-500/30' }
    : negotiationHealth >= 40
      ? { label: 'Cautious', color: 'text-amber-400', bgColor: 'bg-amber-500', ringColor: 'ring-amber-500/30' }
      : { label: 'Dangerous', color: 'text-red-400', bgColor: 'bg-red-500', ringColor: 'ring-red-500/30' };

  // Ending Prediction
  const predictedEnding = useMemo(() => {
    if (!scenario) return null;
    if (negotiation.choicesMade.length === 0) return null;
    return getEndingFromNegotiation(scenario, {
      ...negotiation,
      currentDialogueNodeId: currentNode?.id || negotiation.currentDialogueNodeId,
    });
  }, [scenario, negotiation, currentNode?.id]);

  const endingPredictionInfo = useMemo(() => {
    if (!predictedEnding) return null;
    const PREDICTION_STYLES: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
      master: { icon: '👑', label: 'Master Deal', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
      cooperative: { icon: '🤝', label: 'Cooperative', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
      hard_bargain: { icon: '💪', label: 'Hard Bargain', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
      bad_deal: { icon: '📉', label: 'Bad Deal', color: 'text-red-400', bgColor: 'bg-red-500/10' },
      strategic_no_deal: { icon: '🚶', label: 'Strategic No Deal', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
      ethical_failure: { icon: '⚖️', label: 'Ethical Failure', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
      no_deal_bad: { icon: '💥', label: 'No Deal (Bad)', color: 'text-red-500', bgColor: 'bg-red-500/10' },
    };
    return PREDICTION_STYLES[predictedEnding] || { icon: '❓', label: predictedEnding, color: 'text-muted-foreground', bgColor: 'bg-muted/10' };
  }, [predictedEnding]);

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const getEmotionIndicator = (trust: number, anger: number) => {
    if (trust >= 70 && anger <= 30) return { emoji: '😊', label: 'Receptive' };
    if (trust >= 50 && anger <= 50) return { emoji: '😐', label: 'Neutral' };
    if (anger >= 70) return { emoji: '😤', label: 'Hostile' };
    if (anger >= 50) return { emoji: '😠', label: 'Frustrated' };
    if (trust <= 30) return { emoji: '🤨', label: 'Suspicious' };
    return { emoji: '😐', label: 'Guarded' };
  };

  // Mood Spectrum: determines negotiation mood based on trust and anger
  const getMoodSpectrum = (trust: number, anger: number): { emoji: string; label: string; color: string; position: number } => {
    if (anger >= 80) return { emoji: '🤬', label: 'Hostile', color: 'text-red-500', position: 5 };
    if (trust >= 20 && anger >= 60) return { emoji: '😰', label: 'Tense', color: 'text-orange-500', position: 20 };
    if (trust <= 20 && anger <= 40) return { emoji: '🤨', label: 'Distrustful', color: 'text-violet-500', position: 30 };
    if (trust >= 30 && anger <= 60) return { emoji: '😐', label: 'Cautious', color: 'text-amber-500', position: 50 };
    if (trust >= 50 && anger <= 40) return { emoji: '🙂', label: 'Cooperative', color: 'text-cyan-500', position: 72 };
    if (trust >= 70 && anger <= 20) return { emoji: '😊', label: 'Harmonious', color: 'text-emerald-500', position: 92 };
    // Default fallback: cautious
    return { emoji: '😐', label: 'Cautious', color: 'text-amber-500', position: 50 };
  };

  const emotion = getEmotionIndicator(negotiation.trust, negotiation.anger);
  const mood = getMoodSpectrum(negotiation.trust, negotiation.anger);

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

      {/* Mobile Trust/Anger Mini-Bars - always visible on mobile */}
      <div className="lg:hidden border-b border-border/30 bg-card/20 backdrop-blur-sm px-4 py-1.5 space-y-1">
        {/* Mobile Health Meter */}
        <div className="flex items-center gap-2">
          <Activity className={`h-3 w-3 shrink-0 ${healthStatus.color}`} />
          <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${healthStatus.bgColor}`}
              animate={{ width: `${negotiationHealth}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className={`text-[11px] font-bold tabular-nums ${healthStatus.color} w-5 text-right`}>{negotiationHealth}</span>
          <span className={`text-[11px] font-semibold ${healthStatus.color}`}>{healthStatus.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 flex-1">
            <Heart className="h-3 w-3 text-emerald-400 shrink-0" />
            <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-emerald-400"
                style={{ width: `${negotiation.trust}%` }}
              />
            </div>
            <span className="text-[11px] font-bold tabular-nums text-muted-foreground w-5 text-right">{negotiation.trust}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-1">
            <Flame className="h-3 w-3 text-red-400 shrink-0" />
            <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-red-400"
                style={{ width: `${negotiation.anger}%` }}
              />
            </div>
            <span className="text-[11px] font-bold tabular-nums text-muted-foreground w-5 text-right">{negotiation.anger}</span>
          </div>
        </div>
        {/* Mobile Phase Progress Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-muted/50 overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-1/4 w-px bg-border/30" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border/30" />
            <div className="absolute top-0 bottom-0 left-3/4 w-px bg-border/30" />
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-amber-400 shrink-0 tabular-nums">{currentPhase}</span>
        </div>
      </div>

      {/* Top Bar */}
      <div className="relative border-b border-border/50 bg-card/30 backdrop-blur-sm px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{counterparty.avatar}</div>
            <div>
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="text-xs text-muted-foreground">vs. {counterparty.name}, {counterparty.role}</p>
              {scenario.counterpartyStyle && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0 rounded-full border cursor-help mt-0.5 whitespace-nowrap
                        bg-amber-500/10 text-amber-400 border-amber-500/20">
                        <span>{scenario.counterpartyStyle === 'analyst' ? '📊' : scenario.counterpartyStyle === 'accommodator' ? '🤗' : '💪'}</span>
                        <span className="font-medium capitalize">{scenario.counterpartyStyle}</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[250px]">
                      <p className="font-semibold text-xs mb-1">{scenario.counterpartyStyle === 'analyst' ? '📊 Analyst Style' : scenario.counterpartyStyle === 'accommodator' ? '🤗 Accommodator Style' : '💪 Assertive Style'}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {scenario.counterpartyStyle === 'analyst' && 'Prefer data and logic. Give them time to think. Don\'t push emotionally.'}
                        {scenario.counterpartyStyle === 'accommodator' && 'Value relationship. Build rapport first. Be careful — they say yes to please, not to agree.'}
                        {scenario.counterpartyStyle === 'assertive' && 'Want to be heard. Listen first, then speak. Use calibrated questions to redirect.'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Negotiation Timer (always visible) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-card/50 border-border/30 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs font-bold tabular-nums">{formatTime(elapsedSeconds)}</span>
            </div>
            {/* Speed Mode Timer */}
            {challengeMode === 'speed' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                  challengeTimer <= 15
                    ? 'bg-red-500/15 border-red-500/30 text-red-400 animate-pulse'
                    : challengeTimer <= 30
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                }`}
              >
                <Hourglass className="h-3.5 w-3.5" />
                <span className="text-sm font-bold tabular-nums">
                  {Math.floor(challengeTimer / 60)}:{(challengeTimer % 60).toString().padStart(2, '0')}
                </span>
              </motion.div>
            )}
            {/* Challenge Mode Badge */}
            {challengeMode !== 'none' && (
              <Badge variant="outline" className="text-[11px] px-2 py-0 bg-amber-500/10 text-amber-400 border-amber-500/25">
                {challengeMode === 'speed' && '\u26A1 Speed Run'}
                {challengeMode === 'limited_choices' && '\uD83D\uDD12 Limited Choices'}
                {challengeMode === 'ethics_lock' && '\u2696\uFE0F Ethics Lock'}
              </Badge>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-xl">{emotion.emoji}</span>
              <Badge variant="outline" className="text-[11px]">
                {emotion.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Negotiation Phase Progress Bar */}
        <div className="max-w-6xl mx-auto mt-2 pt-2 border-t border-border/20">
          <div className="flex items-center justify-between mb-1.5">
            {PHASES.map((phase) => {
              const isActive = phase === currentPhase;
              const phaseIndex = PHASES.indexOf(phase);
              const isPast = progressPercent > (phaseIndex + 1) * 25;
              return (
                <span key={phase} className={`text-[11px] font-medium transition-all duration-500 ${
                  isActive
                    ? 'text-amber-400 font-bold'
                    : isPast
                      ? 'text-amber-500'
                      : 'text-muted-foreground'
                }`}>
                  {isActive && (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block mr-0.5"
                    >
                      ▸
                    </motion.span>
                  )}
                  {phase}
                </span>
              );
            })}
          </div>
          <div className="relative h-1.5 rounded-full bg-muted/50 overflow-hidden">
            {/* Phase boundary markers */}
            <div className="absolute top-0 bottom-0 left-1/4 w-px bg-border/30 z-10" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border/30 z-10" />
            <div className="absolute top-0 bottom-0 left-3/4 w-px bg-border/30 z-10" />
            {/* Progress fill with amber gradient */}
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            {/* Current position glow dot */}
            {progressPercent > 0 && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 -ml-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_oklch(0.77_0.16_75/60%)] z-20"
                style={{ left: `${progressPercent}%` }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-muted-foreground">{dialogueProgress.current} of {dialogueProgress.total} nodes</span>
            <span className="text-[11px] text-muted-foreground">{Math.round(progressPercent)}%</span>
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
                    <p className="text-sm leading-relaxed">{formatDialogueText(entry.node.text)}</p>
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
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs text-muted-foreground">Choose your response:</p>
                      <ChoiceHintBadge />
                    </div>
                    <TooltipProvider delayDuration={300}>
                      {currentNode.choices.map((choice, choiceIndex) => {
                        const challengeCheck = isChoiceDisabledByChallenge(choice, choiceIndex);
                        const disabled = isChoiceDisabled(choice, choiceIndex);
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
                                    ? challengeCheck.disabled
                                      ? 'opacity-40 cursor-not-allowed bg-amber-500/5 border-amber-500/15'
                                      : 'opacity-40 cursor-not-allowed bg-muted/20 border-border/20'
                                    : `${style.color} cursor-pointer hover:border-amber-500/30`
                                }`}
                              >
                                <span className="text-lg shrink-0">{challengeCheck.disabled ? (challengeMode === 'limited_choices' ? '\uD83D\uDD12' : '\u2696\uFE0F') : style.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="text-sm font-medium">{choice.text}</p>
                                    {choice.technique && choice.technique !== 'none' && (
                                      <TechniqueBadge technique={choice.technique} compact />
                                    )}
                                  </div>
                                  <p className="text-[11px] opacity-70 mt-0.5">{challengeCheck.disabled ? challengeCheck.reason : style.label}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                              </motion.button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              {disabled ? (
                                <p className="text-xs">{getDisabledReason(choice, choiceIndex)}</p>
                              ) : choice.effects ? (
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold mb-1">Expected Impact</p>
                                  <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[11px]">
                                    {choice.effects.trust && choice.effects.trust !== 0 && (
                                      <span className={choice.effects.trust > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                        {choice.effects.trust > 0 ? '↑' : '↓'} Trust
                                      </span>
                                    )}
                                    {choice.effects.anger && choice.effects.anger !== 0 && (
                                      <span className={choice.effects.anger > 0 ? 'text-red-400' : 'text-emerald-400'}>
                                        {choice.effects.anger > 0 ? '↑' : '↓'} Anger
                                      </span>
                                    )}
                                    {(choice.effects.valueClaimed && choice.effects.valueClaimed > 0) && (
                                      <span className="text-amber-400">↑ Value</span>
                                    )}
                                    {(choice.effects.valueCreated && choice.effects.valueCreated > 0) && (
                                      <span className="text-amber-400">↑ Value</span>
                                    )}
                                    {(choice.effects.ethicalImpact && choice.effects.ethicalImpact < 0) && (
                                      <span className="text-red-400">↓ Ethics</span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">No significant impact</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </TooltipProvider>
                    {/* BUG FIX: Fallback when all choices are disabled (soft-lock prevention) */}
                    {currentNode.choices && currentNode.choices.every((c, i) => isChoiceDisabled(c, i)) && (
                      <div className="mt-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-center">
                        <p className="text-xs text-amber-400 mb-2">All options are currently locked. You can continue without choosing.</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                          onClick={() => {
                            // Find the first non-disabled choice's nextNodeId as fallback,
                            // or advance to the first ending node if no choice is available
                            const firstChoice = currentNode.choices?.[0];
                            if (firstChoice?.nextNodeId) {
                              advanceToNode(firstChoice.nextNodeId);
                            } else {
                              // Fallback: go to first ending
                              const endingNode = scenario?.dialogueTree.find(n => n.id.startsWith('ending_'));
                              if (endingNode) advanceToNode(endingNode.id);
                            }
                          }}
                        >
                          Continue Anyway →
                        </Button>
                      </div>
                    )}
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
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold gap-2 text-base px-8 h-12 premium-button relative z-30"
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

          {/* Negotiation Health Meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                Health
              </span>
              <span className={`text-xs font-bold ${healthStatus.color}`}>{negotiationHealth} — {healthStatus.label}</span>
            </div>
            <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${healthStatus.bgColor}`}
                animate={{ width: `${negotiationHealth}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
              {/* Threshold markers */}
              <div className="absolute top-0 bottom-0 left-[40%] w-px bg-amber-500/30 z-10" />
              <div className="absolute top-0 bottom-0 left-[70%] w-px bg-emerald-500/30 z-10" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="text-red-400">Dangerous</span>
              <span className="text-amber-400">Cautious</span>
              <span className="text-emerald-400">Thriving</span>
            </div>
          </div>

          <Separator />

          {/* Outcome Forecast */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5" />
                Outcome Forecast
              </span>
            </div>
            <div className={`p-2 rounded-lg border border-border/30 ${endingPredictionInfo?.bgColor || 'bg-muted/10'}`}>
              {endingPredictionInfo ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{endingPredictionInfo.icon}</span>
                  <span className={`text-xs font-medium ${endingPredictionInfo.color}`}>{endingPredictionInfo.label}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">?</span>
                  <span className="text-xs text-muted-foreground italic">Make a choice to see forecast...</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Mood Spectrum Indicator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Mood Spectrum</span>
              <span className={`text-[11px] font-semibold ${mood.color}`}>{mood.label}</span>
            </div>
            <div className="mood-spectrum" style={{ width: '100%' }}>
              <motion.div
                className="mood-indicator"
                animate={{ left: `${mood.position}%`, scale: [0.8, 1.1, 1] }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                key={mood.label}
              >
                <span className="text-[11px] leading-none">{mood.emoji}</span>
              </motion.div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Hostile</span>
              <span>Harmonious</span>
            </div>
          </div>

          <Separator />

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
                  <span className="text-[11px] text-muted-foreground">{issue}: {value}</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-muted-foreground">No issues resolved yet</p>
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
                <Badge key={fact} variant="outline" className="text-[11px] px-1.5 py-0 bg-violet-500/10 text-violet-300 border-violet-500/20">
                  <Eye className="h-2.5 w-2.5 mr-1" />
                  {fact.replace(/_/g, ' ')}
                </Badge>
              ))}
              {[...discoveredFacts, ...negotiation.informationRevealed].length === 0 && (
                <p className="text-[11px] text-muted-foreground">No info discovered yet</p>
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
                    anchor_shock: '\u26A0\uFE0F',
                    fixed_pie: '\uD83C\uDFAF',
                    escalation: '\uD83D\uDD25',
                    vividness: '\uD83D\uDC41\uFE0F',
                    egocentrism: '\uD83E\uDDE0',
                    overconfidence: '\uD83D\uDC8E',
                    regret_aversion: '\uD83D\uDE30',
                  };
                  return (
                    <Badge key={trapId} variant="outline" className="text-[11px] px-1.5 py-0 bg-amber-500/10 text-amber-300 border-amber-500/20">
                      {BIAS_SIDEBAR_ICONS[trap?.type || ''] || '\u26A0\uFE0F'}
                      <span className="ml-1">{trap?.type.replace(/_/g, ' ') || trapId}</span>
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">No bias traps triggered yet</p>
            )}
          </div>

          <Separator />

          {/* Choice Timeline */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />
              Choice Timeline
            </h4>
            {choiceTimeline.length > 0 ? (
              <div className="relative pl-4 max-h-48 overflow-y-auto">
                {/* Vertical line */}
                <div className="absolute left-1.5 top-1 bottom-1 w-px bg-border/40" />
                <div className="space-y-2">
                  {choiceTimeline.map((choice, i) => (
                    <div key={i} className="relative flex items-start gap-2">
                      {/* Dot on the line */}
                      <div className="absolute -left-[10px] top-1 w-2 h-2 rounded-full bg-amber-500/70 ring-2 ring-card" />
                      {/* Icon */}
                      <span className="text-xs shrink-0 mt-px">{choice.choiceIcon}</span>
                      {/* Text */}
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">{choice.choiceText}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{choice.choiceLabel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">No choices made yet</p>
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
        scenarioTitle={scenario.title}
        recentDialogueText={currentNode?.text || ''}
      />

      {/* Mobile Floating Node Indicator */}
      <div className="lg:hidden fixed top-[120px] left-1/2 -translate-x-1/2 z-[35] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/90 backdrop-blur-sm border border-border/30 shadow-md"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-medium text-muted-foreground">
              {dialogueProgress.current} of {dialogueProgress.total}
            </span>
          </motion.div>
        </div>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-[42]">
        <MobileSidebar
          negotiation={negotiation}
          discoveredFacts={discoveredFacts}
          open={mobileMetricsOpen}
          onOpenChange={setMobileMetricsOpen}
        />
      </div>
    </div>
  );
}

// Mobile sidebar as a dialog/drawer
function MobileSidebar({ negotiation, discoveredFacts, open, onOpenChange }: {
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const setOpen = onOpenChange;

  // Keyboard dismissal: Escape closes the mobile sidebar
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, setOpen]);

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
              className="fixed inset-0 bg-black/50 z-[47]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-16 right-4 left-4 z-[48] max-h-[60vh] overflow-y-auto rounded-xl bg-card border border-border/50 p-4 shadow-xl"
            >
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Metrics</h3>

                {/* Mood Spectrum Indicator - Mobile */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Mood Spectrum</span>
                    <span className={`text-[11px] font-semibold ${mood.color}`}>{mood.label}</span>
                  </div>
                  <div className="mood-spectrum" style={{ width: '100%' }}>
                    <motion.div
                      className="mood-indicator"
                      animate={{ left: `${mood.position}%`, scale: [0.8, 1.1, 1] }}
                      transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                      key={`mobile-${mood.label}`}
                    >
                      <span className="text-[11px] leading-none">{mood.emoji}</span>
                    </motion.div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Hostile</span>
                    <span>Harmonious</span>
                  </div>
                </div>

                <Separator />

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
                      <Badge key={fact} variant="outline" className="text-[11px] px-1.5 py-0 bg-violet-500/10 text-violet-300 border-violet-500/20">
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
