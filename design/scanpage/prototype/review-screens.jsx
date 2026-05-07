/* PawnTrail — PGN Review screen.
   Board + move list + scoresheet thumbnail + correction popover. */

const { useState: useStateRev, useMemo: useMemoRev, useEffect: useEffectRev, useRef: useRefRev } = React;

// keyframes for the warning pulse + popover entry
if (!document.getElementById('pt-review-anim')) {
  const s = document.createElement('style');
  s.id = 'pt-review-anim';
  s.textContent = `
    @keyframes pt-board-warn { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
    @keyframes pt-pop-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pt-confidence-blink { 0%,100% { opacity: 0.45; } 50% { opacity: 1; } }
  `;
  document.head.appendChild(s);
}

// ─── Move chip in the move list ─────────────────────────────
const MoveChip = ({ ply, idx, active, onClick, onCorrect, dense, showClassify = true }) => {
  const flagged = ply.status === 'flagged';
  const corrected = ply.status === 'corrected';
  const conf = ply.conf ?? 1;
  const lowConf = conf < 0.7;
  const cls = ENGINE_ANALYSIS?.[idx]?.classify;

  return (
    <button onClick={onClick} onContextMenu={(e) => { e.preventDefault(); onCorrect?.(); }}
      style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', gap: 4,
        height: dense ? 22 : 26, padding: dense ? '0 6px' : '0 8px',
        background: active ? 'var(--pt-forest)' : (flagged ? 'rgba(199,127,58,0.12)' : 'transparent'),
        color: active ? 'var(--pt-cream)' : (flagged ? 'var(--pt-amber-deep)' : 'var(--pt-text)'),
        border: active
          ? '0.5px solid var(--pt-forest-deep)'
          : flagged
            ? '0.5px dashed rgba(199,127,58,0.6)'
            : '0.5px solid transparent',
        borderRadius: 'var(--pt-r-chip)',
        fontFamily: 'var(--pt-mono)', fontSize: dense ? 12 : 13, fontWeight: 500,
        letterSpacing: '0.01em',
        cursor: 'pointer',
        textDecoration: lowConf && !corrected ? 'underline' : 'none',
        textDecorationStyle: 'dotted',
        textDecorationColor: 'var(--pt-amber)',
        textUnderlineOffset: 3,
      }}>
      {ply.san}
      {showClassify && cls && cls !== 'good' && cls !== 'book' && !active && (
        <ClassDot kind={cls} size={6} />
      )}
      {flagged && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--pt-amber)',
          animation: 'pt-confidence-blink 1.4s ease-in-out infinite',
        }} />
      )}
      {corrected && (
        <span style={{
          fontFamily: 'var(--pt-sans)', fontSize: 9, fontWeight: 600,
          color: 'var(--pt-good)', letterSpacing: '0.05em',
        }}>✓</span>
      )}
    </button>
  );
};

// ─── Move list (paired columns: # | white | black) ──────────
const MoveList = ({ plies, currentPly, onJump, onCorrect, dense, openPopoverFor }) => {
  // group into rows of [whitePly, blackPly]
  const rows = [];
  for (let i = 0; i < plies.length; i += 2) {
    rows.push({ num: i / 2 + 1, w: plies[i], b: plies[i + 1], wIdx: i, bIdx: i + 1 });
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {rows.map((row) => (
        <div key={row.num} style={{
          display: 'grid',
          gridTemplateColumns: '32px 1fr 1fr',
          alignItems: 'center',
          gap: 6,
          padding: '3px 8px',
          borderBottom: '0.5px dashed var(--pt-border)',
          minHeight: dense ? 28 : 32,
          background: (currentPly === row.wIdx || currentPly === row.bIdx)
            ? 'var(--pt-bg-elev)' : 'transparent',
        }}>
          <span style={{
            fontFamily: 'var(--pt-mono)', fontSize: 11, fontWeight: 500,
            color: 'var(--pt-text-dim)', letterSpacing: '0.04em',
          }}>{row.num}.</span>
          {row.w
            ? <MoveChip ply={row.w} idx={row.wIdx} dense={dense}
                active={currentPly === row.wIdx}
                onClick={() => onJump(row.wIdx)}
                onCorrect={() => onCorrect(row.wIdx)} />
            : <span />}
          {row.b
            ? <MoveChip ply={row.b} idx={row.bIdx} dense={dense}
                active={currentPly === row.bIdx}
                onClick={() => onJump(row.bIdx)}
                onCorrect={() => onCorrect(row.bIdx)} />
            : <span style={{
                fontFamily: 'var(--pt-mono)', fontSize: 12, color: 'var(--pt-text-dim)',
              }}>…</span>}
        </div>
      ))}
    </div>
  );
};

