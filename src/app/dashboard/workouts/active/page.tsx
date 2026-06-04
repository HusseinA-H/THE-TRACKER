import { getActiveWorkout, getWorkoutTemplateExercises, getLastWeightsForExercises, getBulkExerciseProgressions } from "@/features/workouts/services/workout-service";
import { getExercises } from "@/features/exercises/services/exercise-service";
import { ActiveWorkout } from "@/features/workouts/components/active-workout";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import type { Metadata } from "next";
import type { WorkoutTemplateExercise } from "@/types";

export const metadata: Metadata = {
  title: "Active Workout Logger",
};

export default async function ActiveWorkoutPage() {
  // Try to load current active session
  let activeWorkout = await getActiveWorkout();
  
  // If none exists, redirect to main workouts template launcher
  if (!activeWorkout) {
    redirect(routes.workouts);
  }

  // Fetch exercises available to log
  const exercises = await getExercises();

  // Fetch template exercises if it is a template-based workout
  let templateExercises: WorkoutTemplateExercise[] = [];
  if (activeWorkout.templateId) {
    templateExercises = await getWorkoutTemplateExercises(activeWorkout.templateId);
  }

  // Fetch last weights for exercises in the active workout or template
  const activeExerciseIds = Array.from(
    new Set([
      ...(activeWorkout.entries?.map((e) => e.exerciseId) || []),
      ...templateExercises.map((te) => te.exerciseId)
    ])
  );
  
  const lastWeights = activeExerciseIds.length > 0
    ? await getLastWeightsForExercises(activeExerciseIds)
    : {};

  // Build target reps mapping for progression calculations
  const templatesMap: Record<string, string> = {};
  templateExercises.forEach((te) => {
    templatesMap[te.exerciseId] = te.targetReps;
  });

  const progressions = activeExerciseIds.length > 0
    ? await getBulkExerciseProgressions(activeExerciseIds, templatesMap)
    : {};

  return (
    <div className="py-2">
      <ActiveWorkout
        workout={activeWorkout}
        availableExercises={exercises}
        templateExercises={templateExercises}
        lastWeights={lastWeights}
        progressions={progressions}
      />
    </div>
  );
}
