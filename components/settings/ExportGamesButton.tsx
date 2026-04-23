"use client";

import { useState } from "react";
import { exportAllGames } from "@/app/(app)/settings/actions";

export function ExportGamesButton() {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const res = await exportAllGames();
      if (!res.ok) {
        alert(`Export failed: ${res.error}`);
        return;
      }
      const blob = new Blob([res.data?.pgn ?? ""], {
        type: "application/x-chess-pgn",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pawntrail-games-${new Date().toISOString().slice(0, 10)}.pgn`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={busy}
      style={{
        padding: "8px 14px",
        fontSize: 12,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: "transparent",
        color: "var(--pt-text)",
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 4,
        cursor: busy ? "not-allowed" : "pointer",
        alignSelf: "flex-start",
      }}
    >
      {busy ? "Exporting…" : "Export all games as PGN"}
    </button>
  );
}
