import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ThemeToggle } from "./_components/ThemeToggle";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main style={{ background: "var(--pt-bg)", color: "var(--pt-text)" }}>
      <Nav />
      <Hero />
      <FeatureRow />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <nav
      style={{
        height: 64,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "0.5px solid var(--pt-border)",
        background: "var(--pt-bg)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          color: "var(--pt-text)",
        }}
      >
        <TrailMark size={26} />
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: 20,
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          pawntrail
          <span style={{ color: "var(--pt-amber)" }}>.</span>
        </span>
      </Link>

      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <a href="#features" style={navLinkStyle}>
          Features
        </a>
        <a href="#pricing" style={navLinkStyle}>
          Pricing
        </a>
        <Link href="/signin" style={navLinkStyle}>
          Sign in
        </Link>
        <ThemeToggle />
        <Link
          href="/signin"
          style={{
            ...primaryButtonStyle,
            height: 32,
            padding: "0 16px",
            fontSize: 13,
          }}
        >
          Start free
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section
      style={{
        position: "relative",
        padding: "72px 56px 96px",
        overflow: "hidden",
      }}
    >
      <ContourBg />

      <span style={{ ...cornerLabelStyle, top: 20, left: 24 }}>01 · MARK</span>
      <span style={{ ...cornerLabelStyle, top: 20, right: 24 }}>
        PAWNTRAIL / CARTOGRAPHIC PRECISION
      </span>

      <div
        style={{
          position: "relative",
          maxWidth: 760,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <TrailMark size={88} />
        </div>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: "clamp(40px, 6vw, 56px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            margin: "0 0 18px",
            color: "var(--pt-text)",
          }}
        >
          Snap the scoresheet.
          <br />
          <span style={{ color: "var(--pt-amber)" }}>Chart the trail.</span>
        </h1>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "clamp(18px, 2vw, 22px)",
            lineHeight: 1.4,
            color: "var(--pt-text-muted)",
            margin: "0 0 32px",
          }}
        >
          Photo to PGN to engine review in under sixty seconds.
          <br />
          Every game you play, mapped.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/signin"
            style={{ ...primaryButtonStyle, height: 44, padding: "0 20px" }}
          >
            Start free — 15 scans
          </Link>
          <a
            href="#features"
            style={{ ...ghostButtonStyle, height: 44, padding: "0 20px" }}
          >
            See how it works
          </a>
        </div>
        <div id="pricing" style={{ marginTop: 24 }}>
          <span className="pt-micro" style={{ color: "var(--pt-text-dim)" }}>
            NO CREDIT CARD · CANCEL ANY TIME · 4.99/MO AFTER
          </span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 32,
          opacity: 0.7,
          color: "var(--pt-forest-soft)",
        }}
      >
        <TrailLine width={140} height={48} />
      </div>
    </section>
  );
}

function FeatureRow() {
  const features = [
    {
      tag: "01 · CAPTURE",
      title: "Snap, don't type.",
      body: "Point your camera at a paper scoresheet. We handle the rest — angle, lighting, even messy handwriting.",
    },
    {
      tag: "02 · CHART",
      title: "Mapped, not listed.",
      body: "Every game becomes a route through the opening tree, with eval graphs and engine arrows along the way.",
    },
    {
      tag: "03 · CARRY",
      title: "Yours, forever.",
      body: "Export to PGN, push to a Lichess study, or just keep them in your library. Your games, your archive.",
    },
  ];
  return (
    <section
      id="features"
      style={{
        padding: "64px 56px",
        borderTop: "0.5px solid var(--pt-border)",
        background: "var(--pt-bg)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 32,
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {features.map((f) => (
          <div key={f.tag}>
            <span className="pt-micro">{f.tag}</span>
            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: 22,
                letterSpacing: "-0.01em",
                margin: "12px 0 8px",
                color: "var(--pt-text)",
              }}
            >
              {f.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--pt-text-muted)",
                margin: 0,
              }}
            >
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        padding: "32px 56px",
        borderTop: "0.5px solid var(--pt-border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        color: "var(--pt-text-muted)",
        fontSize: 12,
      }}
    >
      <span className="pt-micro">PAWNTRAIL · v1</span>
      <div style={{ display: "flex", gap: 20 }}>
        <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>
          Privacy
        </Link>
        <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>
          Terms
        </Link>
      </div>
    </footer>
  );
}

