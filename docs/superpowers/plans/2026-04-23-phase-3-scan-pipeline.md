# Phase 3 — Scan pipeline Implementation Plan

> **For agentic workers:** This is the biggest phase. Ship Group A first (upload → mock extractor → persist), then Group B (chess.js validation → review UI → save as game). Each group is independently demoable.

**Goal:** User uploads a scoresheet photo, gets a parsed + chess.js-validated game, edits flagged moves, saves as a `games` row.

**Architecture (differs from PRD §9):**
- Single extractor HTTP call to `knightvision-api` (LLM-based) — no bundled ONNX model, no separate PGN service.
- Client-side compression → direct browser upload to Supabase storage via the authed session.
- Server-side signed-URL mint (10 min TTL) passed to the extractor so `knightvision-api` can read a private object.
- Response shape `{ moves: [{ moveNumber, white, black }] }` has **no per-move confidence** — flagging is done client-side by replaying moves through `chess.js` and marking any that don't validate.
- Mock backend (`PT_SCANNER_BACKEND=mock`) lets us build the whole flow end-to-end before the real API is deployed.
- Single-sheet upload for v1 (multi-sheet UI deferred to v1.1 per wireframes review).

**Tech stack:** `@supabase/ssr` storage client · `chess.js` (client-side validation + PGN build) · `chessground` (board UI in 3d) · Next.js server actions for scan lifecycle · Zustand for cross-route state on mobile split.

---

## Group A — Upload, extractor, persist

Deliverable: user uploads a photo, sees a "parsed" success state, can navigate to a placeholder review screen that displays the raw move list.

### Task A1 — Env additions + lib/env.ts extension

**Files:**
- Modify: `.env.example`
- Modify: `.env` (human action — add values)
- Modify: `lib/env.ts`
- Modify: `lib/env.test.ts`

- [ ] **Step 1**: Update `.env.example`.

```bash
# Scanner (knightvision-api)
PT_EXTRACTOR_URL=mock
PT_EXTRACTOR_TOKEN=
PT_SCANNER_BACKEND=llm
```

Already present from Phase 0; just confirm.

- [ ] **Step 2**: Add to `.env` (real values):

```
PT_EXTRACTOR_URL=mock           # use literal "mock" for fixture responses in dev
PT_SCANNER_BACKEND=llm
```

Once `knightvision-api` is deployed, swap `PT_EXTRACTOR_URL` to the real URL.

- [ ] **Step 3**: Add a `loadServerEnv()` alongside `loadPublicEnv()` — server-only keys are validated here. Extend `lib/env.ts`:

```ts
import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PT_EXTRACTOR_URL: z.string().min(1),           // "mock" OR a URL
  PT_EXTRACTOR_TOKEN: z.string().optional(),
  PT_SCANNER_BACKEND: z.enum(["llm", "ocr", "mock"]).default("llm"),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

export function loadPublicEnv(): PublicEnv {
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
  if (!parsed.success) throwZodFields(parsed.error);
  return parsed.data;
}

export function loadServerEnv(): ServerEnv {
  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PT_EXTRACTOR_URL: process.env.PT_EXTRACTOR_URL,
    PT_EXTRACTOR_TOKEN: process.env.PT_EXTRACTOR_TOKEN,
    PT_SCANNER_BACKEND: process.env.PT_SCANNER_BACKEND,
  });
  if (!parsed.success) throwZodFields(parsed.error);
  return parsed.data;
}

function throwZodFields(err: import("zod").ZodError): never {
  const fields = err.issues.map((i) => i.path.join(".")).join(", ");
  throw new Error(`Missing or invalid env: ${fields}`);
}
```

- [ ] **Step 4**: Extend `lib/env.test.ts` — add tests for `loadServerEnv` covering:
  - Missing `SUPABASE_SERVICE_ROLE_KEY` → throws.
  - Missing `PT_EXTRACTOR_URL` → throws.
  - `PT_SCANNER_BACKEND` defaults to `"llm"` when unset.

- [ ] **Step 5**: Run tests green, commit.

```bash
pnpm test
git add lib/env.ts lib/env.test.ts
git commit -m "feat(env): add loadServerEnv for scanner keys + service-role validation"
```

---