// ─── Correction popover ──────────────────────────────────────
const CorrectionPopover = ({ ply, onPick, onDismiss, onEdit, anchor = 'right' }) => {
  if (!ply || !ply.suggestions) return null;
  return (
    <div style={{
      position: 'absolute',
      [anchor]: 'calc(100% + 12px)',
      top: 0,
      width: 280,
      background: 'var(--pt-surface)',
      border: '0.5px solid var(--pt-border-strong)',
      borderRadius: 'var(--pt-r-card)',
      boxShadow: 'var(--pt-shadow-pop)',
      animation: 'pt-pop-in 140ms ease-out',
      zIndex: 20,
      overflow: 'hidden',
    }}>
      {/* header */}
      <div style={{
        padding: '10px 12px',
        borderBottom: '0.5px dashed var(--pt-border)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%', background: 'var(--pt-amber)',
          animation: 'pt-confidence-blink 1.4s ease-in-out infinite',
        }} />
        <span className="pt-micro" style={{ color: 'var(--pt-amber-deep)', flex: 1 }}>
          Low confidence · {Math.round((ply.conf ?? 0) * 100)}%
        </span>
        <button onClick={onDismiss} style={{
          background: 'transparent', border: 0, color: 'var(--pt-text-muted)',
          fontSize: 14, cursor: 'pointer', padding: 0, lineHeight: 1,
        }}>×</button>
      </div>

      {/* reason */}
      {ply.reason && (
        <div style={{
          padding: '10px 12px',
          fontFamily: 'var(--pt-serif)', fontStyle: 'italic',
          fontSize: 14, lineHeight: '20px',
          color: 'var(--pt-text-muted)',
          borderBottom: '0.5px dashed var(--pt-border)',
        }}>
          {ply.reason}
        </div>
      )}

      {/* suggestion list */}
      <div style={{ padding: 6 }}>
        <div className="pt-micro" style={{ padding: '6px 8px 4px', color: 'var(--pt-text-dim)' }}>
          Replace with
        </div>
        {ply.suggestions.map((s, i) => (
          <button key={i} onClick={() => onPick(s)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 8px',
            background: s.preferred ? 'rgba(46,125,92,0.08)' : 'transparent',
            border: 0, borderRadius: 4,
            cursor: 'pointer', textAlign: 'left',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = s.preferred ? 'rgba(46,125,92,0.14)' : 'var(--pt-bg-elev)'}
            onMouseLeave={(e) => e.currentTarget.style.background = s.preferred ? 'rgba(46,125,92,0.08)' : 'transparent'}>
            <span style={{
              fontFamily: 'var(--pt-mono)', fontSize: 13, fontWeight: 600,
              color: 'var(--pt-text)', minWidth: 56,
            }}>{s.san}</span>
            <span style={{
              flex: 1, fontFamily: 'var(--pt-sans)', fontSize: 12,
              color: 'var(--pt-text-muted)', lineHeight: '16px',
            }}>{s.why}</span>
            {s.preferred && (
              <span style={{
                fontFamily: 'var(--pt-mono)', fontSize: 9, fontWeight: 600,
                letterSpacing: '0.1em', color: 'var(--pt-good)',
              }}>BEST</span>
            )}
          </button>
        ))}
      </div>

      {/* footer — manual edit */}
      <div style={{
        borderTop: '0.5px dashed var(--pt-border)',
        padding: 8, display: 'flex', gap: 6,
      }}>
        <Button variant="ghost" size="sm" onClick={onEdit} style={{ flex: 1 }}>
          Type SAN…
        </Button>
        <Button variant="quiet" size="sm" onClick={onDismiss}>Skip</Button>
      </div>
    </div>
  );
};

