import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Profile;
}
