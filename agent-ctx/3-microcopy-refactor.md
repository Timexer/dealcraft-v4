# Task 3: StrategyBoard.tsx Microcopy Refactor

## Summary
Comprehensive microcopy overhaul of `/home/z/my-project/src/components/game/StrategyBoard.tsx`, replacing hardcoded labels with centralized constants from `types.ts`, adding aspiration estimate field, tooltip wrapping, and cross-field validation.

## Changes Made

### 1. Imports
- Added `SECTION_LABELS, SECTION_DEFINITIONS, SECTION_HELPERS, SECTION_TOOLTIPS, INLINE_WARNINGS, ZOPA_LEGEND` from `@/data/scenarios/types`
- Added `aspirationEstimate, setAspirationEstimate` to useGameStore destructuring

### 2. Section Labels (Card Headers)
- "BATNA Analysis" → `SECTION_LABELS.batna` ("Best Alternative if No Deal")
- Card description updated to `SECTION_DEFINITIONS.batna`
- "ZOPA Visualization" → `SECTION_LABELS.zopa` ("Possible Deal Zone")
- Added `SECTION_HELPERS.zopa` helper text below ZOPA section header

### 3. BATNA Card Labels
- "Client's BATNA" → "Client's Alternative"
- "Counterparty's BATNA" → "Counterparty's Alternative"
- "BATNA Power Comparison" → "Alternative Power Comparison"
- Added `SECTION_HELPERS.batnaCard` helper text below card header
- Added `SECTION_HELPERS.batnaStrength` helper text near strength badges
- "Estimated monetary value: €X" → "Financial equivalent: €X"
- "BATNA Assessment" (sidebar) → "Alternative Assessment"

### 4. Field Labels
- "BATNA Monetary Equivalent (€)" — kept, added tooltip with `SECTION_TOOLTIPS.batna`, replaced helper text with `SECTION_HELPERS.batnaMonetary`
- "Your Reservation Value (€)" → "Walk-Away Point (€)" using `SECTION_LABELS.reservationValue`, added tooltip with `SECTION_TOOLTIPS.reservationValue`, replaced helper text with `SECTION_HELPERS.reservationValue`
- **NEW FIELD**: "Target Outcome (€)" using `SECTION_LABELS.aspirationPrice`, with tooltip `SECTION_TOOLTIPS.aspirationPrice`, helper text `SECTION_HELPERS.aspirationPrice`, connected to `aspirationEstimate`/`setAspirationEstimate` from store

### 5. Cross-field Validation
- RV < BATNA estimate warning now uses `INLINE_WARNINGS.rvBelowBatnaEquiv`
- Added new validation: aspirationEstimate > 0 and reservationEstimate > 0 and aspirationEstimate < reservationEstimate → shows warning "Your target outcome is below your walk-away point..."
- Negative value blocking: `Math.max(0, value)` applied on onChange for all three inputs

### 6. ZOPA Visualization Labels
- "Client RV" → `ZOPA_LEGEND.clientRV` ("Your walk-away point")
- "CP RV" → `ZOPA_LEGEND.counterpartyRV` ("Their estimated walk-away point")
- "BATNA €" → `ZOPA_LEGEND.batnaEquiv` ("BATNA monetary estimate")
- "ZOPA" text → `SECTION_LABELS.zopa` ("Possible Deal Zone")
- "Your RV" → `ZOPA_LEGEND.yourRV` ("Your walk-away estimate")

### 7. ZOPA Legend
- "Client Reservation Value" → `ZOPA_LEGEND.clientRV`
- "Counterparty Reservation Value" → `ZOPA_LEGEND.counterpartyRV`
- "ZOPA Zone" → `ZOPA_LEGEND.zopaZone`
- "Your RV" → `ZOPA_LEGEND.yourRV`
- "BATNA € Est." → `ZOPA_LEGEND.batnaEquiv`
- Added: aspiration marker legend entry with green diamond + `ZOPA_LEGEND.yourAspiration`

### 8. Aspiration Marker on ZOPA Bar
- Added green diamond marker when `aspirationEstimate > 0` and `maxVal > 0`
- Computed `aspirationPos` similarly to `rvPos`
- Shows "Target" label below the diamond

### 9. Input Layout
- Changed from 2-column grid (`sm:grid-cols-2`) to 3-column grid (`sm:grid-cols-3`)
- Three columns: BATNA Monetary Equivalent, Walk-Away Point, Target Outcome

### 10. No-ZOPA Warning
- Added `INLINE_WARNINGS.noZopa` warning below ZOPA bar when `zopaWidth <= 0`

### 11. Tooltip Wrapping for Section Headers
- Wrapped "Best Alternative if No Deal" header with TooltipProvider/Tooltip showing `SECTION_TOOLTIPS.batna`
- Wrapped "Possible Deal Zone" header with TooltipProvider/Tooltip showing `SECTION_TOOLTIPS.zopa`
- All field labels wrapped with tooltips showing corresponding SECTION_TOOLTIPS content

### 12. Tips Updates
- ADVISOR_TIPS fundamentals: "Start with your BATNA — know your best alternative if talks fail, then set your reservation value." → "Start with your best alternative — know your alternative if talks fail, then set your walk-away point."
- BATNA_TIPS: "Your BATNA seems low" → "Your alternative seems weak", "A moderate BATNA" → "A moderate alternative", "A strong BATNA" → "A strong alternative"
- CATEGORY_TIPS fundamentals: "Always quantify your BATNA" → "Always identify your best alternative"
- CATEGORY_TIPS ugly: "Always have your BATNA ready" → "Always have your alternative ready"
- CATEGORY_TIPS master: "Combine every technique — BATNA, logrolling..." → "Combine every technique — alternatives, logrolling..."
- CATEGORY_TIPS power_imbalance: Kept 'BATNA' as term (action-based context)

### What Was NOT Changed
- All underlying data field names (clientBATNA, clientBATNAValue, etc.) — kept as-is
- No case data files modified
- No game-engine.ts scoring logic modified
- All existing functionality preserved (strength badges, deriveBATNAStrength, getBATNAAdvantage, etc.)
- Existing layout structure and styling preserved

## Verification
- `bun run lint` passes cleanly with zero errors
- Dev server compiles successfully