// ─── Scoresheet thumbnail (illustrative — placeholder) ───────
const ScoresheetThumb = ({ activeRow }) => {
  const rows = [
    ['1', 'e4',   'e5'],
    ['2', 'Nf3',  'Nc6'],
    ['3', 'Bc4',  'Bc5'],
    ['4', 'b4',   'B×b4'],
    ['5', 'c3',   'Ba5'],
    ['6', 'd4',   'e×d4'],
    ['7', 'N♢3',  ''],
  ];
  return (
    <div style={{
      width: '100%',
      background: '#fbf7e8',
      border: '0.5px solid var(--pt-border-strong)',
      borderRadius: 'var(--pt-r-card)',
      padding: 12,
      backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 22px, rgba(20,32,26,0.06) 22px 22.5px)',
      fontFamily: '"Caveat", "Bradley Hand", "Marker Felt", cursive',
      color: '#2a2418',
      position: 'relative',
    }}>
      <div className="pt-micro" style={{
        marginBottom: 6, color: 'rgba(42,36,24,0.55)', fontFamily: 'var(--pt-mono)',
      }}>SCORESHEET · ORIGINAL</div>
      {rows.map((r, i) => {
        const isActive = i === activeRow;
        return (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '24px 1fr 1fr',
            gap: 8, height: 22, alignItems: 'baseline',
            background: isActive ? 'rgba(199,127,58,0.18)' : 'transparent',
            outline: isActive ? '1.5px solid rgba(199,127,58,0.6)' : 'none',
            outlineOffset: 1,
            borderRadius: 2,
            padding: '0 2px',
          }}>
            <span style={{ fontSize: 14, opacity: 0.7 }}>{r[0]}.</span>
            <span style={{ fontSize: 17 }}>{r[1]}</span>
            <span style={{
              fontSize: 17,
              textDecoration: i === 6 && r[2] === '' ? 'none' : 'none',
            }}>{r[2]}</span>
          </div>
        );
      })}
      {/* annotation marker on uncertain row */}
      {activeRow === 6 && (
        <div style={{
          position: 'absolute', right: 12, top: 12 + 6 * 22 + 22 - 11,
          width: 0, height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '12px solid var(--pt-amber)',
          transform: 'rotate(90deg)',
        }} />
      )}
    </div>
  );
};

// ─── Header strip with game metadata + stage ─────────────────
const GameHeader = ({ headers, dirty, onSave, onDiscard, compact }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 16,
    padding: compact ? '10px 16px' : '14px 24px',
    borderBottom: '0.5px solid var(--pt-border)',
    background: 'var(--pt-surface)',
  }}>
    <TrailLockup size={compact ? 22 : 26} />
    <span style={{ width: 1, height: 18, background: 'var(--pt-border)' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
      <span style={{
        fontFamily: 'var(--pt-sans)', fontSize: compact ? 13 : 14, fontWeight: 500,
        color: 'var(--pt-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {headers.White} <span style={{ color: 'var(--pt-text-dim)' }}>vs</span> {headers.Black}
      </span>
      <span className="pt-micro" style={{ color: 'var(--pt-text-muted)' }}>
        {headers.Opening} · {headers.ECO} · {headers.Date}
      </span>
    </div>
    {!compact && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Badge mono tone={dirty ? 'amber' : 'default'}>
          {dirty ? 'UNSAVED' : 'CLEAN'}
        </Badge>
        <Button variant="ghost" size="sm" onClick={onDiscard}>Discard</Button>
        <Button variant="primary" size="sm" onClick={onSave}>Save game</Button>
      </div>
    )}
  </div>
);

// ─── Bottom toolbar — playback + flagged-count ──────────────
const PlaybackBar = ({ ply, total, onJump, flaggedCount, onJumpToFlag, compact }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: compact ? 6 : 12,
    padding: compact ? '8px 12px' : '10px 16px',
    borderTop: '0.5px solid var(--pt-border)',
    background: 'var(--pt-bg-elev)',
  }}>
    <NavBtn onClick={() => onJump(-1)} title="Start">«</NavBtn>
    <NavBtn onClick={() => onJump(Math.max(-1, ply - 1))} title="Prev">‹</NavBtn>
    <span style={{
      fontFamily: 'var(--pt-mono)', fontSize: 12, color: 'var(--pt-text-muted)',
      minWidth: 56, textAlign: 'center',
    }}>
      {ply + 1} / {total}
    </span>
    <NavBtn onClick={() => onJump(Math.min(total - 1, ply + 1))} title="Next">›</NavBtn>
    <NavBtn onClick={() => onJump(total - 1)} title="End">»</NavBtn>
    <span style={{ flex: 1 }} />
    {flaggedCount > 0 && (
      <Chip tone="amber" onClick={onJumpToFlag} icon={
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: 'var(--pt-amber)',
          animation: 'pt-confidence-blink 1.4s ease-in-out infinite',
        }} />
      }>
        {flaggedCount} to review
      </Chip>
    )}
  </div>
);

const NavBtn = ({ children, onClick, title }) => (
  <button onClick={onClick} title={title} style={{
    width: 28, height: 28, padding: 0,
    background: 'var(--pt-surface)',
    border: '0.5px solid var(--pt-border-strong)',
    borderRadius: 'var(--pt-r-card)',
    color: 'var(--pt-text)',
    fontFamily: 'var(--pt-mono)', fontSize: 14, fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    lineHeight: 1,
  }}>{children}</button>
);

