# Phase 0 — Foundation Implementation Plan

> **For agentic workers:** Execute task-by-task; commit after each Task completes. Phase 0 is mostly scaffolding and configuration — classical TDD doesn't apply to every step (there's no logic to test yet), so each Task has a **verification command** in place of a failing test where appropriate. Tasks with actual logic (Supabase client, env validation) follow the write-test-first pattern.

**Goal:** Deployable empty Next.js 16 app with brand tokens, Supabase client, CI, and placeholder routes. No product features.

**Architecture:** Next.js 16 App Router (Turbopack, strict TypeScript, Tailwind v4), pnpm workspace, `@/*` import alias, routes grouped under `(marketing)` / `(auth)` / `(app)` as specified in PRD §21.1. Supabase SSR package for cookie-based sessions. GitHub Actions for lint + typecheck + build on every PR.

**Tech stack:** Next.js 16 · TypeScript 5 (strict) · Tailwind v4 · Supabase SSR · Zustand · zod · react-hook-form · sonner · lucide-react · Vitest · pnpm 9 · Node 20.

**Exit criteria (from tasks.md Phase 0):**
- `pnpm dev` renders a cream-background "PawnTrail" splash page with the trail-mark SVG.
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all green locally and in CI.
- Vercel preview deploys on PR (wiring — actual deploy happens when repo is pushed to GitHub + linked to Vercel).
- `data-theme="dark"` on `<html>` correctly inverts colours.

---

## Task 1 — Commit existing assets as baseline

Establish a known-good starting commit so the scaffold step is reversible.

**Files:**
- Create: `.gitignore`
- Stage: `PRD-v1-detailed.md`, `tasks.md`, `brand/`, `scripts/`, `wireframes/`, `docs/`

- [ ] **Step 1**: Write `.gitignore` with Node / Next / OS defaults.

```gitignore
# deps
node_modules/
.pnp
.pnp.js

# next
.next/
out/
next-env.d.ts

# env
.env*.local
.env

# vercel
.vercel

# testing
coverage/

# misc
.DS_Store
*.tsbuildinfo

# editor
.vscode/
.idea/
```

- [ ] **Step 2**: Commit.

```bash
git add .gitignore PRD-v1-detailed.md tasks.md brand scripts wireframes docs
git commit -m "chore: initial planning assets (PRD, tasks, brand, wireframes)"
```

Expected: `git log --oneline` shows one commit.

---

## Task 2 — Scaffold Next.js 16 in place

Create the Next.js project alongside the existing planning files without clobbering them.

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `public/*`

- [ ] **Step 1**: Run the official scaffold with pinned flags.

```bash
pnpm create next-app@16 . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --turbopack --use-pnpm --yes
```

Expected: creates Next.js files; prompts bypassed; the existing PRD/brand/wireframes/tasks files are left untouched.

- [ ] **Step 2**: Verify scaffold succeeded.

```bash
cat package.json | grep -E '"next"|"react"' && ls app/
```

Expected: `"next": "^16.x"` and `"react": "^19.x"`, and `app/` contains `layout.tsx`, `page.tsx`, `globals.css`.

- [ ] **Step 3**: Commit.

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 app (App Router, TS, Tailwind, Turbopack)"
```

---

## Task 3 — TypeScript strictness + engines + Node pinning

Tighten TypeScript and pin the Node/pnpm versions so CI cannot drift.

**Files:**
- Modify: `tsconfig.json`
- Create: `.nvmrc`
- Modify: `package.json`

- [ ] **Step 1**: Read current `tsconfig.json` to see what the scaffold shipped.

```bash
cat tsconfig.json
```

- [ ] **Step 2**: Ensure `compilerOptions` includes these fields. Merge into existing tsconfig:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

Keep everything else the scaffold provided (paths, lib, target, etc.).

- [ ] **Step 3**: Create `.nvmrc`.

```
20
```

- [ ] **Step 4**: Add `engines` + `packageManager` to `package.json`:

```json
{
  "engines": {
    "node": ">=20 <21",
    "pnpm": ">=9 <10"
  },
  "packageManager": "pnpm@9.4.0"
}
```

- [ ] **Step 5**: Verify typecheck still passes.

```bash
pnpm exec tsc --noEmit
```

Expected: exit 0, no errors.

- [ ] **Step 6**: Commit.

```bash
git add tsconfig.json .nvmrc package.json
git commit -m "chore: strict TS + pin Node 20 / pnpm 9"
```

---

## Task 4 — Install core runtime deps

Install only what Phase 0 and Phases 1–2 need. Heavy deps (chessground, chess.js, stockfish, stripe) land in their own phases.

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1**: Install runtime deps.

```bash
pnpm add @supabase/ssr @supabase/supabase-js zod zustand react-hook-form sonner lucide-react
```

- [ ] **Step 2**: Install dev deps (Vitest + test utilities).

```bash
pnpm add -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/dom @testing-library/user-event jsdom happy-dom
```

- [ ] **Step 3**: Verify builds still work.

```bash
pnpm build
```

Expected: `Compiled successfully` (warnings about empty `app/page.tsx` are fine).

- [ ] **Step 4**: Commit.

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install supabase, zod, zustand, react-hook-form, sonner, vitest"
```

