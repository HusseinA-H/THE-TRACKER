import { createClient } from "@/lib/supabase/server";
import { mapExerciseRow } from "./exercise-service";
import type { ExerciseAlternative, Exercise } from "@/types";

export async function getAlternativesForExercise(exerciseId: string): Promise<ExerciseAlternative[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercise_alternatives")
    .select(`
      *,
      alternative:exercises(*)
    `)
    .eq("exercise_id", exerciseId)
    .order("preference_order", { ascending: true });

  if (error) {
    console.error("Error fetching exercise alternatives:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    exerciseId: row.exercise_id,
    alternativeId: row.alternative_id,
    preferenceOrder: row.preference_order,
    createdAt: row.created_at,
    alternative: row.alternative ? mapExerciseRow(row.alternative) : undefined,
  }));
}

export async function setAlternativesForExercise(
  exerciseId: string,
  alternativeIds: string[] // List of up to 3 alternative exercise IDs
): Promise<void> {
  const supabase = await createClient();
  
  // Enforce admin permission for editing global alternatives
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    throw new Error("Only admins can manage global exercise alternatives.");
  }

  // Delete existing alternatives
  const { error: deleteError } = await supabase
    .from("exercise_alternatives")
    .delete()
    .eq("exercise_id", exerciseId);

  if (deleteError) {
    console.error("Error deleting old alternatives:", deleteError);
    throw new Error(deleteError.message);
  }

  if (alternativeIds.length === 0) return;

  // Insert new alternatives (up to 3)
  const inserts = alternativeIds.slice(0, 3).map((altId, index) => ({
    exercise_id: exerciseId,
    alternative_id: altId,
    preference_order: index + 1,
  }));

  const { error: insertError } = await supabase
    .from("exercise_alternatives")
    .insert(inserts);

  if (insertError) {
    console.error("Error inserting alternatives:", insertError);
    throw new Error(insertError.message);
  }
}

export async function getAlternativesForExercises(
  exerciseIds: string[]
): Promise<Record<string, Exercise[]>> {
  if (exerciseIds.length === 0) return {};
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercise_alternatives")
    .select(`
      exercise_id,
      preference_order,
      alternative:exercises(*)
    `)
    .in("exercise_id", exerciseIds)
    .order("preference_order", { ascending: true });

  if (error) {
    console.error("Error batch fetching alternatives:", error);
    return {};
  }

  const result: Record<string, Exercise[]> = {};
  (data || []).forEach((row: any) => {
    if (!result[row.exercise_id]) {
      result[row.exercise_id] = [];
    }
    if (row.alternative) {
      result[row.exercise_id].push(mapExerciseRow(row.alternative));
    }
  });

  return result;
}
