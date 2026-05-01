/* PawnTrail Design System — canvas composition */

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light"
}/*EDITMODE-END*/;

// ─────────────────────────────────────────────────────────────
// Foundations cards
// ─────────────────────────────────────────────────────────────
const ColorSwatchCard = () => {
  const swatches = [
    { name: 'Forest', token: '--pt-forest', hex: '#1F3A2E', role: 'Primary brand' },
    { name: 'Forest soft', token: '--pt-forest-soft', hex: '#556B5F', role: 'Hover, dark squares' },
    { name: 'Cream', token: '--pt-cream', hex: '#F4EDDC', role: 'Page background' },
    { name: 'Cream soft', token: '--pt-cream-soft', hex: '#EBE2CE', role: 'Surface elevation' },
    { name: 'Amber', token: '--pt-amber', hex: '#C77F3A', role: 'Single accent · CTA' },
    { name: 'Amber soft', token: '--pt-amber-soft', hex: '#E0A261', role: 'Amber hover' },
    { name: 'Ink', token: '--pt-ink', hex: '#14201A', role: 'Text · dark bg' },
  ];
  return (
    <div style={{ padding: 24 }}>
      <div className="pt-micro" style={{ marginBottom: 6 }}>5.1 · BRAND RAMP</div>
      <div className="pt-display" style={{ marginBottom: 4 }}>Color</div>
      <p style={{ color: 'var(--pt-text-muted)', maxWidth: 460, marginTop: 0 }}>
        Forest is primary, amber is the single accent, cream is ground, ink is weight. No other hues.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 24 }}>
        {swatches.map(s => (
          <div key={s.name} className="ds-swatch">
            <div style={{ height: 96, background: `var(${s.token})` }} />
            <div className="ds-swatch-meta">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</span>
                <span style={{ fontFamily: 'var(--pt-mono)', fontSize: 11, color: 'var(--pt-text-muted)' }}>{s.hex}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--pt-text-dim)', marginTop: 2 }}>{s.role}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28 }}>
        <div className="pt-micro" style={{ marginBottom: 10 }}>5.4 · MOVE CLASSIFICATION</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { name: 'Book', token: '--pt-book' },
            { name: 'Good', token: '--pt-good' },
            { name: 'Inaccuracy', token: '--pt-inaccuracy' },
            { name: 'Mistake', token: '--pt-mistake' },
            { name: 'Blunder', token: '--pt-blunder' },
          ].map(s => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--pt-surface)', border: '0.5px solid var(--pt-border)', borderRadius: 'var(--pt-r-pill)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 9999, background: `var(${s.token})` }} />
              <span style={{ fontSize: 12 }}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TypeSpecimenCard = () => (
  <div style={{ padding: 24 }}>
    <div className="pt-micro" style={{ marginBottom: 6 }}>5.2 · TYPOGRAPHY</div>
    <div className="pt-display" style={{ marginBottom: 4 }}>Type</div>
    <p style={{ color: 'var(--pt-text-muted)', maxWidth: 460, marginTop: 0 }}>
      Three families. Work Sans does the work. Instrument Serif italic for taglines.
      IBM Plex Mono for evals, coordinates, and micro labels.
    </p>

    <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
      <div>
        <div className="pt-micro" style={{ marginBottom: 12 }}>FAMILIES</div>
        <div className="ds-stack">
          <div>
            <CoordLabel>SANS · WORK SANS</CoordLabel>
            <div style={{ fontFamily: 'var(--pt-sans)', fontSize: 28, fontWeight: 500, marginTop: 4, lineHeight: 1.1 }}>Snap. Save. Study.</div>
          </div>
          <div>
            <CoordLabel>SERIF · INSTRUMENT SERIF ITALIC</CoordLabel>
            <div style={{ fontFamily: 'var(--pt-serif)', fontStyle: 'italic', fontSize: 28, marginTop: 4, lineHeight: 1.1, color: 'var(--pt-text-muted)' }}>Chart the trail.</div>
          </div>
          <div>
            <CoordLabel>MONO · IBM PLEX MONO</CoordLabel>
            <div style={{ fontFamily: 'var(--pt-mono)', fontSize: 22, marginTop: 4, lineHeight: 1.2 }}>1. e4 c5 +0.34</div>
          </div>
        </div>
      </div>

      <div>
        <div className="pt-micro" style={{ marginBottom: 12 }}>SCALE</div>
        <div className="ds-stack">
          {[
            { lbl: 'Display · 28/34 · 500', cls: 'pt-display', text: 'Snap the scoresheet' },
            { lbl: 'H2 · 20/28 · 500', cls: 'pt-h2', text: 'Game detail' },
            { lbl: 'H3 · 16/22 · 500', cls: 'pt-h3', text: 'Engine analysis' },
            { lbl: 'Body · 14/22 · 400', cls: 'pt-body', text: 'Tournament chess players record games by hand.' },
            { lbl: 'Small · 12/18 · 400', cls: 'pt-small', text: 'Free scans · 11 of 15 used' },
          ].map(r => (
            <div key={r.lbl} className="ds-spec-row">
              <span className="ds-spec-key pt-micro">{r.lbl}</span>
              <span className={r.cls}>{r.text}</span>
            </div>
          ))}
          <div className="ds-spec-row">
            <span className="ds-spec-key pt-micro">MICRO · 10/14 · MONO</span>
            <span className="pt-micro" style={{ color: 'var(--pt-text)' }}>03 · TRAIL</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SpacingCard = () => {
  const steps = [4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96];
  const radii = [
    { name: 'chip', val: 4 }, { name: 'card', val: 6 }, { name: 'lg', val: 8 }, { name: 'frame', val: 12 }, { name: 'pill', val: 9999 },
  ];
  return (
    <div style={{ padding: 24 }}>
      <div className="pt-micro" style={{ marginBottom: 6 }}>5.3 · SPACING & RADII</div>
      <div className="pt-display" style={{ marginBottom: 4 }}>Geometry</div>
      <p style={{ color: 'var(--pt-text-muted)', maxWidth: 460, marginTop: 0 }}>
        8-pt grid with finer 4-pt steps for dense chess UIs. Five radii cover everything from chip to frame.
      </p>

      <div style={{ marginTop: 24 }}>
        <div className="pt-micro" style={{ marginBottom: 12 }}>SPACE SCALE</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
          {steps.map(s => (
            <div key={s} style={{ textAlign: 'center' }}>
              <div style={{ width: s, height: s, background: 'var(--pt-forest)', borderRadius: 2 }} />
              <div style={{ fontFamily: 'var(--pt-mono)', fontSize: 10, color: 'var(--pt-text-muted)', marginTop: 6 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <div className="pt-micro" style={{ marginBottom: 12 }}>CORNER RADII</div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
          {radii.map(r => (
            <div key={r.name} style={{ textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56,
                background: 'var(--pt-cream-soft)',
                border: '0.5px solid var(--pt-border-strong)',
                borderRadius: r.val,
              }} />
              <div style={{ fontFamily: 'var(--pt-mono)', fontSize: 10, color: 'var(--pt-text-muted)', marginTop: 6 }}>
                {r.name} · {r.val === 9999 ? '∞' : r.val}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <div className="pt-micro" style={{ marginBottom: 12 }}>BORDERS</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ padding: '12px 16px', border: '0.5px solid var(--pt-border)', borderRadius: 6 }}>
            <span style={{ fontSize: 12 }}>0.5px default</span>
          </div>
          <div style={{ padding: '12px 16px', border: '0.5px solid var(--pt-border-strong)', borderRadius: 6 }}>
            <span style={{ fontSize: 12 }}>0.5px strong</span>
          </div>
          <div style={{ padding: '12px 16px', border: '0.5px dashed var(--pt-border-strong)', borderRadius: 6 }}>
            <span style={{ fontSize: 12 }}>0.5px dashed (contour)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BrandMarkCard = () => (
  <div style={{ padding: 24 }}>
    <div className="pt-micro" style={{ marginBottom: 6 }}>5.4 · BRAND ASSETS</div>
    <div className="pt-display" style={{ marginBottom: 4 }}>The Trail</div>
    <p style={{ color: 'var(--pt-text-muted)', maxWidth: 480, marginTop: 0 }}>
      The mark is a multi-leg dotted route from anchor to amber terminus.
      A node-edge metaphor: every game is a route, every move a step on the trail.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 28 }}>
      <div className="ds-swatch">
        <div style={{ height: 220, background: 'var(--pt-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrailMark size={140} />
        </div>
        <div className="ds-swatch-meta">
          <div style={{ fontWeight: 500, fontSize: 13 }}>Master mark</div>
          <div style={{ fontSize: 11, color: 'var(--pt-text-dim)', marginTop: 2 }}>On cream</div>
        </div>
      </div>
      <div className="ds-swatch">
        <div style={{ height: 220, background: 'var(--pt-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrailGlyph size={140} bg="var(--pt-forest)" />
        </div>
        <div className="ds-swatch-meta">
          <div style={{ fontWeight: 500, fontSize: 13 }}>App glyph</div>
          <div style={{ fontSize: 11, color: 'var(--pt-text-dim)', marginTop: 2 }}>Favicon, app icon</div>
        </div>
      </div>
      <div className="ds-swatch">
        <div style={{ height: 220, background: 'var(--pt-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <TrailLockup size={36} />
        </div>
        <div className="ds-swatch-meta">
          <div style={{ fontWeight: 500, fontSize: 13 }}>Wordmark lockup</div>
          <div style={{ fontSize: 11, color: 'var(--pt-text-dim)', marginTop: 2 }}>Marketing, sign-in</div>
        </div>
      </div>
    </div>

    <div style={{ marginTop: 28 }}>
      <div className="pt-micro" style={{ marginBottom: 12 }}>FAVICON SCALE</div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
        {[16, 24, 32, 48, 64].map(s => (
          <div key={s} style={{ textAlign: 'center' }}>
            <TrailGlyph size={s} bg="var(--pt-forest)" radius={0.22} />
            <div style={{ fontFamily: 'var(--pt-mono)', fontSize: 10, color: 'var(--pt-text-muted)', marginTop: 6 }}>{s}px</div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ marginTop: 28 }}>
      <div className="pt-micro" style={{ marginBottom: 12 }}>CARTOGRAPHIC MOTIFS</div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <TrailLine width={180} height={64} color="var(--pt-forest)" />
        <div style={{ flex: 1, position: 'relative', height: 80, border: '0.5px solid var(--pt-border)', borderRadius: 6, overflow: 'hidden' }}>
          <ContourBg opacity={0.18} color="var(--pt-forest)" />
          <span className="pt-micro" style={{ position: 'absolute', top: 8, left: 12 }}>CONTOUR LINES</span>
        </div>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Component cards
// ─────────────────────────────────────────────────────────────
const ButtonsCard = () => {
  const [count, setCount] = useState(2);
  return (
    <div style={{ padding: 24 }}>
      <div className="pt-micro" style={{ marginBottom: 6 }}>COMPONENTS · BUTTONS</div>
      <div className="pt-display" style={{ marginBottom: 16 }}>Buttons</div>

      <div className="pt-micro" style={{ marginBottom: 10 }}>VARIANTS</div>
      <div className="ds-row" style={{ marginBottom: 24 }}>
        <Button variant="primary">Save game</Button>
        <Button variant="secondary">Open in Lichess</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="quiet">Skip for now</Button>
        <Button variant="danger">Delete account</Button>
      </div>

      <div className="pt-micro" style={{ marginBottom: 10 }}>SIZES</div>
      <div className="ds-row" style={{ marginBottom: 24 }}>
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="md">Medium · default</Button>
        <Button variant="primary" size="lg">Large</Button>
      </div>

      <div className="pt-micro" style={{ marginBottom: 10 }}>WITH AFFORDANCES</div>
      <div className="ds-row" style={{ marginBottom: 24 }}>
        <Button variant="primary" trailing={<span>→</span>}>Scan sheet</Button>
        <Button variant="ghost" icon={<span style={{ fontFamily: 'var(--pt-mono)' }}>＋</span>}>New scan</Button>
        <Button variant="secondary" onClick={() => setCount(c => c + 1)}>
          Click count · <span style={{ fontFamily: 'var(--pt-mono)', opacity: 0.85 }}>{count}</span>
        </Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>
    </div>
  );
};

const InputsCard = () => {
  const [phone, setPhone] = useState('98123 45678');
  const [lichess, setLichess] = useState('ankit_kt');
  const [bad, setBad] = useState('@@@');
  return (
    <div style={{ padding: 24 }}>
      <div className="pt-micro" style={{ marginBottom: 6 }}>COMPONENTS · INPUTS</div>
      <div className="pt-display" style={{ marginBottom: 16 }}>Inputs</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input label="PHONE" prefix="+91" value={phone} onChange={setPhone} mono hint="E.164 normalised on submit" />
        <Input label="LICHESS USERNAME" prefix="@" value={lichess} onChange={setLichess} hint="We'll verify the handle exists." />
        <Input label="OPPONENT" placeholder="e.g. Aravind R" />
        <Input label="TOURNAMENT" placeholder="e.g. Delhi Open 2026 · Round 4" />
        <Input label="DISPLAY NAME" value={bad} onChange={setBad} error="Use letters and numbers only." />
        <Input label="OTP CODE" prefix="●●●" suffix="9:42" mono placeholder="6-digit" />
      </div>
    </div>
  );
};

const ChipsBadgesCard = () => {
  const [filter, setFilter] = useState('30d');
  const [view, setView] = useState('table');
  return (
    <div style={{ padding: 24 }}>
      <div className="pt-micro" style={{ marginBottom: 6 }}>COMPONENTS · CHIPS, BADGES, TOGGLES</div>
      <div className="pt-display" style={{ marginBottom: 16 }}>Pickers & flags</div>

      <div className="pt-micro" style={{ marginBottom: 10 }}>FILTER CHIPS</div>
      <div className="ds-row" style={{ marginBottom: 24 }}>
        {['7d', '30d', '90d', '1y', 'All'].map(d => (
          <Chip key={d} active={filter === d} onClick={() => setFilter(d)}>{d}</Chip>
        ))}
        <span style={{ width: 1, height: 16, background: 'var(--pt-border-strong)', margin: '0 4px' }} />
        <Chip tone="forest" trailing={<span style={{ opacity: 0.6 }}>▾</span>}>Result · any</Chip>
        <Chip tone="amber" icon={<span>⚐</span>}>Flagged only</Chip>
        <Chip>+ Add filter</Chip>
      </div>

      <div className="pt-micro" style={{ marginBottom: 10 }}>RESULT BADGES</div>
      <div className="ds-row" style={{ marginBottom: 24 }}>
        <Badge tone="win">WIN · 1–0</Badge>
        <Badge tone="loss">LOSS · 0–1</Badge>
        <Badge tone="draw">DRAW · ½–½</Badge>
        <Badge tone="forest" mono>E21 · NIMZO-INDIAN</Badge>
        <Badge tone="amber" mono>PRO</Badge>
      </div>

      <div className="pt-micro" style={{ marginBottom: 10 }}>SEGMENTED CONTROL</div>
      <div className="ds-row" style={{ marginBottom: 24 }}>
        <SegControl
          options={[{ label: 'Table', value: 'table' }, { label: 'Cards', value: 'cards' }, { label: 'Calendar', value: 'cal' }]}
          value={view} onChange={setView}
        />
      </div>

      <div className="pt-micro" style={{ marginBottom: 10 }}>TOGGLES</div>
      <div className="ds-row">
        <DemoToggle label="Engine arrow on board" defaultV={true} />
        <DemoToggle label="Auto-flip on opponent's view" defaultV={false} />
        <DemoToggle label="Reduce motion" defaultV={false} />
      </div>
    </div>
  );
};

const DemoToggle = ({ label, defaultV }) => {
  const [v, setV] = useState(defaultV);
  return <Toggle checked={v} onChange={setV} label={label} />;
};

const CardsCard = () => (
  <div style={{ padding: 24 }}>
    <div className="pt-micro" style={{ marginBottom: 6 }}>COMPONENTS · CARDS</div>
    <div className="pt-display" style={{ marginBottom: 16 }}>Cards</div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      <Card label="GAMES" framed>
        <div style={{ fontFamily: 'var(--pt-sans)', fontSize: 36, fontWeight: 500, lineHeight: 1, marginTop: 4 }}>47</div>
        <div style={{ fontSize: 12, color: 'var(--pt-text-muted)', marginTop: 4 }}>since Aug 2025</div>
      </Card>
      <Card label="RATING" framed>
        <div style={{ fontFamily: 'var(--pt-sans)', fontSize: 36, fontWeight: 500, lineHeight: 1, marginTop: 4, color: 'var(--pt-amber)' }}>1842</div>
        <div style={{ fontSize: 12, color: 'var(--pt-text-muted)', marginTop: 4 }}>+38 over 90d</div>
      </Card>
      <Card label="BLUNDERS / GAME" framed>
        <div style={{ fontFamily: 'var(--pt-sans)', fontSize: 36, fontWeight: 500, lineHeight: 1, marginTop: 4 }}>1.3</div>
        <div style={{ fontSize: 12, color: 'var(--pt-text-muted)', marginTop: 4 }}>down from 1.8</div>
      </Card>

      <Card accent="forest" style={{ gridColumn: 'span 2', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
          <ContourBg opacity={0.12} color="var(--pt-cream)" />
        </div>
        <div style={{ position: 'relative' }}>
          <div className="pt-micro" style={{ color: 'rgba(244,237,220,0.55)', marginBottom: 6 }}>NEXT STEP</div>
          <div className="pt-h2" style={{ marginBottom: 4, color: 'var(--pt-cream)' }}>Scan your next scoresheet</div>
          <p style={{ fontFamily: 'var(--pt-serif)', fontStyle: 'italic', color: 'rgba(244,237,220,0.75)', fontSize: 17, margin: '4px 0 16px' }}>
            Snap a photo. We'll parse, analyse, and save the game in under a minute.
          </p>
          <Button variant="primary" trailing={<span>→</span>}>Scan sheet</Button>
        </div>
      </Card>

      <Card label="ROUTE PREVIEW" framed style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
          <TrailMark size={96} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--pt-text-muted)', textAlign: 'center' }}>
          Each game becomes a path.
        </div>
      </Card>
    </div>
  </div>
);

const AvatarsCard = () => (
  <div style={{ padding: 24 }}>
    <div className="pt-micro" style={{ marginBottom: 6 }}>COMPONENTS · AVATARS, COORDS</div>
    <div className="pt-display" style={{ marginBottom: 16 }}>Identity & ticks</div>

    <div className="pt-micro" style={{ marginBottom: 10 }}>OPPONENT AVATARS</div>
    <div className="ds-row" style={{ marginBottom: 24 }}>
      <Avatar name="Aravind R" />
      <Avatar name="Maya Patel" tone="amber" />
      <Avatar name="K" />
      <Avatar name="Sergei Ivanov" size={36} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Avatar name="Aravind R" size={32} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Aravind R</div>
          <div style={{ fontFamily: 'var(--pt-mono)', fontSize: 11, color: 'var(--pt-text-muted)' }}>1788 · WHITE</div>
        </div>
      </div>
    </div>

    <div className="pt-micro" style={{ marginBottom: 10 }}>COORDINATE LABELS</div>
    <div style={{
      display: 'flex', gap: 24, padding: 16,
      border: '0.5px dashed var(--pt-border-strong)', borderRadius: 6,
    }}>
      <CoordLabel>03 · TRAIL</CoordLabel>
      <CoordLabel>PAWNTRAIL / CARTOGRAPHIC PRECISION</CoordLabel>
      <CoordLabel>NORTH · 28.6139 / 77.2090</CoordLabel>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Layouts cards
// ─────────────────────────────────────────────────────────────
const AppShellCard = () => (
  <div style={{ padding: 24 }}>
    <div className="pt-micro" style={{ marginBottom: 6 }}>LAYOUT · APP SHELL</div>
    <div className="pt-display" style={{ marginBottom: 4 }}>Authed shell</div>
    <p style={{ color: 'var(--pt-text-muted)', maxWidth: 460, marginTop: 0, marginBottom: 20 }}>
      Sidebar (220px) + topbar (56px) + main scroll region. Quota meter pinned at sidebar bottom.
    </p>
    <AppShell
      active="Dashboard"
      breadcrumb="HOME"
      title="Welcome back, Ankit"
      actions={<>
        <Button variant="ghost" size="sm">Theme</Button>
        <Button variant="primary" size="sm" trailing={<span>→</span>}>Scan sheet</Button>
      </>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <Card label="GAMES"><div style={{ fontSize: 28, fontWeight: 500 }}>47</div><div style={{ fontSize: 11, color: 'var(--pt-text-muted)' }}>since Aug</div></Card>
        <Card label="WIN RATE"><div style={{ fontSize: 28, fontWeight: 500 }}>54%</div><div style={{ fontSize: 11, color: 'var(--pt-text-muted)' }}>last 30 days</div></Card>
        <Card label="RATING"><div style={{ fontSize: 28, fontWeight: 500, color: 'var(--pt-amber)' }}>1842</div><div style={{ fontSize: 11, color: 'var(--pt-text-muted)' }}>+38 / 90d</div></Card>
      </div>
      <Card accent="sand" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}><ContourBg opacity={0.18} color="var(--pt-forest)" /></div>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
          <div>
            <div className="pt-h2">Scan your next scoresheet</div>
            <div style={{ fontFamily: 'var(--pt-serif)', fontStyle: 'italic', color: 'var(--pt-text-muted)', fontSize: 16, marginTop: 4 }}>Photo to PGN in under a minute.</div>
          </div>
          <Button variant="primary" trailing={<span>→</span>}>Scan sheet</Button>
        </div>
      </Card>
      <div style={{ marginTop: 16 }}>
        <div className="pt-micro" style={{ marginBottom: 10 }}>RECENT GAMES</div>
        <Card padding={0} framed>
          {[
            { d: 'Apr 12', o: 'Aravind R', r: 1788, c: 'win', op: 'Sicilian · Najdorf', e: 'B90', t: 'Delhi Open · R4' },
            { d: 'Apr 11', o: 'Maya Patel', r: 1812, c: 'draw', op: 'Nimzo-Indian', e: 'E21', t: 'Delhi Open · R3' },
            { d: 'Apr 10', o: 'K. Saxena', r: 1701, c: 'loss', op: 'Catalan', e: 'E04', t: 'Delhi Open · R2' },
          ].map((g, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '70px 1fr 90px 1fr 1fr',
              padding: '12px 16px', alignItems: 'center', gap: 12,
              borderTop: i ? '0.5px solid var(--pt-border)' : 'none',
              fontSize: 13,
            }}>
              <span style={{ fontFamily: 'var(--pt-mono)', fontSize: 12, color: 'var(--pt-text-muted)' }}>{g.d}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={g.o} size={22} />
                <span>{g.o} <span style={{ fontFamily: 'var(--pt-mono)', fontSize: 11, color: 'var(--pt-text-muted)' }}>· {g.r}</span></span>
              </span>
              <Badge tone={g.c}>{g.c.toUpperCase()}</Badge>
              <span>{g.op} <span style={{ fontFamily: 'var(--pt-mono)', fontSize: 11, color: 'var(--pt-text-muted)' }}>· {g.e}</span></span>
              <span style={{ color: 'var(--pt-text-muted)' }}>{g.t}</span>
            </div>
          ))}
        </Card>
      </div>
    </AppShell>
  </div>
);

const SignInCard = () => (
  <div style={{ padding: 24 }}>
    <div className="pt-micro" style={{ marginBottom: 6 }}>LAYOUT · AUTH</div>
    <div className="pt-display" style={{ marginBottom: 16 }}>Sign-in</div>
    <div style={{
      height: 540, borderRadius: 'var(--pt-r-frame)',
      border: '0.5px solid var(--pt-border-strong)',
      background: 'var(--pt-bg)', position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <ContourBg opacity={0.06} color="var(--pt-forest)" />
      </div>
      <div style={{ position: 'absolute', top: 16, left: 16 }}><CoordLabel>02 · ENTER</CoordLabel></div>
      <div style={{ position: 'absolute', top: 16, right: 16 }}><CoordLabel>PAWNTRAIL / SIGN IN</CoordLabel></div>
      <div style={{ position: 'relative', width: 380, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <TrailMark size={64} />
        </div>
        <div style={{ fontFamily: 'var(--pt-sans)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 6 }}>Welcome back</div>
        <div style={{ fontFamily: 'var(--pt-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--pt-text-muted)', marginBottom: 24 }}>
          Snap the scoresheet. Chart the trail.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
          <Input label="PHONE NUMBER" prefix="🇮🇳 +91" value="98123 45678" mono />
          <Button variant="primary" size="lg" style={{ width: '100%', justifyContent: 'center' }}>Send verification code</Button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--pt-text-dim)', marginTop: 16, lineHeight: 1.6 }}>
          We'll text a 6-digit code. Carrier rates may apply.<br />
          By continuing you agree to the Terms and Privacy policy.
        </div>
      </div>
    </div>
  </div>
);

const PaywallCard = () => (
  <div style={{ padding: 24 }}>
    <div className="pt-micro" style={{ marginBottom: 6 }}>LAYOUT · PAYWALL</div>
    <div className="pt-display" style={{ marginBottom: 16 }}>Upgrade modal</div>
    <div style={{
      height: 540, borderRadius: 'var(--pt-r-frame)',
      background: 'rgba(20,32,26,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <Card framed style={{ width: 540, padding: 32, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 16, left: 16 }}><CoordLabel>15 / 15</CoordLabel></div>
        <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
          <TrailMark size={48} />
        </div>
        <div className="pt-display" style={{ textAlign: 'center', marginBottom: 6 }}>You've scanned 15 games — nice work.</div>
        <div style={{ fontFamily: 'var(--pt-serif)', fontStyle: 'italic', textAlign: 'center', fontSize: 17, color: 'var(--pt-text-muted)', marginBottom: 24 }}>
          Keep going with Pro. Unlimited scans, priority OCR, same everything else.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 16, border: '0.5px solid var(--pt-border-strong)', borderRadius: 6 }}>
            <div className="pt-micro">MONTHLY</div>
            <div style={{ fontSize: 24, fontWeight: 500, marginTop: 6 }}>$4.99 <span style={{ fontFamily: 'var(--pt-mono)', fontSize: 12, color: 'var(--pt-text-muted)' }}>/mo</span></div>
            <Button variant="ghost" size="sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>Upgrade monthly</Button>
          </div>
          <div style={{ padding: 16, border: '1px solid var(--pt-amber)', borderRadius: 6, background: 'rgba(199,127,58,0.08)', position: 'relative' }}>
            <Badge tone="amber" style={{ position: 'absolute', top: -10, right: 12 }}>34% OFF</Badge>
            <div className="pt-micro" style={{ color: 'var(--pt-amber-deep)' }}>YEARLY</div>
            <div style={{ fontSize: 24, fontWeight: 500, marginTop: 6 }}>$39 <span style={{ fontFamily: 'var(--pt-mono)', fontSize: 12, color: 'var(--pt-text-muted)' }}>/yr</span></div>
            <Button variant="primary" size="sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>Upgrade yearly</Button>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--pt-text-muted)', fontSize: 12, textDecoration: 'none' }}>Not now</a>
        </div>
      </Card>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Marketing cards
// ─────────────────────────────────────────────────────────────
const MarketingHeroCard = () => (
  <div style={{ padding: 0 }}>
    <MarketingNav />
    <MarketingHero />
    <FeatureRow />
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main composition
// ─────────────────────────────────────────────────────────────
const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
  }, [tweaks.theme]);

  return (
    <>
      <DesignCanvas>
        <DCSection id="foundations" title="Foundations" subtitle="Tokens, type, and brand">
          <DCArtboard id="color" label="Color" width={760} height={620}>
            <ColorSwatchCard />
          </DCArtboard>
          <DCArtboard id="type" label="Typography" width={820} height={620}>
            <TypeSpecimenCard />
          </DCArtboard>
          <DCArtboard id="geom" label="Spacing & Radii" width={760} height={620}>
            <SpacingCard />
          </DCArtboard>
          <DCArtboard id="brand" label="Brand mark" width={820} height={680}>
            <BrandMarkCard />
          </DCArtboard>
        </DCSection>

        <DCSection id="components" title="Components" subtitle="Buttons, inputs, chips, badges, cards">
          <DCArtboard id="buttons" label="Buttons" width={760} height={420}>
            <ButtonsCard />
          </DCArtboard>
          <DCArtboard id="inputs" label="Inputs" width={760} height={420}>
            <InputsCard />
          </DCArtboard>
          <DCArtboard id="chips" label="Chips, badges, toggles" width={760} height={520}>
            <ChipsBadgesCard />
          </DCArtboard>
          <DCArtboard id="cards" label="Cards" width={820} height={520}>
            <CardsCard />
          </DCArtboard>
          <DCArtboard id="avatars" label="Avatars & coords" width={760} height={400}>
            <AvatarsCard />
          </DCArtboard>
        </DCSection>

        <DCSection id="layout" title="Layouts" subtitle="App shell, sign-in, paywall">
          <DCArtboard id="app-shell" label="App shell" width={1100} height={700}>
            <AppShellCard />
          </DCArtboard>
          <DCArtboard id="signin" label="Sign-in screen" width={720} height={680}>
            <SignInCard />
          </DCArtboard>
          <DCArtboard id="paywall" label="Paywall modal" width={720} height={680}>
            <PaywallCard />
          </DCArtboard>
        </DCSection>

        <DCSection id="marketing" title="Marketing" subtitle="Landing surface · pawntrail.com">
          <DCArtboard id="landing" label="Landing page" width={1180} height={900}>
            <MarketingHeroCard />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Color theme">
          <TweakSelect
            label="Palette"
            value={tweaks.theme}
            options={[
              { label: 'Light · cream (default)', value: 'light' },
              { label: 'Light · paper (neutral)', value: 'paper' },
              { label: 'Light · sage (soft green)', value: 'sage' },
              { label: 'Light · moss (deeper green)', value: 'moss' },
              { label: 'Light · mint (fresh pale)', value: 'mint' },
              { label: 'Dark · forest', value: 'dark' },
              { label: 'Dark · slate (cool grey)', value: 'slate' },
              { label: 'Dark · midnight (near-black)', value: 'midnight' },
              { label: 'Dark · oxblood (warm)', value: 'oxblood' },
            ]}
            onChange={v => setTweak('theme', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
