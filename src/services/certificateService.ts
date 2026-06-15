import { supabase } from "@/lib/supabase";
import type { Certificate } from "@/types";

function normalizeCertificate(row: Record<string, unknown>): Certificate {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    lesson_id: String(row.lesson_id),
    certificate_number: String(row.certificate_number ?? ""),
    score: Number(row.score ?? 0),
    issued_at: String(row.issued_at ?? ""),
    lessons:
      row.lessons && typeof row.lessons === "object"
        ? (row.lessons as Certificate["lessons"])
        : null,
    profiles:
      row.profiles && typeof row.profiles === "object"
        ? (row.profiles as Certificate["profiles"])
        : null,
  };
}

const CERTIFICATE_SELECT = "*, lessons(title), profiles(full_name)";

export async function getCertificateByUserAndLesson(
  userId: string,
  lessonId: string,
): Promise<Certificate | null> {
  const { data, error } = await supabase
    .from("certificates")
    .select(CERTIFICATE_SELECT)
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizeCertificate(data) : null;
}

export async function getUserCertificates(userId: string): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from("certificates")
    .select(CERTIFICATE_SELECT)
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeCertificate(row));
}

export async function getAllCertificates(): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from("certificates")
    .select(CERTIFICATE_SELECT)
    .order("issued_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeCertificate(row));
}

export async function issueCertificate(input: {
  userId: string;
  lessonId: string;
  score: number;
}): Promise<Certificate> {
  if (input.score < 70) {
    throw new Error("يجب تحقيق 70% على الأقل للحصول على الشهادة.");
  }

  const existing = await getCertificateByUserAndLesson(input.userId, input.lessonId);
  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("certificates")
    .insert({
      user_id: input.userId,
      lesson_id: input.lessonId,
      score: input.score,
    })
    .select(CERTIFICATE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeCertificate(data);
}
