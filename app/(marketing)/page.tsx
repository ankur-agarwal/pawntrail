import { TrailMark } from "@/components/brand/TrailMark";
import { DevThemeToggle } from "@/components/dev/DevThemeToggle";

export default function MarketingHome() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "var(--pt-bg)",
        color: "var(--pt-text)",
      }}
    >
      <DevThemeToggle />
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <TrailMark size={72} />
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 500,
            margin: "0 0 10px",
            letterSpacing: "0.02em",
          }}
        >
          PawnTrail
        </h1>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--pt-text-muted)",
            margin: "0 0 24px",
          }}
        >
          Snap the scoresheet. Chart the trail.
        </p>
        <a
          href="/signin"
          style={{
            display: "inline-block",
            padding: "10px 22px",
            fontSize: 14,
            fontWeight: 500,
            background: "var(--pt-forest)",
            color: "var(--pt-cream)",
            border: "0.5px solid var(--pt-forest)",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Sign in
        </a>
      </div>
    </main>
  );
}
