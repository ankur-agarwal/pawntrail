"use client";

import { Micro } from "./primitives";

const STARTING_COUNTS: Record<string, number> = {
  P: 8,
  N: 2,
  B: 2,
  R: 2,
  Q: 1,
  p: 8,
  n: 2,
  b: 2,
  r: 2,
  q: 1,
};

const PIECE_GLYPH: Record<string, string> = {
  P: "♙",
  N: "♘",
  B: "♗",
  R: "♖",
  Q: "♕",
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
};

function countOnBoard(fen: string): Record<string, number> {
  const counts: Record<string, number> = {};
  const placement = fen.split(" ")[0] ?? "";
  for (const ch of placement) {
    if (ch in STARTING_COUNTS) {
      counts[ch] = (counts[ch] ?? 0) + 1;
    }
  }
  return counts;
}

export function CapturedTray({ fen }: { fen: string }) {
  const onBoard = countOnBoard(fen);
  const captured = (pieces: string[]): string[] => {
    const out: string[] = [];
    for (const p of pieces) {
      const missing = (STARTING_COUNTS[p] ?? 0) - (onBoard[p] ?? 0);
      for (let i = 0; i < missing; i++) out.push(p);
    }
    return out;
  };
  const lostByWhite = captured(["P", "N", "B", "R", "Q"]);
  const lostByBlack = captured(["p", "n", "b", "r", "q"]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Row label="WHITE" pieces={lostByWhite} />
      <Row label="BLACK" pieces={lostByBlack} />
    </div>
  );
}

function Row({ label, pieces }: { label: string; pieces: string[] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        minHeight: 18,
      }}
    >
      <Micro style={{ color: "var(--pt-text-dim)", minWidth: 38 }}>
        {label}
      </Micro>
      {pieces.length === 0 ? (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--pt-text-dim)",
          }}
        >
          —
        </span>
      ) : (
        pieces.map((p, i) => (
          <span
            key={i}
            style={{
              fontSize: 16,
              lineHeight: 1,
              color:
                p === p.toUpperCase()
                  ? "var(--pt-forest)"
                  : "var(--pt-ink)",
            }}
          >
            {PIECE_GLYPH[p]}
          </span>
        ))
      )}
    </div>
  );
}
