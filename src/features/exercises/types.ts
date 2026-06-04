import type { MuscleGroup } from "@/config/site";
import type { Exercise } from "@/types";

export type { Exercise };

export interface CreateExerciseInput {
  name: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroup?: MuscleGroup | null;
  description?: string | null;
  videoUrl?: string | null;
  category?: string | null;
  equipment?: string | null;
  difficulty?: string | null;
  alternativeExercise?: string | null;
  notes?: string | null;
}

export interface UpdateExerciseInput extends Partial<CreateExerciseInput> {
  id: string;
}

export interface ExerciseFilters {
  search: string;
  muscleGroup: MuscleGroup | "All";
  type: "all" | "system" | "custom";
}
