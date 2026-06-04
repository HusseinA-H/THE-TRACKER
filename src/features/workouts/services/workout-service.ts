import { createClient } from "@/lib/supabase/server";
import { mapExerciseRow } from "@/features/exercises/services/exercise-service";
import { calculate1RM } from "@/lib/utils";
import type { WorkoutRow, WorkoutEntryRow, ExerciseRow } from "@/types/database.types";
import type { Workout, WorkoutEntry, LogSetInput, UpdateSetInput, WorkoutTemplate, WorkoutTemplateExercise, WorkoutPackage } from "../types";

export function mapWorkoutEntryRow(
  row: any
): WorkoutEntry {
  return {
    id: row.id,
    workoutId: row.workout_id,
    exerciseId: row.exercise_id,
    setNumber: row.set_number,
    weight: Number(row.weight),
    reps: row.reps,
    isCompleted: row.is_completed,
    isPr: row.is_pr,
    estimated1rm: row.estimated_1rm ? Number(row.estimated_1rm) : null,
    notes: row.notes,
    createdAt: row.created_at,
    setType: (row.set_type as any) || "working",
    exercise: row.exercise ? mapExerciseRow(row.exercise) : undefined,
    workoutCompletedAt: row.workouts ? row.workouts.completed_at : (row.workout ? row.workout.completed_at : undefined),
    workoutName: row.workouts ? row.workouts.name : (row.workout ? row.workout.name : undefined),
  };
}

export function mapWorkoutRow(
  row: any
): Workout {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    notes: row.notes,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    templateId: row.template_id,
    entries: row.workout_entries
      ? row.workout_entries.map(mapWorkoutEntryRow)
      : [],
  };
}

export function mapWorkoutTemplateExerciseRow(row: any): WorkoutTemplateExercise {
  return {
    id: row.id,
    templateId: row.template_id,
    exerciseId: row.exercise_id,
    sequenceNumber: row.sequence_number,
    targetSets: row.target_sets,
    targetReps: row.target_reps,
    warmupSets: row.warmup_sets,
    workingSets: row.working_sets,
    createdAt: row.created_at,
    exercise: row.exercise ? mapExerciseRow(row.exercise) : undefined,
  };
}

export function mapWorkoutTemplateRow(row: any): WorkoutTemplate {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    estimatedDuration: row.estimated_duration,
    muscleFocus: row.muscle_focus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    templateExercises: row.workout_template_exercises
      ? row.workout_template_exercises.map(mapWorkoutTemplateExerciseRow)
      : [],
  };
}

export async function getWorkoutTemplates(): Promise<WorkoutTemplate[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("workout_templates")
    .select(`
      *,
      workout_template_exercises(
        *,
        exercise:exercises(*)
      )
    `)
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching templates:", error);
    throw new Error(error.message);
  }

  const templates = (data || []).map(mapWorkoutTemplateRow);
  templates.forEach((t) => {
    t.templateExercises?.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  });

  return templates;
}

