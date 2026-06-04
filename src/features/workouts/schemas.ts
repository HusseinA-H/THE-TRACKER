import { z } from "zod";

export const workoutCompleteSchema = z.object({
  name: z.string().min(1, "Workout name cannot be empty.").max(100).trim(),
  notes: z.string().max(500, "Notes must be under 500 characters.").optional().nullable(),
});

export type WorkoutCompleteValues = z.infer<typeof workoutCompleteSchema>;
