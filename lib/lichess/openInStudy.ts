/**
 * v1 uses the paste-URL approach — no OAuth needed.
 * Opens Lichess's import page with the PGN pre-filled.
 */
export function openInLichessPaste(pgn: string): void {
  const url = `https://lichess.org/paste?pgn=${encodeURIComponent(pgn)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
