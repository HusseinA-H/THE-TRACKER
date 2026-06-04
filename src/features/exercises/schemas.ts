import { z } from "zod";
import { muscleGroups } from "@/config/site";

export const exerciseFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be less than 100 characters.")
    .trim(),
  primaryMuscleGroup: z.enum(muscleGroups),
  secondaryMuscleGroup: z.enum(muscleGroups).nullable().optional(),
  description: z.string().max(500, "Description must be under 500 characters.").optional().nullable(),
  videoUrl: z
    .string()
    .url("Please enter a valid URL.")
    .or(z.literal(""))
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  category: z.enum(["Upper", "Lower", "Cardio"]),
  equipment: z.string().max(100, "Equipment must be under 100 characters.").optional().nullable(),
  difficulty: z.string().max(50, "Difficulty must be under 50 characters.").optional().nullable(),
  alternativeExercise: z.string().max(100, "Alternative exercise must be under 100 characters.").optional().nullable(),
  notes: z.string().max(500, "Notes must be under 500 characters.").optional().nullable(),
});

export type ExerciseFormValues = z.input<typeof exerciseFormSchema>;

