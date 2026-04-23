"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { compressImage, MAX_UPLOAD_BYTES } from "@/lib/images/compress";
import { createScan, runScanner } from "@/app/(app)/scan/actions";

type Phase =
  | "idle"
  | "uploading"
  | "extracting"
  | "validating"
  | "done"
  | "error";

export function UploadDropzone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFile(file: File) {
    setErrorMessage(null);
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrorMessage("File is over 10 MB. Please use a smaller image.");
      setPhase("error");
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
      setErrorMessage(created.error);
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

      <Tips />
    </div>
  );
}

const STEP_LABEL: Record<Phase, string> = {
  idle: "",
  uploading: "Uploading…",
  extracting: "Extracting moves…",
  validating: "Validating…",
  done: "Done",
  error: "Error",
};

const STEPS: Phase[] = ["uploading", "extracting", "validating"];

function ProgressCard({
  phase,
  isPending,
}: {
  phase: Phase;
  isPending: boolean;
}) {
  return (
    <div
      style={{
        padding: 24,
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 12,
        background: "var(--pt-bg-elev)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
        {STEP_LABEL[phase]}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {STEPS.map((s) => {
          const active = s === phase;
          const done = STEPS.indexOf(s) < STEPS.indexOf(phase);
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
                color: active
                  ? "var(--pt-cream)"
                  : done
                    ? "var(--pt-text)"
                    : "var(--pt-text-dim)",
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
