/**
 * PlayerSlice — Player identity, career progression, stats, reputation, streak system.
 */
import { StateCreator } from 'zustand';
import type { PlayerStats, ReputationScores } from '@/data/scenarios/types';
import {
  DEFAULT_STATS, DEFAULT_REPUTATION,
  STREAK_BONUS_MIN, STREAK_MULTIPLIER_CAP, STREAK_BONUS_PER_LEVEL,
} from '@/lib/constants';
import type { GameState, StreakHistoryEntry, ColorTheme } from '../types';

export interface PlayerSlice {
  // Player identity & career
  playerName: string;
  setPlayerName: (name: string) => void;
  careerTier: number;
  casesCompleted: number;
  totalScore: number;

  // Stats
  stats: PlayerStats;
  addStats: (delta: Partial<PlayerStats>) => void;

  // Reputation
  reputation: ReputationScores;
  addReputation: (delta: Partial<ReputationScores>) => void;

  // Streak System
  currentStreak: number;
  bestStreak: number;
  streakType: 'none' | 'win' | 'master';
  streakHistory: StreakHistoryEntry[];
  getStreakMultiplier: () => number;

  // Theme (logically part of player preferences)
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const defaultStats: PlayerStats = { ...DEFAULT_STATS };
const defaultReputation: ReputationScores = { ...DEFAULT_REPUTATION };

export const createPlayerSlice: StateCreator<GameState, [], [], PlayerSlice> = (set, get) => ({
  playerName: '',
  setPlayerName: (name) => set({ playerName: name }),
  careerTier: 1,
  casesCompleted: 0,
  totalScore: 0,

  stats: { ...defaultStats },
  addStats: (delta) =>
    set((s) => ({
      stats: Object.fromEntries(
        Object.entries(s.stats).map(([k, v]) => [k, Math.min(100, Math.max(0, (v as number) + ((delta as Record<string, number>)[k] ?? 0)))])
      ) as unknown as PlayerStats,
    })),

  reputation: { ...defaultReputation },
  addReputation: (delta) =>
    set((s) => ({
      reputation: Object.fromEntries(
        Object.entries(s.reputation).map(([k, v]) => [k, Math.min(100, Math.max(0, (v as number) + ((delta as Record<string, number>)[k] ?? 0)))])
      ) as unknown as ReputationScores,
    })),

  // Streak System
  currentStreak: 0,
  bestStreak: 0,
  streakType: 'none',
  streakHistory: [],
  getStreakMultiplier: () => {
    const s = get();
    if (s.currentStreak < STREAK_BONUS_MIN) return 1;
    const bonus = Math.min(STREAK_MULTIPLIER_CAP - 1, (s.currentStreak - 2) * STREAK_BONUS_PER_LEVEL);
    return 1 + bonus;
  },

  // Theme
  colorTheme: 'amber',
  setColorTheme: (theme) => set({ colorTheme: theme }),
});
