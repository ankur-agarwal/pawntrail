import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuthShell } from "@/components/auth/AuthShell";
import { Dots, SuccessMark } from "@/components/auth/icons";
import { AutoRedirect } from "../_components/AutoRedirect";

type SearchParams = { next?: string };

function safeNext(raw: string | undefined) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

function firstName(profile: { display_name?: string | null } | null, email?: string | null) {
  const name = profile?.display_name?.trim();
  if (name) return name.split(/\s+/)[0];
  if (email) return email.split("@")[0];
  return null;
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { next } = await searchParams;
  const dest = safeNext(next);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const name = firstName(profile, user.email);

  return (
    <AuthShell maxWidth={340}>
      <AutoRedirect to={dest} delayMs={1600} />
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 22,
          }}
        >
          <SuccessMark size={64} />
        </div>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            margin: "0 0 6px",
          }}
        >
          You&rsquo;re signed in
        </h1>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 17,
            lineHeight: 1.4,
            color: "var(--pt-text-muted)",
            margin: "0 0 24px",
          }}
        >
          {name ? `Welcome back, ${name}.` : "Welcome back."}
          <br />
          Taking you to your dashboard…
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--pt-text-dim)",
          }}
        >
          <Dots color="var(--pt-text-dim)" size={3} />
          <span>Redirecting</span>
        </div>
      </div>
    </AuthShell>
  );
}
