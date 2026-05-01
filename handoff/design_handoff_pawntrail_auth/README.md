# Handoff: PawnTrail — Email Auth Flow (Magic Link)

## Overview
Email-based authentication for PawnTrail using **magic links** (no password) with **Google OAuth** as a one-tap alternative. Five distinct screens covering the full happy path plus error/loading/recovery states. Mobile (iOS) and desktop (browser) layouts use the same screen components — they're already responsive.

This handoff builds on the **PawnTrail Design System** handoff. Tokens, fonts, and base components (Button, Input, CoordLabel, ContourBg, TrailMark) come from there. If you don't already have that handoff in your codebase, pull it in first — this package only contains the auth-specific additions.

## About the Design Files
The files in `prototype/` are **design references created in HTML** — prototypes showing intended look and behavior, **not production code to copy directly**. Recreate these designs in your codebase's existing environment (React, Vue, Next.js, SwiftUI, etc.) using its established patterns, routing, and auth library (NextAuth, Clerk, Supabase Auth, Auth0, Firebase Auth — whichever the project uses). If no environment exists yet, choose the most appropriate framework.

## Fidelity
**High-fidelity.** Pixel-perfect mockups with final colors, typography, spacing, and copy. Match exactly.

---

## Screens

The flow has five **distinct screens**. Three of them have multiple states.

```
┌────────────────────┐    submit    ┌─────────────────────┐    click link   ┌──────────────────┐
│ 01  Enter email    │─────────────▶│ 02  Check inbox     │────────────────▶│ 03  Verifying    │
│                    │              │                     │                 │                  │
│ states:            │              │ states:             │                 │ (loading only)   │
│ • empty            │              │ • sent + countdown  │                 └────────┬─────────┘
│ • invalid (error)  │              │ • resent (toast)    │                          │
│ • sending (loading)│              │                     │                          ▼
└────────────────────┘              └─────────────────────┘                 ┌──────────────────┐
                                                                            │ 04  Signed in    │
                                              ▲                             │  → redirect      │
                                              │                             └──────────────────┘
                                    ┌─────────┴───────────┐
                                    │ 05  Link expired    │
                                    │  → resend           │
                                    └─────────────────────┘
```

---

### Screen 01 — Enter email

**Purpose**: First touch. User types their email; we send a magic link or hand off to Google.

**Layout** (both mobile + desktop)
- Centered column, max-width 360px (mobile) / same 360px content centered in desktop viewport
- Faint `ContourBg` (forest, opacity 0.05) covers the full background
- Top-left CoordLabel `01 · ENTER` (or `01 · ENTER · ERR` when in error state)
- Top-right CoordLabel `PAWNTRAIL / SIGN IN`
- Vertical stack:
  1. `<TrailMark size={56}>` — centered
  2. H1 "Sign in to PawnTrail" — Work Sans 500, 26px, letter-spacing -0.01em
  3. Italic serif subtitle — Instrument Serif italic, 17px, muted color, two lines:
     - "We'll send a magic link to your inbox."
     - "No passwords, ever."
  4. Email `<Input label="EMAIL" placeholder="you@example.com">`
  5. Primary button — full width, lg size — "Send magic link"
  6. Divider with mono "OR" label, hairline borders on both sides
  7. Google button (full width, lg)
  8. Footer micro: "By continuing you agree to the Terms · Privacy"

**States**
| State | Input value | Button label | Button disabled | Error shown |
|---|---|---|---|---|
| `empty` | "" | "Send magic link" | no | no |
| `invalid` | "ankit@@gmail" | "Send magic link" | no | "That doesn't look like a valid email." (red, below input) |
| `loading` | "ankit@gmail.com" | "Sending link" + 3-dot pulse | yes (50% opacity) | no |

**Validation**
- Trigger on submit, not on blur (less twitchy)
- Standard RFC 5322 simplified regex is fine; reject obvious malformed input
- On valid submit → fire send-link API → show `loading` state → on success, route to Screen 02. On API error, show error inline using same error treatment.

