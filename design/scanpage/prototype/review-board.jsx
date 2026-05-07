/* PawnTrail — chessboard + correction popover for the PGN review screen */

// ─── Tiny piece glyph (FEN char) ─────────────────────────────
// Use unicode chess characters; render as a styled span. The brand has
// detailed silhouette pieces but at small sizes (28-44px squares) unicode
// reads cleaner and is much faster to paint across 64 squares.
const PieceGlyph = ({ p, size = 36 }) => {
  if (!p) return null;
  const isWhite = p === p.toUpperCase();
  const map = { K: '\u2654', Q: '\u2655', R: '\u2656', B: '\u2657', N: '\u2658', P: '\u2659' };
  const ch = map[p.toUpperCase()];
  return (
    <span style={{
      fontFamily: '"Segoe UI Symbol", "DejaVu Sans", "Apple Symbols", sans-serif',
      fontSize: size, lineHeight: 1,
      color: isWhite ? 'var(--pt-cream)' : 'var(--pt-ink)',
      textShadow: isWhite
        ? '0 0 0.5px var(--pt-ink), 0 1px 0 rgba(20,32,26,0.25)'
        : '0 1px 0 rgba(244,237,220,0.15)',
      WebkitTextStroke: isWhite ? '0.6px var(--pt-ink)' : '0.4px var(--pt-ink)',
      userSelect: 'none', pointerEvents: 'none',
    }}>{ch}</span>
  );
};

// ─── Board ───────────────────────────────────────────────────
// Lightweight static board: takes an 8x8 array of FEN chars (or null).
// Highlights last-move from/to, a "candidate" square, and arrow legal-move dots.
const Board = ({
  position,                  // 8x8 array, row 0 is rank 8
  size = 480,
  flipped = false,
  lastMove,                  // { from: 'e2', to: 'e4' }
  selected,                  // 'e4' selected/source square
  candidates = [],           // ['f3','g3'] legal targets to dot
  warning,                   // 'g3' square to flash amber (low-confidence)
  showCoords = true,
  arrows = [],               // [{from, to, tone:'amber'|'forest'|'good'}]
  hover,                     // square id under hover
  onSquare,                  // (sq) => void
}) => {
  const sq = size / 8;
  const files = flipped ? ['h','g','f','e','d','c','b','a'] : ['a','b','c','d','e','f','g','h'];
  const ranks = flipped ? ['1','2','3','4','5','6','7','8'] : ['8','7','6','5','4','3','2','1'];
  const idAt = (r, c) => files[c] + ranks[r];

  // arrow path helpers
  const center = (sqId) => {
    const f = files.indexOf(sqId[0]);
    const r = ranks.indexOf(sqId[1]);
    return { x: f * sq + sq / 2, y: r * sq + sq / 2 };
  };

  return (
    <div style={{
      position: 'relative',
      width: size, height: size,
      border: '0.5px solid var(--pt-border-strong)',
      borderRadius: 'var(--pt-r-card)',
      boxShadow: 'var(--pt-shadow-card)',
      overflow: 'hidden',
      flexShrink: 0,
      background: 'var(--pt-square-light)',
    }}>
      {/* squares */}
      {Array.from({ length: 64 }).map((_, i) => {
        const r = Math.floor(i / 8), c = i % 8;
        const id = idAt(r, c);
        const isDark = (r + c) % 2 === 1;
        const isSel = selected === id;
        const isFrom = lastMove?.from === id;
        const isTo = lastMove?.to === id;
        const isCand = candidates.includes(id);
        const isWarn = warning === id;
        const isHover = hover === id;
        return (
          <div key={id} onClick={() => onSquare?.(id)}
            data-sq={id}
            style={{
              position: 'absolute', left: c * sq, top: r * sq, width: sq, height: sq,
              background: isDark ? 'var(--pt-square-dark)' : 'var(--pt-square-light)',
              cursor: onSquare ? 'pointer' : 'default',
            }}>
            {/* layered overlays */}
            {(isFrom || isTo) && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(199,127,58,0.28)',
                boxShadow: 'inset 0 0 0 1.5px rgba(199,127,58,0.7)',
              }} />
            )}
            {isSel && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(46,125,92,0.32)',
                boxShadow: 'inset 0 0 0 2px var(--pt-good)',
              }} />
            )}
            {isWarn && (
              <div style={{
                position: 'absolute', inset: 0,
                boxShadow: 'inset 0 0 0 2px var(--pt-amber)',
                background: 'repeating-linear-gradient(45deg, rgba(199,127,58,0.18) 0 6px, transparent 6px 12px)',
                animation: 'pt-board-warn 1.6s ease-in-out infinite',
              }} />
            )}
            {isHover && !isSel && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,32,26,0.06)' }} />
            )}
            {isCand && (
              <div style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%,-50%)',
                width: sq * 0.32, height: sq * 0.32,
                borderRadius: '50%',
                background: position[r][c] ? 'transparent' : 'rgba(20,32,26,0.22)',
                boxShadow: position[r][c] ? 'inset 0 0 0 3px rgba(20,32,26,0.22)' : 'none',
              }} />
            )}
            {/* coords */}
            {showCoords && c === 0 && (
              <span style={{
                position: 'absolute', top: 2, left: 3,
                fontFamily: 'var(--pt-mono)', fontSize: Math.max(8, sq * 0.16), fontWeight: 600,
                color: isDark ? 'rgba(244,237,220,0.55)' : 'rgba(20,32,26,0.45)',
                letterSpacing: '0.06em',
              }}>{ranks[r]}</span>
            )}
            {showCoords && r === 7 && (
              <span style={{
                position: 'absolute', bottom: 2, right: 4,
                fontFamily: 'var(--pt-mono)', fontSize: Math.max(8, sq * 0.16), fontWeight: 600,
                color: isDark ? 'rgba(244,237,220,0.55)' : 'rgba(20,32,26,0.45)',
                letterSpacing: '0.06em',
              }}>{files[c]}</span>
            )}
            {/* piece */}
            {position[r][c] && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <PieceGlyph p={position[r][c]} size={sq * 0.78} />
              </div>
            )}
          </div>
        );
      })}

      {/* arrows overlay */}
      {arrows.length > 0 && (
        <svg width={size} height={size} style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
        }}>
          <defs>
            <marker id="arr-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10 Z" fill="var(--pt-amber)" />
            </marker>
            <marker id="arr-forest" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10 Z" fill="var(--pt-forest)" />
            </marker>
            <marker id="arr-good" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10 Z" fill="var(--pt-good)" />
            </marker>
          </defs>
          {arrows.map((a, i) => {
            const f = center(a.from), t = center(a.to);
            const tone = a.tone || 'amber';
            const stroke = tone === 'forest' ? 'var(--pt-forest)' : tone === 'good' ? 'var(--pt-good)' : 'var(--pt-amber)';
            // shorten arrow so it doesn't overlap piece
            const dx = t.x - f.x, dy = t.y - f.y;
            const L = Math.hypot(dx, dy);
            const shorten = sq * 0.32;
            const tx = t.x - (dx / L) * shorten;
            const ty = t.y - (dy / L) * shorten;
            return (
              <line key={i} x1={f.x} y1={f.y} x2={tx} y2={ty}
                stroke={stroke} strokeWidth={Math.max(4, sq * 0.11)} strokeLinecap="round"
                opacity="0.85"
                markerEnd={`url(#arr-${tone})`} />
            );
          })}
        </svg>
      )}
    </div>
  );
};

