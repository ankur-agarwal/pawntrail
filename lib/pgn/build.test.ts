import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { buildPgn, replayMoves } from "./build";

describe("replayMoves", () => {
  it("validates a legal game", () => {
    const plies = replayMoves([
      { moveNumber: 1, white: "e4", black: "e5" },
      { moveNumber: 2, white: "Nf3", black: "Nc6" },
    ]);
    expect(plies).toHaveLength(4);
    expect(plies.every((p) => !p.invalid)).toBe(true);
    expect(plies[0]!.side).toBe("w");
    expect(plies[1]!.side).toBe("b");
  });

  it("flags an illegal move + halts downstream validation", () => {
    const plies = replayMoves([
      { moveNumber: 1, white: "e4", black: "e5" },
      { moveNumber: 2, white: "Nz9", black: "Nc6" },
    ]);
    expect(plies[2]!.invalid).toBe(true);
    expect(plies[3]!.invalid).toBe(true);
  });

  it("handles games ending on a white move (no black)", () => {
    const plies = replayMoves([{ moveNumber: 1, white: "e4" }]);
    expect(plies).toHaveLength(1);
    expect(plies[0]!.invalid).toBe(false);
  });
});

describe("buildPgn", () => {
  it("emits a PGN that round-trips through chess.js", () => {
    const pairs = [
      { moveNumber: 1, white: "e4", black: "e5" },
      { moveNumber: 2, white: "Nf3", black: "Nc6" },
      { moveNumber: 3, white: "Bb5", black: "a6" },
    ];
    const pgn = buildPgn(pairs);
    const c = new Chess();
    c.loadPgn(pgn);
    expect(c.history()).toEqual(["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"]);
  });

  it("stops at the first illegal move", () => {
    const pgn = buildPgn([
      { moveNumber: 1, white: "e4", black: "e5" },
      { moveNumber: 2, white: "Nz9" },
    ]);
    const c = new Chess();
    c.loadPgn(pgn);
    expect(c.history()).toEqual(["e4", "e5"]);
  });
});
