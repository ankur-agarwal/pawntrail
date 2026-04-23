import type Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { loadPublicEnv, loadServerEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

function serviceRoleClient() {
  const pub = loadPublicEnv();
  const srv = loadServerEnv();
  return createClient<Database>(
    pub.NEXT_PUBLIC_SUPABASE_URL,
    srv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

type Plan = "free" | "pro_monthly" | "pro_yearly";

function planFromPriceId(priceId: string | null | undefined): Plan {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) return "pro_monthly";
  if (priceId === process.env.STRIPE_PRICE_PRO_YEARLY) return "pro_yearly";
  return "free";
}

export async function syncSubscriptionToProfile(
  event: Stripe.Event,
): Promise<void> {
  const supabase = serviceRoleClient();

  if (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const obj = event.data.object as
      | Stripe.Checkout.Session
      | Stripe.Subscription;

    const userId =
      (obj.metadata as Record<string, string> | null | undefined)?.user_id ??
      null;
    if (!userId) return;

    let plan: Plan = "free";
    let subscriptionId: string | null = null;
    let customerId: string | null = null;

    if ("subscription" in obj && typeof obj.customer === "string") {
      customerId = obj.customer;
    }

    if (event.type === "checkout.session.completed") {
      const session = obj as Stripe.Checkout.Session;
      subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : (session.subscription?.id ?? null);
      customerId =
        typeof session.customer === "string"
          ? session.customer
          : (session.customer?.id ?? null);
    }

    if ("items" in obj) {
      const sub = obj as Stripe.Subscription;
      subscriptionId = sub.id;
      customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const priceId = sub.items.data[0]?.price.id;
      plan = planFromPriceId(priceId);
      if (sub.status === "canceled" || sub.status === "incomplete_expired") {
        plan = "free";
      }
    }

    if (event.type === "customer.subscription.deleted") {
      plan = "free";
    }

    // Quota clamp: on downgrade, keep limit ≥ scan_quota_used so we don't
    // show "73 / 15 used" — blocker stays "used ≥ limit".
    const { data: profile } = await supabase
      .from("profiles")
      .select("scan_quota_used")
      .eq("id", userId)
      .single();
    const used = profile?.scan_quota_used ?? 0;
    const limit =
      plan === "free" ? Math.max(15, used) : Number.MAX_SAFE_INTEGER;

    await supabase
      .from("profiles")
      .update({
        plan,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        scan_quota_limit: limit,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }
}
