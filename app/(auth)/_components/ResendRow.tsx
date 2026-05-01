"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { resendMagicLink } from "@/app/(auth)/actions";
import { Dots } from "@/components/auth/icons";

const COUNTDOWN_SECONDS = 30;

export function ResendRow({
  email,
  initialResent = false,
}: {
  email: string;
  initialResent?: boolean;
}) {
  const [secondsLeft, setSecondsLeft] = useState(
    initialResent ? COUNTDOWN_SECONDS : COUNTDOWN_SECONDS,
  );
  const [showResent, setShowResent] = useState(initialResent);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  useEffect(() => {
    if (!showResent) return;
    const id = window.setTimeout(() => setShowResent(false), 3000);
    return () => window.clearTimeout(id);
  }, [showResent]);

  const canResend = secondsLeft <= 0;
  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const timer = `${mm}:${ss}`;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: "var(--pt-text-muted)",
        minHeight: 20,
      }}
    >
      {showResent ? (
        <>
          <span style={{ color: "var(--pt-good)" }} aria-hidden>
            ✓
          </span>
          <span>Sent a new link to your inbox.</span>
        </>
      ) : canResend ? (
        <form action={resendMagicLink} style={{ display: "inline-flex" }}>
          <input type="hidden" name="email" value={email} />
          <ResendButton />
        </form>
      ) : (
        <>
          <span>Didn&rsquo;t get it?&nbsp;</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--pt-text-dim)",
            }}
          >
            resend in {timer}
          </span>
        </>
      )}
    </div>
  );
}

function ResendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: pending ? "not-allowed" : "pointer",
        color: "var(--pt-amber)",
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        textDecoration: "underline",
        textDecorationStyle: "dashed",
        textUnderlineOffset: 3,
      }}
    >
      {pending ? (
        <>
          Sending <Dots color="var(--pt-amber)" size={3} />
        </>
      ) : (
        "Resend link"
      )}
    </button>
  );
}
