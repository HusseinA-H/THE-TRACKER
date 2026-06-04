"use server";

import { revalidatePath } from "next/cache";
import {
  startWorkout,
  createWorkoutEntry,
  updateWorkoutEntry,
  deleteWorkoutEntry,
  completeWorkout,
  deleteWorkout,
  getWorkoutTemplates,
  startWorkoutFromTemplate,
  updateWorkout,
  createWorkoutTemplate,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
  addTemplateExercise,
  updateTemplateExercise,
  deleteTemplateExercise,
  getWorkoutPackages,
  createWorkoutPackage,
  updateWorkoutPackage,
  deleteWorkoutPackage,
  addTemplateToPackage,
  removeTemplateFromPackage,
} from "./services/workout-service";
import type { ActionResult } from "@/lib/utils";
import type { Workout, WorkoutEntry, LogSetInput, UpdateSetInput, WorkoutTemplate, WorkoutTemplateExercise, WorkoutPackage } from "./types";
import { workoutCompleteSchema } from "./schemas";
import { routes } from "@/config/routes";

export async function getWorkoutTemplatesAction(): Promise<ActionResult<WorkoutTemplate[]>> {
  try {
    const result = await getWorkoutTemplates();
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error fetching templates:", error);
    return { success: false, error: error.message || "Could not fetch templates" };
  }
}

export async function startWorkoutFromTemplateAction(
  templateId: string
): Promise<ActionResult<Workout>> {
  try {
    const result = await startWorkoutFromTemplate(templateId);
    revalidatePath(routes.workouts);
    revalidatePath(routes.workoutActive);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error starting workout from template:", error);
    return { success: false, error: error.message || "Could not start workout from template" };
  }
}

export async function startWorkoutAction(): Promise<ActionResult<Workout>> {
  try {
    const result = await startWorkout();
    revalidatePath(routes.workouts);
    revalidatePath(routes.workoutActive);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error starting workout:", error);
    return { success: false, error: error.message || "Could not start workout" };
  }
}

export async function addEntryAction(input: LogSetInput): Promise<ActionResult<WorkoutEntry>> {
  try {
    const result = await createWorkoutEntry(input);
    revalidatePath(routes.workoutActive);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error adding set:", error);
    return { success: false, error: error.message || "Could not add set" };
  }
}

export async function updateEntryAction(input: UpdateSetInput): Promise<ActionResult<WorkoutEntry>> {
  try {
    const result = await updateWorkoutEntry(input);
    revalidatePath(routes.workoutActive);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error updating set:", error);
    return { success: false, error: error.message || "Could not update set" };
  }
}

export async function deleteEntryAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteWorkoutEntry(id);
    revalidatePath(routes.workoutActive);
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error deleting set:", error);
    return { success: false, error: error.message || "Could not delete set" };
  }
}

export async function completeWorkoutAction(
  id: string,
  name: string,
  notes?: string | null
): Promise<ActionResult<Workout>> {
  try {
    const validated = workoutCompleteSchema.parse({ name, notes });
    const result = await completeWorkout(id, validated.name, validated.notes);
    
    // Revalidate multiple pages because finishing a workout updates history, PRs, and dashboard
    revalidatePath(routes.workouts);
    revalidatePath(routes.workoutActive);
    revalidatePath(routes.dashboard);
    revalidatePath(routes.records);
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error completing workout:", error);
    return { success: false, error: error.message || "Could not finish workout" };
  }
}

export async function deleteWorkoutAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteWorkout(id);
    revalidatePath(routes.workouts);
    revalidatePath(routes.dashboard);
    revalidatePath(routes.records);
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error deleting workout:", error);
    return { success: false, error: error.message || "Could not delete workout" };
  }
}

export async function updateWorkoutAction(
  id: string,
  updates: { name?: string; notes?: string | null }
): Promise<ActionResult<Workout>> {
  try {
    const result = await updateWorkout(id, updates);
    revalidatePath(routes.workoutActive);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error updating workout details:", error);
    return { success: false, error: error.message || "Could not update workout details" };
  }
}

