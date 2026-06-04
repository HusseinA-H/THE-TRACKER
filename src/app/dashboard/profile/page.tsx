import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { getProfile } from "@/features/profile/services/profile-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings",
};

export default async function ProfilePage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        description="Manage your account profile information and configuration."
      />

      <ProfileForm profile={profile} />
    </div>
  );
}
