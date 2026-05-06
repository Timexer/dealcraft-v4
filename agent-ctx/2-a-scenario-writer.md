# Task 2-a: Scenario Data Files Creation

## Summary
Created 4 TypeScript scenario data files for the Dealcraft negotiation simulation game, following the exact structure and format of case-01.ts.

## Files Created

### 1. `/home/z/my-project/src/data/scenarios/case-02.ts` - The Used Equipment Sale
- **Export**: `case02`
- **Tier**: 1, **Category**: fundamentals
- **Client**: Orion Labs (🧪) - small biotech lab selling used equipment
- **Counterparty**: Dr. Elena Vasquez (🏥) - regional clinic director
- **Hidden truth**: Clinic's machine broke down 3 weeks ago; urgency > price
- **Dialogue nodes**: 20 nodes with branching choices
- **Endings**: 4 (master, cooperative, hard_bargain, bad_deal)
- **Investigation actions**: 4 (market prices, former supplier, installation requirements, clinic research)
- **Bias traps**: fixed_pie (price-only thinking), anchor_shock (low €42K anchor)

### 2. `/home/z/my-project/src/data/scenarios/case-03.ts` - The First Salary Offer
- **Export**: `case03`
- **Tier**: 1, **Category**: fundamentals
- **Client**: Nadia (👩‍💻) - junior data analyst
- **Counterparty**: James Park (👔) - hiring manager
- **Hidden truth**: Rigid salary band but flexibility on bonus, remote, training, promotion review
- **Dialogue nodes**: 20 nodes with branching choices
- **Endings**: 4 (master, cooperative, hard_bargain, bad_deal)
- **Investigation actions**: 3 (market salaries, employee talks, company culture)
- **Bias traps**: vividness (salary number distracts from total package), fixed_pie (single-dimension negotiation)

### 3. `/home/z/my-project/src/data/scenarios/case-04.ts` - The Ingredient Lockout
- **Export**: `case04`
- **Tier**: 2, **Category**: hidden_interests
- **Client**: Luma Beverage Co. (🥤) - craft beverage company
- **Counterparty**: Theodor Hahn (🌿) - family-owned supplier
- **Hidden truth**: Supplier promised 3 local artisans (deathbed promise to father)
- **Dialogue nodes**: 22 nodes with branching choices
- **Endings**: 4 (master, cooperative, hard_bargain, bad_deal)
- **Investigation actions**: 3 (visit operation, research local market, check finances)
- **Bias traps**: fixed_pie (exclusivity as binary), escalation (frustration at repeated refusals)

### 4. `/home/z/my-project/src/data/scenarios/case-05.ts` - The Celebrity Chef Deal
- **Export**: `case05`
- **Tier**: 2, **Category**: hidden_interests
- **Client**: GreenFork (🌱) - plant-based meal startup
- **Counterparty**: Chef Marco Bellini (👨‍🍳) - celebrity chef
- **Hidden truth**: Chef cares about creative control and reputation, not equity %
- **Dialogue nodes**: 25 nodes with branching choices
- **Endings**: 4 (master, cooperative, hard_bargain, bad_deal)
- **Investigation actions**: 3 (past deals, agent conversation, public statements)
- **Bias traps**: fixed_pie (money as only currency), vividness (equity % distracts from total value)

## Quality Checks
- All files pass `bun run lint` with no errors
- All files follow the exact type structure from types.ts
- All files match the format/structure of case-01.ts
- Each file is self-contained and imports from './types'
- Dialogue trees have 20-25 nodes with meaningful branching
- Multiple choice types used (diagnostic, aggressive_anchor, face_saving, empathy, package_offer, investigative, threat, walk_away, concession)
- State effects properly defined on choices
- Requirements (info_discovered) properly set on locked choices
- All endings have proper scores and long-term consequences
- Postmortem info complete for each case
- Bias traps properly defined with trigger nodes, warnings, and countermeasures
