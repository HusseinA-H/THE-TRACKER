import { PageHeader } from "@/components/layout/page-header";
import { verifyAdmin } from "@/features/admin/security";
import { AdminSettingsForm } from "@/features/admin/components/admin-settings-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Settings",
};

export default async function AdminSettingsPage() {
  // Enforce server-side authorization check
  await verifyAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Settings"
        description="Trigger database seeding actions and view infrastructure logs or app configurations."
      />

      <AdminSettingsForm />
    </div>
  );
}
