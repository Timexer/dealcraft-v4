# Task 4: Split Zustand game-store.ts into three separate slices

## Summary
Split the monolithic ~990-line `src/store/game-store.ts` into three separate slice files using the Zustand slice pattern (`StateCreator`), while keeping the same `useGameStore` export and maintaining full backward compatibility with all 30+ consumer components.

## Files Created
1. **`src/store/types.ts`** — Shared types + GameState union type
   - `Achievement`, `GameNotification`, `StreakHistoryEntry`, `ColorTheme` interfaces/types
   - `GameState = PlayerSlice & NegotiationSlice & MetaSlice` union type
   - Re-exports slice types for convenience

2. **`src/store/slices/player-slice.ts`** — PlayerSlice
   - State: playerName, careerTier, casesCompleted, totalScore, stats, reputation, currentStreak, bestStreak, streakType, streakHistory, colorTheme
   - Actions: setPlayerName, addStats, addReputation, getStreakMultiplier, setColorTheme
   - Uses `StateCreator<GameState, [], [], PlayerSlice>` pattern

3. **`src/store/slices/negotiation-slice.ts`** — NegotiationSlice
   - State: currentScenarioId, investigationPoints, maxInvestigationPoints, discoveredFacts, investigationHistory, techniquesUsed, negotiation, caseResults, isReplay, caseAccepted, batnaEstimate, reservationEstimate, openingStrategy, assumptions, challengeMode, challengeTimer, negotiationStartTime, discoveredBlackSwans
   - Actions: setCurrentScenarioId, spendInvestigationPoint, resetInvestigation, addTechniqueUsed, updateNegotiation, applyEffects, makeChoice, resetNegotiation, addCaseResult, replayCaseResult, setIsReplay, setCaseAccepted, setBatnaEstimate, setReservationEstimate, setOpeningStrategy, addAssumption, removeAssumption, setChallengeMode, setChallengeTimer, setNegotiationStartTime, discoverBlackSwan
   - Cross-cutting: `addCaseResult` and `replayCaseResult` update player state (tier, score, casesCompleted, streak) and meta state (achievements, notifications) using `set()` to update all slice state at once
   - Cross-cutting: `discoverBlackSwan` updates notifications (meta state)

4. **`src/store/slices/meta-slice.ts`** — MetaSlice
   - State: phase, tutorialCompleted, unlockedCases, achievements, notifications
   - Actions: setPhase, setTutorialCompleted, unlockAchievement, addNotification, markNotificationRead, unreadNotificationCount, startNewGame, resetGame
   - Cross-cutting: `startNewGame` and `resetGame` reset ALL state across all slices using `set()`
   - Cross-cutting: `unlockAchievement` updates notifications (meta state)

5. **`src/store/game-store.ts`** — Updated to slim orchestrator
   - Composes three slices: `...createPlayerSlice(...a)`, `...createNegotiationSlice(...a)`, `...createMetaSlice(...a)`
   - Same `persist` config with identical `partialize` function
   - Re-exports types: `Achievement`, `GameNotification`, `StreakHistoryEntry`, `ColorTheme`, `GameState`

## Backward Compatibility
- All 30+ consumer components importing from `@/store/game-store` work without any changes
- `useGameStore` export remains at the same path
- Type imports (`Achievement`, `ColorTheme`, `GameNotification`, `StreakHistoryEntry`) still importable from `@/store/game-store`
- Same partialize config preserves identical persistence behavior
- All constants imports preserved from `@/lib/constants`

## Verification
- `bun run lint` passes cleanly with zero errors
- Dev server compiles successfully (200 responses)
