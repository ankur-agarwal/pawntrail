import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("loadPublicEnv", () => {
  const original = { ...process.env };

  beforeEach(() => {
    process.env = { ...original };
  });

  afterEach(() => {
    process.env = original;
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    const { loadPublicEnv } = await import("./env");
    expect(() => loadPublicEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is not a URL", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "not-a-url";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    const { loadPublicEnv } = await import("./env");
    expect(() => loadPublicEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("returns the parsed values when all vars are present", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    const { loadPublicEnv } = await import("./env");
    const env = loadPublicEnv();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://abc.supabase.co");
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("anon-key");
  });
});
