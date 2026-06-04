import { PageHeader } from "@/components/layout/page-header";
import { StatsGrid } from "@/features/dashboard/components/stats-grid";
import { WeeklyActivity } from "@/features/dashboard/components/weekly-activity";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RecentWorkouts } from "@/features/dashboard/components/recent-workouts";
import { getDashboardStats } from "@/features/dashboard/services/dashboard-service";
import { getWorkoutHistory } from "@/features/workouts/services/workout-service";
import { getProfile } from "@/features/profile/services/profile-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const [stats, workoutHistory, profile] = await Promise.all([
    getDashboardStats(),
    getWorkoutHistory(),
    getProfile(),
  ]);

  const displayName = profile?.displayName || "Athlete";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${displayName}. Here is your training summary for this week.`}
      />

      {/* Stats KPI Grid */}
      <StatsGrid stats={stats} />

      {/* Main content split */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column (2/3 width) - Weekly activity and recent logs */}
        <div className="md:col-span-2 space-y-6">
          <WeeklyActivity activity={stats.weeklyActivity} />
          <RecentWorkouts workouts={workoutHistory} />
        </div>

        {/* Right Column (1/3 width) - Quick links */}
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
