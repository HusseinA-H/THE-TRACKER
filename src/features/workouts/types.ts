import type { Workout, WorkoutEntry, WorkoutTemplate, WorkoutTemplateExercise, WorkoutPackage } from "@/types";

export type { Workout, WorkoutEntry, WorkoutTemplate, WorkoutTemplateExercise, WorkoutPackage };

export interface CreateWorkoutInput {
  name?: string;
  notes?: string | null;
  startedAt?: string;
  templateId?: string | null;
}

export interface LogSetInput {
  workoutId: string;
  exerciseId: string;
  setNumber: number;
  weight?: number;
  reps?: number;
  notes?: string | null;
  setType?: "warmup" | "working" | "top" | "failure";
}

export interface UpdateSetInput {
  id: string;
  weight?: number;
  reps?: number;
  isCompleted?: boolean;
  notes?: string | null;
  setType?: "warmup" | "working" | "top" | "failure";
}