// ─── Engine eval bar (vertical) ─────────────────────────────
// Score in centipawns, +ve = white. We map to 0..1 with a smooth curve so
// massive evals don't pin the bar; it stays responsive in the ±200cp range.
const evalToFraction = (cp) => {
  // sigmoid-ish: 0.5 + 0.5 * tanh(cp / 250)
  const t = Math.tanh(cp / 250);
  return Math.max(0.04, Math.min(0.96, 0.5 + 0.5 * t));
};
const formatEval = (cp) => {
  if (cp == null) return '0.0';
  if (Math.abs(cp) >= 10000) return (cp > 0 ? '#' : '-#') + Math.abs(10001 - Math.abs(cp));
  const v = (cp / 100);
  return (v > 0 ? '+' : '') + v.toFixed(v >= 10 ? 1 : 2);
};

const EvalBar = ({ cp, height = 460, width = 18 }) => {
  const frac = evalToFraction(cp);
  // white at bottom (rank 1)
  const whiteH = frac * height;
  const blackH = height - whiteH;
  const label = formatEval(cp);
  const sideTop = cp >= 0 ? 'black' : 'white';
  return (
    <div style={{
      width, height,
      borderRadius: 4,
      overflow: 'hidden',
      border: '0.5px solid var(--pt-border-strong)',
      background: 'var(--pt-ink)',
      position: 'relative',
      flexShrink: 0,
      boxShadow: 'inset 0 0 0 0.5px rgba(244,237,220,0.04)',
    }}>
      {/* black portion (top) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: blackH,
        background: 'var(--pt-ink)',
      }} />
      {/* white portion (bottom) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: whiteH,
        background: 'var(--pt-cream)',
        transition: 'height 240ms cubic-bezier(.4,0,.2,1)',
      }} />
      {/* center tick */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '50%',
        height: 0.5, background: 'rgba(244,237,220,0.18)',
      }} />
      {/* score label — on whichever side has more room */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        [sideTop === 'black' ? 'top' : 'bottom']: 4,
        textAlign: 'center',
        fontFamily: 'var(--pt-mono)', fontSize: 9, fontWeight: 600,
        color: sideTop === 'black' ? 'var(--pt-cream)' : 'var(--pt-ink)',
        letterSpacing: '0.04em',
      }}>{label}</div>
    </div>
  );
};

// ─── Classification dot — used inline + in line list ────────
const ClassDot = ({ kind = 'good', size = 8 }) => {
  const map = {
    good:       { c: 'var(--pt-good)',       label: 'Good move' },
    book:       { c: 'var(--pt-book)',       label: 'Book' },
    inaccuracy: { c: 'var(--pt-inaccuracy)', label: 'Inaccuracy' },
    mistake:    { c: 'var(--pt-mistake)',    label: 'Mistake' },
    blunder:    { c: 'var(--pt-blunder)',    label: 'Blunder' },
  };
  const m = map[kind] || map.good;
  return <span title={m.label} style={{
    display: 'inline-block', width: size, height: size,
    borderRadius: kind === 'book' ? 2 : '50%', background: m.c,
    flexShrink: 0,
  }} />;
};