**Google button**
- Same height as primary button (44px / lg)
- Background `--pt-surface`, border `--pt-border-strong`
- 16px Google G (4-color official) on the left, 10px gap, "Continue with Google" label
- On click → start standard Google OAuth flow → on return, skip the email screens entirely and land on Screen 04 logic (or wherever your authenticated home is)

---

### Screen 02 — Check inbox

**Purpose**: Confirm we sent the link. Reduce confused emails to support.

**Layout**
- Centered column, max-width 380px
- `02 · WAYPOINT` / `PAWNTRAIL / CHECK INBOX` ticks
- Vertical stack:
  1. `<InboxGlyph size={64}>` — custom envelope with dotted-trail underneath ending in amber dot (see `auth-screens.jsx`)
  2. H1 "Check your inbox"
  3. Italic serif: "A sign-in link is on its way to"
  4. Mono email line: `ankit@gmail.com` — the `@` is rendered in `--pt-amber` for a small brand pop. Use the user's actual submitted email here, **not masked**.
  5. **Steps card** — surface bg, hairline border, 6px radius, 14×16 padding. Three rows separated by dashed hairlines:
     - `01` — Open the email from PawnTrail · Subject: "Your sign-in link"
     - `02` — Tap "Sign in to PawnTrail" · Link expires in 15 minutes
     - `03` — You're in · Same browser, same tab
     - Step number is mono 11px amber; title is sans 13px 500; subtitle is 11px dim
  6. Resend row (12px muted): "Didn't get it? `resend in 0:24`" where the timer is mono dim
  7. "Wrong email? Start over" link below — dashed underline

**States**
| State | Resend row content |
|---|---|
| `sent` | "Didn't get it? resend in 0:24" (the timer counts down from 30s in mono) |
| `resent` | "✓ Sent a new link to your inbox." (check is `--pt-good` green) |

**Behavior**
- Countdown starts at 30s (or whatever rate-limit window your backend enforces). When it hits 0, "resend in 0:00" becomes a clickable "Resend link" affordance.
- Click resend → fire send-link API again → flip to `resent` state for ~3s → reset countdown.
- "Wrong email? Start over" → route back to Screen 01 with the field cleared.
- **Session lifecycle**: this screen is also where users wait — when the magic link is clicked in another tab/device, the original tab can listen on a websocket or poll for session creation and auto-advance. Not strictly required for v1, but worth wiring.

---

### Screen 03 — Verifying link (loading)

**Purpose**: Brief loading state shown when the user clicks the magic link from their email and lands on `/auth/verify?t=…`.

**Layout**
- Centered, max-width 320px
- `03 · ROUTE` / `PAWNTRAIL / VERIFYING` ticks
- Vertical stack:
  1. `<Spinner size={44}>` — amber arc on `--pt-border-strong` track, 1s linear rotation
  2. H1 "Verifying your link" (22px)
  3. Italic serif: "Just a moment — we're plotting your route."
  4. **Mini trail breadcrumb** — three dots connected by 18px hairlines. First two dots are amber filled (done), third is `--pt-border-strong` (pending). Middle dot pulses (1.4s ease-in-out, scale 1 → 1.4, opacity 1 → 0.6).
  5. Mono caption: `EMAIL · LINK · DASHBOARD`

**Behavior**
- Show this screen while validating the magic-link token server-side
- On success → Screen 04
- On invalid/expired token → Screen 05
- Should resolve in <2s typically; if it's faster than 400ms you can skip showing it (avoid flash). If longer than 8s, show a fallback "Still working…" line.

---

### Screen 04 — Signed in (success)

**Purpose**: Brief success confirmation before redirect. Reduces "did it work?" anxiety.

