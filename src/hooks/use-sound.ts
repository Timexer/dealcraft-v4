'use client';

import { useCallback, useRef, useState, useEffect } from 'react';

const SOUND_ENABLED_KEY = 'dealcraft-sound-enabled';

// Singleton AudioContext — created lazily on first use
let audioCtxRef: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtxRef) {
      audioCtxRef = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (audioCtxRef.state === 'suspended') {
      audioCtxRef.resume();
    }
    return audioCtxRef;
  } catch {
    return null;
  }
}

function createOscillator(
  ctx: AudioContext,
  frequency: number,
  type: OscillatorType,
  gainValue: number,
  startTime: number,
  endTime: number,
  frequencyEnd?: number
): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  if (frequencyEnd !== undefined) {
    oscillator.frequency.linearRampToValueAtTime(frequencyEnd, endTime);
  }

  gainNode.gain.setValueAtTime(gainValue, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(endTime);
}

export function useSound() {
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const stored = localStorage.getItem(SOUND_ENABLED_KEY);
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  // Keep a ref to avoid stale closures in callbacks
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabledState(prev => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_ENABLED_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const playClick = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    createOscillator(ctx, 800, 'sine', 0.12, now, now + 0.06);
  }, []);

  const playSuccess = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    createOscillator(ctx, 523, 'sine', 0.12, now, now + 0.15, 784);
    createOscillator(ctx, 784, 'sine', 0.10, now + 0.15, now + 0.35, 1047);
  }, []);

  const playWarning = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    createOscillator(ctx, 220, 'square', 0.08, now, now + 0.3, 180);
  }, []);

  const playNegotiation = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    createOscillator(ctx, 440, 'sine', 0.10, now, now + 0.2, 520);
  }, []);

  const playAchievement = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    createOscillator(ctx, 523, 'sine', 0.10, now, now + 0.15, 659);
    createOscillator(ctx, 659, 'sine', 0.10, now + 0.15, now + 0.30, 784);
    createOscillator(ctx, 784, 'sine', 0.12, now + 0.30, now + 0.55, 1047);
  }, []);

  const playTyping = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    createOscillator(ctx, 1200, 'sine', 0.05, now, now + 0.025);
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playClick,
    playSuccess,
    playWarning,
    playNegotiation,
    playAchievement,
    playTyping,
  };
}
