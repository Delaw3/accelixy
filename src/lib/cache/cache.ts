import { redis } from "@/lib/cache/redis";

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get<T>(key);
  return value ?? null;
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  if (typeof ttlSeconds === "number") {
    await redis.set(key, value, { ex: ttlSeconds });
    return;
  }

  await redis.set(key, value);
}

export async function delCache(keys: string | string[]): Promise<void> {
  if (Array.isArray(keys)) {
    if (keys.length === 0) {
      return;
    }
    await redis.del(...keys);
    return;
  }

  await redis.del(keys);
}