---

## Task 5 — Brand tokens in globals.css

Replace the scaffold's default `globals.css` with PawnTrail's CSS variable token set from PRD §5.1.

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1**: Replace contents of `app/globals.css` with:

```css
@import "tailwindcss";

@theme {
  --color-forest: #1F3A2E;
  --color-forest-soft: #556B5F;
  --color-cream: #F4EDDC;
  --color-cream-soft: #EBE2CE;
  --color-amber: #C77F3A;
  --color-amber-soft: #E0A261;
  --color-ink: #14201A;

  --font-sans: var(--font-work-sans), "Lato", system-ui, sans-serif;
  --font-serif: var(--font-instrument-serif), Georgia, serif;
  --font-mono: var(--font-plex-mono), ui-monospace, "SF Mono", Menlo, monospace;

  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
}

:root {
  --pt-forest: #1F3A2E;
  --pt-forest-soft: #556B5F;
  --pt-cream: #F4EDDC;
  --pt-cream-soft: #EBE2CE;
  --pt-amber: #C77F3A;
  --pt-amber-soft: #E0A261;
  --pt-ink: #14201A;

  --pt-bg: var(--pt-cream);
  --pt-bg-elev: rgba(20, 32, 26, 0.035);
  --pt-border: rgba(20, 32, 26, 0.14);
  --pt-border-strong: rgba(20, 32, 26, 0.26);
  --pt-text: var(--pt-ink);
  --pt-text-muted: rgba(20, 32, 26, 0.65);
  --pt-text-dim: rgba(20, 32, 26, 0.45);

  --pt-good: #2E7D5C;
  --pt-inaccuracy: #D9A04A;
  --pt-mistake: #C77F3A;
  --pt-blunder: #A94F24;
}

[data-theme="dark"] {
  --pt-bg: var(--pt-ink);
  --pt-bg-elev: rgba(244, 237, 220, 0.05);
  --pt-border: rgba(244, 237, 220, 0.14);
  --pt-border-strong: rgba(244, 237, 220, 0.26);
  --pt-text: var(--pt-cream);
  --pt-text-muted: rgba(244, 237, 220, 0.72);
  --pt-text-dim: rgba(244, 237, 220, 0.45);
}

body {
  background: var(--pt-bg);
  color: var(--pt-text);
  font-family: var(--font-sans);
}
```

- [ ] **Step 2**: Commit.

```bash
git add app/globals.css
git commit -m "feat(brand): CSS variable token system (light + dark)"
```

---

## Task 6 — Fonts via next/font

Load Work Sans, Instrument Serif, and IBM Plex Mono as CSS variables so `@theme` can reference them.

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1**: Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Work_Sans, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-work-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic", "normal"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "PawnTrail",
  description: "Snap the scoresheet. Chart the trail.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${workSans.variable} ${instrumentSerif.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2**: Verify build.

```bash
pnpm build
```

Expected: no font errors.

- [ ] **Step 3**: Commit.

```bash
git add app/layout.tsx
git commit -m "feat(brand): load Work Sans, Instrument Serif, IBM Plex Mono"
```

---

## Task 7 — Brand assets into /public/brand

Copy the brand PNG/SVG files into the Next.js `public/` folder, and set a favicon.

**Files:**
- Create: `public/brand/*`, `public/favicon.ico` (or link one of the PNGs)

- [ ] **Step 1**: Copy brand files.

