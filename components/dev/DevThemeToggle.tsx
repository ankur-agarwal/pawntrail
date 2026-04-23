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
