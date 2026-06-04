import { createClient } from "@/lib/supabase/server";
import { format, getISOWeek, getISOWeekYear, subWeeks, parseISO, differenceInCalendarDays } from "date-fns";
import type { UserScheduleSettings } from "@/types";
import { CYCLE_DAYS, calculateCycleDay } from "../utils/cycle";

export async function getScheduleSettings(): Promise<UserScheduleSettings> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("user_schedule_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching schedule settings:", error);
    throw new Error(error.message);
  }

  if (!data) {
    // Create default settings starting today
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const { data: inserted, error: insertError } = await supabase
      .from("user_schedule_settings")
      .insert({
        user_id: user.id,
        cycle_start_date: todayStr,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating default schedule settings:", insertError);
      throw new Error(insertError.message);
    }

    return {
      userId: inserted.user_id,
      cycleStartDate: inserted.cycle_start_date,
      createdAt: inserted.created_at,
    };
  }

  return {
    userId: data.user_id,
    cycleStartDate: data.cycle_start_date,
    createdAt: data.created_at,
  };
}

export async function updateScheduleSettings(cycleStartDate: string): Promise<UserScheduleSettings> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("user_schedule_settings")
    .upsert({
      user_id: user.id,
      cycle_start_date: cycleStartDate,
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating schedule settings:", error);
    throw new Error(error.message);
  }

  return {
    userId: data.user_id,
    cycleStartDate: data.cycle_start_date,
    createdAt: data.created_at,
  };
}


export interface CalendarDayInfo {
  date: string;
  scheduledDayName: string;
  isRestDay: boolean;
  isCompleted: boolean;
  isMissed: boolean;
  isToday: boolean;
  workoutName?: string;
  workoutId?: string;
}

