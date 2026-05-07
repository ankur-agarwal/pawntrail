"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailSchema = z.object({
  email: z.string().email(),
  redirect: z.string().optional(),
});

const PENDING_EMAIL_COOKIE = "pt-pending-email";
const PENDING_REDIRECT_COOKIE = "pt-pending-redirect";
const POST_AUTH_NEXT_COOKIE = "pt-auth-next";

async function buildCallbackUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto =
    h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  if (!host) {
    throw new Error("Cannot determine request host for auth callback URL");
  }
  return `${proto}://${host}/auth/callback`;
}

async function rememberPostAuthNext(next: string) {
  const jar = await cookies();
  jar.set(POST_AUTH_NEXT_COOKIE, next, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10, // 10 minutes is plenty for an OAuth round-trip
  });
}

export type EmailFormState = {
  error?: string;
  email?: string;
} | null;

async function rememberPending(email: string, redirectTo: string | undefined) {
  const jar = await cookies();
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30, // 30 minutes — magic links last 15
  };
  jar.set(PENDING_EMAIL_COOKIE, email, opts);
  if (redirectTo) jar.set(PENDING_REDIRECT_COOKIE, redirectTo, opts);
  else jar.delete(PENDING_REDIRECT_COOKIE);
}

export async function readPendingEmail(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(PENDING_EMAIL_COOKIE)?.value ?? null;
}

export async function readPendingRedirect(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(PENDING_REDIRECT_COOKIE)?.value ?? null;
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const raw = formData.get("redirect");
  const next = typeof raw === "string" && raw.length > 0 ? raw : "/dashboard";
  await rememberPostAuthNext(next);
  const callbackUrl = await buildCallbackUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl },
  });

  if (error || !data.url) {
    redirect(`/expired?reason=oauth_init_failed`);
  }

  redirect(data.url);
}

export async function signInWithEmail(
  _prev: EmailFormState,
  formData: FormData,
): Promise<EmailFormState> {
  const rawEmail = String(formData.get("email") ?? "").trim();
  const rawRedirect = formData.get("redirect");
  const redirectTo =
    typeof rawRedirect === "string" && rawRedirect.length > 0
      ? rawRedirect
      : undefined;

  const parsed = emailSchema.safeParse({ email: rawEmail, redirect: redirectTo });
  if (!parsed.success) {
    return {
      error: "That doesn't look like a valid email.",
      email: rawEmail,
    };
  }

  const supabase = await createSupabaseServerClient();
  const next = redirectTo ?? "/dashboard";
  await rememberPostAuthNext(next);
  const callbackUrl = await buildCallbackUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: callbackUrl, shouldCreateUser: true },
  });

  if (error) {
    return {
      error: "Couldn't send right now. Try again.",
      email: parsed.data.email,
    };
  }

  await rememberPending(parsed.data.email, redirectTo);
  redirect(`/verify?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function resendMagicLink(formData: FormData) {
  const rawEmail = String(formData.get("email") ?? "").trim();
  const parsed = emailSchema.safeParse({ email: rawEmail });
  if (!parsed.success) {
    redirect("/signin");
  }

  const supabase = await createSupabaseServerClient();
  const jar = await cookies();
  const cachedNext = jar.get(PENDING_REDIRECT_COOKIE)?.value;
  const next = cachedNext && cachedNext.length > 0 ? cachedNext : "/dashboard";
  await rememberPostAuthNext(next);
  const callbackUrl = await buildCallbackUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: callbackUrl, shouldCreateUser: true },
  });

  if (error) {
    redirect(
      `/verify?email=${encodeURIComponent(parsed.data.email)}&error=resend_failed`,
    );
  }

  await rememberPending(parsed.data.email, cachedNext);
  redirect(`/verify?email=${encodeURIComponent(parsed.data.email)}&resent=1`);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
