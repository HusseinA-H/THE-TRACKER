import { PageHeader } from "@/components/layout/page-header";
import { verifyAdmin } from "@/features/admin/security";
import { getSystemExercises } from "@/features/admin/services/admin-service";
import { SystemExerciseManager } from "@/features/admin/components/system-exercise-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Exercises Library",
};

export default async function AdminExercisesPage() {
  // Enforce server-side authorization check
  await verifyAdmin();

  // Fetch only system-wide default movements
  const exercises = await getSystemExercises();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Exercises Library"
        description="Add, modify, or retire standard movement records. These movements appear for all users."
      />

      <SystemExerciseManager initialExercises={exercises} />
    </div>
  );
}
