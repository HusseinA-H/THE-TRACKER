"use client";

import { useAuth } from "@/providers/auth-provider";

export function useUser() {
  const { profile, isLoading } = useAuth();
  return {
    user: profile,
    isLoading,
    isAuthenticated: !!profile,
  };
}
