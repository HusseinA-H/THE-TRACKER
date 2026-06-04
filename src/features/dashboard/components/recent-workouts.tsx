"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell, Calendar, Clock, ChevronRight } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";
import { routes } from "@/config/routes";
import type { Workout } from "@/features/workouts/types";

interface RecentWorkoutsProps {
  workouts: Workout[];
}

export function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
  const router = useRouter();

  return (
    <Card className="border border-border bg-card shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Recent Workouts</CardTitle>
          <CardDescription>Your latest training logs</CardDescription>
        </div>
        {workouts.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(routes.workouts)}
            className="text-xs h-8 text-muted-foreground hover:text-foreground"
          >
            <span>View All</span>
            <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {workouts.length > 0 ? (
          <div className="divide-y divide-border/60">
            {workouts.slice(0, 3).map((workout, idx) => {
              const durationSecs = workout.completedAt
                ? Math.floor(
                    (new Date(workout.completedAt).getTime() -
                      new Date(workout.startedAt).getTime()) /
                      1000
                  )
                : 0;

              // Extract unique exercise names
              const exerciseNames = Array.from(
                new Set(workout.entries?.map((e) => e.exercise?.name).filter(Boolean))
              );

              return (
                <div
                  key={workout.id}
                  className={`py-3.5 flex flex-col gap-1.5 ${
                    idx === 0 ? "pt-0" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">
                      {workout.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatDate(workout.completedAt || workout.startedAt)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(durationSecs)}
                    </span>
                    <span>·</span>
                    <span>
                      {exerciseNames.length} {exerciseNames.length === 1 ? "exercise" : "exercises"}
                    </span>
                  </div>

                  {exerciseNames.length > 0 && (
                    <p className="text-xs text-muted-foreground/80 line-clamp-1 mt-0.5">
                      {exerciseNames.join(", ")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Dumbbell className="h-8 w-8 text-muted-foreground/30" />
            <p>No workouts logged yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
