/**
 * useNavigationGuard — Prevents browser back/forward (popstate) actions
 * during active negotiation or other transient states.
 *
 * When a player attempts a popstate back action while the simulation
 * thread is in a transient/pending state, this hook:
 * 1. Intercepts the navigation
 * 2. Saves the current store state to sessionStorage as a cache
 * 3. Pushes the user to a friendly error resolution screen
 *
 * Uses Zustand phase routing (no URL changes needed).
 */
'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/game-store';

/** Phases where the simulation is in a transient/pending execution state */
const TRANSIENT_PHASES = new Set(['negotiation', 'investigation', 'strategy']);

/** Session storage key for emergency cache save */
const CACHE_KEY = 'dealcraft_emergency_cache';

export function useNavigationGuard() {
  const phase = useGameStore((s) => s.phase);
  const phaseRef = useRef(phase);

  // Keep the ref in sync with the current phase (inside effect to avoid render-time ref update)
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const currentPhase = phaseRef.current;

      if (!TRANSIENT_PHASES.has(currentPhase)) {
        // Not in a transient state — allow normal back navigation
        return;
      }

      // Prevent the default back navigation
      e.preventDefault();

      // ── Emergency cache save ───────────────────────────────────────
      // Snapshot the entire store state to sessionStorage so the player
      // doesn't lose their active negotiation progress.
      try {
        const storeState = useGameStore.getState();
        const cachePayload = {
          timestamp: Date.now(),
          phase: currentPhase,
          negotiation: storeState.negotiation,
          currentScenarioId: storeState.currentScenarioId,
          discoveredFacts: storeState.discoveredFacts,
          caseAccepted: storeState.caseAccepted,
          batnaEstimate: storeState.batnaEstimate,
          reservationEstimate: storeState.reservationEstimate,
          openingStrategy: storeState.openingStrategy,
          assumptions: storeState.assumptions,
        };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
      } catch (err) {
        console.error('[NavGuard] Failed to save emergency cache:', err);
      }

      // ── Redirect to error resolution screen ────────────────────────
      // Use history.pushState to keep the browser at the current URL,
      // then switch the app to the error_resolution phase.
      history.pushState(null, '', window.location.href);
      useGameStore.getState().setPhase('error_resolution');
    };

    // ── Also guard against beforeunload (page close/refresh) ──────────
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const currentPhase = phaseRef.current;
      if (TRANSIENT_PHASES.has(currentPhase)) {
        // Standard browser prompt: "Are you sure you want to leave?"
        e.preventDefault();
      }
    };

    // Push an initial state so popstate has something to intercept
    history.pushState(null, '', window.location.href);

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}

/**
 * Retrieve the emergency cache from sessionStorage (if any).
 * Used by the ErrorResolution component to offer state restoration.
 */
export function getEmergencyCache(): {
  timestamp: number;
  phase: string;
  negotiation: unknown;
  currentScenarioId: string | null;
  discoveredFacts: string[];
  caseAccepted: boolean;
  batnaEstimate: number;
  reservationEstimate: number;
  openingStrategy: string;
  assumptions: string[];
} | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clear the emergency cache after successful restoration.
 */
export function clearEmergencyCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Silently fail — sessionStorage may be unavailable
  }
}
