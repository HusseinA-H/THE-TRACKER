"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/routes";
import {
  LayoutDashboard,
  Dumbbell,
  ListChecks,
  Calendar,
  CalendarClock,
  Activity,
  Camera,
  Scale,
  Trophy,
  ShieldAlert,
} from "lucide-react";
import type { UserProfile } from "@/types";

interface BottomNavProps {
  profile: UserProfile | null;
}

export function BottomNav({ profile }: BottomNavProps) {
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

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-background/95 backdrop-blur-md z-30 flex items-center justify-around px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold transition-all duration-150 gap-0.5",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-full transition-colors",
              isActive ? "bg-muted text-foreground" : "text-muted-foreground"
            )}>
              {getIcon(item.icon, "h-4.5 w-4.5")}
            </div>
            <span className="leading-none">{item.label}</span>
          </Link>
        );
      })}

      {isAdmin && (() => {
        const isActive = pathname.startsWith("/administration");
        return (
          <Link
            href="/administration"
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold transition-all duration-150 gap-0.5",
              isActive ? "text-indigo-600 dark:text-indigo-400" : "text-indigo-500/80 hover:text-indigo-600"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-full transition-colors",
              isActive ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600" : "text-indigo-500/80"
            )}>
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <span className="leading-none">Admin</span>
          </Link>
        );
      })()}
    </nav>
  );
}