export async function startWorkoutFromTemplate(templateId: string): Promise<Workout> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if there is already an active workout
  const active = await getActiveWorkout();
  if (active) return active;

  // Fetch template and its exercises
  const { data: template, error: tempError } = await supabase
    .from("workout_templates")
    .select(`
      *,
      workout_template_exercises(
        *
      )
    `)
    .eq("id", templateId)
    .single();

  if (tempError || !template) {
    throw new Error("Workout template not found.");
  }

  // Create the new active workout
  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .insert({
      user_id: user.id,
      name: template.name,
      notes: null,
      started_at: new Date().toISOString(),
      completed_at: null,
      template_id: template.id,
    })
    .select()
    .single();

  if (workoutError) {
    throw new Error("Could not start workout session.");
  }

  // Pre-populate entries for each template exercise
  const tempExercises = template.workout_template_exercises || [];
  tempExercises.sort((a: any, b: any) => a.sequence_number - b.sequence_number);

  const entriesToInsert: any[] = [];
  
  tempExercises.forEach((tempEx: any) => {
    let setNumber = 1;
    // Pre-populate warmup sets
    for (let i = 0; i < tempEx.warmup_sets; i++) {
      entriesToInsert.push({
        workout_id: workout.id,
        exercise_id: tempEx.exercise_id,
        set_number: setNumber++,
        weight: 0,
        reps: 0,
        set_type: "warmup",
        is_completed: false,
        is_pr: false,
      });
    }
    // Pre-populate working sets
    for (let i = 0; i < tempEx.working_sets; i++) {
      entriesToInsert.push({
        workout_id: workout.id,
        exercise_id: tempEx.exercise_id,
        set_number: setNumber++,
        weight: 0,
        reps: 0,
        set_type: "working",
        is_completed: false,
        is_pr: false,
      });
    }
  });

  if (entriesToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("workout_entries")
      .insert(entriesToInsert);
      
    if (insertError) {
      console.error("Error pre-populating template exercises:", insertError);
    }
  }

  // Fetch fully hydrated workout with prepopulated sets
  const hydratedWorkout = await getWorkoutById(workout.id);
  if (!hydratedWorkout) throw new Error("Failed to load initialized workout.");
  return hydratedWorkout;
}

export async function getWorkoutHistory(): Promise<Workout[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("workouts")
    .select(`
      *,
      workout_entries(
        *,
        exercise:exercises(*)
      )
    `)
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Error fetching workout history:", error);
    throw new Error(error.message);
  }

  return (data || []).map(mapWorkoutRow);
}

