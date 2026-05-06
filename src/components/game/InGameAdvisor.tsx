'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  X,
  AlertTriangle,
  TrendingUp,
  Heart,
  Flame,
  Clock,
  Shield,
  Search,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface InGameAdvisorProps {
  negotiation: {
    trust: number;
    anger: number;
    patience: number;
    valueClaimed: number;
    valueCreated: number;
    clientSatisfaction: number;
    counterpartySatisfaction: number;
    biasTrapsTriggered: string[];
    choicesMade: string[];
    informationRevealed: string[];
  };
  discoveredFacts: string[];
  scenarioCategory: string;
  scenarioTitle?: string;
  recentDialogueText?: string;
}

type TipSeverity = 'urgent' | 'caution' | 'good';
type TipCategory = 'Trust' | 'Anger' | 'Patience' | 'Value' | 'Bias' | 'Strategy';

interface AdvisorTip {
  id: string;
  text: string;
  severity: TipSeverity;
  category: TipCategory;
  priority: number;
}

const SEVERITY_CONFIG: Record<TipSeverity, { dot: string; icon: React.ReactNode }> = {
  urgent: {
    dot: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]',
    icon: <Flame className="size-3.5 text-red-400" />,
  },
  caution: {
    dot: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]',
    icon: <AlertTriangle className="size-3.5 text-amber-400" />,
  },
  good: {
    dot: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]',
    icon: <TrendingUp className="size-3.5 text-emerald-400" />,
  },
};

const CATEGORY_CONFIG: Record<TipCategory, { icon: React.ReactNode; badgeClass: string }> = {
  Trust: {
    icon: <Heart className="size-3" />,
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  },
  Anger: {
    icon: <Flame className="size-3" />,
    badgeClass: 'bg-red-500/15 text-red-300 border-red-500/25',
  },
  Patience: {
    icon: <Clock className="size-3" />,
    badgeClass: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  },
  Value: {
    icon: <TrendingUp className="size-3" />,
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  },
  Bias: {
    icon: <Shield className="size-3" />,
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  },
  Strategy: {
    icon: <Search className="size-3" />,
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  },
};

