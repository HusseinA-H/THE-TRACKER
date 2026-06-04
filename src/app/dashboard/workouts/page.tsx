import { PageHeader } from "@/components/layout/page-header";
import { WorkoutList } from "@/features/workouts/components/workout-list";
import { getWorkoutHistory, getWorkoutTemplates, getWorkoutPackages } from "@/features/workouts/services/workout-service";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { startWorkoutAction } from "@/features/workouts/actions";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workouts Hub",
};

export default async function WorkoutsPage() {
  const [workoutHistory, templates, packages] = await Promise.all([
    getWorkoutHistory(),
    getWorkoutTemplates(),
    getWorkoutPackages(),
  ]);

  // Define Server Action wrapper for starting workout from the header
  const handleStartWorkout = async () => {
    "use server";
    const result = await startWorkoutAction();
    if (result.success) {
      redirect(routes.workoutActive);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workouts"
        description="Launch a predefined training program, a workout template, or log a custom session."
      >
        <form action={handleStartWorkout}>
          <Button type="submit" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            <span>Start Empty Session</span>
          </Button>
        </form>
      </PageHeader>

      <WorkoutList
        initialWorkouts={workoutHistory}
        templates={templates}
        packages={packages}
      />
    </div>
  );
}
