# Handoff: PawnTrail — PGN Review Screen

## Overview

The PGN Review Screen is the core correction surface in PawnTrail. After a user uploads a handwritten scoresheet (OCR pipeline) or pastes a PGN, this screen lets them step through the parsed game, review low-confidence moves the system flagged, accept engine-suggested corrections, and see positional analysis (eval bar + top engine lines) for every ply.

The screen ships in two layouts:

- **Desktop** — board + eval bar on the left, move list + engine panel + scoresheet thumbnail on the right, sticky playback bar at the bottom.
- **Mobile (iOS)** — board on top, horizontal swipeable move rail, bottom sheet that swaps between resting move-detail view and an active correction picker.

## About the Design Files

The files in this bundle are **design references created in HTML** — interactive prototypes built with React + Babel inline, demonstrating intended look and behavior. They are **not production code to copy directly**. The task is to recreate these designs in the target codebase's existing environment (React, Vue, SwiftUI, native iOS, etc.) using its established patterns, component library, and state management.

If no environment exists yet, recreate them in whatever framework best fits the project. The layout, tokens, copy, and interaction model documented below are the source of truth — the JSX files are how those decisions were made tangible.

## Fidelity

**High-fidelity.** All colors, type, spacing, radii, shadows, classification semantics, and interactions are final and should be matched precisely. The eval-bar mapping curve, the popover anchoring rules, and the move-classification color palette are all design intent, not placeholder.

The board piece rendering uses Unicode chess glyphs at small sizes for legibility — production may swap in SVG piece sets (e.g. cburnett, merida) if the target codebase already has them. Match silhouettes; don't switch styles per board.

---

## Screens / Views

### 1. Desktop · Review screen

**Frame:** 1240 × 820 inside a Chrome-style browser window.

**Layout (top → bottom):**

1. **Game header** — `var(--pt-surface)` strip, 1px bottom border (`var(--pt-border)`), 14px 24px padding.
   - PawnTrail lockup (24px logo) · vertical divider · player names (`White vs Black` in 14px sans, "vs" in `--pt-text-dim`) · opening + ECO + date in micro mono.
   - Right side: dirty-state badge (`UNSAVED` amber when any edits, `CLEAN` muted otherwise) · `Discard` ghost button · `Save game` primary button (amber).

2. **Main grid** — `grid-template-columns: 1fr 400px`. Left column = board, right column = move list / engine / scoresheet / captured tray. 1px vertical border between them.

   **Left column (board):**
   - Vertically centered, 24px padding, 16px gap.
   - Top metadata row: black player avatar (forest tone, 26px) + name + captured-piece glyphs aligned right.
   - Board surface: 460×460, 0.5px border `--pt-border-strong`, radius `--pt-r-card` (6px), shadow `--pt-shadow-card`.
   - **Eval bar** sits to the left of the board, 18px wide × 460px tall, gap 12px. Vertical fill: white from bottom, black from top, mapped via `0.5 + 0.5 * tanh(cp / 250)` clamped to `[0.04, 0.96]`. Score label printed in 9px mono on whichever side has more room (top if `cp >= 0`, bottom otherwise). 240ms ease transition on fill height.
   - Bottom metadata row: white player avatar (amber tone) + name.

   **Right column:**
   - **Tab strip** (10px 14px padding, `--pt-surface` bg, 1px bottom border): `SegControl` size sm with `Moves / PGN / Headers`. Right-aligned `pt-micro` showing total ply count.
   - **Move list** (flex 1, scrollable, 6px 8px padding):
     - Rows of `[number | white move | black move]` in a `32px 1fr 1fr` grid.
     - Each row 32px min-height, 0.5px dashed bottom border `--pt-border`, hover/active row gets `--pt-bg-elev` background.
     - Move number: 11px mono, `--pt-text-dim`, letter-spacing 0.04em.
     - Move chips: 26px tall, mono 13px font, radius `--pt-r-chip` (4px). Active = forest fill cream text. Flagged = amber tint background + 0.5px dashed amber border. Confidence < 0.7 gets a dotted amber underline. Corrected adds a small green checkmark. Each chip can show a small classification dot (`ClassDot`) for non-good/non-book moves so blunders/mistakes are scannable.
   - **Correction popover** (when a flagged move is opened):
     - Anchored absolutely inside the move list, `top: floor(plyIndex/2) * 32 + 4px`, `right: 8px` of the column.
     - 280px wide, `--pt-surface` bg, 0.5px `--pt-border-strong` border, radius 6px, `--pt-shadow-pop`.
     - Header: amber pulsing dot + `LOW CONFIDENCE · NN%` micro label + close (×).
     - Body: italic Instrument Serif reason (14px / 20px line-height, muted color).
     - Suggestions list: each row = mono SAN (60px col), short rationale (12px sans muted), optional `BEST` tag in 9px green mono. Preferred suggestion has `rgba(46,125,92,0.08)` background.
     - Footer: `Type SAN…` ghost button + `Skip` quiet button.
   - **Engine analysis panel** (top border 1px `--pt-border`, `--pt-bg-elev` bg):
     - Header strip: small engine glyph (gear-like circle) + `ENGINE · DEPTH 26` micro · spacer · `ClassDot` + classification label (`BLUNDER`, etc., 10px mono, classification color) · large eval `formatEval(scoreCp)` in 14px mono right-aligned (52px min-width).
     - Up to 3 lines, each row: `14px 50px 1fr` grid → rank index (9px mono dim), eval (12px mono — colored red if negative), PV (12px mono with first 6 SANs joined by ` · ` separators in `--pt-text-dim`). Top line gets `--pt-surface` bg + 0.5px border for emphasis.
   - **Scoresheet thumbnail** (optional, top border `--pt-border`, 12px padding, `--pt-bg-elev` bg):
     - Cream background `#fbf7e8`, ruled lines via repeating linear gradient.
     - Caveat-style cursive font, 17px move text, 14px move numbers.
     - Active row (= floor(currentPly/2)) gets `rgba(199,127,58,0.18)` background and 1.5px amber outline.
   - **Captured tray** (top border, 10px 14px, `--pt-surface`):
     - Two rows (`WHITE` / `BLACK` micro labels, 38px column), each lists captured piece glyphs at 16px size or `—` if none.

