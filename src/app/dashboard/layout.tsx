import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/providers/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import { mapProfileRow } from "@/features/profile/services/profile-service";
import type { UserProfile } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile details
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  let profile: UserProfile | null = null;
  if (profileRow) {
    profile = mapProfileRow(profileRow);
  } else {
    // Sync fallback in case profile trigger has slight delay
    profile = {
      id: user.id,
      email: user.email!,
      displayName:
        user.user_metadata?.display_name || user.user_metadata?.name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
      role: "user",
      createdAt: user.created_at,
      updatedAt: user.updated_at || new Date().toISOString(),
    };
  }

  return (
    <AuthProvider initialProfile={profile}>
      <AppShell profile={profile}>{children}</AppShell>
    </AuthProvider>
  );
}
