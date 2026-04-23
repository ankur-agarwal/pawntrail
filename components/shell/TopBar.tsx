"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Search } from "lucide-react";

export function TopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/games?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <header
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
        borderBottom: "0.5px solid var(--pt-border)",
        background: "var(--pt-bg)",
      }}
    >
      <button
        type="button"
        onClick={onMenuOpen}
        aria-label="Open navigation menu"
        className="pt-mobile-only"
        style={{
          padding: 8,
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "0.5px solid var(--pt-border-strong)",
          borderRadius: 6,
          color: "var(--pt-text)",
          cursor: "pointer",
        }}
      >
        <Menu size={16} />
      </button>

      <form
        onSubmit={submitSearch}
        style={{
          flex: 1,
          maxWidth: 420,
          position: "relative",
        }}
      >
        <Search
          size={14}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--pt-text-dim)",
            pointerEvents: "none",
          }}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
          placeholder="Search games, openings, opponents…"
          aria-label="Search"
          style={{
            width: "100%",
            padding: "8px 12px 8px 34px",
            fontSize: 13,
            background: "var(--pt-bg-elev)",
            color: "var(--pt-text)",
            border: "0.5px solid var(--pt-border-strong)",
            borderRadius: 6,
            fontFamily: "inherit",
          }}
        />
      </form>
    </header>
  );
}
