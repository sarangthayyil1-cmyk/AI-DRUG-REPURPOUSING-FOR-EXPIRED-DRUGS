/**
 * Resolve to `fallback` if `promise` hasn't settled within `ms`.
 *
 * Supabase auth retries network failures with backoff for up to ~30s, so an
 * unreachable Supabase project would otherwise stall every request that checks
 * the session.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
