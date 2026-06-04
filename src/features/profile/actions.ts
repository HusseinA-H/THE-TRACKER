"use server";

import { revalidatePath } from "next/cache";
import { updateProfile } from "./services/profile-service";
import { profileFormSchema } from "./schemas";
import type { ActionResult } from "@/lib/utils";
import type { UserProfile, UpdateProfileInput } from "./types";
import { routes } from "@/config/routes";

export async function updateProfileAction(
  input: UpdateProfileInput
): Promise<ActionResult<UserProfile>> {
  try {
    const validated = profileFormSchema.parse({
      displayName: input.displayName,
    });

    const result = await updateProfile({
      displayName: validated.displayName,
    });

    revalidatePath(routes.profile);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error updating profile:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred.",
    };
  }
}
