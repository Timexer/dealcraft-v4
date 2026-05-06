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
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-500/3 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center space-y-8 px-4"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-4"
        >
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Briefcase className="h-8 w-8 text-amber-500" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter">
            <span className="text-foreground">DEAL</span>
            <span className="text-amber-500">CRAFT</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground tracking-wide">
            Negotiation Career Simulator
          </p>
          <p className="text-sm text-muted-foreground/60 max-w-md mx-auto">
            Discover what reality actually is — and design a deal that reality will accept.
          </p>
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
              className="text-center bg-card/50 border-border/50 h-11 text-base"
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
              className="h-11 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-base gap-2"
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
                className="h-11 font-medium gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
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

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="flex flex-wrap justify-center gap-2 pt-4"
        >
          {['30 Cases', '5 Tiers', 'Career Mode', 'Postmortem Analysis', 'Reputation System'].map((badge) => (
            <span key={badge} className="px-3 py-1 rounded-full text-xs bg-card/50 border border-border/50 text-muted-foreground">
              {badge}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