```bash
mkdir -p public/brand
cp -R brand/*.png brand/*.svg public/brand/ 2>/dev/null || cp -R brand/*.png public/brand/
```

- [ ] **Step 2**: Set favicon. Next.js reads `app/icon.png` automatically; convert the 32 px PNG.

```bash
cp brand/trail-favicon-32.png app/icon.png
cp brand/trail-favicon-512.png app/apple-icon.png
```

- [ ] **Step 3**: Commit.

```bash
git add public/brand app/icon.png app/apple-icon.png
git commit -m "chore(brand): copy brand assets into public and app icon slots"
```

---

## Task 8 — Supabase client modules (with tests)

Three client helpers: browser, server, middleware. This task uses TDD because the env validation has testable behaviour.

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `lib/env.ts`
- Create: `lib/env.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1**: Create `vitest.config.ts`.

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 2**: Write the failing env test at `lib/env.test.ts`.

```ts
import { describe, expect, it, beforeEach, afterEach } from "vitest";

describe("env", () => {
  const original = { ...process.env };

  beforeEach(() => {
    process.env = { ...original };
  });

  afterEach(() => {
    process.env = original;
  });

  it("requires NEXT_PUBLIC_SUPABASE_URL", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    const { loadPublicEnv } = await import("./env");
    expect(() => loadPublicEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("returns parsed values when all present", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    const { loadPublicEnv } = await import("./env");
    const env = loadPublicEnv();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://x.supabase.co");
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("anon");
  });
});
```

- [ ] **Step 3**: Run test — expect FAIL because `lib/env.ts` does not exist yet.

```bash
pnpm exec vitest run lib/env.test.ts
```

Expected: FAIL with "Cannot find module ./env".

- [ ] **Step 4**: Create `lib/env.ts`.

```ts
import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export type PublicEnv = z.infer<typeof publicSchema>;

export function loadPublicEnv(): PublicEnv {
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid env: ${missing}`);
  }
  return parsed.data;
}
```

- [ ] **Step 5**: Re-run test — expect PASS.

```bash
pnpm exec vitest run lib/env.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 6**: Create `lib/supabase/client.ts`.

```ts
import { createBrowserClient } from "@supabase/ssr";
import { loadPublicEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const env = loadPublicEnv();
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
```

- [ ] **Step 7**: Create `lib/supabase/server.ts`.

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { loadPublicEnv } from "@/lib/env";

export async function createSupabaseServerClient() {
  const env = loadPublicEnv();
  const cookieStore = await cookies();
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot set cookies — this is expected;
            // the middleware client handles session refresh.
          }
        },
      },
    },
  );
}
```

- [ ] **Step 8**: Create `lib/supabase/middleware.ts`.

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { loadPublicEnv } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  const env = loadPublicEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();
  return response;
}
```

- [ ] **Step 9**: Add `"test": "vitest run"` and `"test:watch": "vitest"` to `package.json` scripts.

- [ ] **Step 10**: Verify.

```bash
pnpm test
pnpm exec tsc --noEmit
```

Expected: tests pass, no type errors.

- [ ] **Step 11**: Commit.

```bash
git add lib vitest.config.ts package.json
git commit -m "feat(supabase): browser/server/middleware clients with validated env"
```

---

## Task 9 — .env.example

Publish the env keys consumers need. No real secrets.

**Files:**
- Create: `.env.example`

- [ ] **Step 1**: Write `.env.example`.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Scanner (knightvision-api)
PT_EXTRACTOR_URL=
PT_EXTRACTOR_TOKEN=
PT_SCANNER_BACKEND=llm

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Analytics (optional in dev)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com
```

- [ ] **Step 2**: Commit.

```bash
git add .env.example
git commit -m "chore: .env.example with all v1 keys"
```

---

## Task 10 — Placeholder routes

One file per route from PRD §6.1. Each renders a brand-minimal "Coming soon" card — just enough to confirm routing + layout groups work.

**Files:**
- Create: `app/(marketing)/layout.tsx`, `app/(marketing)/page.tsx`
- Create: `app/(auth)/layout.tsx`, `app/(auth)/signin/page.tsx`, `app/(auth)/verify/page.tsx`, `app/(auth)/setup/page.tsx`
- Create: `app/(app)/layout.tsx`, `app/(app)/dashboard/page.tsx`, `app/(app)/scan/page.tsx`, `app/(app)/games/page.tsx`, `app/(app)/openings/page.tsx`, `app/(app)/settings/page.tsx`, `app/(app)/settings/billing/page.tsx`
- Create: `app/privacy/page.tsx`, `app/terms/page.tsx`
- Delete: `app/page.tsx` (replaced by `(marketing)/page.tsx`)
- Create: `components/ComingSoon.tsx`

- [ ] **Step 1**: Create the shared placeholder component at `components/ComingSoon.tsx`.

```tsx
export function ComingSoon({ name }: { name: string }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          padding: "32px 40px",
          border: "0.5px solid var(--pt-border-strong)",
          borderRadius: 12,
          background: "var(--pt-bg-elev)",
          textAlign: "center",
          maxWidth: 440,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--pt-text-muted)",
            marginBottom: 8,
          }}
        >
          PawnTrail
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 500,
            margin: 0,
            marginBottom: 6,
          }}
        >
          {name}
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--pt-text-muted)",
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
          }}
        >
          Snap the scoresheet. Chart the trail.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2**: Delete scaffold's `app/page.tsx`.

```bash
rm app/page.tsx
```

- [ ] **Step 3**: Create a route group layout for each group. `(marketing)/layout.tsx`, `(auth)/layout.tsx`, `(app)/layout.tsx` — each is a passthrough for v1 (real shells land in later phases).

```tsx
// app/(marketing)/layout.tsx  and  app/(auth)/layout.tsx  and  app/(app)/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 4**: Create each route page. Every file is:

```tsx
import { ComingSoon } from "@/components/ComingSoon";
export default function Page() {
  return <ComingSoon name="<ROUTE LABEL>" />;
}
```

Fill in the label per route:

| File | Label |
|------|-------|
| `app/(marketing)/page.tsx` | Home |
| `app/(auth)/signin/page.tsx` | Sign in |
| `app/(auth)/verify/page.tsx` | Verify |
| `app/(auth)/setup/page.tsx` | Setup |
| `app/(app)/dashboard/page.tsx` | Dashboard |
| `app/(app)/scan/page.tsx` | Scan |
| `app/(app)/games/page.tsx` | Library |
| `app/(app)/openings/page.tsx` | Openings |
| `app/(app)/settings/page.tsx` | Settings |
| `app/(app)/settings/billing/page.tsx` | Billing |
| `app/privacy/page.tsx` | Privacy |
| `app/terms/page.tsx` | Terms |

- [ ] **Step 5**: Verify build succeeds and all routes resolve.

```bash
pnpm build
```

Expected: build log lists every route above (as `○ (Static)` or `λ (Dynamic)`).

- [ ] **Step 6**: Commit.

```bash
git add app components
git commit -m "feat(routes): placeholder pages for all v1 routes per PRD §6.1"
```

---

## Task 11 — pnpm scripts

Normalise script names referenced in the PRD (Appendix B).

**Files:**
- Modify: `package.json`

- [ ] **Step 1**: Ensure these scripts exist (merge, do not overwrite `dev`/`build`):

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

- [ ] **Step 2**: Smoke-test each script (skip the long-running ones).

```bash
pnpm typecheck
pnpm lint
pnpm test
```

Expected: all three exit 0.

- [ ] **Step 3**: Commit.

```bash
git add package.json
git commit -m "chore: normalise pnpm scripts (typecheck, test, test:coverage)"
```

---

## Task 12 — GitHub Actions CI

Lint + typecheck + test + build on every PR to `main`.

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1**: Write `.github/workflows/ci.yml`.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9.4.0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder
```

- [ ] **Step 2**: Commit.

```bash
git add .github/workflows/ci.yml
git commit -m "ci: lint + typecheck + test + build on PR"
```

---

## Task 13 — Wire brand into the marketing landing placeholder

Prove the brand tokens work end-to-end by rendering the Trail mark on the marketing page. This is the "splash page" exit criterion.

**Files:**
- Modify: `app/(marketing)/page.tsx`
- Create: `components/brand/TrailMark.tsx`

- [ ] **Step 1**: Copy the master mark SVG into a React component.

```tsx
// components/brand/TrailMark.tsx
export function TrailMark({ size = 64 }: { size?: number }) {
  return (
    <img
      src="/brand/trail-mark.png"
      alt="PawnTrail"
      width={size}
      height={size}
      style={{ display: "block" }}
    />
  );
}
```

- [ ] **Step 2**: Replace `app/(marketing)/page.tsx`:

```tsx
import { TrailMark } from "@/components/brand/TrailMark";

export default function MarketingHome() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "var(--pt-bg)",
        color: "var(--pt-text)",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <TrailMark size={72} />
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 500,
            margin: "0 0 10px",
            letterSpacing: "0.02em",
          }}
        >
          PawnTrail
        </h1>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--pt-text-muted)",
            margin: "0 0 24px",
          }}
        >
          Snap the scoresheet. Chart the trail.
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--pt-text-dim)",
          }}
        >
          Phase 0 · Foundation shipped
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 3**: Start dev server, load `http://localhost:3000`, confirm:
  - Trail mark visible
  - Work Sans (sans) applied to headings
  - Instrument Serif italic applied to tagline
  - IBM Plex Mono applied to the small label
  - Cream background

