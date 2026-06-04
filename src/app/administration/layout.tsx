import { redirect } from "next/navigation";
import { verifyAdmin } from "@/features/admin/security";
import { AuthProvider } from "@/providers/auth-provider";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { mapProfileRow } from "@/features/profile/services/profile-service";
import { createClient } from "@/lib/supabase/server";
import { ShieldAlert, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UserAvatar } from "@/features/auth/components/user-avatar";
import type { UserProfile } from "@/types";

export default async function AdministrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let adminDetails;
  try {
    adminDetails = await verifyAdmin();
  } catch (error) {
    // Redirect standard users back to main app dashboard
    redirect("/dashboard");
  }

  // Fetch full profile info for Sidebar avatar display
  const supabase = await createClient();
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", adminDetails.user.id)
    .single();

  let profile: UserProfile | null = null;
  if (profileRow) {
    profile = mapProfileRow(profileRow);
  }

  return (
    <AuthProvider initialProfile={profile}>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <AdminSidebar profile={profile} />

        {/* Main Content Area */}
        <div className="md:pl-64 flex flex-col min-h-screen">
          {/* Mobile Admin Header */}
          <header className="md:hidden flex h-16 items-center justify-between px-6 border-b border-border bg-card">
            <Link href="/administration" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="THE TRACKER Logo"
                width={20}
                height={20}
                priority
                style={{ width: 'auto' }}
                className="h-5 object-contain"
              />
              <span className="font-extrabold text-sm tracking-tight text-foreground">
                THE TRACKER ADMIN
              </span>
            </Link>
            <UserAvatar profile={profile} />
          </header>

          {/* Page content wrapper */}
          <main className="flex-1 px-4 py-6 md:p-8 max-w-5xl w-full mx-auto pb-16 md:pb-8">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
