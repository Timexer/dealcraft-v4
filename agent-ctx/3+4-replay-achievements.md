# Task 3+4: Case Replay + Achievement Gallery

## Summary
Implemented two features for the Dealcraft Negotiation Career Simulator:

### Part A: Case Replay Feature
- **game-store.ts**: Added `isReplay` boolean state and `setIsReplay` setter. Added `replayCaseResult` method that replaces the existing result for a scenarioId with a new result, keeping the better score. Adjusts totalScore by the difference only when the new score is better. Re-checks all achievements during replay. Resets `isReplay` in `startNewGame` and `resetGame`.
- **Dashboard.tsx**: Added "↻ Replay" button on each completed case card. The replay handler sets `isReplay(true)`, resets investigation/negotiation state, and navigates to intake. Added score grade badge (S/A/B/C/D/F) next to the score on completed case cards. Added `handleReplayCase` function.
- **NegotiationTable.tsx**: Updated `handleViewResults` to use `replayCaseResult` instead of `addCaseResult` when `isReplay` is true.
- **Postmortem.tsx**: Fixed to find the result for the current scenarioId instead of just using the last result (important for replays where the result is replaced at its existing index).

### Part B: Achievement Gallery
- **AchievementGallery.tsx**: New component with a grid layout showing ALL 13 possible achievements (locked and unlocked). Unlocked achievements show icon, title, description, and unlock date with a subtle glow and float animation. Locked achievements show a lock icon, title, and a hint instead of description. Uses glass-card styling for unlocked cards. Includes progress bar and count at top. Responsive grid: 2 cols mobile, 3 tablet, 4 desktop. Uses framer-motion stagger animations.
- **Dashboard.tsx**: Added "Achievements" button next to "Career Stats" in the header. Opens an Achievement Gallery dialog using shadcn Dialog component.
- **globals.css**: Added `animate-subtle-float` keyframe/animation and `custom-scrollbar` styles.

### All 13 Achievements Defined:
1. first_case - First Case Closed
2. first_master - Master Negotiator  
3. five_cases - Rising Star
4. ten_cases - Deal Maker
5. twenty_cases - Veteran Negotiator
6. all_fundamentals - Fundamentals Master
7. perfect_score - Perfect Deal
8. shark_rep - The Shark
9. diplomat_rep - The Peacemaker
10. detective_rep - Truth Seeker
11. five_cooperative - Cooperative Champion
12. no_deal_strategist - Strategic Walker
13. comeback_kid - Comeback Kid

## Files Modified
- `/home/z/my-project/src/store/game-store.ts`
- `/home/z/my-project/src/components/game/Dashboard.tsx`
- `/home/z/my-project/src/components/game/NegotiationTable.tsx`
- `/home/z/my-project/src/components/game/Postmortem.tsx`
- `/home/z/my-project/src/app/globals.css`

## Files Created
- `/home/z/my-project/src/components/game/AchievementGallery.tsx`

## Lint Status
All modified files pass ESLint. Pre-existing lint errors in NegotiationTable.tsx (unrelated to this task) remain.
