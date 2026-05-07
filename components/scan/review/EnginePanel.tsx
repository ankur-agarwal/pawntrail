"use client";

import type { Classification } from "@/lib/pgn/classify";
import type { EngineSnapshot } from "@/lib/stockfish/engine";
import {
  CLASS_COLOR_VAR,
  CLASS_LABEL,
  ClassDot,
  Micro,
} from "./primitives";
import { formatEval } from "./EvalBar";

export interface ReviewEnginePanelProps {
  snapshot: EngineSnapshot;
  targetDepth: number;
  classification?: Classification;
  maxLines?: number;
  pvTrim?: number;
}

export function ReviewEnginePanel({
  snapshot,
  targetDepth,
  classification,
  maxLines = 3,
  pvTrim = 6,
}: ReviewEnginePanelProps) {
  const lines = snapshot.lines.slice(0, maxLines);
  const headerEvalCp = lines[0]?.scoreCp ?? 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderTop: "0.5px solid var(--pt-border)",
        background: "var(--pt-bg-elev)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 12px",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <EngineGlyph />
          <Micro style={{ color: "var(--pt-text-muted)" }}>
            ENGINE · DEPTH {snapshot.depth || targetDepth}
          </Micro>
        </span>
        <span style={{ flex: 1 }} />
        {classification && (
          <>
            <ClassDot kind={classification} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: CLASS_COLOR_VAR[classification],
              }}
            >
              {CLASS_LABEL[classification]}
            </span>
          </>
        )}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--pt-text)",
            minWidth: 52,
            textAlign: "right",
          }}
        >
          {lines.length === 0 ? "…" : formatEval(headerEvalCp)}
        </span>
      </div>

      <div
        style={{
          padding: "0 8px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {lines.length === 0 && (
          <div
            style={{
              padding: "6px 8px",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 13,
              color: "var(--pt-text-dim)",
            }}
          >
            Analysing…
          </div>
        )}
        {lines.map((line, i) => (
          <div
            key={line.rank}
            style={{
              display: "grid",
              gridTemplateColumns: "14px 50px 1fr",
              alignItems: "baseline",
              gap: 8,
              padding: "5px 6px",
              borderRadius: 3,
              background: i === 0 ? "var(--pt-surface)" : "transparent",
              border:
                i === 0
                  ? "0.5px solid var(--pt-border)"
                  : "0.5px solid transparent",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fontWeight: 600,
                color: "var(--pt-text-dim)",
                letterSpacing: "0.06em",
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                fontWeight: 600,
                color:
                  line.scoreCp >= 0 ? "var(--pt-text)" : "var(--pt-blunder)",
                whiteSpace: "nowrap",
              }}
            >
              {line.mate !== null
                ? `${line.mate > 0 ? "#" : "-#"}${Math.abs(line.mate)}`
                : formatEval(line.scoreCp)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--pt-text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: "18px",
              }}
            >
              {line.pv.slice(0, pvTrim).map((m, j) => (
                <span key={j}>
                  {j > 0 && (
                    <span style={{ color: "var(--pt-text-dim)" }}> · </span>
                  )}
                  <span style={{ color: "var(--pt-text)" }}>{m}</span>
                </span>
              ))}
              {line.pv.length > pvTrim && (
                <span style={{ color: "var(--pt-text-dim)" }}> …</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EngineGlyph() {
  return (
    <svg
      width={11}
      height={11}
      viewBox="0 0 12 12"
      style={{ display: "block" }}
      aria-hidden
    >
      <circle
        cx={6}
        cy={6}
        r={5}
        fill="none"
        stroke="var(--pt-text)"
        strokeWidth={0.8}
      />
      <circle cx={6} cy={6} r={1.6} fill="var(--pt-text)" />
      <line x1={6} y1={0.5} x2={6} y2={2.4} stroke="var(--pt-text)" strokeWidth={0.8} />
      <line x1={6} y1={9.6} x2={6} y2={11.5} stroke="var(--pt-text)" strokeWidth={0.8} />
      <line x1={0.5} y1={6} x2={2.4} y2={6} stroke="var(--pt-text)" strokeWidth={0.8} />
      <line x1={9.6} y1={6} x2={11.5} y2={6} stroke="var(--pt-text)" strokeWidth={0.8} />
    </svg>
  );
}
