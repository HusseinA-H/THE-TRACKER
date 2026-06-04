"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Dumbbell, Play, Pause, RotateCcw, Trash2, CheckCircle2, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SetInputRow } from "./set-input-row";
import { AddExerciseDialog } from "./add-exercise-dialog";
import { RestTimer } from "./rest-timer";
import { useRestTimer } from "../hooks/use-rest-timer";
import {
  addEntryAction,
  updateEntryAction,
  deleteEntryAction,
  completeWorkoutAction,
  deleteWorkoutAction,
  updateWorkoutAction,
} from "../actions";
import { routes } from "@/config/routes";
import type { Workout, WorkoutEntry, WorkoutTemplateExercise } from "../types";
import type { Exercise } from "@/types";
import { ExerciseDetailDrawer } from "@/features/exercises/components/exercise-detail-drawer";

interface ActiveWorkoutProps {
  workout: Workout;
  availableExercises: Exercise[];
  templateExercises?: WorkoutTemplateExercise[];
  lastWeights?: Record<string, number>;
  progressions?: Record<string, { lastWeight: number; lastReps: number; suggestedWeight: number }>;
}

export function ActiveWorkout({
  workout,
  availableExercises,
  templateExercises = [],
  lastWeights = {},
  progressions = {},
}: ActiveWorkoutProps) {
  const router = useRouter();
  
  // Local state for client adjustments
  const [workoutName, setWorkoutName] = useState(workout.name);
  const [workoutNotes, setWorkoutNotes] = useState(workout.notes || "");
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exercise detail drawer state
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState<Exercise | null>(null);

  // Exercise Notes State
  const [exerciseNotesMap, setExerciseNotesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const notes: Record<string, string> = {};
    if (workout.entries) {
      const processed = new Set<string>();
      workout.entries.forEach((entry) => {
        if (!processed.has(entry.exerciseId)) {
          processed.add(entry.exerciseId);
          notes[entry.exerciseId] = entry.notes || "";
        }
      });
    }
    setExerciseNotesMap((prev) => {
      const updated = { ...notes };
      Object.keys(prev).forEach((key) => {
        if (typeof document !== "undefined" && document.activeElement?.id === `exercise-note-${key}`) {
          updated[key] = prev[key];
        }
      });
      return updated;
    });
  }, [workout.entries]);
  
  // Running timer since workout started
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Rest Timer Hook
  const {
    timeRemaining,
    duration,
    isActive: isTimerActive,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
    adjustTime,
  } = useRestTimer();
  // Running timer since workout started (starts at 00:00)
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutTime((prev) => prev + 1);
      }, 1000);
    } else if (!isWorkoutActive && workoutTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, workoutTime]);

  const formatElapsed = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    const parts = [];
    if (hrs > 0) parts.push(hrs.toString().padStart(2, "0"));
    parts.push(mins.toString().padStart(2, "0"));
    parts.push(secs.toString().padStart(2, "0"));
    return parts.join(":");
  };

  // Group entries by exercise
  const exerciseGroupsMap = new Map<string, { exercise: Exercise; entries: WorkoutEntry[] }>();
  if (workout.entries) {
    workout.entries.forEach((entry) => {
      const exerciseId = entry.exerciseId;
      const existing = exerciseGroupsMap.get(exerciseId);
      if (existing) {
        existing.entries.push(entry);
      } else if (entry.exercise) {
        exerciseGroupsMap.set(exerciseId, {
          exercise: entry.exercise,
          entries: [entry],
        });
      }
    });
  }

  const groupedExercises = Array.from(exerciseGroupsMap.values());

  const handleAddExercise = async (exercise: Exercise) => {
    const toastId = toast.loading(`Adding ${exercise.name}...`);
    try {
      const result = await addEntryAction({
        workoutId: workout.id,
        exerciseId: exercise.id,
        setNumber: 1,
        weight: 0,
        reps: 0,
      });

      if (result.success) {
        toast.success(`${exercise.name} added`, { id: toastId });
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to add exercise", { id: toastId });
    }
  };

  const handleAddSet = async (exerciseId: string, currentSetsCount: number) => {
    // Find the last set to copy its weight and reps for easier logging
    const exerciseGroup = exerciseGroupsMap.get(exerciseId);
    const lastSet = exerciseGroup?.entries[currentSetsCount - 1];

    try {
      const result = await addEntryAction({
        workoutId: workout.id,
        exerciseId,
        setNumber: currentSetsCount + 1,
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || 0,
      });

      if (!result.success) {
        toast.error(result.error);
      }
    } catch (e) {
      toast.error("Failed to add set");
    }
  };

  const handleWorkoutNameBlur = async () => {
    if (workoutName.trim() === "") return;
    try {
      const result = await updateWorkoutAction(workout.id, { name: workoutName });
      if (!result.success) {
        toast.error(result.error);
      }
    } catch (e) {
      toast.error("Failed to update workout name");
    }
  };

  const handleWorkoutNotesBlur = async () => {
    try {
      const result = await updateWorkoutAction(workout.id, { notes: workoutNotes });
      if (!result.success) {
        toast.error(result.error);
      }
    } catch (e) {
      toast.error("Failed to update workout notes");
    }
  };

  const handleExerciseNoteChange = (exerciseId: string, value: string) => {
    setExerciseNotesMap((prev) => ({
      ...prev,
      [exerciseId]: value,
    }));
  };

  const handleExerciseNoteBlur = async (exerciseId: string, firstEntry?: WorkoutEntry) => {
    if (!firstEntry) return;
    const notesValue = exerciseNotesMap[exerciseId] ?? "";
    if (notesValue === (firstEntry.notes || "")) return;
    
    try {
      const result = await updateEntryAction({
        id: firstEntry.id,
        notes: notesValue,
      });
      if (!result.success) {
        toast.error(result.error);
      }
    } catch (e) {
      toast.error("Failed to save exercise notes");
    }
  };

  const handleUpdateSet = async (
    setId: string,
    updates: { weight: number; reps: number; isCompleted: boolean; setType?: "warmup" | "working" | "top" | "failure" }
  ) => {
    try {
      const result = await updateEntryAction({
        id: setId,
        ...updates,
      });

      if (result.success) {
        // Trigger rest timer only if set was newly marked completed
        const setBeforeUpdate = workout.entries?.find((e) => e.id === setId);
        if (updates.isCompleted && !setBeforeUpdate?.isCompleted) {
          startTimer();
          toast.success("Set completed! Rest timer started.", { duration: 2000 });
        }
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      toast.error("Failed to update set");
    }
  };

  const handleDeleteSet = async (setId: string) => {
    try {
      const result = await deleteEntryAction(setId);
      if (!result.success) {
        toast.error(result.error);
      }
    } catch (e) {
      toast.error("Failed to delete set");
    }
  };

  const handleFinishWorkout = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading("Completing workout...");
    try {
      const result = await completeWorkoutAction(
        workout.id,
        workoutName,
        workoutNotes
      );

      if (result.success) {
        toast.success("Workout logged successfully!", { id: toastId });
        setIsFinishDialogOpen(false);
        resetTimer();
        router.push(routes.workouts);
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to complete workout.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelWorkout = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading("Discarding workout...");
    try {
      const result = await deleteWorkoutAction(workout.id);
      if (result.success) {
        toast.success("Workout discarded", { id: toastId });
        setIsCancelDialogOpen(false);
        resetTimer();
        router.push(routes.workouts);
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to discard workout", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-24">
      {/* Top Banner details */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{workoutName}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <Play className={`h-4 w-4 text-emerald-600 fill-emerald-600 ${isWorkoutActive ? "animate-pulse" : ""}`} />
            <span className="font-mono font-semibold">{formatElapsed(workoutTime)}</span>
            <span>elapsed</span>
            <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded border">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setIsWorkoutActive(!isWorkoutActive)}
                title={isWorkoutActive ? "Pause Workout Timer" : "Resume Workout Timer"}
              >
                {isWorkoutActive ? (
                  <Pause className="h-3 w-3 text-foreground/80" />
                ) : (
                  <Play className="h-3 w-3 text-emerald-600 fill-current" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-destructive/10"
                onClick={() => {
                  setWorkoutTime(0);
                  setIsWorkoutActive(false);
                }}
                title="Reset Workout Timer"
              >
                <RotateCcw className="h-3 w-3 text-foreground/80" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setIsCancelDialogOpen(true)}
          >
            <X className="h-4 w-4 mr-2" />
            <span>Discard</span>
          </Button>
          <Button onClick={() => setIsFinishDialogOpen(true)}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            <span>Finish Workout</span>
          </Button>
        </div>
      </div>

      {/* Workout name and notes card */}
      <Card className="border border-border shadow-sm p-4 bg-muted/10 space-y-3">
        <div className="space-y-1">
          <Label htmlFor="workout-name-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workout Name</Label>
          <Input
            id="workout-name-input"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            onBlur={handleWorkoutNameBlur}
            placeholder="Workout Name"
            className="text-lg font-bold border-transparent hover:border-border focus:border-ring bg-transparent px-0 hover:px-3 focus:px-3 transition-all h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="workout-notes-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workout Notes</Label>
          <Textarea
            id="workout-notes-input"
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            onBlur={handleWorkoutNotesBlur}
            placeholder="Add general notes about today's session (e.g. sleep, energy, focus...)"
            className="border-transparent hover:border-border focus:border-ring bg-transparent px-0 hover:px-3 focus:px-3 transition-all resize-none min-h-[60px]"
          />
        </div>
      </Card>

      {/* Progress Bar Card */}
      {groupedExercises.length > 0 && (() => {
        const completedExercisesCount = groupedExercises.filter(({ entries }) => 
          entries.length > 0 && entries.every(e => e.isCompleted)
        ).length;
        const totalExercisesCount = groupedExercises.length;
        const progressPercentage = totalExercisesCount > 0 ? (completedExercisesCount / totalExercisesCount) * 100 : 0;

        return (
          <Card className="border border-border shadow-xs p-4 bg-muted/10">
            <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <span>Workout Progress</span>
              <span className="font-bold text-foreground">{completedExercisesCount} / {totalExercisesCount} Exercises Completed</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden border border-border/50">
              <div 
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {groupedExercises.map(({ exercise, entries }) => {
                const isDone = entries.length > 0 && entries.every(e => e.isCompleted);
                return (
                  <Badge 
                    key={exercise.id} 
                    variant={isDone ? "default" : "outline"}
                    onClick={() => setSelectedExerciseForDetail(exercise)}
                    className={`cursor-pointer text-[10px] font-medium transition-all ${
                      isDone 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none" 
                        : "hover:bg-muted"
                    }`}
                  >
                    {exercise.name} {isDone ? "✓" : "⏳"}
                  </Badge>
                );
              })}
            </div>
          </Card>
        );
      })()}

      {/* Rest Timer Card */}
      <Card className="border border-border shadow-xs p-4 bg-muted/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Rest Timer
              </p>
              <p className="text-2xl font-bold font-mono leading-none text-foreground mt-0.5">
                {timeRemaining > 0
                  ? `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, "0")}`
                  : "0:00"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isTimerActive) {
                  pauseTimer();
                } else {
                  startTimer(timeRemaining > 0 ? timeRemaining : duration);
                }
              }}
              className="h-8 px-3 text-xs font-semibold"
            >
              {isTimerActive ? (
                <>
                  <Pause className="h-3.5 w-3.5 mr-1" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 mr-1 fill-current" /> Start
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustTime(30)}
              className="h-8 px-2.5 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> +30s
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetTimer}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Reset Timer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Exercise Cards */}
      <div className="space-y-6">
        {groupedExercises.length > 0 ? (
          groupedExercises.map(({ exercise, entries }) => {
            const templateExercise = templateExercises.find((te) => te.exerciseId === exercise.id);
            const prog = progressions[exercise.id];
            const lastWeight = prog?.lastWeight ?? lastWeights[exercise.id] ?? 0;
            const lastReps = prog?.lastReps ?? 0;
            const suggestedWeight = prog?.suggestedWeight ?? 0;

            return (
              <Card key={exercise.id} className="border border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20 border-b border-border/30 rounded-t-xl">
                  <div>
                    <CardTitle 
                      className="text-base font-semibold cursor-pointer hover:underline hover:text-primary transition-colors"
                      onClick={() => setSelectedExerciseForDetail(exercise)}
                    >
                      {exercise.name}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {exercise.primaryMuscleGroup}
                      </span>
                      {templateExercise && (
                        <>
                          <span className="text-xs text-muted-foreground/60">•</span>
                          <Badge variant="secondary" className="h-4 px-1.5 text-[9.5px] font-semibold bg-secondary/80 text-secondary-foreground border-none">
                            Target: {templateExercise.targetSets} sets x {templateExercise.targetReps} reps
                          </Badge>
                        </>
                      )}
                      {lastWeight > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground/60">•</span>
                          <Badge variant="outline" className="h-4 px-1.5 text-[9.5px] font-semibold border-primary/30 text-primary bg-primary/5">
                            Last: {lastWeight} kg {lastReps > 0 && `x ${lastReps}`}
                          </Badge>
                        </>
                      )}
                      {suggestedWeight > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground/60">•</span>
                          <Badge variant="outline" className="h-4 px-1.5 text-[9.5px] font-semibold border-emerald-500/30 text-emerald-600 bg-emerald-500/5 dark:text-emerald-400">
                            Suggested: {suggestedWeight} kg
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSet(exercise.id, entries.length)}
                    className="h-8 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Set
                  </Button>
                </CardHeader>
                <CardContent className="p-3">
                {/* Sets List Table */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-center text-xs font-semibold text-muted-foreground pb-1 border-b border-border/20 px-2">
                    <div className="col-span-2 text-left pl-2">Set</div>
                    <div className="col-span-4">Weight (kg)</div>
                    <div className="col-span-4">Reps</div>
                    <div className="col-span-1">Check</div>
                    <div className="col-span-1"></div>
                  </div>

                  {entries.map((entry, idx) => {
                    let label = "";
                    if (entry.setType === "warmup") {
                      label = "W";
                    } else {
                      const workingIndex = entries
                        .slice(0, idx)
                        .filter((e) => e.setType !== "warmup").length + 1;
                      label = workingIndex.toString();
                    }
                    return (
                      <SetInputRow
                        key={entry.id}
                        entry={entry}
                        label={label}
                        onUpdate={handleUpdateSet}
                        onDelete={handleDeleteSet}
                        lastWeight={lastWeight}
                        suggestedWeight={suggestedWeight}
                      />
                    );
                  })}
                </div>

                {/* Exercise Notes */}
                <div className="mt-3 pt-3 border-t border-border/20 px-2 space-y-1">
                  <Label htmlFor={`exercise-note-${exercise.id}`} className="text-xs font-semibold text-muted-foreground">Exercise Notes</Label>
                  <Input
                    id={`exercise-note-${exercise.id}`}
                    value={exerciseNotesMap[exercise.id] ?? ""}
                    onChange={(e) => handleExerciseNoteChange(exercise.id, e.target.value)}
                    onBlur={() => handleExerciseNoteBlur(exercise.id, entries[0])}
                    placeholder="E.g. seat height, warm-up notes, or range of motion feel..."
                    className="h-8 text-xs bg-background border-border"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Dumbbell className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              Empty Workout Session
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              Add exercises to your active training log to track your sets.
            </p>
            <Button
              variant="outline"
              className="mt-4 text-xs h-9"
              onClick={() => setIsAddExerciseOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Add Exercise</span>
            </Button>
          </div>
        )}
      </div>

      {/* Floating Bottom Button (only if there are exercises) */}
      {groupedExercises.length > 0 && (
        <div className="flex justify-center">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full shadow-md border-border bg-background hover:bg-muted"
            onClick={() => setIsAddExerciseOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Add Exercise</span>
          </Button>
        </div>
      )}

      {/* Rest Timer overlay bar */}
      <RestTimer
        timeRemaining={timeRemaining}
        duration={duration}
        isActive={isTimerActive}
        onAdjustTime={adjustTime}
        onSkip={resetTimer}
      />

      {/* Add Exercise Modal */}
      {isAddExerciseOpen && (
        <AddExerciseDialog
          open={isAddExerciseOpen}
          onOpenChange={setIsAddExerciseOpen}
          exercises={availableExercises}
          onSelectExercise={handleAddExercise}
        />
      )}

      {/* Finish Workout Dialog */}
      <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Finish Workout Session</DialogTitle>
            <DialogDescription>
              Any incomplete sets will be automatically removed from the log.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="finishName">Workout Name</Label>
              <Input
                id="finishName"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g. Afternoon Upper Body"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="finishNotes">Workout Notes</Label>
              <Textarea
                id="finishNotes"
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="How did the session feel? Notes about progress..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsFinishDialogOpen(false)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button onClick={handleFinishWorkout} disabled={isSubmitting}>
              {isSubmitting ? "Finishing..." : "Save Workout Log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Workout Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Discard Workout Session?</DialogTitle>
            <DialogDescription>
              Are you sure you want to discard this active workout? This will delete all sets and progress logged during this session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={isSubmitting}
            >
              Resume
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelWorkout}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Discarding..." : "Yes, Discard Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExerciseDetailDrawer
        exercise={selectedExerciseForDetail}
        open={selectedExerciseForDetail !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedExerciseForDetail(null);
        }}
        activeWorkoutId={workout.id}
      />
    </div>
  );
}
