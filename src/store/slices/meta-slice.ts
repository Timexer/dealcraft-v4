/**
 * MetaSlice — Game orchestration, theme, tutorial, notifications, achievements.
 *
 * NOTE: `startNewGame` and `resetGame` are cross-cutting — they reset ALL state
 * across all slices. They stay here but use `set()` to reset everything.
 */
import { StateCreator } from 'zustand';
import type { GamePhase } from '@/data/scenarios/types';
import {
  DEFAULT_STATS, DEFAULT_REPUTATION, DEFAULT_NEGOTIATION,
  DEFAULT_INVESTIGATION_POINTS, INITIAL_UNLOCKED_CASES,
} from '@/lib/constants';
import type { GameState, Achievement, GameNotification } from '../types';

export interface MetaSlice {
  // Game phase
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;

  // Tutorial
  tutorialCompleted: boolean;
  setTutorialCompleted: () => void;

  // New game (cross-cutting: resets ALL state across all slices)
  startNewGame: (name: string) => void;
  resetGame: () => void;

  // Available cases (unlocked based on tier)
  unlockedCases: string[];

  // Achievements
  achievements: Achievement[];
  unlockAchievement: (achievement: Omit<Achievement, 'unlockedAt'>) => void;

  // Notifications
  notifications: GameNotification[];
  addNotification: (notification: Omit<GameNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  unreadNotificationCount: () => number;
}

const defaultStats = { ...DEFAULT_STATS };
const defaultReputation = { ...DEFAULT_REPUTATION };
const defaultNegotiation = { ...DEFAULT_NEGOTIATION };

export const createMetaSlice: StateCreator<GameState, [], [], MetaSlice> = (set, get) => ({
  phase: 'title',
  setPhase: (phase) => set({ phase }),

  tutorialCompleted: false,
  setTutorialCompleted: () => set({ tutorialCompleted: true }),

  startNewGame: (name) =>
    set({
      phase: 'dashboard',
      playerName: name,
      careerTier: 1,
      casesCompleted: 0,
      totalScore: 0,
      stats: { ...defaultStats },
      reputation: { ...defaultReputation },
      currentScenarioId: null,
      caseResults: [],
      isReplay: false,
      caseAccepted: false,
      investigationPoints: DEFAULT_INVESTIGATION_POINTS,
      maxInvestigationPoints: DEFAULT_INVESTIGATION_POINTS,
      discoveredFacts: [],
      investigationHistory: [],
      techniquesUsed: [],
      negotiation: { ...defaultNegotiation },
      batnaEstimate: 0,
      reservationEstimate: 0,
      openingStrategy: '',
      assumptions: [],
      unlockedCases: [...INITIAL_UNLOCKED_CASES],
      challengeMode: 'none',
      challengeTimer: 0,
      currentStreak: 0,
      bestStreak: 0,
      streakType: 'none',
      streakHistory: [],
      negotiationStartTime: null,
      discoveredBlackSwans: [],
    }),

  resetGame: () =>
    set({
      phase: 'title',
      playerName: '',
      careerTier: 1,
      casesCompleted: 0,
      totalScore: 0,
      stats: { ...defaultStats },
      reputation: { ...defaultReputation },
      currentScenarioId: null,
      caseResults: [],
      isReplay: false,
      caseAccepted: false,
      investigationPoints: DEFAULT_INVESTIGATION_POINTS,
      maxInvestigationPoints: DEFAULT_INVESTIGATION_POINTS,
      discoveredFacts: [],
      investigationHistory: [],
      techniquesUsed: [],
      negotiation: { ...defaultNegotiation },
      batnaEstimate: 0,
      reservationEstimate: 0,
      openingStrategy: '',
      assumptions: [],
      unlockedCases: [],
      challengeMode: 'none',
      challengeTimer: 0,
      currentStreak: 0,
      bestStreak: 0,
      streakType: 'none',
      streakHistory: [],
      negotiationStartTime: null,
      achievements: [],
      notifications: [],
      tutorialCompleted: false,
      colorTheme: 'amber',
      discoveredBlackSwans: [],
    }),

  unlockedCases: [...INITIAL_UNLOCKED_CASES],

  achievements: [],
  unlockAchievement: (achievement) =>
    set((s) => {
      if (s.achievements.find(a => a.id === achievement.id)) return s;
      const newAchievement = { ...achievement, unlockedAt: Date.now() };
      return {
        achievements: [...s.achievements, newAchievement],
        notifications: [{
          id: `notif-${Date.now()}`,
          type: 'achievement' as const,
          title: '🏆 Achievement Unlocked!',
          message: achievement.title,
          icon: achievement.icon,
          timestamp: Date.now(),
          read: false,
        }, ...s.notifications],
      };
    }),

  notifications: [],
  addNotification: (notification) =>
    set((s) => ({
      notifications: [{
        ...notification,
        id: `notif-${Date.now()}`,
        timestamp: Date.now(),
        read: false,
      }, ...s.notifications],
    })),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    })),
  unreadNotificationCount: () => get().notifications.filter(n => !n.read).length,
});
