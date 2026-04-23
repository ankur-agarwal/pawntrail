import { Chess } from "chess.js";

export function suggestionsFor(fen: string, attempted: string): string[] {
  let game: Chess;
  try {
    game = new Chess(fen);
  } catch {
    return [];
  }
  if (game.isCheckmate() || game.isStalemate()) return [];

  const legal = game.moves();
  if (legal.length === 0) return [];

  const scored = legal.map((san) => ({
    san,
    score:
      editDistance(san.toLowerCase(), attempted.toLowerCase()) -
      (sameFirstChar(san, attempted) ? 0.5 : 0),
  }));
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, 3).map((s) => s.san);
}

function sameFirstChar(a: string, b: string): boolean {
  return a[0]?.toLowerCase() === b[0]?.toLowerCase();
}

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1]![j - 1]!
          : 1 +
            Math.min(dp[i - 1]![j - 1]!, dp[i - 1]![j]!, dp[i]![j - 1]!);
    }
  }
  return dp[m]![n]!;
}
