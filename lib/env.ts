import { z, type ZodError } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PT_EXTRACTOR_URL: z.string().min(1),
  PT_EXTRACTOR_TOKEN: z.string().optional(),
  PT_SCANNER_BACKEND: z.enum(["llm", "ocr", "mock"]).default("llm"),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

export function loadPublicEnv(): PublicEnv {
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
  if (!parsed.success) throwZodFields(parsed.error);
  return parsed.data;
}

export function loadServerEnv(): ServerEnv {
  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PT_EXTRACTOR_URL: process.env.PT_EXTRACTOR_URL,
    PT_EXTRACTOR_TOKEN: process.env.PT_EXTRACTOR_TOKEN,
    PT_SCANNER_BACKEND: process.env.PT_SCANNER_BACKEND,
  });
  if (!parsed.success) throwZodFields(parsed.error);
  return parsed.data;
}

function throwZodFields(err: ZodError): never {
  const fields = err.issues.map((i) => i.path.join(".")).join(", ");
  throw new Error(`Missing or invalid env: ${fields}`);
}
