import { NextResponse, type NextRequest } from "next/server";
import { getStripe, stripeWebhookSecret } from "@/lib/stripe/client";
import { syncSubscriptionToProfile } from "@/lib/stripe/sync";
import { createClient } from "@supabase/supabase-js";
import { loadPublicEnv, loadServerEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = stripeWebhookSecret();
  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 501 },
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  const pub = loadPublicEnv();
  const srv = loadServerEnv();
  const service = createClient<Database>(
    pub.NEXT_PUBLIC_SUPABASE_URL,
    srv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  // Idempotency via UNIQUE(stripe_event_id)
  const userIdFromEvent =
    (event.data.object as { metadata?: { user_id?: string } | null })
      ?.metadata?.user_id ?? null;

  const { error: insertError } = await service
    .from("billing_events")
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event as unknown as Database["public"]["Tables"]["billing_events"]["Insert"]["payload"],
      user_id: userIdFromEvent,
    });

  if (insertError && insertError.code !== "23505") {
    // 23505 = unique_violation → already processed; safe to return OK
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (!insertError) {
    // Only sync on first receive (new row inserted)
    await syncSubscriptionToProfile(event);
  }

  return NextResponse.json({ received: true });
}
