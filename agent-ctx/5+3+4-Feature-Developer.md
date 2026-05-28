# Task 5+3+4 - Feature Developer

## Task: Implement LLM Advisor API, Challenge Mode, and Sound Effects

### Work Completed

All three features have been fully implemented:

1. **LLM-Powered AI Advisor**
   - Created `/api/game/advisor/route.ts` - POST endpoint using z-ai-web-dev-sdk
   - Updated `InGameAdvisor.tsx` with "Ask AI" button, caching, cooldown, error handling
   - Passed `scenarioTitle` and `recentDialogueText` from NegotiationTable

2. **Challenge Mode**
   - Updated `game-store.ts` with challengeMode, challengeTimer state
   - Created `ChallengeModeSelector.tsx` with 4 modes
   - Integrated in NegotiationTable (timer, disabled choices, ethics lock)
   - Integrated in Dashboard (dialog before starting case)

3. **Sound Effects System**
   - Created `use-sound.ts` hook with Web Audio API
   - 6 procedural sounds with localStorage persistence
   - Sound toggle in GameHeader
   - Sound triggers in Dashboard and NegotiationTable

### Files Modified
- `/src/app/api/game/advisor/route.ts` (new)
- `/src/components/game/InGameAdvisor.tsx` (updated)
- `/src/components/game/NegotiationTable.tsx` (rewritten)
- `/src/components/game/Dashboard.tsx` (updated)
- `/src/components/game/ChallengeModeSelector.tsx` (new)
- `/src/components/game/GameHeader.tsx` (updated)
- `/src/store/game-store.ts` (updated)
- `/src/hooks/use-sound.ts` (new)

### Lint Status
All lint checks pass cleanly with zero errors.
