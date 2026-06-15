import { supabase } from "@/lib/supabase";
import type { LessonImage } from "@/types";
import { v4 as uuidv4 } from "uuid";

const BUCKET = "lesson-images";

export function normalizeLessonImage(row: Record<string, unknown>): LessonImage {
  return {
    id: String(row.id),
    lesson_id: String(row.lesson_id),
    image_url: String(row.image_url ?? ""),
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
  };
}

export async function getLessonImages(lessonId: string): Promise<LessonImage[]> {
  const { data, error } = await supabase
    .from("lesson_images")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeLessonImage(row));
}

export async function uploadLessonImage(lessonId: string, file: File): Promise<LessonImage> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ext.replace(/[^a-z0-9]/gi, "") || "jpg";
  const path = `${lessonId}/${uuidv4()}.${safeExt}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from("lesson_images")
    .insert({ lesson_id: lessonId, image_url: urlData.publicUrl })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw new Error(error.message);
  }

  return normalizeLessonImage(data);
}

export async function deleteLessonImage(image: LessonImage): Promise<void> {
  const urlParts = image.image_url.split(`/${BUCKET}/`);
  const storagePath = urlParts[1];

  if (storagePath) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  const { error } = await supabase.from("lesson_images").delete().eq("id", image.id);

  if (error) {
    throw new Error(error.message);
  }
}
