"use client";

import { useEffect, useMemo, useState } from "react";
import { ChessBoard } from "@/components/board/ChessBoard";
import type { Key as CgKey } from "@lichess-org/chessground/types";
import { parseGamePgn, START_FEN } from "@/lib/pgn/parseGamePgn";
import type { Game, Move } from "@/lib/supabase/helpers";
import { openInLichessPaste } from "@/lib/lichess/openInStudy";

export interface GameDetailProps {
  game: Game;
  moves: Move[];
}

export function GameDetail({ game }: GameDetailProps) {
  const plies = useMemo(() => parseGamePgn(game.pgn), [game.pgn]);
  const [selectedPly, setSelectedPly] = useState(0); // 0 = start
  const [orientation, setOrientation] = useState<"white" | "black">(
    game.color === "black" ? "black" : "white",
  );
  const [copied, setCopied] = useState(false);

  const fen = useMemo(() => {
    if (selectedPly === 0) return START_FEN;
    const p = plies[selectedPly - 1];
    return p?.fenAfter ?? START_FEN;
  }, [plies, selectedPly]);

  const lastMove = useMemo<[CgKey, CgKey] | undefined>(() => {
    if (selectedPly === 0) return undefined;
    const p = plies[selectedPly - 1];
    return p ? [p.from as CgKey, p.to as CgKey] : undefined;
  }, [plies, selectedPly]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setSelectedPly((p) => Math.min(plies.length, p + 1));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setSelectedPly((p) => Math.max(0, p - 1));
          break;
        case "Home":
          e.preventDefault();
          setSelectedPly(0);
          break;
        case "End":
          e.preventDefault();
          setSelectedPly(plies.length);
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [plies.length]);

  async function handleCopyPgn() {
    await navigator.clipboard.writeText(game.pgn);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownloadPgn() {
    const blob = new Blob([game.pgn], { type: "application/x-chess-pgn" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pawntrail-${game.id.slice(0, 8)}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleOpenLichess() {
    openInLichessPaste(game.pgn);
  }

  return (
    <main style={{ padding: "40px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <Breadcrumb game={game} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 300px",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}
          >
            <ChessBoard
              fen={fen}
              orientation={orientation}
              size={440}
              lastMove={lastMove}
            />
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--pt-text-muted)",
              textAlign: "center",
            }}
          >
            {selectedPly === 0
              ? "Start position"
              : `Ply ${selectedPly} of ${plies.length} · ${plies[selectedPly - 1]?.san ?? ""}`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ActionBar
            onFlip={() =>
              setOrientation(orientation === "white" ? "black" : "white")
            }
            onCopy={handleCopyPgn}
            onDownload={handleDownloadPgn}
            onOpenLichess={handleOpenLichess}
            copied={copied}
          />
          <MoveList
            plies={plies}
            selectedPly={selectedPly}
            onSelect={setSelectedPly}
          />
          <GameFacts game={game} />
        </div>
      </div>
    </main>
  );
}

function Breadcrumb({ game }: { game: Game }) {
  return (
    <div
      style={{
        fontSize: 13,
        marginBottom: 16,
        color: "var(--pt-text-muted)",
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.05em",
      }}
    >
      <a href="/games" style={{ color: "var(--pt-text-muted)" }}>
        Library
      </a>
      <span style={{ margin: "0 8px" }}>›</span>
      <span style={{ color: "var(--pt-text)" }}>
        {game.tournament_name ?? "Game"}
        {game.round ? ` · ${game.round}` : ""}
      </span>
    </div>
  );
}

function ActionBar({
  onFlip,
  onCopy,
  onDownload,
  onOpenLichess,
  copied,
}: {
  onFlip: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onOpenLichess: () => void;
  copied: boolean;
}) {
  const btnStyle: React.CSSProperties = {
    padding: "6px 10px",
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    background: "transparent",
    color: "var(--pt-text)",
    border: "0.5px solid var(--pt-border-strong)",
    borderRadius: 4,
    cursor: "pointer",
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      <button type="button" onClick={onFlip} style={btnStyle}>
        Flip
      </button>
      <button type="button" onClick={onCopy} style={btnStyle}>
        {copied ? "Copied" : "Copy PGN"}
      </button>
      <button type="button" onClick={onDownload} style={btnStyle}>
        Download
      </button>
      <button
        type="button"
        onClick={onOpenLichess}
        style={{
          ...btnStyle,
          background: "var(--pt-forest)",
          color: "var(--pt-cream)",
          border: "0.5px solid var(--pt-forest)",
        }}
      >
        Open in Lichess
      </button>
    </div>
  );
}

function MoveList({
  plies,
  selectedPly,
  onSelect,
}: {
  plies: ReturnType<typeof parseGamePgn>;
  selectedPly: number;
  onSelect: (p: number) => void;
}) {
  const rows: Array<{ number: number; white?: typeof plies[0]; black?: typeof plies[0] }> = [];
  plies.forEach((p) => {
    const idx = Math.floor((p.ply - 1) / 2);
    const rowNum = idx + 1;
    if (!rows[idx]) rows[idx] = { number: rowNum };
    if (p.side === "w") rows[idx]!.white = p;
    else rows[idx]!.black = p;
  });

  return (
    <div
      style={{
        padding: 10,
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 8,
        background: "var(--pt-bg-elev)",
        maxHeight: 260,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
          fontFamily: "var(--font-mono)",
          marginBottom: 10,
        }}
      >
        Moves
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "24px 1fr 1fr",
          rowGap: 2,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
      >
        {rows.map((row) => (
          <div key={row.number} style={{ display: "contents" }}>
            <div style={{ color: "var(--pt-text-dim)", paddingTop: 4 }}>
              {row.number}.
            </div>
            <Cell ply={row.white} selectedPly={selectedPly} onSelect={onSelect} />
            <Cell ply={row.black} selectedPly={selectedPly} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Cell({
  ply,
  selectedPly,
  onSelect,
}: {
  ply: ReturnType<typeof parseGamePgn>[number] | undefined;
  selectedPly: number;
  onSelect: (p: number) => void;
}) {
  if (!ply) return <div />;
  const active = selectedPly === ply.ply;
  return (
    <button
      type="button"
      onClick={() => onSelect(ply.ply)}
      style={{
        padding: "3px 8px",
        fontFamily: "inherit",
        fontSize: "inherit",
        textAlign: "left",
        background: active ? "var(--pt-forest)" : "transparent",
        color: active ? "var(--pt-cream)" : "var(--pt-text)",
        border: "none",
        borderRadius: 3,
        cursor: "pointer",
      }}
    >
      {ply.san}
    </button>
  );
}

function GameFacts({ game }: { game: Game }) {
  const row = (label: string, value: string | null | undefined) =>
    value ? (
      <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
        <span
          style={{
            width: 90,
            color: "var(--pt-text-muted)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontSize: 10,
            paddingTop: 1,
          }}
        >
          {label}
        </span>
        <span>{value}</span>
      </div>
    ) : null;

  return (
    <div
      style={{
        padding: 12,
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 8,
        background: "var(--pt-bg-elev)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {row("Opponent", game.opponent_name)}
      {row(
        "Rating",
        game.opponent_rating ? String(game.opponent_rating) : null,
      )}
      {row("Color", game.color)}
      {row("Result", game.result)}
      {row("Tournament", game.tournament_name)}
      {row("Round", game.round)}
      {row("Date", game.played_on)}
      {row("Time", game.time_control)}
    </div>
  );
}
