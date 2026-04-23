"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Camera,
  Library,
  BookOpen,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { TrailMark } from "@/components/brand/TrailMark";
import type { Profile } from "@/lib/supabase/helpers";

const NAV: Array<{ label: string; href: string; icon: LucideIcon; hint?: string }> = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Scan sheet", href: "/scan", icon: Camera, hint: "New" },
  { label: "Library", href: "/games", icon: Library },
  { label: "Openings", href: "/openings", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({
  profile,
  onNavigate,
}: {
  profile: Profile | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const displayName = profile?.display_name ?? "Trail walker";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside
      style={{
        width: 220,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--pt-bg)",
        borderRight: "0.5px solid var(--pt-border)",
      }}
    >
      <div
        style={{
          padding: "18px 18px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "0.5px solid var(--pt-border)",
        }}
      >
        <TrailMark size={28} />
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--pt-text)",
            fontWeight: 500,
          }}
        >
          PawnTrail
        </div>
      </div>

      <nav
        style={{
          flex: 1,
          padding: "16px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
        }}
      >
        <NavLabel>Trail</NavLabel>
        {NAV.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={isActive(item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div
        style={{
          padding: "12px 14px",
          borderTop: "0.5px solid var(--pt-border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--pt-forest)",
            color: "var(--pt-cream)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--pt-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </div>
          {profile?.email && (
            <div
              style={{
                fontSize: 11,
                color: "var(--pt-text-muted)",
                fontFamily: "var(--font-mono)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profile.email}
            </div>
          )}
        </div>
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Sign out"
            title="Sign out"
            style={{
              padding: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              color: "var(--pt-text-muted)",
              cursor: "pointer",
              borderRadius: 4,
            }}
          >
            <LogOut size={14} />
          </button>
        </form>
      </div>
    </aside>
  );
}

function NavLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--pt-text-dim)",
        fontFamily: "var(--font-mono)",
        padding: "4px 10px 6px",
      }}
    >
      {children}
    </div>
  );
}

function NavItem({
  label,
  href,
  icon: Icon,
  hint,
  active,
  onNavigate,
}: {
  label: string;
  href: string;
  icon: LucideIcon;
  hint?: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 6,
        textDecoration: "none",
        color: active ? "var(--pt-text)" : "var(--pt-text-muted)",
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        background: active ? "var(--pt-bg-elev)" : "transparent",
        transition: "background 140ms ease, color 140ms ease",
      }}
      onMouseEnter={(e) => {
        if (!active)
          (e.currentTarget as HTMLElement).style.background =
            "var(--pt-bg-elev)";
      }}
      onMouseLeave={(e) => {
        if (!active)
          (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {active && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: -1,
            top: "50%",
            transform: "translateY(-50%)",
            width: 2,
            height: 18,
            background: "var(--pt-amber)",
            borderRadius: 2,
          }}
        />
      )}
      <Icon
        size={15}
        strokeWidth={active ? 2 : 1.6}
        color={active ? "var(--pt-amber)" : "var(--pt-text-muted)"}
      />
      <span style={{ flex: 1 }}>{label}</span>
      {hint && (
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "var(--font-mono)",
            padding: "1px 6px",
            background: "var(--pt-amber)",
            color: "var(--pt-ink)",
            borderRadius: 3,
          }}
        >
          {hint}
        </span>
      )}
    </Link>
  );
}
