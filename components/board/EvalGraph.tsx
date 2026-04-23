import type { Move } from "@/lib/supabase/helpers";

export function EvalGraph({
  moves,
  selectedPly,
  onSeek,
}: {
  moves: Move[];
  selectedPly: number;
  onSeek: (ply: number) => void;
}) {
  if (moves.length === 0) return null;
  const maxAbs = 600;
  const width = 500;
  const height = 80;

  const points = moves
    .filter((m) => m.eval_cp !== null)
    .map((m) => {
      const x = ((m.ply - 1) / Math.max(1, moves.length - 1)) * width;
      const clamped = Math.max(-maxAbs, Math.min(maxAbs, m.eval_cp!));
      const y = height / 2 - (clamped / maxAbs) * (height / 2);
      return { ply: m.ply, x, y };
    });

  const path = points.length
    ? `M ${points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")}`
    : "";

  const selX = ((selectedPly - 1) / Math.max(1, moves.length - 1)) * width;
  const blunders = moves.filter((m) => m.classification === "blunder");

  return (
    <div
      style={{
        marginTop: 20,
        padding: 10,
        border: "0.5px solid var(--pt-border)",
        borderRadius: 8,
        background: "var(--pt-bg-elev)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
          fontFamily: "var(--font-mono)",
          marginBottom: 8,
        }}
      >
        Evaluation · {moves.length} plies
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        width="100%"
        height={height}
        style={{ cursor: "crosshair" }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const xFrac = (e.clientX - rect.left) / rect.width;
          const ply = Math.max(
            1,
            Math.min(moves.length, Math.round(xFrac * moves.length)),
          );
          onSeek(ply);
        }}
      >
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeDasharray="2 3"
        />
        {path && (
          <path
            d={path}
            stroke="var(--pt-forest)"
            strokeWidth="1.5"
            fill="none"
          />
        )}
        {selectedPly > 0 && (
          <line
            x1={selX}
            y1={0}
            x2={selX}
            y2={height}
            stroke="var(--pt-amber)"
            strokeWidth="0.6"
            strokeDasharray="2 2"
          />
        )}
        {blunders.map((m) => {
          const x = ((m.ply - 1) / Math.max(1, moves.length - 1)) * width;
          const clamped = Math.max(-maxAbs, Math.min(maxAbs, m.eval_cp ?? 0));
          const y = height / 2 - (clamped / maxAbs) * (height / 2);
          return (
            <circle
              key={m.id}
              cx={x}
              cy={y}
              r={3}
              fill="var(--pt-amber)"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(m.ply);
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
