# Task 12-a: Case Detail Sheet for Dashboard

## Summary
Added a Case Detail Drawer/Panel to the Dashboard component that shows a full score breakdown when a completed case is clicked.

## Changes Made
**File: `/home/z/my-project/src/components/game/Dashboard.tsx`**

### Imports Added
- `Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription` from `@/components/ui/sheet`
- `CaseResult, EndingScores` from `@/data/scenarios/types`

### State Added
- `detailCaseId: string | null` - tracks which case's details are shown in the sheet

### Constants Added
- `SCORE_DIMENSIONS` - array of 6 dimension labels matching EndingScores keys
- `getScoreBarColor(value)` - returns bg color class: emerald (80+), amber (50-79), red (0-49)
- `getScoreBarBg(value)` - returns bg color class for bar track background

### Derived State
- `detailCaseResult` - the CaseResult for the selected case
- `detailScenario` - the Scenario for the selected case
- `detailGrade` - the grade from getScoreGrade()

### UI Changes
1. Completed case cards now have `cursor-pointer` and `onClick` handler to open the detail sheet
2. Added `<Sheet>` component at bottom of JSX with:
   - Glass-card header with gradient border, avatar, title, subtitle, category/tier badges
   - Score card with animated score number, grade badge, outcome badge
   - 6-dimension score breakdown with color-coded thin progress bars
   - "View Transcript" and "Replay Case" action buttons
   - SheetDescription for accessibility (sr-only)

### No Breaking Changes
- Existing transcript/replay buttons on completed case cards still work (stopPropagation)
- All existing functionality preserved

## Lint Status
- All lint checks pass cleanly with zero errors
