"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Video, Edit2, Trash2, Search, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import type { Exercise } from "../types";
import { getExerciseHistoryAction } from "@/features/workouts/actions";
import { getAlternativesForExerciseAction } from "@/features/exercises/actions";
import { swapWorkoutExerciseAction } from "@/features/workouts/actions";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface ExerciseDetailDrawerProps {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  userRole?: "super_admin" | "admin" | "user";
  activeWorkoutId?: string;
}

export function ExerciseDetailDrawer({
  exercise,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  userRole = "user",
  activeWorkoutId,
}: ExerciseDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "notes" | "alternatives">("overview");
  
  // History Tab State
  const [history, setHistory] = useState<any[]>([]);
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Notes Tab State
  const [notesTimeline, setNotesTimeline] = useState<{ date: string; note: string; workoutName: string }[]>([]);
  const [isNotesLoading, setIsNotesLoading] = useState(false);

  // Alternatives Tab State
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [isAlternativesLoading, setIsAlternativesLoading] = useState(false);

  useEffect(() => {
    if (!exercise || !open) return;
    
    // Reset state on open
    setActiveTab("overview");
    setHistoryPage(1);
    setHistorySearch("");
    setHistory([]);
    setNotesTimeline([]);
    setAlternatives([]);
  }, [exercise, open]);

  // Fetch History
  useEffect(() => {
    if (!exercise || !open || activeTab !== "history") return;
    
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      const res = await getExerciseHistoryAction(exercise.id, historyPage, 5, historySearch);
      if (res.success && res.data) {
        setHistory(res.data.history);
        setTotalHistoryCount(res.data.totalCount);
      } else {
        toast.error("Failed to load history");
      }
      setIsHistoryLoading(false);
    };
    fetchHistory();
  }, [exercise, open, activeTab, historyPage, historySearch]);

  // Fetch Notes Timeline
  useEffect(() => {
    if (!exercise || !open || activeTab !== "notes") return;
    
    const fetchNotes = async () => {
      setIsNotesLoading(true);
      // Fetch a larger page of history to parse out all notes
      const res = await getExerciseHistoryAction(exercise.id, 1, 100, "");
      if (res.success && res.data) {
        const timeline = res.data.history
          .filter((h) => h.notes && h.notes.trim() !== "")
          .map((h) => ({
            date: h.workoutCompletedAt || h.createdAt,
            note: h.notes || "",
            workoutName: h.workoutName || "Workout",
          }));
        setNotesTimeline(timeline);
      }
      setIsNotesLoading(false);
    };
    fetchNotes();
  }, [exercise, open, activeTab]);

  // Fetch Alternatives
  useEffect(() => {
    if (!exercise || !open || activeTab !== "alternatives") return;
    
    const fetchAlternatives = async () => {
      setIsAlternativesLoading(true);
      const res = await getAlternativesForExerciseAction(exercise.id);
      if (res.success && res.data) {
        setAlternatives(res.data);
      } else {
        toast.error("Failed to load alternatives");
      }
      setIsAlternativesLoading(false);
    };
    fetchAlternatives();
  }, [exercise, open, activeTab]);

  if (!exercise) return null;

  const isAdmin = userRole === "admin" || userRole === "super_admin";
  const canManage = onEdit && onDelete && (isAdmin || (exercise.isCustom && exercise.userId !== null));

  const handleSwap = async (alternativeId: string, altName: string) => {
    if (!activeWorkoutId || !exercise) return;
    if (!confirm(`Swap "${exercise.name}" with "${altName}" in current workout?`)) return;

    const toastId = toast.loading(`Swapping exercise...`);
    const res = await swapWorkoutExerciseAction(activeWorkoutId, exercise.id, alternativeId);
    if (res.success) {
      toast.success("Swapped exercises successfully", { id: toastId });
      onOpenChange(false);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to swap exercise", { id: toastId });
    }
  };

  // Group history entries by date for display
  const groupHistoryByDate = (entries: any[]) => {
    const groups: Record<string, { workoutName: string; sets: any[]; totalVolume: number }> = {};
    entries.forEach((entry) => {
      const dateKey = entry.workoutCompletedAt ? entry.workoutCompletedAt.split("T")[0] : "Unknown Date";
      if (!groups[dateKey]) {
        groups[dateKey] = {
          workoutName: entry.workoutName || "Completed Workout",
          sets: [],
          totalVolume: 0,
        };
      }
      groups[dateKey].sets.push(entry);
      groups[dateKey].totalVolume += Number(entry.weight) * Number(entry.reps);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const groupedHistory = groupHistoryByDate(history);
  const totalPages = Math.ceil(totalHistoryCount / 5) || 1;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[440px] overflow-y-auto h-full flex flex-col p-0">
        <SheetHeader className="p-6 border-b pb-4">
          <SheetTitle className="text-xl font-bold text-foreground">
            {exercise.name}
          </SheetTitle>
          <SheetDescription className="mt-0.5">
            Exercise detail, history, and alternative movements
          </SheetDescription>
        </SheetHeader>

        {/* Tab Headers */}
        <div className="border-b border-border bg-muted/20 px-6 py-2">
          <div className="flex p-0.5 bg-muted rounded-lg gap-0.5">
            {(["overview", "history", "notes", "alternatives"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-xs font-semibold capitalize rounded-md transition-all ${
                  activeTab === tab
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content Pane */}
        <div className="flex-1 p-6 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="px-2.5 py-1 text-xs">
                  {exercise.primaryMuscleGroup}
                </Badge>
                {exercise.difficulty && (
                  <Badge
                    variant={
                      exercise.difficulty === "Beginner"
                        ? "default"
                        : exercise.difficulty === "Intermediate"
                        ? "secondary"
                        : "destructive"
                    }
                    className="px-2.5 py-1 text-xs"
                  >
                    {exercise.difficulty}
                  </Badge>
                )}
                {exercise.isCustom ? (
                  <Badge variant="outline" className="px-2.5 py-1 text-xs border-dashed text-primary border-primary bg-primary/5">
                    Custom
                  </Badge>
                ) : (
                  <Badge variant="outline" className="px-2.5 py-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    System Standard
                  </Badge>
                )}
              </div>

              <hr className="border-border" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Category
                  </span>
                  <span className="font-medium text-foreground mt-0.5 block">
                    {exercise.category || "General"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Equipment
                  </span>
                  <span className="font-medium text-foreground mt-0.5 block">
                    {exercise.equipment || "None"}
                  </span>
                </div>
              </div>

              <hr className="border-border" />

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description / Instructions
                </h4>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {exercise.description || "No description provided."}
                </p>
              </div>

              {exercise.notes && (
                <div className="space-y-2 bg-muted/40 p-3 rounded-lg border border-border">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Coaching Notes
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {exercise.notes}
                  </p>
                </div>
              )}

              {exercise.videoUrl && (
                <div className="pt-2">
                  <a
                    href={exercise.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    <Video className="w-4 h-4" />
                    Watch Demo
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search logs by name/note..."
                  value={historySearch}
                  onChange={(e) => {
                    setHistorySearch(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="pl-8 h-8 text-xs bg-muted/20"
                />
              </div>

              {isHistoryLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-xs">Loading training logs...</span>
                </div>
              ) : groupedHistory.length > 0 ? (
                <div className="space-y-4">
                  {groupedHistory.map(([date, group]) => (
                    <div key={date} className="border border-border rounded-xl p-3 bg-muted/10">
                      <div className="flex justify-between items-start border-b border-border/40 pb-1.5 mb-2">
                        <div>
                          <p className="text-xs font-bold text-foreground">{formatDate(date)}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{group.workoutName}</p>
                        </div>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">
                          Vol: {group.totalVolume} kg
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {group.sets.map((set, idx) => (
                          <div key={set.id} className="flex justify-between items-center text-xs text-muted-foreground pl-1.5">
                            <span>Set {set.setNumber} ({set.setType}):</span>
                            <span className="font-semibold text-foreground">
                              {set.weight} kg x {set.reps} {set.isPr && "🎉"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={historyPage === 1}
                        onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Page {historyPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={historyPage === totalPages}
                        onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
                  <p className="text-xs font-medium">No workout history found.</p>
                  <p className="text-[10px] mt-0.5">Complete workouts containing this exercise.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NOTES TIMELINE */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              {isNotesLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-xs">Loading training cues...</span>
                </div>
              ) : notesTimeline.length > 0 ? (
                <div className="relative border-l-2 border-border/80 ml-3 pl-4 space-y-4">
                  {notesTimeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      {/* Circle indicator */}
                      <span className="absolute -left-[23px] top-1.5 flex h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground">{formatDate(item.date)}</span>
                        <span className="text-[9px] text-muted-foreground/60 ml-2">({item.workoutName})</span>
                        <p className="text-xs text-foreground mt-1 bg-muted/30 p-2 rounded-lg border border-border/30">
                          {item.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
                  <p className="text-xs font-medium">No coaching notes logged yet.</p>
                  <p className="text-[10px] mt-0.5">Add comments to sets during workouts.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ALTERNATIVES */}
          {activeTab === "alternatives" && (
            <div className="space-y-4">
              {activeWorkoutId && (
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-[11px] text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Swapping will replace this exercise in your current workout. Entered set configurations will be preserved under the new movement.</span>
                </div>
              )}

              {isAlternativesLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-xs">Loading alternatives...</span>
                </div>
              ) : alternatives.length > 0 ? (
                <div className="space-y-2">
                  {alternatives.map((alt) => (
                    <div key={alt.id} className="flex justify-between items-center p-3 border rounded-xl hover:bg-muted/10 transition-colors">
                      <div>
                        <span className="text-xs font-bold text-foreground">
                          {alt.alternative?.name || "Alternative Exercise"}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {alt.alternative?.primaryMuscleGroup} · Pref: {alt.preferenceOrder}
                        </p>
                      </div>

                      {activeWorkoutId ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSwap(alt.alternativeId, alt.alternative?.name || "")}
                          className="h-7 text-[10px] font-bold border-primary/30 text-primary bg-primary/5 hover:bg-primary hover:text-white"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Swap
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Pref {alt.preferenceOrder}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
                  <p className="text-xs font-medium">No alternatives mapped.</p>
                  <p className="text-[10px] mt-0.5">Standard split swaps can be linked by admins.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Global Action Footer */}
        {canManage && (
          <div className="flex gap-3 p-6 border-t border-border bg-muted/10">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 font-semibold"
              onClick={() => {
                onOpenChange(false);
                onEdit(exercise);
              }}
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Exercise
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1 gap-1.5 font-semibold"
              onClick={() => {
                onOpenChange(false);
                onDelete(exercise);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Exercise
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
