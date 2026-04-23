import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe, PRICE_IDS } from "@/lib/stripe/client";
import { loadPublicEnv } from "@/lib/env";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 501 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { plan } = (await req.json().catch(() => ({}))) as {
    plan?: "pro_monthly" | "pro_yearly";
  };
  if (!plan || !PRICE_IDS[plan]) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }
  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: "price_not_configured" }, { status: 501 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const env = loadPublicEnv();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id
      ? undefined
      : (profile?.email ?? undefined),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/settings/billing?status=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/settings/billing?status=cancelled`,
    subscription_data: { metadata: { user_id: user.id } },
    metadata: { user_id: user.id },
  });

  return NextResponse.json({ url: session.url });
}
