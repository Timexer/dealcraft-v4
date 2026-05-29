# 💡 Features & Ideas Pool

This document is a living repository of all ideas, major feature requests, and mechanics brainstormed for **DealCraft**. Feel free to add, modify, or rearrange these items.

---

## 🎭 1. Deep AI Personalities (The Adversary Matrix)
Make every negotiation unique by creating distinct negotiator profiles:
*   **The Shark (Aggressive / Competitive)**: Focuses purely on value capture. Employs hardball tactics, ultimatums, and high pressure. Requires the player to stand firm.
*   **The Accommodator (Relationship-First)**: Friendly and eager to please, but will quietly feel taken advantage of if the player pushes too hard, ruining long-term trust.
*   **The Analytical Auditor (Data-Driven / Cold)**: Unmoved by emotional pleas. Requires precise numbers, logical reasoning, and objective standards (e.g., industry averages).
*   **The Collaborator (Problem-Solver)**: Tries to expand the pie (win-win). Works with the player to create creative solutions.

---

## 🎙️ 2. Multimodal Immersive Experience
Make the simulator feel incredibly lifelike:
*   **Speech-to-Text (Whisper)**: Let the user speak their response rather than type. Real-world negotiations are spoken; this adds a massive training benefit.
*   **AI Voice Synthesis (ElevenLabs / Gemini TTS)**: The AI negotiator responds out loud with high-fidelity, emotional voice synthesis matching their state (e.g., irritated, happy, calm).
*   **Video Call UI**: A mock interface resembling Zoom or Teams, with an animated avatar or video feed for the AI.

---

## 📊 3. Premium Performance Analytics
Give players rich feedback to help them improve:
*   **The Negotiation Scorecard**: Break down the final deal into 5 key metrics:
    *   **Value Captured** (Did you get a good price/deal?)
    *   **Relationship Health** (Does the other side want to do business with you again?)
    *   **Emotional Control** (Did you let emotional outbursts or pressure throw you off?)
    *   **Integrity & Trust** (Did you lie or break trust?)
    *   **Pacing & Strategy** (Did you rush the deal or employ structured phases?)
*   **PDF Certificate / Report**: An elegant, downloadable PDF summary of their performance, advisor notes, and a "Negotiator Archetype" badge (e.g., "The Diplomat", "The Bulldozer").

---

## 🏗️ 4. Custom Case & Scenario Builder
Allow users (like corporate trainers or language teachers) to craft custom simulations:
*   **Case Intake Wizard**: A simple form where you enter:
    1.  What the negotiation is about (e.g., "Buying a used commercial espresso machine").
    2.  Your secret goals and constraints (e.g., "Max budget $4,000, must include delivery").
    3.  The other side's secret goals and temperament (e.g., "Needs cash fast, firm on $4,500 unless package deal").
*   **Instant AI Scenario Engine**: The system uses these guidelines to program the AI's system prompt and scenario logic instantly.

---

## 🕹️ 5. Gamification & Career Mode
*   **Negotiation Quest**: A linear story mode where the player starts as a Junior Associate negotiating small office supply deals and works their way up to lead a multi-billion dollar tech acquisition.
*   **Daily Challenges**: Quick 5-minute negotiation puzzles (e.g., "Defuse a hostile client within 5 responses").

---

## 🔍 6. UX, Readability & Accessibility (To Consider Soon)
*   **Font Size Adjustment & Layout Sizing**:
    *   *Feedback*: A student complained that the font is too small on some screens, causing readability issues.
    *   *Analysis & Options*:
        1.  **Browser Zoom Compatibility (Standard Solution)**: Standard browser zoom (`Cmd/Ctrl` + `+`) functions cleanly because the app is built on relative units (`rem`, flex/grid structures, and percentage bounds). It scales all layouts linearly. We should double-check that no hardcoded `px` widths/heights clamp container sizes unnecessarily.
        2.  **Typography & Contrast Audit**: Readability is deeply impacted by contrast and line-heights. We can improve legibility by:
            *   Avoiding body text sizing below `text-xs` (and scaling up to `text-sm` where possible).
            *   Increasing line heights (e.g., changing text classes to `leading-relaxed`).
            *   Ensuring muted text colors (like `text-muted-foreground`) have high contrast against the dark card backgrounds.
        3.  **Global Accessibility Scale Switcher (AAA)**: Add a subtle font size controller in the header or settings panel (e.g., A⁻ | A | A⁺). Toggling this will inject a class or CSS variable into the root HTML node to scale up base font sizing (`1rem = 18px` instead of `16px`) without breaking responsive alignments.
        4.  **ScrollArea Integration**: Ensure text overflows resulting from scaling are handled gracefully by existing `ScrollArea` containers rather than clipping container bounds.

