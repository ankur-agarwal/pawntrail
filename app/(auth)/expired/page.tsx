import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ExpiredMark } from "@/components/auth/icons";
import { readPendingEmail, resendMagicLink } from "../actions";
import { ResendButton } from "../_components/ExpiredButtons";

type SearchParams = { email?: string; reason?: string };

export default async function ExpiredPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { email: emailParam } = await searchParams;
  const email = emailParam ?? (await readPendingEmail()) ?? "";

  return (
    <AuthShell maxWidth={360}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 22,
          }}
        >
          <ExpiredMark size={64} />
        </div>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            margin: "0 0 8px",
          }}
        >
          This link has expired
        </h1>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 16,
            lineHeight: 1.4,
            color: "var(--pt-text-muted)",
            margin: "0 0 24px",
          }}
        >
          Magic links last 15 minutes. Trails go cold.
          <br />
          We&rsquo;ll send you a fresh one.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {email ? (
            <form action={resendMagicLink}>
              <input type="hidden" name="email" value={email} />
              <ResendButton />
            </form>
          ) : (
            <Link
              href="/signin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: 44,
                padding: "0 20px",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "0.01em",
                background: "var(--pt-amber)",
                color: "#fff",
                border: "0.5px solid var(--pt-amber-deep)",
                borderRadius: "var(--pt-r-card)",
                textDecoration: "none",
              }}
            >
              Send a new link
            </Link>
          )}
          <Link
            href="/signin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 36,
              padding: "0 16px",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 500,
              background: "transparent",
              color: "var(--pt-text-muted)",
              border: "none",
              borderRadius: "var(--pt-r-card)",
              textDecoration: "none",
            }}
          >
            Use a different email
          </Link>
        </div>

        {email && (
          <div
            style={{
              fontSize: 11,
              color: "var(--pt-text-dim)",
              marginTop: 18,
            }}
          >
            Originally sent to{" "}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--pt-text-muted)",
              }}
            >
              {email}
            </span>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
