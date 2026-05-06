import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GamePhase, NegotiationState, PlayerStats, ReputationScores, CaseResult } from '@/data/scenarios/types';
import { getScenariosByCategory } from '@/data/scenarios';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number; // timestamp
}

export interface GameNotification {
  id: string;
  type: 'achievement' | 'tier_up' | 'reputation_change' | 'info';
  title: string;
  message: string;
  icon: string;
  timestamp: number;
  read: boolean;
}

export interface GameState {
  // Game phase
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;

  // Player info
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

  // Current case
  currentScenarioId: string | null;
  setCurrentScenarioId: (id: string | null) => void;

  // Investigation
  investigationPoints: number;
  maxInvestigationPoints: number;
  discoveredFacts: string[];
  investigationHistory: string[];
  spendInvestigationPoint: (actionId: string, revealedFacts: string[]) => void;
  resetInvestigation: () => void;

  // Negotiation state
  negotiation: NegotiationState;
  updateNegotiation: (delta: Partial<NegotiationState>) => void;
  applyEffects: (effects: Record<string, number>) => void;
  makeChoice: (choiceId: string, effects: Record<string, number>, infoRevealed?: string[]) => void;
  resetNegotiation: () => void;

  // Case results
  caseResults: CaseResult[];
  addCaseResult: (result: CaseResult) => void;
  replayCaseResult: (result: CaseResult) => void;

  // Replay tracking
  isReplay: boolean;
  setIsReplay: (isReplay: boolean) => void;

  // Case acceptance
  caseAccepted: boolean;
  setCaseAccepted: (accepted: boolean) => void;

  // Strategy
  batnaEstimate: number;
  setBatnaEstimate: (value: number) => void;
  reservationEstimate: number;
  setReservationEstimate: (value: number) => void;
  openingStrategy: string;
  setOpeningStrategy: (strategy: string) => void;
  assumptions: string[];
  addAssumption: (assumption: string) => void;
  removeAssumption: (index: number) => void;

  // Tutorial
  tutorialCompleted: boolean;
  setTutorialCompleted: () => void;

