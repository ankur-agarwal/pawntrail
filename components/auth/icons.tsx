export function GoogleG({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#4285F4"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#34A853"
        d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 7.1 29.4 5 24 5 16.3 5 9.6 9.4 6.3 14.7z"
      />
      <path
        fill="#FBBC05"
        d="M24 44c5.3 0 10.1-2 13.8-5.3l-6.4-5.4C29.4 34.5 26.8 35.5 24 35.5c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.5 39.2 16.1 44 24 44z"
      />
      <path
        fill="#EA4335"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4 5.8l6.4 5.4c-.5.5 6.7-4.9 6.7-15.2 0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

export function Dots({
  color = "currentColor",
  size = 4,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <span
      style={{ display: "inline-flex", gap: size * 1.5, alignItems: "center" }}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="pt-anim-dotpulse"
          style={{
            width: size,
            height: size,
            borderRadius: 9999,
            background: color,
            animation: `pt-dotpulse 1.1s ${i * 0.15}s infinite ease-in-out`,
          }}
        />
      ))}
    </span>
  );
}

export function Spinner({ size = 44, stroke = 2.4 }: { size?: number; stroke?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className="pt-anim-spin"
      style={{ animation: "pt-spin 1s linear infinite" }}
      aria-hidden
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="var(--pt-border-strong)"
        strokeWidth={stroke}
      />
      <path
        d="M 25 5 a 20 20 0 0 1 20 20"
        fill="none"
        stroke="var(--pt-amber)"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SuccessMark({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden>
      <circle cx="28" cy="28" r="26" fill="var(--pt-forest)" />
      <path
        d="M 17 29 L 25 36 L 39 21"
        fill="none"
        stroke="var(--pt-cream)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ExpiredMark({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden>
      <circle
        cx="28"
        cy="28"
        r="26"
        fill="none"
        stroke="var(--pt-amber-deep)"
        strokeWidth="1.5"
        strokeDasharray="2 4"
      />
      <path
        d="M 28 16 L 28 30"
        stroke="var(--pt-amber-deep)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="28" cy="38" r="1.6" fill="var(--pt-amber-deep)" />
    </svg>
  );
}

export function InboxGlyph({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden>
      <rect
        x="10"
        y="14"
        width="36"
        height="28"
        rx="2"
        fill="none"
        stroke="var(--pt-text)"
        strokeWidth="1.4"
      />
      <path
        d="M 10 16 L 28 30 L 46 16"
        fill="none"
        stroke="var(--pt-text)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="48" r="1.5" fill="var(--pt-text-dim)" />
      <circle cx="22" cy="48" r="1.5" fill="var(--pt-text-dim)" />
      <circle cx="30" cy="48" r="1.5" fill="var(--pt-text-dim)" />
      <circle cx="38" cy="48" r="1.5" fill="var(--pt-text-dim)" />
      <circle cx="46" cy="48" r="3" fill="var(--pt-amber)" />
    </svg>
  );
}

export function AuthTrailMark({ size = 56 }: { size?: number }) {
  const ink = "var(--pt-text)";
  const bg = "var(--pt-bg)";
  const amber = "var(--pt-amber)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-label="PawnTrail"
      style={{ display: "block" }}
    >
      <g fill={ink}>
        <circle cx="14" cy="86" r="6" />
        <circle cx="14" cy="74" r="1.5" />
        <circle cx="14" cy="68" r="1.5" />
        <circle cx="14" cy="62" r="1.5" />
        <circle cx="14" cy="56" r="1.5" />
        <circle cx="18" cy="50" r="1.5" />
        <circle cx="24" cy="50" r="1.5" />
        <circle cx="30" cy="50" r="1.5" />
        <circle cx="36" cy="50" r="1.5" />
        <circle cx="42" cy="50" r="1.5" />
        <circle cx="50" cy="50" r="5" />
        <circle cx="50" cy="44" r="1.5" />
        <circle cx="50" cy="38" r="1.5" />
        <circle cx="50" cy="32" r="1.5" />
        <circle cx="50" cy="26" r="1.5" />
        <circle cx="50" cy="20" r="1.5" />
        <circle cx="56" cy="14" r="1.5" />
        <circle cx="62" cy="14" r="1.5" />
        <circle cx="68" cy="14" r="1.5" />
        <circle cx="74" cy="14" r="1.5" />
      </g>
      <circle cx="50" cy="50" r="2.2" fill={bg} />
      <circle cx="84" cy="14" r="6.5" fill={amber} />
      <circle cx="84" cy="14" r="2.6" fill={bg} />
    </svg>
  );
}

export function ContourBg({ opacity = 0.05 }: { opacity?: number } = {}) {
  const ys = [20, 40, 60, 80, 100, 120, 140, 160];
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 200"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        color: "var(--pt-forest)",
        pointerEvents: "none",
      }}
      aria-hidden
    >
      {ys.map((y, i) => (
        <path
          key={y}
          d={`M 0 ${y} Q 80 ${y - 10 - i * 1.5} 160 ${y} T 320 ${y} T 480 ${y}`}
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />
      ))}
    </svg>
  );
}
