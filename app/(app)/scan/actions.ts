"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/current-user";
import { extractMoves } from "@/lib/scanner/client";
import type { Scan } from "@/lib/supabase/helpers";
import type { Database } from "@/lib/supabase/types";

type Json = Database["public"]["Tables"]["scans"]["Row"]["raw_ocr_json"];

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export async function createScan(
  formData: FormData,
): Promise<Result<{ scanId: string }>> {
  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, scan_quota_used, scan_quota_limit")
    .eq("id", userId)
    .single();

  if (
    profile &&
    profile.plan === "free" &&
    profile.scan_quota_used >= profile.scan_quota_limit
  ) {
    return { ok: false, error: "quota_exceeded", code: "quota_exceeded" };
  }

  const file = formData.get("image") as File | null;
  if (!file) return { ok: false, error: "no_file" };

  const scanId = crypto.randomUUID();
  const key = `${userId}/${scanId}/sheet-1.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("scoresheets")
    .upload(key, file, { contentType: "image/jpeg", upsert: false });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { error: insertError } = await supabase.from("scans").insert({
    id: scanId,
    user_id: userId,
    image_paths: [key],
    status: "pending",
  });
  if (insertError) return { ok: false, error: insertError.message };

  return { ok: true, data: { scanId } };
}

export async function runScanner(scanId: string): Promise<Result<Scan>> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: scan, error: loadError } = await supabase
    .from("scans")
    .select("*")
    .eq("id", scanId)
    .single();
  if (loadError || !scan) return { ok: false, error: "scan_not_found" };
  if (scan.status === "saved") return { ok: true, data: scan };

  await supabase.from("scans").update({ status: "parsing" }).eq("id", scanId);

  let signed: string[];
  try {
    signed = await Promise.all(
      scan.image_paths.map(async (key) => {
        const { data, error } = await supabase.storage
          .from("scoresheets")
          .createSignedUrl(key, 600);
        if (error || !data) throw new Error(`signed_url_failed: ${key}`);
        return data.signedUrl;
      }),
    );
  } catch (e) {
    await supabase
      .from("scans")
      .update({ status: "failed", error: (e as Error).message })
      .eq("id", scanId);
    return { ok: false, error: (e as Error).message };
  }

  const result = await extractMoves(signed);

  if (!result.success) {
    await supabase
      .from("scans")
      .update({ status: "failed", error: result.error })
      .eq("id", scanId);
    return { ok: false, error: result.error };
  }

  const { data: updated, error: updateError } = await supabase
    .from("scans")
    .update({
      status: "parsed",
      raw_ocr_json: result.data as unknown as Json,
    })
    .eq("id", scanId)
    .select("*")
    .single();
  if (updateError || !updated) {
    return { ok: false, error: updateError?.message ?? "update_failed" };
  }

  return { ok: true, data: updated };
}

export async function getScanStatus(
  scanId: string,
): Promise<Result<Pick<Scan, "id" | "status" | "error">>> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scans")
    .select("id, status, error")
    .eq("id", scanId)
    .maybeSingle();
  if (error || !data) return { ok: false, error: "scan_not_found" };
  return { ok: true, data };
}
