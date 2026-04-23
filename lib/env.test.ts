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
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    const { loadPublicEnv } = await import("./env");
    expect(() => loadPublicEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is not a URL", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "not-a-url";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    const { loadPublicEnv } = await import("./env");
    expect(() => loadPublicEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("throws when NEXT_PUBLIC_APP_URL is missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    delete process.env.NEXT_PUBLIC_APP_URL;
    const { loadPublicEnv } = await import("./env");
    expect(() => loadPublicEnv()).toThrow(/NEXT_PUBLIC_APP_URL/);
  });

  it("returns the parsed values when all vars are present", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    const { loadPublicEnv } = await import("./env");
    const env = loadPublicEnv();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://abc.supabase.co");
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("anon-key");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });
});

describe("loadServerEnv", () => {
  const original = { ...process.env };

  beforeEach(() => {
    process.env = { ...original };
  });

  afterEach(() => {
    process.env = original;
  });

  it("throws when SUPABASE_SERVICE_ROLE_KEY is missing", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.PT_EXTRACTOR_URL = "mock";
    const { loadServerEnv } = await import("./env");
    expect(() => loadServerEnv()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("throws when PT_EXTRACTOR_URL is missing", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "srk";
    delete process.env.PT_EXTRACTOR_URL;
    const { loadServerEnv } = await import("./env");
    expect(() => loadServerEnv()).toThrow(/PT_EXTRACTOR_URL/);
  });

  it("defaults PT_SCANNER_BACKEND to 'llm'", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "srk";
    process.env.PT_EXTRACTOR_URL = "https://knightvision.example.com";
    delete process.env.PT_SCANNER_BACKEND;
    const { loadServerEnv } = await import("./env");
    expect(loadServerEnv().PT_SCANNER_BACKEND).toBe("llm");
  });

  it("accepts 'mock' as PT_EXTRACTOR_URL (dev shortcut)", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "srk";
    process.env.PT_EXTRACTOR_URL = "mock";
    process.env.PT_SCANNER_BACKEND = "mock";
    const { loadServerEnv } = await import("./env");
    const env = loadServerEnv();
    expect(env.PT_EXTRACTOR_URL).toBe("mock");
    expect(env.PT_SCANNER_BACKEND).toBe("mock");
  });
});