**Layout**
- Centered, max-width 340px
- `04 · ARRIVED` / `PAWNTRAIL / WELCOME` ticks
- Vertical stack:
  1. `<SuccessMark size={64}>` — forest disc with cream check (drawn path, not unicode)
  2. H1 "You're signed in" (26px)
  3. Italic serif (two lines): "Welcome back, Ankit." / "Taking you to your dashboard…"
  4. Mono caption with 3-dot pulse: `… Redirecting in 2s`

**Behavior**
- Auto-redirect to `/dashboard` (or wherever your authenticated home lives) after 1.5–2s
- If user has never completed onboarding, route to onboarding instead
- Use `Ankit` placeholder only as fallback; substitute the user's real first name from their profile.

---

### Screen 05 — Link expired (error)

**Purpose**: Recover from expired/invalid magic link without dumping the user back to square one.

**Layout**
- Centered, max-width 360px
- `03 · OFF-ROUTE` / `PAWNTRAIL / LINK EXPIRED` ticks
- Vertical stack:
  1. `<ExpiredMark size={64}>` — dashed amber-deep ring + exclamation
  2. H1 "This link has expired" (24px)
  3. Italic serif (two lines): "Magic links last 15 minutes. Trails go cold." / "We'll send you a fresh one."
  4. Primary button (full width, lg): "Send a new link"
  5. Quiet button (full width, md): "Use a different email"
  6. Footer micro: "Originally sent to `ankit@gmail.com`"

**Behavior**
- "Send a new link" → fire send-link API with the cached email → route to Screen 02 in `resent` state. The original email survives in the URL state or session storage so we don't ask again.
- "Use a different email" → route to Screen 01 with field cleared.
- Reach this screen via `/auth/expired?email=…` or any token-validation failure (expired, already-used, malformed, signature mismatch — collapse them all to this one error).

---

## Interactions & Behavior

### Animations / motion
| Animation | Use | Spec |
|---|---|---|
| `pt-dotpulse` | 3-dot loading rows in buttons + redirect caption | 1.1s infinite ease-in-out, 0.15s stagger, opacity 0.25→1, scale 0.85→1 |
| `pt-spin` | Spinner ring | 1s linear infinite, full rotation |
| `pt-pulse` | Middle breadcrumb dot on Verifying | 1.4s infinite ease-in-out, scale 1→1.4, opacity 1→0.6 |
| Button transitions | All buttons | `all 120ms ease` |

Honor `prefers-reduced-motion` — drop the pulse + spin animations entirely (replace with static states), keep the 120ms transitions out.

### Keyboard
- Email field gets focus on Screen 01 mount
- Enter submits the form when valid
- Esc on Screen 02 routes back to Screen 01 (acts as "Wrong email")
- Tab order: email → primary button → Google button → terms links

### Routing (suggested URLs)
| Screen | URL |
|---|---|
| 01 | `/sign-in` |
| 02 | `/sign-in/sent` (carries email in querystring or session) |
| 03 | `/auth/verify?t=<token>` |
| 04 | `/auth/welcome` (transient — redirect away after 2s) |
| 05 | `/auth/expired` |

