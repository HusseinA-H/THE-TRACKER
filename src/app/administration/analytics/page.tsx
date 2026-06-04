import { PageHeader } from "@/components/layout/page-header";
import { verifyAdmin } from "@/features/admin/security";
import { getAdminAnalytics } from "@/features/admin/services/admin-service";
import { AdminAnalyticsDashboard } from "@/features/admin/components/admin-analytics-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Analytics",
};

export default async function AdminAnalyticsPage() {
  // Enforce server-side authorization check
  await verifyAdmin();

  // Fetch analytics datasets
  const analyticsData = await getAdminAnalytics();

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Analytics"
        description="Monitor user registration growth, workouts activity logs, and exercise popularity metrics."
      />

      <AdminAnalyticsDashboard data={analyticsData} />
    </div>
  );
}
