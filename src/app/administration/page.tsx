import { PageHeader } from "@/components/layout/page-header";
import { verifyAdmin } from "@/features/admin/security";
import { getAdminOverview, getSystemExercises } from "@/features/admin/services/admin-service";
import { getWorkoutPackages, getWorkoutTemplates } from "@/features/workouts/services/workout-service";
import { AdminDashboardTabs } from "@/features/admin/components/admin-dashboard-tabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel",
};

export default async function AdminOverviewPage() {
  // Enforce server-side authorization check
  const { role } = await verifyAdmin();

  // Fetch all necessary data in parallel
  const [overview, exercises, packages, templates] = await Promise.all([
    getAdminOverview(),
    getSystemExercises(),
    getWorkoutPackages(),
    getWorkoutTemplates(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Panel"
        description="Unified management dashboard for exercise library, alternatives, videos, program packages, and system configurations."
      >
        <div className="flex items-center gap-2">
          <BadgeRole role={role} />
        </div>
      </PageHeader>

      <AdminDashboardTabs
        overview={overview}
        exercises={exercises}
        packages={packages}
        templates={templates}
      />
    </div>
  );
}

function BadgeRole({ role }: { role: string }) {
  if (role === "super_admin") {
    return (
      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 border rounded bg-indigo-50 text-indigo-700 border-indigo-200">
        Super Admin
      </span>
    );
  }
  return (
    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 border rounded bg-amber-50 text-amber-700 border-amber-200">
      Admin
    </span>
  );
}
