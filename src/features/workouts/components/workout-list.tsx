"use client";

import { WorkoutCard } from "./workout-card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus, Play, Clock, Sparkles } from "lucide-react";
import { startWorkoutAction, startWorkoutFromTemplateAction } from "../actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { routes } from "@/config/routes";
import type { Workout, WorkoutTemplate, WorkoutPackage } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface WorkoutListProps {
  initialWorkouts: Workout[];
  templates?: WorkoutTemplate[];
  packages?: WorkoutPackage[];
}

export function WorkoutList({ initialWorkouts, templates = [], packages = [] }: WorkoutListProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [startingTemplateId, setStartingTemplateId] = useState<string | null>(null);

  const handleStartWorkout = async () => {
    setIsStarting(true);
    const toastId = toast.loading("Starting empty workout...");
    try {
      const result = await startWorkoutAction();
      if (result.success) {
        toast.success("Workout started", { id: toastId });
        router.push(routes.workoutActive);
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to start workout", { id: toastId });
    } finally {
      setIsStarting(false);
    }
  };

  const handleStartTemplate = async (templateId: string, templateName: string) => {
    setStartingTemplateId(templateId);
    const toastId = toast.loading(`Starting template "${templateName}"...`);
    try {
      const result = await startWorkoutFromTemplateAction(templateId);
      if (result.success) {
        toast.success(`Active session initialized: ${templateName}`, { id: toastId });
        router.push(routes.workoutActive);
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to load workout template", { id: toastId });
    } finally {
      setStartingTemplateId(null);
    }
  };

  // Find templates that are not part of any package
  const packagedTemplateIds = new Set(
    packages.flatMap((pkg) => pkg.templates?.map((t) => t.id) || [])
  );
  const standaloneTemplates = templates.filter((tpl) => !packagedTemplateIds.has(tpl.id));

  const renderTemplateCard = (tpl: WorkoutTemplate) => {
    const numExercises = tpl.templateExercises?.length || 0;
    return (
      <Card key={tpl.id} className="border border-border bg-card hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-foreground">
            {tpl.name}
          </CardTitle>
          <CardDescription className="text-xs line-clamp-2 mt-1 min-h-[2rem]">
            {tpl.description || "No description provided."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground border-t border-border/40 pt-3">
            <span className="flex items-center gap-1">
              <Dumbbell className="h-3.5 w-3.5" />
              {numExercises} {numExercises === 1 ? "exercise" : "exercises"}
            </span>
          </div>
          <div className="text-xs">
            <span className="font-semibold text-foreground/80 block">Focus:</span>
            <span className="text-muted-foreground block truncate mt-0.5" title={tpl.muscleFocus}>
              {tpl.muscleFocus}
            </span>
          </div>
          <Button
            onClick={() => handleStartTemplate(tpl.id, tpl.name)}
            disabled={startingTemplateId !== null || isStarting}
            className="w-full text-xs font-semibold h-9 mt-1"
          >
            <Play className="h-3 w-3 mr-1.5 fill-current" />
            <span>Start Workout</span>
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-10">
      {/* Templates Section grouped by Packages */}
      <div className="space-y-8">
        <div className="flex items-center justify-between pl-1">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-5.5 w-5.5 text-amber-500" />
            Workout Templates & Programs
          </h2>
        </div>

        {packages.map((pkg) => {
          if (!pkg.templates || pkg.templates.length === 0) return null;
          return (
            <div key={pkg.id} className="space-y-4 bg-muted/20 p-5 rounded-2xl border">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {pkg.name}
                </h3>
                {pkg.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pkg.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pkg.templates.map((tpl) => renderTemplateCard(tpl))}
              </div>
            </div>
          );
        })}

        {standaloneTemplates.length > 0 && (
          <div className="space-y-4 bg-muted/5 p-5 rounded-2xl border border-dashed">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Standalone Templates
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Individual workout sessions not linked to a training split.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {standaloneTemplates.map((tpl) => renderTemplateCard(tpl))}
            </div>
          </div>
        )}

        {packages.length === 0 && standaloneTemplates.length === 0 && (
          <div className="text-center py-8 border rounded-lg bg-card text-muted-foreground text-sm">
            No templates seeded. Go to Settings &rarr; Seed Data to load default templates.
          </div>
        )}
      </div>

      <hr className="border-border/60" />

      {/* History Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground pl-1">
          Workout History
        </h2>

        {initialWorkouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl py-16 px-4 text-center bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Dumbbell className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
              No workout history
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              You haven't logged any workouts yet. Start an active session to begin tracking your progress.
            </p>
            <Button
              onClick={handleStartWorkout}
              disabled={isStarting}
              className="mt-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Start Empty Workout</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
