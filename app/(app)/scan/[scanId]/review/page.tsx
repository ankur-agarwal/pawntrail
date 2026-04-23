import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/current-user";

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
  const moves = raw?.data?.moves ?? [];

  return (
    <main style={{ padding: 40, maxWidth: 720, margin: "0 auto" }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
          marginBottom: 8,
        }}
      >
        PawnTrail · Review (Group A placeholder)
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 16 }}>
        Parsed {moves.length} moves
      </h1>
      <pre
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          padding: 16,
          border: "0.5px solid var(--pt-border)",
          borderRadius: 6,
          background: "var(--pt-bg-elev)",
          overflow: "auto",
          margin: 0,
        }}
      >
        {moves
          .map(
            (m) =>
              `${m.moveNumber}. ${m.white}${m.black ? " " + m.black : ""}`,
          )
          .join("\n")}
      </pre>
      <p
        style={{
          fontSize: 12,
          color: "var(--pt-text-dim)",
          marginTop: 24,
          fontStyle: "italic",
          fontFamily: "var(--font-serif)",
        }}
      >
        Board + flagged-move editing lands in Group B.
      </p>
    </main>
  );
}
