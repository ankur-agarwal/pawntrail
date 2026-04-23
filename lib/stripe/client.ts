import Stripe from "stripe";

/**
 * Returns a Stripe client, or `null` when Stripe keys aren't configured.
 * Phase 11 scaffold: real integration gated behind env presence so local dev
 * doesn't require Stripe keys.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? null,
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? null,
} as const;

export function stripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}
