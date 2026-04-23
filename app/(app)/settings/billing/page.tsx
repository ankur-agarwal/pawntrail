import { requireUser } from "@/lib/supabase/current-user";
import { ManageBillingButton } from "@/components/settings/ManageBillingButton";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { profile } = await requireUser();
  const sp = await searchParams;
  const plan = profile?.plan ?? "free";
  const limit = profile?.scan_quota_limit ?? 15;
  const used = profile?.scan_quota_used ?? 0;

  return (
    <main style={{ padding: "40px 24px", maxWidth: 720, margin: "0 auto" }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
          marginBottom: 4,
        }}
      >
        PawnTrail · Billing
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 24px" }}>
        Billing
      </h1>

      {sp.status === "success" && <Alert tone="good">Subscription activated — welcome to Pro.</Alert>}
      {sp.status === "cancelled" && <Alert tone="muted">Checkout cancelled.</Alert>}

      <div
        style={{
          padding: 16,
          border: "0.5px solid var(--pt-border-strong)",
          borderRadius: 8,
          background: "var(--pt-bg-elev)",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--pt-text-muted)",
            fontFamily: "var(--font-mono)",
            marginBottom: 12,
          }}
        >
          Plan
        </div>
        <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>
          {plan === "free" && "Free"}
          {plan === "pro_monthly" && "Pro · Monthly"}
          {plan === "pro_yearly" && "Pro · Yearly"}
        </div>
        {plan === "free" ? (
          <p style={{ fontSize: 13, color: "var(--pt-text-muted)", margin: "4px 0 12px" }}>
            {used} of {limit} free scans used.
          </p>
        ) : (
          <p style={{ fontSize: 13, color: "var(--pt-text-muted)", margin: "4px 0 12px" }}>
            Unlimited scans.
          </p>
        )}
        {plan !== "free" && <ManageBillingButton />}
      </div>

      {plan === "free" && (
        <p style={{ fontSize: 12, color: "var(--pt-text-dim)" }}>
          Upgrade prompts appear when you hit your free-scan limit, or from the
          scan page.
        </p>
      )}
    </main>
  );
}

function Alert({
  tone,
  children,
}: {
  tone: "good" | "muted";
  children: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      style={{
        padding: "10px 14px",
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 6,
        background:
          tone === "good"
            ? "rgba(46, 125, 92, 0.1)"
            : "var(--pt-bg-elev)",
        fontSize: 13,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}
