import { supabase } from "@/lib/supabase";
import { normalizeLessonImage } from "@/services/lessonImageService";
import type { Lesson, LessonImage } from "@/types";

const LESSON_SELECT = "*, lesson_images(*)";

function normalizeArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeImages(value: unknown): LessonImage[] {
  if (!Array.isArray(value)) return [];
  return value.map((row) => normalizeLessonImage(row as Record<string, unknown>));
}

function normalizeLesson(row: Record<string, unknown>): Lesson {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    description: typeof row.description === "string" ? row.description : null,
    content: typeof row.content === "string" ? row.content : null,
    week: typeof row.week === "number" ? row.week : null,
    duration_minutes: typeof row.duration_minutes === "number" ? row.duration_minutes : null,
    order_index: typeof row.order_index === "number" ? row.order_index : null,
    video_url: typeof row.video_url === "string" ? row.video_url : null,
    objectives: normalizeArray(row.objectives),
    examples: Array.isArray(row.examples) ? (row.examples as Lesson["examples"]) : [],
    practical_tasks: normalizeArray(row.practical_tasks),
    key_points: normalizeArray(row.key_points),
    images: normalizeImages(row.lesson_images),
  };
}

export async function getLessons(): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_SELECT)
    .order("week", { ascending: true, nullsFirst: false })
    .order("order_index", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeLesson(row));
}

export async function getLessonById(id: string): Promise<Lesson> {
  const { data, error } = await supabase.from("lessons").select(LESSON_SELECT).eq("id", id).single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeLesson(data);
}
