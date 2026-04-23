export type Classification =
  | "book"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder";

/**
 * Classify a move based on centipawn delta from the engine's best-move eval
 * to the played-move eval, evaluated from the mover's perspective.
 *
 * For a white move: delta = bestEval - playedEval (positive = loss).
 * For a black move: delta = playedEval - bestEval.
 */
export function classifyMove(
  side: "w" | "b",
  bestEvalCp: number,
  playedEvalCp: number,
): Classification {
  const delta = side === "w" ? bestEvalCp - playedEvalCp : playedEvalCp - bestEvalCp;
  if (delta <= 30) return "good";
  if (delta <= 80) return "inaccuracy";
  if (delta <= 200) return "mistake";
  return "blunder";
}

export const CLASSIFICATION_COLOR: Record<Classification, string> = {
  book: "var(--pt-text-dim)",
  good: "var(--pt-good)",
  inaccuracy: "var(--pt-inaccuracy)",
  mistake: "var(--pt-mistake)",
  blunder: "var(--pt-blunder)",
};
