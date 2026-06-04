import { createClient } from "@/lib/supabase/server";
import type { WeightLogRow } from "@/types/database.types";
import type { WeightLog, LogWeightInput, WeightStats } from "../types";

export function mapWeightLogRow(row: WeightLogRow): WeightLog {
  return {
    id: row.id,
    userId: row.user_id,
    weight: Number(row.weight),
    logDate: row.log_date,
    createdAt: row.created_at,
  };
}

export async function getWeightHistory(): Promise<WeightLog[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false });

  if (error) {
    console.error("Error fetching weight history:", error);
    throw new Error(error.message);
  }

  return (data || []).map(mapWeightLogRow);
}

export async function getLatestWeight(): Promise<WeightLog | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching latest weight:", error);
    return null;
  }

  return data ? mapWeightLogRow(data) : null;
}

export async function getWeightStats(): Promise<WeightStats> {
  const history = await getWeightHistory();
  if (history.length === 0) {
    return {
      currentWeight: null,
      change30Days: null,
      changeAllTime: null,
      minWeight: null,
      maxWeight: null,
    };
  }

  // Sort ascending by log date for calculations
  const sorted = [...history].sort((a, b) => a.logDate.localeCompare(b.logDate));
  
  const current = sorted[sorted.length - 1].weight;
  const first = sorted[0].weight;
  const changeAllTime = current - first;

  // Find entry closest to 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysDateStr = thirtyDaysAgo.toISOString().split("T")[0];

  const thirtyDaysEntry = sorted.find((e) => e.logDate >= thirtyDaysDateStr);
  const change30Days = thirtyDaysEntry ? current - thirtyDaysEntry.weight : null;

  const weights = sorted.map((e) => e.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  return {
    currentWeight: current,
    change30Days,
    changeAllTime,
    minWeight,
    maxWeight,
  };
}

export async function logWeight(input: LogWeightInput): Promise<WeightLog> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("weight_logs")
    .upsert(
      {
        user_id: user.id,
        weight: input.weight,
        log_date: input.logDate,
      },
      { onConflict: "user_id,log_date" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error logging weight:", error);
    throw new Error(error.message);
  }

  return mapWeightLogRow(data);
}

export async function deleteWeight(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("weight_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting weight log:", error);
    throw new Error(error.message);
  }
}
