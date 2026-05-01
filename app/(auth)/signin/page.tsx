import { AuthShell } from "@/components/auth/AuthShell";
import { AuthTrailMark } from "@/components/auth/icons";
import { SigninForm } from "@/components/auth/SigninForm";

type SearchParams = { error?: string; redirect?: string };

const errorCopy: Record<string, string> = {
  invalid_email: "That doesn't look like a valid email.",
  oauth_init_failed: "Couldn't start Google sign-in. Try again.",
  missing_code: "Sign-in link is incomplete. Try sending a new one.",
};

export default async function SigninPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { error, redirect } = await searchParams;
  const inlineError = error
    ? (errorCopy[error] ?? decodeURIComponent(error))
    : null;

  return (
    <AuthShell>
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
      >
        <AuthTrailMark size={56} />
      </div>
      <h1
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          lineHeight: 1.15,
          margin: 0,
          textAlign: "center",
        }}
      >
        Sign in to PawnTrail
      </h1>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 17,
          lineHeight: 1.4,
          color: "var(--pt-text-muted)",
          textAlign: "center",
          margin: "6px 0 24px",
        }}
      >
        We&rsquo;ll send a magic link to your inbox.
        <br />
        No passwords, ever.
      </p>
      <SigninForm errorMessage={inlineError} redirectTo={redirect} />
    </AuthShell>
  );
}
