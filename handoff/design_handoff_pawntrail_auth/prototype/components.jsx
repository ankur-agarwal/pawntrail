/* PawnTrail — core UI components: Button, Input, Chip, Card, Badge, Toggle, etc. */

const Button = ({ variant = 'primary', size = 'md', children, icon, trailing, disabled, onClick, style }) => {
  const heights = { sm: 28, md: 36, lg: 44 };
  const padX = { sm: 12, md: 16, lg: 20 };
  const fontSize = { sm: 12, md: 14, lg: 14 };
  const variants = {
    primary: { background: 'var(--pt-amber)', color: 'var(--pt-cream)', border: '1px solid var(--pt-amber-deep)' },
    secondary: { background: 'var(--pt-forest)', color: 'var(--pt-cream)', border: '1px solid var(--pt-forest-deep)' },
    ghost: { background: 'transparent', color: 'var(--pt-text)', border: '1px solid var(--pt-border-strong)' },
    quiet: { background: 'transparent', color: 'var(--pt-text-muted)', border: '1px solid transparent' },
    danger: { background: 'transparent', color: 'var(--pt-blunder)', border: '1px solid var(--pt-blunder)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...variants[variant],
      height: heights[size], padding: `0 ${padX[size]}px`,
      fontFamily: 'var(--pt-sans)', fontSize: fontSize[size], fontWeight: 500,
      letterSpacing: '0.01em',
      borderRadius: 'var(--pt-r-card)',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 120ms ease',
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {icon}{children}{trailing}
    </button>
  );
};

const Input = ({ label, prefix, suffix, placeholder, value, onChange, error, hint, mono, type = 'text', style }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--pt-sans)', ...style }}>
    {label && <span className="pt-micro" style={{ color: 'var(--pt-text-muted)' }}>{label}</span>}
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      height: 36, padding: '0 12px',
      background: 'var(--pt-surface)',
      border: `1px solid ${error ? 'var(--pt-blunder)' : 'var(--pt-border-strong)'}`,
      borderRadius: 'var(--pt-r-card)',
    }}>
      {prefix && <span style={{ color: 'var(--pt-text-muted)', fontFamily: mono ? 'var(--pt-mono)' : 'inherit', fontSize: 13 }}>{prefix}</span>}
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}
        style={{
          flex: 1, border: 0, outline: 0, background: 'transparent',
          fontFamily: mono ? 'var(--pt-mono)' : 'var(--pt-sans)',
          fontSize: 14, color: 'var(--pt-text)', minWidth: 0,
        }} />
      {suffix && <span style={{ color: 'var(--pt-text-muted)', fontSize: 12 }}>{suffix}</span>}
    </div>
    {(error || hint) && <span style={{ fontSize: 12, color: error ? 'var(--pt-blunder)' : 'var(--pt-text-muted)' }}>{error || hint}</span>}
  </label>
);

const Chip = ({ children, active, onClick, icon, trailing, tone = 'default', size = 'md' }) => {
  const tones = {
    default: { bg: active ? 'var(--pt-forest)' : 'var(--pt-bg-elev)', fg: active ? 'var(--pt-cream)' : 'var(--pt-text)', border: active ? 'var(--pt-forest)' : 'var(--pt-border)' },
    amber: { bg: 'rgba(199,127,58,0.12)', fg: 'var(--pt-amber-deep)', border: 'rgba(199,127,58,0.4)' },
    forest: { bg: 'rgba(31,58,46,0.08)', fg: 'var(--pt-forest)', border: 'rgba(31,58,46,0.25)' },
  };
  const t = tones[tone];
  return (
    <button onClick={onClick} style={{
      height: size === 'sm' ? 22 : 26, padding: '0 10px',
      background: t.bg, color: t.fg, border: `0.5px solid ${t.border}`,
      borderRadius: 'var(--pt-r-pill)',
      fontFamily: 'var(--pt-sans)', fontSize: 12, fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      cursor: 'pointer', whiteSpace: 'nowrap',
    }}>
      {icon}{children}{trailing}
    </button>
  );
};

