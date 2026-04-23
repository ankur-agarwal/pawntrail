import { TrailMark } from "@/components/brand/TrailMark";
import { SigninForm } from "@/components/auth/SigninForm";

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
        <SigninForm errorMessage={errorMessage} redirectTo={redirect} />
      </div>
    </main>
  );
}
