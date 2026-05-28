/**
 * NegotiationSlice — Active case session, investigation, negotiation, strategy,
 * case results, black swans.
 *
 * NOTE: `addCaseResult` and `replayCaseResult` are cross-cutting — they update
 * player state (tier, score, casesCompleted, streak) and meta state (achievements,
 * notifications) as well. In the Zustand slice pattern, these stay here but use
 * `set()` to update ALL slice state at once, and `get()` to read cross-slice state.
 */
import { StateCreator } from 'zustand';
import type { NegotiationState, NegotiationTechnique, CaseResult, StateEffect } from '@/data/scenarios/types';
import { getScenariosByCategory, getScenarioById } from '@/data/scenarios';
import {
  getTierFromCases,
  DEFAULT_NEGOTIATION,
  DEFAULT_INVESTIGATION_POINTS,
  STREAK_BONUS_MIN, STREAK_MULTIPLIER_CAP, STREAK_BONUS_PER_LEVEL,
  STREAK_MILESTONES, ACHIEVEMENT_THRESHOLDS,
  TIER_NAMES,
} from '@/lib/constants';
import type { GameState } from '../types';

export interface NegotiationSlice {
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

  // Technique tracking
  techniquesUsed: NegotiationTechnique[];
  addTechniqueUsed: (technique: NegotiationTechnique) => void;

  // Negotiation state
  negotiation: NegotiationState;
  updateNegotiation: (delta: Partial<NegotiationState>) => void;
  applyEffects: (effects: StateEffect) => void;
  makeChoice: (choiceId: string, effects: StateEffect, infoRevealed?: string[]) => void;
  resetNegotiation: () => void;

  // Case results (cross-cutting: also updates player & meta state)
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

  // Challenge Mode
  challengeMode: 'none' | 'speed' | 'limited_choices' | 'ethics_lock';
  setChallengeMode: (mode: 'none' | 'speed' | 'limited_choices' | 'ethics_lock') => void;
  challengeTimer: number;
  setChallengeTimer: (seconds: number) => void;

  // Negotiation Timer
  negotiationStartTime: number | null;
  setNegotiationStartTime: (time: number | null) => void;

  // Black Swans
  discoveredBlackSwans: string[];
  discoverBlackSwan: (id: string) => void;

  // Session cleanup (called when leaving postmortem, NOT in addCaseResult)
  clearCaseSession: () => void;
}

const defaultNegotiation: NegotiationState = { ...DEFAULT_NEGOTIATION };

