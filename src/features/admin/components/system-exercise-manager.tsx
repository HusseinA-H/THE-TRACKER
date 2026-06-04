"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Video, Edit, Trash2, Dumbbell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { muscleGroups } from "@/config/site";
import type { Exercise } from "@/types";
import { getMuscleGroupColor } from "@/features/exercises/utils/muscle-groups";
import { SystemExerciseForm } from "./system-exercise-form";
import { deleteSystemExerciseAction } from "../actions";
import { useRouter } from "next/navigation";

interface SystemExerciseManagerProps {
  initialExercises: Exercise[];
}

export function SystemExerciseManager({ initialExercises }: SystemExerciseManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<string>("all");
  
  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);

  // Filter exercises
  const filteredExercises = initialExercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.description && ex.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMuscle = muscleFilter === "all" || ex.primaryMuscleGroup === muscleFilter;
    
    return matchesSearch && matchesMuscle;
  });

  const handleEditClick = (exercise: Exercise) => {
    setExerciseToEdit(exercise);
    setFormOpen(true);
  };

  const handleCreateClick = () => {
    setExerciseToEdit(null);
    setFormOpen(true);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the system exercise "${name}"?`)) {
      return;
    }

    const toastId = toast.loading(`Deleting ${name}...`);
    try {
      const result = await deleteSystemExerciseAction(id);
      if (result.success) {
        toast.success(`Deleted "${name}" from system library`, { id: toastId });
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(result.error || `Could not delete ${name}`, { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete system exercise.", { id: toastId });
    }
  };

  const handleFormSuccess = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search global movements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          {/* Muscle Group Filter */}
          <Select value={muscleFilter} onValueChange={(val) => setMuscleFilter(val || "all")}>
            <SelectTrigger className="w-full sm:w-[180px] h-10">
              <SelectValue placeholder="All Muscles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Muscles</SelectItem>
              {muscleGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add Button */}
        <Button onClick={handleCreateClick} className="h-10 font-semibold flex items-center gap-1.5 shrink-0 shadow-sm">
          <Plus className="h-4.5 w-4.5" />
          <span>Add Exercise</span>
        </Button>
      </div>

      {/* Main Exercises Table */}
      <div className="border border-border bg-card rounded-2xl shadow-sm overflow-hidden">
        {filteredExercises.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 w-[250px]">Movement</TableHead>
                  <TableHead className="w-[150px]">Primary Muscle</TableHead>
                  <TableHead className="w-[150px]">Secondary Muscle</TableHead>
                  <TableHead className="min-w-[200px]">Description</TableHead>
                  <TableHead className="text-center w-[80px]">Video</TableHead>
                  <TableHead className="text-right pr-6 w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExercises.map((ex) => (
                  <TableRow key={ex.id} className="hover:bg-muted/30 transition-colors">
                    {/* Name */}
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-bold text-foreground text-sm">{ex.name}</span>
                      </div>
                    </TableCell>

                    {/* Primary Muscle Group */}
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 border ${getMuscleGroupColor(
                          ex.primaryMuscleGroup
                        )}`}
                      >
                        {ex.primaryMuscleGroup}
                      </Badge>
                    </TableCell>

                    {/* Secondary Muscle Group */}
                    <TableCell className="py-4 text-muted-foreground text-xs font-medium">
                      {ex.secondaryMuscleGroup ? (
                        <Badge variant="outline" className="text-[10px] font-medium border-border">
                          {ex.secondaryMuscleGroup}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </TableCell>

                    {/* Description */}
                    <TableCell className="py-4 text-xs text-muted-foreground max-w-xs truncate leading-relaxed">
                      {ex.description || <span className="italic text-muted-foreground/40">No description provided</span>}
                    </TableCell>

                    {/* Video URL */}
                    <TableCell className="py-4 text-center">
                      {ex.videoUrl ? (
                        <a
                          href={ex.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                          title="Watch execution video"
                        >
                          <Video className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground/30 font-mono text-[10px]">—</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEditClick(ex)}
                          title="Edit exercise"
                        >
                          <Edit className="h-3.8 w-3.8" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteClick(ex.id, ex.name)}
                          title="Delete exercise"
                        >
                          <Trash2 className="h-3.8 w-3.8" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Dumbbell className="h-10 w-10 text-muted-foreground/40 animate-pulse" />
            <p className="text-sm font-semibold text-muted-foreground">No global exercises found</p>
            <p className="text-xs text-muted-foreground/60 max-w-xs">
              Try adjusting your filters or search query, or add a new global exercise using the button above.
            </p>
          </div>
        )}
      </div>

      {/* Form Dialog Modal */}
      <SystemExerciseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        exerciseToEdit={exerciseToEdit}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
