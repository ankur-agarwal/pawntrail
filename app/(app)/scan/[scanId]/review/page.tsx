import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/current-user";
import { ReviewEditor } from "@/components/scan/ReviewEditor";
import type { ExtractedMovePair } from "@/lib/scanner/types";

type RawOcrShape = {
  data?: {
    moves?: Array<{ moveNumber: number; white: string; black?: string }>;
  };
};

export default async function ScanReviewPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  await requireUser();
  const { scanId } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: scan } = await supabase
    .from("scans")
    .select("*")
    .eq("id", scanId)
    .maybeSingle();

  if (!scan) notFound();
  if (scan.status !== "parsed" && scan.status !== "edited") {
    redirect("/scan");
  }

  const raw = scan.raw_ocr_json as RawOcrShape | null;
  const pairs: ExtractedMovePair[] = raw?.data?.moves ?? [];

  let sheetUrl: string | null = null;
  const firstKey = scan.image_paths[0];
  if (firstKey) {
    const { data: signed } = await supabase.storage
      .from("scoresheets")
      .createSignedUrl(firstKey, 600);
    sheetUrl = signed?.signedUrl ?? null;
  }

  return (
    <ReviewEditor scanId={scanId} initialPairs={pairs} sheetUrl={sheetUrl} />
  );
}
