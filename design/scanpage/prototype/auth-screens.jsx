/* PawnTrail — magic-link email auth flow (paper theme) */
/* Six screens × two surfaces (mobile + desktop), all states folded in */

const { useState: useStateAuth, useEffect: useEffectAuth } = React;

// ─────────────────────────────────────────────────────────────
// Shared auth pieces
// ─────────────────────────────────────────────────────────────

// Google "G" mark — official 4-color, used on social button
const GoogleG = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
    <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 7.1 29.4 5 24 5 16.3 5 9.6 9.4 6.3 14.7z"/>
    <path fill="#FBBC05" d="M24 44c5.3 0 10.1-2 13.8-5.3l-6.4-5.4C29.4 34.5 26.8 35.5 24 35.5c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.5 39.2 16.1 44 24 44z"/>
    <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4 5.8l6.4 5.4c-.5.5 6.7-4.9 6.7-15.2 0-1.2-.1-2.4-.4-3.5z"/>
  </svg>
);

// Animated 3-dot loading row — used for inline loading
const Dots = ({ color = 'currentColor', size = 4 }) => (
  <span style={{ display: 'inline-flex', gap: size * 1.5, alignItems: 'center' }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: size, height: size, borderRadius: 9999, background: color,
        animation: `pt-dotpulse 1.1s ${i * 0.15}s infinite ease-in-out`,
      }} />
    ))}
  </span>
);

// Spinning ring — for verifying-link state
const Spinner = ({ size = 28, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" style={{ animation: 'pt-spin 1s linear infinite' }}>
    <circle cx="25" cy="25" r="20" fill="none" stroke="var(--pt-border-strong)" strokeWidth={stroke} />
    <path d="M 25 5 a 20 20 0 0 1 20 20" fill="none" stroke="var(--pt-amber)" strokeWidth={stroke} strokeLinecap="round" />
  </svg>
);

// Success check — drawn small inside a forest disc
const SuccessMark = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <circle cx="28" cy="28" r="26" fill="var(--pt-forest)" />
    <path d="M 17 29 L 25 36 L 39 21" fill="none" stroke="var(--pt-cream)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Warning glyph — used on expired link error
const ExpiredMark = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <circle cx="28" cy="28" r="26" fill="none" stroke="var(--pt-amber-deep)" strokeWidth="1.5" strokeDasharray="2 4" />
    <path d="M 28 16 L 28 30" stroke="var(--pt-amber-deep)" strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="28" cy="38" r="1.6" fill="var(--pt-amber-deep)" />
  </svg>
);

// Email-glyph icon — small, monoline, dotted-trail crossing (cartographic nod)
const InboxGlyph = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <rect x="10" y="14" width="36" height="28" rx="2" fill="none" stroke="var(--pt-text)" strokeWidth="1.4" />
    <path d="M 10 16 L 28 30 L 46 16" fill="none" stroke="var(--pt-text)" strokeWidth="1.4" strokeLinejoin="round" />
    {/* trail of dots over the envelope, ending in amber terminus */}
    <circle cx="14" cy="48" r="1.5" fill="var(--pt-text-dim)" />
    <circle cx="22" cy="48" r="1.5" fill="var(--pt-text-dim)" />
    <circle cx="30" cy="48" r="1.5" fill="var(--pt-text-dim)" />
    <circle cx="38" cy="48" r="1.5" fill="var(--pt-text-dim)" />
    <circle cx="46" cy="48" r="3" fill="var(--pt-amber)" />
  </svg>
);

// Google sign-in button (matches PawnTrail Button feel)
const GoogleButton = ({ onClick, size = 'lg', fullWidth = true }) => {
  const heights = { md: 36, lg: 44 };
  return (
    <button onClick={onClick} style={{
      height: heights[size], padding: '0 16px',
      background: 'var(--pt-surface)', color: 'var(--pt-text)',
      border: '1px solid var(--pt-border-strong)',
      borderRadius: 'var(--pt-r-card)',
      fontFamily: 'var(--pt-sans)', fontSize: 14, fontWeight: 500,
      letterSpacing: '0.01em',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      cursor: 'pointer', width: fullWidth ? '100%' : 'auto',
      transition: 'all 120ms ease',
    }}>
      <GoogleG size={16} />
      Continue with Google
    </button>
  );
};

// Divider with "OR" label
const OrDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
    <span style={{ flex: 1, height: 0.5, background: 'var(--pt-border)' }} />
    <span style={{
      fontFamily: 'var(--pt-mono)', fontSize: 10, fontWeight: 500,
      letterSpacing: '0.18em', color: 'var(--pt-text-dim)',
    }}>OR</span>
    <span style={{ flex: 1, height: 0.5, background: 'var(--pt-border)' }} />
  </div>
);

