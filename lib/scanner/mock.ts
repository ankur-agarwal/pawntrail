import type { ExtractorResult } from "./types";
import fixture from "./__fixtures__/ruy-lopez.json";

export async function extractMovesMock(
  _imageUrls: string[],
): Promise<ExtractorResult> {
  // Simulate network latency so the progress UI is visible in dev.
  await new Promise((r) => setTimeout(r, 1200));
  return fixture as ExtractorResult;
}
