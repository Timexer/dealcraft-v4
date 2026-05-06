# Task ID: FEATURE-1
# Agent: Main Developer
# Task: Add Negotiation Health Meter, Choice Impact Preview, Negotiation Timer, Ending Prediction Meter

## Work Log:

### Files Modified:
1. **`src/data/scenarios/types.ts`**
   - Added `elapsedTime?: number` field to `CaseResult` interface for tracking negotiation duration

2. **`src/store/game-store.ts`**
   - Added `negotiationStartTime: number | null` and `setNegotiationStartTime` to `GameState` interface
   - Added state initialization: `negotiationStartTime: null`
   - Added setter: `setNegotiationStartTime: (time) => set({ negotiationStartTime: time })`
   - Added to `startNewGame` and `resetGame` resets: `negotiationStartTime: null`
   - Added to `partialize` function for persistence: `negotiationStartTime: state.negotiationStartTime`

3. **`src/components/game/NegotiationTable.tsx`** (major changes)
   - **Imports**: Added `Clock`, `Compass`, `Activity` from lucide-react
   - **Store**: Added `negotiationStartTime, setNegotiationStartTime` from useGameStore
   - **Negotiation Timer (Feature 3)**:
     - Added `elapsedSeconds` state and `timerStartedRef` ref
     - Added useEffect to set `negotiationStartTime` on mount if not already set
     - Added useEffect to tick timer every second, calculating elapsed time from `negotiationStartTime`
     - Added `formatTime()` helper for MM:SS display
     - Timer displayed in top bar with Clock icon
     - Elapsed time saved in `caseResult.elapsedTime` in `handleViewResults`
   - **Negotiation Health Meter (Feature 1)**:
     - Added `negotiationHealth` useMemo: `(trust * 0.4) + ((100 - anger) * 0.35) + (patience * 0.25)`
     - Added `healthStatus` derived from health score: Thriving (>=70, green), Cautious (>=40, amber), Dangerous (<40, red)
     - Desktop sidebar: Full health meter with animated progress bar, threshold markers at 40% and 70%, and labels (Dangerous/Cautious/Thriving)
     - Mobile top bar: Compact health meter with Activity icon, progress bar, score, and status label
   - **Ending Prediction Meter (Feature 4)**:
     - Added `predictedEnding` useMemo using `getEndingFromNegotiation()` - returns null if no choices made yet
     - Added `endingPredictionInfo` useMemo mapping ending types to icons/labels/colors
     - Desktop sidebar: "Outcome Forecast" section with Compass icon, subtle styling with ending-type-colored background
     - Shows "?" with "Make a choice to see forecast..." when no choices made
     - Shows predicted ending icon and label after first choice
   - **Choice Impact Preview (Feature 2)**:
     - Enhanced Tooltip for each choice button to show impact directions for enabled choices
     - Trust: ↑ (green) or ↓ (red) 
     - Anger: ↑ (red) or ↓ (green)
     - Value: ↑ (amber) if valueClaimed or valueCreated > 0
     - Ethics: ↓ (red) if ethicalImpact < 0
     - Disabled choices show the existing disabled reason
     - Choices with no effects show "No significant impact"

4. **`src/components/game/Postmortem.tsx`**
   - Added `Clock` import from lucide-react
   - Added `elapsedTime` and `formatElapsedTime()` helper
   - Added "Negotiation Duration" card after Key Takeaway, showing formatted time with Clock icon and cyan color scheme
   - Only shown when elapsedTime is available and > 0

### All lint checks pass cleanly with zero errors.

## Stage Summary:
- Negotiation Health Meter: Visual 0-100 gauge combining trust (40%), inverse anger (35%), patience (25%) with color-coded display (green/amber/red) and labels (Thriving/Cautious/Dangerous)
- Choice Impact Preview: Tooltips on hover showing directional impact arrows for Trust, Anger, Value, and Ethics
- Negotiation Timer: MM:SS elapsed time display in top bar, persisted via store, saved in CaseResult, shown in Postmortem
- Ending Prediction Meter: "Outcome Forecast" in sidebar showing predicted ending type with icon, or "?" when too early to predict
- All four features fully integrated with existing UI patterns and styling
