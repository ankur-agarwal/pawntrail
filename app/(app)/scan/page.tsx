import { requireUser } from "@/lib/supabase/current-user";
import { UploadDropzone } from "@/components/scan/UploadDropzone";

export default async function ScanPage() {
  await requireUser();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
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
        PawnTrail · Scan
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 6px" }}>
        Scan a new sheet
      </h1>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 14,
          color: "var(--pt-text-muted)",
          margin: "0 0 24px",
        }}
      >
        Snap a photo. We&apos;ll read the moves off the sheet.
      </p>
      <UploadDropzone />
    </main>
  );
}
