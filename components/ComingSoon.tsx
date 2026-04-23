export function ComingSoon({ name }: { name: string }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          padding: "32px 40px",
          border: "0.5px solid var(--pt-border-strong)",
          borderRadius: 12,
          background: "var(--pt-bg-elev)",
          textAlign: "center",
          maxWidth: 440,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--pt-text-muted)",
            marginBottom: 8,
          }}
        >
          PawnTrail
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 500,
            margin: 0,
            marginBottom: 6,
          }}
        >
          {name}
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--pt-text-muted)",
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
          }}
        >
          Coming soon.
        </p>
      </div>
    </main>
  );
}