function generateTips(props: InGameAdvisorProps): AdvisorTip[] {
  const { negotiation, discoveredFacts, scenarioCategory } = props;
  const tips: AdvisorTip[] = [];
  let tipId = 0;

  // TRUST-BASED TIPS
  if (negotiation.trust < 30) {
    tips.push({
      id: `tip-${tipId++}`,
      text: '\u26A0\uFE0F Trust is critically low. Consider face-saving or empathy approaches to rebuild rapport.',
      severity: 'urgent',
      category: 'Trust',
      priority: 90,
    });
  } else if (negotiation.trust >= 30 && negotiation.trust <= 50) {
    tips.push({
      id: `tip-${tipId++}`,
      text: 'Trust is fragile. Avoid aggressive tactics \u2014 they\u2019ll backfire at this level.',
      severity: 'caution',
      category: 'Trust',
      priority: 60,
    });
  } else if (negotiation.trust > 70) {
    tips.push({
      id: `tip-${tipId++}`,
      text: 'Trust is strong. This is the moment to propose package deals or ask for concessions.',
      severity: 'good',
      category: 'Trust',
      priority: 40,
    });
  }

  // ANGER-BASED TIPS
  if (negotiation.anger > 70) {
    tips.push({
      id: `tip-${tipId++}`,
      text: '\uD83D\uDD34 The other side is hostile! De-escalate before making any demands. Use empathy or silence.',
      severity: 'urgent',
      category: 'Anger',
      priority: 95,
    });
  } else if (negotiation.anger >= 50 && negotiation.anger <= 70) {
    tips.push({
      id: `tip-${tipId++}`,
      text: 'Anger is rising. Consider a face-saving approach or a strategic pause.',
      severity: 'caution',
      category: 'Anger',
      priority: 70,
    });
  } else if (negotiation.anger < 30) {
    tips.push({
      id: `tip-${tipId++}`,
      text: 'The atmosphere is calm. This is a good time to anchor or make proposals.',
      severity: 'good',
      category: 'Anger',
      priority: 30,
    });
  }

  // PATIENCE-BASED TIPS
  if (negotiation.patience < 30) {
    tips.push({
      id: `tip-${tipId++}`,
      text: '\u23F3 Time is running out. The other side may walk away. Consider wrapping up or making a decisive move.',
      severity: 'urgent',
      category: 'Patience',
      priority: 85,
    });
  } else if (negotiation.patience >= 30 && negotiation.patience <= 50) {
    tips.push({
      id: `tip-${tipId++}`,
      text: 'Patience is wearing thin. Prioritize your key issues.',
      severity: 'caution',
      category: 'Patience',
      priority: 55,
    });
  }

  // VALUE-BASED TIPS
  if (negotiation.valueCreated < negotiation.valueClaimed) {
    tips.push({
      id: `tip-${tipId++}`,
      text: '\uD83D\uDCA1 You\u2019re claiming more value than creating. Look for opportunities to expand the pie through logrolling or contingency contracts.',
      severity: 'caution',
      category: 'Value',
      priority: 65,
    });
  }
  if (negotiation.valueCreated > negotiation.valueClaimed * 2) {
    tips.push({
      id: `tip-${tipId++}`,
      text: 'You\u2019re creating lots of value but not claiming enough. Make sure you get your fair share!',
      severity: 'caution',
      category: 'Value',
      priority: 60,
    });
  }

  // BIAS TIPS
  if (negotiation.biasTrapsTriggered.length > 0) {
    tips.push({
      id: `tip-${tipId++}`,
      text: `\u26A0\uFE0F You\u2019ve triggered ${negotiation.biasTrapsTriggered.length} cognitive bias trap(s). Review the countermeasures in your postmortem.`,
      severity: 'urgent',
      category: 'Bias',
      priority: 80,
    });
  }

  // STRATEGIC TIPS
  if (negotiation.informationRevealed.length + discoveredFacts.length < 2) {
    tips.push({
      id: `tip-${tipId++}`,
      text: '\uD83D\uDD0D You have little information. Consider investigative or diagnostic questions before making proposals.',
      severity: 'caution',
      category: 'Strategy',
      priority: 75,
    });
  }
  if (negotiation.choicesMade.length > 5 && negotiation.valueCreated === 0) {
    tips.push({
      id: `tip-${tipId++}`,
      text: 'No value has been created yet. Try face-saving or package offers to expand the pie.',
      severity: 'caution',
      category: 'Strategy',
      priority: 70,
    });
  }
  if (scenarioCategory === 'deception') {
    tips.push({
      id: `tip-${tipId++}`,
      text: '\uD83D\uDEA8 This case involves deception. Trust but verify \u2014 investigate before committing.',
      severity: 'urgent',
      category: 'Strategy',
      priority: 88,
    });
  }
  if (scenarioCategory === 'power_imbalance') {
    tips.push({
      id: `tip-${tipId++}`,
      text: '\u2696\uFE0F Power is unequal. Look for leverage in the other side\u2019s constraints and fears.',
      severity: 'caution',
      category: 'Strategy',
      priority: 72,
    });
  }
  if (scenarioCategory === 'relationship') {
    tips.push({
      id: `tip-${tipId++}`,
      text: '\uD83D\uDC99 Relationships are at stake. Balance short-term gains with long-term partnership value.',
      severity: 'caution',
      category: 'Strategy',
      priority: 68,
    });
  }
  if (scenarioCategory === 'ethics') {
    tips.push({
      id: `tip-${tipId++}`,
      text: '\u2696\uFE0F Ethical boundaries are being tested. Protect your integrity \u2014 it\u2019s your most valuable asset.',
      severity: 'urgent',
      category: 'Strategy',
      priority: 82,
    });
  }

  // Sort by priority descending, take top 4
  return tips.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

export function InGameAdvisor(props: InGameAdvisorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // AI Advisor state
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const lastRequestTimeRef = useRef<number>(0);
  const cachedAdviceRef = useRef<string | null>(null);
  const lastContextRef = useRef<string>('');

  const tips = useMemo(() => generateTips(props), [props]);

  // Generate a context key to know when to invalidate cache
  const contextKey = `${props.negotiation.trust}-${props.negotiation.anger}-${props.negotiation.patience}-${props.negotiation.choicesMade.length}-${props.negotiation.biasTrapsTriggered.length}`;

  // Invalidate cache if context changes significantly
  if (contextKey !== lastContextRef.current) {
    lastContextRef.current = contextKey;
    if (cachedAdviceRef.current) {
      // Context changed, but keep the advice until a new request
    }
  }

  const handleAskAI = useCallback(async () => {
    // Check cooldown
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    if (timeSinceLastRequest < 10000) {
      const remaining = Math.ceil((10000 - timeSinceLastRequest) / 1000);
      setCooldownRemaining(remaining);
      const interval = setInterval(() => {
        const elapsed = Date.now() - lastRequestTimeRef.current;
        const rem = Math.ceil((10000 - elapsed) / 1000);
        if (rem <= 0) {
          setCooldownRemaining(0);
          clearInterval(interval);
        } else {
          setCooldownRemaining(rem);
        }
      }, 1000);
      return;
    }

    // Return cached advice if available and context hasn't changed
    if (cachedAdviceRef.current && contextKey === lastContextRef.current) {
      setAiAdvice(cachedAdviceRef.current);
      return;
    }

    setAiLoading(true);
    setAiError(false);
    lastRequestTimeRef.current = Date.now();

    try {
      const response = await fetch('/api/game/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioContext: `${props.scenarioTitle || 'Negotiation'} - ${props.scenarioCategory}`,
          negotiationState: {
            trust: props.negotiation.trust,
            anger: props.negotiation.anger,
            patience: props.negotiation.patience,
            valueClaimed: props.negotiation.valueClaimed,
            valueCreated: props.negotiation.valueCreated,
            choicesMade: props.negotiation.choicesMade,
            informationRevealed: props.negotiation.informationRevealed,
            biasTrapsTriggered: props.negotiation.biasTrapsTriggered,
          },
          discoveredFacts: props.discoveredFacts,
          recentDialogue: props.recentDialogueText || '',
        }),
      });

      if (!response.ok) {
        throw new Error('AI advisor request failed');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAiAdvice(data.advice);
      cachedAdviceRef.current = data.advice;
      lastContextRef.current = contextKey;
    } catch {
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  }, [props, contextKey]);

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 left-6 z-40 flex size-12 items-center justify-center rounded-full bg-amber-500/90 shadow-lg shadow-amber-500/25 backdrop-blur-sm transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={isOpen ? 'Close advisor panel' : 'Open advisor panel'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="size-5 text-amber-950" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Lightbulb className="size-5 text-amber-950" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse indicator when closed and tips are urgent */}
        {!isOpen && tips.some((t) => t.severity === 'urgent') && (
          <motion.span
            className="absolute -right-0.5 -top-0.5 flex size-3.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex size-3.5 rounded-full bg-red-500" />
          </motion.span>
        )}
      </motion.button>

      {/* Slide-in Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="fixed left-0 top-0 z-40 flex h-full max-w-sm flex-col"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className="flex h-[70vh] my-auto ml-4 flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-900/95 via-zinc-900/98 to-amber-950/40 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-amber-500/15 px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15">
                      <Lightbulb className="size-4.5 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-amber-50 tracking-tight">
                        Advisor
                      </h2>
                      <p className="text-[11px] leading-tight text-amber-400/60">
                        Negotiation Mentor
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex size-7 items-center justify-center rounded-md text-amber-400/50 transition-colors hover:bg-amber-500/10 hover:text-amber-300"
                    aria-label="Close advisor"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Tips List */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-amber-500/20">
                  <AnimatePresence mode="popLayout">
                    {tips.map((tip, index) => {
                      const severityConf = SEVERITY_CONFIG[tip.severity];
                      const categoryConf = CATEGORY_CONFIG[tip.category];
                      return (
                        <motion.div
                          key={tip.id}
                          initial={{ opacity: 0, x: -20, scale: 0.96 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -20, scale: 0.96 }}
                          transition={{
                            delay: index * 0.07,
                            type: 'spring',
                            damping: 22,
                            stiffness: 260,
                          }}
                          className="group relative rounded-xl border border-amber-500/10 bg-gradient-to-br from-amber-500/[0.04] to-transparent p-3.5 transition-colors hover:border-amber-500/20 hover:bg-amber-500/[0.06]"
                        >
                          {/* Severity dot + content */}
                          <div className="flex gap-3">
                            <div className="mt-1 flex shrink-0">
                              <span
                                className={`size-2.5 rounded-full ${severityConf.dot}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2.5">
                              <p className="text-[13px] leading-relaxed text-amber-50/85">
                                {tip.text}
                              </p>
                              <Badge
                                variant="outline"
                                className={`gap-1 border text-[10px] font-medium ${categoryConf.badgeClass}`}
                              >
                                {categoryConf.icon}
                                {tip.category}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {tips.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <Lightbulb className="mb-3 size-8 text-amber-500/30" />
                      <p className="text-sm text-amber-400/50">
                        No tips right now.
                      </p>
                      <p className="mt-1 text-xs text-amber-400/30">
                        Start negotiating to get advice.
                      </p>
                    </motion.div>
                  )}

                  {/* AI Advice Card */}
                  {aiAdvice && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="rounded-xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-cyan-500/5 p-4 shadow-lg shadow-amber-500/5"
                    >
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="flex size-6 items-center justify-center rounded-md bg-amber-400/20">
                          <Sparkles className="size-3.5 text-amber-300" />
                        </div>
                        <span className="text-xs font-semibold text-amber-300 tracking-wide uppercase">
                          AI Advisor
                        </span>
                      </div>
                      <p className="text-[13px] leading-relaxed text-amber-50/90">
                        {aiAdvice}
                      </p>
                    </motion.div>
                  )}

                  {/* AI Error Card */}
                  {aiError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-3.5"
                    >
                      <p className="text-xs text-amber-400/60 italic">
                        AI advisor unavailable. Use the static tips above.
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Footer with Ask AI button */}
                <div className="border-t border-amber-500/10 px-5 py-3 space-y-2">
                  <Button
                    onClick={handleAskAI}
                    disabled={aiLoading || cooldownRemaining > 0}
                    className="w-full bg-gradient-to-r from-amber-500/80 to-amber-600/80 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-semibold gap-2 text-sm h-9 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="sm"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Thinking...
                      </>
                    ) : cooldownRemaining > 0 ? (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Wait {cooldownRemaining}s
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Ask AI
                      </>
                    )}
                  </Button>
                  <p className="text-center text-[11px] text-amber-500/35">
                    {aiAdvice ? 'AI advice based on your current state' : 'Based on your current negotiation state'}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
