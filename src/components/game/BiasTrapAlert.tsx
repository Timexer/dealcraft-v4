'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ShieldAlert, Eye } from 'lucide-react';
import type { BiasEvent } from '@/data/scenarios/types';

const BIAS_ICONS: Record<string, string> = {
  anchor_shock: '⚠️',
  fixed_pie: '🎯',
  escalation: '🔥',
  vividness: '👁️',
  egocentrism: '🧠',
  overconfidence: '💎',
  regret_aversion: '😰',
};

const BIAS_LABELS: Record<string, string> = {
  anchor_shock: 'Anchor Shock',
  fixed_pie: 'Fixed-Pie Bias',
  escalation: 'Escalation Trap',
  vividness: 'Vividness Bias',
  egocentrism: 'Egocentrism Bias',
  overconfidence: 'Overconfidence',
  regret_aversion: 'Regret Aversion',
};

interface BiasTrapAlertProps {
  biasEvent: BiasEvent;
  onDismiss: () => void;
}

export function BiasTrapAlert({ biasEvent, onDismiss }: BiasTrapAlertProps) {
  const [showCountermeasure, setShowCountermeasure] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  // Auto-dismiss countdown
  useEffect(() => {
    if (isPaused) return;
    if (timeLeft <= 0) {
      onDismiss();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isPaused, onDismiss]);

  const icon = BIAS_ICONS[biasEvent.type] || '⚠️';
  const label = BIAS_LABELS[biasEvent.type] || biasEvent.type;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="fixed top-4 right-4 z-[100] w-[360px] max-w-[calc(100vw-2rem)]"
    >
      <div
        className="relative overflow-hidden rounded-xl border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20"
        style={{
          background: 'oklch(1 0 0 / 8%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Amber glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent pointer-events-none" />

        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

        <div className="relative p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <motion.span
              className="text-2xl shrink-0 mt-0.5"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {icon}
            </motion.span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  {label}
                </h3>
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <p className="text-xs text-amber-500/60 mt-0.5">Cognitive Bias Detected</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-7 w-7 p-0 text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Warning Text */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
          >
            <p className="text-sm text-amber-300/90 leading-relaxed">
              {biasEvent.warningText}
            </p>
          </motion.div>

          {/* Countermeasure toggle */}
          <AnimatePresence>
            {showCountermeasure && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-3 overflow-hidden"
              >
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Eye className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Countermeasure
                    </span>
                  </div>
                  <p className="text-sm text-emerald-300/90 leading-relaxed">
                    {biasEvent.countermeasure}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!showCountermeasure ? (
              <Button
                size="sm"
                onClick={() => setShowCountermeasure(true)}
                className="h-8 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 hover:text-amber-200"
                variant="outline"
              >
                <Eye className="h-3 w-3 mr-1.5" />
                View Countermeasure
              </Button>
            ) : null}
            <Button
              size="sm"
              onClick={handleDismiss}
              className="h-8 text-xs text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10"
              variant="ghost"
            >
              Dismiss
            </Button>

            {/* Timer indicator */}
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-16 h-1 bg-amber-500/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500/60 rounded-full"
                  animate={{ width: `${(timeLeft / 15) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-[10px] text-amber-500/40 tabular-nums">{timeLeft}s</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Container component that manages multiple bias alerts
interface BiasTrapAlertContainerProps {
  activeAlerts: BiasEvent[];
  onDismiss: (id: string) => void;
}

export function BiasTrapAlertContainer({ activeAlerts, onDismiss }: BiasTrapAlertContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {activeAlerts.map((alert, i) => (
          <div key={alert.id} className="pointer-events-auto" style={{ marginTop: i > 0 ? '0' : undefined }}>
            <BiasTrapAlert
              biasEvent={alert}
              onDismiss={() => onDismiss(alert.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
