"use client";

import { useState, useEffect, useTransition } from "react";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Package,
  Settings,
  Video,
  Save,
  Loader2,
  Search,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  BookmarkCheck,
  CheckCircle2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { AdminPackageManager } from "./admin-package-manager";
import { AdminSettingsForm } from "./admin-settings-form";
import {
  getAlternativesForExerciseAction,
  setAlternativesAction,
} from "@/features/exercises/actions";
import { updateSystemExerciseAction } from "@/features/admin/actions";
import type { Exercise, WorkoutPackage, WorkoutTemplate } from "@/types";

interface AdminDashboardTabsProps {
  overview: {
    totalUsers: number;
    totalWorkouts: number;
    totalExercises: number;
    totalWeightLogs: number;
    totalPersonalRecords: number;
  };
  exercises: Exercise[];
  packages: WorkoutPackage[];
  templates: WorkoutTemplate[];
}

export function AdminDashboardTabs({
  overview,
  exercises: initialExercises,
  packages: initialPackages,
  templates,
}: AdminDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);

  // --- ALTERNATIVES TAB STATE ---
  const [selectedBaseExerciseId, setSelectedBaseExerciseId] = useState<string>("");
  const [alt1, setAlt1] = useState<string>("none");
  const [alt2, setAlt2] = useState<string>("none");
  const [alt3, setAlt3] = useState<string>("none");
  const [isLoadingAlts, setIsLoadingAlts] = useState(false);
  const [isSavingAlts, setIsSavingAlts] = useState(false);

  // Load existing alternatives when base exercise changes
  useEffect(() => {
    if (!selectedBaseExerciseId) {
      setAlt1("none");
      setAlt2("none");
      setAlt3("none");
      return;
    }

    const fetchAlts = async () => {
      setIsLoadingAlts(true);
      try {
        const result = await getAlternativesForExerciseAction(selectedBaseExerciseId);
        if (result.success) {
          const alts = result.data;
          setAlt1(alts.find((a) => a.preferenceOrder === 1)?.alternativeId || "none");
          setAlt2(alts.find((a) => a.preferenceOrder === 2)?.alternativeId || "none");
          setAlt3(alts.find((a) => a.preferenceOrder === 3)?.alternativeId || "none");
        } else {
          toast.error(result.error || "Failed to load alternatives.");
        }
      } catch (err) {
        toast.error("Failed to load exercise alternatives.");
      } finally {
        setIsLoadingAlts(false);
      }
    };

    fetchAlts();
  }, [selectedBaseExerciseId]);

  const handleSaveAlternatives = async () => {
    if (!selectedBaseExerciseId) {
      toast.error("Please select a base exercise first.");
      return;
    }

    setIsSavingAlts(true);
    const toastId = toast.loading("Saving alternatives...");

    try {
      const selectedAlts = [alt1, alt2, alt3].filter((id) => id !== "none");
      // Validate uniqueness
      const uniqueAlts = Array.from(new Set(selectedAlts));
      if (uniqueAlts.length !== selectedAlts.length) {
        toast.error("Duplicate alternative exercises are not allowed.", { id: toastId });
        setIsSavingAlts(false);
        return;
      }

      const result = await setAlternativesAction(selectedBaseExerciseId, uniqueAlts);
      if (result.success) {
        toast.success("Alternatives updated successfully!", { id: toastId });
      } else {
        toast.error(result.error || "Failed to save alternatives.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.", { id: toastId });
    } finally {
      setIsSavingAlts(false);
    }
  };

  // --- VIDEOS TAB STATE ---
  const [videoSearchQuery, setVideoSearchQuery] = useState("");
  const [savingVideoId, setSavingVideoId] = useState<string | null>(null);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>(() => {
    const urls: Record<string, string> = {};
    initialExercises.forEach((ex) => {
      urls[ex.id] = ex.videoUrl || "";
    });
    return urls;
  });

  const handleSaveVideoUrl = async (exercise: Exercise) => {
    const newUrl = videoUrls[exercise.id]?.trim() || "";
    if (newUrl === (exercise.videoUrl || "")) {
      toast.info("No changes made to this video link.");
      return;
    }

    setSavingVideoId(exercise.id);
    const toastId = toast.loading(`Updating video URL for ${exercise.name}...`);

    try {
      const result = await updateSystemExerciseAction(exercise.id, {
        name: exercise.name,
        primaryMuscleGroup: exercise.primaryMuscleGroup,
        secondaryMuscleGroup: exercise.secondaryMuscleGroup,
        description: exercise.description,
        videoUrl: newUrl || null,
        category: (exercise.category as any) || "Upper",
        equipment: exercise.equipment || "",
        difficulty: exercise.difficulty || "Beginner",
        alternativeExercise: exercise.alternativeExercise || "",
        notes: exercise.notes || "",
      });

      if (result.success) {
        toast.success("Video URL updated successfully!", { id: toastId });
        // Update local exercises state
        setExercises(
          exercises.map((e) => (e.id === exercise.id ? result.data : e))
        );
      } else {
        toast.error(result.error || "Failed to update video URL.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred updating video URL.", { id: toastId });
    } finally {
      setSavingVideoId(null);
    }
  };

  const filteredVideoExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(videoSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex flex-wrap gap-1 p-1 bg-muted/60 rounded-xl max-w-full">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Package className="h-3.5 w-3.5" />
            <span>Workout Programs</span>
          </TabsTrigger>
          <TabsTrigger value="alternatives" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <BookmarkCheck className="h-3.5 w-3.5" />
            <span>Alternatives</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Video className="h-3.5 w-3.5" />
            <span>Videos</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Settings className="h-3.5 w-3.5" />
            <span>System Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Card className="border border-border/80 bg-card p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Users</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-extrabold font-mono text-foreground">{overview.totalUsers}</span>
              </div>
            </Card>
            <Card className="border border-border/80 bg-card p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Workouts</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-extrabold font-mono text-foreground">{overview.totalWorkouts}</span>
              </div>
            </Card>
            <Card className="border border-border/80 bg-card p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Exercises</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-extrabold font-mono text-foreground">{overview.totalExercises}</span>
              </div>
            </Card>
            <Card className="border border-border/80 bg-card p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Weight Logs</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-extrabold font-mono text-foreground">{overview.totalWeightLogs}</span>
              </div>
            </Card>
            <Card className="border border-border/80 bg-card p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PR Lifts</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-extrabold font-mono text-foreground">{overview.totalPersonalRecords}</span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border border-border/80 bg-card shadow-sm space-y-4 p-6">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>User & RBAC Controls</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manage user profiles, view individual training activity logs, and edit authorization permissions. Only Super Admins can customize roles.
              </p>
              <a
                href="/administration/users"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "flex items-center gap-1.5 w-fit font-semibold"
                )}
              >
                <span>Manage Users</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </Card>

            <Card className="border border-border/80 bg-card shadow-sm space-y-4 p-6">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-muted-foreground" />
                <span>Global Exercises Library</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create, update, and delete system-wide movements. Changes will reflect globally across all user workout selections.
              </p>
              <a
                href="/administration/exercises"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "flex items-center gap-1.5 w-fit font-semibold"
                )}
              >
                <span>Manage Library</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </Card>
          </div>
        </TabsContent>

        {/* 2. PACKAGES TAB */}
        <TabsContent value="packages" className="outline-none">
          <AdminPackageManager initialPackages={initialPackages} availableTemplates={templates} />
        </TabsContent>

        {/* 3. ALTERNATIVES TAB */}
        <TabsContent value="alternatives" className="outline-none">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BookmarkCheck className="h-5 w-5 text-indigo-500" />
                <span>Exercise Alternatives Manager</span>
              </CardTitle>
              <CardDescription>
                Map substitution options for global movements. Users can swap exercises dynamically during active training sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Select Base Exercise */}
              <div className="space-y-2 max-w-md">
                <Label htmlFor="base-exercise-select" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Select Target Movement
                </Label>
                <Select
                  value={selectedBaseExerciseId}
                  onValueChange={(val) => setSelectedBaseExerciseId(val || "")}
                >
                  <SelectTrigger id="base-exercise-select" className="h-10 bg-background border-border">
                    <SelectValue placeholder="Choose base exercise..." />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises.map((ex) => (
                      <SelectItem key={ex.id} value={ex.id}>
                        {ex.name} ({ex.primaryMuscleGroup})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBaseExerciseId ? (
                <div className="border-t border-border/40 pt-6 space-y-4 max-w-md">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Configure Alternatives (Up to 3, preference ordered)
                  </h3>

                  {isLoadingAlts ? (
                    <div className="py-8 text-center flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-xs">Loading mapped alternatives...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Alternative 1 */}
                      <div className="space-y-1.5">
                        <Label htmlFor="alt-1-select" className="text-[11px] font-semibold text-muted-foreground uppercase">
                          Alternative 1 (Primary Swap)
                        </Label>
                        <Select value={alt1} onValueChange={(val) => setAlt1(val || "none")}>
                          <SelectTrigger id="alt-1-select" className="h-9 bg-background border-border">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None (Empty)</SelectItem>
                            {exercises
                              .filter((ex) => ex.id !== selectedBaseExerciseId)
                              .map((ex) => (
                                <SelectItem key={ex.id} value={ex.id}>
                                  {ex.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Alternative 2 */}
                      <div className="space-y-1.5">
                        <Label htmlFor="alt-2-select" className="text-[11px] font-semibold text-muted-foreground uppercase">
                          Alternative 2 (Secondary Swap)
                        </Label>
                        <Select value={alt2} onValueChange={(val) => setAlt2(val || "none")}>
                          <SelectTrigger id="alt-2-select" className="h-9 bg-background border-border">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None (Empty)</SelectItem>
                            {exercises
                              .filter((ex) => ex.id !== selectedBaseExerciseId)
                              .map((ex) => (
                                <SelectItem key={ex.id} value={ex.id}>
                                  {ex.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Alternative 3 */}
                      <div className="space-y-1.5">
                        <Label htmlFor="alt-3-select" className="text-[11px] font-semibold text-muted-foreground uppercase">
                          Alternative 3 (Tertiary Swap)
                        </Label>
                        <Select value={alt3} onValueChange={(val) => setAlt3(val || "none")}>
                          <SelectTrigger id="alt-3-select" className="h-9 bg-background border-border">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None (Empty)</SelectItem>
                            {exercises
                              .filter((ex) => ex.id !== selectedBaseExerciseId)
                              .map((ex) => (
                                <SelectItem key={ex.id} value={ex.id}>
                                  {ex.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleSaveAlternatives}
                        disabled={isSavingAlts}
                        className="mt-2 w-full h-10 font-semibold flex items-center justify-center gap-1.5"
                      >
                        {isSavingAlts ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Alternatives
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-dashed rounded-xl p-8 text-center text-xs text-muted-foreground">
                  Please select an exercise above to configure its alternatives.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. VIDEOS TAB */}
        <TabsContent value="videos" className="outline-none">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Video className="h-5 w-5 text-indigo-500" />
                <span>Exercise Video Reference Manager</span>
              </CardTitle>
              <CardDescription>
                Assign coaching video guides or YouTube execution links for all library movements.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Search input */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Filter movements..."
                  value={videoSearchQuery}
                  onChange={(e) => setVideoSearchQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>

              <div className="border border-border/60 bg-card rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6 w-[240px]">Movement</TableHead>
                      <TableHead className="w-[120px]">Category</TableHead>
                      <TableHead>Video Reference URL</TableHead>
                      <TableHead className="text-right pr-6 w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVideoExercises.length > 0 ? (
                      filteredVideoExercises.map((ex) => (
                        <TableRow key={ex.id} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="pl-6 font-bold text-foreground text-sm">
                            {ex.name}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-semibold">
                            {ex.category || "Upper"}
                          </TableCell>
                          <TableCell>
                            <Input
                              value={videoUrls[ex.id] ?? ""}
                              onChange={(e) =>
                                setVideoUrls({ ...videoUrls, [ex.id]: e.target.value })
                              }
                              placeholder="e.g. https://www.youtube.com/watch?v=..."
                              className="h-8 text-xs font-mono bg-background border-border max-w-md"
                            />
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {ex.videoUrl && (
                                <a
                                  href={ex.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                  title="Test URL"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() => handleSaveVideoUrl(ex)}
                                disabled={savingVideoId === ex.id}
                                className="h-8 font-semibold flex items-center gap-1"
                              >
                                {savingVideoId === ex.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Save className="h-3.5 w-3.5" />
                                )}
                                <span>Save</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-xs">
                          No matching exercises found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. SYSTEM SETTINGS TAB */}
        <TabsContent value="settings" className="outline-none">
          <AdminSettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