// ─── Engine panel — shows top N lines, depth, classify ──────
const EnginePanel = ({ ply, plyIdx, dense }) => {
  const a = ENGINE_ANALYSIS[plyIdx];
  if (!a) return null;
  const lines = a.lines.slice(0, dense ? 2 : 3);
  const labelMap = {
    good: 'GOOD', book: 'BOOK',
    inaccuracy: 'INACCURACY', mistake: 'MISTAKE', blunder: 'BLUNDER',
  };
  // delta vs best line
  const best = lines[0]?.cp ?? a.scoreCp;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderTop: '0.5px solid var(--pt-border)',
      background: 'var(--pt-bg-elev)',
    }}>
      {/* header strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="11" height="11" viewBox="0 0 12 12" style={{ display: 'block' }}>
            <circle cx="6" cy="6" r="5" fill="none" stroke="var(--pt-text)" strokeWidth="0.8" />
            <circle cx="6" cy="6" r="1.6" fill="var(--pt-text)" />
            <line x1="6" y1="0.5" x2="6" y2="2.4" stroke="var(--pt-text)" strokeWidth="0.8" />
            <line x1="6" y1="9.6" x2="6" y2="11.5" stroke="var(--pt-text)" strokeWidth="0.8" />
            <line x1="0.5" y1="6" x2="2.4" y2="6" stroke="var(--pt-text)" strokeWidth="0.8" />
            <line x1="9.6" y1="6" x2="11.5" y2="6" stroke="var(--pt-text)" strokeWidth="0.8" />
          </svg>
          <span className="pt-micro" style={{ color: 'var(--pt-text-muted)' }}>
            ENGINE · DEPTH {a.depth}
          </span>
        </span>
        <span style={{ flex: 1 }} />
        <ClassDot kind={a.classify} />
        <span style={{
          fontFamily: 'var(--pt-mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.1em',
          color:
            a.classify === 'blunder'    ? 'var(--pt-blunder)' :
            a.classify === 'mistake'    ? 'var(--pt-mistake)' :
            a.classify === 'inaccuracy' ? 'var(--pt-inaccuracy)' :
            a.classify === 'book'       ? 'var(--pt-book)' :
                                          'var(--pt-good)',
        }}>{labelMap[a.classify]}</span>
        <span style={{
          fontFamily: 'var(--pt-mono)', fontSize: 14, fontWeight: 600,
          color: 'var(--pt-text)',
          minWidth: 52, textAlign: 'right',
        }}>{formatEval(a.scoreCp)}</span>
      </div>

      {/* lines */}
      <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '14px 50px 1fr',
            alignItems: 'baseline',
            gap: 8, padding: '5px 6px',
            borderRadius: 3,
            background: i === 0 ? 'var(--pt-surface)' : 'transparent',
            border: i === 0 ? '0.5px solid var(--pt-border)' : '0.5px solid transparent',
          }}>
            <span className="pt-mono" style={{
              fontFamily: 'var(--pt-mono)', fontSize: 9, fontWeight: 600,
              color: 'var(--pt-text-dim)', letterSpacing: '0.06em',
            }}>{i + 1}</span>
            <span style={{
              fontFamily: 'var(--pt-mono)', fontSize: 12, fontWeight: 600,
              color: line.cp >= 0 ? 'var(--pt-text)' : 'var(--pt-blunder)',
              whiteSpace: 'nowrap',
            }}>{formatEval(line.cp)}</span>
            <span style={{
              fontFamily: 'var(--pt-mono)', fontSize: 12,
              color: 'var(--pt-text-muted)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              lineHeight: '18px',
            }}>
              {line.pv.slice(0, dense ? 4 : 6).map((m, j) => (
                <span key={j}>
                  {j > 0 && <span style={{ color: 'var(--pt-text-dim)' }}> · </span>}
                  <span style={{ color: 'var(--pt-text)' }}>{m}</span>
                </span>
              ))}
              {line.pv.length > (dense ? 4 : 6) && <span style={{ color: 'var(--pt-text-dim)' }}> …</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Captured pieces tray ────────────────────────────────────
const CapturedTray = ({ board }) => {
  const counts = { P:8, N:2, B:2, R:2, Q:1, p:8, n:2, b:2, r:2, q:1 };
  for (const row of board) for (const p of row) if (p && counts[p] !== undefined) counts[p]--;
  const white = ['P','N','B','R','Q'].flatMap(p => Array(counts[p]).fill(p));
  const black = ['p','n','b','r','q'].flatMap(p => Array(counts[p]).fill(p));
  if (white.length === 0 && black.length === 0) return null;
  const Row = ({ pieces, side }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 18 }}>
      <span className="pt-micro" style={{ color: 'var(--pt-text-dim)', minWidth: 38 }}>
        {side === 'w' ? 'WHITE' : 'BLACK'}
      </span>
      {pieces.length === 0
        ? <span style={{ fontFamily: 'var(--pt-mono)', fontSize: 11, color: 'var(--pt-text-dim)' }}>—</span>
        : pieces.map((p, i) => <PieceGlyph key={i} p={p} size={16} />)}
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Row pieces={black} side="w" />
      <Row pieces={white} side="b" />
    </div>
  );
};

