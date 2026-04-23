import { createBrowserClient } from "@supabase/ssr";
import { loadPublicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export function createSupabaseBrowserClient() {
  const env = loadPublicEnv();
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