### Task A2 — Scanner types + mock backend

**Files:**
- Create: `lib/scanner/types.ts`
- Create: `lib/scanner/mock.ts`
- Create: `lib/scanner/__fixtures__/ruy-lopez.json`

- [ ] **Step 1**: Types.

```ts
// lib/scanner/types.ts
export interface ExtractedMovePair {
  moveNumber: number;
  white: string;
  black?: string;        // may be absent on the final pair if game ended on a white move
}

export interface ExtractorMetadata {
  model: string;
  fallbackUsed?: boolean;
  timestamp: string;
}

export interface ExtractorResponse {
  success: true;
  data: {
    moves: ExtractedMovePair[];
    totalSheets?: number;
    _metadata: ExtractorMetadata;
  };
}

export interface ExtractorError {
  success: false;
  error: string;
  message?: string;
}

export type ExtractorResult = ExtractorResponse | ExtractorError;
```

- [ ] **Step 2**: Fixture JSON — a plausible Ruy Lopez game, 14 moves.

```json
{
  "success": true,
  "data": {
    "moves": [
      { "moveNumber": 1, "white": "e4", "black": "e5" },
      { "moveNumber": 2, "white": "Nf3", "black": "Nc6" },
      { "moveNumber": 3, "white": "Bb5", "black": "a6" },
      { "moveNumber": 4, "white": "Ba4", "black": "Nf6" },
      { "moveNumber": 5, "white": "O-O", "black": "Be7" },
      { "moveNumber": 6, "white": "Re1", "black": "b5" },
      { "moveNumber": 7, "white": "Bb3", "black": "d6" },
      { "moveNumber": 8, "white": "c3", "black": "O-O" },
      { "moveNumber": 9, "white": "h3", "black": "Nb8" },
      { "moveNumber": 10, "white": "d4", "black": "Nbd7" },
      { "moveNumber": 11, "white": "Nbd2", "black": "Bb7" },
      { "moveNumber": 12, "white": "Bc2", "black": "Re8" },
      { "moveNumber": 13, "white": "Qe2", "black": "Bf8" },
      { "moveNumber": 14, "white": "Nf1", "black": "h6" }
    ],
    "totalSheets": 1,
    "_metadata": {
      "model": "mock",
      "fallbackUsed": false,
      "timestamp": "2026-04-23T12:00:00.000Z"
    }
  }
}
```

- [ ] **Step 3**: Mock backend.

```ts
// lib/scanner/mock.ts
import type { ExtractorResult } from "./types";
import fixture from "./__fixtures__/ruy-lopez.json";

export async function extractMovesMock(
  _imageUrls: string[],
): Promise<ExtractorResult> {
  // Simulate network latency so the progress UI is visible in dev.
  await new Promise((r) => setTimeout(r, 1200));
  return fixture as ExtractorResult;
}
```

- [ ] **Step 4**: Commit.

```bash
git add lib/scanner/
git commit -m "feat(scanner): mock backend + fixture (Ruy Lopez)"
```

---

### Task A3 — Scanner client (dispatches mock/llm)

**Files:**
- Create: `lib/scanner/client.ts`

- [ ] **Step 1**: Client that routes by `PT_SCANNER_BACKEND`.

```ts
// lib/scanner/client.ts
import { loadServerEnv } from "@/lib/env";
import { extractMovesMock } from "./mock";
import type { ExtractorResult } from "./types";

export async function extractMoves(
  imageUrls: string[],
): Promise<ExtractorResult> {
  const env = loadServerEnv();

  if (env.PT_SCANNER_BACKEND === "mock" || env.PT_EXTRACTOR_URL === "mock") {
    return extractMovesMock(imageUrls);
  }

  if (env.PT_SCANNER_BACKEND === "ocr") {
    throw new Error(
      "OCR backend not yet implemented (post-v1 — see tasks.md Open decisions)",
    );
  }

  // LLM backend — call knightvision-api
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (env.PT_EXTRACTOR_TOKEN) {
    headers["Authorization"] = `Bearer ${env.PT_EXTRACTOR_TOKEN}`;
  }

  const res = await fetch(`${env.PT_EXTRACTOR_URL}/api/extract`, {
    method: "POST",
    headers,
    body: JSON.stringify({ imageUrls, model: "anthropic" }),
  });

  if (!res.ok) {
    return {
      success: false,
      error: `extractor_http_${res.status}`,
      message: await res.text().catch(() => ""),
    };
  }

  const json = (await res.json()) as ExtractorResult;
  return json;
}
```

