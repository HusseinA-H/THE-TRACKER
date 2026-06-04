"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, Scale, Dumbbell, ShieldAlert, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import { changeUserRoleAction } from "../actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminUserRow {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  role: "super_admin" | "admin" | "user";
  workoutsCount: number;
  lastActivity: string | null;
}

interface UserManagementTableProps {
  users: AdminUserRow[];
  currentAdminRole: "super_admin" | "admin";
}

export function UserManagementTable({
  users,
  currentAdminRole,
}: UserManagementTableProps) {
  const [search, setSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: any) => {
    setUpdatingUserId(userId);
    const toastId = toast.loading("Updating user permission role...");
    try {
      const result = await changeUserRoleAction(userId, newRole);
      if (result.success) {
        toast.success("Role updated successfully", { id: toastId });
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to update role", { id: toastId });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filtered = users.filter((u) => {
    const name = u.displayName || "";
    const email = u.email || "";
    const query = search.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  const getInitials = (user: AdminUserRow) => {
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users by name/email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4 border-border bg-background"
        />
      </div>

      {/* Users Table */}
      <div className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
        {filtered.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">User</TableHead>
                <TableHead className="text-center">Workouts</TableHead>
                <TableHead className="text-center">Joined Date</TableHead>
                <TableHead className="text-center">Last Active</TableHead>
                <TableHead className="text-center">Role / Permissions</TableHead>
                <TableHead className="w-[80px] pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  {/* Profile info */}
                  <TableCell className="pl-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border border-border">
                        <AvatarImage src={user.avatarUrl || undefined} />
                        <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {user.displayName || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate font-mono">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Workouts logged count */}
                  <TableCell className="text-center py-3.5 font-bold font-mono">
                    {user.workoutsCount}
                  </TableCell>

                  {/* Joined Date */}
                  <TableCell className="text-center py-3.5 text-xs font-medium text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>

                  <TableCell className="text-center py-3.5 text-xs font-semibold text-foreground/80">
                    <RelativeTime date={user.lastActivity} />
                  </TableCell>

                  {/* Role editing dropdown */}
                  <TableCell className="text-center py-3.5">
                    <div className="flex justify-center">
                      <Select
                        value={user.role}
                        disabled={
                          currentAdminRole !== "super_admin" ||
                          updatingUserId === user.id
                        }
                        onValueChange={(val) => handleRoleChange(user.id, val)}
                      >
                        <SelectTrigger className="h-8 w-36 text-xs font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>

                  {/* Details Link button */}
                  <TableCell className="pr-6 py-3.5 text-right">
                    <Link
                      href={`/administration/users/${user.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "h-8 w-8 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <ChevronRight className="h-4.5 w-4.5" />
                      <span className="sr-only">View user details</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
            <ShieldAlert className="h-8 w-8 text-muted-foreground/30" />
            <p>No user profiles match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
