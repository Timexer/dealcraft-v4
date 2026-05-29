'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Briefcase, Play, RotateCcw, Lock, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useThemeApplication } from '@/components/game/ThemeSelector';
import { signIn, signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';

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
  const { startNewGame, resetGame, hydrateFromServer } = useGameStore();
  const { data: session, status } = useSession();

  // Auth mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  // Fetch player state from DB when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      const fetchState = async () => {
        try {
          const res = await fetch('/api/player/sync');
          if (res.ok) {
            const data = await res.json();
            if (data.playerState) {
              hydrateFromServer(data.playerState);
            }
          }
        } catch (e) {
          console.error("Failed to sync player state:", e);
        }
      };
      fetchState();
    }
  }, [status, hydrateFromServer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid credentials");
      } else {
        toast.success("Login successful!");
        // We could fetch user state from API here to hydrate
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Registration failed");
      } else {
        toast.success("Account created! Logging you in...");
        await signIn('credentials', { email, password, redirect: false });
      }
    } catch (err) {
      toast.error("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = () => {
    if (session?.user?.name) {
      startNewGame(session.user.name);
    }
  };

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

        {/* Auth Interface */}
        <div className="min-h-[320px] flex flex-col items-center justify-center w-full">
          {status === 'loading' ? (
             <div className="animate-spin h-6 w-6 border-2 border-amber-500 rounded-full border-t-transparent"></div>
          ) : status === 'unauthenticated' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4 max-w-sm mx-auto w-full p-6 glass-card rounded-2xl relative overflow-hidden text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
              
              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="relative space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {authMode === 'login' ? 'Log in to continue your career.' : 'Sign up to start your negotiation journey.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {authMode === 'register' && (
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name (e.g., Harvey Specter)"
                      className="bg-background/50 h-10 focus:border-amber-500/50 focus:ring-amber-500/20"
                      required
                    />
                  )}
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="bg-background/50 h-10 focus:border-amber-500/50 focus:ring-amber-500/20"
                    required
                  />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="bg-background/50 h-10 focus:border-amber-500/50 focus:ring-amber-500/20"
                    required
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full premium-button-themed h-11 text-black font-semibold text-sm gap-2 dramatic-glow-themed"
                  >
                    {isLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-black rounded-full border-t-transparent" />
                    ) : authMode === 'login' ? (
                      <><LogIn className="w-4 h-4" /> Sign In</>
                    ) : (
                      <><UserPlus className="w-4 h-4" /> Create Account</>
                    )}
                  </Button>
                  
                  <button 
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-sm font-medium text-amber-400 hover:text-amber-300 text-center w-full transition-colors pt-1"
                  >
                    {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 max-w-sm mx-auto w-full p-6 glass-card rounded-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
              <div className="relative text-center space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Logged in as</p>
                  <h3 className="text-xl font-bold text-foreground">{session?.user?.name}</h3>
                  <p className="text-xs text-amber-500/70">Access Tier: {session?.user?.accessTier}</p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button
                    onClick={handleStartGame}
                    className="h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-base gap-2 premium-button-themed dramatic-glow-themed"
                  >
                    <Play className="h-4 w-4" />
                    Enter Dashboard
                  </Button>

                  <Button
                    onClick={() => signOut()}
                    variant="ghost"
                    className="h-9 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 text-sm gap-2 mt-2"
                  >
                    <LogOut className="h-3 w-3" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

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
