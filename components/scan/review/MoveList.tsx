"use client";

import type { Ply } from "@/lib/pgn/build";
import type { Classification } from "@/lib/pgn/classify";
import { MoveChip, type ReviewMoveChipState } from "./MoveChip";

const FLAGGED_CONFIDENCE = 0.6;

function chipState(
  ply: Ply,
  classification: Classification | undefined,
  corrected: boolean,
): ReviewMoveChipState {
  return {
    san: ply.san,
    flagged: ply.invalid,
    corrected,
    confidence: ply.invalid ? FLAGGED_CONFIDENCE : undefined,
    classification,
  };
}

export interface MoveListProps {
  plies: Ply[];
  currentPly: number;
  classifications: Map<number, Classification>;
  correctedPlies: Set<number>;
  onJump: (idx: number) => void;
  onOpenCorrection: (idx: number) => void;
}

export function MoveList({
  plies,
  currentPly,
  classifications,
  correctedPlies,
  onJump,
  onOpenCorrection,
}: MoveListProps) {
  const rows: Array<{ num: number; w?: Ply; b?: Ply; wIdx: number; bIdx: number }> = [];
  for (let i = 0; i < plies.length; i += 2) {
    rows.push({
      num: i / 2 + 1,
      w: plies[i],
      b: plies[i + 1],
      wIdx: i,
      bIdx: i + 1,
    });
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {rows.map((row) => {
        const isActiveRow =
          currentPly === row.wIdx || currentPly === row.bIdx;
        return (
          <div
            key={row.num}
            style={{
              display: "grid",
              gridTemplateColumns: "32px 1fr 1fr",
              alignItems: "center",
              gap: 6,
              padding: "3px 8px",
              borderBottom: "0.5px dashed var(--pt-border)",
              minHeight: 32,
              background: isActiveRow ? "var(--pt-bg-elev)" : "transparent",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--pt-text-dim)",
                letterSpacing: "0.04em",
              }}
            >
              {row.num}.
            </span>
            {row.w ? (
              <MoveChip
                state={chipState(
                  row.w,
                  classifications.get(row.wIdx),
                  correctedPlies.has(row.wIdx),
                )}
                active={currentPly === row.wIdx}
                onClick={() => onJump(row.wIdx)}
                onCorrect={() => onOpenCorrection(row.wIdx)}
              />
            ) : (
              <span />
            )}
            {row.b ? (
              <MoveChip
                state={chipState(
                  row.b,
                  classifications.get(row.bIdx),
                  correctedPlies.has(row.bIdx),
                )}
                active={currentPly === row.bIdx}
                onClick={() => onJump(row.bIdx)}
                onCorrect={() => onOpenCorrection(row.bIdx)}
              />
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--pt-text-dim)",
                }}
              >
                …
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
