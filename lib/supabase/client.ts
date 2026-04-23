import { createBrowserClient } from "@supabase/ssr";
import { loadPublicEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const env = loadPublicEnv();
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
