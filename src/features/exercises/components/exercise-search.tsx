"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface ExerciseSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export function ExerciseSearch({ value, onChange }: ExerciseSearchProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search exercises..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9 border-border bg-background"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          type="button"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </div>
  );
}
