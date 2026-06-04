"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Edit, Trash2, Dumbbell, ClipboardList, ArrowLeft, MoveUp, MoveDown, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { WorkoutTemplate, WorkoutTemplateExercise, Exercise } from "@/types";
import {
  createWorkoutTemplateAction,
  updateWorkoutTemplateAction,
  deleteWorkoutTemplateAction,
  addTemplateExerciseAction,
  updateTemplateExerciseAction,
  deleteTemplateExerciseAction,
} from "@/features/workouts/actions";

interface AdminTemplateManagerProps {
  initialTemplates: WorkoutTemplate[];
  availableExercises: Exercise[];
}

export function AdminTemplateManager({
  initialTemplates,
  availableExercises,
}: AdminTemplateManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);

  // Template Form Dialog state
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<WorkoutTemplate | null>(null);
  const [tplName, setTplName] = useState("");
  const [tplDesc, setTplDesc] = useState("");
  const [tplDuration, setTplDuration] = useState("60");
  const [tplFocus, setTplFocus] = useState("Full Body");

  // Add Exercise Dialog state
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");

  // Local state for editing template exercises row values inline
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editTargetSets, setEditTargetSets] = useState(3);
  const [editTargetReps, setEditTargetReps] = useState("10-12");
  const [editWarmupSets, setEditWarmupSets] = useState(0);
  const [editWorkingSets, setEditWorkingSets] = useState(3);

  // Filter templates
  const filteredTemplates = initialTemplates.filter((tpl) =>
    tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tpl.description && tpl.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateTemplateClick = () => {
    setTemplateToEdit(null);
    setTplName("");
    setTplDesc("");
    setTplDuration("60");
    setTplFocus("Full Body");
    setTemplateFormOpen(true);
  };

  const handleEditTemplateClick = (tpl: WorkoutTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplateToEdit(tpl);
    setTplName(tpl.name);
    setTplDesc(tpl.description || "");
    setTplDuration(tpl.estimatedDuration.toString());
    setTplFocus(tpl.muscleFocus);
    setTemplateFormOpen(true);
  };

  const handleTemplateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim()) {
      toast.error("Template name is required.");
      return;
    }

    const duration = parseInt(tplDuration, 10) || 60;
    const toastId = toast.loading(templateToEdit ? "Updating template..." : "Creating template...");

    try {
      if (templateToEdit) {
        const result = await updateWorkoutTemplateAction(templateToEdit.id, {
          name: tplName,
          description: tplDesc || null,
          estimatedDuration: duration,
          muscleFocus: tplFocus,
        });

        if (result.success) {
          toast.success("Template updated successfully", { id: toastId });
          setTemplateFormOpen(false);
          // Update selectedTemplate if we are currently viewing it
          if (selectedTemplate?.id === templateToEdit.id) {
            setSelectedTemplate({
              ...selectedTemplate,
              name: tplName,
              description: tplDesc || null,
              estimatedDuration: duration,
              muscleFocus: tplFocus,
            });
          }
          startTransition(() => {
            router.refresh();
          });
        } else {
          toast.error(result.error || "Failed to update template", { id: toastId });
        }
      } else {
        const result = await createWorkoutTemplateAction(
          tplName,
          tplDesc || null,
          duration,
          tplFocus
        );

        if (result.success) {
          toast.success("Template created successfully", { id: toastId });
          setTemplateFormOpen(false);
          startTransition(() => {
            router.refresh();
          });
        } else {
          toast.error(result.error || "Failed to create template", { id: toastId });
        }
      }
    } catch (err) {
      toast.error("An error occurred.", { id: toastId });
    }
  };

  const handleDeleteTemplateClick = async (tpl: WorkoutTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete the workout template "${tpl.name}"?`)) {
      return;
    }

    const toastId = toast.loading(`Deleting ${tpl.name}...`);
    try {
      const result = await deleteWorkoutTemplateAction(tpl.id);
      if (result.success) {
        toast.success(`Deleted "${tpl.name}"`, { id: toastId });
        if (selectedTemplate?.id === tpl.id) {
          setSelectedTemplate(null);
        }
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(result.error || `Could not delete ${tpl.name}`, { id: toastId });
      }
    } catch (err) {
      toast.error("Failed to delete template.", { id: toastId });
    }
  };

  // Manage template exercises
  const handleSelectTemplate = (tpl: WorkoutTemplate) => {
    // Re-load the latest state from initialTemplates
    const latestTpl = initialTemplates.find((t) => t.id === tpl.id) || tpl;
    setSelectedTemplate(latestTpl);
  };

  const handleAddExerciseClick = () => {
    setExerciseSearchQuery("");
    setAddExerciseOpen(true);
  };

  const handleSelectExerciseToAdd = async (exercise: Exercise) => {
    if (!selectedTemplate) return;

    // Check if exercise already in template
    const exists = selectedTemplate.templateExercises?.some(
      (te) => te.exerciseId === exercise.id
    );
    if (exists) {
      toast.error(`"${exercise.name}" is already in this template.`);
      return;
    }

    const nextSeq = (selectedTemplate.templateExercises?.length || 0) + 1;
    const toastId = toast.loading(`Adding ${exercise.name}...`);

    try {
      const result = await addTemplateExerciseAction(
        selectedTemplate.id,
        exercise.id,
        nextSeq,
        3, // targetSets
        "10-12", // targetReps
        0, // warmupSets
        3 // workingSets
      );

      if (result.success) {
        toast.success(`Added ${exercise.name}`, { id: toastId });
        setAddExerciseOpen(false);
        // Refresh selected template
        startTransition(() => {
          router.refresh();
          // Update local state by finding the updated template
          setTimeout(() => {
            const updatedTpl = initialTemplates.find((t) => t.id === selectedTemplate.id);
            if (updatedTpl) setSelectedTemplate(updatedTpl);
          }, 100);
        });
      } else {
        toast.error(result.error || "Failed to add exercise", { id: toastId });
      }
    } catch (err) {
      toast.error("An error occurred adding exercise.", { id: toastId });
    }
  };

  const handleStartEditExercise = (te: WorkoutTemplateExercise) => {
    setEditingExerciseId(te.id);
    setEditTargetSets(te.targetSets);
    setEditTargetReps(te.targetReps);
    setEditWarmupSets(te.warmupSets);
    setEditWorkingSets(te.workingSets);
  };

  const handleSaveExerciseEdit = async (te: WorkoutTemplateExercise) => {
    const toastId = toast.loading("Saving exercise targets...");
    try {
      const result = await updateTemplateExerciseAction(te.id, {
        targetSets: editTargetSets,
        targetReps: editTargetReps,
        warmupSets: editWarmupSets,
        workingSets: editWorkingSets,
      });

      if (result.success) {
        toast.success("Saved targets", { id: toastId });
        setEditingExerciseId(null);
        startTransition(() => {
          router.refresh();
          setTimeout(() => {
            if (selectedTemplate) {
              const updatedTpl = initialTemplates.find((t) => t.id === selectedTemplate.id);
              if (updatedTpl) setSelectedTemplate(updatedTpl);
            }
          }, 100);
        });
      } else {
        toast.error(result.error || "Failed to save", { id: toastId });
      }
    } catch (e) {
      toast.error("Error saving exercise targets", { id: toastId });
    }
  };

  const handleDeleteTemplateExercise = async (te: WorkoutTemplateExercise) => {
    if (!confirm(`Remove "${te.exercise?.name}" from this template?`)) return;

    const toastId = toast.loading("Removing exercise...");
    try {
      const result = await deleteTemplateExerciseAction(te.id);
      if (result.success) {
        toast.success("Removed exercise", { id: toastId });
        startTransition(() => {
          router.refresh();
          setTimeout(() => {
            if (selectedTemplate) {
              const updatedTpl = initialTemplates.find((t) => t.id === selectedTemplate.id);
              if (updatedTpl) setSelectedTemplate(updatedTpl);
            }
          }, 100);
        });
      } else {
        toast.error(result.error || "Failed to remove", { id: toastId });
      }
    } catch (e) {
      toast.error("Error removing exercise", { id: toastId });
    }
  };

  const handleMoveExercise = async (te: WorkoutTemplateExercise, direction: "up" | "down") => {
    if (!selectedTemplate || !selectedTemplate.templateExercises) return;
    
    const exercises = [...selectedTemplate.templateExercises].sort(
      (a, b) => a.sequenceNumber - b.sequenceNumber
    );
    const index = exercises.findIndex((item) => item.id === te.id);

    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === exercises.length - 1) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const swapTe = exercises[swapIndex];

    const toastId = toast.loading("Reordering exercises...");
    try {
      const p1 = updateTemplateExerciseAction(te.id, { sequenceNumber: swapTe.sequenceNumber });
      const p2 = updateTemplateExerciseAction(swapTe.id, { sequenceNumber: te.sequenceNumber });

      const [r1, r2] = await Promise.all([p1, p2]);

      if (r1.success && r2.success) {
        toast.success("Order updated", { id: toastId });
        startTransition(() => {
          router.refresh();
          setTimeout(() => {
            const updatedTpl = initialTemplates.find((t) => t.id === selectedTemplate.id);
            if (updatedTpl) setSelectedTemplate(updatedTpl);
          }, 100);
        });
      } else {
        toast.error("Failed to reorder", { id: toastId });
      }
    } catch (e) {
      toast.error("Error reordering", { id: toastId });
    }
  };

  // Filter available exercises to add
  const filteredExercisesToAdd = availableExercises.filter((ex) =>
    ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
    ex.primaryMuscleGroup.toLowerCase().includes(exerciseSearchQuery.toLowerCase())
  );

  // Detail View of a specific template
  if (selectedTemplate) {
    // Reload full details in case of updates
    const tpl = initialTemplates.find((t) => t.id === selectedTemplate.id) || selectedTemplate;
    const sortedExercises = (tpl.templateExercises || []).sort(
      (a, b) => a.sequenceNumber - b.sequenceNumber
    );

    return (
      <div className="space-y-6">
        {/* Detail Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTemplate(null)}
              className="-ml-3 text-muted-foreground hover:text-foreground flex items-center gap-1 h-8"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Templates</span>
            </Button>
            <h2 className="text-xl font-bold tracking-tight text-foreground mt-1 flex items-center gap-2">
              <ClipboardList className="h-5.5 w-5.5 text-indigo-500" />
              <span>{tpl.name}</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              {tpl.description || "No description provided."}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>Duration: <strong className="text-foreground">{tpl.estimatedDuration} min</strong></span>
              <span>•</span>
              <span>Focus: <strong className="text-foreground">{tpl.muscleFocus}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={(e) => handleEditTemplateClick(tpl, e)}>
              <Edit className="h-4 w-4 mr-1.5" />
              <span>Edit Template Info</span>
            </Button>
            <Button size="sm" onClick={handleAddExerciseClick}>
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Add Exercise</span>
            </Button>
          </div>
        </div>

        {/* Exercises Table inside the Template */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardHeader className="pb-3 bg-muted/20 border-b border-border/30">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
              <span>Exercises in Template</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Define target set types and rep counts for this standard workout.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {sortedExercises.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6 w-[60px] text-center">Seq</TableHead>
                      <TableHead className="min-w-[200px]">Exercise</TableHead>
                      <TableHead className="w-[120px] text-center">Target Sets</TableHead>
                      <TableHead className="w-[150px] text-center">Target Reps</TableHead>
                      <TableHead className="w-[120px] text-center">Warmup Sets</TableHead>
                      <TableHead className="w-[120px] text-center">Working Sets</TableHead>
                      <TableHead className="w-[120px] text-center">Reorder</TableHead>
                      <TableHead className="text-right pr-6 w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedExercises.map((te, idx) => {
                      const isEditing = editingExerciseId === te.id;
                      return (
                        <TableRow key={te.id} className="hover:bg-muted/10 transition-colors">
                          {/* Seq */}
                          <TableCell className="pl-6 font-bold text-sm text-center text-muted-foreground font-mono">
                            {idx + 1}
                          </TableCell>

                          {/* Exercise name */}
                          <TableCell className="font-semibold text-sm">
                            <div>
                              <div>{te.exercise?.name || "Exercise"}</div>
                              <span className="text-[10px] text-muted-foreground font-normal">
                                {te.exercise?.primaryMuscleGroup}
                              </span>
                            </div>
                          </TableCell>

                          {/* Target Sets */}
                          <TableCell className="text-center py-3">
                            {isEditing ? (
                              <Input
                                type="number"
                                className="w-16 h-8 mx-auto text-center font-mono text-xs"
                                value={editTargetSets}
                                onChange={(e) => setEditTargetSets(parseInt(e.target.value, 10) || 0)}
                              />
                            ) : (
                              <span className="font-mono text-sm">{te.targetSets}</span>
                            )}
                          </TableCell>

                          {/* Target Reps */}
                          <TableCell className="text-center py-3">
                            {isEditing ? (
                              <Input
                                className="w-20 h-8 mx-auto text-center font-mono text-xs"
                                value={editTargetReps}
                                onChange={(e) => setEditTargetReps(e.target.value)}
                              />
                            ) : (
                              <span className="font-mono text-sm bg-muted/40 px-1.5 py-0.5 rounded text-muted-foreground">
                                {te.targetReps}
                              </span>
                            )}
                          </TableCell>

                          {/* Warmup Sets */}
                          <TableCell className="text-center py-3">
                            {isEditing ? (
                              <Input
                                type="number"
                                className="w-16 h-8 mx-auto text-center font-mono text-xs"
                                value={editWarmupSets}
                                onChange={(e) => setEditWarmupSets(parseInt(e.target.value, 10) || 0)}
                              />
                            ) : (
                              <span className="font-mono text-sm text-amber-600">{te.warmupSets}</span>
                            )}
                          </TableCell>

                          {/* Working Sets */}
                          <TableCell className="text-center py-3">
                            {isEditing ? (
                              <Input
                                type="number"
                                className="w-16 h-8 mx-auto text-center font-mono text-xs"
                                value={editWorkingSets}
                                onChange={(e) => setEditWorkingSets(parseInt(e.target.value, 10) || 0)}
                              />
                            ) : (
                              <span className="font-mono text-sm">{te.workingSets}</span>
                            )}
                          </TableCell>

                          {/* Reorder Buttons */}
                          <TableCell className="text-center py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => handleMoveExercise(te, "up")}
                                disabled={idx === 0}
                              >
                                <MoveUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => handleMoveExercise(te, "down")}
                                disabled={idx === sortedExercises.length - 1}
                              >
                                <MoveDown className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="pr-6 text-right py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              {isEditing ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  onClick={() => handleSaveExerciseEdit(te)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleStartEditExercise(te)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteTemplateExercise(te)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <Dumbbell className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-semibold text-muted-foreground">Template is empty</p>
                <p className="text-xs text-muted-foreground/60 max-w-xs">
                  Click the "Add Exercise" button above to include standard movements inside this workout routine.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Exercise Modal */}
        <Dialog open={addExerciseOpen} onOpenChange={setAddExerciseOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Add Exercise to Template</DialogTitle>
              <DialogDescription>
                Search and select a movement from the database catalog to append to {tpl.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="relative py-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={exerciseSearchQuery}
                onChange={(e) => setExerciseSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto border border-border/60 rounded-lg divide-y divide-border/40">
              {filteredExercisesToAdd.length > 0 ? (
                filteredExercisesToAdd.map((ex) => (
                  <button
                    key={ex.id}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-muted/40 transition-colors flex items-center justify-between text-sm group"
                    onClick={() => handleSelectExerciseToAdd(ex)}
                  >
                    <div>
                      <span className="font-semibold text-foreground group-hover:text-indigo-600 transition-colors">
                        {ex.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {ex.primaryMuscleGroup}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-medium border-border/80">
                      Add
                    </Badge>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No matching exercises found.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Info Form Dialog Modal */}
        <Dialog open={templateFormOpen} onOpenChange={setTemplateFormOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <form onSubmit={handleTemplateFormSubmit}>
              <DialogHeader>
                <DialogTitle>{templateToEdit ? "Edit Template Info" : "Create Workout Template"}</DialogTitle>
                <DialogDescription>
                  Modify the basic details of this predefined hypertrophy training program.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tplName">Template Name</Label>
                  <Input
                    id="tplName"
                    value={tplName}
                    onChange={(e) => setTplName(e.target.value)}
                    placeholder="e.g. Upper Body A"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tplDesc">Description</Label>
                  <Textarea
                    id="tplDesc"
                    value={tplDesc}
                    onChange={(e) => setTplDesc(e.target.value)}
                    placeholder="Provide a detailed summary of exercises or muscle focus..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tplDuration">Est. Duration (mins)</Label>
                    <Input
                      id="tplDuration"
                      type="number"
                      value={tplDuration}
                      onChange={(e) => setTplDuration(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tplFocus">Muscle Focus</Label>
                    <Input
                      id="tplFocus"
                      value={tplFocus}
                      onChange={(e) => setTplFocus(e.target.value)}
                      placeholder="e.g. Chest, Back"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setTemplateFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {templateToEdit ? "Save Details" : "Create Template"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Grid/List View of all templates
  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search workout templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <Button onClick={handleCreateTemplateClick} className="h-10 font-semibold flex items-center gap-1.5 shrink-0 shadow-sm">
          <Plus className="h-4.5 w-4.5" />
          <span>Create Template</span>
        </Button>
      </div>

      {/* Templates Grid List */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => {
            const numExercises = tpl.templateExercises?.length || 0;
            return (
              <Card
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className="border border-border bg-card hover:border-indigo-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
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
                    <span className="flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      {tpl.estimatedDuration} min
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-foreground/80 block">Focus:</span>
                    <span className="text-muted-foreground block truncate mt-0.5" title={tpl.muscleFocus}>
                      {tpl.muscleFocus}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 border-t border-border/30 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleEditTemplateClick(tpl, e)}
                      className="flex-1 text-xs"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      <span>Edit Info</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteTemplateClick(tpl, e)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed rounded-2xl flex flex-col items-center justify-center space-y-3 bg-card">
          <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-semibold text-muted-foreground">No templates found</p>
          <p className="text-xs text-muted-foreground/60 max-w-xs">
            Try adjusting your search query, or click the button above to define a new training program template.
          </p>
        </div>
      )}

      {/* Create / Edit Template Dialog Modal */}
      <Dialog open={templateFormOpen} onOpenChange={setTemplateFormOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleTemplateFormSubmit}>
            <DialogHeader>
              <DialogTitle>{templateToEdit ? "Edit Template Info" : "Create Workout Template"}</DialogTitle>
              <DialogDescription>
                Define the basics of a training program template. Exercises can be added in the detail view after creation.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="tplName">Template Name</Label>
                <Input
                  id="tplName"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  placeholder="e.g. Upper Body A"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tplDesc">Description</Label>
                <Textarea
                  id="tplDesc"
                  value={tplDesc}
                  onChange={(e) => setTplDesc(e.target.value)}
                  placeholder="Provide a detailed summary of exercises or muscle focus..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tplDuration">Est. Duration (mins)</Label>
                  <Input
                    id="tplDuration"
                    type="number"
                    value={tplDuration}
                    onChange={(e) => setTplDuration(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tplFocus">Muscle Focus</Label>
                  <Input
                    id="tplFocus"
                    value={tplFocus}
                    onChange={(e) => setTplFocus(e.target.value)}
                    placeholder="e.g. Chest, Back"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setTemplateFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {templateToEdit ? "Save Details" : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
