"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

interface AuthContextType {
  profile: UserProfile | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  isLoading: true,
});

export function AuthProvider({
  children,
  initialProfile,
}: {
  children: React.ReactNode;
  initialProfile: UserProfile | null;
}) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        if (session?.user) {
          const { data: dbProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          const mappedProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email!,
            displayName:
              dbProfile?.display_name ||
              session.user.user_metadata?.display_name ||
              session.user.user_metadata?.name ||
              null,
            avatarUrl: dbProfile?.avatar_url || session.user.user_metadata?.avatar_url || null,
            role: dbProfile?.role || "user",
            createdAt: dbProfile?.created_at || session.user.created_at,
            updatedAt: dbProfile?.updated_at || session.user.updated_at || new Date().toISOString(),
          };
          setProfile(mappedProfile);
          router.refresh();
        }
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        router.push("/");
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <AuthContext.Provider value={{ profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
