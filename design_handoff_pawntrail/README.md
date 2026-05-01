# Handoff: PawnTrail Design System

## Overview
PawnTrail is a chess scoresheet → PGN tool. The brand DNA is **cartographic**: every game is a route, every move a step on a trail. This package contains the foundations + core UI components needed to build any PawnTrail surface (marketing, app, onboarding, paywall).

This v1 covers **foundations + core UI + layout shells + marketing**. Chess-specific components (board, eval bar, move list, engine panel) are intentionally out of scope for this handoff.

## About the Design Files
The files in `prototype/` are **design references created in HTML** — prototypes showing intended look and behavior, **not production code to copy directly**. Recreate these designs in your codebase's existing environment (React, Vue, SwiftUI, Tailwind, etc.) using its established patterns and libraries. If no environment exists yet, choose the most appropriate framework for the project and implement the designs there.

The HTML uses inline JSX + Babel-in-the-browser purely for prototyping speed. In production you'd extract these into proper components.

## Fidelity
**High-fidelity.** Pixel-perfect mockups with final colors, typography, spacing, and interactions. Recreate the UI faithfully using your codebase's existing libraries — but the token values (hex codes, font sizes, spacing scale, radii) should be transferred exactly.

---

## Design Tokens

All tokens live in `prototype/tokens.css` as CSS custom properties under `:root` and theme variants (`[data-theme="..."]`). Replicate this token system in your codebase (Tailwind config, CSS variables, design-token JSON, etc.).

### Brand ramp (semantic primaries)
| Name | Hex | Token | Role |
|---|---|---|---|
| Forest | `#1F3A2E` | `--pt-forest` | Primary brand, dark CTAs, sidebar accent |
| Forest soft | `#556B5F` | `--pt-forest-soft` | Hover state, dark squares |
| Forest deep | `#16291F` | `--pt-forest-deep` | Forest border, pressed state |
| Cream | `#F4EDDC` | `--pt-cream` | Default page background (light theme) |
| Cream soft | `#EBE2CE` | `--pt-cream-soft` | Surface elevation |
| Cream deep | `#DDD2B8` | `--pt-cream-deep` | "Sand" CTA card background |
| Amber | `#C77F3A` | `--pt-amber` | Single accent · primary CTA |
| Amber soft | `#E0A261` | `--pt-amber-soft` | Amber hover |
| Amber deep | `#A66428` | `--pt-amber-deep` | Amber border, pressed state |
| Ink | `#14201A` | `--pt-ink` | Text on light, background on dark |

**Rule:** Forest is primary. Amber is the **single** accent — one amber CTA per screen. No other hues.

### Move classification (chess-only, but reusable as semantic states)
| Name | Hex | Token |
|---|---|---|
| Book | `#6B7C72` | `--pt-book` |
| Good (success) | `#2E7D5C` | `--pt-good` |
| Inaccuracy (warning) | `#D9A04A` | `--pt-inaccuracy` |
| Mistake | `#C77F3A` | `--pt-mistake` |
| Blunder (error) | `#A94F24` | `--pt-blunder` |

### Semantic surface tokens (light theme — `cream`)
| Token | Value | Use |
|---|---|---|
| `--pt-bg` | `#F4EDDC` | Page background |
| `--pt-bg-elev` | `rgba(20, 32, 26, 0.035)` | Subtle elevation tint |
| `--pt-bg-sunken` | `rgba(20, 32, 26, 0.05)` | Inset panels |
| `--pt-surface` | `#FBF7EA` | Card background |
| `--pt-border` | `rgba(20, 32, 26, 0.14)` | Default hairline border |
| `--pt-border-strong` | `rgba(20, 32, 26, 0.26)` | Emphasis borders, inputs |
| `--pt-text` | `#14201A` | Primary text |
| `--pt-text-muted` | `rgba(20, 32, 26, 0.65)` | Secondary text |
| `--pt-text-dim` | `rgba(20, 32, 26, 0.45)` | Tertiary, captions |

### Theme variants
The system ships with 9 palettes. Each is a `[data-theme="..."]` block in `tokens.css` overriding the same semantic tokens:

**Light themes**
- `light` (default) — warm cream
- `paper` — neutral, less yellow (`#F5F4F0`)
- `sage` — soft forest-soft tinted (`#E4E8E2`)
- `moss` — deeper green-grey (`#C9D2C5`)
- `mint` — fresh pale green (`#EAEFE6`)

