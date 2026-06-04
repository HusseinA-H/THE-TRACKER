"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, CalendarRange } from "lucide-react";

interface WeeklyActivityProps {
  activity: boolean[]; // Array of 7 booleans (Mon-Sun)
}

export function WeeklyActivity({ activity }: WeeklyActivityProps) {
  const days = [
    { label: "M", name: "Monday" },
    { label: "T", name: "Tuesday" },
    { label: "W", name: "Wednesday" },
    { label: "T", name: "Thursday" },
    { label: "F", name: "Friday" },
    { label: "S", name: "Saturday" },
    { label: "S", name: "Sunday" },
  ];

  const workoutsThisWeek = activity.filter(Boolean).length;

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-muted-foreground" />
            <span>Weekly Consistency</span>
          </CardTitle>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/40">
            {workoutsThisWeek} {workoutsThisWeek === 1 ? "workout" : "workouts"} this week
          </span>
        </div>
        <CardDescription>Keep the streak going by logging your weekly training sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-1 py-2 sm:justify-around">
          {days.map((day, index) => {
            const hasWorkout = activity[index];
            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  {day.label}
                </span>
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-200 ${
                    hasWorkout
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-muted-foreground/30"
                  }`}
                  title={`${day.name}: ${hasWorkout ? "Workout completed" : "Rest day"}`}
                >
                  {hasWorkout ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <span className="text-xs font-mono font-medium text-muted-foreground/50">•</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