### Error handling beyond shown states
- **Network error sending link** → reuse the inline error treatment from Screen 01 invalid state, message "Couldn't send right now. Try again." Keep the email value in the field.
- **Rate limited (too many sends)** → swap the resend countdown on Screen 02 to "Try again in X:XX" with a longer interval (e.g. 5min).
- **Account does not exist** → for sign-in only flows, decide your policy. We recommend: send the magic link anyway (don't reveal account existence), and the link itself routes to a "Create account?" confirmation page on click.

---

## Components Introduced

These are net-new for the auth flow (not in the design system handoff). They're in `prototype/auth-screens.jsx`.

| Component | Purpose |
|---|---|
| `GoogleG` | Inline 4-color Google logo SVG (use the official multi-path version, **not** a single-color recolor) |
| `Dots` | 3-dot pulse loading row — used inline in buttons and captions |
| `Spinner` | 1s rotating arc, amber over neutral track |
| `SuccessMark` | Forest disc + cream checkmark, drawn (not unicode) |
| `ExpiredMark` | Dashed amber-deep ring + warning glyph |
| `InboxGlyph` | Envelope outline with dotted-trail "delivery path" ending in amber terminus — cartographic motif tying back to brand |
| `GoogleButton` | Same dimensions as `<Button size="lg">` but surface bg + Google G + label |
| `OrDivider` | Hairline–MONO–hairline horizontal rule |
| `AuthFooter` | Terms · Privacy footer block |
| `AuthTicks` | Two CoordLabels positioned absolute top-left/right |

The PhoneFrame and DesktopFrame in the prototype are presentation chrome only — they exist so you can see how the screens sit on each surface. **Don't ship them.** Your screens render directly into your app's auth route shell.

---

## Design Tokens Used

All tokens are inherited from `tokens.css` (`paper` theme is the source of truth for this brief; tokens are theme-agnostic):

- **Background**: `--pt-bg` (#F5F4F0)
- **Surface (cards, inputs)**: `--pt-surface` (#FAFAF7)
- **Text primary**: `--pt-text` (#1A1F1B)
- **Text muted**: `--pt-text-muted` (italic serif copy)
- **Text dim**: `--pt-text-dim` (footer legal, mono captions)
- **Border**: `--pt-border` (hairline dividers, step card)
- **Border strong**: `--pt-border-strong` (input borders, breadcrumb track, divider)
- **Brand**: `--pt-forest` (success disc), `--pt-amber` (CTAs, accents, the `@`), `--pt-amber-deep` (expired ring)
- **Semantic**: `--pt-good` (resent toast check), `--pt-blunder` (error border + helper text — already wired into `<Input error>`)

Type/radii/shadow specs all reuse the design system tokens. Nothing new.

---

## Files

```
design_handoff_pawntrail_auth/
├── README.md                          ← this file
└── prototype/
    ├── PawnTrail Auth Flow.html       ← entry point — open in browser
    ├── auth-screens.jsx               ← all five screens + helpers (GoogleG, Spinner, etc.)
    ├── auth-app.jsx                   ← canvas composition (PROTOTYPE ONLY — strip)
    │
    │  ↓ Reused from the design system handoff:
    ├── tokens.css                     ← tokens + paper theme
    ├── brand.jsx                      ← TrailMark, ContourBg, CoordLabel, etc.
    ├── components.jsx                 ← Button, Input
    ├── design-canvas.jsx              ← prototype harness (strip)
    ├── tweaks-panel.jsx               ← prototype-only (strip)
    └── assets/                        ← favicons, marks
```

Open `prototype/PawnTrail Auth Flow.html` to see all screens side-by-side on a design canvas. Click any artboard's expand icon to view a single state fullscreen.

## Implementation checklist

1. Confirm tokens + base components are in your codebase (from the design system handoff).
2. Pick your auth provider integration point — most magic-link providers (NextAuth Email provider, Supabase Auth, Clerk, custom) hand you `sendMagicLink(email)` + a token-verification endpoint.
3. Build Screen 01 first — it's the most reused. Wire submit → provider → loading state → route to 02.
4. Build Screen 02 with the countdown timer (`useEffect` + `setInterval`, decrement every second, swap to clickable resend at 0).
5. Build Screen 03 — mount it on the verify route, run token verification on mount, route to 04 or 05 based on result.
6. Build Screens 04 + 05.
7. Wire Google OAuth button to your provider's Google flow. On callback, route directly to authenticated home (skip 02–04 entirely — Google doesn't need them).
8. Add the three `@keyframes` (dotpulse, spin, pulse) to your global CSS. Honor `prefers-reduced-motion`.
9. Confirm responsive behavior: the screens are content-centered with max-width 320–380px — they look identical on phone and desktop, no separate breakpoints needed beyond the parent route container.
