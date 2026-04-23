import { describe, expect, it } from "vitest";
import { parseUciLine } from "./parser";

describe("parseUciLine", () => {
  it("parses info with cp score", () => {
    const r = parseUciLine(
      "info depth 22 multipv 1 score cp 35 nps 1240000 pv e2e4 e7e5 g1f3",
    );
    expect(r.type).toBe("info");
    if (r.type !== "info") return;
    expect(r.depth).toBe(22);
    expect(r.multipv).toBe(1);
    expect(r.scoreCp).toBe(35);
    expect(r.mate).toBeNull();
    expect(r.nps).toBe(1240000);
    expect(r.pv).toEqual(["e2e4", "e7e5", "g1f3"]);
  });

  it("parses info with mate score", () => {
    const r = parseUciLine("info depth 20 multipv 1 score mate 3 pv d1h5");
    expect(r.type).toBe("info");
    if (r.type !== "info") return;
    expect(r.scoreCp).toBeNull();
    expect(r.mate).toBe(3);
  });

  it("parses bestmove", () => {
    const r = parseUciLine("bestmove e2e4 ponder c7c5");
    expect(r.type).toBe("bestmove");
    if (r.type !== "bestmove") return;
    expect(r.move).toBe("e2e4");
  });

  it("returns other for unrecognised lines", () => {
    expect(parseUciLine("readyok").type).toBe("other");
    expect(parseUciLine("").type).toBe("other");
  });
});