export async function getWorkoutById(id: string): Promise<Workout | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("workouts")
    .select(`
      *,
      workout_entries(
        *,
        exercise:exercises(*)
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching workout by ID:", error);
    throw new Error(error.message);
  }

  return data ? mapWorkoutRow(data) : null;
}

export async function getActiveWorkout(): Promise<Workout | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("workouts")
    .select(`
      *,
      workout_entries(
        *,
        exercise:exercises(*)
      )
    `)
    .eq("user_id", user.id)
    .is("completed_at", null)
    .order("started_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error checking active workout:", error);
    return null;
  }

  if (!data || data.length === 0) return null;

  const workout = mapWorkoutRow(data[0]);
  if (workout.entries) {
    workout.entries.sort((a, b) => {
      if (a.exerciseId === b.exerciseId) {
        return a.setNumber - b.setNumber;
      }
      return a.createdAt.localeCompare(b.createdAt);
    });
  }

  return workout;
}

export async function startWorkout(name?: string): Promise<Workout> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if there is already an active workout
  const active = await getActiveWorkout();
  if (active) return active;

  const { data, error } = await supabase
    .from("workouts")
    .insert({
      user_id: user.id,
      name: name || `Workout on ${new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}`,
      notes: null,
      started_at: new Date().toISOString(),
      completed_at: null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error starting workout:", error);
    throw new Error(error.message);
  }

  return mapWorkoutRow(data);
}

export async function createWorkoutEntry(input: LogSetInput): Promise<WorkoutEntry> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("workout_entries")
    .insert({
      workout_id: input.workoutId,
      exercise_id: input.exerciseId,
      set_number: input.setNumber,
      weight: input.weight || 0,
      reps: input.reps || 0,
      notes: input.notes || null,
      is_completed: false,
      is_pr: false,
      set_type: input.setType || "working",
    })
    .select(`
      *,
      exercise:exercises(*)
    `)
    .single();

  if (error) {
    console.error("Error logging workout entry:", error);
    throw new Error(error.message);
  }

  return mapWorkoutEntryRow(data);
}

async function checkAndLogPRs(
  supabase: any,
  userId: string,
  exerciseId: string,
  entryId: string,
  weight: number,
  reps: number
): Promise<{ isPr: boolean; prTypes: ("weight" | "volume" | "estimated_1rm")[] }> {
  const volume = weight * reps;
  const estimated1rm = calculate1RM(weight, reps);
  
  if (weight <= 0 || reps <= 0) {
    return { isPr: false, prTypes: [] };
  }

  // Fetch current PR
  const { data: prRecord, error: prError } = await supabase
    .from("personal_records")
    .select("*")
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId)
    .maybeSingle();

  if (prError) {
    console.error("Error fetching personal records:", prError);
  }

  const prTypes: ("weight" | "volume" | "estimated_1rm")[] = [];

  if (!prRecord) {
    // Brand new exercise completed - everything is a PR
    prTypes.push("weight", "volume", "estimated_1rm");

    // Insert new personal record
    await supabase.from("personal_records").insert({
      user_id: userId,
      exercise_id: exerciseId,
      max_weight: weight,
      max_estimated_1rm: estimated1rm,
      max_volume: volume,
      set_id: entryId,
      volume_set_id: entryId,
      updated_at: new Date().toISOString(),
    });

    // Insert history rows
    await supabase.from("personal_records_history").insert([
      { user_id: userId, exercise_id: exerciseId, workout_entry_id: entryId, pr_type: "weight", value: weight },
      { user_id: userId, exercise_id: exerciseId, workout_entry_id: entryId, pr_type: "volume", value: volume },
      { user_id: userId, exercise_id: exerciseId, workout_entry_id: entryId, pr_type: "estimated_1rm", value: estimated1rm },
    ]);

    return { isPr: true, prTypes };
  }

  // Compare and identify new PRs
  const isWeightPR = weight > Number(prRecord.max_weight);
  const isVolumePR = volume > Number(prRecord.max_volume);
  const is1RMPR = estimated1rm > Number(prRecord.max_estimated_1rm);

  const updates: any = {};
  const historyInserts: any[] = [];

  if (isWeightPR) {
    prTypes.push("weight");
    updates.max_weight = weight;
    updates.set_id = entryId;
    historyInserts.push({ user_id: userId, exercise_id: exerciseId, workout_entry_id: entryId, pr_type: "weight", value: weight });
  }
  if (isVolumePR) {
    prTypes.push("volume");
    updates.max_volume = volume;
    updates.volume_set_id = entryId;
    historyInserts.push({ user_id: userId, exercise_id: exerciseId, workout_entry_id: entryId, pr_type: "volume", value: volume });
  }
  if (is1RMPR) {
    prTypes.push("estimated_1rm");
    updates.max_estimated_1rm = estimated1rm;
    historyInserts.push({ user_id: userId, exercise_id: exerciseId, workout_entry_id: entryId, pr_type: "estimated_1rm", value: estimated1rm });
  }

  if (prTypes.length > 0) {
    updates.updated_at = new Date().toISOString();
    
    // Fill in other update fields to preserve all-time maxes
    updates.max_weight = Math.max(weight, Number(prRecord.max_weight));
    updates.max_volume = Math.max(volume, Number(prRecord.max_volume));
    updates.max_estimated_1rm = Math.max(estimated1rm, Number(prRecord.max_estimated_1rm));

    await supabase
      .from("personal_records")
      .update(updates)
      .eq("id", prRecord.id);

    await supabase
      .from("personal_records_history")
      .insert(historyInserts);
  }

  return { isPr: prTypes.length > 0, prTypes };
}

export async function updateWorkoutEntry(input: UpdateSetInput): Promise<WorkoutEntry> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Fetch current set details to calculate 1RM if needed
  const { data: currentSet, error: fetchError } = await supabase
    .from("workout_entries")
    .select("workout_id, exercise_id, weight, reps, is_completed, is_pr")
    .eq("id", input.id)
    .single();

  if (fetchError || !currentSet) {
    throw new Error("Set not found");
  }

  const weight = input.weight !== undefined ? input.weight : Number(currentSet.weight);
  const reps = input.reps !== undefined ? input.reps : currentSet.reps;
  const isCompleted = input.isCompleted !== undefined ? input.isCompleted : currentSet.is_completed;
  
  const estimated1rm = calculate1RM(weight, reps);

  let isPr = false;

  // Evaluate PRs on completed sets with positive weights/reps
  if (isCompleted && weight > 0 && reps > 0) {
    const prResult = await checkAndLogPRs(supabase, user.id, currentSet.exercise_id, input.id, weight, reps);
    isPr = prResult.isPr;
  }

  const { data, error } = await supabase
    .from("workout_entries")
    .update({
      weight,
      reps,
      notes: input.notes !== undefined ? input.notes : undefined,
      is_completed: isCompleted,
      is_pr: isPr,
      estimated_1rm: estimated1rm > 0 ? estimated1rm : null,
      set_type: input.setType !== undefined ? input.setType : undefined,
    })
    .eq("id", input.id)
    .select(`
      *,
      exercise:exercises(*)
    `)
    .single();

  if (error) {
    console.error("Error updating set:", error);
    throw new Error(error.message);
  }

  return mapWorkoutEntryRow(data);
}

export async function deleteWorkoutEntry(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("workout_entries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting set:", error);
    throw new Error(error.message);
  }
}

export async function completeWorkout(
  id: string,
  name: string,
  notes?: string | null
): Promise<Workout> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Delete incomplete sets
  await supabase
    .from("workout_entries")
    .delete()
    .eq("workout_id", id)
    .eq("is_completed", false);

  // Complete the workout
  const { data, error } = await supabase
    .from("workouts")
    .update({
      name,
      notes: notes || null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(`
      *,
      workout_entries(
        *,
        exercise:exercises(*)
      )
    `)
    .single();

  if (error) {
    console.error("Error completing workout:", error);
    throw new Error(error.message);
  }

  return mapWorkoutRow(data);
}

export async function deleteWorkout(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting workout:", error);
    throw new Error(error.message);
  }
}

export async function updateWorkout(
  id: string,
  updates: { name?: string; notes?: string | null }
): Promise<Workout> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("workouts")
    .update({
      name: updates.name,
      notes: updates.notes,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select(`
      *,
      workout_entries(
        *,
        exercise:exercises(*)
      )
    `)
    .single();

  if (error) {
    console.error("Error updating workout:", error);
    throw new Error(error.message);
  }

  return mapWorkoutRow(data);
}

export async function getWorkoutTemplateExercises(templateId: string): Promise<WorkoutTemplateExercise[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_template_exercises")
    .select(`
      *,
      exercise:exercises(*)
    `)
    .eq("template_id", templateId)
    .order("sequence_number", { ascending: true });

  if (error) {
    console.error("Error fetching template exercises:", error);
    return [];
  }

  return (data || []).map(mapWorkoutTemplateExerciseRow);
}

export async function createWorkoutTemplate(
  name: string,
  description: string | null,
  estimatedDuration: number,
  muscleFocus: string
): Promise<WorkoutTemplate> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_templates")
    .insert({
      name,
      description,
      estimated_duration: estimatedDuration,
      muscle_focus: muscleFocus,
      user_id: null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapWorkoutTemplateRow(data);
}

export async function updateWorkoutTemplate(
  id: string,
  updates: {
    name?: string;
    description?: string | null;
    estimatedDuration?: number;
    muscleFocus?: string;
  }
): Promise<WorkoutTemplate> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_templates")
    .update({
      name: updates.name,
      description: updates.description,
      estimated_duration: updates.estimatedDuration,
      muscle_focus: updates.muscleFocus,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapWorkoutTemplateRow(data);
}

export async function deleteWorkoutTemplate(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_templates")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function addTemplateExercise(
  templateId: string,
  exerciseId: string,
  sequenceNumber: number,
  targetSets: number,
  targetReps: string,
  warmupSets: number,
  workingSets: number
): Promise<WorkoutTemplateExercise> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_template_exercises")
    .insert({
      template_id: templateId,
      exercise_id: exerciseId,
      sequence_number: sequenceNumber,
      target_sets: targetSets,
      target_reps: targetReps,
      warmup_sets: warmupSets,
      working_sets: workingSets,
    })
    .select(`
      *,
      exercise:exercises(*)
    `)
    .single();

  if (error) throw new Error(error.message);
  return mapWorkoutTemplateExerciseRow(data);
}

export async function updateTemplateExercise(
  id: string,
  updates: {
    targetSets?: number;
    targetReps?: string;
    warmupSets?: number;
    workingSets?: number;
    sequenceNumber?: number;
  }
): Promise<WorkoutTemplateExercise> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_template_exercises")
    .update({
      target_sets: updates.targetSets,
      target_reps: updates.targetReps,
      warmup_sets: updates.warmupSets,
      working_sets: updates.workingSets,
      sequence_number: updates.sequenceNumber,
    })
    .eq("id", id)
    .select(`
      *,
      exercise:exercises(*)
    `)
    .single();

  if (error) throw new Error(error.message);
  return mapWorkoutTemplateExerciseRow(data);
}

export async function deleteTemplateExercise(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_template_exercises")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function getLastWeightsForExercises(exerciseIds: string[]): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (exerciseIds.length === 0) return {};

  const { data, error } = await supabase
    .from("workout_entries")
    .select(`
      exercise_id,
      weight,
      workouts!inner(user_id, completed_at)
    `)
    .eq("workouts.user_id", user.id)
    .not("workouts.completed_at", "is", null)
    .in("exercise_id", exerciseIds)
    .eq("is_completed", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching last weights:", error);
    return {};
  }

  const lastWeights: Record<string, number> = {};
  for (const entry of (data || [])) {
    if (lastWeights[entry.exercise_id] === undefined) {
      lastWeights[entry.exercise_id] = Number(entry.weight);
    }
  }

  return lastWeights;
}

export async function getWorkoutPackages(): Promise<WorkoutPackage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_packages")
    .select(`
      *,
      workout_package_templates(
        template:workout_templates(
          *,
          workout_template_exercises(
            *,
            exercise:exercises(*)
          )
        )
      )
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching packages:", error);
    throw new Error(error.message);
  }

  return (data || []).map((pkg: any) => {
    const templates = (pkg.workout_package_templates || [])
      .map((pt: any) => pt.template ? mapWorkoutTemplateRow(pt.template) : null)
      .filter((t: any): t is WorkoutTemplate => t !== null);

    templates.forEach((t: WorkoutTemplate) => {
      t.templateExercises?.sort((a: WorkoutTemplateExercise, b: WorkoutTemplateExercise) => a.sequenceNumber - b.sequenceNumber);
    });

    return {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      createdAt: pkg.created_at,
      updatedAt: pkg.updated_at,
      templates,
    };
  });
}

