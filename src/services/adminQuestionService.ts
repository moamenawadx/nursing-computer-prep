import { supabase } from "@/lib/supabase";
import type { Question, QuestionInput } from "@/types";

function normalizeOptions(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeQuestion(row: Record<string, unknown>): Question {
  return {
    id: String(row.id),
    lesson_id: String(row.lesson_id),
    text: String(row.text ?? ""),
    type: row.type === "truefalse" ? "truefalse" : "mcq",
    options: normalizeOptions(row.options),
    correct_answer: String(row.correct_answer ?? ""),
    explanation: typeof row.explanation === "string" ? row.explanation : null,
    order_index: typeof row.order_index === "number" ? row.order_index : null,
  };
}

function toDbPayload(input: QuestionInput) {
  return {
    lesson_id: input.lesson_id,
    text: input.text,
    type: input.type,
    options: input.options,
    correct_answer: input.correct_answer,
    explanation: input.explanation ?? null,
    order_index: input.order_index ?? 0,
  };
}

export async function getAllQuestions(lessonId?: string): Promise<Question[]> {
  let query = supabase.from("questions").select("*").order("order_index", { ascending: true });

  if (lessonId) {
    query = query.eq("lesson_id", lessonId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeQuestion(row));
}

export async function createQuestion(input: QuestionInput): Promise<Question> {
  const { data, error } = await supabase.from("questions").insert(toDbPayload(input)).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeQuestion(data);
}

export async function updateQuestion(id: string, input: QuestionInput): Promise<Question> {
  const { data, error } = await supabase
    .from("questions")
    .update(toDbPayload(input))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeQuestion(data);
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase.from("questions").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
