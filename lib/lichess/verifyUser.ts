export async function verifyLichessUser(username: string): Promise<boolean> {
  if (!username.match(/^[a-zA-Z0-9_-]{2,30}$/)) return false;
  try {
    const res = await fetch(
      `https://lichess.org/api/user/${encodeURIComponent(username)}`,
      { signal: AbortSignal.timeout(8000) },
    );
    return res.status === 200;
  } catch {
    return false;
  }
}
