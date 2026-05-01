import Link from "next/link";
import { AuthTrailMark } from "./icons";

export function AuthShell({
  maxWidth = 380,
  children,
}: {
  maxWidth?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--pt-bg)",
        color: "var(--pt-text)",
      }}
    >
      <header
        style={{
          flexShrink: 0,
          height: 64,
          paddingLeft: "max(20px, env(safe-area-inset-left))",
          paddingRight: "max(20px, env(safe-area-inset-right))",
          paddingTop: "env(safe-area-inset-top)",
          display: "flex",
          alignItems: "center",
          background: "var(--pt-bg)",
          borderBottom: "0.5px solid var(--pt-border)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Link
          href="/"
          aria-label="PawnTrail home"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "var(--pt-text)",
          }}
        >
          <AuthTrailMark size={24} />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: 18,
              letterSpacing: "-0.01em",
              lineHeight: 1,
            }}
          >
            pawntrail
            <span style={{ color: "var(--pt-amber)" }}>.</span>
          </span>
        </Link>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 24,
          paddingBottom: "max(40px, env(safe-area-inset-bottom))",
          paddingLeft: "max(16px, env(safe-area-inset-left))",
          paddingRight: "max(16px, env(safe-area-inset-right))",
        }}
      >
        <div style={{ width: "100%", maxWidth }}>{children}</div>
      </main>
    </div>
  );
}
