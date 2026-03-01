import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache/cache";
import { cacheKeys } from "@/lib/cache/keys";

export async function GET() {
  const payload = {
    message: "Redis connection is working.",
    timestamp: new Date().toISOString(),
  };

  await setCache(cacheKeys.testRedis, payload, 60);
  const value = await getCache<typeof payload>(cacheKeys.testRedis);

  return NextResponse.json({
    ok: true,
    value,
  });
}
