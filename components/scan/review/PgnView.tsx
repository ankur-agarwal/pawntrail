"use client";

import { useState } from "react";
import { Micro } from "./primitives";

export function PgnView({ pgn }: { pgn: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(pgn);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard write blocked */
    }
  };
  return (
    <div
      style={{
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Micro style={{ color: "var(--pt-text-muted)" }}>PGN</Micro>
        <button
          type="button"
          onClick={onCopy}
          disabled={!pgn}
          style={{
            padding: "4px 10px",
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 500,
            background: "transparent",
            color: "var(--pt-text)",
            border: "0.5px solid var(--pt-border-strong)",
            borderRadius: "var(--pt-r-chip)",
            cursor: pgn ? "pointer" : "not-allowed",
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: 10,
          background: "var(--pt-bg-elev)",
          border: "0.5px solid var(--pt-border)",
          borderRadius: "var(--pt-r-card)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          lineHeight: "18px",
          color: "var(--pt-text)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          maxHeight: 360,
          overflowY: "auto",
        }}
      >
        {pgn || "(no valid moves yet)"}
      </pre>
    </div>
  );
}
