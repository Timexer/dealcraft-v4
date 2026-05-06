import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GamePhase, NegotiationState, PlayerStats, ReputationScores, CaseResult } from '@/data/scenarios/types';

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

  // New game
  startNewGame: (name: string) => void;
  resetGame: () => void;

  // Available cases (unlocked based on tier)
  unlockedCases: string[];
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

      caseResults: [],
      addCaseResult: (result) =>
        set((s) => {
          const newResults = [...s.caseResults, result];
          const newCasesCompleted = newResults.length;
          const newTotalScore = s.totalScore + result.finalScore;
          const newTier = newCasesCompleted < 3 ? 1 : newCasesCompleted < 8 ? 2 : newCasesCompleted < 15 ? 3 : newCasesCompleted < 22 ? 4 : 5;
          return {
            caseResults: newResults,
            casesCompleted: newCasesCompleted,
            totalScore: newTotalScore,
            careerTier: newTier,
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
      }),
    }
  )
);
