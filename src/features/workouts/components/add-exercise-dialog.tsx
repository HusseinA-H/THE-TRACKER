"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExerciseSearch } from "@/features/exercises/components/exercise-search";
import { MuscleGroupFilter } from "@/features/exercises/components/muscle-group-filter";
import { getMuscleGroupColor } from "@/features/exercises/utils/muscle-groups";
import type { Exercise, MuscleGroup } from "@/types";

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
}

export function AddExerciseDialog({
  open,
  onOpenChange,
  exercises,
  onSelectExercise,
}: AddExerciseDialogProps) {
  const [search, setSearch] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | "All">("All");

  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle =
      muscleGroup === "All" ||
      ex.primaryMuscleGroup === muscleGroup ||
      ex.secondaryMuscleGroup === muscleGroup;
    return matchesSearch && matchesMuscle;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="px-6 pb-4 space-y-3">
          <div className="flex w-full">
            <ExerciseSearch value={search} onChange={setSearch} />
          </div>
          <div className="border-t border-border/40 pt-2">
            <MuscleGroupFilter
              selectedGroup={muscleGroup}
              onSelect={setMuscleGroup}
            />
          </div>
        </div>

        {/* Exercises list */}
        <div className="flex-1 overflow-y-auto border-t border-border px-6 py-2">
          {filtered.length > 0 ? (
            <div className="divide-y divide-border/60">
              {filtered.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => {
                    onSelectExercise(exercise);
                    onOpenChange(false);
                  }}
                  className="w-full text-left py-3.5 flex flex-col gap-1 transition-colors hover:bg-muted/30 -mx-2 px-2 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {exercise.name}
                    </span>
                    {exercise.isCustom && (
                      <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded font-medium border border-border">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-[10px] text-muted-foreground">
                      {exercise.primaryMuscleGroup}
                    </span>
                    {exercise.secondaryMuscleGroup && (
                      <span className="text-[10px] text-muted-foreground/60">
                        · {exercise.secondaryMuscleGroup}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground text-sm">
              No exercises match your search filters.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
