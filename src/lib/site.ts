const FALLBACK_URL = "https://accelixy.com";

export function getSiteUrl(): string {
  const fromEnv = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!fromEnv) {
    return FALLBACK_URL;
  }

  try {
    const parsed = new URL(fromEnv);
    const isLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (process.env.NODE_ENV === "production" && isLocalhost) {
      return FALLBACK_URL;
    }
    return parsed.origin;
  } catch {
    return FALLBACK_URL;
  }
}
