import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Dumbbell, Scale, Trophy, Calendar, User, History, ShieldAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAdminUserDetails } from "@/features/admin/services/admin-service";
import { verifyAdmin } from "@/features/admin/security";
import { UserRoleSelector } from "@/features/admin/components/user-role-selector";
import { formatDate, formatDuration } from "@/lib/utils";
import { getMuscleGroupColor } from "@/features/exercises/utils/muscle-groups";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

interface AdminUserDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AdminUserDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const details = await getAdminUserDetails(id);
    return {
      title: `${details.profile.displayName || "User"} Details`,
    };
  } catch {
    return {
      title: "User Details",
    };
  }
}

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { id } = await params;
  const { role: currentAdminRole } = await verifyAdmin();
  
  let details;
  try {
    details = await getAdminUserDetails(id);
  } catch (error) {
    notFound();
  }

  const { profile, stats, recentWorkouts, recentWeightLogs, customExercises } = details;

  const getInitials = () => {
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
    <div className="space-y-6">
      {/* Back button link */}
      <div className="flex items-center gap-2">
        <Link
          href="/administration/users"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-3 h-8 text-muted-foreground hover:text-foreground flex items-center gap-1"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Users</span>
        </Link>
      </div>

      <PageHeader
        title={profile.displayName || "User Details"}
        description={`Administrative profile analysis for ${profile.email}`}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column - Profile Card */}
        <div className="space-y-6">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="text-center pb-4 flex flex-col items-center">
              <Avatar className="w-16 h-16 border border-border">
                <AvatarImage src={profile.avatarUrl || undefined} />
                <AvatarFallback className="text-lg font-bold bg-muted text-muted-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg font-bold mt-3 leading-tight">
                {profile.displayName || "User"}
              </CardTitle>
              <CardDescription className="font-mono text-xs truncate max-w-full">
                {profile.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 border-t border-border/40 py-4 text-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Joined Date:</span>
                <span className="font-semibold text-foreground">{formatDate(profile.createdAt)}</span>
              </div>

              {/* Role selector dropdown */}
              <UserRoleSelector
                userId={profile.id}
                initialRole={profile.role}
                disabled={currentAdminRole !== "super_admin"}
              />
            </CardContent>
          </Card>

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="border border-border bg-card p-3 rounded-xl shadow-sm">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Workouts</span>
              <p className="text-xl font-extrabold font-mono text-foreground mt-0.5">{stats.totalWorkouts}</p>
            </div>
            <div className="border border-border bg-card p-3 rounded-xl shadow-sm">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Weight Logs</span>
              <p className="text-xl font-extrabold font-mono text-foreground mt-0.5">{stats.totalWeightLogs}</p>
            </div>
            <div className="border border-border bg-card p-3 rounded-xl shadow-sm">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">PR Lifts</span>
              <p className="text-xl font-extrabold font-mono text-foreground mt-0.5">{stats.totalPRs}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Workouts & Weights history */}
        <div className="md:col-span-2 space-y-6">
          {/* Recent Workouts */}
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-muted-foreground" />
                <span>Recent Completed Workouts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentWorkouts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Workout</TableHead>
                      <TableHead className="text-center">Exercises</TableHead>
                      <TableHead className="text-right pr-6">Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentWorkouts.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="pl-6 py-2.5 font-bold text-sm text-foreground">
                          {w.name}
                        </TableCell>
                        <TableCell className="text-center py-2.5 font-mono text-xs">
                          {w.exercisesCount}
                        </TableCell>
                        <TableCell className="text-right pr-6 py-2.5 text-xs text-muted-foreground font-mono">
                          {w.completedAt ? formatDate(w.completedAt) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No workouts completed by this user yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Weight Logs */}
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Scale className="h-5 w-5 text-muted-foreground" />
                <span>Recent Weight Logs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentWeightLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Date</TableHead>
                      <TableHead className="text-right pr-6">Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentWeightLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="pl-6 py-2.5 text-sm font-medium">
                          {formatDate(log.logDate)}
                        </TableCell>
                        <TableCell className="text-right pr-6 py-2.5 font-bold font-mono">
                          {log.weight.toFixed(1)} kg
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No weights logged by this user yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Exercises */}
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>Custom Exercises Created</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {customExercises.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Exercise</TableHead>
                      <TableHead className="pr-6">Muscle Group</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customExercises.map((ex) => (
                      <TableRow key={ex.id}>
                        <TableCell className="pl-6 py-2.5 font-bold text-sm text-foreground">
                          {ex.name}
                        </TableCell>
                        <TableCell className="pr-6 py-2.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium px-2 py-0.5 border ${getMuscleGroupColor(
                              ex.primaryMuscleGroup
                            )}`}
                          >
                            {ex.primaryMuscleGroup}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No custom exercises created by this user yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
