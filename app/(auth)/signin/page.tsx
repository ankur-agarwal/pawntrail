import { TrailMark } from "@/components/brand/TrailMark";
import { signInWithGoogle, signInWithEmail } from "@/app/(auth)/actions";

type SearchParams = { error?: string; redirect?: string };

export default async function SigninPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { error, redirect } = await searchParams;
  const errorMessage = error ? decodeURIComponent(error) : null;

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
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          <TrailMark size={52} />
        </div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 500,
            margin: 0,
            textAlign: "center",
            marginBottom: 6,
          }}
        >
          Welcome to PawnTrail
        </h1>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 15,
            color: "var(--pt-text-muted)",
            margin: 0,
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          Snap the scoresheet. Chart the trail.
        </p>

        {errorMessage && (
          <div
            role="alert"
            style={{
              padding: "10px 12px",
              borderRadius: 6,
              background: "rgba(169, 79, 36, 0.08)",
              border: "0.5px solid var(--pt-border-strong)",
              color: "var(--pt-ink)",
              fontSize: 12,
              marginBottom: 14,
            }}
          >
            {errorMessage}
          </div>
        )}

        <form action={signInWithGoogle} style={{ marginBottom: 16 }}>
          <input type="hidden" name="redirect" value={redirect ?? ""} />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 500,
              background: "var(--pt-forest)",
              color: "var(--pt-cream)",
              border: "0.5px solid var(--pt-forest)",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Continue with Google
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "18px 0",
            color: "var(--pt-text-dim)",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ flex: 1, height: 0.5, background: "var(--pt-border)" }} />
          or
          <div style={{ flex: 1, height: 0.5, background: "var(--pt-border)" }} />
        </div>

        <form action={signInWithEmail}>
          <input type="hidden" name="redirect" value={redirect ?? ""} />
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--pt-text-muted)",
              fontFamily: "var(--font-mono)",
              marginBottom: 6,
            }}
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: 14,
              background: "transparent",
              color: "var(--pt-text)",
              border: "0.5px solid var(--pt-border-strong)",
              borderRadius: 6,
              fontFamily: "inherit",
              marginBottom: 12,
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 500,
              background: "transparent",
              color: "var(--pt-text)",
              border: "0.5px solid var(--pt-border-strong)",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Send magic link
          </button>
        </form>

        <p
          style={{
            fontSize: 11,
            color: "var(--pt-text-dim)",
            textAlign: "center",
            marginTop: 20,
            marginBottom: 0,
          }}
        >
          By continuing you agree to the{" "}
          <a href="/terms" style={{ color: "var(--pt-text-muted)" }}>
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" style={{ color: "var(--pt-text-muted)" }}>
            Privacy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