const Badge = ({ children, tone = 'default', mono }) => {
  const tones = {
    default: { bg: 'var(--pt-bg-elev)', fg: 'var(--pt-text-muted)', border: 'var(--pt-border)' },
    forest: { bg: 'var(--pt-forest)', fg: 'var(--pt-cream)', border: 'var(--pt-forest-deep)' },
    amber: { bg: 'var(--pt-amber)', fg: 'var(--pt-cream)', border: 'var(--pt-amber-deep)' },
    win: { bg: 'rgba(46,125,92,0.14)', fg: 'var(--pt-good)', border: 'rgba(46,125,92,0.3)' },
    loss: { bg: 'rgba(169,79,36,0.14)', fg: 'var(--pt-blunder)', border: 'rgba(169,79,36,0.3)' },
    draw: { bg: 'var(--pt-bg-elev)', fg: 'var(--pt-text-muted)', border: 'var(--pt-border-strong)' },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: 20, padding: '0 8px',
      background: t.bg, color: t.fg, border: `0.5px solid ${t.border}`,
      borderRadius: 'var(--pt-r-chip)',
      fontFamily: mono ? 'var(--pt-mono)' : 'var(--pt-sans)',
      fontSize: 11, fontWeight: 500, letterSpacing: '0.02em',
    }}>{children}</span>
  );
};

const Card = ({ title, label, children, accent, style, padding = 20, framed }) => (
  <div style={{
    background:
      accent === 'forest' ? 'var(--pt-forest)' :
      accent === 'amber' ? 'var(--pt-amber)' :
      accent === 'sand' ? 'var(--pt-cream-deep)' :
      'var(--pt-surface)',
    color:
      accent === 'forest' ? 'var(--pt-cream)' :
      accent === 'amber' ? 'var(--pt-cream)' :
      accent === 'sand' ? 'var(--pt-ink)' :
      'var(--pt-text)',
    border: framed ? '0.5px solid var(--pt-border-strong)' : '0.5px solid var(--pt-border)',
    borderRadius: 'var(--pt-r-card)',
    padding,
    boxShadow: 'var(--pt-shadow-card)',
    ...style,
  }}>
    {label && <div className="pt-micro" style={{ marginBottom: 8, color: (accent === 'forest' || accent === 'amber') ? 'rgba(244,237,220,0.6)' : 'var(--pt-text-muted)' }}>{label}</div>}
    {title && <div className="pt-h2" style={{ marginBottom: 4 }}>{title}</div>}
    {children}
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'var(--pt-sans)', fontSize: 14 }}>
    <span onClick={() => onChange?.(!checked)} style={{
      width: 32, height: 18, borderRadius: 9999,
      background: checked ? 'var(--pt-forest)' : 'var(--pt-border-strong)',
      position: 'relative', transition: 'background 160ms',
      flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 2, left: checked ? 16 : 2,
        width: 14, height: 14, borderRadius: 9999,
        background: 'var(--pt-cream)',
        transition: 'left 160ms',
      }} />
    </span>
    {label && <span>{label}</span>}
  </label>
);

const SegControl = ({ options, value, onChange, size = 'md' }) => (
  <div style={{
    display: 'inline-flex',
    background: 'var(--pt-bg-elev)',
    border: '0.5px solid var(--pt-border)',
    borderRadius: 'var(--pt-r-card)',
    padding: 2, gap: 2,
  }}>
    {options.map(o => (
      <button key={o.value} onClick={() => onChange?.(o.value)} style={{
        height: size === 'sm' ? 22 : 28, padding: '0 12px',
        background: value === o.value ? 'var(--pt-surface)' : 'transparent',
        color: value === o.value ? 'var(--pt-text)' : 'var(--pt-text-muted)',
        border: value === o.value ? '0.5px solid var(--pt-border-strong)' : '0.5px solid transparent',
        boxShadow: value === o.value ? '0 1px 0 rgba(20,32,26,0.04)' : 'none',
        borderRadius: 4,
        fontFamily: 'var(--pt-sans)', fontSize: 12, fontWeight: 500,
        cursor: 'pointer',
      }}>{o.label}</button>
    ))}
  </div>
);

// Avatar — initials-only
const Avatar = ({ name, size = 28, tone = 'forest' }) => {
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span style={{
      width: size, height: size, borderRadius: 9999,
      background: tone === 'forest' ? 'var(--pt-forest)' : 'var(--pt-amber)',
      color: 'var(--pt-cream)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--pt-mono)', fontSize: size * 0.36, fontWeight: 600,
      letterSpacing: '0.02em', flexShrink: 0,
    }}>{initials}</span>
  );
};

// Tooltip / Coord label — for cartographic ticks
const CoordLabel = ({ children }) => (
  <span style={{
    fontFamily: 'var(--pt-mono)', fontSize: 10, fontWeight: 500,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'var(--pt-text-dim)',
  }}>{children}</span>
);

Object.assign(window, { Button, Input, Chip, Badge, Card, Toggle, SegControl, Avatar, CoordLabel });
