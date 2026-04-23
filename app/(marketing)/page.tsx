import { redirect } from "next/navigation";
import { TrailMark } from "@/components/brand/TrailMark";
import { SigninForm } from "@/components/auth/SigninForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

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
          maxWidth: 400,
          padding: "36px 36px 28px",
          border: "0.5px solid var(--pt-border-strong)",
          borderRadius: 12,
          background: "var(--pt-bg-elev)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <TrailMark size={64} />
        </div>
        <SigninForm showTagline />
      </div>
    </main>
  );
}
