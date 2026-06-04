import { createClient } from "@/lib/supabase/server";
import { verifyAdmin, verifySuperAdmin } from "../security";
import { mapExerciseRow } from "@/features/exercises/services/exercise-service";
import { mapWeightLogRow } from "@/features/weight/services/weight-service";
import type { Exercise, WeightLog } from "@/types";

export async function getAdminOverview() {
  await verifyAdmin();
  const supabase = await createClient();

  const [usersCount, workoutsCount, exercisesCount, weightLogsCount, prsCount] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("workouts")
        .select("*", { count: "exact", head: true })
        .not("completed_at", "is", null),
      supabase.from("exercises").select("*", { count: "exact", head: true }),
      supabase.from("weight_logs").select("*", { count: "exact", head: true }),
      supabase.from("personal_records").select("*", { count: "exact", head: true }),
    ]);

  return {
    totalUsers: usersCount.count || 0,
    totalWorkouts: workoutsCount.count || 0,
    totalExercises: exercisesCount.count || 0,
    totalWeightLogs: weightLogsCount.count || 0,
    totalPersonalRecords: prsCount.count || 0,
  };
}

export async function getAdminUsers() {
  await verifyAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      display_name,
      avatar_url,
      created_at,
      role,
      workouts(completed_at),
      weight_logs(created_at)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin users:", error);
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => {
    const completedWorkouts = (row.workouts || [])
      .map((w: any) => w.completed_at)
      .filter(Boolean) as string[];

    const weightLogs = (row.weight_logs || [])
      .map((wl: any) => wl.created_at)
      .filter(Boolean) as string[];

    const dates = [...completedWorkouts, ...weightLogs];
    const lastActivity =
      dates.length > 0
        ? new Date(Math.max(...dates.map((d) => new Date(d).getTime()))).toISOString()
        : null;

    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      role: row.role as "super_admin" | "admin" | "user",
      workoutsCount: row.workouts?.length || 0,
      lastActivity,
    };
  });
}

