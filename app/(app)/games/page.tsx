import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/current-user";
import { LibraryTable } from "@/components/library/LibraryTable";

type SearchParams = {
  q?: string;
  result?: string;
  color?: string;
  eco?: string;
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireUser();
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("games")
    .select("*")
    .order("played_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (sp.q) {
    query = query.or(
      `opponent_name.ilike.%${sp.q}%,opening_name.ilike.%${sp.q}%,tournament_name.ilike.%${sp.q}%`,
    );
  }
  if (sp.result && ["win", "loss", "draw"].includes(sp.result)) {
    query = query.eq("result", sp.result);
  }
  if (sp.color && ["white", "black"].includes(sp.color)) {
    query = query.eq("color", sp.color);
  }
  if (sp.eco) {
    query = query.eq("eco_code", sp.eco);
  }

  const { data: games } = await query;
  const rows = games ?? [];

  return (
    <main style={{ padding: "40px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 16,
        }}
      >
        <div>
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
            PawnTrail · Library
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>
            {rows.length} {rows.length === 1 ? "game" : "games"}
          </h1>
        </div>
        <Link
          href="/scan"
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 500,
            background: "var(--pt-forest)",
            color: "var(--pt-cream)",
            border: "0.5px solid var(--pt-forest)",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Scan a new sheet
        </Link>
      </div>

      <LibraryTable games={rows} initialFilters={sp} />

      {rows.length === 0 && (
        <div
          style={{
            marginTop: 40,
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
            Your library is empty.
          </p>
          <Link href="/scan" style={{ color: "var(--pt-amber)" }}>
            Scan your first game →
          </Link>
        </div>
      )}
    </main>
  );
}
