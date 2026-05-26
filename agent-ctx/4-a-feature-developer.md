# Task 4-a: Add "Negotiation Power Analysis" section to Postmortem

## Agent: Feature Developer

## Summary
Added a new "Negotiation Power Analysis" section to the Postmortem component at `/home/z/my-project/src/components/game/Postmortem.tsx`.

## Changes Made

### File: `/home/z/my-project/src/components/game/Postmortem.tsx`

1. **New imports added:**
   - `SECTION_LABELS`, `SECTION_DEFINITIONS`, `BATNAStrength` from `@/data/scenarios/types`
   - `Scale`, `ArrowLeftRight`, `Crosshair`, `ShieldCheck` icons from `lucide-react`
   - `reservationEstimate` added to `useGameStore` destructuring

2. **New helper function: `resolveBATNAStrength`**
   - Resolves BATNA strength with fallback derivation (when `clientBATNAStrength`/`counterpartyBATNAStrength` is undefined)
   - Uses ratio-based logic: strong (>=1.3), moderate (>=0.7), weak (<0.7)

3. **New constant: `BATNA_STRENGTH_STYLES`**
   - Maps strength values to badge styling and label text

4. **New section: "Negotiation Power Analysis"**
   - Positioned between Key Takeaway card and Negotiation Duration section
   - Contains 4 sub-sections:
     - **Alternative Comparison**: Side-by-side client vs counterparty BATNA with strength badges and financial equivalents, using `SECTION_LABELS.batna`
     - **Walk-Away Point Analysis**: Client/counterparty reservation values, player's estimate with accuracy indicator, using `SECTION_LABELS.reservationValue`
     - **ZOPA Analysis**: Estimated vs true ZOPA ranges with visual bars and existence check, using `SECTION_LABELS.zopa`
     - **BATNA Accuracy Assessment**: Grade system (S/A/B/C/F) comparing estimate to actual value with visual comparison bars

## Design Decisions
- Used amber/gold accent colors consistent with game's design language
- Used `motion.div` with standard animation pattern
- Used existing shadcn/ui components (Card, Badge, Separator)
- No modifications to any existing sections
- `resolveBATNAStrength` is a simplified duplicate of StrategyBoard's `deriveBATNAStrength` to avoid cross-component coupling

## Verification
- `bun run lint` passes cleanly with zero errors
- Page compiles and loads successfully
