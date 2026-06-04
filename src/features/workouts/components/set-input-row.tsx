"use client";

import { useState, useEffect } from "react";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WorkoutEntry } from "../types";

interface SetInputRowProps {
  entry: WorkoutEntry;
  label: string;
  onUpdate: (id: string, updates: { weight: number; reps: number; isCompleted: boolean; setType?: "warmup" | "working" | "top" | "failure" }) => void;
  onDelete: (id: string) => void;
  lastWeight?: number;
  suggestedWeight?: number;
}

export function SetInputRow({
  entry,
  label,
  onUpdate,
  onDelete,
  lastWeight,
  suggestedWeight,
}: SetInputRowProps) {
  const [weight, setWeight] = useState(entry.weight.toString());
  const [reps, setReps] = useState(entry.reps.toString());

  // Keep local state in sync with server state
  useEffect(() => {
    setWeight(entry.weight > 0 ? entry.weight.toString() : "");
    setReps(entry.reps > 0 ? entry.reps.toString() : "");
  }, [entry.weight, entry.reps]);

  const handleBlur = () => {
    const numWeight = parseFloat(weight) || 0;
    const numReps = parseInt(reps, 10) || 0;

    // Only update if something changed
    if (
      numWeight !== entry.weight ||
      numReps !== entry.reps
    ) {
      onUpdate(entry.id, {
        weight: numWeight,
        reps: numReps,
        isCompleted: entry.isCompleted,
      });
    }
  };

  const handleToggleComplete = () => {
    const numWeight = parseFloat(weight) || 0;
    const numReps = parseInt(reps, 10) || 0;

    onUpdate(entry.id, {
      weight: numWeight,
      reps: numReps,
      isCompleted: !entry.isCompleted,
    });
  };

  return (
    <div className={`grid grid-cols-12 gap-2 items-center py-2 px-2 rounded-lg transition-colors duration-150 ${
      entry.isCompleted ? "bg-emerald-50/30 border border-emerald-100/50" : "bg-card border border-transparent"
    }`}>
      {/* Set Number label / type select dropdown */}
      <div className="col-span-2 flex justify-center">
        <Select
          value={entry.setType || "working"}
          disabled={entry.isCompleted}
          onValueChange={(val: any) => {
            onUpdate(entry.id, {
              weight: parseFloat(weight) || 0,
              reps: parseInt(reps, 10) || 0,
              isCompleted: entry.isCompleted,
              setType: val,
            });
          }}
        >
          <SelectTrigger className="h-8 w-full border-none bg-transparent hover:bg-muted text-center font-bold text-sm text-muted-foreground flex items-center justify-center shadow-none focus:ring-0 [&_svg]:hidden cursor-pointer px-2">
            <div className="flex items-center gap-1.5 justify-center">
              <span className={label === "W" ? "text-amber-600 dark:text-amber-500 font-semibold text-xs" : "text-xs"}>Set {label}</span>
              {entry.isPr && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-[8px] h-3.5 px-1.5 animate-pulse border-none text-white font-bold leading-none select-none">
                  PR
                </Badge>
              )}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="working">Working</SelectItem>
            <SelectItem value="warmup">Warmup</SelectItem>
            <SelectItem value="top">Top Set</SelectItem>
            <SelectItem value="failure">Failure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Weight input */}
      <div className="col-span-4">
        <Input
          type="number"
          inputMode="decimal"
          placeholder={
            suggestedWeight !== undefined && suggestedWeight > 0
              ? `${suggestedWeight}`
              : lastWeight !== undefined && lastWeight > 0
              ? `${lastWeight}`
              : "0"
          }
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onBlur={handleBlur}
          disabled={entry.isCompleted}
          className="h-9 text-center bg-background border-border font-mono text-sm"
        />
      </div>

      {/* Reps input */}
      <div className="col-span-4">
        <Input
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onBlur={handleBlur}
          disabled={entry.isCompleted}
          className="h-9 text-center bg-background border-border font-mono text-sm"
        />
      </div>

      {/* Toggle Complete Check */}
      <div className="col-span-1 flex justify-center">
        <Button
          type="button"
          size="icon"
          variant={entry.isCompleted ? "default" : "outline"}
          onClick={handleToggleComplete}
          className={`h-8 w-8 rounded-md transition-all duration-200 ${
            entry.isCompleted
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "border-border hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
          }`}
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete button */}
      <div className="col-span-1 flex justify-center">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => onDelete(entry.id)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
