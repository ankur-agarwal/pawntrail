"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadPublicEnv } from "@/lib/env";

const emailSchema = z.object({
  email: z.string().email(),
  redirect: z.string().optional(),
});

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const env = loadPublicEnv();
  const next = (formData.get("redirect") as string | null) ?? "/dashboard";
  const callbackUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl },
  });

  if (error || !data.url) {
    redirect(
      `/signin?error=${encodeURIComponent(error?.message ?? "oauth_init_failed")}`,
    );
  }

  redirect(data.url);
}

export async function signInWithEmail(formData: FormData) {
  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
    redirect: formData.get("redirect"),
  });

  if (!parsed.success) {
    redirect(`/signin?error=invalid_email`);
  }

  const supabase = await createSupabaseServerClient();
  const env = loadPublicEnv();
  const next = parsed.data.redirect ?? "/dashboard";
  const callbackUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(next)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: callbackUrl,
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(`/signin?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/verify?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
