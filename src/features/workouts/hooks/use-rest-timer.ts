"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { defaultRestTimerSeconds } from "@/config/site";

export function useRestTimer(initialSeconds: number = defaultRestTimerSeconds) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [duration, setDuration] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
    clear();
  }, [clear]);

  const reset = useCallback(() => {
    setIsActive(false);
    clear();
    setTimeRemaining(0);
  }, [clear]);

  const start = useCallback(
    (seconds?: number) => {
      clear();
      const startSecs = seconds !== undefined ? seconds : duration;
      setDuration(startSecs);
      setTimeRemaining(startSecs);
      setIsActive(true);
    },
    [clear, duration]
  );

  const adjustTime = useCallback((amount: number) => {
    setTimeRemaining((prev) => {
      const next = Math.max(0, prev + amount);
      if (next === 0) {
        setIsActive(false);
      }
      return next;
    });
    setDuration((prev) => Math.max(30, prev + amount));
  }, []);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clear();
            setIsActive(false);
            // Play a subtle sound when finished
            try {
              const audioCtx = new (window.AudioContext ||
                (window as any).webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.type = "sine";
              oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
              gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + 0.15);
            } catch (e) {
              console.log("Audio not supported or blocked by browser autocomplete", e);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clear();
  }, [isActive, timeRemaining, clear]);

  return {
    timeRemaining,
    duration,
    isActive,
    start,
    pause,
    reset,
    adjustTime,
  };
}