Run:

```bash
pnpm dev
```

Then open the page in a browser. Kill with Ctrl+C after confirming.

- [ ] **Step 4**: Commit.

```bash
git add app/\(marketing\)/page.tsx components/brand/TrailMark.tsx
git commit -m "feat(marketing): brand splash page with Trail mark and tagline"
```

---

## Task 14 — Dark-theme smoke test

Prove `data-theme="dark"` inverts correctly. Add a tiny client-side toggle only on the marketing page (ephemeral — will be removed in Phase 10 when the real theme setting lands).

**Files:**
- Create: `components/dev/DevThemeToggle.tsx`
- Modify: `app/(marketing)/page.tsx`

- [ ] **Step 1**: Create the toggle.

```tsx
// components/dev/DevThemeToggle.tsx
"use client";

import { useState } from "react";

export function DevThemeToggle() {
  const [dark, setDark] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.setAttribute(
          "data-theme",
          next ? "dark" : "light",
        );
      }}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        padding: "6px 14px",
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontFamily: "var(--font-mono)",
        background: "transparent",
        color: "var(--pt-text)",
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}
```

- [ ] **Step 2**: Import it into `app/(marketing)/page.tsx` at the top of `<main>`.

```tsx
import { DevThemeToggle } from "@/components/dev/DevThemeToggle";
// ...
// inside the return, as the first child of <main>:
<DevThemeToggle />
```

