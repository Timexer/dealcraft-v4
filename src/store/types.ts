/**
 * Shared types for the Zustand game store slices.
 * These types are used across multiple slices and re-exported from game-store.ts
 * for backward compatibility with all existing consumer imports.
 */

import type { GamePhase, NegotiationState, NegotiationTechnique, PlayerStats, ReputationScores, CaseResult } from '@/data/scenarios/types';
import type { PlayerSlice } from './slices/player-slice';
import type { NegotiationSlice } from './slices/negotiation-slice';
import type { MetaSlice } from './slices/meta-slice';

// ─── Shared interfaces ────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number; // timestamp
}

export interface GameNotification {
  id: string;
  type: 'achievement' | 'tier_up' | 'reputation_change' | 'info' | 'streak';
  title: string;
  message: string;
  icon: string;
  timestamp: number;
  read: boolean;
}

export interface StreakHistoryEntry {
  type: string;
  startedAt: number;
  length: number;
  endedAt: number;
}

export type ColorTheme = 'amber' | 'emerald' | 'crimson' | 'ocean';

// ─── Combined GameState type ──────────────────────────────────────────────────

export type GameState = PlayerSlice & NegotiationSlice & MetaSlice;

// Re-export slice types for convenience
export type { PlayerSlice, NegotiationSlice, MetaSlice };
