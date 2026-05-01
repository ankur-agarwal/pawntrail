/* PawnTrail — Layout shells (topbar, sidebar, page frame) and Marketing hero */

const Sidebar = ({ active = 'Dashboard' }) => {
  const items = [
    { name: 'Dashboard', icon: '◇' },
    { name: 'Scan sheet', icon: '＋' },
    { name: 'Library', icon: '☰' },
    { name: 'Openings', icon: '◧' },
    { name: 'Settings', icon: '⚙' },
  ];
  return (
    <aside style={{
      width: 220, height: '100%',
      background: 'var(--pt-surface)',
      borderRight: '0.5px solid var(--pt-border)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 0',
    }}>
      <div style={{ padding: '0 20px 20px' }}>
        <TrailLockup size={22} />
      </div>
      <div className="pt-micro" style={{ padding: '8px 20px', color: 'var(--pt-text-dim)' }}>NAVIGATE</div>
      <nav style={{ display: 'flex', flexDirection: 'column', padding: '0 8px' }}>
        {items.map(it => {
          const isActive = it.name === active;
          return (
            <a key={it.name} href="#" onClick={e => e.preventDefault()} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 12px',
              borderRadius: 'var(--pt-r-card)',
              background: isActive ? 'var(--pt-bg-elev)' : 'transparent',
              color: isActive ? 'var(--pt-text)' : 'var(--pt-text-muted)',
              textDecoration: 'none',
              fontSize: 13, fontWeight: isActive ? 500 : 400,
              position: 'relative',
            }}>
              {isActive && <span style={{
                position: 'absolute', left: 0, top: 8, bottom: 8, width: 2,
                background: 'var(--pt-amber)', borderRadius: 2,
              }} />}
              <span style={{
                width: 18, textAlign: 'center', color: isActive ? 'var(--pt-amber)' : 'var(--pt-text-dim)',
                fontFamily: 'var(--pt-mono)', fontSize: 12,
              }}>{it.icon}</span>
              {it.name}
            </a>
          );
        })}
      </nav>
      <div style={{ flex: 1 }} />
      {/* quota meter */}
      <div style={{ padding: '12px 20px', borderTop: '0.5px solid var(--pt-border)' }}>
        <div className="pt-micro" style={{ marginBottom: 6 }}>FREE SCANS · 11 / 15</div>
        <div style={{ height: 4, background: 'var(--pt-bg-elev)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', width: '73%', background: 'var(--pt-amber)' }} />
        </div>
        <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 12, color: 'var(--pt-text-muted)', textDecoration: 'none' }}>
          Upgrade to Pro <span style={{ color: 'var(--pt-amber)' }}>→</span>
        </a>
      </div>
    </aside>
  );
};

const Topbar = ({ title, breadcrumb, actions }) => (
  <header style={{
    height: 56, padding: '0 24px',
    borderBottom: '0.5px solid var(--pt-border)',
    background: 'var(--pt-bg)',
    display: 'flex', alignItems: 'center', gap: 16,
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      {breadcrumb && (
        <div className="pt-micro" style={{ marginBottom: 2 }}>{breadcrumb}</div>
      )}
      {title && <div style={{ fontFamily: 'var(--pt-sans)', fontSize: 15, fontWeight: 500 }}>{title}</div>}
    </div>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {actions}
    </div>
  </header>
);

// Full app shell preview
const AppShell = ({ active = 'Dashboard', breadcrumb, title, actions, children, height = 540 }) => (
  <div style={{
    height,
    display: 'flex',
    background: 'var(--pt-bg)',
    border: '0.5px solid var(--pt-border-strong)',
    borderRadius: 'var(--pt-r-frame)',
    overflow: 'hidden',
  }}>
    <Sidebar active={active} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Topbar breadcrumb={breadcrumb} title={title} actions={actions} />
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {children}
      </div>
    </div>
  </div>
);

// Marketing topnav
const MarketingNav = () => (
  <nav style={{
    height: 64, padding: '0 32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '0.5px solid var(--pt-border)',
  }}>
    <TrailLockup size={26} />
    <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
      <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--pt-text-muted)', textDecoration: 'none', fontSize: 13 }}>Features</a>
      <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--pt-text-muted)', textDecoration: 'none', fontSize: 13 }}>Pricing</a>
      <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--pt-text-muted)', textDecoration: 'none', fontSize: 13 }}>Sign in</a>
      <Button variant="primary" size="sm">Start free</Button>
    </div>
  </nav>
);

