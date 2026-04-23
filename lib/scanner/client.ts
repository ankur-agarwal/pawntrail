import { loadServerEnv } from "@/lib/env";
import { extractMovesMock } from "./mock";
import type { ExtractorResult } from "./types";

export async function extractMoves(
  imageUrls: string[],
): Promise<ExtractorResult> {
  const env = loadServerEnv();

  if (env.PT_SCANNER_BACKEND === "mock" || env.PT_EXTRACTOR_URL === "mock") {
    return extractMovesMock(imageUrls);
  }

  if (env.PT_SCANNER_BACKEND === "ocr") {
    return {
      success: false,
      error: "ocr_backend_not_implemented",
      message: "OCR backend is post-v1 — see tasks.md Open decisions",
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (env.PT_EXTRACTOR_TOKEN) {
    headers["Authorization"] = `Bearer ${env.PT_EXTRACTOR_TOKEN}`;
  }

  try {
    const res = await fetch(`${env.PT_EXTRACTOR_URL}/api/extract`, {
      method: "POST",
      headers,
      body: JSON.stringify({ imageUrls, model: "anthropic" }),
    });

    if (!res.ok) {
      return {
        success: false,
        error: `extractor_http_${res.status}`,
        message: await res.text().catch(() => ""),
      };
    }

    return (await res.json()) as ExtractorResult;
  } catch (e) {
    return {
      success: false,
      error: "extractor_network_error",
      message: (e as Error).message,
    };
  }
}
