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
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--pt-text-dim)",
          }}
        >
          Phase 0 · Foundation shipped
        </p>
      </div>
    </main>
  );
}
