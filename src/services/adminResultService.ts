import { supabase } from "@/lib/supabase";
import type { AdminResultFilters, ExamResult } from "@/types";

function normalizeResult(row: Record<string, unknown>): ExamResult {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    lesson_id: String(row.lesson_id),
    score: Number(row.score ?? 0),
    total_questions: Number(row.total_questions ?? 0),
    percentage: Number(row.percentage ?? 0),
    answers: Array.isArray(row.answers) ? (row.answers as ExamResult["answers"]) : [],
    created_at: String(row.created_at ?? ""),
    lessons:
      row.lessons && typeof row.lessons === "object"
        ? (row.lessons as ExamResult["lessons"])
        : null,
    profiles:
      row.profiles && typeof row.profiles === "object"
        ? (row.profiles as ExamResult["profiles"])
        : null,
  };
}

export async function getAllExamResults(filters: AdminResultFilters = {}): Promise<ExamResult[]> {
  let query = supabase.from("exam_results").select("*, lessons(title), profiles(full_name)");

  if (filters.lessonId) {
    query = query.eq("lesson_id", filters.lessonId);
  }

  if (filters.userId) {
    query = query.eq("user_id", filters.userId);
  }

  const sortColumn = filters.sortBy === "score" ? "percentage" : "created_at";
  const ascending = filters.sortOrder === "asc";

  query = query.order(sortColumn, { ascending });

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeResult(row));
}

export async function getAllProfiles(): Promise<{ id: string; full_name: string | null }[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as { id: string; full_name: string | null }[];
}
