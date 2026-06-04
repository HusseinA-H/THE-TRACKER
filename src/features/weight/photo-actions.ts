"use server";

import { revalidatePath } from "next/cache";
import { uploadProgressPhoto, deleteProgressPhoto, getProgressPhotos } from "./services/photos-service";
import type { ActionResult } from "@/lib/utils";
import type { ProgressPhoto } from "@/types";

export async function getProgressPhotosAction(): Promise<ActionResult<ProgressPhoto[]>> {
  try {
    const result = await getProgressPhotos();
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error getting progress photos:", error);
    return { success: false, error: error.message || "Failed to fetch progress photos" };
  }
}

export async function uploadProgressPhotoAction(
  formData: FormData
): Promise<ActionResult<ProgressPhoto>> {
  try {
    const file = formData.get("file") as File;
    const category = formData.get("category") as "front" | "side" | "back";
    const logDate = formData.get("logDate") as string;

    if (!file || !category || !logDate) {
      return { success: false, error: "Missing required upload parameters." };
    }

    const result = await uploadProgressPhoto(file, category, logDate);
    revalidatePath("/dashboard/photos");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Action error uploading progress photo:", error);
    return { success: false, error: error.message || "Failed to upload progress photo" };
  }
}

export async function deleteProgressPhotoAction(
  id: string,
  photoUrl: string
): Promise<ActionResult<void>> {
  try {
    await deleteProgressPhoto(id, photoUrl);
    revalidatePath("/dashboard/photos");
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("Action error deleting progress photo:", error);
    return { success: false, error: error.message || "Failed to delete progress photo" };
  }
}
