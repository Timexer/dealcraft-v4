'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Briefcase, Play, RotateCcw } from 'lucide-react';

export function TitleScreen() {
  const { startNewGame, playerName, casesCompleted, resetGame } = useGameStore();
  const [name, setName] = useState('');
  const hasSave = casesCompleted > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 grid-pattern opacity-60" />
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-500/3 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-amber-600/3 rounded-full blur-[100px]" />

      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-40 h-40">
        <div className="absolute top-8 left-8 w-16 h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
        <div className="absolute top-8 left-8 w-px h-16 bg-gradient-to-b from-amber-500/30 to-transparent" />
      </div>
      <div className="absolute bottom-0 right-0 w-40 h-40">
        <div className="absolute bottom-8 right-8 w-16 h-px bg-gradient-to-l from-amber-500/30 to-transparent" />
        <div className="absolute bottom-8 right-8 w-px h-16 bg-gradient-to-t from-amber-500/30 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center space-y-8 px-4"
      >
        {/* Logo with pulsing glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-4"
        >
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center glow-pulse">
            <Briefcase className="h-8 w-8 text-amber-500" />
          </div>
        </motion.div>

        {/* Title with gradient text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter">
            <span className="text-foreground">DEAL</span>
            <span className="gradient-text">CRAFT</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground tracking-wide">
            Negotiation Career Simulator
          </p>
          <p className="text-sm text-muted-foreground/60 max-w-md mx-auto">
            Discover what reality actually is — and design a deal that reality will accept.
          </p>
        </motion.div>

        {/* Animated divider line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-xs mx-auto"
        >
          <div className="animated-line mx-auto" style={{ maxWidth: '200px' }} />
        </motion.div>

        {/* Name input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="space-y-4 max-w-sm mx-auto"
        >
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground text-left block">Your name, negotiator</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="text-center bg-card/50 border-border/50 h-11 text-base focus:border-amber-500/50 focus:ring-amber-500/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  startNewGame(name.trim());
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => name.trim() && startNewGame(name.trim())}
              disabled={!name.trim()}
              className="h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-base gap-2 premium-button disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
            >
              <Play className="h-4 w-4" />
              New Career
            </Button>

            {hasSave && (
              <Button
                onClick={() => {
                  useGameStore.getState().setPhase('dashboard');
                }}
                variant="outline"
                className="h-11 font-medium gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50"
              >
                Continue as {playerName}
              </Button>
            )}

            {hasSave && (
              <Button
                onClick={resetGame}
                variant="ghost"
                className="h-9 text-muted-foreground text-sm gap-2"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Game
              </Button>
            )}
          </div>
        </motion.div>

        {/* Feature badges with glass-card style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="flex flex-wrap justify-center gap-2 pt-4"
        >
          {['30 Cases', '5 Tiers', 'Career Mode', 'Postmortem Analysis', 'Reputation System', 'Glossary', 'AI Advisor', 'Bias Traps'].map((badge) => (
            <span key={badge} className="glass-card px-3 py-1.5 rounded-full text-xs text-muted-foreground/80 hover:text-amber-400 transition-colors duration-200 card-hover-lift cursor-default">
              {badge}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
