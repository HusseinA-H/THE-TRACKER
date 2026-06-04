"use client";

import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { UserAvatar } from "@/features/auth/components/user-avatar";
import Image from "next/image";
import Link from "next/link";
import type { UserProfile } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  profile: UserProfile | null;
}

export function AppShell({ children, profile }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar on desktop */}
      <Sidebar profile={profile} />

      {/* Main layout container */}
      <div className="md:pl-64 flex flex-col min-h-screen pb-16 md:pb-0">
        {/* Mobile top bar header */}
        <header className="md:hidden flex h-16 items-center justify-between px-6 border-b border-border bg-card">
          <Link href="/dashboard" className="flex items-center gap-2">
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
              THE TRACKER
            </span>
          </Link>
          <UserAvatar profile={profile} />
        </header>

        {/* Page Content area */}
        <main className="flex-1 px-4 py-6 md:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Bottom nav on mobile */}
      <BottomNav profile={profile} />
    </div>
  );
}
