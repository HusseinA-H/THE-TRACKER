import { PageHeader } from "@/components/layout/page-header";
import { UserManagementTable } from "@/features/admin/components/user-management-table";
import { getAdminUsers } from "@/features/admin/services/admin-service";
import { verifyAdmin } from "@/features/admin/security";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
};

export default async function AdminUsersPage() {
  const { role: currentAdminRole } = await verifyAdmin();
  const users = await getAdminUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Search athlete profiles, monitor activity status, and manage role-based authorization permissions."
      />

      <UserManagementTable
        users={users}
        currentAdminRole={currentAdminRole}
      />
    </div>
  );
}