**Dark themes**
- `dark` — deep forest (`#14201A`)
- `slate` — cool neutral grey (`#14181C`)
- `midnight` — near-black (`#0E1014`)
- `oxblood` — deep aubergine (`#1A1216`)

Switch themes via `<html data-theme="paper">` etc.

### Typography
Three families. Loaded via Google Fonts in `tokens.css`.

| Family | CSS var | Use |
|---|---|---|
| Work Sans (400, 500, 600) | `--pt-sans` | UI surface — buttons, body, navigation, headings |
| Instrument Serif (italic only) | `--pt-serif` | Taglines, pull quotes. **Italic only. Never body. Never UI.** |
| IBM Plex Mono (400, 500, 600) | `--pt-mono` | Eval numbers, coordinates, micro labels, code |

#### Type scale
Utility classes in `tokens.css`:

| Class | Size / line | Weight | Letter-spacing |
|---|---|---|---|
| `.pt-display` | 28 / 34 | 500 | -0.01em |
| `.pt-h2` | 20 / 28 | 500 | -0.005em |
| `.pt-h3` | 16 / 22 | 500 | 0 |
| `.pt-body` | 14 / 22 | 400 | 0 |
| `.pt-small` | 12 / 18 | 400 | 0 |
| `.pt-micro` | 10 / 14 | 500 mono | **0.12em, UPPERCASE** |

Marketing hero uses 56px Work Sans 500, letter-spacing `-0.02em`.

### Spacing — 8-pt grid (with 4-pt steps for dense UIs)
`4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96`. Use these tokens; nothing in between.

### Radii
| Token | Value | Use |
|---|---|---|
| `--pt-r-chip` | 4px | Chips, badges |
| `--pt-r-card` | 6px | Cards, buttons, inputs |
| `--pt-r-lg` | 8px | Large cards |
| `--pt-r-frame` | 12px | Modal frames, app shell border |
| `--pt-r-pill` | 9999px | Pills, avatars, toggles |

### Borders
- **Default**: `0.5px solid var(--pt-border)` — hairline
- **Strong**: `0.5px solid var(--pt-border-strong)` — inputs, emphasis
- **Contour**: `0.5px dashed var(--pt-border-strong)` — cartographic frame, decorative

Always `0.5px`. The hairline is core to the cartographic feel.

### Shadows
| Token | Value |
|---|---|
| `--pt-shadow-card` | `0 1px 0 rgba(20,32,26,0.04), 0 8px 24px -16px rgba(20,32,26,0.18)` |
| `--pt-shadow-pop` | `0 1px 0 rgba(20,32,26,0.04), 0 16px 40px -20px rgba(20,32,26,0.28)` |

Soft, never glossy.

---

## Components

Each component is a React functional component in `prototype/components.jsx`. Recreate equivalents in your framework.

### Button — `<Button variant size icon trailing disabled>`
- **Variants**: `primary` (amber bg, cream text), `secondary` (forest bg, cream text), `ghost` (transparent, strong border), `quiet` (transparent, no border, muted text), `danger` (transparent, blunder-colored)
- **Sizes**: `sm` (28px), `md` (36px default), `lg` (44px)
- Padding: `12 / 16 / 20px` horizontal
- Font: Work Sans 500 · 12 / 14 / 14 px · letter-spacing 0.01em
- Radius: `--pt-r-card` (6px)
- Gap between icon/label/trailing: 8px
- Disabled: opacity 0.5
- **Rule**: one `primary` (amber) button per screen — it's the single conversion path

### Input — `<Input label prefix suffix value onChange error hint mono>`
- Height 36px, padding `0 12px`
- Background `--pt-surface`, border `1px solid --pt-border-strong`
- Error state: border `--pt-blunder`, hint text below in same color
- Label is a `.pt-micro` (10px mono uppercase) above the field
- `prefix`/`suffix` are inline strings (e.g. `+91`, `@`, `✓`) in `--pt-text-muted`
- `mono` prop switches input font to IBM Plex Mono (for phone, codes, eval)

### Chip — `<Chip active onClick icon trailing tone size>`
- Pill-shaped (`--pt-r-pill`), 26px height (22px for `sm`), padding `0 10px`
- Tones: `default` (uses bg-elev / forest when active), `amber` (rust-tinted), `forest` (green-tinted)
- Active state: `--pt-forest` background, `--pt-cream` text
- Use as filter chips above tables, segmented choice surfaces, dropdown triggers (with `▾` trailing)

