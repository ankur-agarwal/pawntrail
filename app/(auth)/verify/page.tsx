import { TrailMark } from "@/components/brand/TrailMark";

type SearchParams = { email?: string };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { email } = await searchParams;
  const masked = email
    ? email.replace(/^(.{2}).+(@.+)$/, "$1…$2")
    : "your email";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "var(--pt-bg)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          padding: "32px 32px 28px",
          border: "0.5px solid var(--pt-border-strong)",
          borderRadius: 12,
          background: "var(--pt-bg-elev)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          <TrailMark size={48} />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 10px" }}>
          Check your email
        </h1>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 14,
            color: "var(--pt-text-muted)",
            margin: "0 0 20px",
          }}
        >
          We sent a magic link to{" "}
          <span style={{ fontFamily: "var(--font-mono)", fontStyle: "normal" }}>
            {masked}
          </span>
          .
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--pt-text-muted)",
            margin: "0 0 20px",
          }}
        >
          Click the link in the email to sign in. You can close this tab — the
          link will open PawnTrail in a new one.
        </p>
        <a
          href="/signin"
          style={{
            fontSize: 12,
            color: "var(--pt-amber)",
            textDecoration: "none",
          }}
        >
          ← Try a different email
        </a>
      </div>
    </main>
  );
}
