import { PageHeader } from "@/components/layout/page-header";
import { verifyAdmin } from "@/features/admin/security";
import { getWorkoutTemplates } from "@/features/workouts/services/workout-service";
import { getExercises } from "@/features/exercises/services/exercise-service";
import { AdminTemplateManager } from "@/features/admin/components/admin-template-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workout Templates Manager",
};

export default async function AdminTemplatesPage() {
  // Enforce server-side authorization check
  await verifyAdmin();

  // Fetch all templates and exercises in parallel
  const [templates, exercises] = await Promise.all([
    getWorkoutTemplates(),
    getExercises(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workout Templates Manager"
        description="Create, edit, or delete predefined workout plans. Changes will reflect globally for all users."
      />

      <AdminTemplateManager initialTemplates={templates} availableExercises={exercises} />
    </div>
  );
}
