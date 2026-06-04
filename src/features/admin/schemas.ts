import { z } from "zod";

export const roleChangeSchema = z.object({
  userId: z.string().uuid("Invalid user ID."),
  role: z.enum(["super_admin", "admin", "user"]),
});

export type RoleChangeFormValues = z.infer<typeof roleChangeSchema>;