// ─── DESKTOP: full review screen ─────────────────────────────
const ReviewScreenDesktop = ({
  initialPly = 12,
  popoverOpen = true,
  showScoresheet = true,
  showEngine = true,
}) => {
  const { plies } = useMemoRev(() => buildGame(), []);
  const [ply, setPly] = useStateRev(initialPly);
  const [popPly, setPopPly] = useStateRev(popoverOpen ? plies.findIndex(p => p.status === 'flagged') : -1);
  const [edits, setEdits] = useStateRev({});       // ply idx -> new san
  const flagged = plies.filter(p => p.status === 'flagged' && !edits[plies.indexOf(p)]).length;

  const cur = plies[ply];
  const lastMove = cur ? { from: cur.from, to: cur.to } : null;
  const board = cur ? cur.board : startPosition();

  const arrows = [];
  let warning;
  if (popPly >= 0 && plies[popPly].status === 'flagged') {
    const target = plies[popPly];
    warning = target.to;
    // arrows for top suggestions
    target.suggestions.slice(0, 3).forEach((s, i) => {
      arrows.push({ from: s.from, to: s.to, tone: s.preferred ? 'good' : (i === 0 ? 'forest' : 'amber') });
    });
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--pt-bg)',
    }}>
      <GameHeader headers={HEADERS} dirty={Object.keys(edits).length > 0 || popPly >= 0} />

      {/* main grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 400px', minHeight: 0 }}>
        {/* LEFT — board column */}
        <div style={{
          padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
          alignItems: 'center', justifyContent: 'center',
          borderRight: '0.5px solid var(--pt-border)',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', maxWidth: 480 }}>
            <Avatar name="J Dufresne" size={26} tone="forest" />
            <span style={{ fontFamily: 'var(--pt-sans)', fontSize: 13, color: 'var(--pt-text)', flex: 1 }}>
              Dufresne
            </span>
            <span style={{ fontFamily: 'var(--pt-mono)', fontSize: 11, color: 'var(--pt-text-dim)' }}>
              {(() => {
                const black = ['p','n','b','r','q'];
                const counts = { p:8, n:2, b:2, r:2, q:1 };
                for (const row of board) for (const p of row) if (counts[p] !== undefined) counts[p]--;
                const taken = black.flatMap(p => Array(counts[p]).fill(p));
                return taken.length ? taken.map((p,i)=> <PieceGlyph key={i} p={p} size={14} />) : null;
              })()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
            {showEngine && <EvalBar cp={ENGINE_ANALYSIS[ply]?.scoreCp ?? 0} height={460} width={18} />}
            <Board
              position={board}
              size={460}
              lastMove={lastMove}
              warning={warning}
              arrows={arrows}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', maxWidth: 480 }}>
            <Avatar name="A Anderssen" size={26} tone="amber" />
            <span style={{ fontFamily: 'var(--pt-sans)', fontSize: 13, color: 'var(--pt-text)', flex: 1 }}>
              Anderssen
            </span>
          </div>
        </div>

        {/* RIGHT — moves + scoresheet */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
          {/* tabs */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px',
            borderBottom: '0.5px solid var(--pt-border)',
            background: 'var(--pt-surface)',
          }}>
            <SegControl size="sm" value="moves" options={[
              { label: 'Moves', value: 'moves' },
              { label: 'PGN', value: 'pgn' },
              { label: 'Headers', value: 'headers' },
            ]} onChange={() => {}} />
            <span style={{ flex: 1 }} />
            <CoordLabel>{plies.length} ply</CoordLabel>
          </div>

          {/* move list */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '6px 8px',
            position: 'relative',
          }}>
            <MoveList
              plies={plies}
              currentPly={ply}
              onJump={(i) => { setPly(i); if (plies[i].status !== 'flagged') setPopPly(-1); else setPopPly(i); }}
              onCorrect={(i) => { setPly(i); setPopPly(i); }}
            />
            {/* popover anchored to flagged move */}
            {popPly >= 0 && (
              <div style={{
                position: 'absolute',
                left: 8, right: 8, top: 0,
                pointerEvents: 'none',
              }}>
                <div style={{
                  position: 'absolute',
                  top: Math.floor(popPly / 2) * 32 + 4,
                  right: 8,
                  pointerEvents: 'auto',
                }}>
                  <CorrectionPopover
                    ply={plies[popPly]}
                    anchor="right"
                    onPick={(s) => {
                      setEdits({ ...edits, [popPly]: s.san });
                      plies[popPly].status = 'corrected';
                      plies[popPly].san = s.san;
                      setPopPly(-1);
                    }}
                    onDismiss={() => setPopPly(-1)}
                    onEdit={() => {}}
                  />
                </div>
              </div>
            )}
          </div>

          {/* engine analysis */}
          {showEngine && <EnginePanel ply={cur} plyIdx={ply} />}

          {/* scoresheet */}
          {showScoresheet && (
            <div style={{
              borderTop: '0.5px solid var(--pt-border)',
              padding: 12,
              background: 'var(--pt-bg-elev)',
            }}>
              <ScoresheetThumb activeRow={Math.floor(ply / 2)} />
            </div>
          )}

          {/* captured tray */}
          <div style={{
            padding: '10px 14px',
            borderTop: '0.5px solid var(--pt-border)',
            background: 'var(--pt-surface)',
          }}>
            <CapturedTray board={board} />
          </div>
        </div>
      </div>

      <PlaybackBar
        ply={ply}
        total={plies.length}
        onJump={(i) => setPly(Math.max(0, Math.min(plies.length - 1, i)))}
        flaggedCount={flagged}
        onJumpToFlag={() => {
          const idx = plies.findIndex(p => p.status === 'flagged');
          if (idx >= 0) { setPly(idx); setPopPly(idx); }
        }}
      />
    </div>
  );
};

