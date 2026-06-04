import { z } from "zod";

export const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be under 50 characters.")
    .trim(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