export const createNegotiationSlice: StateCreator<GameState, [], [], NegotiationSlice> = (set, get) => ({
  currentScenarioId: null,
  setCurrentScenarioId: (id) => set({ currentScenarioId: id }),

  investigationPoints: DEFAULT_INVESTIGATION_POINTS,
  maxInvestigationPoints: DEFAULT_INVESTIGATION_POINTS,
  discoveredFacts: [],
  investigationHistory: [],
  spendInvestigationPoint: (actionId, revealedFacts) => {
    if (get().investigationPoints <= 0) return;
    set((s) => ({
      investigationPoints: Math.max(0, s.investigationPoints - 1),
      discoveredFacts: [...new Set([...s.discoveredFacts, ...revealedFacts])],
      investigationHistory: [...s.investigationHistory, actionId],
    }));
  },
  resetInvestigation: () =>
    set({
      investigationPoints: DEFAULT_INVESTIGATION_POINTS,
      maxInvestigationPoints: DEFAULT_INVESTIGATION_POINTS,
      discoveredFacts: [],
      investigationHistory: [],
      discoveredBlackSwans: [],
    }),

  techniquesUsed: [],
  addTechniqueUsed: (technique) =>
    set((s) => ({
      techniquesUsed: s.techniquesUsed.includes(technique) ? s.techniquesUsed : [...s.techniquesUsed, technique],
    })),

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
        // BUG FIX: Add bounds clamping to value fields to prevent negative/unbounded values
        valueClaimed: Math.max(0, s.negotiation.valueClaimed + (effects.valueClaimed ?? 0)),
        valueCreated: Math.max(0, s.negotiation.valueCreated + (effects.valueCreated ?? 0)),
        relationshipImpact: Math.max(-100, Math.min(100, s.negotiation.relationshipImpact + (effects.relationshipImpact ?? 0))),
        ethicalImpact: Math.max(-100, Math.min(100, s.negotiation.ethicalImpact + (effects.ethicalImpact ?? 0))),
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
    set((s) => {
      // ── Double-Click Race Condition Guard ──────────────────────────────
      // If the player double-clicks a choice, the same choiceId will match
      // the last element of choicesMade. Abort duplicate triggers immediately.
      const lastChoice = s.negotiation.choicesMade[s.negotiation.choicesMade.length - 1];
      if (choiceId === lastChoice) return s;

      // Find the next node ID from the choice by looking at the scenario
      let nextNodeId: string | undefined;
      let choiceRequiresInfo = false;
      const scenarioId = s.currentScenarioId;
      if (scenarioId) {
        const scenario = getScenarioById(scenarioId);
        if (scenario) {
          for (const node of scenario.dialogueTree) {
            if (node.choices) {
              const choice = node.choices.find(c => c.id === choiceId);
              if (choice) {
                nextNodeId = choice.nextNodeId;
                // ── Information Asymmetry Check ─────────────────────────
                // If this choice has a requirement of type 'info_discovered',
                // check whether the player has formally investigated that fact.
                if (choice.requirement?.type === 'info_discovered') {
                  const requiredFactId = choice.requirement.factId;
                  if (!s.discoveredFacts.includes(requiredFactId)) {
                    choiceRequiresInfo = true;
                  }
                }
                break;
              }
            }
          }
        }
      }

      // ── Information Asymmetry Penalty ──────────────────────────────────
      // If the choice requires pre-discovered intelligence that the player
      // hasn't formally investigated, scale down valueClaimed/valueCreated
      // effects by 50%. Acting on information your character hasn't
      // investigated should be significantly less effective.
      const asymmetryMultiplier = choiceRequiresInfo ? 0.5 : 1.0;
      const scaledValueClaimed = (effects.valueClaimed ?? 0) * asymmetryMultiplier;
      const scaledValueCreated = (effects.valueCreated ?? 0) * asymmetryMultiplier;

      return {
        negotiation: {
          ...s.negotiation,
          choicesMade: [...s.negotiation.choicesMade, choiceId],
          currentDialogueNodeId: nextNodeId || s.negotiation.currentDialogueNodeId,
          trust: Math.min(100, Math.max(0, s.negotiation.trust + (effects.trust ?? 0))),
          anger: Math.min(100, Math.max(0, s.negotiation.anger + (effects.anger ?? 0))),
          patience: Math.min(100, Math.max(0, s.negotiation.patience + (effects.patience ?? 0))),
          valueClaimed: Math.max(0, s.negotiation.valueClaimed + scaledValueClaimed),
          valueCreated: Math.max(0, s.negotiation.valueCreated + scaledValueCreated),
          relationshipImpact: Math.max(-100, Math.min(100, s.negotiation.relationshipImpact + (effects.relationshipImpact ?? 0))),
          ethicalImpact: Math.max(-100, Math.min(100, s.negotiation.ethicalImpact + (effects.ethicalImpact ?? 0))),
          clientSatisfaction: Math.min(100, Math.max(0, s.negotiation.clientSatisfaction + (effects.clientSatisfaction ?? 0))),
          counterpartySatisfaction: Math.min(100, Math.max(0, s.negotiation.counterpartySatisfaction + (effects.counterpartySatisfaction ?? 0))),
          informationRevealed: infoRevealed
            ? [...new Set([...s.negotiation.informationRevealed, ...infoRevealed])]
            : s.negotiation.informationRevealed,
          concessionsGiven: effects.concessionMade
            ? [...s.negotiation.concessionsGiven, effects.concessionMade]
            : s.negotiation.concessionsGiven,
        },
      };
    }),
  resetNegotiation: () =>
    set({
      negotiation: { ...defaultNegotiation },
    }),

  isReplay: false,
  setIsReplay: (isReplay) => set({ isReplay }),

  caseResults: [],
  addCaseResult: (result) =>
    set((s) => {
      // ── Challenge Mode Difficulty Multiplier ────────────────────────────
      // Cases completed under harder challenge modes earn a score multiplier.
      const challengeMode = get().challengeMode;
      let multiplier = 1;
      if (challengeMode === 'limited_choices' || challengeMode === 'ethics_lock') {
        multiplier = 2;
      } else if (challengeMode === 'speed') {
        multiplier = 1.5;
      }
      const adjustedCaseScore = Math.round(result.finalScore * multiplier);

      // Store the adjusted score in the case result for accurate history tracking
      const adjustedResult = { ...result, finalScore: adjustedCaseScore };
      const newResults = [...s.caseResults, adjustedResult];
      const newCasesCompleted = newResults.length;

      // Calculate streak bonus (based on adjusted score so streaks scale too)
      const streakMultiplier = s.currentStreak >= STREAK_BONUS_MIN ? Math.min(STREAK_MULTIPLIER_CAP, 1 + (s.currentStreak - 2) * STREAK_BONUS_PER_LEVEL) : 1;
      const streakBonus = streakMultiplier > 1 ? Math.round(adjustedCaseScore * (streakMultiplier - 1)) : 0;
      const newTotalScore = s.totalScore + adjustedCaseScore + streakBonus;
      const prevTier = s.careerTier;
      const newTier = getTierFromCases(newCasesCompleted);

      // Check for tier up
      const newNotifications = [...s.notifications];
      if (newTier > prevTier) {
        newNotifications.unshift({
          id: `notif-tier-${Date.now()}`,
          type: 'tier_up',
          title: '⬆️ Career Tier Up!',
          message: `You've been promoted to ${TIER_NAMES[newTier]}!`,
          icon: '📈',
          timestamp: Date.now(),
          read: false,
        });
      }

      // Streak logic
      let newCurrentStreak = s.currentStreak;
      let newBestStreak = s.bestStreak;
      let newStreakType = s.streakType;
      const newStreakHistory = [...s.streakHistory];
      const streakStartedAt = s.currentStreak === 0 ? Date.now() : (s.streakHistory.length > 0 ? s.streakHistory[s.streakHistory.length - 1].startedAt : Date.now());

      if (result.outcome === 'master' || result.outcome === 'cooperative') {
        newCurrentStreak = s.currentStreak + 1;
        newStreakType = result.outcome === 'master' ? 'master' : 'win';
        if (newCurrentStreak > newBestStreak) {
          newBestStreak = newCurrentStreak;
        }
      } else if (result.outcome === 'hard_bargain' || result.outcome === 'bad_deal') {
        // End streak
        if (s.currentStreak > 0) {
          newStreakHistory.push({
            type: s.streakType,
            startedAt: streakStartedAt,
            length: s.currentStreak,
            endedAt: Date.now(),
          });
        }
        newCurrentStreak = 0;
        newStreakType = 'none';
      }

      // Streak milestone notifications
      if (newCurrentStreak >= STREAK_BONUS_MIN && STREAK_MILESTONES[newCurrentStreak]) {
        const milestone = STREAK_MILESTONES[newCurrentStreak];
        const streakEmoji = newStreakType === 'master' ? '👑' : '🔥';
        newNotifications.unshift({
          id: `notif-streak-${Date.now()}`,
          type: 'streak',
          title: `${streakEmoji} ${newStreakType === 'master' ? 'Master' : 'Win'} Streak x${newCurrentStreak}!`,
          message: `${milestone.emoji} ${milestone.name}!`,
          icon: streakEmoji,
          timestamp: Date.now(),
          read: false,
        });
      }

      // Streak bonus notification
      if (streakBonus > 0 && newCurrentStreak >= STREAK_BONUS_MIN) {
        newNotifications.unshift({
          id: `notif-streak-bonus-${Date.now()}`,
          type: 'streak',
          title: '⚡ Streak Bonus!',
          message: `+${streakBonus} bonus points from your ${newCurrentStreak}x streak!`,
          icon: '⚡',
          timestamp: Date.now(),
          read: false,
        });
      }

      // Check for first case achievement
      const newAchievements = [...s.achievements];
      if (newCasesCompleted === ACHIEVEMENT_THRESHOLDS.CASES_FIRST && !newAchievements.find(a => a.id === 'first_case')) {
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
      if (newCasesCompleted === ACHIEVEMENT_THRESHOLDS.CASES_RISING_STAR && !newAchievements.find(a => a.id === 'five_cases')) {
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
      if (newCasesCompleted >= ACHIEVEMENT_THRESHOLDS.CASES_DEAL_MAKER && !newAchievements.find(a => a.id === 'ten_cases')) {
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
      if (newCasesCompleted >= ACHIEVEMENT_THRESHOLDS.CASES_VETERAN && !newAchievements.find(a => a.id === 'twenty_cases')) {
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

      // Perfect score achievement (use adjusted score so challenge modes count)
      if (adjustedCaseScore >= ACHIEVEMENT_THRESHOLDS.PERFECT_SCORE && !newAchievements.find(a => a.id === 'perfect_score')) {
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
      if (s.reputation.shark >= ACHIEVEMENT_THRESHOLDS.REPUTATION_MILESTONE && !newAchievements.find(a => a.id === 'shark_rep')) {
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
      if (s.reputation.diplomat >= ACHIEVEMENT_THRESHOLDS.REPUTATION_MILESTONE && !newAchievements.find(a => a.id === 'diplomat_rep')) {
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
      if (s.reputation.detective >= ACHIEVEMENT_THRESHOLDS.REPUTATION_MILESTONE && !newAchievements.find(a => a.id === 'detective_rep')) {
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
      if (cooperativeCount >= ACHIEVEMENT_THRESHOLDS.COOPERATIVE_COUNT && !newAchievements.find(a => a.id === 'five_cooperative')) {
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
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        streakType: newStreakType,
        streakHistory: newStreakHistory,
        // ── Sync Transaction: Reset transient pre-negotiation configs ────
        // Prevents future fresh cases from bleeding over historical baseline
        // estimations from the previous case's Strategy Board.
        // NOTE: Do NOT reset currentScenarioId, negotiation, or other session
        // state here — the Postmortem component needs them to render results.
        // Cleanup happens in clearCaseSession() when the player leaves postmortem.
        batnaEstimate: 0,
        reservationEstimate: 0,
        assumptions: [],
      };
    }),

  clearCaseSession: () =>
    set({
      currentScenarioId: null,
      negotiation: { ...defaultNegotiation },
      caseAccepted: false,
      isReplay: false,
      discoveredFacts: [],
      investigationHistory: [],
      discoveredBlackSwans: [],
      techniquesUsed: [],
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
      const newTier = getTierFromCases(newCasesCompleted);

      // Check for tier up
      const newNotifications = [...s.notifications];
      if (newTier > prevTier) {
        newNotifications.unshift({
          id: `notif-tier-${Date.now()}`,
          type: 'tier_up',
          title: '⬆️ Career Tier Up!',
          message: `You've been promoted to ${TIER_NAMES[newTier]}!`,
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
      if (result.finalScore >= ACHIEVEMENT_THRESHOLDS.PERFECT_SCORE && !newAchievements.find(a => a.id === 'perfect_score')) {
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
      if (cooperativeCount >= ACHIEVEMENT_THRESHOLDS.COOPERATIVE_COUNT && !newAchievements.find(a => a.id === 'five_cooperative')) {
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
      if (s.reputation.shark >= ACHIEVEMENT_THRESHOLDS.REPUTATION_MILESTONE && !newAchievements.find(a => a.id === 'shark_rep')) {
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
      if (s.reputation.diplomat >= ACHIEVEMENT_THRESHOLDS.REPUTATION_MILESTONE && !newAchievements.find(a => a.id === 'diplomat_rep')) {
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
      if (s.reputation.detective >= ACHIEVEMENT_THRESHOLDS.REPUTATION_MILESTONE && !newAchievements.find(a => a.id === 'detective_rep')) {
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
        // EXPLOIT FIX: Replays must never increment streaks — copy existing state
        currentStreak: s.currentStreak,
        bestStreak: s.bestStreak,
        streakType: result.outcome === 'master' ? 'master' : result.outcome === 'cooperative' ? 'win' : 'none',
        // NOTE: Do NOT reset session state here — Postmortem still needs it.
        // clearCaseSession() handles cleanup when player leaves postmortem.
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

  challengeMode: 'none',
  setChallengeMode: (mode) => set({ challengeMode: mode }),
  challengeTimer: 0,
  setChallengeTimer: (seconds) => set({ challengeTimer: seconds }),

  negotiationStartTime: null,
  setNegotiationStartTime: (time) => set({ negotiationStartTime: time }),

  discoveredBlackSwans: [],
  discoverBlackSwan: (id) =>
    set((s) => {
      if (s.discoveredBlackSwans.includes(id)) return s;
      return {
        discoveredBlackSwans: [...s.discoveredBlackSwans, id],
        notifications: [{
          id: `notif-bs-${Date.now()}`,
          type: 'info' as const,
          title: '🦢 Black Swan Discovered!',
          message: 'A hidden truth has been revealed that changes everything.',
          icon: '🦢',
          timestamp: Date.now(),
          read: false,
        }, ...s.notifications],
      };
    }),
});
