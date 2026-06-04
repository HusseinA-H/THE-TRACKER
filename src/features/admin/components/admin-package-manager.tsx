"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Edit2, Package, Unlink, Loader2, Sparkles, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  createWorkoutPackageAction,
  updateWorkoutPackageAction,
  deleteWorkoutPackageAction,
  addTemplateToPackageAction,
  removeTemplateFromPackageAction,
} from "@/features/workouts/actions";
import type { WorkoutPackage, WorkoutTemplate } from "@/types";

interface AdminPackageManagerProps {
  initialPackages: WorkoutPackage[];
  availableTemplates: WorkoutTemplate[];
}

export function AdminPackageManager({
  initialPackages,
  availableTemplates,
}: AdminPackageManagerProps) {
  const [packages, setPackages] = useState<WorkoutPackage[]>(initialPackages);
  const [isPending, startTransition] = useTransition();

  // Create/Edit Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState<WorkoutPackage | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Delete Dialog States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<WorkoutPackage | null>(null);

  // Link select states (packageId -> templateId to link)
  const [linkSelections, setLinkSelections] = useState<Record<string, string>>({});

  const handleOpenCreate = () => {
    setPackageToEdit(null);
    setName("");
    setDescription("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pkg: WorkoutPackage) => {
    setPackageToEdit(pkg);
    setName(pkg.name);
    setDescription(pkg.description || "");
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Package name is required.");
      return;
    }

    const toastId = toast.loading(packageToEdit ? "Updating package..." : "Creating package...");
    startTransition(async () => {
      try {
        let result;
        if (packageToEdit) {
          result = await updateWorkoutPackageAction(packageToEdit.id, {
            name: name.trim(),
            description: description.trim() || null,
          });
        } else {
          result = await createWorkoutPackageAction(name.trim(), description.trim() || null);
        }

        if (result.success) {
          toast.success(
            packageToEdit ? "Package updated successfully" : "Package created successfully",
            { id: toastId }
          );

          if (packageToEdit) {
            setPackages(
              packages.map((p) =>
                p.id === packageToEdit.id
                  ? { ...p, name: result.data.name, description: result.data.description }
                  : p
              )
            );
          } else {
            setPackages([...packages, result.data]);
          }
          setIsFormOpen(false);
        } else {
          toast.error(result.error || "Failed to save package", { id: toastId });
        }
      } catch (err: any) {
        toast.error(err.message || "An unexpected error occurred", { id: toastId });
      }
    });
  };

  const handleOpenDelete = (pkg: WorkoutPackage) => {
    setPackageToDelete(pkg);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!packageToDelete) return;

    const toastId = toast.loading("Deleting package...");
    startTransition(async () => {
      try {
        const result = await deleteWorkoutPackageAction(packageToDelete.id);
        if (result.success) {
          toast.success("Package deleted successfully", { id: toastId });
          setPackages(packages.filter((p) => p.id !== packageToDelete.id));
          setIsDeleteDialogOpen(false);
        } else {
          toast.error(result.error || "Failed to delete package", { id: toastId });
        }
      } catch (err: any) {
        toast.error(err.message || "An unexpected error occurred", { id: toastId });
      }
    });
  };

  const handleLinkTemplate = async (packageId: string) => {
    const templateId = linkSelections[packageId];
    if (!templateId) return;

    const template = availableTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const toastId = toast.loading(`Linking template "${template.name}"...`);
    try {
      const result = await addTemplateToPackageAction(packageId, templateId);
      if (result.success) {
        toast.success("Template linked successfully", { id: toastId });
        // Update local state
        setPackages(
          packages.map((pkg) => {
            if (pkg.id === packageId) {
              const currentTemplates = pkg.templates || [];
              if (currentTemplates.some((t) => t.id === templateId)) return pkg;
              return {
                ...pkg,
                templates: [...currentTemplates, template],
              };
            }
            return pkg;
          })
        );
        // Clear selection
        setLinkSelections((prev) => {
          const next = { ...prev };
          next[packageId] = "";
          return next;
        });
      } else {
        toast.error(result.error || "Failed to link template", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred", { id: toastId });
    }
  };

  const handleUnlinkTemplate = async (packageId: string, templateId: string, templateName: string) => {
    const confirmUnlink = window.confirm(
      `Are you sure you want to remove "${templateName}" from this package?`
    );
    if (!confirmUnlink) return;

    const toastId = toast.loading(`Unlinking template "${templateName}"...`);
    try {
      const result = await removeTemplateFromPackageAction(packageId, templateId);
      if (result.success) {
        toast.success("Template unlinked successfully", { id: toastId });
        // Update local state
        setPackages(
          packages.map((pkg) => {
            if (pkg.id === packageId) {
              return {
                ...pkg,
                templates: (pkg.templates || []).filter((t) => t.id !== templateId),
              };
            }
            return pkg;
          })
        );
      } else {
        toast.error(result.error || "Failed to unlink template", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header bar */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Package className="h-5.5 w-5.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Workout Programs</h2>
            <p className="text-xs text-muted-foreground">Manage training splits and packages</p>
          </div>
        </div>
        <Button onClick={handleOpenCreate} size="sm" className="font-semibold">
          <Plus className="h-4 w-4 mr-1.5" /> Create Program Package
        </Button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.length > 0 ? (
          packages.map((pkg) => {
            const linkedTemplateIds = new Set(pkg.templates?.map((t) => t.id) || []);
            const linkableTemplates = availableTemplates.filter((t) => !linkedTemplateIds.has(t.id));

            return (
              <Card key={pkg.id} className="border border-border flex flex-col justify-between">
                <CardHeader className="pb-3 bg-muted/20 border-b rounded-t-xl">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 pr-4">
                      <CardTitle className="text-base font-bold text-foreground">
                        {pkg.name}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {pkg.description || "No description provided."}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleOpenEdit(pkg)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Edit program details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleOpenDelete(pkg)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete program"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Linked templates section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-0.5">
                      Included Workouts
                    </h4>
                    {pkg.templates && pkg.templates.length > 0 ? (
                      <div className="space-y-2">
                        {pkg.templates.map((tpl) => (
                          <div
                            key={tpl.id}
                            className="flex items-center justify-between bg-muted/30 p-2.5 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
                          >
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-foreground block truncate">
                                {tpl.name}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Dumbbell className="h-3 w-3" />
                                  {tpl.templateExercises?.length || 0} exercises
                                </span>
                                <span className="text-[10px] text-muted-foreground/60">•</span>
                                <span className="text-[10px] text-muted-foreground">
                                  Focus: {tpl.muscleFocus}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleUnlinkTemplate(pkg.id, tpl.id, tpl.name)}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                              title="Remove template from split"
                            >
                              <Unlink className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed rounded-lg bg-card text-muted-foreground text-xs">
                        No workout templates linked to this package.
                      </div>
                    )}
                  </div>

                  {/* Add linkage selector */}
                  <div className="pt-3 border-t border-border/40 space-y-2">
                    <Label className="text-xs font-bold text-foreground">
                      Link a Workout Template
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={linkSelections[pkg.id] || ""}
                        onValueChange={(val) =>
                          setLinkSelections((prev) => {
                            const next = { ...prev };
                            next[pkg.id] = val || "";
                            return next;
                          })
                        }
                      >
                        <SelectTrigger className="flex-1 h-8.5 text-xs bg-background">
                          <SelectValue placeholder="Choose template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {linkableTemplates.length > 0 ? (
                            linkableTemplates.map((tpl) => (
                              <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                                {tpl.name} ({tpl.muscleFocus})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled className="text-xs">
                              No more templates available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleLinkTemplate(pkg.id)}
                        disabled={!linkSelections[pkg.id]}
                        className="h-8.5 px-3 text-xs font-semibold shrink-0"
                      >
                        Link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center border border-dashed border-border rounded-2xl py-16 px-4 text-center bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
              No packages created
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Create training splits or package groups to bundle related workout templates.
            </p>
            <Button onClick={handleOpenCreate} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              <span>Create Program Package</span>
            </Button>
          </div>
        )}
      </div>

      {/* Package Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {packageToEdit ? "Edit Program Package" : "Create Program Package"}
            </DialogTitle>
            <DialogDescription>
              Provide splits details. Link workouts templates once the package is created.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="pkgName">Program Split Name</Label>
              <Input
                id="pkgName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hypertrophy Upper & Lower Split"
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pkgDesc">Description (Optional)</Label>
              <Textarea
                id="pkgDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the training split, weekly frequency, or details..."
                rows={3}
                disabled={isPending}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Program Package"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Program Split?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{packageToDelete?.name}"? Workout templates themselves
              will not be deleted, only their split grouping relations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Yes, Delete Split"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