- [ ] **Step 2**: Commit.

```bash
git add lib/scanner/client.ts
git commit -m "feat(scanner): client dispatches mock/llm/ocr backends"
```

---

### Task A4 — Client-side image compression

**Files:**
- Create: `lib/images/compress.ts`
- Create: `lib/images/compress.test.ts`

- [ ] **Step 1**: Test (uses happy-dom with canvas stub).

```ts
// lib/images/compress.test.ts
import { describe, expect, it, vi, beforeEach } from "vitest";

describe("compressImage", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("rejects non-image MIME types", async () => {
    const { compressImage } = await import("./compress");
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    await expect(compressImage(file)).rejects.toThrow(/image/i);
  });
});
```

Note: full happy-path compression is hard to unit-test without a real canvas. The MIME check is the honest seam.

- [ ] **Step 2**: Implementation.

```ts
// lib/images/compress.ts
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export async function compressImage(file: File): Promise<Blob> {
  if (!ACCEPTED.includes(file.type)) {
    throw new Error(
      `Unsupported image type: ${file.type}. Use JPEG, PNG, or WebP.`,
    );
  }

  const img = await createImageBitmap(file);
  const maxDim = 2000;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.82 });
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB pre-compression
```

- [ ] **Step 3**: Run test + commit.

```bash
pnpm test
git add lib/images/
git commit -m "feat(images): client-side compression with MIME validation"
```

---

### Task A5 — Scan server actions

**Files:**
- Create: `app/(app)/scan/actions.ts`

- [ ] **Step 1**: Three actions: `createScan`, `runScanner`, `getScanStatus`.

```ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/current-user";
import { extractMoves } from "@/lib/scanner/client";
import type { Scan } from "@/lib/supabase/helpers";

type Result<T> = { ok: true; data: T } | { ok: false; error: string; code?: string };

export async function createScan(formData: FormData): Promise<Result<{ scanId: string }>> {
  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();

  // Quota check (paywall stub — real modal lands in Phase 11)
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, scan_quota_used, scan_quota_limit")
    .eq("id", userId)
    .single();

  if (
    profile &&
    profile.plan === "free" &&
    profile.scan_quota_used >= profile.scan_quota_limit
  ) {
    return { ok: false, error: "quota_exceeded", code: "quota_exceeded" };
  }

  const file = formData.get("image") as File | null;
  if (!file) return { ok: false, error: "no_file" };

  const scanId = crypto.randomUUID();
  const key = `${userId}/${scanId}/sheet-1.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("scoresheets")
    .upload(key, file, { contentType: "image/jpeg", upsert: false });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { error: insertError } = await supabase.from("scans").insert({
    id: scanId,
    user_id: userId,
    image_paths: [key],
    status: "pending",
  });
  if (insertError) return { ok: false, error: insertError.message };

  return { ok: true, data: { scanId } };
}

export async function runScanner(scanId: string): Promise<Result<Scan>> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  // Load scan
  const { data: scan, error: loadError } = await supabase
    .from("scans")
    .select("*")
    .eq("id", scanId)
    .single();
  if (loadError || !scan) return { ok: false, error: "scan_not_found" };
  if (scan.status === "saved") return { ok: true, data: scan };

  await supabase.from("scans").update({ status: "parsing" }).eq("id", scanId);

  // Generate signed URLs (10 min TTL) for each sheet
  const signed = await Promise.all(
    scan.image_paths.map(async (key) => {
      const { data, error } = await supabase.storage
        .from("scoresheets")
        .createSignedUrl(key, 600);
      if (error || !data) throw new Error(`signed_url_failed: ${key}`);
      return data.signedUrl;
    }),
  );

  const result = await extractMoves(signed);

  if (!result.success) {
    await supabase
      .from("scans")
      .update({ status: "failed", error: result.error })
      .eq("id", scanId);
    return { ok: false, error: result.error };
  }

  const { data: updated, error: updateError } = await supabase
    .from("scans")
    .update({
      status: "parsed",
      raw_ocr_json: result.data as unknown as Record<string, unknown>,
    })
    .eq("id", scanId)
    .select("*")
    .single();
  if (updateError || !updated) return { ok: false, error: updateError?.message ?? "update_failed" };

  return { ok: true, data: updated };
}

