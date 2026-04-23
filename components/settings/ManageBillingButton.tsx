"use client";

import { useState } from "react";

export function ManageBillingButton() {
  const [busy, setBusy] = useState(false);

  async function openPortal() {
    setBusy(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const body = (await res.json()) as { url?: string; error?: string };
      if (res.ok && body.url) window.location.href = body.url;
      else alert(body.error ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={openPortal}
      disabled={busy}
      style={{
        padding: "8px 14px",
        fontSize: 12,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: "var(--pt-forest)",
        color: "var(--pt-cream)",
        border: "0.5px solid var(--pt-forest)",
        borderRadius: 4,
        cursor: busy ? "wait" : "pointer",
      }}
    >
      {busy ? "Opening…" : "Manage subscription"}
    </button>
  );
}
