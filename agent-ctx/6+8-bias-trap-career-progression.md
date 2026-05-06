# Task 6+8: Bias Trap Warning System + Enhanced Career Progression

## Summary

### Part A: Bias Trap Warning System
- **Created** `/src/components/game/BiasTrapAlert.tsx` - New component with:
  - `BiasTrapAlert` - Individual alert with glassmorphism, amber border, slide-in animation
  - `BiasTrapAlertContainer` - Container managing multiple active alerts
  - Auto-dismiss after 15 seconds with countdown timer
  - "View Countermeasure" expandable section
  - Pause timer on hover
  - Bias type icons: ⚠️ anchor_shock, 🎯 fixed_pie, 🔥 escalation, 👁️ vividness, 🧠 egocentrism, 💎 overconfidence, 😰 regret_aversion

- **Modified** `/src/components/game/NegotiationTable.tsx` - Integrated bias detection:
  - Added `activeBiasAlerts` state and `triggerBiasTrap`/`dismissBiasAlert` callbacks
  - Effect to detect when `triggerDialogueNodeId` matches current dialogue node
  - Pattern-based detection: 3+ aggressive_anchor choices = fixed_pie bias; anger > 70 + aggressive_anchor = escalation bias
  - Added `BiasTrapAlertContainer` to the render
  - Added "Bias Traps" section in right sidebar showing triggered traps
  - Defers setState calls via requestAnimationFrame to avoid lint issues

- **Modified** `/src/components/game/Postmortem.tsx` - Added bias traps postmortem section:
  - New "Bias Traps" card between "Stats Improvement" and "Continue Career" button
  - Shows progress bar of triggered vs total traps
  - Each trap shown with triggered/avoided badge
  - Triggered traps display their countermeasure
  - Added ShieldAlert, CheckCircle2, AlertTriangle imports

### Part B: Enhanced Career Progression
- **Rewrote** `/src/components/game/CareerProgression.tsx` - Complete redesign:
  - **Visual Tier Map**: Vertical timeline with connected nodes, current tier has amber glow pulse animation, completed tiers show ✅ with emerald color, future tiers show 🔒 with muted color, connector lines between nodes
  - **Stats visualization**: Stats grouped into 3 categories (Core Skills, Soft Skills, Advanced) with colored category headers, stat bars change color based on value (red < 30, amber 30-60, emerald 60+), separator between categories
  - **Reputation visualization**: Profile summary showing top 2 reputation types, dominant reputation highlighted with glow animation, horizontal bar chart with per-type colors, #1/#2 badges
  - **Premium styling**: Glass-card for main sections, gradient backgrounds on section headers, `gradient-text` class for player name, better spacing and visual hierarchy

## Files Changed
1. `/src/components/game/BiasTrapAlert.tsx` - NEW
2. `/src/components/game/NegotiationTable.tsx` - MODIFIED
3. `/src/components/game/Postmortem.tsx` - MODIFIED
4. `/src/components/game/CareerProgression.tsx` - REWRITTEN

## Lint Status
All lint checks pass with no errors.
