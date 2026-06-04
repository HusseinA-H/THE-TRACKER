import type { DashboardStats } from "@/types";

export type { DashboardStats };

export interface WeeklyActivityDay {
  dayName: string;
  shortName: string;
  hasWorkout: boolean;
  dateStr: string;
}
