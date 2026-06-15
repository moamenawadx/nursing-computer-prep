import { supabase } from "@/lib/supabase";
import type { ExamAnswer, ExamResult, Question } from "@/types";

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

function normalizeResult(row: Record<string, unknown>): ExamResult {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    lesson_id: String(row.lesson_id),
    score: Number(row.score ?? 0),
    total_questions: Number(row.total_questions ?? 0),
    percentage: Number(row.percentage ?? 0),
    answers: Array.isArray(row.answers) ? (row.answers as ExamAnswer[]) : [],
    created_at: String(row.created_at ?? ""),
    lessons:
      row.lessons && typeof row.lessons === "object"
        ? (row.lessons as ExamResult["lessons"])
        : null,
  };
}

export async function getQuestionsByLesson(lessonId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order_index", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeQuestion(row));
}

export async function submitExam(input: {
  userId: string;
  lessonId: string;
  answers: ExamAnswer[];
}): Promise<ExamResult> {
  const score = input.answers.filter((answer) => answer.isCorrect).length;
  const totalQuestions = input.answers.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const { data, error } = await supabase
    .from("exam_results")
    .insert({
      user_id: input.userId,
      lesson_id: input.lessonId,
      score,
      total_questions: totalQuestions,
      percentage,
      answers: input.answers,
    })
    .select("*, lessons(title)")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeResult(data);
}

export async function getUserResults(userId: string): Promise<ExamResult[]> {
  const { data, error } = await supabase
    .from("exam_results")
    .select("*, lessons(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeResult(row));
}

export async function getExamResult(resultId: string): Promise<ExamResult> {
  const { data, error } = await supabase
    .from("exam_results")
    .select("*, lessons(title)")
    .eq("id", resultId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeResult(data);
}
