import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";
import { loadPublicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/scan",
  "/games",
  "/openings",
  "/settings",
];

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => path === p || path.startsWith(p + "/"),
  );

  if (!isProtected) {
    return response;
  }

  const env = loadPublicEnv();
  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {
          // read-only here; updateSession() already wrote refreshed cookies
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(signinUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|icon.png|apple-icon.png|brand|auth/callback|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
};
