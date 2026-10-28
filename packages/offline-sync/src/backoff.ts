export function syncBackoffMs(attempt: number, base = 750, max = 300_000): number {
  const exponent = Math.max(0, Math.min(attempt, 9));
  return Math.min(max, base * 2 ** exponent);
}
