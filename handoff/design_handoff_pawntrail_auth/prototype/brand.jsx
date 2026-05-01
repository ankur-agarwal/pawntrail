/* PawnTrail — shared SVG components: trail mark, contour textures, chess pieces */

// ============================================================
// TRAIL MARK — the master logo. Multi-leg dotted trail with anchor nodes.
// ============================================================
const TrailMark = ({ size = 64, monochrome = false, color, className = '' }) => {
  const ink = color || 'var(--pt-text)';
  const cream = 'var(--pt-bg)';
  const amber = monochrome ? ink : 'var(--pt-amber)';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="PawnTrail mark">
      {/* leg 1: bottom-left anchor → up */}
      <g fill={ink}>
        <circle cx="14" cy="86" r="6" />
        <circle cx="14" cy="74" r="1.5" />
        <circle cx="14" cy="68" r="1.5" />
        <circle cx="14" cy="62" r="1.5" />
        <circle cx="14" cy="56" r="1.5" />
        {/* corner */}
        <circle cx="18" cy="50" r="1.5" />
        <circle cx="24" cy="50" r="1.5" />
        <circle cx="30" cy="50" r="1.5" />
        <circle cx="36" cy="50" r="1.5" />
        <circle cx="42" cy="50" r="1.5" />
        {/* mid anchor (ring) */}
        <circle cx="50" cy="50" r="5" fill={ink} />
        <circle cx="50" cy="50" r="2.2" fill={cream} />
        {/* leg 2 up */}
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
      {/* terminus: amber ring */}
      <circle cx="84" cy="14" r="6.5" fill={amber} />
      <circle cx="84" cy="14" r="2.6" fill={cream} />
    </svg>
  );
};

// Compact L-bend mark — for app icon contexts
const TrailGlyph = ({ size = 48, bg = 'var(--pt-forest)', stroke = 'var(--pt-cream)', accent = 'var(--pt-amber)', radius = 0.18, className = '' }) => {
  const r = size * radius;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect x="0" y="0" width="100" height="100" rx={r/size*100} fill={bg} />
      {/* horizontal segment */}
      <path d="M 28 38 L 78 38" stroke={stroke} strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* vertical segment */}
      <path d="M 28 38 L 28 70" stroke={stroke} strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* origin dot */}
      <circle cx="28" cy="74" r="6" fill={stroke} />
      {/* terminus amber */}
      <circle cx="78" cy="38" r="9" fill={accent} />
      <circle cx="78" cy="38" r="3.6" fill={stroke} />
    </svg>
  );
};

// Word lockup
const TrailLockup = ({ size = 32, color = 'var(--pt-text)' }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.35 }}>
    <TrailMark size={size} />
    <span style={{
      fontFamily: 'var(--pt-sans)', fontWeight: 500, fontSize: size * 0.78,
      letterSpacing: '-0.01em', color, lineHeight: 1
    }}>
      pawntrail<span style={{ color: 'var(--pt-amber)' }}>.</span>
    </span>
  </div>
);

// ============================================================
// CHESS PIECES — simple silhouette set in two colors
// White uses cream fill + ink stroke; Black uses ink fill + ink stroke
// ============================================================
const piecePaths = {
  K: 'M50 12 L50 18 M44 15 L56 15 M50 18 C42 18 36 23 36 32 C36 38 40 42 50 44 C60 42 64 38 64 32 C64 23 58 18 50 18 Z M36 46 L64 46 L62 60 L38 60 Z M32 64 L68 64 L66 78 L34 78 Z',
  Q: 'M30 18 L34 36 L42 22 L46 38 L50 18 L54 38 L58 22 L66 36 L70 18 M30 18 a3 3 0 1 1 0.001 0 M70 18 a3 3 0 1 1 0.001 0 M42 22 a2 2 0 1 1 0.001 0 M58 22 a2 2 0 1 1 0.001 0 M50 18 a2.5 2.5 0 1 1 0.001 0 M30 40 L70 40 L66 58 L34 58 Z M28 62 L72 62 L70 78 L30 78 Z',
  R: 'M28 16 L28 28 L36 28 L36 22 L44 22 L44 28 L56 28 L56 22 L64 22 L64 28 L72 28 L72 16 Z M32 30 L68 30 L66 56 L34 56 Z M28 60 L72 60 L72 78 L28 78 Z',
  B: 'M50 12 a3 3 0 1 1 0.001 0 M50 16 C42 18 32 28 32 44 C32 56 40 62 50 62 C60 62 68 56 68 44 C68 28 58 18 50 16 Z M40 44 L60 44 M46 30 L54 30 M34 64 L66 64 L64 76 L36 76 Z',
  N: 'M30 78 L30 70 C30 60 36 56 40 50 C36 50 32 46 32 38 C36 38 36 32 40 28 C42 20 50 14 60 14 C70 14 72 24 72 36 C72 52 68 60 60 64 L60 70 L70 70 L70 78 Z M52 26 a2 2 0 1 1 0.001 0',
  P: 'M50 14 a7 7 0 1 1 0.001 0 M44 28 L56 28 L60 50 L40 50 Z M36 54 L64 54 L66 66 L34 66 Z M30 70 L70 70 L70 78 L30 78 Z',
};

const ChessPiece = ({ piece, color = 'white', size = 56 }) => {
  const type = piece.toUpperCase();
  const isWhite = color === 'white';
  const fill = isWhite ? 'var(--pt-cream)' : 'var(--pt-ink)';
  const stroke = isWhite ? 'var(--pt-ink)' : 'var(--pt-ink)';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <path d={piecePaths[type]} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// ============================================================
// CONTOUR TEXTURE — subtle topo lines for backgrounds
// ============================================================
const ContourBg = ({ opacity = 0.08, color = 'currentColor' }) => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none"
    style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}>
    {[20, 40, 60, 80, 100, 120, 140, 160].map((y, i) => (
      <path key={i} d={`M 0 ${y} Q 80 ${y - 10 - i*1.5} 160 ${y} T 320 ${y} T 480 ${y}`}
        stroke={color} strokeWidth="0.5" fill="none" />
    ))}
  </svg>
);

// Dashed trail line (for decoration)
const TrailLine = ({ width = 200, height = 40, color = 'currentColor' }) => (
  <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <path d={`M 6 ${height-6} L 6 ${height/2} L ${width/2} ${height/2} L ${width/2} 6 L ${width-6} 6`}
      stroke={color} strokeWidth="1.2" strokeDasharray="1.5 5" strokeLinecap="round" fill="none" />
    <circle cx="6" cy={height-6} r="3.5" fill={color} />
    <circle cx={width-6} cy="6" r="4.5" fill="var(--pt-amber)" />
    <circle cx={width-6} cy="6" r="1.8" fill="var(--pt-bg)" />
  </svg>
);

Object.assign(window, { TrailMark, TrailGlyph, TrailLockup, ChessPiece, ContourBg, TrailLine });
