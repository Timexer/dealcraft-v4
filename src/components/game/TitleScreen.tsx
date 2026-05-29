'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Briefcase, Play, RotateCcw, Lock } from 'lucide-react';
import { useThemeApplication } from '@/components/game/ThemeSelector';

// Floating negotiation term badges
const NEGOTIATION_TERMS = [
  'BATNA', 'ZOPA', 'Walk-Away Point', 'Anchoring', 'Logrolling',
  'Aspiration Price', 'Value Creation', 'Fixed Pie', 'Escalation',
  'Empathic Listening', 'Face-saving', 'Walk Away', 'Contingency',
  'Package Offer', 'Silence as a Tool',
];

// Particle positions for background - deterministic seed to avoid hydration mismatch
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// Round to 4 decimal places to prevent SSR/client floating-point precision mismatch
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(seededRandom(i * 7 + 1) * 100).toFixed(4)}%`,
  size: `${(2 + seededRandom(i * 13 + 2) * 4).toFixed(4)}px`,
  duration: `${(8 + seededRandom(i * 17 + 3) * 12).toFixed(4)}s`,
  delay: `${(seededRandom(i * 23 + 4) * 8).toFixed(4)}s`,
  drift: `${(-30 + seededRandom(i * 29 + 5) * 60).toFixed(4)}px`,
  opacity: `${(0.15 + seededRandom(i * 31 + 6) * 0.25).toFixed(4)}`,
}));

export function TitleScreen() {
  const { startNewGame, playerName, casesCompleted, resetGame } = useGameStore();
  const [name, setName] = useState('');
  const hasSave = casesCompleted > 0;

  // Passcode state
  const [isLocked, setIsLocked] = useState(true);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [hasCheckedLock, setHasCheckedLock] = useState(false);

  // You can change these to whatever you want
  const VALID_PASSCODES = ['DEAL_MASTER_2026', 'EB_VIP_MEMBER'];

  useEffect(() => {
    // Check if already unlocked in localStorage
    const isUnlocked = localStorage.getItem('dealcraft_unlocked') === 'true';
    if (isUnlocked) {
      setIsLocked(false);
      setHasCheckedLock(true);
      return;
    }

    // Check URL for passcode (avoids Next.js SSR de-opt by doing it client side)
    const urlParams = new URLSearchParams(window.location.search);
    const urlPasscode = urlParams.get('passcode');
    
    if (urlPasscode && VALID_PASSCODES.includes(urlPasscode)) {
      localStorage.setItem('dealcraft_unlocked', 'true');
      setIsLocked(false);
      // Clean up URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    setHasCheckedLock(true);
  }, []);

  const handleUnlock = () => {
    if (VALID_PASSCODES.includes(passcodeInput.trim())) {
      localStorage.setItem('dealcraft_unlocked', 'true');
      setIsLocked(false);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  // Apply theme
  useThemeApplication();

  // Typewriter effect state
  const [displayedSubtitle, setDisplayedSubtitle] = useState('');
  const subtitleText = 'Negotiation Career Simulator';
  const [typewriterDone, setTypewriterDone] = useState(false);

  // Parallax effect state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= subtitleText.length) {
        setDisplayedSubtitle(subtitleText.slice(0, index));
        index++;
      } else {
        setTypewriterDone(true);
        clearInterval(timer);
      }
    }, 60);
    return () => clearInterval(timer);
  }, []);

  // Parallax mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 grid-pattern opacity-60 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating particle effect background */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            ['--particle-size' as string]: p.size,
            ['--particle-duration' as string]: p.duration,
            ['--particle-delay' as string]: p.delay,
            ['--particle-drift' as string]: p.drift,
            ['--particle-opacity' as string]: p.opacity,
          } as React.CSSProperties}
        />
      ))}

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-500/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-amber-600/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating negotiation term badges */}
      {NEGOTIATION_TERMS.slice(0, 8).map((term, i) => {
        const top = 10 + (i * 11) % 80;
        const left = (i * 17 + 5) % 90;
        return (
          <div
            key={term}
            className="floating-badge glass-card px-3 py-1 rounded-full text-[11px] text-amber-500/40 font-medium tracking-wider pointer-events-none"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              ['--float-duration' as string]: `${12 + i * 2}s`,
              ['--float-delay' as string]: `${i * 1.5}s`,
              ['--drift-x' as string]: `${-30 + i * 10}px`,
              ['--drift-y' as string]: `${-20 + i * 8}px`,
              ['--float-start-opacity' as string]: '0.12',
              ['--float-mid-opacity' as string]: '0.22',
            } as React.CSSProperties}
          >
            {term}
          </div>
        );
      })}

      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-40 h-40 pointer-events-none">
        <div className="absolute top-8 left-8 w-16 h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
        <div className="absolute top-8 left-8 w-px h-16 bg-gradient-to-b from-amber-500/30 to-transparent" />
      </div>
      <div className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none">
        <div className="absolute bottom-8 right-8 w-16 h-px bg-gradient-to-l from-amber-500/30 to-transparent" />
        <div className="absolute bottom-8 right-8 w-px h-16 bg-gradient-to-t from-amber-500/30 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center space-y-8 px-4"
      >
        {/* Logo with parallax + pulsing glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-4"
          style={{
            transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center dramatic-glow-themed">
            <Briefcase className="h-8 w-8 text-amber-500" />
          </div>
        </motion.div>

        {/* Title with gradient text + parallax */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-3"
          style={{
            transform: `translate(${mousePos.x * 4}px, ${mousePos.y * 4}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter">
            <span className="text-foreground">DEAL</span>
            <span className="gradient-text-themed">CRAFT</span>
          </h1>
          {/* Typewriter effect for subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground tracking-wide h-7">
            {displayedSubtitle}
            {!typewriterDone && <span className="typewriter-cursor" />}
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
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

        {/* Main Interaction Area (Passcode Gate or Name Input) */}
        {!hasCheckedLock ? (
          <div className="h-40 flex items-center justify-center">
             <div className="animate-spin h-6 w-6 border-2 border-amber-500 rounded-full border-t-transparent"></div>
          </div>
        ) : isLocked ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4 max-w-sm mx-auto w-full p-6 glass-card rounded-2xl relative overflow-hidden text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
            <div className="relative space-y-4">
              <div className="flex justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center dramatic-glow-themed">
                  <Lock className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-1">Private Beta Access</h3>
                <p className="text-xs text-muted-foreground">DealCraft is currently in closed beta. Enter your passcode to unlock.</p>
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => { setPasscodeInput(e.target.value); setPasscodeError(false); }}
                  placeholder="Enter passcode..."
                  className={`text-center bg-background/50 h-11 ${passcodeError ? 'border-red-500 focus:ring-red-500/20' : 'focus:border-amber-500/50 focus:ring-amber-500/20'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUnlock();
                  }}
                />
                {passcodeError && (
                  <p className="text-xs text-red-500 text-center font-medium">Invalid passcode. Please try again.</p>
                )}
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Button onClick={handleUnlock} className="w-full premium-button-themed h-11 text-black font-semibold text-base gap-2 dramatic-glow-themed">
                  Unlock Access
                </Button>
                
                <div className="relative py-2 flex items-center">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink-0 mx-4 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">or</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                {/* NOTE TO TIM: Replace this URL with your LemonSqueezy Product checkout link! */}
                <Button 
                  onClick={() => window.open('https://englishbreakfast.lemonsqueezy.com/', '_blank')} 
                  variant="outline" 
                  className="w-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10 h-11 text-sm font-medium"
                >
                  Get Free Instant Access
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4 max-w-sm mx-auto"
          >
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground text-left block">Welcome, Negotiator.</label>
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
                className="h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-base gap-2 premium-button-themed dramatic-glow-themed disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
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
        )}

        {/* Feature badges with glass-card style + parallax */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="flex flex-wrap justify-center gap-2 pt-4"
          style={{
            transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          {['30 Cases', '5 Tiers', 'Career Mode', 'Postmortem Analysis', 'Reputation System', 'Glossary', 'AI Advisor', 'Bias Traps', 'Streaks', 'Themes'].map((badge) => (
            <span key={badge} className="glass-card px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-amber-400 transition-colors duration-200 card-hover-lift cursor-default">
              {badge}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
