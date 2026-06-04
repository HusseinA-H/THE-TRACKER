"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Dumbbell, Scale, Trophy, ListChecks, Loader2 } from "lucide-react";
import { startWorkoutAction } from "@/features/workouts/actions";
import { toast } from "sonner";
import { routes } from "@/config/routes";

export function QuickActions() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartWorkout = async () => {
    setIsStarting(true);
    const toastId = toast.loading("Starting workout session...");
    try {
      const result = await startWorkoutAction();
      if (result.success) {
        toast.success("Workout started", { id: toastId });
        router.push(routes.workoutActive);
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to start workout", { id: toastId });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        <CardDescription>Common tools to log and track your training</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {/* Start Workout */}
        <Button
          onClick={handleStartWorkout}
          disabled={isStarting}
          className="h-16 flex flex-col items-center justify-center gap-1 text-xs font-semibold px-2"
        >
          {isStarting ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <Plus className="h-4.5 w-4.5" />
          )}
          <span>Start Workout</span>
        </Button>

        {/* Log Weight */}
        <Button
          variant="outline"
          onClick={() => router.push(routes.weight)}
          className="h-16 flex flex-col items-center justify-center gap-1 text-xs font-semibold border-border px-2"
        >
          <Scale className="h-4.5 w-4.5 text-muted-foreground" />
          <span>Log Weight</span>
        </Button>

        {/* Library */}
        <Button
          variant="outline"
          onClick={() => router.push(routes.exercises)}
          className="h-16 flex flex-col items-center justify-center gap-1 text-xs font-semibold border-border px-2"
        >
          <ListChecks className="h-4.5 w-4.5 text-muted-foreground" />
          <span>Exercises</span>
        </Button>

        {/* Records */}
        <Button
          variant="outline"
          onClick={() => router.push(routes.records)}
          className="h-16 flex flex-col items-center justify-center gap-1 text-xs font-semibold border-border px-2"
        >
          <Trophy className="h-4.5 w-4.5 text-muted-foreground" />
          <span>PR Board</span>
        </Button>
      </CardContent>
    </Card>
  );
}