- [ ] **Step 3**: Start dev server, confirm:
  - Dark button inverts bg and text.
  - Trail mark still readable.

- [ ] **Step 4**: Commit.

```bash
git add components/dev app/\(marketing\)/page.tsx
git commit -m "chore(dev): ephemeral theme toggle on marketing page for smoke-testing dark mode"
```

---

## Task 15 — Final verification + phase close

Run the full exit-criteria suite locally.

- [ ] **Step 1**: Full check.

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

All four must exit 0.

- [ ] **Step 2**: Start dev server, confirm:
  - `/` renders marketing splash.
  - `/dashboard`, `/scan`, `/games`, `/openings`, `/settings`, `/settings/billing`, `/signin`, `/verify`, `/setup`, `/privacy`, `/terms` all render "Coming soon" cards.

- [ ] **Step 3**: Update `tasks.md` Phase 0 exit criteria to [x] for rows that passed; leave [ ] on "Vercel preview deploys on PR" (deferred until the repo is pushed + linked to Vercel — track as follow-up, not a Phase 0 blocker).

- [ ] **Step 4**: Commit the tasks.md update.

```bash
git add tasks.md
git commit -m "docs: mark Phase 0 exit criteria complete"
```

- [ ] **Step 5**: Report back to the user: Phase 0 shipped, ready to start Phase 1 (database migrations).

---

## Self-review

- [x] All files in PRD §21.1 that Phase 0 touches are accounted for.
- [x] Types match: `loadPublicEnv` is consistent across `client.ts`, `server.ts`, `middleware.ts`.
- [x] No placeholders — every task has its exact code + command.
- [x] TDD is applied where it adds signal (env validation); otherwise verification commands stand in.
- [x] Chessground/chess.js/stripe are explicitly **not** installed in Phase 0 (they ship with their own phases) to keep first-load JS small and Phase 0 focused.
