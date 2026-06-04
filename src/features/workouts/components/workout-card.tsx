"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Trash2,
  Trophy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";
import { deleteWorkoutAction } from "../actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Workout, WorkoutEntry } from "../types";

interface WorkoutCardProps {
  workout: Workout;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const durationSeconds = workout.completedAt
    ? Math.floor(
        (new Date(workout.completedAt).getTime() -
          new Date(workout.startedAt).getTime()) /
          1000
      )
    : 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting workout from history...");
    try {
      const result = await deleteWorkoutAction(workout.id);
      if (result.success) {
        toast.success("Workout deleted", { id: toastId });
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to delete workout.", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  // Group workout entries by exercise
  const exerciseEntriesMap = new Map<string, { name: string; entries: WorkoutEntry[] }>();
  if (workout.entries) {
    workout.entries.forEach((entry) => {
      const exerciseId = entry.exerciseId;
      const exerciseName = entry.exercise?.name || "Exercise";
      const existing = exerciseEntriesMap.get(exerciseId);
      if (existing) {
        existing.entries.push(entry);
      } else {
        exerciseEntriesMap.set(exerciseId, { name: exerciseName, entries: [entry] });
      }
    });
  }

  const groupedExercises = Array.from(exerciseEntriesMap.values());

  return (
    <>
      <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold text-foreground">
              {workout.name}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(workout.completedAt || workout.startedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(durationSeconds)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete workout</span>
          </Button>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {workout.notes && (
            <p className="text-sm bg-muted/30 p-2.5 rounded-lg border border-border/20 text-muted-foreground italic">
              {workout.notes}
            </p>
          )}

          {/* Quick list of exercises */}
          <div className="space-y-2">
            {groupedExercises.slice(0, isExpanded ? undefined : 3).map((group, idx) => (
              <div key={idx} className="text-sm">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>{group.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {group.entries.length} {group.entries.length === 1 ? "set" : "sets"}
                  </span>
                </div>
                
                {/* Sets details */}
                <div className="grid grid-cols-2 gap-y-1 mt-1 text-xs text-muted-foreground bg-muted/10 p-2 rounded-md border border-border/20">
                  {group.entries.map((set, setIdx) => (
                    <div key={set.id} className="flex items-center gap-2">
                      <span className="font-semibold text-foreground/70">S{setIdx + 1}:</span>
                      <span>{set.reps} reps @ {set.weight} kg</span>
                      {set.isPr && (
                        <Badge variant="outline" className="h-4 px-1 text-[9px] font-bold text-amber-600 bg-amber-50 border-amber-200">
                          <Trophy className="h-2 w-2 mr-0.5" /> PR
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {groupedExercises.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground h-7 flex items-center justify-center gap-1 mt-1"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>Show {groupedExercises.length - 3} more exercises</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Workout Log</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workout log? This will remove all
              associated exercise records from your training history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