// Footer legal block
const AuthFooter = () => (
  <div style={{
    fontSize: 11, lineHeight: 1.6,
    color: 'var(--pt-text-dim)',
    textAlign: 'center', marginTop: 20,
  }}>
    By continuing you agree to the{' '}
    <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--pt-text-muted)' }}>Terms</a>
    {' · '}
    <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--pt-text-muted)' }}>Privacy</a>
  </div>
);

// Cartographic frame ticks shown on each auth screen
const AuthTicks = ({ left, right }) => (
  <>
    <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}><CoordLabel>{left}</CoordLabel></div>
    <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}><CoordLabel>{right}</CoordLabel></div>
  </>
);

// ─────────────────────────────────────────────────────────────
// Screen 1 — Enter email (3 states: empty / error / loading)
// ─────────────────────────────────────────────────────────────
const SignInScreen = ({ state = 'empty' }) => {
  const isError = state === 'error';
  const isLoading = state === 'loading';
  const value = state === 'empty' ? '' : state === 'error' ? 'ankit@@gmail' : 'ankit@gmail.com';
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--pt-bg)', position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0, color: 'var(--pt-forest)' }}>
        <ContourBg opacity={0.05} color="var(--pt-forest)" />
      </div>
      <AuthTicks left={isError ? '01 · ENTER · ERR' : '01 · ENTER'} right="PAWNTRAIL / SIGN IN" />

      <div style={{ position: 'relative', width: 360, padding: '0 8px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <TrailMark size={56} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <div style={{ fontFamily: 'var(--pt-sans)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.15 }}>
            Sign in to PawnTrail
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--pt-serif)', fontStyle: 'italic',
          fontSize: 17, color: 'var(--pt-text-muted)',
          textAlign: 'center', marginBottom: 24, lineHeight: 1.4,
        }}>
          We'll send a magic link to your inbox.<br />
          No passwords, ever.
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            label="EMAIL"
            placeholder="you@example.com"
            value={value}
            error={isError ? "That doesn't look like a valid email." : null}
          />
          <Button
            variant="primary"
            size="lg"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', gap: 10 }}
          >
            {isLoading
              ? <>Sending link <Dots color="var(--pt-cream)" size={3} /></>
              : 'Send magic link'}
          </Button>

          <OrDivider />

          <GoogleButton />
        </div>

        <AuthFooter />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Screen 2 — Check your inbox (sent confirmation)
