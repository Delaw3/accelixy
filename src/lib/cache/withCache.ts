import { getCache, setCache } from "@/lib/cache/cache";

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<{ data: T; cached: boolean }> {
  const cachedValue = await getCache<T>(key);
  if (cachedValue !== null) {
    return { data: cachedValue, cached: true };
  }

  const freshValue = await fetcher();
  await setCache(key, freshValue, ttlSeconds);

  return { data: freshValue, cached: false };
}
