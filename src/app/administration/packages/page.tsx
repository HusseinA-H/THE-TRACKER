import { PageHeader } from "@/components/layout/page-header";
import { verifyAdmin } from "@/features/admin/security";
import { getWorkoutPackages, getWorkoutTemplates } from "@/features/workouts/services/workout-service";
import { AdminPackageManager } from "@/features/admin/components/admin-package-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workout Packages Manager",
};

export default async function AdminPackagesPage() {
  // Enforce server-side authorization check
  await verifyAdmin();

  // Fetch all packages and templates in parallel
  const [packages, templates] = await Promise.all([
    getWorkoutPackages(),
    getWorkoutTemplates(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workout Packages Manager"
        description="Create, edit, or delete training split packages (e.g. Upper & Lower Split) and link workout templates to them."
      />

      <AdminPackageManager initialPackages={packages} availableTemplates={templates} />
    </div>
  );
}
