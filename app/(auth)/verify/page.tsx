import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { InboxGlyph } from "@/components/auth/icons";
import { ResendRow } from "../_components/ResendRow";
import { readPendingEmail } from "../actions";

type SearchParams = { email?: string; resent?: string; error?: string };

const STEPS: { n: string; t: string; s: string }[] = [
  {
    n: "01",
    t: "Open the email from PawnTrail",
    s: 'Subject: "Your sign-in link"',
  },
  { n: "02", t: 'Tap "Sign in to PawnTrail"', s: "Link expires in 15 minutes" },
  { n: "03", t: "You're in", s: "Same browser, same tab" },
];

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { email: emailParam, resent } = await searchParams;
  const email = emailParam ?? (await readPendingEmail()) ?? "";
  const [local, domain] = email.includes("@")
    ? email.split(/@(.+)/, 2)
    : [email, ""];

  return (
    <AuthShell>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 22,
          }}
        >
          <InboxGlyph size={64} />
        </div>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            margin: "0 0 8px",
          }}
        >
          Check your inbox
        </h1>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 17,
            lineHeight: 1.4,
            color: "var(--pt-text-muted)",
            margin: "0 0 8px",
          }}
        >
          A sign-in link is on its way to
        </p>
        {email && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.01em",
              color: "var(--pt-text)",
              wordBreak: "break-all",
              marginBottom: 28,
            }}
          >
            {local}
            <span style={{ color: "var(--pt-amber)" }}>@</span>
            {domain}
          </div>
        )}

        <div
          style={{
            background: "var(--pt-surface)",
            border: "0.5px solid var(--pt-border)",
            borderRadius: "var(--pt-r-card)",
            padding: "14px 16px",
            textAlign: "left",
            marginBottom: 20,
          }}
        >
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              style={{
                display: "flex",
                gap: 12,
                padding: "10px 0",
                borderTop: i ? "0.5px dashed var(--pt-border)" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--pt-amber)",
                  letterSpacing: "0.04em",
                  paddingTop: 2,
                  flexShrink: 0,
                }}
              >
                {s.n}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--pt-text)",
                  }}
                >
                  {s.t}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--pt-text-dim)",
                    marginTop: 1,
                  }}
                >
                  {s.s}
                </div>
              </div>
            </div>
          ))}
        </div>

        <ResendRow email={email} initialResent={resent === "1"} />

        <div style={{ marginTop: 14 }}>
          <Link
            href="/signin"
            style={{
              color: "var(--pt-text-muted)",
              fontSize: 12,
              textDecoration: "none",
              borderBottom: "0.5px dashed var(--pt-border-strong)",
              paddingBottom: 1,
            }}
          >
            Wrong email? Start over
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