export async function getAdminUserDetails(id: string) {
  await verifyAdmin();
  const supabase = await createClient();

  const { data: profileRow, error: pError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (pError || !profileRow) {
    throw new Error("User not found");
  }

  const [workoutsCount, weightLogsCount, prsCount] = await Promise.all([
    supabase
      .from("workouts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", id)
      .not("completed_at", "is", null),
    supabase.from("weight_logs").select("*", { count: "exact", head: true }).eq("user_id", id),
    supabase.from("personal_records").select("*", { count: "exact", head: true }).eq("user_id", id),
  ]);

  const { data: workouts } = await supabase
    .from("workouts")
    .select("*, workout_entries(*, exercise:exercises(*))")
    .eq("user_id", id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(5);

  const { data: weightLogs } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", id)
    .order("log_date", { ascending: false })
    .limit(5);

  const { data: customExercises } = await supabase
    .from("exercises")
    .select("*")
    .eq("user_id", id)
    .order("name", { ascending: true });

  return {
    profile: {
      id: profileRow.id,
      email: profileRow.email,
      displayName: profileRow.display_name,
      avatarUrl: profileRow.avatar_url,
      createdAt: profileRow.created_at,
      role: profileRow.role as "super_admin" | "admin" | "user",
    },
    stats: {
      totalWorkouts: workoutsCount.count || 0,
      totalWeightLogs: weightLogsCount.count || 0,
      totalPRs: prsCount.count || 0,
    },
    recentWorkouts: (workouts || []).map((w: any) => ({
      id: w.id,
      name: w.name,
      notes: w.notes,
      startedAt: w.started_at,
      completedAt: w.completed_at,
      exercisesCount: new Set((w.workout_entries || []).map((e: any) => e.exercise_id)).size,
    })),
    recentWeightLogs: (weightLogs || []).map(mapWeightLogRow),
    customExercises: (customExercises || []).map(mapExerciseRow),
  };
}

export async function changeUserRole(
  userId: string,
  newRole: "super_admin" | "admin" | "user"
) {
  // Only super_admin can change roles
  await verifySuperAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      role: newRole,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error changing user role:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function createSystemExercise(input: {
  name: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroup?: string | null;
  description?: string | null;
  videoUrl?: string | null;
  category?: string | null;
  equipment?: string | null;
  difficulty?: string | null;
  alternativeExercise?: string | null;
  notes?: string | null;
}) {
  await verifyAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      user_id: null,
      name: input.name,
      primary_muscle_group: input.primaryMuscleGroup,
      secondary_muscle_group: input.secondaryMuscleGroup || null,
      description: input.description || null,
      video_url: input.videoUrl || null,
      is_custom: false,
      category: input.category || null,
      equipment: input.equipment || null,
      difficulty: input.difficulty || null,
      alternative_exercise: input.alternativeExercise || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating system exercise:", error);
    throw new Error(error.message);
  }

  return mapExerciseRow(data);
}

export async function updateSystemExercise(
  id: string,
  input: {
    name: string;
    primaryMuscleGroup: string;
    secondaryMuscleGroup?: string | null;
    description?: string | null;
    videoUrl?: string | null;
    category?: string | null;
    equipment?: string | null;
    difficulty?: string | null;
    alternativeExercise?: string | null;
    notes?: string | null;
  }
) {
  await verifyAdmin();
  const supabase = await createClient();

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
    .eq("id", id)
    .is("user_id", null)
    .select()
    .single();

  if (error) {
    console.error("Error updating system exercise:", error);
    throw new Error(error.message);
  }

  return mapExerciseRow(data);
}

export async function deleteSystemExercise(id: string) {
  await verifyAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", id)
    .is("user_id", null);

  if (error) {
    console.error("Error deleting system exercise:", error);
    throw new Error(error.message);
  }
}

export async function getAdminAnalytics() {
  await verifyAdmin();
  const supabase = await createClient();

  // 1. Fetch user signups over time
  const { data: usersData } = await supabase
    .from("profiles")
    .select("created_at")
    .order("created_at", { ascending: true });

  const userGrowthMap = new Map<string, number>();
  let totalUsersCount = 0;
  
  (usersData || []).forEach((u) => {
    const date = u.created_at.split("T")[0];
    totalUsersCount++;
    userGrowthMap.set(date, totalUsersCount);
  });

  const userGrowth = Array.from(userGrowthMap.entries()).map(([date, count]) => ({
    date,
    users: count,
  })).slice(-15); // Show last 15 active registration dates

  // 2. Fetch workout completions per day
  const { data: workoutsData } = await supabase
    .from("workouts")
    .select("completed_at")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: true });

  const workoutActivityMap = new Map<string, number>();
  (workoutsData || []).forEach((w) => {
    if (w.completed_at) {
      const date = w.completed_at.split("T")[0];
      workoutActivityMap.set(date, (workoutActivityMap.get(date) || 0) + 1);
    }
  });

  const workoutActivity = Array.from(workoutActivityMap.entries()).map(([date, count]) => ({
    date,
    workouts: count,
  })).slice(-15);

  // 3. Fetch most popular exercises
  const { data: entriesData } = await supabase
    .from("workout_entries")
    .select("exercise:exercises(name)");

  const exercisePopularityMap = new Map<string, number>();
  (entriesData || []).forEach((entry: any) => {
    const name = entry.exercise?.name || "Unknown";
    exercisePopularityMap.set(name, (exercisePopularityMap.get(name) || 0) + 1);
  });

  const mostUsedExercises = Array.from(exercisePopularityMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 exercises

  // 4. Fetch weight logs stats (averages per day)
  const { data: weightData } = await supabase
    .from("weight_logs")
    .select("weight, log_date")
    .order("log_date", { ascending: true });

  const weightStatsMap = new Map<string, { total: number; count: number }>();
  (weightData || []).forEach((w) => {
    const existing = weightStatsMap.get(w.log_date);
    const weightVal = Number(w.weight);
    if (existing) {
      existing.total += weightVal;
      existing.count += 1;
    } else {
      weightStatsMap.set(w.log_date, { total: weightVal, count: 1 });
    }
  });

  const weightLogStats = Array.from(weightStatsMap.entries()).map(([date, data]) => ({
    date,
    averageWeight: Math.round((data.total / data.count) * 10) / 10,
  })).slice(-15);

  return {
    userGrowth,
    workoutActivity,
    mostUsedExercises,
    weightLogStats,
  };
}

export async function getSystemExercises(): Promise<Exercise[]> {
  await verifyAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .is("user_id", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching system exercises:", error);
    throw new Error(error.message);
  }

  return (data || []).map(mapExerciseRow);
}

