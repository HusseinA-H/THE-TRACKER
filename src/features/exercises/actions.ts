"use server";

import { revalidatePath } from "next/cache";
import {
  createExercise,
  updateExercise,
  deleteExercise,
} from "./services/exercise-service";
import { exerciseFormSchema } from "./schemas";
import type { ActionResult } from "@/lib/utils";
import type { Exercise, CreateExerciseInput, UpdateExerciseInput } from "./types";
import { routes } from "@/config/routes";

export async function createExerciseAction(
  input: CreateExerciseInput
): Promise<ActionResult<Exercise>> {
  try {
    // Validate inputs
    const validated = exerciseFormSchema.parse(input);

    const result = await createExercise(validated);

    revalidatePath(routes.exercises);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error creating exercise:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred.",
    };
  }
}

export async function updateExerciseAction(
  input: UpdateExerciseInput
): Promise<ActionResult<Exercise>> {
  try {
    const validated = exerciseFormSchema.parse(input);

    const result = await updateExercise({
      id: input.id,
      ...validated,
    });

    revalidatePath(routes.exercises);
    revalidatePath(routes.workouts); // Workouts page references exercises
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error updating exercise:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred.",
    };
  }
}

export async function deleteExerciseAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    await deleteExercise(id);
    revalidatePath(routes.exercises);
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error deleting exercise:", error);
    return {
      success: false,
      error:
        error.message ||
        "Could not delete exercise. It might be referenced by logged workouts.",
    };
  }
}

import {
  getAlternativesForExercise,
  setAlternativesForExercise,
} from "./services/exercise-alternatives-service";
import type { ExerciseAlternative } from "@/types";

export async function getAlternativesForExerciseAction(
  exerciseId: string
): Promise<ActionResult<ExerciseAlternative[]>> {
  try {
    const result = await getAlternativesForExercise(exerciseId);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error getting alternatives:", error);
    return { success: false, error: error.message || "Failed to fetch alternatives" };
  }
}

export async function setAlternativesAction(
  exerciseId: string,
  alternativeIds: string[]
): Promise<ActionResult<void>> {
  try {
    await setAlternativesForExercise(exerciseId, alternativeIds);
    revalidatePath(routes.exercises);
    revalidatePath("/administration/exercises");
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error setting alternatives:", error);
    return { success: false, error: error.message || "Failed to save alternatives" };
  }
}
