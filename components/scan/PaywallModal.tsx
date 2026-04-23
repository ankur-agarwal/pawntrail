"use client";

import { useState } from "react";

export function PaywallModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  if (!open) return null;

  async function upgrade(plan: "pro_monthly" | "pro_yearly") {
    setBusy(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const body = (await res.json()) as { url?: string; error?: string };
      if (res.ok && body.url) {
        window.location.href = body.url;
      } else {
        alert(
          body.error === "stripe_not_configured"
            ? "Billing is not yet configured — Stripe keys needed. Tell the dev!"
            : (body.error ?? "Unknown error"),
        );
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20, 32, 26, 0.55)",
        display: "grid",
        placeItems: "center",
        padding: 24,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          padding: "32px 36px 24px",
          background: "var(--pt-bg)",
          border: "0.5px solid var(--pt-border-strong)",
          borderRadius: 12,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 8px" }}>
          You&apos;ve scanned 15 games — nice work.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 14,
            color: "var(--pt-text-muted)",
            margin: "0 0 20px",
          }}
        >
          Keep going with Pro. Unlimited scans, priority OCR, same everything
          else.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <PlanCard
            label="Monthly"
            price="$4.99"
            period="/ mo"
            sub="Cancel any time"
            onClick={() => upgrade("pro_monthly")}
            busy={busy === "pro_monthly"}
          />
          <PlanCard
            label="Yearly"
            price="$39"
            period="/ yr"
            sub="$3.25 / mo equivalent"
            badge="Save 34%"
            primary
            onClick={() => upgrade("pro_yearly")}
            busy={busy === "pro_yearly"}
          />
        </div>
        <p
          style={{
            fontSize: 11,
            color: "var(--pt-text-dim)",
            textAlign: "center",
            marginTop: 18,
          }}
        >
          Questions? support@pawntrail.app
        </p>
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 10,
            width: "100%",
            padding: "6px 12px",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: "transparent",
            color: "var(--pt-text-muted)",
            border: "none",
            cursor: "pointer",
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}

function PlanCard({
  label,
  price,
  period,
  sub,
  badge,
  primary,
  onClick,
  busy,
}: {
  label: string;
  price: string;
  period: string;
  sub: string;
  badge?: string;
  primary?: boolean;
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <div
      style={{
        padding: 16,
        border: primary
          ? "1.5px solid var(--pt-amber)"
          : "0.5px solid var(--pt-border-strong)",
        borderRadius: 8,
        position: "relative",
      }}
    >
      {badge && (
        <div
          style={{
            position: "absolute",
            top: -9,
            left: 14,
            padding: "2px 10px",
            background: "var(--pt-amber)",
            color: "var(--pt-ink)",
            borderRadius: 2,
            fontSize: 10,
            fontWeight: 500,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.05em",
          }}
        >
          {badge}
        </div>
      )}
      <div
        style={{
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 500,
          fontFamily: "var(--font-mono)",
          margin: "4px 0",
        }}
      >
        {price}
        <span
          style={{
            fontSize: 12,
            color: "var(--pt-text-muted)",
            fontWeight: 400,
          }}
        >
          {period}
        </span>
      </div>
      <div style={{ fontSize: 12, color: "var(--pt-text-muted)" }}>{sub}</div>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        style={{
          marginTop: 12,
          width: "100%",
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 500,
          background: primary ? "var(--pt-forest)" : "transparent",
          color: primary ? "var(--pt-cream)" : "var(--pt-text)",
          border: "0.5px solid var(--pt-border-strong)",
          borderRadius: 6,
          cursor: busy ? "wait" : "pointer",
        }}
      >
        {busy ? "Loading…" : primary ? `${label} — Best value` : label}
      </button>
    </div>
  );
}
