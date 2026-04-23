import { describe, expect, it } from "vitest";
import { classifyMove } from "./classify";

describe("classifyMove", () => {
  it("good when white plays within 30cp of best", () => {
    expect(classifyMove("w", 35, 10)).toBe("good");
  });
  it("inaccuracy at 50cp loss", () => {
    expect(classifyMove("w", 80, 30)).toBe("inaccuracy");
  });
  it("mistake at 150cp loss", () => {
    expect(classifyMove("w", 100, -50)).toBe("mistake");
  });
  it("blunder at 250cp loss", () => {
    expect(classifyMove("w", 100, -150)).toBe("blunder");
  });
  it("black direction", () => {
    // delta for black = played - best. played=-200, best=-100 → delta=-100 (black improved? no)
    // actually black wants MORE NEGATIVE eval. played=-200 is better than best=-100 for black → delta negative → "good".
    expect(classifyMove("b", -100, -200)).toBe("good");
    // black's best=-100, played=50 → delta = 50 - (-100) = 150 → mistake
    expect(classifyMove("b", -100, 50)).toBe("mistake");
    // black's best=-50, played=160 → delta = 160 - (-50) = 210 → blunder
    expect(classifyMove("b", -50, 160)).toBe("blunder");
  });
});