// ─── MOBILE: stacked layout, board top, sheet bottom ─────────
const ReviewScreenMobile = ({ initialPly = 12, sheetOpen = true, showEngine = true }) => {
  const { plies } = useMemoRev(() => buildGame(), []);
  const [ply, setPly] = useStateRev(initialPly);
  const [popPly, setPopPly] = useStateRev(sheetOpen ? plies.findIndex(p => p.status === 'flagged') : -1);
  const cur = plies[ply];
  const board = cur ? cur.board : startPosition();
  const lastMove = cur ? { from: cur.from, to: cur.to } : null;
  const arrows = [];
  let warning;
  if (popPly >= 0 && plies[popPly].status === 'flagged') {
    warning = plies[popPly].to;
    plies[popPly].suggestions.slice(0, 3).forEach((s, i) => {
      arrows.push({ from: s.from, to: s.to, tone: s.preferred ? 'good' : (i === 0 ? 'forest' : 'amber') });
    });
  }
  const flagged = plies.filter(p => p.status === 'flagged').length;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--pt-bg)',
    }}>
      {/* compact header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px',
        borderBottom: '0.5px solid var(--pt-border)',
      }}>
        <button style={{
          width: 28, height: 28, padding: 0, background: 'transparent',
          border: 0, cursor: 'pointer', color: 'var(--pt-text)',
          fontFamily: 'var(--pt-mono)', fontSize: 18,
        }}>‹</button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontFamily: 'var(--pt-sans)', fontSize: 13, fontWeight: 500, color: 'var(--pt-text)' }}>
            Review · {HEADERS.White.split(' ').pop()} vs {HEADERS.Black.split(' ').pop()}
          </span>
          <span className="pt-micro" style={{ color: 'var(--pt-text-muted)' }}>
            {flagged} to review · {plies.length} ply
          </span>
        </div>
        <Button variant="primary" size="sm">Save</Button>
      </div>

      {/* board */}
      <div style={{
        padding: '14px 14px 8px',
        display: 'flex', flexDirection: 'column', gap: 8,
        alignItems: 'center',
      }}>
        <div style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'var(--pt-sans)', fontSize: 12,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Avatar name="J Dufresne" size={20} tone="forest" /> Dufresne
          </span>
          <span style={{ fontFamily: 'var(--pt-mono)', fontSize: 11, color: 'var(--pt-text-dim)' }}>
            {ply + 1}/{plies.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
          {showEngine && <EvalBar cp={ENGINE_ANALYSIS[ply]?.scoreCp ?? 0} height={272} width={14} />}
          <Board position={board} size={272} lastMove={lastMove} warning={warning} arrows={arrows} showCoords />
        </div>
        <div style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'var(--pt-sans)', fontSize: 12,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Avatar name="A Anderssen" size={20} tone="amber" /> Anderssen
          </span>
        </div>
      </div>

      {/* moves rail */}
      <div style={{
        padding: '6px 10px',
        display: 'flex', gap: 6, overflowX: 'auto',
        borderTop: '0.5px solid var(--pt-border)',
        borderBottom: '0.5px solid var(--pt-border)',
        background: 'var(--pt-bg-elev)',
        flexShrink: 0,
      }}>
        {plies.map((p, i) => (
          <MoveChip key={i} ply={p} idx={i} dense
            active={ply === i}
            onClick={() => { setPly(i); setPopPly(p.status === 'flagged' ? i : -1); }} />
        ))}
      </div>

      {/* bottom sheet — correction */}
      <div style={{
        flex: 1, minHeight: 0,
        background: 'var(--pt-surface)',
        borderTopLeftRadius: 16, borderTopRightRadius: 16,
        boxShadow: '0 -8px 24px -16px rgba(20,32,26,0.18)',
        marginTop: -10,
        padding: 14,
        display: 'flex', flexDirection: 'column', gap: 10,
        overflowY: 'auto',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 9999,
          background: 'var(--pt-border-strong)',
          alignSelf: 'center',
        }} />

        {popPly >= 0 && plies[popPly].status === 'flagged' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: 'var(--pt-amber)',
                animation: 'pt-confidence-blink 1.4s ease-in-out infinite',
              }} />
              <span className="pt-micro" style={{ color: 'var(--pt-amber-deep)' }}>
                Move {Math.floor(popPly/2)+1}{popPly%2===0 ? '.' : '…'} · Low confidence {Math.round(plies[popPly].conf*100)}%
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--pt-serif)', fontStyle: 'italic',
              fontSize: 15, lineHeight: '21px', color: 'var(--pt-text)',
            }}>
              You wrote <span style={{
                fontFamily: 'var(--pt-mono)', fontStyle: 'normal',
                background: 'rgba(199,127,58,0.15)', padding: '0 4px', borderRadius: 3,
              }}>{plies[popPly].san}</span>. Did you mean…
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {plies[popPly].suggestions.map((s, i) => (
                <button key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px',
                  background: s.preferred ? 'rgba(46,125,92,0.08)' : 'var(--pt-bg-elev)',
                  border: s.preferred ? '0.5px solid rgba(46,125,92,0.4)' : '0.5px solid var(--pt-border)',
                  borderRadius: 'var(--pt-r-card)',
                  cursor: 'pointer', textAlign: 'left',
                }}>
                  <span style={{
                    fontFamily: 'var(--pt-mono)', fontSize: 14, fontWeight: 600,
                    color: 'var(--pt-text)', minWidth: 52,
                  }}>{s.san}</span>
                  <span style={{
                    flex: 1, fontFamily: 'var(--pt-sans)', fontSize: 12,
                    color: 'var(--pt-text-muted)', lineHeight: '16px',
                  }}>{s.why}</span>
                  {s.preferred && (
                    <span style={{
                      fontFamily: 'var(--pt-mono)', fontSize: 9, fontWeight: 600,
                      letterSpacing: '0.1em', color: 'var(--pt-good)',
                    }}>BEST</span>
                  )}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Button variant="ghost" size="sm" style={{ flex: 1 }}>Type SAN</Button>
              <Button variant="quiet" size="sm" onClick={() => setPopPly(-1)} style={{ flex: 1 }}>Skip</Button>
            </div>
          </>
        ) : (
          <>
            <span className="pt-micro" style={{ color: 'var(--pt-text-muted)' }}>Move details</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <div style={{
                fontFamily: 'var(--pt-mono)', fontSize: 22, fontWeight: 500,
                color: 'var(--pt-text)',
              }}>
                {Math.floor(ply/2)+1}{ply%2===0 ? '.' : '…'} {cur?.san}
              </div>
              {ENGINE_ANALYSIS[ply] && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ClassDot kind={ENGINE_ANALYSIS[ply].classify} size={7} />
                  <span style={{
                    fontFamily: 'var(--pt-mono)', fontSize: 13, fontWeight: 600,
                    color: 'var(--pt-text)',
                  }}>{formatEval(ENGINE_ANALYSIS[ply].scoreCp)}</span>
                </span>
              )}
            </div>
            {cur?.note && (
              <div style={{
                fontFamily: 'var(--pt-serif)', fontStyle: 'italic',
                fontSize: 14, color: 'var(--pt-text-muted)',
              }}>{cur.note}</div>
            )}
            {showEngine && ENGINE_ANALYSIS[ply] && (
              <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="pt-micro" style={{ color: 'var(--pt-text-dim)' }}>
                  ENGINE · DEPTH {ENGINE_ANALYSIS[ply].depth}
                </span>
                {ENGINE_ANALYSIS[ply].lines.slice(0, 2).map((line, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '50px 1fr',
                    alignItems: 'baseline', gap: 8,
                    padding: '6px 8px',
                    background: i === 0 ? 'var(--pt-bg-elev)' : 'transparent',
                    border: i === 0 ? '0.5px solid var(--pt-border)' : '0.5px solid transparent',
                    borderRadius: 4,
                  }}>
                    <span style={{
                      fontFamily: 'var(--pt-mono)', fontSize: 12, fontWeight: 600,
                      color: line.cp >= 0 ? 'var(--pt-text)' : 'var(--pt-blunder)',
                    }}>{formatEval(line.cp)}</span>
                    <span style={{
                      fontFamily: 'var(--pt-mono)', fontSize: 12,
                      color: 'var(--pt-text-muted)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {line.pv.slice(0, 4).join(' · ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* tab bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '8px 12px',
        borderTop: '0.5px solid var(--pt-border)',
        background: 'var(--pt-surface)',
      }}>
        <NavBtn onClick={() => setPly(Math.max(0, ply - 1))}>‹</NavBtn>
        <span style={{ flex: 1 }} />
        <Chip tone="amber" icon={
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pt-amber)' }} />
        } onClick={() => {
          const idx = plies.findIndex(p => p.status === 'flagged');
          if (idx >= 0) { setPly(idx); setPopPly(idx); }
        }}>{flagged} to review</Chip>
        <span style={{ flex: 1 }} />
        <NavBtn onClick={() => setPly(Math.min(plies.length - 1, ply + 1))}>›</NavBtn>
      </div>
    </div>
  );
};

Object.assign(window, {
  ReviewScreenDesktop, ReviewScreenMobile,
  MoveChip, MoveList, CorrectionPopover, ScoresheetThumb,
  GameHeader, PlaybackBar, CapturedTray, NavBtn,
  EvalBar, EnginePanel, ClassDot, evalToFraction, formatEval,
});
