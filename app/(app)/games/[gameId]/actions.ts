"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/current-user";
import type { Classification } from "@/lib/pgn/classify";

export async function persistMoveReview(
  gameId: string,
  ply: number,
  evalCp: number,
  bestMoveSan: string | null,
  classification: Classification | null,
) {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("moves")
    .update({
      eval_cp: evalCp,
      best_move_san: bestMoveSan,
      classification,
    })
    .eq("game_id", gameId)
    .eq("ply", ply);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function markGameReviewed(gameId: string) {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("games")
    .update({ engine_reviewed_at: new Date().toISOString() })
    .eq("id", gameId);
  return { ok: true };
}
