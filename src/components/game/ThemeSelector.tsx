'use client';

import { useEffect, useCallback } from 'react';
import { useGameStore, type ColorTheme } from '@/store/game-store';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

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

  const handleSelect = useCallback((theme: ColorTheme) => {
    setColorTheme(theme);
  }, [setColorTheme]);

  return (
    <div className="grid grid-cols-2 gap-2">
      {THEME_DEFINITIONS.map((theme) => {
        const isActive = colorTheme === theme.id;
        return (
          <motion.button
            key={theme.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect(theme.id)}
            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
              isActive
                ? 'border-[var(--theme-primary)] shadow-lg'
                : 'border-border/30 hover:border-border/50 bg-card/30'
            }`}
            style={isActive ? {
              boxShadow: `0 0 20px ${theme.primary}20, 0 0 40px ${theme.primary}10`,
              backgroundColor: theme.primaryBg,
            } : {}}
          >
            {/* Color swatch gradient */}
            <div
              className="w-full h-8 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.swatchFrom}, ${theme.swatchTo})`,
                opacity: isActive ? 1 : 0.7,
              }}
            />
            {/* Theme name */}
            <span className={`text-xs font-medium ${isActive ? '' : 'text-muted-foreground'}`}
              style={isActive ? { color: theme.primaryText } : {}}
            >
              {theme.name}
            </span>
            {/* Active checkmark */}
            {isActive && (
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
