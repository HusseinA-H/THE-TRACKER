"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "../actions";
import { LogOut, Settings, User, Loader2, ShieldAlert } from "lucide-react";
import { routes } from "@/config/routes";
import type { UserProfile } from "@/types";

interface UserAvatarProps {
  profile: UserProfile | null;
}

export function UserAvatar({ profile }: UserAvatarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  const getInitials = () => {
    if (!profile) return "U";
    if (profile.displayName) {
      return profile.displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return profile.email.slice(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer">
        <Avatar className="w-9 h-9 border border-border">
          <AvatarImage
            src={profile?.avatarUrl || undefined}
            alt={profile?.displayName || "User Avatar"}
          />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile?.displayName || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {profile?.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(routes.profile)}>
          <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        {profile?.role && (profile.role === "admin" || profile.role === "super_admin") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/administration")}>
              <ShieldAlert className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Admin Panel</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isPending}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>{isPending ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
