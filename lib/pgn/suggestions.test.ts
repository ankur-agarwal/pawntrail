import { describe, expect, it } from "vitest";
import { suggestionsFor } from "./suggestions";

describe("suggestionsFor", () => {
  it("returns up to 3 legal suggestions", () => {
    // Start position, user tries garbage
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const result = suggestionsFor(fen, "e5"); // not legal as first move
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(3);
    expect(result).toContain("e4"); // closest to e5 and shares first char
  });

  it("returns [] on unparseable FEN", () => {
    expect(suggestionsFor("garbage", "e4")).toEqual([]);
  });

  it("ranks same-first-char higher than pure edit distance", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const result = suggestionsFor(fen, "Na3");
    // "Na3" is a legal knight move — should be top suggestion
    expect(result[0]).toBe("Na3");
  });
});
