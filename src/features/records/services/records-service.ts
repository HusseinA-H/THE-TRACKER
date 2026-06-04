import { createClient } from "@/lib/supabase/server";
import { mapExerciseRow } from "@/features/exercises/services/exercise-service";
import type { PersonalRecord } from "../types";

export async function getPersonalRecords(): Promise<PersonalRecord[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("personal_records")
    .select(`
      *,
      exercise:exercises(*)
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching personal records:", error);
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    exerciseId: row.exercise_id,
    maxWeight: Number(row.max_weight),
    maxEstimated1rm: Number(row.max_estimated_1rm),
    maxVolume: Number(row.max_volume || 0),
    setId: row.set_id,
    volumeSetId: row.volume_set_id,
    updatedAt: row.updated_at,
    exercise: row.exercise ? mapExerciseRow(row.exercise) : undefined,
  }));
}