  // New game
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

const defaultStats: PlayerStats = {
  preparation: 10,
  valueClaiming: 10,
  valueCreation: 10,
  investigation: 10,
  emotionalControl: 10,
  ethicalJudgment: 10,
  powerStrategy: 10,
  relationshipMgmt: 10,
  crisisHandling: 10,
  culturalAwareness: 10,
};

const defaultReputation: ReputationScores = {
  shark: 0,
  architect: 0,
  detective: 0,
  diplomat: 0,
  closer: 0,
  ethicist: 0,
  fixer: 0,
};

const defaultNegotiation: NegotiationState = {
  trust: 50,
  anger: 20,
  patience: 70,
  currentDialogueNodeId: 'start',
  choicesMade: [],
  informationRevealed: [],
  valueClaimed: 0,
  valueCreated: 0,
  relationshipImpact: 0,
  ethicalImpact: 0,
  clientSatisfaction: 50,
  counterpartySatisfaction: 50,
  concessionsGiven: [],
  concessionsReceived: [],
  biasTrapsTriggered: [],
  issuesResolved: {},
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      phase: 'title',
      setPhase: (phase) => set({ phase }),

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

      currentScenarioId: null,
      setCurrentScenarioId: (id) => set({ currentScenarioId: id }),

      investigationPoints: 5,
      maxInvestigationPoints: 5,
      discoveredFacts: [],
      investigationHistory: [],
      spendInvestigationPoint: (actionId, revealedFacts) =>
        set((s) => ({
          investigationPoints: Math.max(0, s.investigationPoints - 1),
          discoveredFacts: [...new Set([...s.discoveredFacts, ...revealedFacts])],
          investigationHistory: [...s.investigationHistory, actionId],
        })),
      resetInvestigation: () =>
        set({
          investigationPoints: 5,
          maxInvestigationPoints: 5,
          discoveredFacts: [],
          investigationHistory: [],
        }),

      negotiation: { ...defaultNegotiation },
      updateNegotiation: (delta) =>
        set((s) => ({
          negotiation: { ...s.negotiation, ...delta },
        })),
      applyEffects: (effects) =>
        set((s) => ({
          negotiation: {
            ...s.negotiation,
            trust: Math.min(100, Math.max(0, s.negotiation.trust + (effects.trust ?? 0))),
            anger: Math.min(100, Math.max(0, s.negotiation.anger + (effects.anger ?? 0))),
            patience: Math.min(100, Math.max(0, s.negotiation.patience + (effects.patience ?? 0))),
            valueClaimed: s.negotiation.valueClaimed + (effects.valueClaimed ?? 0),
            valueCreated: s.negotiation.valueCreated + (effects.valueCreated ?? 0),
            relationshipImpact: s.negotiation.relationshipImpact + (effects.relationshipImpact ?? 0),
            ethicalImpact: s.negotiation.ethicalImpact + (effects.ethicalImpact ?? 0),
            clientSatisfaction: Math.min(100, Math.max(0, s.negotiation.clientSatisfaction + (effects.clientSatisfaction ?? 0))),
            counterpartySatisfaction: Math.min(100, Math.max(0, s.negotiation.counterpartySatisfaction + (effects.counterpartySatisfaction ?? 0))),
            informationRevealed: effects.informationRevealed
              ? [...new Set([...s.negotiation.informationRevealed, ...effects.informationRevealed])]
              : s.negotiation.informationRevealed,
            concessionsGiven: effects.concessionMade
              ? [...s.negotiation.concessionsGiven, effects.concessionMade]
              : s.negotiation.concessionsGiven,
          },
        })),
      makeChoice: (choiceId, effects, infoRevealed) =>
        set((s) => ({
          negotiation: {
            ...s.negotiation,
            choicesMade: [...s.negotiation.choicesMade, choiceId],
            trust: Math.min(100, Math.max(0, s.negotiation.trust + (effects.trust ?? 0))),
            anger: Math.min(100, Math.max(0, s.negotiation.anger + (effects.anger ?? 0))),
            patience: Math.min(100, Math.max(0, s.negotiation.patience + (effects.patience ?? 0))),
            valueClaimed: s.negotiation.valueClaimed + (effects.valueClaimed ?? 0),
            valueCreated: s.negotiation.valueCreated + (effects.valueCreated ?? 0),
            relationshipImpact: s.negotiation.relationshipImpact + (effects.relationshipImpact ?? 0),
            ethicalImpact: s.negotiation.ethicalImpact + (effects.ethicalImpact ?? 0),
            clientSatisfaction: Math.min(100, Math.max(0, s.negotiation.clientSatisfaction + (effects.clientSatisfaction ?? 0))),
            counterpartySatisfaction: Math.min(100, Math.max(0, s.negotiation.counterpartySatisfaction + (effects.counterpartySatisfaction ?? 0))),
            informationRevealed: infoRevealed
              ? [...new Set([...s.negotiation.informationRevealed, ...infoRevealed])]
              : s.negotiation.informationRevealed,
            concessionsGiven: effects.concessionMade
              ? [...s.negotiation.concessionsGiven, effects.concessionMade]
              : s.negotiation.concessionsGiven,
          },
        })),
      resetNegotiation: () =>
        set({
          negotiation: { ...defaultNegotiation },
        }),

      isReplay: false,
      setIsReplay: (isReplay) => set({ isReplay }),

      caseResults: [],
      addCaseResult: (result) =>
        set((s) => {
          const newResults = [...s.caseResults, result];
          const newCasesCompleted = newResults.length;
          const newTotalScore = s.totalScore + result.finalScore;
          const prevTier = s.careerTier;
          const newTier = newCasesCompleted < 3 ? 1 : newCasesCompleted < 8 ? 2 : newCasesCompleted < 15 ? 3 : newCasesCompleted < 22 ? 4 : 5;
          
          // Check for tier up
          const newNotifications = [...s.notifications];
          if (newTier > prevTier) {
            const tierNames: Record<number, string> = { 1: 'Junior Associate', 2: 'Deal Associate', 3: 'Senior Negotiator', 4: 'Crisis Partner', 5: 'Master Negotiator' };
            newNotifications.unshift({
              id: `notif-tier-${Date.now()}`,
              type: 'tier_up',
              title: '⬆️ Career Tier Up!',
              message: `You've been promoted to ${tierNames[newTier]}!`,
              icon: '📈',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Check for first case achievement
          const newAchievements = [...s.achievements];
          if (newCasesCompleted === 1 && !newAchievements.find(a => a.id === 'first_case')) {
            newAchievements.push({ id: 'first_case', title: 'First Case Closed', description: 'Complete your first negotiation case', icon: '📋', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-first-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'First Case Closed',
              icon: '📋',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Master deal achievement
          if (result.outcome === 'master' && !newAchievements.find(a => a.id === 'first_master')) {
            newAchievements.push({ id: 'first_master', title: 'Master Negotiator', description: 'Achieve a master deal outcome', icon: '👑', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-master-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Master Negotiator - You achieved a master deal!',
              icon: '👑',
              timestamp: Date.now(),
              read: false,
            });
          }

          // 5 cases achievement
          if (newCasesCompleted === 5 && !newAchievements.find(a => a.id === 'five_cases')) {
            newAchievements.push({ id: 'five_cases', title: 'Rising Star', description: 'Complete 5 negotiation cases', icon: '⭐', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-five-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Rising Star - 5 cases completed!',
              icon: '⭐',
              timestamp: Date.now(),
              read: false,
            });
          }

          // 10 cases achievement
          if (newCasesCompleted >= 10 && !newAchievements.find(a => a.id === 'ten_cases')) {
            newAchievements.push({ id: 'ten_cases', title: 'Deal Maker', description: 'Complete 10 negotiation cases', icon: '🎯', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-ten-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Deal Maker - 10 cases completed!',
              icon: '🎯',
              timestamp: Date.now(),
              read: false,
            });
          }

          // 20 cases achievement
          if (newCasesCompleted >= 20 && !newAchievements.find(a => a.id === 'twenty_cases')) {
            newAchievements.push({ id: 'twenty_cases', title: 'Veteran Negotiator', description: 'Complete 20 negotiation cases', icon: '🏅', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-twenty-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Veteran Negotiator - 20 cases completed!',
              icon: '🏅',
              timestamp: Date.now(),
              read: false,
            });
          }

          // All fundamentals achievement
          const fundamentalsIds = getScenariosByCategory('fundamentals').map(s => s.id);
          const allFundamentalsComplete = fundamentalsIds.length > 0 && fundamentalsIds.every(id => newResults.some(r => r.scenarioId === id));
          if (allFundamentalsComplete && !newAchievements.find(a => a.id === 'all_fundamentals')) {
            newAchievements.push({ id: 'all_fundamentals', title: 'Fundamentals Master', description: 'Complete all fundamentals cases', icon: '📚', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-fundamentals-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Fundamentals Master - All fundamentals cases completed!',
              icon: '📚',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Perfect score achievement
          if (result.finalScore >= 90 && !newAchievements.find(a => a.id === 'perfect_score')) {
            newAchievements.push({ id: 'perfect_score', title: 'Perfect Deal', description: 'Score 90+ on a case', icon: '💎', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-perfect-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Perfect Deal - Scored 90+ on a case!',
              icon: '💎',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Shark reputation achievement
          if (s.reputation.shark >= 15 && !newAchievements.find(a => a.id === 'shark_rep')) {
            newAchievements.push({ id: 'shark_rep', title: 'The Shark', description: 'Reach shark reputation 15+', icon: '🦈', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-shark-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'The Shark - Shark reputation reached 15+!',
              icon: '🦈',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Diplomat reputation achievement
          if (s.reputation.diplomat >= 15 && !newAchievements.find(a => a.id === 'diplomat_rep')) {
            newAchievements.push({ id: 'diplomat_rep', title: 'The Peacemaker', description: 'Reach diplomat reputation 15+', icon: '🕊️', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-diplomat-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'The Peacemaker - Diplomat reputation reached 15+!',
              icon: '🕊️',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Detective reputation achievement
          if (s.reputation.detective >= 15 && !newAchievements.find(a => a.id === 'detective_rep')) {
            newAchievements.push({ id: 'detective_rep', title: 'Truth Seeker', description: 'Reach detective reputation 15+', icon: '🔍', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-detective-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Truth Seeker - Detective reputation reached 15+!',
              icon: '🔍',
              timestamp: Date.now(),
              read: false,
            });
          }

          // 5 cooperative outcomes achievement
          const cooperativeCount = newResults.filter(r => r.outcome === 'cooperative').length;
          if (cooperativeCount >= 5 && !newAchievements.find(a => a.id === 'five_cooperative')) {
            newAchievements.push({ id: 'five_cooperative', title: 'Cooperative Champion', description: 'Get 5 cooperative outcomes', icon: '🤝', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-coop-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Cooperative Champion - 5 cooperative outcomes!',
              icon: '🤝',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Strategic no-deal achievement
          if (result.outcome === 'strategic_no_deal' && !newAchievements.find(a => a.id === 'no_deal_strategist')) {
            newAchievements.push({ id: 'no_deal_strategist', title: 'Strategic Walker', description: 'Get a strategic no-deal outcome', icon: '🚶', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-nodeal-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Strategic Walker - Achieved a strategic no-deal!',
              icon: '🚶',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Comeback kid achievement
          const previousResult = s.caseResults.length > 0 ? s.caseResults[s.caseResults.length - 1] : null;
          if (previousResult && previousResult.outcome === 'bad_deal' && result.outcome === 'master' && !newAchievements.find(a => a.id === 'comeback_kid')) {
            newAchievements.push({ id: 'comeback_kid', title: 'Comeback Kid', description: 'Get a master outcome after a bad deal on previous case', icon: '🔄', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-comeback-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Comeback Kid - Master deal after a bad deal!',
              icon: '🔄',
              timestamp: Date.now(),
              read: false,
            });
          }

          return {
            caseResults: newResults,
            casesCompleted: newCasesCompleted,
            totalScore: newTotalScore,
            careerTier: newTier,
            achievements: newAchievements,
            notifications: newNotifications,
          };
        }),

      replayCaseResult: (result) =>
        set((s) => {
          const existingIndex = s.caseResults.findIndex(r => r.scenarioId === result.scenarioId);
          if (existingIndex === -1) {
            // Not actually a replay, just add it
            return s;
          }

          const existingResult = s.caseResults[existingIndex];
          const oldScore = existingResult.finalScore;
          const newScore = result.finalScore;
          const scoreDiff = newScore - oldScore;

          // Replace the existing result with the better one
          const newResults = [...s.caseResults];
          newResults[existingIndex] = result;

          // Adjust totalScore: only add the difference if new score is better
          const adjustedTotalScore = scoreDiff > 0 ? s.totalScore + scoreDiff : s.totalScore;

          const prevTier = s.careerTier;
          const newCasesCompleted = newResults.length;
          const newTier = newCasesCompleted < 3 ? 1 : newCasesCompleted < 8 ? 2 : newCasesCompleted < 15 ? 3 : newCasesCompleted < 22 ? 4 : 5;

          // Check for tier up
          const newNotifications = [...s.notifications];
          if (newTier > prevTier) {
            const tierNames: Record<number, string> = { 1: 'Junior Associate', 2: 'Deal Associate', 3: 'Senior Negotiator', 4: 'Crisis Partner', 5: 'Master Negotiator' };
            newNotifications.unshift({
              id: `notif-tier-${Date.now()}`,
              type: 'tier_up',
              title: '⬆️ Career Tier Up!',
              message: `You've been promoted to ${tierNames[newTier]}!`,
              icon: '📈',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Re-check achievements based on new state
          const newAchievements = [...s.achievements];

          // Master deal achievement
          if (result.outcome === 'master' && !newAchievements.find(a => a.id === 'first_master')) {
            newAchievements.push({ id: 'first_master', title: 'Master Negotiator', description: 'Achieve a master deal outcome', icon: '👑', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-master-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Master Negotiator - You achieved a master deal!',
              icon: '👑',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Perfect score achievement
          if (result.finalScore >= 90 && !newAchievements.find(a => a.id === 'perfect_score')) {
            newAchievements.push({ id: 'perfect_score', title: 'Perfect Deal', description: 'Score 90+ on a case', icon: '💎', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-perfect-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Perfect Deal - Scored 90+ on a case!',
              icon: '💎',
              timestamp: Date.now(),
              read: false,
            });
          }

          // 5 cooperative outcomes achievement
          const cooperativeCount = newResults.filter(r => r.outcome === 'cooperative').length;
          if (cooperativeCount >= 5 && !newAchievements.find(a => a.id === 'five_cooperative')) {
            newAchievements.push({ id: 'five_cooperative', title: 'Cooperative Champion', description: 'Get 5 cooperative outcomes', icon: '🤝', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-coop-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Cooperative Champion - 5 cooperative outcomes!',
              icon: '🤝',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Strategic no-deal achievement
          if (result.outcome === 'strategic_no_deal' && !newAchievements.find(a => a.id === 'no_deal_strategist')) {
            newAchievements.push({ id: 'no_deal_strategist', title: 'Strategic Walker', description: 'Get a strategic no-deal outcome', icon: '🚶', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-nodeal-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Strategic Walker - Achieved a strategic no-deal!',
              icon: '🚶',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Comeback kid achievement
          const previousResult = existingIndex > 0 ? s.caseResults[existingIndex - 1] : null;
          if (previousResult && previousResult.outcome === 'bad_deal' && result.outcome === 'master' && !newAchievements.find(a => a.id === 'comeback_kid')) {
            newAchievements.push({ id: 'comeback_kid', title: 'Comeback Kid', description: 'Get a master outcome after a bad deal on previous case', icon: '🔄', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-comeback-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Comeback Kid - Master deal after a bad deal!',
              icon: '🔄',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Shark reputation achievement
          if (s.reputation.shark >= 15 && !newAchievements.find(a => a.id === 'shark_rep')) {
            newAchievements.push({ id: 'shark_rep', title: 'The Shark', description: 'Reach shark reputation 15+', icon: '🦈', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-shark-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'The Shark - Shark reputation reached 15+!',
              icon: '🦈',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Diplomat reputation achievement
          if (s.reputation.diplomat >= 15 && !newAchievements.find(a => a.id === 'diplomat_rep')) {
            newAchievements.push({ id: 'diplomat_rep', title: 'The Peacemaker', description: 'Reach diplomat reputation 15+', icon: '🕊️', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-diplomat-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'The Peacemaker - Diplomat reputation reached 15+!',
              icon: '🕊️',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Detective reputation achievement
          if (s.reputation.detective >= 15 && !newAchievements.find(a => a.id === 'detective_rep')) {
            newAchievements.push({ id: 'detective_rep', title: 'Truth Seeker', description: 'Reach detective reputation 15+', icon: '🔍', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-detective-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Truth Seeker - Detective reputation reached 15+!',
              icon: '🔍',
              timestamp: Date.now(),
              read: false,
            });
          }

          // All fundamentals achievement
          const fundamentalsIds = getScenariosByCategory('fundamentals').map(sc => sc.id);
          const allFundamentalsComplete = fundamentalsIds.length > 0 && fundamentalsIds.every(id => newResults.some(r => r.scenarioId === id));
          if (allFundamentalsComplete && !newAchievements.find(a => a.id === 'all_fundamentals')) {
            newAchievements.push({ id: 'all_fundamentals', title: 'Fundamentals Master', description: 'Complete all fundamentals cases', icon: '📚', unlockedAt: Date.now() });
            newNotifications.unshift({
              id: `notif-ach-fundamentals-${Date.now()}`,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: 'Fundamentals Master - All fundamentals cases completed!',
              icon: '📚',
              timestamp: Date.now(),
              read: false,
            });
          }

          // Replay notification
          if (scoreDiff > 0) {
            newNotifications.unshift({
              id: `notif-replay-${Date.now()}`,
              type: 'info',
              title: '🔄 Replay Score Improved!',
              message: `Your score improved by ${scoreDiff} points!`,
              icon: '📈',
              timestamp: Date.now(),
              read: false,
            });
          }

          return {
            caseResults: newResults,
            casesCompleted: newCasesCompleted,
            totalScore: adjustedTotalScore,
            careerTier: newTier,
            achievements: newAchievements,
            notifications: newNotifications,
            isReplay: false,
          };
        }),

      caseAccepted: false,
      setCaseAccepted: (accepted) => set({ caseAccepted: accepted }),

      batnaEstimate: 0,
      setBatnaEstimate: (value) => set({ batnaEstimate: value }),
      reservationEstimate: 0,
      setReservationEstimate: (value) => set({ reservationEstimate: value }),
      openingStrategy: '',
      setOpeningStrategy: (strategy) => set({ openingStrategy: strategy }),
      assumptions: [],
      addAssumption: (assumption) =>
        set((s) => ({ assumptions: [...s.assumptions, assumption] })),
      removeAssumption: (index) =>
        set((s) => ({ assumptions: s.assumptions.filter((_, i) => i !== index) })),

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
          investigationPoints: 5,
          maxInvestigationPoints: 5,
          discoveredFacts: [],
          investigationHistory: [],
          negotiation: { ...defaultNegotiation },
          batnaEstimate: 0,
          reservationEstimate: 0,
          openingStrategy: '',
          assumptions: [],
          unlockedCases: ['case-01', 'case-02', 'case-03'],
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
          investigationPoints: 5,
          maxInvestigationPoints: 5,
          discoveredFacts: [],
          investigationHistory: [],
          negotiation: { ...defaultNegotiation },
          batnaEstimate: 0,
          reservationEstimate: 0,
          openingStrategy: '',
          assumptions: [],
          unlockedCases: [],
        }),

      unlockedCases: ['case-01', 'case-02', 'case-03'],

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
    }),
    {
      name: 'dealcraft-game-state',
      partialize: (state) => ({
        playerName: state.playerName,
        careerTier: state.careerTier,
        casesCompleted: state.casesCompleted,
        totalScore: state.totalScore,
        stats: state.stats,
        reputation: state.reputation,
        caseResults: state.caseResults,
        unlockedCases: state.unlockedCases,
        phase: state.phase,
        achievements: state.achievements,
        notifications: state.notifications.slice(0, 50), // Keep last 50 notifications
        tutorialCompleted: state.tutorialCompleted,
        // Persist active game state so page refresh doesn't lose progress
        currentScenarioId: state.currentScenarioId,
        caseAccepted: state.caseAccepted,
        isReplay: state.isReplay,
        batnaEstimate: state.batnaEstimate,
        reservationEstimate: state.reservationEstimate,
        openingStrategy: state.openingStrategy,
        assumptions: state.assumptions,
        investigationPoints: state.investigationPoints,
        maxInvestigationPoints: state.maxInvestigationPoints,
        discoveredFacts: state.discoveredFacts,
        investigationHistory: state.investigationHistory,
        negotiation: state.negotiation,
      }),
    }
  )
);