export async function getScanStatus(scanId: string): Promise<Result<Pick<Scan, "id" | "status" | "error">>> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scans")
    .select("id, status, error")
    .eq("id", scanId)
    .maybeSingle();
  if (error || !data) return { ok: false, error: "scan_not_found" };
  return { ok: true, data };
}
```

- [ ] **Step 2**: Typecheck.

```bash
pnpm typecheck
```

- [ ] **Step 3**: Commit.

```bash
git add app/\(app\)/scan/actions.ts
git commit -m "feat(scan): server actions for createScan, runScanner, getScanStatus"
```

---

### Task A6 — /scan upload page with progress UI

**Files:**
- Replace: `app/(app)/scan/page.tsx`
- Create: `components/scan/UploadDropzone.tsx`

- [ ] **Step 1**: Page shell (server component).

```tsx
// app/(app)/scan/page.tsx
import { requireUser } from "@/lib/supabase/current-user";
import { UploadDropzone } from "@/components/scan/UploadDropzone";

export default async function ScanPage() {
  const { profile } = await requireUser();
  const quotaUsed = profile?.scan_quota_used ?? 0;
  const quotaLimit = profile?.scan_quota_limit ?? 15;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        maxWidth: 720,
        margin: "0 auto",
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
        PawnTrail · Scan
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 6px" }}>
        Scan a new sheet
      </h1>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 14,
          color: "var(--pt-text-muted)",
          margin: "0 0 24px",
        }}
      >
        Snap a photo. We'll read the moves off the sheet.
      </p>
      <UploadDropzone quotaUsed={quotaUsed} quotaLimit={quotaLimit} />
    </main>
  );
}
```

- [ ] **Step 2**: Client component — drop-zone + progress state machine.

```tsx
// components/scan/UploadDropzone.tsx
"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { compressImage, MAX_UPLOAD_BYTES } from "@/lib/images/compress";
import { createScan, runScanner } from "@/app/(app)/scan/actions";

type Phase = "idle" | "uploading" | "extracting" | "validating" | "done" | "error";

