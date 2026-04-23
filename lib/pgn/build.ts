import { Chess } from "chess.js";
import type { ExtractedMovePair } from "@/lib/scanner/types";

export interface Ply {
  ply: number;
  san: string;
  invalid: boolean;
  fenAfter: string;
  fenBefore: string;
  side: "w" | "b";
}

export function replayMoves(pairs: ExtractedMovePair[]): Ply[] {
  const game = new Chess();
  const out: Ply[] = [];
  let halted = false;
  let plyNum = 0;

  for (const pair of pairs) {
    const white: [string | undefined, "w"] = [pair.white, "w"];
    const black: [string | undefined, "b"] = [pair.black, "b"];
    for (const [san, side] of [white, black]) {
      if (san == null) continue;
      plyNum += 1;
      const fenBefore = game.fen();
      if (halted) {
        out.push({
          ply: plyNum,
          san,
          invalid: true,
          fenAfter: "",
          fenBefore,
          side,
        });
        continue;
      }
      try {
        const move = game.move(san);
        if (!move) throw new Error("illegal");
        out.push({
          ply: plyNum,
          san: move.san,
          invalid: false,
          fenAfter: game.fen(),
          fenBefore,
          side,
        });
      } catch {
        halted = true;
        out.push({
          ply: plyNum,
          san,
          invalid: true,
          fenAfter: "",
          fenBefore,
          side,
        });
      }
    }
  }
  return out;
}

export function buildPgn(pairs: ExtractedMovePair[]): string {
  const game = new Chess();
  outer: for (const pair of pairs) {
    for (const san of [pair.white, pair.black]) {
      if (san == null) continue;
      try {
        const move = game.move(san);
        if (!move) break outer;
      } catch {
        break outer;
      }
    }
  }
  return game.pgn();
}
