"use client";

import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import type { Ply } from "@/lib/pgn/build";
import { suggestionsFor } from "@/lib/pgn/suggestions";
import { Micro } from "./primitives";

export interface Suggestion {
  san: string;
  why: string;
  preferred?: boolean;
}

const FLAGGED_CONFIDENCE = 0.6;

function deriveSuggestions(ply: Ply): Suggestion[] {
  const fen = ply.fenBefore;
  if (!fen) return [];
  const sans = suggestionsFor(fen, ply.san);
  return sans.map((san, i) => ({
    san,
    why: i === 0 ? "Closest legal move" : "Other legal candidate",
    preferred: i === 0,
  }));
}

function testLegal(fenBefore: string, san: string): boolean {
  if (!fenBefore || !san.trim()) return false;
  try {
    const game = new Chess(fenBefore);
    const move = game.move(san.trim());
    return Boolean(move);
  } catch {
    return false;
  }
}

export interface CorrectionPopoverProps {
  ply: Ply;
  variant: "desktop" | "mobile";
  onPick: (san: string) => void;
  onDismiss: () => void;
}

export function CorrectionPopover({
  ply,
  variant,
  onPick,
  onDismiss,
}: CorrectionPopoverProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const suggestions = useMemo(() => deriveSuggestions(ply), [ply]);
  const draftLegal = useMemo(
    () => testLegal(ply.fenBefore, draft),
    [ply.fenBefore, draft],
  );
  const confidencePct = Math.round(FLAGGED_CONFIDENCE * 100);

  const isMobile = variant === "mobile";

  return (
    <div
      role="dialog"
      aria-label="Correct flagged move"
      style={{
        width: isMobile ? "auto" : 280,
        background: "var(--pt-surface)",
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: "var(--pt-r-card)",
        boxShadow: "var(--pt-shadow-pop)",
        animation: "pt-pop-in 140ms ease-out",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "0.5px dashed var(--pt-border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--pt-amber)",
            animation: "pt-confidence-blink 1.4s ease-in-out infinite",
          }}
        />
        <Micro style={{ color: "var(--pt-amber-deep)", flex: 1 }}>
          Low confidence · {confidencePct}%
        </Micro>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          style={{
            background: "transparent",
            border: 0,
            color: "var(--pt-text-muted)",
            fontSize: 16,
            cursor: "pointer",
            padding: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          padding: "10px 12px",
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 14,
          lineHeight: "20px",
          color: "var(--pt-text-muted)",
          borderBottom: "0.5px dashed var(--pt-border)",
        }}
      >
        You wrote{" "}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontStyle: "normal",
            background: "rgba(199,127,58,0.15)",
            padding: "0 4px",
            borderRadius: 3,
            color: "var(--pt-text)",
          }}
        >
          {ply.san}
        </span>
        . Did you mean…
      </div>

      {editing ? (
        <ManualEdit
          value={draft}
          onChange={setDraft}
          legal={draftLegal}
          onCancel={() => {
            setEditing(false);
            setDraft("");
          }}
          onSubmit={() => {
            if (draftLegal) onPick(draft.trim());
          }}
        />
      ) : (
        <SuggestionList
          suggestions={suggestions}
          onPick={onPick}
        />
      )}

      <div
        style={{
          borderTop: "0.5px dashed var(--pt-border)",
          padding: 8,
          display: "flex",
          gap: 6,
        }}
      >
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            style={{
              flex: 1,
              padding: "8px 10px",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              background: "transparent",
              color: "var(--pt-text)",
              border: "0.5px solid var(--pt-border-strong)",
              borderRadius: "var(--pt-r-chip)",
              cursor: "pointer",
            }}
          >
            Type SAN…
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          style={{
            flex: editing ? 1 : 0,
            padding: "8px 10px",
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 500,
            background: "transparent",
            color: "var(--pt-text-muted)",
            border: "0.5px solid transparent",
            cursor: "pointer",
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

function SuggestionList({
  suggestions,
  onPick,
}: {
  suggestions: Suggestion[];
  onPick: (san: string) => void;
}) {
  if (suggestions.length === 0) {
    return (
      <div
        style={{
          padding: "12px 14px",
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          color: "var(--pt-text-muted)",
        }}
      >
        No legal moves at this position. Fix an earlier flagged move first.
      </div>
    );
  }
  return (
    <div style={{ padding: 6 }}>
      <Micro
        style={{
          padding: "6px 8px 4px",
          color: "var(--pt-text-dim)",
          display: "block",
        }}
      >
        Replace with
      </Micro>
      {suggestions.map((s) => (
        <button
          key={s.san}
          type="button"
          onClick={() => onPick(s.san)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 8px",
            background: s.preferred
              ? "rgba(46,125,92,0.08)"
              : "transparent",
            border: 0,
            borderRadius: 4,
            cursor: "pointer",
            textAlign: "left",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = s.preferred
              ? "rgba(46,125,92,0.14)"
              : "var(--pt-bg-elev)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = s.preferred
              ? "rgba(46,125,92,0.08)"
              : "transparent";
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--pt-text)",
              minWidth: 56,
            }}
          >
            {s.san}
          </span>
          <span
            style={{
              flex: 1,
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              color: "var(--pt-text-muted)",
              lineHeight: "16px",
            }}
          >
            {s.why}
          </span>
          {s.preferred && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "var(--pt-good)",
              }}
            >
              BEST
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function ManualEdit({
  value,
  onChange,
  legal,
  onCancel,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  legal: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}
    >
      <Micro style={{ color: "var(--pt-text-dim)" }}>
        Type SAN (e.g. Nf3, exd5, O-O)
      </Micro>
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Nf3"
        style={{
          padding: "6px 10px",
          fontFamily: "var(--font-mono)",
          fontSize: 14,
          background: "var(--pt-bg)",
          color: "var(--pt-text)",
          border: `0.5px solid ${
            value && !legal
              ? "var(--pt-blunder)"
              : value && legal
                ? "var(--pt-good)"
                : "var(--pt-border-strong)"
          }`,
          borderRadius: 4,
          outline: "none",
        }}
      />
      <div style={{ display: "flex", gap: 6 }}>
        <button
          type="submit"
          disabled={!legal}
          style={{
            flex: 1,
            padding: "6px 10px",
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 500,
            background: legal ? "var(--pt-forest)" : "var(--pt-bg-elev)",
            color: legal ? "var(--pt-cream)" : "var(--pt-text-dim)",
            border: 0,
            borderRadius: 4,
            cursor: legal ? "pointer" : "not-allowed",
          }}
        >
          Use
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "6px 10px",
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            background: "transparent",
            color: "var(--pt-text-muted)",
            border: "0.5px solid var(--pt-border)",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>
    </form>
  );
}