export function UploadDropzone({
  quotaUsed,
  quotaLimit,
}: {
  quotaUsed: number;
  quotaLimit: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFile(file: File) {
    setErrorMessage(null);
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrorMessage("File is over 10 MB. Please use a smaller image.");
      return;
    }

    setPhase("uploading");
    let compressed: Blob;
    try {
      compressed = await compressImage(file);
    } catch (e) {
      setErrorMessage((e as Error).message);
      setPhase("error");
      return;
    }

    const fd = new FormData();
    fd.append("image", compressed, "sheet.jpg");

    const created = await createScan(fd);
    if (!created.ok) {
      setErrorMessage(
        created.code === "quota_exceeded"
          ? "You've used all your free scans. Upgrade coming soon."
          : created.error,
      );
      setPhase("error");
      return;
    }

    setPhase("extracting");
    const ran = await runScanner(created.data.scanId);
    if (!ran.ok) {
      setErrorMessage(`Couldn't read that sheet: ${ran.error}`);
      setPhase("error");
      return;
    }

    setPhase("validating");
    // Validation happens client-side on the review screen; jump there.
    startTransition(() => {
      router.push(`/scan/${created.data.scanId}/review`);
    });
  }

  const isBusy = phase !== "idle" && phase !== "error";

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {!isBusy && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            display: "block",
            width: "100%",
            padding: "48px 24px",
            border: "1.5px dashed var(--pt-border-strong)",
            borderRadius: 12,
            background: "var(--pt-bg-elev)",
            cursor: "pointer",
            textAlign: "center",
            color: "var(--pt-text)",
            fontFamily: "inherit",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
            Upload a scoresheet photo
          </div>
          <div style={{ fontSize: 12, color: "var(--pt-text-muted)" }}>
            Click to browse · JPEG, PNG, WebP · max 10 MB
          </div>
        </button>
      )}

      {isBusy && <ProgressCard phase={phase} isPending={isPending} />}

      {phase === "error" && errorMessage && (
        <div
          role="alert"
          style={{
            marginTop: 16,
            padding: "12px 14px",
            border: "0.5px solid var(--pt-border-strong)",
            borderRadius: 6,
            background: "rgba(169, 79, 36, 0.08)",
            fontSize: 13,
          }}
        >
          {errorMessage}
          <button
            type="button"
            onClick={() => {
              setPhase("idle");
              setErrorMessage(null);
            }}
            style={{
              marginLeft: 12,
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              textDecoration: "underline",
              background: "transparent",
              border: "none",
              color: "var(--pt-amber)",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div
        style={{
          marginTop: 24,
          fontSize: 11,
          color: "var(--pt-text-muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {quotaUsed} / {quotaLimit} free scans used
      </div>

      <Tips />
    </div>
  );
}

const STEP_LABELS: Record<Phase, string> = {
  idle: "",
  uploading: "Uploading…",
  extracting: "Extracting moves…",
  validating: "Validating…",
  done: "Done",
  error: "Error",
};

function ProgressCard({ phase, isPending }: { phase: Phase; isPending: boolean }) {
  const steps: Phase[] = ["uploading", "extracting", "validating"];
  return (
    <div
      style={{
        padding: "24px",
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 12,
        background: "var(--pt-bg-elev)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
        {STEP_LABELS[phase]}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {steps.map((s) => {
          const active = s === phase;
          const done = steps.indexOf(s) < steps.indexOf(phase);
          return (
            <div
              key={s}
              style={{
                flex: 1,
                padding: "6px 10px",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textAlign: "center",
                border: "0.5px solid var(--pt-border-strong)",
                borderRadius: 4,
                background: active ? "var(--pt-forest)" : "transparent",
                color: active ? "var(--pt-cream)" : done ? "var(--pt-text)" : "var(--pt-text-dim)",
              }}
            >
              {s}
            </div>
          );
        })}
      </div>
      {phase === "extracting" && (
        <p
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "var(--pt-text-muted)",
            fontStyle: "italic",
            fontFamily: "var(--font-serif)",
          }}
        >
          Usually 5–15 seconds. Sit tight.
        </p>
      )}
      {isPending && (
        <p
          style={{
            marginTop: 8,
            fontSize: 11,
            color: "var(--pt-text-dim)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Navigating to review…
        </p>
      )}
    </div>
  );
}

function Tips() {
  return (
    <div
      style={{
        marginTop: 32,
        padding: "16px 20px",
        border: "0.5px solid var(--pt-border)",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
          fontFamily: "var(--font-mono)",
          marginBottom: 8,
        }}
      >
        For best results
      </div>
      <ul
        style={{
          margin: 0,
          paddingLeft: 20,
          fontSize: 13,
          color: "var(--pt-text-muted)",
          lineHeight: 1.7,
        }}
      >
        <li>Well-lit, shadow-free. Daylight is ideal.</li>
        <li>The whole sheet in frame, edge-to-edge.</li>
        <li>Straight-on angle. Tilted sheets lose accuracy fast.</li>
      </ul>
    </div>
  );
}
```

- [ ] **Step 2**: Typecheck + commit.

```bash
pnpm typecheck
git add app/\(app\)/scan/page.tsx components/scan/
git commit -m "feat(scan): upload page with 3-step progress (upload → extract → validate)"
```

---

### Task A7 — Placeholder review screen (Group A end)

Just enough to prove the end-to-end works. Real review UI is Group B (chess.js + chessground).

**Files:**
- Create: `app/(app)/scan/[scanId]/review/page.tsx`

- [ ] **Step 1**: Write the page.

```tsx
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/current-user";

export default async function ScanReviewPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  await requireUser();
  const { scanId } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: scan } = await supabase
    .from("scans")
    .select("*")
    .eq("id", scanId)
    .maybeSingle();

  if (!scan) notFound();
  if (scan.status !== "parsed" && scan.status !== "edited") {
    redirect("/scan");
  }

  const raw = scan.raw_ocr_json as
    | { data?: { moves?: Array<{ moveNumber: number; white: string; black?: string }> } }
    | null;
  const moves = raw?.data?.moves ?? [];

  return (
    <main style={{ padding: 40, maxWidth: 720, margin: "0 auto" }}>
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
        PawnTrail · Review (Group A placeholder)
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 16 }}>
        Parsed {moves.length} moves
      </h1>
      <pre
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          padding: 16,
          border: "0.5px solid var(--pt-border)",
          borderRadius: 6,
          background: "var(--pt-bg-elev)",
          overflow: "auto",
        }}
      >
        {moves
          .map((m) => `${m.moveNumber}. ${m.white}${m.black ? " " + m.black : ""}`)
          .join("\n")}
      </pre>
      <p
        style={{
          fontSize: 12,
          color: "var(--pt-text-dim)",
          marginTop: 24,
          fontStyle: "italic",
          fontFamily: "var(--font-serif)",
        }}
      >
        Board + flagged-move editing lands in Group B.
      </p>
    </main>
  );
}
```

- [ ] **Step 2**: Commit.

```bash
git add app/\(app\)/scan/
git commit -m "feat(scan): placeholder review page showing parsed move list (Group A end)"
```

**Group A exit criteria:**
- [ ] User on `/scan` can pick a file → sees 3-step progress → lands on `/scan/[id]/review` showing the raw move list.
- [ ] With `PT_EXTRACTOR_URL=mock`, flow works without any real API deployed.
- [ ] Quota check returns `quota_exceeded` when `scan_quota_used >= scan_quota_limit`.
- [ ] Scan row status transitions `pending → parsing → parsed`.

---

## Group B — chess.js validation + review UI + save as game

Deliverable: user can replay the parsed moves on a board, flagged moves (illegal per chess.js) get amber highlighting + correction popover, metadata form captures game details, save creates `games` + `moves` rows.

### Task B1 — Install chess.js and chessground

```bash
pnpm add chess.js chessground
git add package.json pnpm-lock.yaml
git commit -m "chore: add chess.js and chessground for move validation and board UI"
```

---

### Task B2 — lib/pgn/build.ts

**Files:**
- Create: `lib/pgn/build.ts`
- Create: `lib/pgn/build.test.ts`

- [ ] **Step 1**: Tests first.

```ts
// lib/pgn/build.test.ts
import { describe, expect, it } from "vitest";
import { buildPgn, replayMoves } from "./build";