### Badge — `<Badge tone mono>`
- 20px height, `--pt-r-chip` (4px) radius, padding `0 8px`
- Tones: `default`, `forest`, `amber`, `win` (green-tinted), `loss` (rust-tinted), `draw` (neutral)
- Font: 11px, weight 500, letter-spacing 0.02em — mono with `mono` prop
- Use for: result tags (WIN/LOSS/DRAW), opening codes (E21), tier flags (PRO)

### Card — `<Card label title accent="forest|amber|sand|none" framed padding>`
- Default: `--pt-surface` bg, `0.5px solid --pt-border`, radius 6px, padding 20px
- `framed` adds `--pt-border-strong` instead
- `accent` swaps to filled card: `forest` (green/cream), `amber` (rust/cream), `sand` (`--pt-cream-deep`/ink) — sand is the warmest CTA card
- `label` is rendered as `.pt-micro` above content
- `title` is rendered as `.pt-h2`
- Always carries `--pt-shadow-card`

### Toggle — `<Toggle checked onChange label>`
- 32×18 pill track, 14px thumb
- Off: `--pt-border-strong` track. On: `--pt-forest` track. Thumb: `--pt-cream`
- Animates on `background` and `left` over 160ms

### SegControl — `<SegControl options value onChange size>`
- Inline-flex, 2px padding inside `--pt-bg-elev` track with hairline border, 6px outer radius
- Active segment: `--pt-surface` bg with strong border, faint shadow
- Inactive: transparent, muted text

### Avatar — `<Avatar name size tone>`
- Circle, initials only (max 2 chars)
- Tones: `forest` (default) or `amber`. Cream text. IBM Plex Mono 600.
- Sizes: 22 (table row), 28 (default), 36, 48

### CoordLabel — `<CoordLabel>03 · TRAIL</CoordLabel>`
- The cartographic micro-tick. 10px IBM Plex Mono 500, 0.12em tracking, UPPERCASE, `--pt-text-dim`
- Used as quiet metadata everywhere — section markers, top-right of frames, breadcrumb supplements

### TweaksPanel
Floating dev/design panel for runtime token swaps. Not a production component — strip it from real builds. See `prototype/tweaks-panel.jsx`.

---

## Brand Assets

Located in `prototype/assets/`.

| File | Purpose |
|---|---|
| `trail-mark.png` | Master logo — multi-leg dotted trail, anchor + waypoint + amber terminus |
| `trail-lockup.png` | Horizontal wordmark lockup (mark + "pawntrail.") |
| `trail-favicon-256.png` | App icon — single L-bend trail (dots collapse at favicon size) |
| `trail-favicon-512.png` | App icon, larger |
| `trail-concept-card.png` | Brand concept reference |

The mark is also reproducible as inline SVG — see `<TrailMark>`, `<TrailGlyph>`, `<TrailLockup>` in `prototype/brand.jsx`. Use SVG when you need theme-aware coloring; use PNG for marketing exports and OS-level app icons.

### Cartographic motifs
- **TrailLine** (`brand.jsx`) — decorative dotted L-bend with amber endpoint. Use sparingly, one per surface.
- **ContourBg** (`brand.jsx`) — faint topographic SVG lines. Reserved for marketing hero, paywall background. Opacity ≤ 0.18.
- **Corner ticks** — `.pt-corners` utility in `tokens.css` adds 14px L-brackets at four corners of an element. Map-margin treatment for hero panels and section breaks.
- **Coord labels** — see CoordLabel above.

---

## Layouts / Screens

### App shell — `<AppShell sidebar topbar children>`
- 220px sidebar (`--pt-surface` bg, hairline right border)
  - Logo lockup (22px) at top
  - "NAVIGATE" micro label above nav list
  - Nav items: 8/12 padding, 6px radius. Active item: `--pt-bg-elev` background, 2px amber bar at left, amber icon
  - **Quota meter** pinned at bottom: micro label + 4px progress bar (amber fill) + "Upgrade to Pro →" link
- 56px topbar (page bg, hairline bottom border)
  - Left: optional breadcrumb (micro) + page title (15px Work Sans 500)
  - Right: action buttons (gap 8px)
- Main scroll region: padding 24px

