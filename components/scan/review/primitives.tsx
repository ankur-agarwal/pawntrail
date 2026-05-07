"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Classification } from "@/lib/pgn/classify";

export const CLASS_LABEL: Record<Classification, string> = {
  good: "GOOD",
  book: "BOOK",
  inaccuracy: "INACCURACY",
  mistake: "MISTAKE",
  blunder: "BLUNDER",
};

export const CLASS_COLOR_VAR: Record<Classification, string> = {
  good: "var(--pt-good)",
  book: "var(--pt-book)",
  inaccuracy: "var(--pt-inaccuracy)",
  mistake: "var(--pt-mistake)",
  blunder: "var(--pt-blunder)",
};

export function ClassDot({
  kind,
  size = 8,
}: {
  kind: Classification;
  size?: number;
}) {
  return (
    <span
      title={CLASS_LABEL[kind]}
      aria-label={CLASS_LABEL[kind]}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: kind === "book" ? 2 : "50%",
        background: CLASS_COLOR_VAR[kind],
        flexShrink: 0,
      }}
    />
  );
}

export function NavBtn({
  children,
  onClick,
  title,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        width: 28,
        height: 28,
        padding: 0,
        background: "var(--pt-surface)",
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: "var(--pt-r-card)",
        color: disabled ? "var(--pt-text-dim)" : "var(--pt-text)",
        fontFamily: "var(--font-mono)",
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

export function Chip({
  children,
  tone = "default",
  icon,
  onClick,
}: {
  children: ReactNode;
  tone?: "default" | "amber";
  icon?: ReactNode;
  onClick?: () => void;
}) {
  const amber = tone === "amber";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        background: amber ? "rgba(199,127,58,0.12)" : "var(--pt-bg-elev)",
        border: amber
          ? "0.5px dashed rgba(199,127,58,0.6)"
          : "0.5px solid var(--pt-border)",
        borderRadius: "var(--pt-r-pill)",
        color: amber ? "var(--pt-amber-deep)" : "var(--pt-text)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.04em",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "default",
  mono = false,
}: {
  children: ReactNode;
  tone?: "default" | "amber" | "good";
  mono?: boolean;
}) {
  const palette =
    tone === "amber"
      ? {
          bg: "rgba(199,127,58,0.12)",
          border: "rgba(199,127,58,0.5)",
          color: "var(--pt-amber-deep)",
        }
      : tone === "good"
        ? {
            bg: "rgba(46,125,92,0.1)",
            border: "rgba(46,125,92,0.5)",
            color: "var(--pt-good)",
          }
        : {
            bg: "var(--pt-bg-elev)",
            border: "var(--pt-border)",
            color: "var(--pt-text-muted)",
          };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        background: palette.bg,
        border: `0.5px solid ${palette.border}`,
        borderRadius: "var(--pt-r-chip)",
        color: palette.color,
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

export function SegControl<T extends string>({
  value,
  options,
  onChange,
  size = "md",
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  const padY = size === "sm" ? 4 : 6;
  const padX = size === "sm" ? 8 : 10;
  const fontSize = size === "sm" ? 11 : 12;
  return (
    <div
      role="tablist"
      style={{
        display: "inline-flex",
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: "var(--pt-r-chip)",
        overflow: "hidden",
        background: "var(--pt-bg)",
      }}
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            style={{
              padding: `${padY}px ${padX}px`,
              fontSize,
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              letterSpacing: "0.04em",
              border: "none",
              borderRight:
                i < options.length - 1
                  ? "0.5px solid var(--pt-border)"
                  : "none",
              background: active ? "var(--pt-forest)" : "transparent",
              color: active ? "var(--pt-cream)" : "var(--pt-text)",
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Avatar({
  name,
  size = 26,
  tone = "forest",
}: {
  name: string;
  size?: number;
  tone?: "forest" | "amber";
}) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("");
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          tone === "amber"
            ? "rgba(199,127,58,0.18)"
            : "rgba(31,58,46,0.18)",
        color:
          tone === "amber" ? "var(--pt-amber-deep)" : "var(--pt-forest)",
        fontFamily: "var(--font-mono)",
        fontSize: Math.round(size * 0.42),
        fontWeight: 600,
        letterSpacing: "0.02em",
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </span>
  );
}

export function Micro({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span className="pt-micro" style={style}>
      {children}
    </span>
  );
}
