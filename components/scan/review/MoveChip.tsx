"use client";

import type { MouseEvent } from "react";
import type { Classification } from "@/lib/pgn/classify";
import { ClassDot } from "./primitives";

export interface ReviewMoveChipState {
  san: string;
  flagged: boolean;
  corrected: boolean;
  /** 0..1, only meaningful for flagged plies. Undefined hides the underline. */
  confidence?: number;
  classification?: Classification;
}

export function MoveChip({
  state,
  active,
  dense = false,
  onClick,
  onCorrect,
}: {
  state: ReviewMoveChipState;
  active: boolean;
  dense?: boolean;
  onClick: () => void;
  onCorrect: () => void;
}) {
  const { flagged, corrected, classification } = state;
  const lowConf = (state.confidence ?? 1) < 0.7;
  const showClassDot =
    !active &&
    classification &&
    classification !== "good" &&
    classification !== "book";

  const handleContext = (e: MouseEvent) => {
    e.preventDefault();
    onCorrect();
  };

  return (
    <button
      type="button"
      onClick={flagged ? onCorrect : onClick}
      onContextMenu={handleContext}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: dense ? 22 : 26,
        padding: dense ? "0 6px" : "0 8px",
        background: active
          ? "var(--pt-forest)"
          : flagged
            ? "rgba(199,127,58,0.12)"
            : "transparent",
        color: active
          ? "var(--pt-cream)"
          : flagged
            ? "var(--pt-amber-deep)"
            : "var(--pt-text)",
        border: active
          ? "0.5px solid var(--pt-forest-deep)"
          : flagged
            ? "0.5px dashed rgba(199,127,58,0.6)"
            : "0.5px solid transparent",
        borderRadius: "var(--pt-r-chip)",
        fontFamily: "var(--font-mono)",
        fontSize: dense ? 12 : 13,
        fontWeight: 500,
        letterSpacing: "0.01em",
        cursor: "pointer",
        textDecoration: lowConf && !corrected ? "underline" : "none",
        textDecorationStyle: "dotted",
        textDecorationColor: "var(--pt-amber)",
        textUnderlineOffset: 3,
      }}
    >
      {state.san}
      {showClassDot && classification && (
        <ClassDot kind={classification} size={6} />
      )}
      {flagged && (
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--pt-amber)",
            animation: "pt-confidence-blink 1.4s ease-in-out infinite",
          }}
        />
      )}
      {corrected && (
        <span
          aria-label="Corrected"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 9,
            fontWeight: 600,
            color: "var(--pt-good)",
            letterSpacing: "0.05em",
          }}
        >
          ✓
        </span>
      )}
    </button>
  );
}
