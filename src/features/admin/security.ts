import { createClient } from "@/lib/supabase/server";

export async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    throw new Error("Unauthorized: Profile not found.");
  }

  if (profile.role !== "admin" && profile.role !== "super_admin") {
    throw new Error("Forbidden: Admin access required.");
  }

  return {
    user,
    role: profile.role as "admin" | "super_admin",
  };
}

export async function verifySuperAdmin() {
  const { user, role } = await verifyAdmin();
  if (role !== "super_admin") {
    throw new Error("Forbidden: Super Admin access required.");
  }
  return { user, role };
}
