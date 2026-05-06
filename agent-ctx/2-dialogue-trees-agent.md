# Task 2 - Rich Dialogue Trees for Cases 11-15

## Summary
Created dedicated scenario files with rich dialogue trees for cases 11-15, replacing the generic `makeCompactScenario()` definitions in `index.ts`.

## Files Created
- `/home/z/my-project/src/data/scenarios/case-11.ts` - The Product Launch Clause (deadline, tier 3)
- `/home/z/my-project/src/data/scenarios/case-12.ts` - The Missing Shipment (deception, tier 3)
- `/home/z/my-project/src/data/scenarios/case-13.ts` - The Inflated Valuation (deception, tier 3)
- `/home/z/my-project/src/data/scenarios/case-14.ts` - The Vendor With Two Stories (deception, tier 3)
- `/home/z/my-project/src/data/scenarios/case-15.ts` - Startup vs. Platform Giant (power_imbalance, tier 4)

## Files Modified
- `/home/z/my-project/src/data/scenarios/index.ts` - Added imports for case-11 through case-15, removed makeCompactScenario definitions for those cases, updated comment

## Per-Case Details

### Case 11 - The Product Launch Clause
- **15 dialogue nodes** with 4 endings (master, cooperative, hard_bargain, bad_deal)
- Counterparty: Diane Kohl, VP Merchandising at RetailMax
- Hidden truth: Retailer fears empty shelves, not product being late
- Master path: Tiered delay clause + shelf commitment + shared marketing + preferred supplier
- Bias trap: Anchoring on binary cancellation clause (anchor_shock)
- Investigation actions: shelf space research, competitor check, past delay history, informal buyer chat

### Case 12 - The Missing Shipment
- **15 dialogue nodes** with 4 endings
- Counterparty: Kenji Tanaka, VP Operations PacificTraders
- Hidden truth: No port strike - supplier missed production deadlines
- Master path: Contingent contract that reveals truth, then comprehensive deal
- Bias trap: Trusting force majeure claim (vividness), escalation trap
- Investigation actions: port records, shipping company contact, production logs, industry contacts

### Case 13 - The Inflated Valuation
- **17 dialogue nodes** with 4 endings
- Counterparty: Sofia Chen, CEO CloudSync
- Hidden truth: Customer has no budget approval, "basically signed" is misleading
- Master path: Lower upfront + earnout + escrow + performance bonus (up to €35M)
- Bias trap: Winner's curse from accepting inflated claims (overconfidence), vividness bias
- Investigation actions: customer contact, LOI review, procurement history, investor doubts

### Case 14 - The Vendor With Two Stories
- **16 dialogue nodes** with 4 endings
- Counterparty: Marcus Webb, VP Sales TechFlow Systems
- Hidden truth: Demo was a prototype, not a production product
- Master path: Milestone-based contract + independent testing + termination rights + delivery bonus
- Bias trap: Reputation heuristic (trusting famous clients as proof), fixed-pie bias
- Investigation actions: lead engineer contact, client reference check, forensic demo analysis, industry reputation

### Case 15 - Startup vs. Platform Giant
- **15 dialogue nodes** with 4 endings
- Counterparty: Helen Park, VP Platform Partnerships OmniCorp
- Hidden truth: OmniCorp needs VerityMesh for regulatory optics
- Master path: Public partnership + fair data limits + independence protections + limited exclusivity + co-development
- Bias trap: Assuming power imbalance means no leverage (egocentrism), fixed-pie bias on data rights
- Investigation actions: regulatory research, other startup contacts, alternative channels, in-house capability assessment

## Quality Checks
- `bun run lint` passes with no errors
- `npx tsc --noEmit` shows no new errors from the created files
- All TypeScript types match exactly with `./types.ts`
- All files use `import type { Scenario } from './types'`
- All exports are named: `export const case11: Scenario = { ... }` etc.
- All dialogue nodes have proper structure matching DialogueNode/DialogueChoice interfaces
