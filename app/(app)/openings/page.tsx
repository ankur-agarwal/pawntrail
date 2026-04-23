import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/current-user";
import type { Game } from "@/lib/supabase/helpers";

interface OpeningAgg {
  eco_code: string | null;
  opening_name: string | null;
  games: number;
  wins: number;
  losses: number;
  draws: number;
}

export default async function OpeningsPage() {
  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: rows } = await supabase
    .from("games")
    .select("*")
    .eq("user_id", userId);

  const games = (rows ?? []) as Game[];
  const byKey = new Map<string, OpeningAgg>();
  for (const g of games) {
    const key = `${g.eco_code ?? "?"}|${g.opening_name ?? "Unknown"}`;
    const cur =
      byKey.get(key) ??
      ({
        eco_code: g.eco_code,
        opening_name: g.opening_name,
        games: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      } as OpeningAgg);
    cur.games += 1;
    if (g.result === "win") cur.wins += 1;
    else if (g.result === "loss") cur.losses += 1;
    else if (g.result === "draw") cur.draws += 1;
    byKey.set(key, cur);
  }
  const openings = Array.from(byKey.values()).sort(
    (a, b) => b.games - a.games,
  );
  const top3 = new Set(openings.slice(0, 3).map((o) => o.eco_code ?? "?"));

  return (
    <main style={{ padding: "40px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
          marginBottom: 4,
        }}
      >
        PawnTrail · Openings
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 20px" }}>
        Your openings
      </h1>

      {openings.length === 0 ? (
        <div
          style={{
            padding: 40,
            border: "1.5px dashed var(--pt-border-strong)",
            borderRadius: 12,
            textAlign: "center",
            color: "var(--pt-text-muted)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 16,
              margin: "0 0 12px",
            }}
          >
            No games yet. Openings will appear here as you scan.
          </p>
          <Link href="/scan" style={{ color: "var(--pt-amber)" }}>
            Scan your first game →
          </Link>
        </div>
      ) : (
        <div
          style={{
            border: "0.5px solid var(--pt-border-strong)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 70px 80px",
              padding: "10px 14px",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--pt-text-muted)",
              fontFamily: "var(--font-mono)",
              borderBottom: "0.5px solid var(--pt-border)",
              background: "var(--pt-bg-elev)",
            }}
          >
            <div>Opening</div>
            <div>ECO</div>
            <div>Games</div>
            <div>Win rate</div>
          </div>
          {openings.map((o) => {
            const winRate =
              o.games === 0 ? 0 : Math.round((o.wins / o.games) * 100);
            const isTop = top3.has(o.eco_code ?? "?");
            const href = o.eco_code ? `/games?eco=${o.eco_code}` : "/games";
            return (
              <Link
                key={`${o.eco_code}-${o.opening_name}`}
                href={href}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 80px 70px 80px",
                  padding: "10px 14px",
                  textDecoration: "none",
                  color: "var(--pt-text)",
                  borderBottom: "0.5px solid var(--pt-border)",
                  fontSize: 13,
                }}
              >
                <div>
                  {o.opening_name ?? "Unknown"}
                  {isTop && (
                    <span
                      style={{
                        marginLeft: 8,
                        padding: "1px 6px",
                        fontSize: 9,
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        background: "var(--pt-amber)",
                        color: "var(--pt-ink)",
                        borderRadius: 3,
                      }}
                    >
                      Top
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--pt-text-muted)",
                  }}
                >
                  {o.eco_code ?? "—"}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  {o.games}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  {winRate}%
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
