"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/routes";
import {
  LayoutDashboard,
  Dumbbell,
  ListChecks,
  Scale,
  Trophy,
  User,
  Settings,
  ShieldAlert,
  Calendar,
  CalendarClock,
  Activity,
  Camera,
} from "lucide-react";
import { UserAvatar } from "@/features/auth/components/user-avatar";
import type { UserProfile } from "@/types";

interface SidebarProps {
  profile: UserProfile | null;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();

  const getIcon = (iconName: string, className?: string) => {
    switch (iconName) {
      case "LayoutDashboard":
        return <LayoutDashboard className={className} />;
      case "Dumbbell":
        return <Dumbbell className={className} />;
      case "ListChecks":
        return <ListChecks className={className} />;
      case "Calendar":
        return <Calendar className={className} />;
      case "CalendarClock":
        return <CalendarClock className={className} />;
      case "Activity":
        return <Activity className={className} />;
      case "Camera":
        return <Camera className={className} />;
      case "Scale":
        return <Scale className={className} />;
      case "Trophy":
        return <Trophy className={className} />;
      default:
        return null;
    }
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
      <div className="flex flex-col flex-1 min-h-0">
        {/* App Title & Branding */}
        <div className="flex items-center h-16 px-6 border-b border-border/60">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="THE TRACKER Logo"
              width={24}
              height={24}
              priority
              style={{ width: 'auto' }}
              className="h-6 object-contain"
            />
            <span className="font-extrabold text-base tracking-tight text-foreground">
              THE TRACKER
            </span>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                {getIcon(item.icon, "h-4.5 w-4.5")}
                <span>{item.label}</span>
              </Link>
            );
          })}

          {profile?.role && (profile.role === "admin" || profile.role === "super_admin") && (() => {
            const isActive = pathname.startsWith("/administration");
            return (
              <Link
                href="/administration"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border border-transparent",
                  isActive
                    ? "bg-indigo-600 text-white font-bold shadow-sm hover:bg-indigo-700"
                    : "text-indigo-600 dark:text-indigo-400 hover:bg-muted"
                )}
              >
                <ShieldAlert className="h-4.5 w-4.5" />
                <span>Admin Panel</span>
              </Link>
            );
          })()}
        </nav>

        {/* User Profile avatar info at bottom */}
        <div className="flex items-center justify-between p-4 border-t border-border/60">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar profile={profile} />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground truncate leading-none">
                {profile?.displayName || "User"}
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
