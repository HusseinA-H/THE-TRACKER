"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2, Lock, HelpCircle, Activity, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getCalendarDaysForMonthAction } from "../actions";
import type { CalendarDayInfo } from "../services/schedule-service";
import { routes } from "@/config/routes";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<CalendarDayInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed

  useEffect(() => {
    const fetchCalendar = async () => {
      setIsLoading(true);
      try {
        const res = await getCalendarDaysForMonthAction(year, month);
        if (res.success) {
          setDays(res.data);
        } else {
          toast.error(res.error || "Failed to load calendar days");
        }
      } catch (err) {
        toast.error("An error occurred loading calendar");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCalendar();
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  // Get index of the first day of the month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const firstDayIndex = new Date(year, month - 1, 1).getDay();
  // Map Sun-Sat (0-6) to Mon-Sun (0-6)
  const firstDayOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Render blanks for grid alignment before day 1
  const gridBlanks = Array(firstDayOffset).fill(null);

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <Card className="border border-border bg-card shadow-sm overflow-hidden">
        {/* Month selector header */}
        <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between px-6">
          <div>
            <CardTitle className="text-lg font-bold">{monthName} {year}</CardTitle>
            <CardDescription className="text-xs">Your training schedule and logging completion.</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4.5 w-4.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 text-xs font-semibold">
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
              <ChevronRight className="h-4.5 w-4.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-muted-foreground pb-2 border-b border-border/20 uppercase tracking-wider mb-2">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {isLoading ? (
            <div className="h-80 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <span className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Computing training cycle...</span>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Blanks */}
              {gridBlanks.map((_, idx) => (
                <div key={`blank-${idx}`} className="aspect-square bg-muted/5 rounded-xl border border-transparent" />
              ))}

              {/* Month Days */}
              {days.map((dayInfo, idx) => {
                const dayNum = parseInt(dayInfo.date.split("-")[2], 10);
                
                // Determine styling based on status
                let borderStyle = "border-border/60";
                let bgStyle = "bg-card";
                let textStyle = "text-foreground";
                
                if (dayInfo.isToday) {
                  borderStyle = "border-primary ring-2 ring-primary/20";
                }

                if (dayInfo.isCompleted) {
                  bgStyle = "bg-emerald-500/10";
                  borderStyle = "border-emerald-500/30";
                } else if (dayInfo.isMissed) {
                  bgStyle = "bg-red-500/5";
                  borderStyle = "border-red-500/20";
                } else if (dayInfo.isRestDay) {
                  bgStyle = "bg-muted/30";
                  textStyle = "text-muted-foreground";
                }

                return (
                  <div
                    key={dayInfo.date}
                    className={`aspect-square p-2 border rounded-2xl flex flex-col justify-between transition-all group relative ${bgStyle} ${borderStyle} ${textStyle}`}
                  >
                    {/* Day number & today dot */}
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold font-mono">{dayNum}</span>
                      {dayInfo.isToday && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>

                    {/* Cycle Routine Indicator */}
                    <div className="text-[9px] font-bold truncate max-w-full">
                      {dayInfo.isRestDay ? (
                        <span className="text-muted-foreground/60 italic font-medium">Rest</span>
                      ) : (
                        <span className={dayInfo.isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                          {dayInfo.scheduledDayName}
                        </span>
                      )}
                    </div>

                    {/* Completion / Status icon overlay */}
                    <div className="flex justify-end items-end h-4">
                      {dayInfo.isCompleted && dayInfo.workoutId ? (
                        <Link
                          href={routes.workoutDetail(dayInfo.workoutId)}
                          className="text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform"
                          title={`Completed: ${dayInfo.workoutName}`}
                        >
                          <CheckCircle2 className="h-4 w-4 fill-emerald-500/10" />
                        </Link>
                      ) : dayInfo.isMissed ? (
                        <span className="text-red-500 text-[8px] font-bold bg-red-500/10 px-1 rounded-sm border border-red-500/20 uppercase">
                          Missed
                        </span>
                      ) : !dayInfo.isRestDay && new Date(dayInfo.date) > new Date() ? (
                        <span title="Upcoming session">
                          <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend Card */}
      <Card className="border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">✓</span>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-md bg-red-500/5 border border-red-500/20 text-red-500 flex items-center justify-center text-[9px] font-bold">M</span>
            <span>Missed Workout</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-md bg-muted/30 border border-border/60" />
            <span>Rest Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-md bg-card border-primary ring-1 ring-primary/20" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
            <span>Upcoming (Locked)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
