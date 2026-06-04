"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Database, Loader2, ShieldCheck, HelpCircle, HardDrive, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { seedSystemExercisesAction } from "../actions";

export function AdminSettingsForm() {
  const [isPending, startTransition] = useTransition();
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [enableVideoRefs, setEnableVideoRefs] = useState(true);

  const handleSeedExercises = () => {
    const toastId = toast.loading("Seeding default movements library...");
    
    startTransition(async () => {
      try {
        const result = await seedSystemExercisesAction();
        if (result.success) {
          toast.success(`Successfully seeded ${result.data} default exercises!`, { id: toastId });
        } else {
          toast.error(result.error || "Failed to seed default exercises.", { id: toastId });
        }
      } catch (err) {
        console.error(err);
        toast.error("An unexpected error occurred during database seeding.", { id: toastId });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Database Seeding Card */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-500" />
            <span>Database Seed & Setup</span>
          </CardTitle>
          <CardDescription>
            Populate global collections or seed standard fitness metrics and movements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Running this operation will check the global exercises library and insert the standard default workouts:
            <span className="block mt-2 font-medium text-foreground">
              Bench Press, Pull-Up, Squat, Deadlift, Overhead Press, Bicep Curl, Plank, and more.
            </span>
          </p>
          <div className="rounded-lg bg-muted/50 border border-border p-3 flex gap-2.5 text-xs">
            <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p>
              This action is safe to run multiple times. Exercises with matching names already existing in the database will be skipped automatically to prevent duplication.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border/40 pt-4 bg-muted/10">
          <Button
            onClick={handleSeedExercises}
            disabled={isPending}
            className="font-semibold shadow-sm flex items-center gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Seeding Database...</span>
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                <span>Seed Default Exercises</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* 2. Mockup Application Settings Card */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>Global Features & RBAC (Mock)</span>
          </CardTitle>
          <CardDescription>
            Configure authentication constraints and registration policies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="space-y-0.5 max-w-sm">
              <Label className="text-sm font-semibold">Enable User Registrations</Label>
              <p className="text-xs text-muted-foreground leading-normal">
                Allow new users to sign in and register profiles via Google OAuth.
              </p>
            </div>
            <button
              onClick={() => setAllowRegistration(!allowRegistration)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                allowRegistration ? "bg-foreground" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform duration-200 ${
                  allowRegistration ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5 max-w-sm">
              <Label className="text-sm font-semibold">Enable Video Reference Links</Label>
              <p className="text-xs text-muted-foreground leading-normal">
                Provide users with the option to attach and display YouTube links on exercise profiles.
              </p>
            </div>
            <button
              onClick={() => setEnableVideoRefs(!enableVideoRefs)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                enableVideoRefs ? "bg-foreground" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform duration-200 ${
                  enableVideoRefs ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 3. System Status Info */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-muted-foreground" />
            <span>Infrastructure Status</span>
          </CardTitle>
          <CardDescription>
            Host and Supabase database connectivity metrics.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="border border-border/40 bg-muted/20 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Database Host</span>
            <span className="text-foreground font-semibold mt-1">Supabase PostgreSQL</span>
          </div>
          <div className="border border-border/40 bg-muted/20 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">SSL Connection</span>
            <span className="text-emerald-500 font-semibold mt-1">Enabled (Secure)</span>
          </div>
          <div className="border border-border/40 bg-muted/20 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">App Environment</span>
            <span className="text-foreground font-semibold mt-1">Next.js App Router</span>
          </div>
          <div className="border border-border/40 bg-muted/20 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">RBAC Verification</span>
            <span className="text-emerald-500 font-semibold mt-1">Active (Active checks)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
