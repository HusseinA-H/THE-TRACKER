import { PageHeader } from "@/components/layout/page-header";
import { ExerciseList } from "@/features/exercises/components/exercise-list";
import { getExercises } from "@/features/exercises/services/exercise-service";
import { getProfile } from "@/features/profile/services/profile-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exercise Library",
};

export default async function ExercisesPage() {
  const [exercises, profile] = await Promise.all([
    getExercises(),
    getProfile(),
  ]);

  const userRole = profile?.role || "user";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exercise Library"
        description="Browse default movements or create custom exercises to log in your workouts."
      />

      <ExerciseList initialExercises={exercises} userRole={userRole} />
    </div>
  );
}
