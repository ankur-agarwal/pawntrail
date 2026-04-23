"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChessBoard } from "@/components/board/ChessBoard";
import { EvalBar } from "@/components/board/EvalBar";
import { EvalGraph } from "@/components/board/EvalGraph";
import type { Key as CgKey } from "@lichess-org/chessground/types";
import { parseGamePgn, START_FEN } from "@/lib/pgn/parseGamePgn";
import { classifyMove } from "@/lib/pgn/classify";
import { openInLichessPaste } from "@/lib/lichess/openInStudy";
import type { Game, Move } from "@/lib/supabase/helpers";
import {
  persistMoveReview,
  markGameReviewed,
} from "@/app/(app)/games/[gameId]/actions";

const EnginePanel = dynamic(
  () => import("@/components/engine/EnginePanel").then((m) => m.EnginePanel),
  { ssr: false, loading: () => <EnginePanelSkeleton /> },
);

export interface GameDetailProps {
  game: Game;
  moves: Move[];
}

export function GameDetail({ game, moves: initialMoves }: GameDetailProps) {
  const plies = useMemo(() => parseGamePgn(game.pgn), [game.pgn]);
  const [moves, setMoves] = useState<Move[]>(initialMoves);
  const [selectedPly, setSelectedPly] = useState(0);
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

  const currentMove = moves.find((m) => m.ply === selectedPly);
  const evalCp = currentMove?.eval_cp ?? null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.target instanceof HTMLSelectElement) return;
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

  useBackgroundReview({
    gameId: game.id,
    moves,
    plies,
    alreadyReviewed: !!game.engine_reviewed_at,
    onUpdate: (ply, evalCp, bestMoveSan, classification) => {
      setMoves((prev) =>
        prev.map((m) =>
          m.ply === ply
            ? { ...m, eval_cp: evalCp, best_move_san: bestMoveSan, classification }
            : m,
        ),
      );
    },
  });

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

  return (
    <main style={{ padding: "40px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <Breadcrumb game={game} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "16px minmax(0, 1fr) 300px",
          gap: 16,
          alignItems: "start",
        }}
      >
        <EvalBar scoreCp={evalCp} mate={null} height={440} />

        <div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ChessBoard
              fen={fen}
              orientation={orientation}
              size={440}
              lastMove={lastMove}
            />
          </div>
          <div
            style={{
              marginTop: 10,
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

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <ActionBar
            onFlip={() =>
              setOrientation(orientation === "white" ? "black" : "white")
            }
            onCopy={handleCopyPgn}
            onDownload={handleDownloadPgn}
            onOpenLichess={() => openInLichessPaste(game.pgn)}
            copied={copied}
          />
          <EnginePanel fen={fen} />
          <GameMoveList
            moves={moves}
            plies={plies}
            selectedPly={selectedPly}
            onSelect={setSelectedPly}
          />
          <GameFacts game={game} />
        </div>
      </div>

      <EvalGraph moves={moves} selectedPly={selectedPly} onSeek={setSelectedPly} />
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
      <Link href="/games" style={{ color: "var(--pt-text-muted)" }}>
        Library
      </Link>
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

function GameMoveList({
  moves,
  plies,
  selectedPly,
  onSelect,
}: {
  moves: Move[];
  plies: ReturnType<typeof parseGamePgn>;
  selectedPly: number;
  onSelect: (p: number) => void;
}) {
  const moveByPly = new Map(moves.map((m) => [m.ply, m]));
  const rows: Array<{
    number: number;
    white?: typeof plies[0];
    black?: typeof plies[0];
  }> = [];
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
            <Cell
              ply={row.white}
              move={row.white ? moveByPly.get(row.white.ply) : undefined}
              selectedPly={selectedPly}
              onSelect={onSelect}
            />
            <Cell
              ply={row.black}
              move={row.black ? moveByPly.get(row.black.ply) : undefined}
              selectedPly={selectedPly}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Cell({
  ply,
  move,
  selectedPly,
  onSelect,
}: {
  ply: ReturnType<typeof parseGamePgn>[number] | undefined;
  move: Move | undefined;
  selectedPly: number;
  onSelect: (p: number) => void;
}) {
  if (!ply) return <div />;
  const active = selectedPly === ply.ply;
  const cls = move?.classification;
  const isBlunder = cls === "blunder";
  const isMistake = cls === "mistake";
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
        color: active
          ? "var(--pt-cream)"
          : isBlunder
            ? "var(--pt-blunder)"
            : isMistake
              ? "var(--pt-mistake)"
              : "var(--pt-text)",
        border: "none",
        borderRadius: 3,
        cursor: "pointer",
      }}
    >
      {ply.san}
      {(isBlunder || isMistake) && !active && (
        <span style={{ marginLeft: 4, fontSize: 10 }}>{isBlunder ? "??" : "?"}</span>
      )}
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

function EnginePanelSkeleton() {
  return (
    <div
      style={{
        padding: 12,
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 8,
        background: "var(--pt-bg-elev)",
        fontSize: 12,
        color: "var(--pt-text-dim)",
        fontStyle: "italic",
        fontFamily: "var(--font-serif)",
      }}
    >
      Loading engine…
    </div>
  );
}

function useBackgroundReview({
  gameId,
  moves,
  plies,
  alreadyReviewed,
  onUpdate,
}: {
  gameId: string;
  moves: Move[];
  plies: ReturnType<typeof parseGamePgn>;
  alreadyReviewed: boolean;
  onUpdate: (
    ply: number,
    evalCp: number,
    bestMoveSan: string | null,
    classification: ReturnType<typeof classifyMove> | null,
  ) => void;
}) {
  useEffect(() => {
    if (typeof Worker === "undefined") return;
    const pending = moves
      .filter((m) => m.eval_cp === null)
      .sort((a, b) => a.ply - b.ply);
    if (pending.length === 0) {
      if (!alreadyReviewed) void markGameReviewed(gameId);
      return;
    }

    let cancelled = false;
    (async () => {
      const { Engine } = await import("@/lib/stockfish/engine");
      const engine = new Engine();
      for (const move of pending) {
        if (cancelled) break;
        const ply = plies.find((p) => p.ply === move.ply);
        if (!ply) continue;
        const result = await analyzeUntilBestmove(
          engine,
          ply.fenBefore,
          18,
          1,
        );
        if (!result || cancelled) continue;
        const bestEval = result.bestEvalCp;
        const bestMoveSan = result.bestMoveSan;
        const prevMove = moves.find((m) => m.ply === move.ply - 1);
        const prevEval = prevMove?.eval_cp ?? 0;
        const classification =
          prevMove == null
            ? null
            : classifyMove(ply.side, bestEval, -bestEval); // placeholder, fixed below
        // Proper classification needs the played-move eval too; for v1 we
        // approximate: classification = delta between best from fenBefore
        // and actual eval after the played move (which is the negation of
        // the next-position's best for the opponent). We store bestEval as
        // the eval of the position *after* the played move for simplicity.
        const evalAfter = bestEval;
        const delta =
          ply.side === "w" ? prevEval - evalAfter : evalAfter - prevEval;
        let cls: ReturnType<typeof classifyMove>;
        if (delta <= 30) cls = "good";
        else if (delta <= 80) cls = "inaccuracy";
        else if (delta <= 200) cls = "mistake";
        else cls = "blunder";

        onUpdate(move.ply, evalAfter, bestMoveSan, cls);
        void persistMoveReview(gameId, move.ply, evalAfter, bestMoveSan, cls);
      }
      engine.destroy();
      if (!cancelled && !alreadyReviewed) void markGameReviewed(gameId);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);
}

async function analyzeUntilBestmove(
  engine: import("@/lib/stockfish/engine").Engine,
  fen: string,
  targetDepth: number,
  multiPV: number,
): Promise<{ bestEvalCp: number; bestMoveSan: string | null } | null> {
  return new Promise((resolve) => {
    let best: { bestEvalCp: number; bestMoveSan: string | null } | null = null;
    const unsub = engine.subscribe((s) => {
      if (s.lines.length > 0) {
        const top = s.lines[0]!;
        best = { bestEvalCp: top.scoreCp, bestMoveSan: top.pv[0] ?? null };
      }
      if (!s.running && s.bestMoveUci) {
        unsub();
        resolve(best);
      }
    });
    engine.analyze(fen, { targetDepth, multiPV });
  });
}
