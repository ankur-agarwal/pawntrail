import { requireUser } from "@/lib/supabase/current-user";
import { signOut } from "@/app/(auth)/actions";

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const name = profile?.display_name ?? "Trail walker";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
        }}
      >
        PawnTrail · Dashboard
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>
        Welcome back, {name}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 14,
          color: "var(--pt-text-muted)",
          margin: 0,
        }}
      >
        Your library is empty. Scan your first game to begin.
      </p>
      <form action={signOut}>
        <button
          type="submit"
          style={{
            marginTop: 12,
            padding: "6px 14px",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: "transparent",
            color: "var(--pt-text)",
            border: "0.5px solid var(--pt-border-strong)",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