3. **Playback bar** — top border, 10px 16px padding, `--pt-bg-elev` bg.
   - Four `NavBtn`s (28×28, surface bg, mono `«‹›»`).
   - Centered ply counter `N / total` in 12px mono (56px min-width).
   - Right side: amber `Chip` "N to review" with pulsing dot when flagged moves remain — clicking jumps to first flagged ply.

### 2. Desktop · Resting state

Same layout, no popover, no flagged-move pulse on the board. Used for clean plies.

### 3. Desktop · No-scoresheet state

Same layout, scoresheet section omitted (used when PGN was imported from chess.com / lichess and there's no original scoresheet). Engine panel and captured tray remain.

### 4. Mobile · Correcting

**Frame:** iPhone 320×660 inner content area, top safe area 44px, bottom safe area 24px.

**Layout (top → bottom):**

1. **Compact header** (12px 14px, 1px bottom border): back chevron · "Review · Anderssen vs Dufresne" 13px sans + "N to review · M ply" micro · `Save` primary button sm.
2. **Board section** (14px 14px 8px padding, centered):
   - Top player row: avatar 20 + name (left), `currentPly/total` (right, mono dim).
   - Eval bar 14×272 + 8px gap + Board 272×272.
   - Bottom player row mirrors top.
3. **Move rail** — horizontal scroll strip, 6px 10px, 6px gap, 1px borders top+bottom, `--pt-bg-elev` bg. Dense `MoveChip` (22px tall, 12px font). Tapping a flagged chip opens the bottom sheet to its correction state.
4. **Bottom sheet** — `--pt-surface`, top corners 16px radius, soft top shadow, `marginTop: -10px` to overlap. 14px padding, 10px gap, scrollable.
   - Drag handle (36×4 pill, `--pt-border-strong`, centered).
   - **Correction state** (when popPly is set):
     - Amber pulsing dot + `Move N. · Low confidence NN%` micro.
     - Italic Instrument Serif: `You wrote [originalSAN]. Did you mean…` — original SAN inlined as a mono chip with amber tint background.
     - Suggestion buttons (full-width, 10px 12px, 6px gap): SAN (mono 14px), rationale (sans 12px muted), optional `BEST` tag. Preferred row gets green-tinted bg + border.
     - `Type SAN` ghost + `Skip` quiet, 50/50.
   - **Resting state**:
     - `Move details` micro label.
     - Big move SAN: `N. Sxx` in 22px mono + inline classification dot + eval (`+1.40`) in 13px mono.
     - Optional opening note (Instrument Serif italic).
     - Compact engine block: `ENGINE · DEPTH N` micro + 2 PV lines in `50px 1fr` grid (eval | mono PV up to 4 ply).
5. **Tab bar** — 8px 12px, top border, `--pt-surface`. Prev `NavBtn` · `N to review` amber chip (centered) · Next `NavBtn`.

### 5. Mobile · Resting

Same mobile frame, sheet shows resting state (move details + engine summary) instead of correction picker.

---

## Interactions & Behavior

### Move list
- **Click move** → jump board to that ply. If flagged, open correction popover/sheet.
- **Right-click move** (desktop only) → open correction popover regardless of flag state (manual edit affordance).
- **Tap flagged chip** (mobile) → opens bottom sheet in correction state.

### Correction popover / sheet
- **Pick a suggestion** → mutates ply: `status = 'corrected'`, `san = suggestion.san`. Rerun board state forward (in production: replay all subsequent moves from the corrected position, since later moves may now be illegal — surface those as new flags).
- **Type SAN** → swap suggestions list for a SAN input field with live legality validation.
- **Skip / dismiss** → close popover, leave move flagged.

### Board
- Last move: from + to squares get amber tint `rgba(199,127,58,0.28)` + inset 1.5px amber stroke.
- Flagged warning square: 2px amber inset + diagonal amber stripes + 1.6s sine pulse (`pt-board-warn` keyframe).
- Suggestion arrows during correction: SVG lines from each candidate's `from→to`, shortened by 32% of square size so they don't overlap the destination piece. Stroke width = `max(4, sq * 0.11)`. Top suggestion = `--pt-good`, others = `--pt-amber` / `--pt-forest`.
- Hover (when interactive): `rgba(20,32,26,0.06)` overlay.

### Eval bar
- Animates fill height with `transition: height 240ms cubic-bezier(.4,0,.2,1)`.
- Score label switches sides automatically based on score sign.

### Playback bar
- `«` start, `‹` prev, `›` next, `»` end. In production wire to keyboard arrows + j/k.
- "N to review" chip jumps to first remaining flagged ply.

### Animations
```css
@keyframes pt-board-warn        { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
@keyframes pt-pop-in            { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pt-confidence-blink  { 0%,100% { opacity: 0.45; } 50% { opacity: 1; } }
```

---

## State Management

Per-game review state:

```ts
interface ReviewState {
  plies: Ply[];                     // ordered, mutable list
  currentPly: number;                // index into plies
  popoverPlyIdx: number | -1;        // which ply has correction UI open
  edits: Record<number, string>;     // ply idx → corrected SAN
  dirty: boolean;                    // any edits since last save
}

interface Ply {
  san: string;
  from: Square;       // 'e2'
  to: Square;         // 'e4'
  promotion?: Piece;
  conf: number;       // 0..1 OCR confidence
  status?: 'flagged' | 'corrected' | 'edited' | 'illegal';
  reason?: string;    // why flagged
  note?: string;      // opening name etc.
  suggestions?: Suggestion[];
  board: Board8x8;    // pre-built snapshot for fast rendering
}

interface Suggestion {
  san: string;
  from: Square;
  to: Square;
  why: string;
  preferred?: boolean;
}
```

Engine analysis is keyed separately: `Record<plyIdx, { depth, scoreCp, classify, lines: { cp, pv: string[] }[] }>`. In production, run the engine async per ply and stream updates; the UI must handle "analyzing…" placeholders.

**Classification thresholds** (cp delta vs best line):
- `good`: in best ±10cp
- `inaccuracy`: 50–100cp worse
- `mistake`: 100–250cp worse
- `blunder`: 250cp+ worse
- `book`: opening-book move, regardless of eval

---

## Design Tokens

All tokens live in `tokens.css`. Critical values:

### Brand ramp
```
--pt-forest:        #1F3A2E   (primary dark)
--pt-forest-soft:   #556B5F
--pt-forest-deep:   #16291F
--pt-cream:         #F4EDDC   (primary light)
--pt-cream-soft:    #EBE2CE
--pt-cream-deep:    #DDD2B8
--pt-amber:         #C77F3A   (accent)
--pt-amber-soft:    #E0A261
--pt-amber-deep:    #A66428
--pt-ink:           #14201A
```

### Move classification (use these exact values for engine annotations)
```
--pt-good:        #2E7D5C
--pt-inaccuracy:  #D9A04A
--pt-mistake:     #C77F3A
--pt-blunder:     #A94F24
--pt-book:        #6B7C72
```

### Semantic (light · paper theme — default for review screen)
```
--pt-bg:           #F5F4F0
--pt-surface:      #FAFAF7
--pt-bg-elev:      rgba(20,32,26,0.03)
--pt-bg-sunken:    rgba(20,32,26,0.05)
--pt-border:       rgba(20,32,26,0.12)
--pt-border-strong:rgba(20,32,26,0.22)
--pt-text:         #1A1F1B
--pt-text-muted:   rgba(26,31,27,0.62)
--pt-text-dim:     rgba(26,31,27,0.4)
--pt-square-light: #ECEAE3
--pt-square-dark:  #B5B0A2
```

Dark and other light themes (forest, slate, midnight, oxblood, sage, mint, moss) are also defined; see `tokens.css`. The review screen must work in any of them.

### Type
```
--pt-sans:  'Work Sans', 'Lato', system-ui, sans-serif
--pt-serif: 'Instrument Serif', Georgia, serif       (italic only — used for reason text)
--pt-mono:  'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace
```

Scale (from `tokens.css`):
- `pt-display` 28/34 weight 500
- `pt-h2` 20/28 weight 500
- `pt-h3` 16/22 weight 500
- `pt-body` 14/22 weight 400
- `pt-small` 12/18 weight 400
- `pt-micro` 10/14 mono uppercase letter-spacing 0.12em weight 500

### Radii / shadow
```
--pt-r-chip: 4px
--pt-r-card: 6px
--pt-r-lg:   8px
--pt-r-frame:12px
--pt-shadow-card: 0 1px 0 rgba(20,32,26,0.04), 0 8px 24px -16px rgba(20,32,26,0.18)
--pt-shadow-pop:  0 1px 0 rgba(20,32,26,0.04), 0 16px 40px -20px rgba(20,32,26,0.28)
```

---

## Assets

- `assets/trail-favicon-256.png` — favicon, also usable as app icon source.
- All chess piece glyphs in the prototype are Unicode (`♔♕♖♗♘♙♚♛♜♝♞♟`) styled with `WebkitTextStroke`. **In production, swap to a real SVG piece set** matching the codebase (cburnett, merida, alpha, etc.) — match the brand silhouette feel; don't reuse the Unicode fallback.
- The PawnTrail trail-mark and lockup are vector — see `brand.jsx` (`TrailMark`, `TrailGlyph`, `TrailLockup`). Reuse the existing brand system in the codebase if there is one.

---

## Files in this bundle

```
prototype/
├── PawnTrail PGN Review.html       — entry point; open in a browser to see the design canvas
├── tokens.css                       — all CSS custom properties + base type / utility classes
├── brand.jsx                        — TrailMark, TrailLockup, ChessPiece (silhouette), backgrounds
├── components.jsx                   — Button, Input, Chip, Badge, Card, Toggle, SegControl, Avatar, CoordLabel
├── design-canvas.jsx                — pan/zoom canvas wrapper (not part of the production UI; presentation only)
├── tweaks-panel.jsx                 — runtime knobs panel (not production)
├── auth-screens.jsx                 — re-used PhoneFrame + DesktopFrame device chrome
├── review-board.jsx                 — Board, PieceGlyph, FEN/board helpers (startPosition, applyMove)
├── review-data.jsx                  — sample game (Anderssen–Dufresne 1852) + ENGINE_ANALYSIS table
├── review-screens.jsx               — ReviewScreenDesktop, ReviewScreenMobile, MoveList, CorrectionPopover,
│                                       EvalBar, EnginePanel, ClassDot, ScoresheetThumb, CapturedTray,
│                                       PlaybackBar, GameHeader, NavBtn
└── review-app.jsx                   — DesignCanvas composition with all 5 artboards + Tweaks
```

The two screens to implement live in `review-screens.jsx`: `ReviewScreenDesktop` and `ReviewScreenMobile`. Treat those as the spec, the rest as supporting context.
