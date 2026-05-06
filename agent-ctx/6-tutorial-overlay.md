# Task 6: Tutorial/Help Overlay System

## Summary
Created a complete interactive tutorial overlay system for first-time players of the Dealcraft Negotiation Career Simulator.

## Files Modified

### 1. `/home/z/my-project/src/store/game-store.ts`
- Added `tutorialCompleted: boolean` to `GameState` interface (defaults to `false`)
- Added `setTutorialCompleted: () => void` action
- Added `tutorialCompleted` to `partialize` function for Zustand persistence (survives page reloads)
- Implementation is clean and non-breaking — no existing functionality affected

### 2. `/home/z/my-project/src/components/game/TutorialOverlay.tsx` (NEW)
- **`TutorialOverlay` component**: The main overlay that shows contextual help based on current game phase
  - Uses React "adjusting state when props change" pattern (no setState in effects — lint compliant)
  - Tracks which phases have been shown using a module-level `Set` (session-based)
  - Shows tutorial on first entry to each phase (dashboard, intake, strategy, investigation, negotiation, postmortem)
  - Semi-transparent backdrop (`bg-black/50`) with subtle blur
  - Animated entrance/exit via framer-motion (spring animation, scale + fade)
  - Amber accent color matching game branding (`amber-500`)
  - shadcn/ui Card component for the popup
  - lucide-react icons per phase (LayoutDashboard, FileSearch, Brain, Search, MessageSquare, BarChart3)
  - "Got it!" / "Next" / "Skip" buttons to advance or dismiss
  - "Don't show tutorials" checkbox that persists via `setTutorialCompleted()`
  - Keyboard support (Escape to skip, Enter/Space to advance)
  - Click backdrop to dismiss
  - Progress dots for multi-step tutorials (extensible)
  - Listens for `dealcraft:show-tutorial` custom event for re-triggering

- **`TutorialHelpButton` component**: A small help icon button that re-triggers the tutorial for the current phase
  - Only renders when the current phase has tutorial content
  - Dispatches `dealcraft:show-tutorial` custom event
  - Amber-themed styling matching the game

### 3. `/home/z/my-project/src/app/page.tsx`
- Imported `TutorialOverlay` and `TutorialHelpButton`
- Added `TutorialHelpButton` next to `ThemeToggle` in the top-right corner
- Added `TutorialOverlay` at the bottom of the root layout (renders as fixed overlay)

## Tutorial Content Per Phase
| Phase | Title | Key Guidance |
|-------|-------|-------------|
| Dashboard | Welcome to your Office! | Browse cases, choose one, career progresses, check stats/reputation |
| Intake | Client Briefing | Review briefing, notice what's NOT said, missing info = investigate |
| Strategy | Plan Your Approach | Estimate BATNA, identify trades in Issue Priority Matrix, choose opening |
| Investigation | Gather Intelligence | Spend points wisely, more intel = better outcomes, unlock special dialogue |
| Negotiation | The Negotiation Table | Watch live metrics, trust/anger affect choices, investigative questions best |
| Postmortem | Review Your Performance | Radar chart, "What You Missed", "The Master Deal" best outcome |

## Design Decisions
- Session-based tracking: tutorials show once per browser session per phase (not per page reload)
- `tutorialCompleted` persists via Zustand — if user checks "Don't show tutorials", it's saved permanently
- Help button allows re-triggering tutorials even after dismissal
- No tutorial for `title` or `career` phases (not meaningful for onboarding)
- Lint-compliant: no setState in effects, no ref access during render
