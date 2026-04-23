"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/current-user";
import { verifyLichessUser } from "@/lib/lichess/verifyUser";

const displayNameSchema = z.string().min(1).max(80);

export async function updateDisplayName(formData: FormData) {
  const { userId } = await requireUser();
  const parsed = displayNameSchema.safeParse(formData.get("display_name"));
  if (!parsed.success) redirect("/settings?error=invalid_name");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/settings");
}

export async function updateLichessUsername(formData: FormData) {
  const { userId } = await requireUser();
  const raw = formData.get("lichess_username");
  if (typeof raw !== "string" || raw.length === 0) {
    redirect("/settings?error=empty_lichess_username");
  }
  const ok = await verifyLichessUser(raw as string);
  if (!ok) redirect("/settings?error=lichess_user_not_found");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      lichess_username: raw as string,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/settings");
}

export async function removeLichessUsername() {
  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("profiles")
    .update({ lichess_username: null, updated_at: new Date().toISOString() })
    .eq("id", userId);
  revalidatePath("/settings");
}

const themeSchema = z.enum(["light", "dark", "system"]);

export async function updateTheme(formData: FormData) {
  const { userId } = await requireUser();
  const parsed = themeSchema.safeParse(formData.get("theme"));
  if (!parsed.success) redirect("/settings?error=invalid_theme");
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("profiles")
    .update({ theme: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", userId);
  revalidatePath("/settings");
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export async function exportAllGames(): Promise<Result<{ pgn: string }>> {
  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("games")
    .select("pgn")
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  const pgn = (data ?? [])
    .map((g) => g.pgn)
    .filter((p): p is string => !!p)
    .join("\n\n");
  return { ok: true, data: { pgn } };
}

export async function deleteAccount(formData: FormData) {
  const { userId } = await requireUser();
  const confirm = formData.get("confirm");
  if (confirm !== "DELETE") redirect("/settings?error=must_type_delete");
  const supabase = await createSupabaseServerClient();
  await supabase.from("profiles").delete().eq("id", userId);
  await supabase.auth.signOut();
  redirect("/");
}