// ─── FEN-ish helpers (simplified — we hand-author positions) ─────
// We don't ship a chess engine. Each "ply" in the timeline carries a
// pre-built 8x8 board state. This keeps the demo deterministic and small.

const empty8 = () => Array.from({ length: 8 }, () => Array(8).fill(null));
const startPosition = () => {
  const b = empty8();
  b[0] = ['r','n','b','q','k','b','n','r'];
  b[1] = Array(8).fill('p');
  b[6] = Array(8).fill('P');
  b[7] = ['R','N','B','Q','K','B','N','R'];
  return b;
};
const cloneBoard = (b) => b.map(r => r.slice());
const sqToRC = (sq, flipped = false) => {
  const files = ['a','b','c','d','e','f','g','h'];
  const f = files.indexOf(sq[0]);
  const r = 8 - parseInt(sq[1], 10);
  return flipped ? [7 - r, 7 - f] : [r, f];
};
const applyMove = (board, from, to, promotion) => {
  const b = cloneBoard(board);
  const [fr, fc] = sqToRC(from);
  const [tr, tc] = sqToRC(to);
  const piece = b[fr][fc];
  b[fr][fc] = null;
  b[tr][tc] = promotion || piece;
  // simple castling
  if (piece && piece.toUpperCase() === 'K' && Math.abs(tc - fc) === 2) {
    if (tc === 6) { b[tr][5] = b[tr][7]; b[tr][7] = null; }
    if (tc === 2) { b[tr][3] = b[tr][0]; b[tr][0] = null; }
  }
  return b;
};

Object.assign(window, {
  Board, PieceGlyph,
  empty8, startPosition, cloneBoard, sqToRC, applyMove,
});
