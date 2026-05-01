"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "paper" | "slate";

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "paper";
  const t = document.documentElement.dataset.theme;
  return t === "slate" ? "slate" : "paper";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  function toggle() {
    const next: Theme = theme === "paper" ? "slate" : "paper";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("pt-theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      suppressHydrationWarning
      aria-label={
        theme === "paper" ? "Switch to dark theme" : "Switch to light theme"
      }
      style={{
        width: 32,
        height: 32,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--pt-r-pill)",
        background: "transparent",
        border: "0.5px solid var(--pt-border-strong)",
        color: "var(--pt-text-muted)",
        cursor: "pointer",
        transition: "color 120ms ease, background 120ms ease",
      }}
    >
      <span suppressHydrationWarning style={{ display: "inline-flex" }}>
        {theme === "paper" ? <Moon size={14} /> : <Sun size={14} />}
      </span>
    </button>
  );
}
