"use client";

import { useFormStatus } from "react-dom";
import { Dots } from "@/components/auth/icons";

export function ResendButton() {
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
        "Send a new link"
      )}
    </button>
  );
}
