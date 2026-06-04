"use client";

import { useState, useMemo } from "react";
import { Plus, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExerciseTable } from "./exercise-table";
import { ExerciseDetailDrawer } from "./exercise-detail-drawer";
import { ExerciseSearch } from "./exercise-search";
import { ExerciseForm } from "./exercise-form";
import { muscleGroups } from "@/config/site";
import type { Exercise, MuscleGroup } from "@/types";
import { deleteExerciseAction } from "../actions";
import { deleteSystemExerciseAction } from "@/features/admin/actions";
import { toast } from "sonner";

interface ExerciseListProps {
  initialExercises: Exercise[];
  userRole?: "super_admin" | "admin" | "user";
}

export function ExerciseList({ initialExercises, userRole = "user" }: ExerciseListProps) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [search, setSearch] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | "All">("All");
  const [category, setCategory] = useState<string | "All">("All");
  const [equipment, setEquipment] = useState<string | "All">("All");
  const [difficulty, setDifficulty] = useState<string | "All">("All");
  const [tabFilter, setTabFilter] = useState<"all" | "system" | "custom">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);

  // Detail drawer states
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync state if initialProps change or on success
  const handleSuccess = (newExercise: Exercise) => {
    // If it is an update
    const index = exercises.findIndex((e) => e.id === newExercise.id);
    if (index > -1) {
      const updated = [...exercises];
      updated[index] = newExercise;
      setExercises(updated);
    } else {
      // If it is a create, prepend to top
      setExercises([newExercise, ...exercises]);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setExerciseToEdit(exercise);
    setIsFormOpen(true);
  };

  const handleDelete = async (exercise: Exercise) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${exercise.name}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    const toastId = toast.loading("Deleting exercise...");
    try {
      let result;
      if (exercise.isCustom) {
        result = await deleteExerciseAction(exercise.id);
      } else {
        result = await deleteSystemExerciseAction(exercise.id);
      }

      if (result.success) {
        toast.success("Exercise deleted successfully", { id: toastId });
        setExercises(exercises.filter((e) => e.id !== exercise.id));
      } else {
        toast.error(result.error || "Could not delete exercise", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete exercise", { id: toastId });
    }
  };

  const handleSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDrawerOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setExerciseToEdit(null);
    }
  };

  // Extract unique categories and equipment dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    exercises.forEach((ex) => {
      if (ex.category) set.add(ex.category);
    });
    return Array.from(set).sort();
  }, [exercises]);

  const equipmentOptions = useMemo(() => {
    const set = new Set<string>();
    exercises.forEach((ex) => {
      if (ex.equipment) set.add(ex.equipment);
    });
    return Array.from(set).sort();
  }, [exercises]);

  // Filter local state list based on search and tab selections
  const filteredExercises = exercises.filter((ex) => {
    // Search filter
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());

    // Muscle group filter
    const matchesMuscle =
      muscleGroup === "All" ||
      ex.primaryMuscleGroup === muscleGroup ||
      ex.secondaryMuscleGroup === muscleGroup;

    // Source filter (tab)
    const matchesSource =
      tabFilter === "all" ||
      (tabFilter === "system" && !ex.isCustom) ||
      (tabFilter === "custom" && ex.isCustom);

    // Category filter
    const matchesCategory =
      category === "All" ||
      ex.category === category;

    // Equipment filter
    const matchesEquipment =
      equipment === "All" ||
      ex.equipment === equipment;

    // Difficulty filter
    const matchesDifficulty =
      difficulty === "All" ||
      ex.difficulty === difficulty;

    return matchesSearch && matchesMuscle && matchesSource && matchesCategory && matchesEquipment && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-lg border">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <ExerciseSearch value={search} onChange={setSearch} />
          </div>
          
          <Tabs
            value={tabFilter}
            onValueChange={(v) => setTabFilter(v as any)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3 sm:w-auto bg-muted">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Button onClick={() => { setExerciseToEdit(null); setIsFormOpen(true); }} className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span>Add Exercise</span>
        </Button>
      </div>

      {/* Advanced Filters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/40 p-4 rounded-lg border">
        {/* Muscle Group Filter */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Primary Muscle</span>
          <Select
            value={muscleGroup}
            onValueChange={(v) => setMuscleGroup((v as MuscleGroup) || "All")}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Muscles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Muscles</SelectItem>
              {muscleGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Category</span>
          <Select
            value={category}
            onValueChange={(val) => setCategory(val || "All")}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Equipment Filter */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Equipment</span>
          <Select
            value={equipment}
            onValueChange={(val) => setEquipment(val || "All")}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Equipment</SelectItem>
              {equipmentOptions.map((eq) => (
                <SelectItem key={eq} value={eq}>
                  {eq}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Difficulty</span>
          <Select
            value={difficulty}
            onValueChange={(val) => setDifficulty(val || "All")}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Difficulties</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Spreadsheet Data Table */}
      <div className="w-full">
        {filteredExercises.length > 0 ? (
          <ExerciseTable
            exercises={filteredExercises}
            onSelect={handleSelect}
          />
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl py-16 px-4 text-center bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Dumbbell className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
              No exercises found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Try adjusting your search query, selecting a different filter option, or creating a custom exercise.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setExerciseToEdit(null); setIsFormOpen(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Create Custom Exercise</span>
            </Button>
          </div>
        )}
      </div>

      {/* Custom Exercise Form Dialog */}
      {isFormOpen && (
        <ExerciseForm
          exerciseToEdit={exerciseToEdit}
          open={isFormOpen}
          onOpenChange={handleFormOpenChange}
          onSuccess={handleSuccess}
        />
      )}

      {/* Detail Drawer */}
      <ExerciseDetailDrawer
        exercise={selectedExercise}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
        userRole={userRole}
      />
    </div>
  );
}