// ─────────────────────────────────────────────────────────────
const InboxScreen = ({ state = 'sent' }) => {
  // states: sent (with countdown), resent (success toast)
  const isResent = state === 'resent';
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--pt-bg)', position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <ContourBg opacity={0.05} color="var(--pt-forest)" />
      </div>
      <AuthTicks left="02 · WAYPOINT" right="PAWNTRAIL / CHECK INBOX" />

      <div style={{ position: 'relative', width: 380, textAlign: 'center', padding: '0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <InboxGlyph size={64} />
        </div>
        <div style={{ fontFamily: 'var(--pt-sans)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 8 }}>
          Check your inbox
        </div>
        <div style={{
          fontFamily: 'var(--pt-serif)', fontStyle: 'italic',
          fontSize: 17, color: 'var(--pt-text-muted)',
          marginBottom: 8, lineHeight: 1.4,
        }}>
          A sign-in link is on its way to
        </div>
        <div style={{
          fontFamily: 'var(--pt-mono)', fontSize: 14, fontWeight: 500,
          color: 'var(--pt-text)', marginBottom: 28,
          letterSpacing: '0.01em',
        }}>
          ankit<span style={{ color: 'var(--pt-amber)' }}>@</span>gmail.com
        </div>

        {/* Steps card */}
        <div style={{
          background: 'var(--pt-surface)',
          border: '0.5px solid var(--pt-border)',
          borderRadius: 'var(--pt-r-card)',
          padding: '14px 16px',
          textAlign: 'left',
          marginBottom: 20,
        }}>
          {[
            { n: '01', t: 'Open the email from PawnTrail', s: 'Subject: "Your sign-in link"' },
            { n: '02', t: 'Tap "Sign in to PawnTrail"', s: 'Link expires in 15 minutes' },
            { n: '03', t: 'You\'re in', s: 'Same browser, same tab' },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, padding: '10px 0',
              borderTop: i ? '0.5px dashed var(--pt-border)' : 'none',
            }}>
              <span style={{
                fontFamily: 'var(--pt-mono)', fontSize: 11, fontWeight: 500,
                color: 'var(--pt-amber)', letterSpacing: '0.04em',
                paddingTop: 2, flexShrink: 0,
              }}>{s.n}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--pt-text)' }}>{s.t}</div>
                <div style={{ fontSize: 11, color: 'var(--pt-text-dim)', marginTop: 1 }}>{s.s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Resend row */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
          fontSize: 12, color: 'var(--pt-text-muted)',
        }}>
          {isResent
            ? <>
                <span style={{ color: 'var(--pt-good)' }}>✓</span>
                <span>Sent a new link to your inbox.</span>
              </>
            : <>
                <span>Didn't get it? </span>
                <span style={{ fontFamily: 'var(--pt-mono)', color: 'var(--pt-text-dim)' }}>resend in 0:24</span>
              </>}
        </div>
        <div style={{ marginTop: 14 }}>
          <a href="#" onClick={e => e.preventDefault()} style={{
            color: 'var(--pt-text-muted)', fontSize: 12, textDecoration: 'none',
            borderBottom: '0.5px dashed var(--pt-border-strong)', paddingBottom: 1,
          }}>Wrong email? Start over</a>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Screen 3 — Verifying link (loading)
// ─────────────────────────────────────────────────────────────
const VerifyingScreen = () => (
  <div style={{
    width: '100%', height: '100%',
    background: 'var(--pt-bg)', position: 'relative', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{ position: 'absolute', inset: 0 }}>
      <ContourBg opacity={0.05} color="var(--pt-forest)" />
    </div>
    <AuthTicks left="03 · ROUTE" right="PAWNTRAIL / VERIFYING" />

    <div style={{ position: 'relative', width: 320, textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
        <Spinner size={44} stroke={2.4} />
      </div>
      <div style={{ fontFamily: 'var(--pt-sans)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 6 }}>
        Verifying your link
      </div>
      <div style={{
        fontFamily: 'var(--pt-serif)', fontStyle: 'italic',
        fontSize: 16, color: 'var(--pt-text-muted)', lineHeight: 1.4,
      }}>
        Just a moment — we're plotting your route.
      </div>

      {/* Mini trail breadcrumb showing flow position */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
        marginTop: 28,
      }}>
        {[true, true, false].map((done, i) => (
          <React.Fragment key={i}>
            <span style={{
              width: i === 1 ? 8 : 6, height: i === 1 ? 8 : 6, borderRadius: 9999,
              background: done ? 'var(--pt-amber)' : 'var(--pt-border-strong)',
              animation: i === 1 ? 'pt-pulse 1.4s infinite ease-in-out' : 'none',
            }} />
            {i < 2 && <span style={{ width: 18, height: 0.5, background: 'var(--pt-border-strong)' }} />}
          </React.Fragment>
        ))}
      </div>
      <div style={{
        fontFamily: 'var(--pt-mono)', fontSize: 10, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--pt-text-dim)',
        marginTop: 10,
      }}>
        EMAIL · LINK · DASHBOARD
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Screen 4 — Signed in (success)
// ─────────────────────────────────────────────────────────────
const SignedInScreen = () => (
  <div style={{
    width: '100%', height: '100%',
    background: 'var(--pt-bg)', position: 'relative', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{ position: 'absolute', inset: 0 }}>
      <ContourBg opacity={0.05} color="var(--pt-forest)" />
    </div>
    <AuthTicks left="04 · ARRIVED" right="PAWNTRAIL / WELCOME" />

    <div style={{ position: 'relative', width: 340, textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
        <SuccessMark size={64} />
      </div>
      <div style={{ fontFamily: 'var(--pt-sans)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 6 }}>
        You're signed in
      </div>
      <div style={{
        fontFamily: 'var(--pt-serif)', fontStyle: 'italic',
        fontSize: 17, color: 'var(--pt-text-muted)',
        lineHeight: 1.4, marginBottom: 24,
      }}>
        Welcome back, Ankit.<br />
        Taking you to your dashboard…
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
        fontFamily: 'var(--pt-mono)', fontSize: 11, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--pt-text-dim)',
      }}>
        <Dots color="var(--pt-text-dim)" size={3} />
        <span>Redirecting in 2s</span>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Screen 5 — Link expired (error)
// ─────────────────────────────────────────────────────────────
const ExpiredScreen = () => (
  <div style={{
    width: '100%', height: '100%',
    background: 'var(--pt-bg)', position: 'relative', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{ position: 'absolute', inset: 0 }}>
      <ContourBg opacity={0.05} color="var(--pt-forest)" />
    </div>
    <AuthTicks left="03 · OFF-ROUTE" right="PAWNTRAIL / LINK EXPIRED" />

    <div style={{ position: 'relative', width: 360, textAlign: 'center', padding: '0 8px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
        <ExpiredMark size={64} />
      </div>
      <div style={{ fontFamily: 'var(--pt-sans)', fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 8 }}>
        This link has expired
      </div>
      <div style={{
        fontFamily: 'var(--pt-serif)', fontStyle: 'italic',
        fontSize: 16, color: 'var(--pt-text-muted)',
        lineHeight: 1.4, marginBottom: 24,
      }}>
        Magic links last 15 minutes. Trails go cold.<br />
        We'll send you a fresh one.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button variant="primary" size="lg" style={{ width: '100%', justifyContent: 'center' }}>
          Send a new link
        </Button>
        <Button variant="quiet" size="md" style={{ width: '100%', justifyContent: 'center' }}>
          Use a different email
        </Button>
      </div>

      <div style={{
        fontSize: 11, color: 'var(--pt-text-dim)',
        marginTop: 18,
      }}>
        Originally sent to{' '}
        <span style={{ fontFamily: 'var(--pt-mono)', color: 'var(--pt-text-muted)' }}>
          ankit@gmail.com
        </span>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Frame wrappers
// ─────────────────────────────────────────────────────────────

// iOS phone frame, fixed sized for canvas
const PhoneFrame = ({ children, label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
    <CoordLabel>{label}</CoordLabel>
    <div style={{
      width: 320, height: 660,
      borderRadius: 44,
      background: '#0a0a0a',
      padding: 8,
      boxShadow: '0 24px 60px -24px rgba(20,32,26,0.35), 0 2px 0 rgba(20,32,26,0.06)',
      position: 'relative',
    }}>
      <div style={{
        width: '100%', height: '100%',
        borderRadius: 36, overflow: 'hidden',
        position: 'relative', background: 'var(--pt-bg)',
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          width: 96, height: 26, background: '#0a0a0a', borderRadius: 14, zIndex: 5,
        }} />
        {/* Status time */}
        <div style={{
          position: 'absolute', top: 14, left: 24, zIndex: 6,
          fontFamily: '-apple-system, "SF Pro", system-ui', fontSize: 13, fontWeight: 600,
          color: 'var(--pt-text)',
        }}>9:41</div>
        {/* Right status icons */}
        <div style={{
          position: 'absolute', top: 16, right: 22, zIndex: 6,
          display: 'flex', gap: 5, alignItems: 'center', color: 'var(--pt-text)',
        }}>
          <svg width="15" height="10" viewBox="0 0 15 10"><rect x="0" y="6" width="2.5" height="3.5" rx="0.5" fill="currentColor"/><rect x="3.8" y="4" width="2.5" height="5.5" rx="0.5" fill="currentColor"/><rect x="7.6" y="2" width="2.5" height="7.5" rx="0.5" fill="currentColor"/><rect x="11.4" y="0" width="2.5" height="9.5" rx="0.5" fill="currentColor"/></svg>
          <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="19" height="10" rx="2.5" stroke="currentColor" strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="16" height="7" rx="1.5" fill="currentColor"/><path d="M21 4V7c.6-.2 1-.7 1-1.5S21.6 4.2 21 4Z" fill="currentColor" fillOpacity="0.5"/></svg>
        </div>
        {/* Content with top + bottom safe areas */}
        <div style={{ position: 'absolute', inset: 0, paddingTop: 44, paddingBottom: 24 }}>
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            {children}
          </div>
        </div>
        {/* Home indicator */}
        <div style={{
          position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
          width: 110, height: 4, background: 'var(--pt-text)', opacity: 0.4, borderRadius: 9999, zIndex: 6,
        }} />
      </div>
    </div>
  </div>
);

// Desktop browser frame — minimal Chrome chrome on light theme
const DesktopFrame = ({ children, label, url = 'pawntrail.com/sign-in', width = 880, height = 580 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
    <CoordLabel>{label}</CoordLabel>
    <div style={{
      width, height,
      borderRadius: 'var(--pt-r-frame)',
      background: '#e7e4dd',
      border: '0.5px solid rgba(20,32,26,0.18)',
      boxShadow: '0 24px 60px -24px rgba(20,32,26,0.3), 0 2px 0 rgba(20,32,26,0.04)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Chrome bar */}
      <div style={{
        height: 36, padding: '0 14px',
        display: 'flex', alignItems: 'center', gap: 14,
        borderBottom: '0.5px solid rgba(20,32,26,0.12)',
        background: '#efebe2',
      }}>
        <div style={{ display: 'flex', gap: 7 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <div style={{
          flex: 1, maxWidth: 460, height: 22, margin: '0 auto',
          background: '#fbf9f3',
          border: '0.5px solid rgba(20,32,26,0.14)',
          borderRadius: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontFamily: 'var(--pt-sans)', fontSize: 11, color: 'rgba(20,32,26,0.65)',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M3 4V3a2 2 0 0 1 4 0v1M2 4h6v5H2z" fill="none" stroke="currentColor" strokeWidth="0.8" /></svg>
          {url}
        </div>
        <div style={{ width: 56 }} />
      </div>
      {/* Page */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  </div>
);

Object.assign(window, {
  SignInScreen, InboxScreen, VerifyingScreen, SignedInScreen, ExpiredScreen,
  PhoneFrame, DesktopFrame,
});