// ─── inline SVG marks (theme-aware via CSS vars) ────────────────

function TrailMark({ size = 64 }: { size?: number }) {
  const ink = "var(--pt-text)";
  const bg = "var(--pt-bg)";
  const amber = "var(--pt-amber)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-label="PawnTrail"
      style={{ display: "block", flexShrink: 0 }}
    >
      <g fill={ink}>
        <circle cx="14" cy="86" r="6" />
        <circle cx="14" cy="74" r="1.5" />
        <circle cx="14" cy="68" r="1.5" />
        <circle cx="14" cy="62" r="1.5" />
        <circle cx="14" cy="56" r="1.5" />
        <circle cx="18" cy="50" r="1.5" />
        <circle cx="24" cy="50" r="1.5" />
        <circle cx="30" cy="50" r="1.5" />
        <circle cx="36" cy="50" r="1.5" />
        <circle cx="42" cy="50" r="1.5" />
        <circle cx="50" cy="50" r="5" />
        <circle cx="50" cy="44" r="1.5" />
        <circle cx="50" cy="38" r="1.5" />
        <circle cx="50" cy="32" r="1.5" />
        <circle cx="50" cy="26" r="1.5" />
        <circle cx="50" cy="20" r="1.5" />
        <circle cx="56" cy="14" r="1.5" />
        <circle cx="62" cy="14" r="1.5" />
        <circle cx="68" cy="14" r="1.5" />
        <circle cx="74" cy="14" r="1.5" />
      </g>
      <circle cx="50" cy="50" r="2.2" fill={bg} />
      <circle cx="84" cy="14" r="6.5" fill={amber} />
      <circle cx="84" cy="14" r="2.6" fill={bg} />
    </svg>
  );
}

function TrailLine({ width = 140, height = 48 }: { width?: number; height?: number }) {
  const stroke = "currentColor";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path
        d={`M 6 ${height - 6} L 6 ${height / 2} L ${width / 2} ${height / 2} L ${width / 2} 6 L ${width - 6} 6`}
        stroke={stroke}
        strokeWidth="1.2"
        strokeDasharray="1.5 5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="6" cy={height - 6} r="3.5" fill={stroke} />
      <circle cx={width - 6} cy="6" r="4.5" fill="var(--pt-amber)" />
      <circle cx={width - 6} cy="6" r="1.8" fill="var(--pt-bg)" />
    </svg>
  );
}

function ContourBg() {
  const ys = [20, 40, 60, 80, 100, 120, 140, 160];
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 200"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.18,
        color: "var(--pt-text-dim)",
        pointerEvents: "none",
      }}
      aria-hidden
    >
      {ys.map((y, i) => (
        <path
          key={y}
          d={`M 0 ${y} Q 80 ${y - 10 - i * 1.5} 160 ${y} T 320 ${y} T 480 ${y}`}
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />
      ))}
    </svg>
  );
}

// ─── shared inline styles ───────────────────────────────────────

const navLinkStyle: React.CSSProperties = {
  color: "var(--pt-text-muted)",
  textDecoration: "none",
  fontSize: 13,
  fontFamily: "var(--font-sans)",
};

const cornerLabelStyle: React.CSSProperties = {
  position: "absolute",
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--pt-text-dim)",
  zIndex: 1,
};

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--pt-amber)",
  color: "#fff",
  border: "0.5px solid var(--pt-amber-deep)",
  borderRadius: "var(--pt-r-card)",
  fontFamily: "var(--font-sans)",
  fontWeight: 500,
  fontSize: 14,
  letterSpacing: "0.01em",
  textDecoration: "none",
  cursor: "pointer",
  transition: "background 120ms ease",
};

const ghostButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  color: "var(--pt-text)",
  border: "0.5px solid var(--pt-border-strong)",
  borderRadius: "var(--pt-r-card)",
  fontFamily: "var(--font-sans)",
  fontWeight: 500,
  fontSize: 14,
  letterSpacing: "0.01em",
  textDecoration: "none",
  cursor: "pointer",
  transition: "background 120ms ease",
};
