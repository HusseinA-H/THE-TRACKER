import { StatCard } from "./stat-card";
import { Dumbbell, Calendar, Scale, Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import type { DashboardStats } from "../types";

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const {
    currentWeight,
    weightDifference,
    lastWorkoutDate,
    totalWorkouts,
    totalPRs,
  } = stats;

  const getWeightSubtext = () => {
    if (weightDifference === null) return "No prior weight logged";
    const prefix = weightDifference > 0 ? "+" : "";
    const label = weightDifference > 0 ? "gain" : "loss";
    return `${prefix}${weightDifference.toFixed(1)} kg ${label} from last log`;
  };

  const getWeightSubtextClass = () => {
    if (weightDifference === null || weightDifference === 0) return "text-muted-foreground";
    return weightDifference < 0 ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold";
  };

  const getLastWorkoutSubtext = () => {
    if (!lastWorkoutDate) return "No workouts recorded yet";
    return `Logged on ${formatDate(lastWorkoutDate)}`;
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="Total Workouts"
        value={totalWorkouts}
        icon={Dumbbell}
        subtext="Training sessions logged"
      />
      <StatCard
        title="Last Active"
        value={<RelativeTime date={lastWorkoutDate} />}
        icon={Calendar}
        subtext={getLastWorkoutSubtext()}
      />
      <StatCard
        title="Body Weight"
        value={currentWeight ? `${currentWeight.toFixed(1)} kg` : "—"}
        icon={Scale}
        subtext={getWeightSubtext()}
        subtextClass={getWeightSubtextClass()}
      />
      <StatCard
        title="Personal Records"
        value={totalPRs}
        icon={Trophy}
        subtext="Lifts beating previous maxes"
      />
    </div>
  );
}
