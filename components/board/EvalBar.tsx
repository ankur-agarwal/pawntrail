export function EvalBar({
  scoreCp,
  mate,
  height = 440,
}: {
  scoreCp: number | null;
  mate: number | null;
  height?: number;
}) {
  let label = "0.00";
  let whitePct = 50;
  if (mate !== null) {
    label = `M${Math.abs(mate)}`;
    whitePct = mate > 0 ? 100 : 0;
  } else if (scoreCp !== null) {
    const clamped = Math.max(-1000, Math.min(1000, scoreCp));
    const normalized = 1 / (1 + Math.exp(-clamped / 400));
    whitePct = normalized * 100;
    const n = (scoreCp / 100).toFixed(2);
    label = scoreCp >= 0 ? `+${n}` : n;
  }

  return (
    <div
      style={{
        width: 16,
        height,
        background: "var(--pt-ink)",
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
      }}
      aria-label={`Evaluation ${label}`}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${whitePct}%`,
          background: "var(--pt-cream)",
          transition: "height 120ms ease-out",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 6,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 9,
          fontFamily: "var(--font-mono)",
          color: whitePct > 50 ? "var(--pt-ink)" : "var(--pt-cream)",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
        }}
      >
        {label}
      </span>
    </div>
  );
}