export async function createWorkoutTemplateAction(
  name: string,
  description: string | null,
  estimatedDuration: number,
  muscleFocus: string
): Promise<ActionResult<WorkoutTemplate>> {
  try {
    const result = await createWorkoutTemplate(name, description, estimatedDuration, muscleFocus);
    revalidatePath(routes.workouts);
    revalidatePath("/administration/templates");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error creating template:", error);
    return { success: false, error: error.message || "Could not create template" };
  }
}

export async function updateWorkoutTemplateAction(
  id: string,
  updates: {
    name?: string;
    description?: string | null;
    estimatedDuration?: number;
    muscleFocus?: string;
  }
): Promise<ActionResult<WorkoutTemplate>> {
  try {
    const result = await updateWorkoutTemplate(id, updates);
    revalidatePath(routes.workouts);
    revalidatePath("/administration/templates");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error updating template:", error);
    return { success: false, error: error.message || "Could not update template" };
  }
}

export async function deleteWorkoutTemplateAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteWorkoutTemplate(id);
    revalidatePath(routes.workouts);
    revalidatePath("/administration/templates");
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error deleting template:", error);
    return { success: false, error: error.message || "Could not delete template" };
  }
}

export async function addTemplateExerciseAction(
  templateId: string,
  exerciseId: string,
  sequenceNumber: number,
  targetSets: number,
  targetReps: string,
  warmupSets: number,
  workingSets: number
): Promise<ActionResult<WorkoutTemplateExercise>> {
  try {
    const result = await addTemplateExercise(templateId, exerciseId, sequenceNumber, targetSets, targetReps, warmupSets, workingSets);
    revalidatePath("/administration/templates");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error adding template exercise:", error);
    return { success: false, error: error.message || "Could not add template exercise" };
  }
}

export async function updateTemplateExerciseAction(
  id: string,
  updates: {
    targetSets?: number;
    targetReps?: string;
    warmupSets?: number;
    workingSets?: number;
    sequenceNumber?: number;
  }
): Promise<ActionResult<WorkoutTemplateExercise>> {
  try {
    const result = await updateTemplateExercise(id, updates);
    revalidatePath("/administration/templates");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error updating template exercise:", error);
    return { success: false, error: error.message || "Could not update template exercise" };
  }
}

export async function deleteTemplateExerciseAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteTemplateExercise(id);
    revalidatePath("/administration/templates");
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error deleting template exercise:", error);
    return { success: false, error: error.message || "Could not delete template exercise" };
  }
}

export async function getWorkoutPackagesAction(): Promise<ActionResult<WorkoutPackage[]>> {
  try {
    const result = await getWorkoutPackages();
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error fetching packages:", error);
    return { success: false, error: error.message || "Could not fetch packages" };
  }
}

export async function createWorkoutPackageAction(
  name: string,
  description: string | null
): Promise<ActionResult<WorkoutPackage>> {
  try {
    const result = await createWorkoutPackage(name, description);
    revalidatePath(routes.workouts);
    revalidatePath("/administration/packages");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error creating package:", error);
    return { success: false, error: error.message || "Could not create package" };
  }
}

export async function updateWorkoutPackageAction(
  id: string,
  updates: { name?: string; description?: string | null }
): Promise<ActionResult<WorkoutPackage>> {
  try {
    const result = await updateWorkoutPackage(id, updates);
    revalidatePath(routes.workouts);
    revalidatePath("/administration/packages");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error updating package:", error);
    return { success: false, error: error.message || "Could not update package" };
  }
}

export async function deleteWorkoutPackageAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteWorkoutPackage(id);
    revalidatePath(routes.workouts);
    revalidatePath("/administration/packages");
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error deleting package:", error);
    return { success: false, error: error.message || "Could not delete package" };
  }
}

