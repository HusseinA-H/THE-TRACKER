"use client";

import { useState, useTransition } from "react";
import { Calendar, CheckCircle2, ChevronRight, Lock, Play, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateScheduleSettingsAction } from "../actions";
import { CYCLE_DAYS, calculateCycleDay } from "../utils/cycle";
import type { UserScheduleSettings } from "@/types";
import { formatDate } from "@/lib/utils";

interface ScheduleViewProps {
  initialSettings: UserScheduleSettings;
}

export function ScheduleView({ initialSettings }: ScheduleViewProps) {
  const [settings, setSettings] = useState<UserScheduleSettings>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [cycleStartDate, setCycleStartDate] = useState(settings.cycleStartDate);

  const handleUpdateStartDate = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading("Updating cycle start date...");
    try {
      const result = await updateScheduleSettingsAction(cycleStartDate);
      if (result.success) {
        toast.success("Schedule realigned successfully!", { id: toastId });
        setSettings(result.data);
      } else {
        toast.error(result.error || "Failed to update schedule settings", { id: toastId });
      }
    } catch (err) {
      toast.error("An error occurred during submission", { id: toastId });
    }
  };

  // Get status of a cycle day relative to today
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCycle = calculateCycleDay(todayStr, settings.cycleStartDate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Cycle List Column (2/3 width) */}
      <Card className="md:col-span-2 border border-border bg-card shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-semibold">10-Day Rotation Cycle</CardTitle>
          <CardDescription>Your rolling split training sequence. Today's target is highlighted.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {CYCLE_DAYS.map((day) => {
              const isTodayTarget = todayCycle.index === day.index;

              return (
                <div
                  key={day.index}
                  className={`flex items-center justify-between p-4 border rounded-2xl transition-all ${
                    isTodayTarget
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border/60 hover:bg-muted/10 bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Index circle */}
                    <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold font-mono border ${
                      isTodayTarget
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border/40"
                    }`}>
                      {day.index + 1}
                    </span>
                    <div>
                      <span className={`text-sm font-bold ${
                        isTodayTarget ? "text-primary" : "text-foreground"
                      }`}>
                        {day.name}
                      </span>
                      {day.isRest && (
                        <span className="text-[10px] text-muted-foreground/60 italic ml-2">(Recovery)</span>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator Badges */}
                  <div>
                    {isTodayTarget ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">
                        <Play className="h-2.5 w-2.5 fill-current" /> Today's Routine
                      </span>
                    ) : day.isRest ? (
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted border border-border/40 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                        Rest Day
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-muted-foreground/50 border border-border/10 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Adjust Start Date Column (1/3 width) */}
      <div className="space-y-6">
        <Card className="border border-border bg-card shadow-sm h-fit">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-primary" /> Align Schedule
            </CardTitle>
            <CardDescription>Pick a date to set as Day 1 (Upper A) of your rolling cycle.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleUpdateStartDate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cycle-start-date" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Day 1 Epoch Start
                </Label>
                <Input
                  id="cycle-start-date"
                  type="date"
                  value={cycleStartDate}
                  onChange={(e) => setCycleStartDate(e.target.value)}
                  className="h-10 font-mono text-sm bg-background border-border"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-10 mt-2 font-semibold flex items-center justify-center gap-1.5">
                <RefreshCw className="h-4 w-4" /> Realign Rotation
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Schedule Info Card */}
        <Card className="border border-border bg-card shadow-sm p-4 text-xs text-muted-foreground leading-relaxed space-y-2.5">
          <div className="flex items-center gap-2 text-foreground font-bold uppercase tracking-wider">
            <Info className="h-4.5 w-4.5 text-primary shrink-0" />
            <span>How it works</span>
          </div>
          <p>
            The athlete split operates on a rolling **10-day sequence** instead of fixed calendar weekdays. This allows you to space workouts and recovery rest days optimally without being bound by weekly constraints.
          </p>
          <p>
            Realigning the schedule changes the **Epoch Date** (Day 1) of the cycle. All calendar calculations and scheduled targets will update dynamically based on this start date.
          </p>
        </Card>
      </div>
    </div>
  );
}
