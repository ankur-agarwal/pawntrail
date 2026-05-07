"use client";

import { TrailMark } from "@/components/brand/TrailMark";
import { Badge, Micro } from "./primitives";

export interface GameHeaderProps {
  whiteName: string;
  blackName: string;
  opening?: string;
  eco?: string;
  date?: string;
  dirty: boolean;
  saving: boolean;
  saveDisabled: boolean;
  onSave: () => void;
  onDiscard: () => void;
  compact?: boolean;
}

export function GameHeader({
  whiteName,
  blackName,
  opening,
  eco,
  date,
  dirty,
  saving,
  saveDisabled,
  onSave,
  onDiscard,
  compact = false,
}: GameHeaderProps) {
  const subParts = [opening, eco, date].filter(Boolean).join(" · ");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: compact ? "10px 14px" : "12px 20px",
        borderBottom: "0.5px solid var(--pt-border)",
        background: "var(--pt-surface)",
      }}
    >
      <TrailMark size={compact ? 20 : 24} />
      <span
        aria-hidden
        style={{ width: 1, height: 18, background: "var(--pt-border)" }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minWidth: 0,
          flex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: compact ? 13 : 14,
            fontWeight: 500,
            color: "var(--pt-text)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {whiteName}{" "}
          <span style={{ color: "var(--pt-text-dim)" }}>vs</span> {blackName}
        </span>
        {subParts && (
          <Micro style={{ color: "var(--pt-text-muted)" }}>{subParts}</Micro>
        )}
      </div>
      {!compact && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge tone={dirty ? "amber" : "default"} mono>
            {dirty ? "Unsaved" : "Clean"}
          </Badge>
          <button
            type="button"
            onClick={onDiscard}
            style={{
              padding: "6px 12px",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              background: "transparent",
              color: "var(--pt-text-muted)",
              border: "0.5px solid var(--pt-border-strong)",
              borderRadius: "var(--pt-r-chip)",
              cursor: "pointer",
            }}
          >
            Discard
          </button>
          <SavePrimary
            disabled={saveDisabled}
            saving={saving}
            onClick={onSave}
          />
        </div>
      )}
      {compact && (
        <SavePrimary
          disabled={saveDisabled}
          saving={saving}
          onClick={onSave}
        />
      )}
    </div>
  );
}

function SavePrimary({
  disabled,
  saving,
  onClick,
}: {
  disabled: boolean;
  saving: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "7px 14px",
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: disabled ? "var(--pt-bg-elev)" : "var(--pt-amber)",
        color: disabled ? "var(--pt-text-dim)" : "var(--pt-cream)",
        border: 0,
        borderRadius: "var(--pt-r-chip)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {saving ? "Saving…" : "Save game"}
    </button>
  );
}
