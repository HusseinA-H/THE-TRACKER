"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeUserRoleAction } from "../actions";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface UserRoleSelectorProps {
  userId: string;
  initialRole: "super_admin" | "admin" | "user";
  disabled: boolean;
}

export function UserRoleSelector({
  userId,
  initialRole,
  disabled,
}: UserRoleSelectorProps) {
  const [role, setRole] = useState(initialRole);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async (newRole: any) => {
    setIsUpdating(true);
    const toastId = toast.loading("Updating user permission role...");
    try {
      const result = await changeUserRoleAction(userId, newRole);
      if (result.success) {
        toast.success("Role updated successfully", { id: toastId });
        setRole(newRole);
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to update role", { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-1.5 max-w-[200px]">
      <Label htmlFor="detailRoleSelect">Permission Role</Label>
      <Select
        value={role}
        disabled={disabled || isUpdating}
        onValueChange={handleRoleChange}
      >
        <SelectTrigger id="detailRoleSelect" className="h-9 w-full text-xs font-semibold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="super_admin">Super Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
