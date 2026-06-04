"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Plus, RotateCcw, X, Volume2 } from "lucide-react";

interface RestTimerProps {
  timeRemaining: number;
  duration: number;
  isActive: boolean;
  onAdjustTime: (amount: number) => void;
  onSkip: () => void;
}

export function RestTimer({
  timeRemaining,
  duration,
  isActive,
  onAdjustTime,
  onSkip,
}: RestTimerProps) {
  if (timeRemaining <= 0) return null;

  const progress = (timeRemaining / duration) * 100;
  
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-md px-4 sm:bottom-4">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur-md">
        {/* Progress Bar Background */}
        <div className="absolute bottom-0 left-0 h-1 bg-muted w-full">
          <div
            className="h-full bg-emerald-600 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Rest Timer
              </p>
              <p className="text-2xl font-bold font-mono leading-none text-foreground mt-0.5">
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdjustTime(30)}
              className="h-8 px-2.5 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>+30s</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkip}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Skip timer</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
