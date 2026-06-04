"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { User, Loader2 } from "lucide-react";
import { profileFormSchema, type ProfileFormValues } from "../schemas";
import { updateProfileAction } from "../actions";
import { formatDate } from "@/lib/utils";
import type { UserProfile } from "../types";

interface ProfileFormProps {
  profile: UserProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: profile.displayName || "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Updating profile...");
    try {
      const result = await updateProfileAction(values);
      if (result.success) {
        toast.success("Profile updated successfully", { id: toastId });
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to update profile", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-border bg-card shadow-sm max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <span>Profile Information</span>
        </CardTitle>
        <CardDescription>
          Update your public profile details and display name
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Email (Disabled) */}
          <div className="space-y-1.5">
            <Label htmlFor="profileEmail" className="text-muted-foreground">Email address</Label>
            <Input
              id="profileEmail"
              type="email"
              value={profile.email}
              disabled
              className="bg-muted font-mono text-sm border-border text-muted-foreground/80 cursor-not-allowed"
            />
            <p className="text-[10px] text-muted-foreground/80">
              Email addresses cannot be changed and are linked to your Google Account.
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="e.g. John Doe"
              {...register("displayName")}
              disabled={isSubmitting}
            />
            {errors.displayName && (
              <p className="text-xs font-medium text-destructive">
                {errors.displayName.message}
              </p>
            )}
          </div>

          {/* Joined Date */}
          <div className="pt-2 text-xs text-muted-foreground">
            <span>Member since: </span>
            <span className="font-semibold text-foreground">{formatDate(profile.createdAt)}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Save Profile</span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
