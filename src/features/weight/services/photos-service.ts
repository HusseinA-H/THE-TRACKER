import { createClient } from "@/lib/supabase/server";
import type { ProgressPhoto } from "@/types";

export function mapPhotoRow(row: any): ProgressPhoto {
  return {
    id: row.id,
    userId: row.user_id,
    photoUrl: row.photo_url,
    category: row.category as "front" | "side" | "back",
    logDate: row.log_date,
    createdAt: row.created_at,
  };
}

export async function getProgressPhotos(): Promise<ProgressPhoto[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false });

  if (error) {
    console.error("Error fetching progress photos:", error);
    throw new Error(error.message);
  }

  return (data || []).map(mapPhotoRow);
}

export async function uploadProgressPhoto(
  file: File,
  category: "front" | "side" | "back",
  logDate: string
): Promise<ProgressPhoto> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Construct file path: user_id/category_logdate.extension
  const fileExt = file.name.split(".").pop() || "jpg";
  const filePath = `${user.id}/${category}_${logDate}.${fileExt}`;

  // Upload file to Supabase Storage
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("progress_photos")
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading to storage:", uploadError);
    throw new Error(uploadError.message);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("progress_photos")
    .getPublicUrl(filePath);

  // Insert or update DB log record
  // Let's delete any existing photo for the same date and category to keep it clean (monthly/daily replacement)
  const { error: deleteOldError } = await supabase
    .from("progress_photos")
    .delete()
    .eq("user_id", user.id)
    .eq("category", category)
    .eq("log_date", logDate);

  if (deleteOldError) console.error("Error deleting duplicate photo records:", deleteOldError);

  const { data, error } = await supabase
    .from("progress_photos")
    .insert({
      user_id: user.id,
      photo_url: publicUrl,
      category,
      log_date: logDate,
    })
    .select()
    .single();

  if (error) {
    console.error("Error logging progress photo in DB:", error);
    throw new Error(error.message);
  }

  return mapPhotoRow(data);
}

export async function deleteProgressPhoto(id: string, photoUrl: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Delete DB record
  const { error: dbError } = await supabase
    .from("progress_photos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (dbError) {
    console.error("Error deleting progress photo from DB:", dbError);
    throw new Error(dbError.message);
  }

  // Extract storage path from URL
  // The URL looks like: .../storage/v1/object/public/progress_photos/user_id/category_date.jpg
  // We want the part after "progress_photos/"
  const urlParts = photoUrl.split("/progress_photos/");
  if (urlParts.length > 1) {
    const storagePath = urlParts[1];
    const { error: storageError } = await supabase.storage
      .from("progress_photos")
      .remove([storagePath]);

    if (storageError) {
      console.error("Error removing file from storage:", storageError);
    }
  }
}
