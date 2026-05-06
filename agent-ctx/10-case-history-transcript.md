# Task 10: Case History & Negotiation Transcript

## Task Summary
Added two major features to Dealcraft:

1. **Case History / Timeline Page** (`src/components/game/CaseHistory.tsx`)
   - Visual vertical timeline with connected dots/nodes
   - Score trend chart using recharts AreaChart
   - Statistics summary (total cases, avg score, best score, win streak, current form)
   - Filter by outcome type and sort by date/score/title
   - Accessible from Dashboard "History" button

2. **Negotiation Transcript Review** (`src/components/game/NegotiationTranscript.tsx`)
   - Full dialogue viewer with speaker labels, avatars, and text
   - Branch indicators showing "road not taken" choices
   - Timeline scrubber for navigation
   - Accessible from Postmortem, Dashboard completed cases, and Case History

## Key Files Modified
- `src/data/scenarios/types.ts`: Added TranscriptEntry interface, transcript field to CaseResult, 'case_history' to GamePhase
- `src/app/page.tsx`: Added CaseHistory import and 'case_history' phase rendering
- `src/components/game/NegotiationTable.tsx`: Added transcript building in handleViewResults
- `src/components/game/Dashboard.tsx`: Added History button, transcript dialog on completed cases
- `src/components/game/Postmortem.tsx`: Added "Review Transcript" button and dialog
- `src/components/game/StreakIndicator.tsx`: Fixed lint error (setState in effect)

## Key Files Created
- `src/components/game/CaseHistory.tsx`: Full case history page with timeline, chart, stats, filters
- `src/components/game/NegotiationTranscript.tsx`: Transcript viewer with branch indicators and scrubber

## Lint Status
All lint checks pass cleanly with zero errors.
