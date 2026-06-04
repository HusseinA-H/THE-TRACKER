import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, Dumbbell, CheckCircle2, Trophy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { WorkoutCard } from "@/features/workouts/components/workout-card";
import { getWorkoutById } from "@/features/workouts/services/workout-service";
import { routes } from "@/config/routes";
import type { Metadata } from "next";

interface WorkoutDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WorkoutDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const workout = await getWorkoutById(id);
  return {
    title: workout ? `${workout.name} Details` : "Workout Details",
  };
}

export default async function WorkoutDetailPage({ params }: WorkoutDetailPageProps) {
  const { id } = await params;
  const workout = await getWorkoutById(id);

  if (!workout) {
    notFound();
  }

  // Calculate statistics for completed workout
  const completedEntries = workout.entries?.filter((e) => e.isCompleted) || [];
  
  // 1. Duration
  const durationSeconds = workout.completedAt
    ? Math.floor(
        (new Date(workout.completedAt).getTime() -
          new Date(workout.startedAt).getTime()) /
          1000
      )
    : 0;
  
  const hrs = Math.floor(durationSeconds / 3600);
  const mins = Math.floor((durationSeconds % 3600) / 60);
  const secs = durationSeconds % 60;
  const durationStr = hrs > 0 
    ? `${hrs}h ${mins}m` 
    : `${mins}m ${secs}s`;

  // 2. Volume
  const totalVolume = completedEntries.reduce((sum, entry) => sum + (entry.weight * entry.reps), 0);

  // 3. Unique Exercises
  const uniqueExercisesCount = new Set(completedEntries.map((e) => e.exerciseId)).size;

  // 4. PRs
  const prsCount = completedEntries.filter((e) => e.isPr).length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          href={routes.workouts}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-3 h-8 text-muted-foreground hover:text-foreground flex items-center gap-1"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to History</span>
        </Link>
      </div>

      <PageHeader
        title={workout.name}
        description="Detailed summary of your completed workout session."
      />

      {/* Visual Statistics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Duration */}
        <Card className="border border-border bg-card p-4 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-foreground font-mono">{durationStr}</div>
          </div>
        </Card>

        {/* Total Volume */}
        <Card className="border border-border bg-card p-4 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Volume</span>
            <Dumbbell className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-foreground font-mono">
              {totalVolume.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground ml-1">kg</span>
            </div>
          </div>
        </Card>

        {/* Exercises Completed */}
        <Card className="border border-border bg-card p-4 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Exercises</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-foreground font-mono">
              {uniqueExercisesCount}
              <span className="text-xs font-normal text-muted-foreground ml-1">done</span>
            </div>
          </div>
        </Card>

        {/* PRs Achieved */}
        <Card className="border border-border bg-card p-4 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">PRs Hit</span>
            <Trophy className="h-4 w-4 text-amber-500 fill-amber-500/20" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-foreground font-mono">
              {prsCount}
              <span className="text-xs font-normal text-muted-foreground ml-1">hit</span>
            </div>
          </div>
        </Card>
      </div>

      <WorkoutCard workout={workout} />
    </div>
  );
}