export async function addTemplateToPackageAction(
  packageId: string,
  templateId: string
): Promise<ActionResult<void>> {
  try {
    await addTemplateToPackage(packageId, templateId);
    revalidatePath(routes.workouts);
    revalidatePath("/administration/packages");
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error adding template to package:", error);
    return { success: false, error: error.message || "Could not add template to package" };
  }
}

export async function removeTemplateFromPackageAction(
  packageId: string,
  templateId: string
): Promise<ActionResult<void>> {
  try {
    await removeTemplateFromPackage(packageId, templateId);
    revalidatePath(routes.workouts);
    revalidatePath("/administration/packages");
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error removing template from package:", error);
    return { success: false, error: error.message || "Could not remove template from package" };
  }
}

import {
  getExerciseHistory,
  getExerciseProgression,
  getBulkExerciseProgressions,
} from "./services/workout-service";

export async function getExerciseHistoryAction(
  exerciseId: string,
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<ActionResult<{ history: WorkoutEntry[]; totalCount: number }>> {
  try {
    const result = await getExerciseHistory(exerciseId, page, limit, search);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error fetching exercise history:", error);
    return { success: false, error: error.message || "Could not fetch exercise history" };
  }
}

export async function getExerciseProgressionAction(
  exerciseId: string,
  targetRepsRange: string = "10"
): Promise<ActionResult<{ lastWeight: number | null; lastReps: number | null; suggestedWeight: number | null }>> {
  try {
    const result = await getExerciseProgression(exerciseId, targetRepsRange);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error fetching progression:", error);
    return { success: false, error: error.message || "Could not fetch progression suggestion" };
  }
}

export async function getBulkExerciseProgressionsAction(
  exerciseIds: string[],
  templatesMap: Record<string, string> = {}
): Promise<ActionResult<Record<string, { lastWeight: number; lastReps: number; suggestedWeight: number }>>> {
  try {
    const result = await getBulkExerciseProgressions(exerciseIds, templatesMap);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error fetching bulk progressions:", error);
    return { success: false, error: error.message || "Could not fetch bulk progressions" };
  }
}

import {
  getScheduleSettings,
  updateScheduleSettings,
  getCalendarDaysForMonth,
  getStreakStats,
  type CalendarDayInfo,
} from "./services/schedule-service";
import type { UserScheduleSettings } from "@/types";

export async function getScheduleSettingsAction(): Promise<ActionResult<UserScheduleSettings>> {
  try {
    const result = await getScheduleSettings();
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error fetching schedule settings:", error);
    return { success: false, error: error.message || "Could not fetch schedule settings" };
  }
}

export async function updateScheduleSettingsAction(
  cycleStartDate: string
): Promise<ActionResult<UserScheduleSettings>> {
  try {
    const result = await updateScheduleSettings(cycleStartDate);
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/calendar");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error updating schedule settings:", error);
    return { success: false, error: error.message || "Could not update schedule settings" };
  }
}

export async function getCalendarDaysForMonthAction(
  year: number,
  month: number
): Promise<ActionResult<CalendarDayInfo[]>> {
  try {
    const result = await getCalendarDaysForMonth(year, month);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error fetching calendar days:", error);
    return { success: false, error: error.message || "Could not fetch calendar days" };
  }
}

export async function getStreakStatsAction(): Promise<ActionResult<{ currentStreak: number; longestStreak: number }>> {
  try {
    const result = await getStreakStats();
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error fetching streaks:", error);
    return { success: false, error: error.message || "Could not fetch streak statistics" };
  }
}

import { swapWorkoutExercise } from "./services/workout-service";

export async function swapWorkoutExerciseAction(
  workoutId: string,
  oldExerciseId: string,
  newExerciseId: string
): Promise<ActionResult<void>> {
  try {
    await swapWorkoutExercise(workoutId, oldExerciseId, newExerciseId);
    revalidatePath(routes.workoutActive);
    revalidatePath(routes.workouts);
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error swapping exercise:", error);
    return { success: false, error: error.message || "Failed to swap exercise" };
  }
}



