import { createClient } from "@/lib/supabase/server";
import type { ExerciseRow } from "@/types/database.types";
import type { Exercise, CreateExerciseInput, UpdateExerciseInput } from "../types";
import type { MuscleGroup } from "@/config/site";

export function mapExerciseRow(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    primaryMuscleGroup: row.primary_muscle_group as MuscleGroup,
    secondaryMuscleGroup: row.secondary_muscle_group as MuscleGroup | null,
    description: row.description,
    videoUrl: row.video_url,
    isCustom: row.is_custom,
    category: row.category,
    equipment: row.equipment,
    difficulty: row.difficulty,
    alternativeExercise: row.alternative_exercise,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function getExercises(): Promise<Exercise[]> {
  const supabase = await createClient();
  
  // Get currently logged-in user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Fetch system exercises (user_id is null) AND user's custom exercises (user_id = user.id)
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching exercises:", error);
    throw new Error(error.message);
  }

  return (data || []).map(mapExerciseRow);
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    console.error("Error fetching exercise by ID:", error);
    throw new Error(error.message);
  }

  return data ? mapExerciseRow(data) : null;
}

export async function createExercise(input: CreateExerciseInput): Promise<Exercise> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      user_id: user.id,
      name: input.name,
      primary_muscle_group: input.primaryMuscleGroup,
      secondary_muscle_group: input.secondaryMuscleGroup || null,
      description: input.description || null,
      video_url: input.videoUrl || null,
      is_custom: true,
      category: input.category || null,
      equipment: input.equipment || null,
      difficulty: input.difficulty || null,
      alternative_exercise: input.alternativeExercise || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating exercise:", error);
    throw new Error(error.message);
  }

  return mapExerciseRow(data);
}

export async function updateExercise(input: UpdateExerciseInput): Promise<Exercise> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify ownership before updating (only custom exercises can be updated by the creator)
  const { data: existing, error: fetchError } = await supabase
    .from("exercises")
    .select("user_id, is_custom")
    .eq("id", input.id)
    .single();

  if (fetchError || !existing) {
    throw new Error("Exercise not found");
  }

  if (!existing.is_custom || existing.user_id !== user.id) {
    throw new Error("Cannot modify system default exercises.");
  }

  const { data, error } = await supabase
    .from("exercises")
    .update({
      name: input.name,
      primary_muscle_group: input.primaryMuscleGroup,
      secondary_muscle_group: input.secondaryMuscleGroup || null,
      description: input.description || null,
      video_url: input.videoUrl || null,
      category: input.category || null,
      equipment: input.equipment || null,
      difficulty: input.difficulty || null,
      alternative_exercise: input.alternativeExercise || null,
      notes: input.notes || null,
    })
    .eq("id", input.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating exercise:", error);
    throw new Error(error.message);
  }

  return mapExerciseRow(data);
}

export async function deleteExercise(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify ownership before deleting (only custom exercises can be deleted)
  const { data: existing, error: fetchError } = await supabase
    .from("exercises")
    .select("user_id, is_custom")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    throw new Error("Exercise not found");
  }

  if (!existing.is_custom || existing.user_id !== user.id) {
    throw new Error("Cannot delete system default exercises.");
  }

  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting exercise:", error);
    throw new Error(error.message);
  }
}
