"use client";

export function evalToFraction(cp: number): number {
  const t = Math.tanh(cp / 250);
  return Math.max(0.04, Math.min(0.96, 0.5 + 0.5 * t));
}

export function formatEval(cp: number | null | undefined): string {
  if (cp == null) return "0.0";
  if (Math.abs(cp) >= 10000)
    return (cp > 0 ? "#" : "-#") + Math.abs(10001 - Math.abs(cp));
  const v = cp / 100;
  return (v > 0 ? "+" : "") + v.toFixed(v >= 10 ? 1 : 2);
}

export interface EvalBarProps {
  cp: number;
  height?: number;
  width?: number;
}

export function EvalBar({ cp, height = 460, width = 18 }: EvalBarProps) {
  const frac = evalToFraction(cp);
  const whiteH = frac * height;
  const blackH = height - whiteH;
  const label = formatEval(cp);
  const sideTop = cp >= 0 ? "black" : "white";
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 4,
        overflow: "hidden",
        border: "0.5px solid var(--pt-border-strong)",
        background: "var(--pt-ink)",
        position: "relative",
        flexShrink: 0,
        boxShadow: "inset 0 0 0 0.5px rgba(244,237,220,0.04)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: blackH,
          background: "var(--pt-ink)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: whiteH,
          background: "var(--pt-cream)",
          transition: "height 240ms cubic-bezier(.4,0,.2,1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: 0.5,
          background: "rgba(244,237,220,0.18)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          [sideTop === "black" ? "top" : "bottom"]: 4,
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          fontWeight: 600,
          color: sideTop === "black" ? "var(--pt-cream)" : "var(--pt-ink)",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
    </div>
  );
}
