"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { muscleGroups } from "@/config/site";
import { exerciseFormSchema, type ExerciseFormValues } from "../schemas";
import { createExerciseAction, updateExerciseAction } from "../actions";
import { updateSystemExerciseAction } from "@/features/admin/actions";
import { Loader2 } from "lucide-react";
import type { Exercise } from "../types";

interface ExerciseFormProps {
  exerciseToEdit?: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (exercise: Exercise) => void;
}

export function ExerciseForm({
  exerciseToEdit,
  open,
  onOpenChange,
  onSuccess,
}: ExerciseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!exerciseToEdit;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      name: exerciseToEdit?.name || "",
      primaryMuscleGroup: exerciseToEdit?.primaryMuscleGroup || undefined,
      secondaryMuscleGroup: exerciseToEdit?.secondaryMuscleGroup || null,
      description: exerciseToEdit?.description || "",
      videoUrl: exerciseToEdit?.videoUrl || "",
      category: (exerciseToEdit?.category as any) || "Upper",
      equipment: exerciseToEdit?.equipment || "",
      difficulty: exerciseToEdit?.difficulty || "Beginner",
      alternativeExercise: exerciseToEdit?.alternativeExercise || "",
      notes: exerciseToEdit?.notes || "",
    },
  });

  const primaryMuscle = watch("primaryMuscleGroup");
  const secondaryMuscle = watch("secondaryMuscleGroup");
  const difficulty = watch("difficulty");

  const onSubmit = async (values: ExerciseFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading(
      isEditing ? "Updating exercise..." : "Creating exercise..."
    );

    try {
      let result;
      if (isEditing) {
        if (exerciseToEdit.isCustom) {
          result = await updateExerciseAction({ id: exerciseToEdit.id, ...values });
        } else {
          result = await updateSystemExerciseAction(exerciseToEdit.id, values);
        }
      } else {
        result = await createExerciseAction(values);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? "Exercise updated successfully"
            : "Exercise created successfully",
          { id: toastId }
        );
        onSuccess?.(result.data);
        onOpenChange(false);
        if (!isEditing) reset();
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      onOpenChange(v);
      if (!v && !isEditing) reset();
    }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Exercise" : "Create Custom Exercise"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[75vh] overflow-y-auto px-1">
          {/* Exercise Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Exercise Name</Label>
            <Input
              id="name"
              placeholder="e.g. Incline Bench Press"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Primary Muscle Group */}
            <div className="space-y-1.5">
              <Label htmlFor="primaryMuscleGroup">Primary Muscle</Label>
              <Select
                value={primaryMuscle}
                onValueChange={(val) => setValue("primaryMuscleGroup", val as any)}
              >
                <SelectTrigger id="primaryMuscleGroup">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {muscleGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.primaryMuscleGroup && (
                <p className="text-xs font-medium text-destructive">
                  {errors.primaryMuscleGroup.message}
                </p>
              )}
            </div>

            {/* Secondary Muscle Group */}
            <div className="space-y-1.5">
              <Label htmlFor="secondaryMuscleGroup">Secondary Muscle</Label>
              <Select
                value={secondaryMuscle || "none"}
                onValueChange={(val) =>
                  setValue("secondaryMuscleGroup", val === "none" ? null : (val as any))
                }
              >
                <SelectTrigger id="secondaryMuscleGroup">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {muscleGroups
                    .filter((group) => group !== primaryMuscle)
                    .map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select
                value={watch("category") || "Upper"}
                onValueChange={(val) => setValue("category", val as any)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upper">Upper</SelectItem>
                  <SelectItem value="Lower">Lower</SelectItem>
                  <SelectItem value="Cardio">Cardio</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs font-medium text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Equipment */}
            <div className="space-y-1.5">
              <Label htmlFor="equipment">Equipment</Label>
              <Input
                id="equipment"
                placeholder="e.g. Barbell, Machine"
                {...register("equipment")}
              />
              {errors.equipment && (
                <p className="text-xs font-medium text-destructive">
                  {errors.equipment.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Difficulty */}
            <div className="space-y-1.5">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={difficulty || "Beginner"}
                onValueChange={(val) => setValue("difficulty", val)}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              {errors.difficulty && (
                <p className="text-xs font-medium text-destructive">
                  {errors.difficulty.message}
                </p>
              )}
            </div>

            {/* Alternative Exercise */}
            <div className="space-y-1.5">
              <Label htmlFor="alternativeExercise">Alternative Exercise</Label>
              <Input
                id="alternativeExercise"
                placeholder="e.g. Dumbbell Fly"
                {...register("alternativeExercise")}
              />
              {errors.alternativeExercise && (
                <p className="text-xs font-medium text-destructive">
                  {errors.alternativeExercise.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Tips, form cues, or target areas..."
              rows={2}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs font-medium text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Form tips or special instructions..."
              rows={2}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-xs font-medium text-destructive">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Video Reference URL */}
          <div className="space-y-1.5">
            <Label htmlFor="videoUrl">Video URL (Optional)</Label>
            <Input
              id="videoUrl"
              placeholder="e.g. https://youtube.com/..."
              {...register("videoUrl")}
            />
            {errors.videoUrl && (
              <p className="text-xs font-medium text-destructive">
                {errors.videoUrl.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Saving..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Exercise"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
