import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { loadPublicEnv } from "@/lib/env";

export async function POST() {
  const stripe = getStripe();
  if (!stripe)
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 501 },
    );

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "no_stripe_customer" }, { status: 400 });
  }

  const env = loadPublicEnv();
  const portal = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return NextResponse.json({ url: portal.url });
}
