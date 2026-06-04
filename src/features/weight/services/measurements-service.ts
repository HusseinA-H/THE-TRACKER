import { createClient } from "@/lib/supabase/server";
import type { BodyMeasurement } from "@/types";

export function mapMeasurementRow(row: any): BodyMeasurement {
  return {
    id: row.id,
    userId: row.user_id,
    logDate: row.log_date,
    weight: row.weight ? Number(row.weight) : null,
    waist: row.waist ? Number(row.waist) : null,
    chest: row.chest ? Number(row.chest) : null,
    shoulders: row.shoulders ? Number(row.shoulders) : null,
    arms: row.arms ? Number(row.arms) : null,
    forearms: row.forearms ? Number(row.forearms) : null,
    thighs: row.thighs ? Number(row.thighs) : null,
    calves: row.calves ? Number(row.calves) : null,
    createdAt: row.created_at,
  };
}

export async function getMeasurementHistory(): Promise<BodyMeasurement[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false });

  if (error) {
    console.error("Error fetching measurement history:", error);
    throw new Error(error.message);
  }

  return (data || []).map(mapMeasurementRow);
}

export async function getLatestMeasurement(): Promise<BodyMeasurement | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching latest measurement:", error);
    return null;
  }

  return data ? mapMeasurementRow(data) : null;
}

export async function logMeasurement(input: Partial<Omit<BodyMeasurement, "id" | "userId" | "createdAt">> & { logDate: string }): Promise<BodyMeasurement> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("body_measurements")
    .upsert(
      {
        user_id: user.id,
        log_date: input.logDate,
        weight: input.weight,
        waist: input.waist,
        chest: input.chest,
        shoulders: input.shoulders,
        arms: input.arms,
        forearms: input.forearms,
        thighs: input.thighs,
        calves: input.calves,
      },
      { onConflict: "user_id,log_date" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error logging measurement:", error);
    throw new Error(error.message);
  }

  return mapMeasurementRow(data);
}

export async function deleteMeasurement(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("body_measurements")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting measurement log:", error);
    throw new Error(error.message);
  }
}
