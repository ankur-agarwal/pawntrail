import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/current-user";
import { signOut } from "@/app/(auth)/actions";
import type { Game } from "@/lib/supabase/helpers";

export default async function DashboardPage() {
  const { userId, profile } = await requireUser();
  const name = profile?.display_name ?? "Trail walker";

  const supabase = await createSupabaseServerClient();

  const [{ data: allGames }, { count: thirtyDayCount }] = await Promise.all([
    supabase
      .from("games")
      .select("*")
      .eq("user_id", userId)
      .order("played_on", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("games")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte(
        "played_on",
        new Date(Date.now() - 30 * 86400 * 1000).toISOString().slice(0, 10),
      ),
  ]);

  const games: Game[] = allGames ?? [];
  const totalGames = games.length;
  const last30 = games.filter(
    (g) =>
      g.played_on &&
      new Date(g.played_on).getTime() > Date.now() - 30 * 86400 * 1000,
  );
  const winsLast30 = last30.filter((g) => g.result === "win").length;
  const winRate = last30.length > 0 ? Math.round((winsLast30 / last30.length) * 100) : null;
  const tournaments = new Set(games.map((g) => g.tournament_name).filter(Boolean)).size;

  if (totalGames === 0) return <EmptyDashboard name={name} />;

  return (
    <main style={{ padding: "40px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <Header name={name} totalGames={totalGames} tournaments={tournaments} />

      <ScanCta />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginTop: 24,
        }}
      >
        <Metric label="Games" value={String(totalGames)} subtitle={`across ${tournaments} tournament${tournaments === 1 ? "" : "s"}`} />
        <Metric
          label="Win rate"
          value={winRate === null ? "—" : `${winRate}%`}
          subtitle={`last 30 days · ${last30.length} game${last30.length === 1 ? "" : "s"}`}
        />
        <Metric
          label="Recent"
          value={String(thirtyDayCount ?? last30.length)}
          subtitle="games last 30 days"
        />
        <Metric
          label="Library"
          value={String(totalGames)}
          subtitle="total in library"
          accent
        />
      </div>

      <div style={{ marginTop: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 12,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>
            Recent games
          </h2>
          <Link
            href="/games"
            style={{
              fontSize: 12,
              color: "var(--pt-amber)",
              textDecoration: "none",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Show all →
          </Link>
        </div>
        <RecentList games={games.slice(0, 5)} />
      </div>

      <form action={signOut} style={{ marginTop: 40 }}>
        <button
          type="submit"
          style={{
            padding: "6px 14px",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: "transparent",
            color: "var(--pt-text)",
            border: "0.5px solid var(--pt-border-strong)",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </form>
    </main>
  );
}

function Header({
  name,
  totalGames,
  tournaments,
}: {
  name: string;
  totalGames: number;
  tournaments: number;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
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
        PawnTrail · Dashboard
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 500, margin: "0 0 6px" }}>
        Welcome back, {name}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 14,
          color: "var(--pt-text-muted)",
          margin: 0,
        }}
      >
        You&apos;ve scanned {totalGames} game{totalGames === 1 ? "" : "s"}
        {tournaments > 0 ? ` across ${tournaments} tournament${tournaments === 1 ? "" : "s"}` : ""}.
      </p>
    </div>
  );
}

function ScanCta() {
  return (
    <Link
      href="/scan"
      style={{
        display: "block",
        padding: "20px 24px",
        background: "var(--pt-forest)",
        color: "var(--pt-cream)",
        borderRadius: 12,
        textDecoration: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>
            Scan your next scoresheet
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 14,
              opacity: 0.85,
            }}
          >
            Snap a photo. We&apos;ll parse and save the game in under a minute.
          </div>
        </div>
        <span
          style={{
            padding: "8px 16px",
            background: "var(--pt-amber)",
            color: "var(--pt-ink)",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Scan sheet →
        </span>
      </div>
    </Link>
  );
}

function Metric({
  label,
  value,
  subtitle,
  accent,
}: {
  label: string;
  value: string;
  subtitle: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        border: "0.5px solid var(--pt-border)",
        borderRadius: 8,
        background: "var(--pt-bg-elev)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
          fontFamily: "var(--font-mono)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 500,
          color: accent ? "var(--pt-amber)" : "var(--pt-text)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--pt-text-muted)",
          marginTop: 2,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function RecentList({ games }: { games: Game[] }) {
  return (
    <div
      style={{
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {games.map((g) => (
        <Link
          key={g.id}
          href={`/games/${g.id}`}
          style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr 80px",
            padding: "10px 14px",
            textDecoration: "none",
            color: "var(--pt-text)",
            borderBottom: "0.5px solid var(--pt-border)",
            fontSize: 13,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--pt-text-muted)",
            }}
          >
            {g.played_on
              ? new Date(g.played_on).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "—"}
          </div>
          <div>
            {g.opponent_name ?? "—"}
            {g.tournament_name && (
              <span style={{ marginLeft: 8, color: "var(--pt-text-muted)" }}>
                · {g.tournament_name}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color:
                g.result === "win"
                  ? "var(--pt-good)"
                  : g.result === "loss"
                    ? "var(--pt-blunder)"
                    : "var(--pt-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {g.result ?? "—"}
          </div>
        </Link>
      ))}
    </div>
  );
}

function EmptyDashboard({ name }: { name: string }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
        }}
      >
        PawnTrail · Dashboard
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 500, margin: 0, textAlign: "center" }}>
        Welcome, {name}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 16,
          color: "var(--pt-text-muted)",
          margin: 0,
          textAlign: "center",
          maxWidth: 420,
        }}
      >
        Snap a photo of a scoresheet to begin. Your game, the engine&apos;s
        review, and a searchable history — in under a minute.
      </p>
      <Link
        href="/scan"
        style={{
          padding: "12px 26px",
          fontSize: 15,
          fontWeight: 500,
          background: "var(--pt-forest)",
          color: "var(--pt-cream)",
          border: "0.5px solid var(--pt-forest)",
          borderRadius: 6,
          textDecoration: "none",
        }}
      >
        Scan your first game
      </Link>
      <form action={signOut} style={{ marginTop: 12 }}>
        <button
          type="submit"
          style={{
            padding: "6px 14px",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: "transparent",
            color: "var(--pt-text-muted)",
            border: "0.5px solid var(--pt-border)",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
