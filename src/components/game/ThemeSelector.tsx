'use client';

import { useEffect, useCallback } from 'react';
import { useGameStore, type ColorTheme } from '@/store/game-store';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';

interface ThemeDefinition {
  id: ColorTheme;
  name: string;
  primary: string;
  accent: string;
  glow: string;
  primaryBg: string;
  primaryText: string;
  gradient: string;
  swatchFrom: string;
  swatchTo: string;
  disabled?: boolean; // Mark themes that aren't fully implemented yet
  disabledReason?: string;
}

const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: 'amber',
    name: 'Amber Gold',
    primary: '#f59e0b',
    accent: '#fbbf24',
    glow: 'oklch(0.77 0.16 75)',
    primaryBg: 'rgba(245, 158, 11, 0.1)',
    primaryText: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    swatchFrom: '#f59e0b',
    swatchTo: '#fbbf24',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    primary: '#10b981',
    accent: '#2dd4bf',
    glow: 'oklch(0.7 0.15 165)',
    primaryBg: 'rgba(16, 185, 129, 0.1)',
    primaryText: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #2dd4bf)',
    swatchFrom: '#10b981',
    swatchTo: '#2dd4bf',
    disabled: true,
    disabledReason: 'Coming Soon — Full app theme support in development',
  },
  {
    id: 'crimson',
    name: 'Crimson',
    primary: '#f43f5e',
    accent: '#f472b6',
    glow: 'oklch(0.65 0.2 10)',
    primaryBg: 'rgba(244, 63, 94, 0.1)',
    primaryText: '#f43f5e',
    gradient: 'linear-gradient(135deg, #f43f5e, #f472b6)',
    swatchFrom: '#f43f5e',
    swatchTo: '#f472b6',
    disabled: true,
    disabledReason: 'Coming Soon — Full app theme support in development',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    primary: '#06b6d4',
    accent: '#38bdf8',
    glow: 'oklch(0.7 0.15 230)',
    primaryBg: 'rgba(6, 182, 212, 0.1)',
    primaryText: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #38bdf8)',
    swatchFrom: '#06b6d4',
    swatchTo: '#38bdf8',
    disabled: true,
    disabledReason: 'Coming Soon — Full app theme support in development',
  },
];

function applyTheme(theme: ThemeDefinition) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-glow', theme.glow);
  root.style.setProperty('--theme-primary-bg', theme.primaryBg);
  root.style.setProperty('--theme-primary-text', theme.primaryText);
  root.style.setProperty('--theme-gradient', theme.gradient);
}

export function useThemeApplication() {
  const colorTheme = useGameStore((s) => s.colorTheme);

  useEffect(() => {
    const theme = THEME_DEFINITIONS.find(t => t.id === colorTheme) || THEME_DEFINITIONS[0];
    applyTheme(theme);
  }, [colorTheme]);
}

export function ThemeSelector() {
  const { colorTheme, setColorTheme } = useGameStore();

  const handleSelect = useCallback((theme: ColorTheme, disabled?: boolean) => {
    if (disabled) return;
    setColorTheme(theme);
  }, [setColorTheme]);

  return (
    <div className="grid grid-cols-2 gap-2">
      {THEME_DEFINITIONS.map((theme) => {
        const isActive = colorTheme === theme.id;
        const isDisabled = theme.disabled;
        return (
          <motion.button
            key={theme.id}
            whileHover={isDisabled ? {} : { scale: 1.03 }}
            whileTap={isDisabled ? {} : { scale: 0.97 }}
            onClick={() => handleSelect(theme.id, isDisabled)}
            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
              isDisabled
                ? 'border-border/20 bg-card/10 cursor-not-allowed opacity-60'
                : isActive
                  ? 'border-[var(--theme-primary)] shadow-lg'
                  : 'border-border/30 hover:border-border/50 bg-card/30'
            }`}
            style={isActive && !isDisabled ? {
              boxShadow: `0 0 20px ${theme.primary}20, 0 0 40px ${theme.primary}10`,
              backgroundColor: theme.primaryBg,
            } : {}}
            disabled={isDisabled}
          >
            {/* Color swatch gradient */}
            <div
              className="w-full h-8 rounded-lg relative"
              style={{
                background: `linear-gradient(135deg, ${theme.swatchFrom}, ${theme.swatchTo})`,
                opacity: isDisabled ? 0.3 : isActive ? 1 : 0.7,
              }}
            >
              {/* Disabled overlay with lock icon */}
              {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="h-3.5 w-3.5 text-white/70" />
                </div>
              )}
            </div>
            {/* Theme name */}
            <span className={`text-xs font-medium ${isActive && !isDisabled ? '' : 'text-muted-foreground'}`}
              style={isActive && !isDisabled ? { color: theme.primaryText } : {}}
            >
              {theme.name}
            </span>
            {/* Disabled reason */}
            {isDisabled && theme.disabledReason && (
              <span className="text-[10px] text-muted-foreground/60 leading-tight">
                {theme.disabledReason}
              </span>
            )}
            {/* Active checkmark */}
            {isActive && !isDisabled && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                <Check className="h-2.5 w-2.5 text-white" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