describe("replayMoves", () => {
  it("validates a legal game", () => {
    const pairs = [
      { moveNumber: 1, white: "e4", black: "e5" },
      { moveNumber: 2, white: "Nf3", black: "Nc6" },
    ];
    const plies = replayMoves(pairs);
    expect(plies).toHaveLength(4);
    expect(plies.every((p) => !p.invalid)).toBe(true);
    expect(plies[0].fenAfter).toContain("e3"); // en-passant square
  });

  it("flags an illegal move + halts downstream validation", () => {
    const pairs = [
      { moveNumber: 1, white: "e4", black: "e5" },
      { moveNumber: 2, white: "Nz9", black: "Nc6" }, // illegal
    ];
    const plies = replayMoves(pairs);
    expect(plies[2].invalid).toBe(true);
    expect(plies[3].invalid).toBe(true); // downstream pending
  });

  it("handles games ending on a white move (no black)", () => {
    const pairs = [{ moveNumber: 1, white: "e4" }];
    const plies = replayMoves(pairs);
    expect(plies).toHaveLength(1);
    expect(plies[0].invalid).toBe(false);
  });
});

describe("buildPgn", () => {
  it("emits a PGN that round-trips through chess.js", async () => {
    const { Chess } = await import("chess.js");
    const pairs = [
      { moveNumber: 1, white: "e4", black: "e5" },
      { moveNumber: 2, white: "Nf3", black: "Nc6" },
      { moveNumber: 3, white: "Bb5", black: "a6" },
    ];
    const pgn = buildPgn(pairs);
    const c = new Chess();
    expect(c.loadPgn(pgn)).toBe(true);
    expect(c.history()).toEqual(["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"]);
  });
});
```

- [ ] **Step 2**: Implementation.

```ts
// lib/pgn/build.ts
import { Chess } from "chess.js";
import type { ExtractedMovePair } from "@/lib/scanner/types";

