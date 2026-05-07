"use client";

import { Chip, NavBtn } from "./primitives";

export interface PlaybackBarProps {
  ply: number;
  total: number;
  flaggedCount: number;
  onJump: (idx: number) => void;
  onJumpToFlag: () => void;
}

export function PlaybackBar({
  ply,
  total,
  flaggedCount,
  onJump,
  onJumpToFlag,
}: PlaybackBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        borderTop: "0.5px solid var(--pt-border)",
        background: "var(--pt-bg-elev)",
      }}
    >
      <NavBtn onClick={() => onJump(-1)} title="Start">
        «
      </NavBtn>
      <NavBtn onClick={() => onJump(Math.max(-1, ply - 1))} title="Previous">
        ‹
      </NavBtn>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--pt-text-muted)",
          minWidth: 56,
          textAlign: "center",
        }}
      >
        {ply + 1} / {total}
      </span>
      <NavBtn
        onClick={() => onJump(Math.min(total - 1, ply + 1))}
        title="Next"
      >
        ›
      </NavBtn>
      <NavBtn onClick={() => onJump(total - 1)} title="End">
        »
      </NavBtn>
      <span style={{ flex: 1 }} />
      {flaggedCount > 0 && (
        <Chip
          tone="amber"
          onClick={onJumpToFlag}
          icon={
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
          }
        >
          {flaggedCount} to review
        </Chip>
      )}
    </div>
  );
}
