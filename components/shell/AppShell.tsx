"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import type { Profile } from "@/lib/supabase/helpers";

export function AppShell({
  profile,
  children,
}: {
  profile: Profile | null;
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock scroll when drawer open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div
      className="pt-shell"
      style={{ minHeight: "100vh", display: "flex", background: "var(--pt-bg)" }}
    >
      <div className="pt-shell-sidebar-desktop">
        <Sidebar profile={profile} />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <TopBar onMenuOpen={() => setDrawerOpen(true)} />
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>

      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
          }}
        >
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(20, 32, 26, 0.45)",
              animation: "pt-fade 160ms ease-out",
            }}
          />
          <div
            style={{
              position: "relative",
              width: "min(280px, 80vw)",
              background: "var(--pt-bg)",
              boxShadow: "1px 0 24px rgba(20, 32, 26, 0.2)",
              animation: "pt-slide-in 180ms ease-out",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 1,
                padding: 6,
                background: "transparent",
                border: "none",
                color: "var(--pt-text-muted)",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
            <Sidebar
              profile={profile}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      <style jsx global>{`
        .pt-shell-sidebar-desktop {
          display: none;
          flex-shrink: 0;
        }
        @media (min-width: 768px) {
          .pt-shell-sidebar-desktop {
            display: block;
          }
          .pt-mobile-only {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .pt-mobile-only {
            display: inline-flex !important;
          }
        }
        @keyframes pt-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes pt-slide-in {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
