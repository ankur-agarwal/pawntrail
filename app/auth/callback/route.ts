import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const POST_AUTH_NEXT_COOKIE = "pt-auth-next";
const PENDING_EMAIL_COOKIE = "pt-pending-email";
const PENDING_REDIRECT_COOKIE = "pt-pending-redirect";

function safeNext(value: string | null | undefined): string {
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const jar = await cookies();
  const next = safeNext(
    jar.get(POST_AUTH_NEXT_COOKIE)?.value ?? searchParams.get("next"),
  );

  if (!code) {
    return NextResponse.redirect(`${origin}/expired?reason=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/expired?reason=${encodeURIComponent(error.message)}`,
    );
  }

  const response = NextResponse.redirect(
    `${origin}/welcome?next=${encodeURIComponent(next)}`,
  );
  response.cookies.delete(POST_AUTH_NEXT_COOKIE);
  response.cookies.delete(PENDING_EMAIL_COOKIE);
  response.cookies.delete(PENDING_REDIRECT_COOKIE);
  return response;
}
