"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDeferredValue, useEffect, useState, useTransition } from "react";
import type { Game } from "@/lib/supabase/helpers";

type Filters = {
  q?: string;
  result?: string;
  color?: string;
  eco?: string;
};

export function LibraryTable({
  games,
  initialFilters,
}: {
  games: Game[];
  initialFilters: Filters;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initialFilters.q ?? "");
  const deferredQ = useDeferredValue(q);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const next = new URLSearchParams(params.toString());
    if (deferredQ) next.set("q", deferredQ);
    else next.delete("q");
    const s = next.toString();
    startTransition(() => {
      router.replace(`/games${s ? `?${s}` : ""}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredQ]);

  function setChip(key: keyof Filters, value: string | undefined) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const s = next.toString();
    startTransition(() => {
      router.replace(`/games${s ? `?${s}` : ""}`);
    });
  }

  return (
    <>
      <FilterBar
        q={q}
        setQ={setQ}
        filters={initialFilters}
        setChip={setChip}
        isPending={isPending}
      />
      {games.length > 0 && <Table games={games} />}
    </>
  );
}

function FilterBar({
  q,
  setQ,
  filters,
  setChip,
  isPending,
}: {
  q: string;
  setQ: (v: string) => void;
  filters: Filters;
  setChip: (k: keyof Filters, v: string | undefined) => void;
  isPending: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 20,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search opponent, opening, tournament…"
        style={{
          flex: 1,
          minWidth: 220,
          padding: "8px 12px",
          fontSize: 13,
          background: "transparent",
          border: "0.5px solid var(--pt-border-strong)",
          borderRadius: 4,
          color: "var(--pt-text)",
          fontFamily: "inherit",
        }}
      />
      <Chip
        label="Result"
        current={filters.result}
        options={[
          { v: undefined, l: "Any" },
          { v: "win", l: "Win" },
          { v: "loss", l: "Loss" },
          { v: "draw", l: "Draw" },
        ]}
        onSelect={(v) => setChip("result", v)}
      />
      <Chip
        label="Color"
        current={filters.color}
        options={[
          { v: undefined, l: "Any" },
          { v: "white", l: "White" },
          { v: "black", l: "Black" },
        ]}
        onSelect={(v) => setChip("color", v)}
      />
      {filters.eco && (
        <button
          type="button"
          onClick={() => setChip("eco", undefined)}
          style={{
            padding: "4px 10px",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: "var(--pt-amber)",
            color: "var(--pt-ink)",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          ECO {filters.eco} ✕
        </button>
      )}
      {isPending && (
        <span
          style={{
            fontSize: 10,
            color: "var(--pt-text-dim)",
            fontFamily: "var(--font-mono)",
          }}
        >
          …
        </span>
      )}
    </div>
  );
}

function Chip({
  label,
  current,
  options,
  onSelect,
}: {
  label: string;
  current: string | undefined;
  options: Array<{ v: string | undefined; l: string }>;
  onSelect: (v: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeLabel =
    options.find((o) => o.v === current)?.l ?? options[0]?.l ?? label;
  const isActive = !!current;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "4px 10px",
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          background: isActive ? "var(--pt-forest)" : "transparent",
          color: isActive ? "var(--pt-cream)" : "var(--pt-text)",
          border: "0.5px solid var(--pt-border-strong)",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        {label}: {activeLabel}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 4,
            padding: 6,
            background: "var(--pt-bg)",
            border: "0.5px solid var(--pt-border-strong)",
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(20, 32, 26, 0.2)",
            zIndex: 10,
            minWidth: 120,
          }}
        >
          {options.map((o) => (
            <button
              key={o.l}
              type="button"
              onClick={() => {
                onSelect(o.v);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "4px 8px",
                fontSize: 12,
                fontFamily: "inherit",
                textAlign: "left",
                background: "transparent",
                border: "none",
                color: "var(--pt-text)",
                cursor: "pointer",
                borderRadius: 3,
              }}
            >
              {o.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Table({ games }: { games: Game[] }) {
  return (
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
          gridTemplateColumns: "80px 1fr 50px 80px 1fr 1fr",
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
        <div>Date</div>
        <div>Opponent</div>
        <div>Clr</div>
        <div>Result</div>
        <div>Opening</div>
        <div>Tournament</div>
      </div>
      {games.map((g) => (
        <Link
          key={g.id}
          href={`/games/${g.id}`}
          style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr 50px 80px 1fr 1fr",
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
            {g.opponent_rating && (
              <span
                style={{
                  marginLeft: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--pt-text-muted)",
                }}
              >
                {g.opponent_rating}
              </span>
            )}
          </div>
          <div>
            <span
              aria-label={g.color ?? "unknown"}
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background:
                  g.color === "white"
                    ? "var(--pt-cream-soft)"
                    : g.color === "black"
                      ? "var(--pt-ink)"
                      : "var(--pt-border-strong)",
                border: "0.5px solid var(--pt-border-strong)",
              }}
            />
          </div>
          <div>
            <ResultPill result={g.result} />
          </div>
          <div style={{ color: "var(--pt-text-muted)" }}>
            {g.opening_name ?? "—"}
            {g.eco_code && (
              <span
                style={{
                  marginLeft: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--pt-text-dim)",
                }}
              >
                {g.eco_code}
              </span>
            )}
          </div>
          <div style={{ color: "var(--pt-text-muted)" }}>
            {g.tournament_name ?? "—"}
            {g.round && (
              <span
                style={{
                  marginLeft: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--pt-text-dim)",
                }}
              >
                {g.round}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function ResultPill({ result }: { result: string | null }) {
  const style: React.CSSProperties = {
    padding: "2px 8px",
    fontSize: 10,
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    borderRadius: 10,
    display: "inline-block",
  };
  if (result === "win") {
    return (
      <span style={{ ...style, background: "rgba(46, 125, 92, 0.15)", color: "var(--pt-good)" }}>
        Win
      </span>
    );
  }
  if (result === "loss") {
    return (
      <span style={{ ...style, background: "rgba(169, 79, 36, 0.15)", color: "var(--pt-blunder)" }}>
        Loss
      </span>
    );
  }
  if (result === "draw") {
    return (
      <span style={{ ...style, background: "var(--pt-bg-elev)", color: "var(--pt-text-muted)" }}>
        Draw
      </span>
    );
  }
  return <span style={{ ...style, color: "var(--pt-text-dim)" }}>—</span>;
}