export async function getCalendarDaysForMonth(
  year: number,
  month: number // 1-indexed (1 = Jan, 12 = Dec)
): Promise<CalendarDayInfo[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const settings = await getScheduleSettings();
  const cycleStartDate = settings.cycleStartDate;

  // Calculate start and end of the month
  const startDateStr = `${year}-${month.toString().padStart(2, "0")}-01`;
  // Get last day of month
  const lastDay = new Date(year, month, 0).getDate();
  const endDateStr = `${year}-${month.toString().padStart(2, "0")}-${lastDay.toString().padStart(2, "0")}`;

  // Fetch completed workouts in this range
  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("id, name, completed_at")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .gte("completed_at", `${startDateStr}T00:00:00Z`)
    .lte("completed_at", `${endDateStr}T23:59:59Z`);

  if (error) {
    console.error("Error fetching workouts for calendar:", error);
  }

  // Create lookup map of completed workouts by date (local timezone YYYY-MM-DD)
  const workoutsMap: Record<string, { id: string; name: string }> = {};
  (workouts || []).forEach((w) => {
    if (w.completed_at) {
      const localDate = w.completed_at.split("T")[0];
      workoutsMap[localDate] = { id: w.id, name: w.name };
    }
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const calendarDays: CalendarDayInfo[] = [];

  for (let day = 1; day <= lastDay; day++) {
    const currentDayStr = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    const cycleDay = calculateCycleDay(currentDayStr, cycleStartDate);
    const completedWorkout = workoutsMap[currentDayStr];
    
    const isCompleted = !!completedWorkout;
    const isToday = currentDayStr === todayStr;
    const isPast = currentDayStr < todayStr;
    
    // A day is "missed" if it is in the past, it was scheduled as a training day, and no workout was completed
    const isMissed = isPast && !cycleDay.isRest && !isCompleted;

    calendarDays.push({
      date: currentDayStr,
      scheduledDayName: cycleDay.name,
      isRestDay: cycleDay.isRest,
      isCompleted,
      isMissed,
      isToday,
      workoutName: completedWorkout?.name,
      workoutId: completedWorkout?.id,
    });
  }

  return calendarDays;
}

export async function getStreakStats(): Promise<{ currentStreak: number; longestStreak: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Fetch completed workouts all-time
  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("completed_at")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: true });

  if (error) {
    console.error("Error fetching workouts for streaks:", error);
    return { currentStreak: 0, longestStreak: 0 };
  }

  if (!workouts || workouts.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Group workout dates by ISO week key (Year-Week)
  const activeWeeks = new Set<string>();
  workouts.forEach((w) => {
    if (w.completed_at) {
      const date = parseISO(w.completed_at);
      const weekYear = getISOWeekYear(date);
      const weekNum = getISOWeek(date);
      // Key: "YYYY-Www"
      const weekKey = `${weekYear}-W${weekNum.toString().padStart(2, "0")}`;
      activeWeeks.add(weekKey);
    }
  });

  // Calculate current week key and last week key
  const today = new Date();
  const currentWeekYear = getISOWeekYear(today);
  const currentWeekNum = getISOWeek(today);
  const currentWeekKey = `${currentWeekYear}-W${currentWeekNum.toString().padStart(2, "0")}`;

  const lastWeek = subWeeks(today, 1);
  const lastWeekYear = getISOWeekYear(lastWeek);
  const lastWeekNum = getISOWeek(lastWeek);
  const lastWeekKey = `${lastWeekYear}-W${lastWeekNum.toString().padStart(2, "0")}`;

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let hasCurrentWeek = activeWeeks.has(currentWeekKey);
  let hasLastWeek = activeWeeks.has(lastWeekKey);

  if (hasCurrentWeek || hasLastWeek) {
    // Start counting back from the current week (or last week if current week is not active yet)
    let checkDate = hasCurrentWeek ? today : lastWeek;
    let streakCount = 0;
    
    while (true) {
      const year = getISOWeekYear(checkDate);
      const week = getISOWeek(checkDate);
      const key = `${year}-W${week.toString().padStart(2, "0")}`;
      
      if (activeWeeks.has(key)) {
        streakCount++;
        checkDate = subWeeks(checkDate, 1);
      } else {
        break;
      }
    }
    currentStreak = streakCount;
  }

  // 2. Calculate Longest Streak
  // We need to order the distinct active weeks chronologically and find the max consecutive weeks
  // Let's parse the keys back into a sortable array or generate consecutive week boundaries
  const sortedWeeks = Array.from(activeWeeks).sort();
  
  let longestStreak = 0;
  let currentContiguous = 0;
  
  if (sortedWeeks.length > 0) {
    currentContiguous = 1;
    longestStreak = 1;
    
    for (let i = 1; i < sortedWeeks.length; i++) {
      const prevKey = sortedWeeks[i - 1];
      const currKey = sortedWeeks[i];
      
      // Check if currKey is exactly 1 week after prevKey
      // Parse dates from keys: take middle day of both weeks to check difference
      const [prevYear, prevWStr] = prevKey.split("-W");
      const [currYear, currWStr] = currKey.split("-W");
      
      const prevW = parseInt(prevWStr, 10);
      const currW = parseInt(currWStr, 10);
      
      let isConsecutive = false;
      if (prevYear === currYear) {
        isConsecutive = currW === prevW + 1;
      } else {
        // Year boundary: check if prev week is week 52/53 of prev year and current is week 1 of current year
        const prevYearInt = parseInt(prevYear, 10);
        const currYearInt = parseInt(currYear, 10);
        if (currYearInt === prevYearInt + 1 && currW === 1) {
          // Verify if prev week was the last week of that year
          // Let's do a calendar check: get ISO weeks in prev year
          // Simple check: check difference in calendar weeks
          // We can construct dates for comparison
          // ISO week date format: YYYY-Www-4 (Thursday is always in the ISO week)
          const prevDate = parseISO(`${prevYear}-W${prevWStr}-4`);
          const currDate = parseISO(`${currYear}-W${currWStr}-4`);
          const diffWeeks = Math.round(differenceInCalendarDays(currDate, prevDate) / 7);
          isConsecutive = diffWeeks === 1;
        }
      }
      
      if (isConsecutive) {
        currentContiguous++;
      } else {
        currentContiguous = 1;
      }
      
      if (currentContiguous > longestStreak) {
        longestStreak = currentContiguous;
      }
    }
  }

  return { currentStreak, longestStreak };
}
