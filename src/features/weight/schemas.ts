import { z } from "zod";

export const weightFormSchema = z.object({
  weight: z
    .number({ message: "Weight must be a number." })
    .min(10, "Weight must be at least 10 kg.")
    .max(500, "Weight must be under 500 kg."),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date."),
});

export type WeightFormValues = z.infer<typeof weightFormSchema>;

export const measurementFormSchema = z.object({
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date."),
  weight: z.number().nullable().optional(),
  waist: z.number().nullable().optional(),
  chest: z.number().nullable().optional(),
  shoulders: z.number().nullable().optional(),
  arms: z.number().nullable().optional(),
  forearms: z.number().nullable().optional(),
  thighs: z.number().nullable().optional(),
  calves: z.number().nullable().optional(),
});

export type MeasurementFormValues = z.infer<typeof measurementFormSchema>;