export async function createWorkoutPackage(name: string, description: string | null): Promise<WorkoutPackage> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_packages")
    .insert({ name, description })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    templates: [],
  };
}

export async function updateWorkoutPackage(id: string, updates: { name?: string; description?: string | null }): Promise<WorkoutPackage> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_packages")
    .update({
      name: updates.name,
      description: updates.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    templates: [],
  };
}

export async function deleteWorkoutPackage(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_packages")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function addTemplateToPackage(packageId: string, templateId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_package_templates")
    .insert({ package_id: packageId, template_id: templateId });

  if (error) throw new Error(error.message);
}

export async function removeTemplateFromPackage(packageId: string, templateId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_package_templates")
    .delete()
    .eq("package_id", packageId)
    .eq("template_id", templateId);

  if (error) throw new Error(error.message);
}

export async function getExerciseHistory(
  exerciseId: string,
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<{ history: WorkoutEntry[]; totalCount: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const offset = (page - 1) * limit;

  // Search filter on set notes or workout name
  let query = supabase
    .from("workout_entries")
    .select(`
      *,
      workouts!inner(*)
    `, { count: "exact" })
    .eq("exercise_id", exerciseId)
    .eq("workouts.user_id", user.id)
    .not("workouts.completed_at", "is", null)
    .eq("is_completed", true);

  if (search.trim() !== "") {
    query = query.or(`notes.ilike.%${search}%,workouts.name.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { foreignTable: "workouts", ascending: false })
    .order("set_number", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching exercise history:", error);
    throw new Error(error.message);
  }

  const history = (data || []).map((row: any) => {
    // Map manual workouts/workouts structure because of inner join select naming
    const mapped = mapWorkoutEntryRow(row);
    if (row.workouts) {
      mapped.workoutCompletedAt = row.workouts.completed_at;
      mapped.workoutName = row.workouts.name;
    }
    return mapped;
  });
  return { history, totalCount: count || 0 };
}

export async function getExerciseProgression(
  exerciseId: string,
  targetRepsRange: string = "10"
): Promise<{ lastWeight: number | null; lastReps: number | null; suggestedWeight: number | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Fetch the user's workouts to find the most recent session with this exercise completed
  const { data: lastWorkoutData, error: workoutError } = await supabase
    .from("workouts")
    .select(`
      id,
      completed_at,
      workout_entries(
        weight,
        reps,
        is_completed,
        exercise_id
      )
    `)
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (workoutError) {
    console.error("Error fetching workouts for progression:", workoutError);
    return { lastWeight: null, lastReps: null, suggestedWeight: null };
  }

  const targetWorkout = (lastWorkoutData || []).find((w: any) =>
    w.workout_entries?.some((e: any) => e.exercise_id === exerciseId && e.is_completed)
  );

  if (!targetWorkout) {
    return { lastWeight: null, lastReps: null, suggestedWeight: null };
  }

  const entries = (targetWorkout.workout_entries || []).filter(
    (e: any) => e.exercise_id === exerciseId && e.is_completed
  );

  if (entries.length === 0) {
    return { lastWeight: null, lastReps: null, suggestedWeight: null };
  }

  let maxWeight = 0;
  let maxReps = 0;
  entries.forEach((e: any) => {
    const w = Number(e.weight);
    if (w > maxWeight) {
      maxWeight = w;
      maxReps = e.reps;
    } else if (w === maxWeight && e.reps > maxReps) {
      maxReps = e.reps;
    }
  });

  if (maxWeight === 0) {
    return { lastWeight: null, lastReps: null, suggestedWeight: null };
  }

  let targetRepThreshold = 10;
  const rangeMatch = targetRepsRange.match(/(\d+)\s*-\s*(\d+)/);
  const singleMatch = targetRepsRange.match(/^(\d+)$/);

  if (rangeMatch) {
    targetRepThreshold = parseInt(rangeMatch[2], 10);
  } else if (singleMatch) {
    targetRepThreshold = parseInt(singleMatch[1], 10);
  }

  let suggestedWeight = maxWeight;
  if (maxReps >= targetRepThreshold) {
    suggestedWeight += 2.5;
  }

  return {
    lastWeight: maxWeight,
    lastReps: maxReps,
    suggestedWeight,
  };
}

export async function getBulkExerciseProgressions(
  exerciseIds: string[],
  templatesMap: Record<string, string> = {}
): Promise<Record<string, { lastWeight: number; lastReps: number; suggestedWeight: number }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (exerciseIds.length === 0) return {};

  const result: Record<string, { lastWeight: number; lastReps: number; suggestedWeight: number }> = {};

  await Promise.all(
    exerciseIds.map(async (exerciseId) => {
      const targetReps = templatesMap[exerciseId] || "10-12";
      const prog = await getExerciseProgression(exerciseId, targetReps);
      if (prog.lastWeight !== null && prog.lastReps !== null && prog.suggestedWeight !== null) {
        result[exerciseId] = {
          lastWeight: prog.lastWeight,
          lastReps: prog.lastReps,
          suggestedWeight: prog.suggestedWeight,
        };
      }
    })
  );

  return result;
}

export async function swapWorkoutExercise(
  workoutId: string,
  oldExerciseId: string,
  newExerciseId: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_entries")
    .update({ exercise_id: newExerciseId })
    .eq("workout_id", workoutId)
    .eq("exercise_id", oldExerciseId);

  if (error) {
    console.error("Error swapping exercise:", error);
    throw new Error(error.message);
  }
}



