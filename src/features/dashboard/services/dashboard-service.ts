import { createClient } from "@/lib/supabase/server";
import type { DashboardStats } from "../types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 1. Fetch total completed workouts count
  const { count: totalWorkouts, error: countError } = await supabase
    .from("workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .not("completed_at", "is", null);

  if (countError) console.error("Error counting workouts:", countError);

  // 2. Fetch total PRs count
  const { count: totalPRs, error: prError } = await supabase
    .from("personal_records")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (prError) console.error("Error counting PRs:", prError);

  // 3. Fetch last completed workout date
  const { data: lastWorkout, error: lastError } = await supabase
    .from("workouts")
    .select("completed_at")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastError) console.error("Error fetching last workout:", lastError);

  // 4. Fetch latest two weight logs to calculate difference
  const { data: weightLogs, error: wError } = await supabase
    .from("weight_logs")
    .select("weight")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .limit(2);

  if (wError) console.error("Error fetching weight logs:", wError);

  let currentWeight: number | null = null;
  let weightDifference: number | null = null;

  if (weightLogs && weightLogs.length > 0) {
    currentWeight = Number(weightLogs[0].weight);
    if (weightLogs.length > 1) {
      weightDifference = currentWeight - Number(weightLogs[1].weight);
    }
  }

  // 5. Calculate Weekly Activity (Monday through Sunday)
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + distanceToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const { data: weeklyWorkouts, error: weeklyError } = await supabase
    .from("workouts")
    .select("completed_at")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .gte("completed_at", startOfWeek.toISOString())
    .lte("completed_at", endOfWeek.toISOString());

  if (weeklyError) console.error("Error fetching weekly workouts:", weeklyError);

  const weeklyActivity = Array(7).fill(false);
  if (weeklyWorkouts) {
    weeklyWorkouts.forEach((w) => {
      if (w.completed_at) {
        const date = new Date(w.completed_at);
        let dayIndex = date.getDay() - 1; // Map Sun-Sat (0-6) to Mon-Sun (0-6)
        if (dayIndex === -1) dayIndex = 6; // Sunday is index 6
        if (dayIndex >= 0 && dayIndex < 7) {
          weeklyActivity[dayIndex] = true;
        }
      }
    });
  }

  return {
    currentWeight,
    weightDifference,
    lastWorkoutDate: lastWorkout?.completed_at || null,
    totalWorkouts: totalWorkouts || 0,
    totalPRs: totalPRs || 0,
    weeklyActivity,
  };
}
