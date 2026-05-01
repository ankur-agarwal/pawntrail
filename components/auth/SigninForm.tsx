"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  signInWithEmail,
  signInWithGoogle,
  type EmailFormState,
} from "@/app/(auth)/actions";
import { Dots, GoogleG } from "./icons";

export function SigninForm({
  errorMessage,
  redirectTo,
}: {
  errorMessage?: string | null;
  redirectTo?: string;
}) {
  const [state, formAction] = useActionState<EmailFormState, FormData>(
    signInWithEmail,
    null,
  );

  const inlineError = state?.error ?? errorMessage ?? null;

  return (
    <>
      <form action={formAction} noValidate>
        <input type="hidden" name="redirect" value={redirectTo ?? ""} />
        <label
          htmlFor="email"
          style={{
            display: "block",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--pt-text-muted)",
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
          autoFocus
          inputMode="email"
          placeholder="you@example.com"
          defaultValue={state?.email ?? ""}
          aria-invalid={inlineError ? true : undefined}
          aria-describedby={inlineError ? "email-error" : undefined}
          style={{
            width: "100%",
            height: 44,
            padding: "0 14px",
            fontSize: 15,
            background: "var(--pt-surface)",
            color: "var(--pt-text)",
            border: `0.5px solid ${inlineError ? "var(--pt-blunder)" : "var(--pt-border-strong)"}`,
            borderRadius: "var(--pt-r-card)",
            fontFamily: "inherit",
            outline: "none",
            display: "block",
          }}
        />
        {inlineError && (
          <div
            id="email-error"
            role="alert"
            style={{
              fontSize: 12,
              color: "var(--pt-blunder)",
              marginTop: 8,
            }}
          >
            {inlineError}
          </div>
        )}
        <div style={{ height: 12 }} />
        <PrimaryButton />
      </form>

      <OrDivider />

      <form action={signInWithGoogle}>
        <input type="hidden" name="redirect" value={redirectTo ?? ""} />
        <GoogleSubmit />
      </form>

      <p
        style={{
          fontSize: 11,
          lineHeight: 1.6,
          color: "var(--pt-text-dim)",
          textAlign: "center",
          marginTop: 20,
          marginBottom: 0,
        }}
      >
        By continuing you agree to the{" "}
        <a href="/terms" style={{ color: "var(--pt-text-muted)" }}>
          Terms
        </a>
        {" · "}
        <a href="/privacy" style={{ color: "var(--pt-text-muted)" }}>
          Privacy
        </a>
      </p>
    </>
  );
}

function PrimaryButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
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
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        transition: "opacity 120ms ease",
      }}
    >
      {pending ? (
        <>
          Sending link <Dots color="#fff" size={3} />
        </>
      ) : (
        "Send magic link"
      )}
    </button>
  );
}

function GoogleSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        width: "100%",
        height: 44,
        padding: "0 16px",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: "0.01em",
        background: "var(--pt-surface)",
        color: "var(--pt-text)",
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: "var(--pt-r-card)",
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        transition: "opacity 120ms ease",
      }}
    >
      <GoogleG size={16} />
      {pending ? "Redirecting" : "Continue with Google"}
      {pending && <Dots color="var(--pt-text-muted)" size={3} />}
    </button>
  );
}

function OrDivider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "16px 0",
      }}
    >
      <span style={{ flex: 1, height: 0.5, background: "var(--pt-border)" }} />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.18em",
          color: "var(--pt-text-dim)",
          textTransform: "uppercase",
        }}
      >
        or
      </span>
      <span style={{ flex: 1, height: 0.5, background: "var(--pt-border)" }} />
    </div>
  );
}
