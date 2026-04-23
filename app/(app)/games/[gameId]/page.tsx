import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/current-user";
import { GameDetail } from "@/components/game/GameDetail";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  await requireUser();
  const { gameId } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: game }, { data: moves }] = await Promise.all([
    supabase.from("games").select("*").eq("id", gameId).maybeSingle(),
    supabase
      .from("moves")
      .select("*")
      .eq("game_id", gameId)
      .order("ply", { ascending: true }),
  ]);

  if (!game) notFound();

  return <GameDetail game={game} moves={moves ?? []} />;
}