export interface Ply {
  ply: number;              // 1-indexed
  san: string;
  invalid: boolean;
  fenAfter: string;         // empty string if invalid
  side: "w" | "b";
}

export function replayMoves(pairs: ExtractedMovePair[]): Ply[] {
  const game = new Chess();
  const out: Ply[] = [];
  let halted = false;
  let plyNum = 0;

  for (const pair of pairs) {
    for (const [san, side] of [
      [pair.white, "w" as const],
      [pair.black, "b" as const],
    ]) {
      if (san == null) continue;
      plyNum += 1;
      if (halted) {
        out.push({ ply: plyNum, san, invalid: true, fenAfter: "", side });
        continue;
      }
      try {
        const move = game.move(san, { strict: false });
        if (!move) throw new Error("illegal");
        out.push({ ply: plyNum, san: move.san, invalid: false, fenAfter: game.fen(), side });
      } catch {
        halted = true;
        out.push({ ply: plyNum, san, invalid: true, fenAfter: "", side });
      }
    }
  }
  return out;
}

export function buildPgn(pairs: ExtractedMovePair[]): string {
  const game = new Chess();
  for (const pair of pairs) {
    for (const san of [pair.white, pair.black]) {
      if (san == null) continue;
      try {
        if (!game.move(san, { strict: false })) break;
      } catch {
        break;
      }
    }
  }
  return game.pgn();
}
```

- [ ] **Step 3**: Run tests + commit.

```bash
pnpm test
git add lib/pgn/
git commit -m "feat(pgn): replayMoves (flags illegal) + buildPgn"
```

---

### Task B3 — lib/pgn/suggestions.ts

Top-3 chess.js-derived alternates for an illegal SAN.

**Files:**
- Create: `lib/pgn/suggestions.ts`
- Create: `lib/pgn/suggestions.test.ts`

- [ ] **Step 1**: Test.

```ts
import { describe, expect, it } from "vitest";
import { suggestionsFor } from "./suggestions";