### Sign-in screen
- Full-bleed framed surface (`--pt-r-frame` 12px, `--pt-border-strong`)
- Faint ContourBg in background (opacity 0.06, forest)
- Top-left: CoordLabel "02 · ENTER". Top-right: CoordLabel "PAWNTRAIL / SIGN IN"
- Center: 64px TrailMark, "Welcome back" (26px Work Sans 500), italic serif tagline ("Snap the scoresheet. Chart the trail."), phone input (mono, +91 prefix), full-width primary button
- Footer: 11px terms text in `--pt-text-dim`

### Paywall modal
- Backdrop: `rgba(20,32,26,0.45)`
- Modal: 540px wide, framed Card, 32px padding
- Top-left: CoordLabel "15 / 15" (quota used)
- Center: 48px TrailMark, "You've scanned 15 games — nice work." display, italic serif subtitle
- Two-column pricing grid:
  - Monthly: 16px padding, strong border. `$4.99/mo`. Ghost button.
  - Yearly: 16px padding, **1px amber border**, `rgba(199,127,58,0.08)` tint. `$39/yr`. Amber primary button. "34% OFF" amber badge floating top-right
- "Not now" muted link below

### Marketing hero
- Centered, max-width 760px
- ContourBg at opacity 0.06 across hero background
- Two CoordLabel ticks at top corners ("01 · MARK" / "PAWNTRAIL / CARTOGRAPHIC PRECISION")
- 56px TrailMark above heading
- H1: 56px Work Sans 500, letter-spacing -0.02em, two lines — second line in `--pt-amber`
- Subtitle: 22px Instrument Serif italic in `--pt-text-muted`
- Primary CTA below
- Decorative TrailLine bottom-right at opacity 0.7
- Below hero: 3-column FeatureRow (each: CoordLabel tag, 22px H3, body paragraph in muted text)

---

## Interactions & Behavior

- **Hover**: buttons + chips lighten via `transition: all 120ms ease`. Don't transform position.
- **Focus**: rely on platform default outline (we don't override focus rings)
- **Disabled**: opacity 0.5, `cursor: not-allowed`
- **Toggle / SegControl** animate over 160ms
- **Theme switching** is instant — just swap `data-theme` on `<html>`
- **Reduce-motion**: respect `prefers-reduced-motion` — drop the 120/160ms transitions entirely

---

## Files in this handoff

```
design_handoff_pawntrail/
├── README.md                        ← this file
└── prototype/
    ├── PawnTrail Design System.html ← entry point — open in browser
    ├── tokens.css                   ← all tokens + 9 themes + utility classes
    ├── brand.jsx                    ← TrailMark, TrailGlyph, TrailLockup, ContourBg, TrailLine
    ├── components.jsx               ← Button, Input, Chip, Badge, Card, Toggle, SegControl, Avatar, CoordLabel
    ├── layouts.jsx                  ← Sidebar, Topbar, AppShell, MarketingNav, MarketingHero, FeatureRow
    ├── app.jsx                      ← canvas composition (demo only — strip for production)
    ├── design-canvas.jsx            ← presentation harness (strip for production)
    ├── tweaks-panel.jsx             ← runtime tweak panel (strip for production)
    └── assets/
        ├── trail-mark.png
        ├── trail-lockup.png
        ├── trail-favicon-256.png
        ├── trail-favicon-512.png
        └── trail-concept-card.png
```

To preview: open `prototype/PawnTrail Design System.html` in any browser. No build step required.

## Implementation checklist for the developer

1. Port `tokens.css` to your token system (CSS variables, Tailwind config, JSON tokens — whatever your codebase uses). Keep the 9 theme variants if multi-theme support matters; otherwise pick one and inline.
2. Load the three Google Fonts (Work Sans 400/500/600, Instrument Serif italic, IBM Plex Mono 400/500/600).
3. Recreate the components in `components.jsx` using your framework's primitives. Match the exact heights, paddings, radii, and font specs above.
4. Recreate the layout shells. App shell scaffolding is the most reusable.
5. Use the SVG marks from `brand.jsx` directly, or export them. PNG fallbacks live in `assets/`.
6. Strip `tweaks-panel.jsx`, `design-canvas.jsx`, and `app.jsx` — those are prototype-only.
7. Honor the brand rules: one amber CTA per screen, italic serif sparingly, hairline (0.5px) borders, mono for data.
