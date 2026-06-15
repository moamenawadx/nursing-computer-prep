import { supabase } from "@/lib/supabase";
import type { Lesson, LessonInput } from "@/types";

function normalizeArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
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
    images: [],
  };
}

function toDbPayload(input: LessonInput) {
  return {
    title: input.title,
    description: input.description ?? null,
    content: input.content ?? null,
    week: input.week ?? null,
    duration_minutes: input.duration_minutes ?? null,
    order_index: input.order_index ?? 0,
    video_url: input.video_url ?? null,
    objectives: input.objectives ?? [],
    examples: input.examples ?? [],
    practical_tasks: input.practical_tasks ?? [],
    key_points: input.key_points ?? [],
  };
}

export async function createLesson(input: LessonInput): Promise<Lesson> {
  const { data, error } = await supabase.from("lessons").insert(toDbPayload(input)).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeLesson(data);
}

export async function updateLesson(id: string, input: LessonInput): Promise<Lesson> {
  const { data, error } = await supabase
    .from("lessons")
    .update(toDbPayload(input))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeLesson(data);
}

export async function deleteLesson(id: string): Promise<void> {
  const { error } = await supabase.from("lessons").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
