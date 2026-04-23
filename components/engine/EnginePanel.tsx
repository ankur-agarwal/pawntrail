"use client";

import { useState } from "react";
import { useEngine } from "@/hooks/useEngine";
import type { EngineLine } from "@/lib/stockfish/parser";

export function EnginePanel({
  fen,
  onLineClick,
}: {
  fen: string;
  onLineClick?: (line: EngineLine) => void;
}) {
  const [targetDepth, setTargetDepth] = useState(22);
  const [multiPV, setMultiPV] = useState(3);
  const state = useEngine(fen, { targetDepth, multiPV });

  return (
    <div
      style={{
        padding: 12,
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 8,
        background: "var(--pt-bg-elev)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
          fontFamily: "var(--font-mono)",
          marginBottom: 10,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            aria-label={state.running ? "running" : "paused"}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: state.running ? "var(--pt-amber)" : "var(--pt-text-dim)",
              display: "inline-block",
              animation: state.running ? "pulse 1.2s infinite" : "none",
            }}
          />
          Engine · depth {state.depth} / {targetDepth}
        </span>
        <span style={{ color: "var(--pt-text-dim)" }}>
          {state.nps > 0 ? `${(state.nps / 1_000_000).toFixed(2)} M nps` : "—"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <Select
          label="Depth"
          value={targetDepth}
          options={[18, 22, 26, 30]}
          onChange={setTargetDepth}
        />
        <Select
          label="Lines"
          value={multiPV}
          options={[1, 3, 5]}
          onChange={setMultiPV}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {state.lines.length === 0 && (
          <div
            style={{
              fontSize: 12,
              color: "var(--pt-text-dim)",
              fontStyle: "italic",
              fontFamily: "var(--font-serif)",
            }}
          >
            Analysing…
          </div>
        )}
        {state.lines.map((line) => (
          <LineRow
            key={line.rank}
            line={line}
            onClick={() => onLineClick?.(line)}
          />
        ))}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
    </div>
  );
}

function LineRow({
  line,
  onClick,
}: {
  line: EngineLine;
  onClick: () => void;
}) {
  const formatScore = () => {
    if (line.mate !== null) return `#${Math.abs(line.mate)}`;
    const n = (line.scoreCp / 100).toFixed(2);
    return line.scoreCp >= 0 ? `+${n}` : n;
  };
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "grid",
        gridTemplateColumns: "18px 50px 1fr",
        gap: 8,
        padding: "6px 8px",
        background: line.rank === 1 ? "var(--pt-bg-elev)" : "transparent",
        border:
          line.rank === 1
            ? "0.5px solid var(--pt-border-strong)"
            : "0.5px solid transparent",
        borderRadius: 4,
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
        color: "var(--pt-text)",
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontFamily: "var(--font-mono)",
          color: "var(--pt-text-dim)",
          paddingTop: 2,
        }}
      >
        {line.rank}
      </span>
      <span
        style={{
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          color: line.scoreCp >= 0 ? "var(--pt-good)" : "var(--pt-blunder)",
        }}
      >
        {formatScore()}
      </span>
      <span
        style={{
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {line.pv.slice(0, 10).join(" ")}
      </span>
    </button>
  );
}

function Select<T extends number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--pt-text-muted)",
      }}
    >
      {label}
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as T)}
        style={{
          padding: "2px 6px",
          background: "var(--pt-bg)",
          color: "var(--pt-text)",
          border: "0.5px solid var(--pt-border-strong)",
          borderRadius: 3,
          fontSize: 11,
          fontFamily: "inherit",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
