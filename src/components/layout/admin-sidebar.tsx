"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  BarChart2,
  Settings,
  ArrowLeft,
  ShieldCheck,
  ClipboardList,
  Package,
} from "lucide-react";
import { UserAvatar } from "@/features/auth/components/user-avatar";
import type { UserProfile } from "@/types";

interface AdminSidebarProps {
  profile: UserProfile | null;
}

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname();

  const adminNavItems = [
    { label: "Overview", href: "/administration", icon: LayoutDashboard },
    { label: "Users", href: "/administration/users", icon: Users },
    { label: "Exercises", href: "/administration/exercises", icon: Dumbbell },
    { label: "Templates", href: "/administration/templates", icon: ClipboardList },
    { label: "Packages", href: "/administration/packages", icon: Package },
    { label: "Analytics", href: "/administration/analytics", icon: BarChart2 },
    { label: "Settings", href: "/administration/settings", icon: Settings },
  ] as const;

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Branding header */}
        <div className="flex items-center h-16 px-6 border-b border-border/60 justify-between">
          <Link href="/administration" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="THE TRACKER Logo"
              width={24}
              height={24}
              priority
              style={{ width: 'auto' }}
              className="h-6 object-contain"
            />
            <span className="font-extrabold text-sm tracking-tight text-foreground">
              TRACKER ADMIN
            </span>
          </Link>
        </div>

        {/* Admin Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {adminNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/administration" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border border-transparent",
                  isActive
                    ? "bg-foreground text-background font-bold shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-border/40 my-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              <span>Back to App</span>
            </Link>
          </div>
        </nav>

        {/* Admin User Info */}
        <div className="flex items-center justify-between p-4 border-t border-border/60">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar profile={profile} />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground truncate leading-none">
                {profile?.displayName || "Admin"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                {profile?.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
