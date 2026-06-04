# Component Library

This library specifies the reusable React components, custom Tailwind CSS layouts, and shadcn/ui integrations used to build **THE TRACKER**.

---

## 1. SetInputRow (`components/workout/set-input-row.tsx`)

### Description
The core building block of the workout logger. It provides inputs for logging weight, reps, and RPE for a single set, showing previous training values as placeholder targets.

```typescript
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface SetInputRowProps {
  setNumber: number;
  prevWeight?: number;
  prevReps?: number;
  weight: string;
  reps: string;
  rpe: string;
  isCompleted: boolean;
  onUpdate: (field: 'weight' | 'reps' | 'rpe', value: string) => void;
  onToggleComplete: () => void;
}

export const SetInputRow: React.FC<SetInputRowProps> = ({
  setNumber,
  prevWeight,
  prevReps,
  weight,
  reps,
  rpe,
  isCompleted,
  onUpdate,
  onToggleComplete,
}) => {
  return (
    <div className={`grid grid-cols-5 items-center gap-2 py-1.5 px-2 rounded-md transition-colors ${
      isCompleted ? 'bg-emerald-950/20' : 'hover:bg-slate-900'
    }`}>
      {/* Set Number */}
      <span className="font-mono text-sm text-slate-400 text-center">
        {setNumber}
      </span>

      {/* Previous Performance */}
      <span className="text-xs text-slate-500 font-mono text-center">
        {prevWeight && prevReps ? `${prevWeight}kg x ${prevReps}` : '—'}
      </span>

      {/* Weight & Reps inputs */}
      <Input
        type="number"
        inputMode="decimal"
        placeholder="0.0"
        value={weight}
        disabled={isCompleted}
        onChange={(e) => onUpdate('weight', e.target.value)}
        className="h-9 text-center font-mono focus-visible:ring-emerald-500"
      />
      <Input
        type="number"
        inputMode="numeric"
        placeholder="0"
        value={reps}
        disabled={isCompleted}
        onChange={(e) => onUpdate('reps', e.target.value)}
        className="h-9 text-center font-mono focus-visible:ring-emerald-500"
      />

      {/* Checkbox Trigger */}
      <div className="flex justify-center">
        <button
          onClick={onToggleComplete}
          className={`h-9 w-9 flex items-center justify-center rounded-md border transition-all ${
            isCompleted 
              ? 'bg-emerald-500 border-emerald-500 text-black' 
              : 'border-slate-700 hover:border-emerald-500 text-transparent'
          }`}
        >
          ✓
        </button>
      </div>
    </div>
  );
};
```

---

## 2. RestTimerOverlay (`components/workout/rest-timer-overlay.tsx`)

### Description
A bottom floating bar overlay that launches immediately when a set is completed. It plays a beep sound and triggers a haptic vibrate on mobile devices upon completion.

```typescript
import React, { useState, useEffect } from 'react';

interface RestTimerProps {
  durationSeconds: number; // default: 90
  onClose: () => void;
}

export const RestTimerOverlay: React.FC<RestTimerProps> = ({ durationSeconds, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (typeof window !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]); // Vibrate twice
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const percentage = (timeLeft / durationSeconds) * 100;

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 transition-transform duration-300">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-slate-300">Rest Timer</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-2xl font-bold text-emerald-400">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
        <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <button 
          onClick={() => setTimeLeft((t) => t + 30)} 
          className="text-xs bg-slate-800 border border-slate-700 px-2 py-1 rounded"
        >
          +30s
        </button>
      </div>
    </div>
  );
};
```

---

## 3. PersonalRecordBadge (`components/ui/pr-badge.tsx`)

### Description
A small, stylized emerald badge displayed on sets, dashboards, or exercise feeds to mark newly achieved strength outputs.

```typescript
import React from 'react';
import { Flame } from 'lucide-react'; // From lucide-react

export const PersonalRecordBadge: React.FC = () => {
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase animate-pulse">
      <Flame className="w-3 h-3 fill-emerald-400" />
      New PR
    </span>
  );
};
```
---

## 4. ProgressLineChart (`components/analytics/progress-line-chart.tsx`)

### Description
Uses `@/components/ui/chart` (built with Recharts) to render weight history and strength volume progress over a selected time domain (7D, 30D, 90D). It uses custom gradient fills and responsive container boundaries.
* **Component Path**: `components/analytics/progress-line-chart.tsx`
* **Features**: Dynamic tooltips, HSL grid lines, linear transitions.
* **State Hook Integration**: React state maps filter ranges and fetches data asynchronously via Supabase endpoints.