// Marketing hero — leans into "trail" metaphor
const MarketingHero = () => (
  <section style={{
    position: 'relative',
    background: 'var(--pt-bg)',
    padding: '72px 56px 96px',
    overflow: 'hidden',
  }}>
    {/* Contour bg */}
    <div style={{ position: 'absolute', inset: 0, color: 'var(--pt-forest)', opacity: 0.5 }}>
      <ContourBg opacity={0.06} color="var(--pt-forest)" />
    </div>
    {/* Corner ticks */}
    <div style={{ position: 'absolute', top: 16, left: 16, fontFamily: 'var(--pt-mono)', fontSize: 10, color: 'var(--pt-text-dim)', letterSpacing: '0.12em' }}>01 · MARK</div>
    <div style={{ position: 'absolute', top: 16, right: 16, fontFamily: 'var(--pt-mono)', fontSize: 10, color: 'var(--pt-text-dim)', letterSpacing: '0.12em' }}>PAWNTRAIL / CARTOGRAPHIC PRECISION</div>

    <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <TrailMark size={88} />
      </div>
      <h1 style={{
        fontFamily: 'var(--pt-sans)', fontWeight: 500,
        fontSize: 56, lineHeight: 1.05, letterSpacing: '-0.02em',
        margin: '0 0 18px', color: 'var(--pt-text)',
      }}>
        Snap the scoresheet.<br />
        <span style={{ color: 'var(--pt-amber)' }}>Chart the trail.</span>
      </h1>
      <p style={{
        fontFamily: 'var(--pt-serif)', fontStyle: 'italic',
        fontSize: 22, lineHeight: 1.4, color: 'var(--pt-text-muted)',
        margin: '0 0 32px',
      }}>
        Photo to PGN to engine review in under sixty seconds.<br />
        Every game you play, mapped.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Button variant="primary" size="lg">Start free — 15 scans</Button>
        <Button variant="ghost" size="lg">See how it works</Button>
      </div>
      <div style={{ marginTop: 24 }}>
        <CoordLabel>NO CREDIT CARD · CANCEL ANY TIME · 4.99/MO AFTER</CoordLabel>
      </div>
    </div>

    {/* Decorative trail line bottom-right */}
    <div style={{ position: 'absolute', bottom: 24, right: 32, opacity: 0.7 }}>
      <TrailLine width={140} height={48} color="var(--pt-forest-soft)" />
    </div>
  </section>
);

// Marketing feature row
const FeatureRow = () => {
  const features = [
    { tag: '01 · CAPTURE', title: 'Snap, don\'t type.', body: 'Point your camera at a paper scoresheet. We handle the rest — angle, lighting, even messy handwriting.' },
    { tag: '02 · CHART', title: 'Mapped, not listed.', body: 'Every game becomes a route through the opening tree, with eval graphs and engine arrows along the way.' },
    { tag: '03 · CARRY', title: 'Yours, forever.', body: 'Export to PGN, push to a Lichess study, or just keep them in your library. Your games, your archive.' },
  ];
  return (
    <section style={{ padding: '64px 56px', borderTop: '0.5px solid var(--pt-border)', background: 'var(--pt-bg)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, maxWidth: 1100, margin: '0 auto' }}>
        {features.map((f, i) => (
          <div key={i}>
            <CoordLabel>{f.tag}</CoordLabel>
            <h3 style={{ fontFamily: 'var(--pt-sans)', fontWeight: 500, fontSize: 22, letterSpacing: '-0.01em', margin: '12px 0 8px' }}>{f.title}</h3>
            <p style={{ fontFamily: 'var(--pt-sans)', fontSize: 14, lineHeight: 1.6, color: 'var(--pt-text-muted)', margin: 0 }}>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

Object.assign(window, { Sidebar, Topbar, AppShell, MarketingNav, MarketingHero, FeatureRow });
