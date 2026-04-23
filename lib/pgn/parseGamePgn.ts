import { Chess } from "chess.js";

export interface GamePly {
  ply: number;
  san: string;
  fenAfter: string;
  fenBefore: string;
  from: string;
  to: string;
  side: "w" | "b";
}

export const START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function parseGamePgn(pgn: string): GamePly[] {
  const game = new Chess();
  try {
    game.loadPgn(pgn);
  } catch {
    return [];
  }
  const replay = new Chess();
  const verbose = game.history({ verbose: true });
  const out: GamePly[] = [];
  verbose.forEach((m, i) => {
    const fenBefore = replay.fen();
    replay.move({ from: m.from, to: m.to, promotion: m.promotion });
    out.push({
      ply: i + 1,
      san: m.san,
      fenAfter: replay.fen(),
      fenBefore,
      from: m.from,
      to: m.to,
      side: m.color,
    });
  });
  return out;
}