describe("suggestionsFor", () => {
  it("returns legal moves from a position that are notation-close to the attempt", () => {
    // From the Ruy Lopez mid-game position: user typed "Nc3" (not actually legal here),
    // legal alternates include knight moves.
    const fen = "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2";
    const result = suggestionsFor(fen, "Nx3"); // typo
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(3);
    // all results should be legal SANs at this position
    result.forEach((san) => expect(typeof san).toBe("string"));
  });

  it("returns empty array when position is checkmate/stalemate", () => {
    // Fool's mate — white is checkmated
    const fen = "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";
    const result = suggestionsFor(fen, "anything");
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2**: Implementation.

```ts
// lib/pgn/suggestions.ts
import { Chess } from "chess.js";

export function suggestionsFor(fen: string, attempted: string): string[] {
  const game = new Chess(fen);
  if (game.isCheckmate() || game.isStalemate()) return [];

  const legal = game.moves({ verbose: true }).map((m) => m.san);

  // Rank by edit distance to the attempt; prefer same first char (piece type).
  const scored = legal.map((san) => ({
    san,
    score:
      editDistance(san, attempted) -
      (sameFirstChar(san, attempted) ? 0.5 : 0),
  }));
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, 3).map((s) => s.san);
}

function sameFirstChar(a: string, b: string): boolean {
  return a[0]?.toLowerCase() === b[0]?.toLowerCase();
}

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}
```

- [ ] **Step 3**: Run + commit.

```bash
pnpm test
git add lib/pgn/suggestions.ts lib/pgn/suggestions.test.ts
git commit -m "feat(pgn): suggestionsFor returns top-3 chess.js alternates by edit distance"
```

---

### Task B4 — Review page (real)

This is the big UI file. Keeping the implementation outline here; bite-sized sub-steps expand when we execute.

**Files:**
- Replace: `app/(app)/scan/[scanId]/review/page.tsx` (server component: load scan + hand to client)
- Create: `components/scan/ReviewEditor.tsx` (client: board + move list + metadata form + save action)
- Create: `components/scan/MoveList.tsx`
- Create: `components/scan/FlaggedMovePopover.tsx`
- Create: `styles/board.css` (chessground overrides using brand colours)

Scope for the TDD pass:
1. Server component fetches `scan` + `signed URL for original sheet`.
2. Client component holds edited-moves state (Zustand store so mobile metadata-split can share).
3. `<ChessBoard>` wraps chessground with controlled `ply` prop (minimal — full version lands Phase 4).
4. `<MoveList>` renders the 3-col grid; amber `⚠` + border on flagged cells; click seeks board.
5. `<FlaggedMovePopover>` shows top-3 suggestions; user clicks one → mutates store.
6. Metadata form (react-hook-form + zod): opponent, rating, color, result, tournament, round, date, time_control.
7. `Save game` calls `saveScanAsGame` server action (Task B6).

Sub-steps per file are expanded when we actually execute this task.

---

### Task B5 — Mobile metadata split route

**Files:**
- Create: `app/(app)/scan/[scanId]/metadata/page.tsx`
- Create: `lib/state/scanReviewStore.ts` (Zustand, persisted to sessionStorage so state survives the navigation)

Desktop stays on the review page; mobile's "Continue" button navigates to this route. Same `saveScanAsGame` action.

---

### Task B6 — saveScanAsGame action + Postgres RPC

**Files:**
- Create: `supabase/migrations/0007_save_scan_as_game.sql`
- Modify: `app/(app)/scan/actions.ts` — add `saveScanAsGame`

SQL:

```sql
-- 0007_save_scan_as_game.sql
create or replace function public.save_scan_as_game(
  p_scan_id       uuid,
  p_game_input    jsonb,
  p_moves         jsonb
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_game_id uuid;
  v_scan    public.scans%rowtype;
begin
  v_user_id := auth.uid();
  if v_user_id is null then raise exception 'not authenticated'; end if;

  select * into v_scan from public.scans where id = p_scan_id and user_id = v_user_id for update;
  if not found then raise exception 'scan not found or not owned by user'; end if;
  if v_scan.status = 'saved' then raise exception 'scan already saved'; end if;

  v_game_id := gen_random_uuid();

  insert into public.games (
    id, user_id,
    played_on, opponent_name, opponent_rating, color, result,
    time_control, tournament_name, round,
    pgn, scan_id, scan_image_path, scan_confidence
  ) values (
    v_game_id, v_user_id,
    nullif(p_game_input->>'played_on', '')::date,
    nullif(p_game_input->>'opponent_name', ''),
    nullif(p_game_input->>'opponent_rating', '')::int,
    p_game_input->>'color',
    p_game_input->>'result',
    nullif(p_game_input->>'time_control', ''),
    nullif(p_game_input->>'tournament_name', ''),
    nullif(p_game_input->>'round', ''),
    p_game_input->>'pgn',
    p_scan_id,
    v_scan.image_paths[1],
    nullif(p_game_input->>'scan_confidence', '')::numeric(4,3)
  );

  insert into public.moves (game_id, ply, san, fen_after)
  select
    v_game_id,
    (m->>'ply')::int,
    m->>'san',
    m->>'fen_after'
  from jsonb_array_elements(p_moves) as m;

  update public.scans set status = 'saved', updated_at = now() where id = p_scan_id;

  return v_game_id;
end;
$$;
```

Server action wraps this with `supabase.rpc("save_scan_as_game", ...)`.

---

### Task B7 — Update tasks.md + Phase 3 close

Same pattern as Phases 0/1/2.

---

## Self-review

- [x] Single extractor call architecture is honest to `knightvision-api`; no fabricated PGN microservice.
- [x] Mock backend is a first-class citizen, not an afterthought — Group A ships entirely against it.
- [x] Quota stub returns `quota_exceeded` so Phase 11 paywall wiring is a UI-only change.
- [x] Group A is independently demoable; Group B doesn't require Group A to be re-verified.
- [x] chess.js validation is the single source of truth for "flagged" — no per-move confidence sneaks back in.
- [x] Signed URLs never reach the browser; minted server-side, passed to extractor, consumed by `knightvision-api`.
- [x] `save_scan_as_game` RPC makes the games/moves/scans-update atomic — trigger on `scans.status → saved` bumps the quota automatically.
