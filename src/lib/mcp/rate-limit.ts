import { kv } from '@/lib/database/client';

const LIMITS: Record<string, number> = {
  read: 60,
  readwrite: 20,
};

export async function checkMcpRateLimit(
  authLevel: string
): Promise<{ allowed: boolean; remaining: number }> {
  const limit = LIMITS[authLevel] ?? 60;

  try {
    const minuteWindow = Math.floor(Date.now() / 60000);
    const key = `mcp:rl:${authLevel}:${minuteWindow}`;

    const current = (await kv.get(key)) as number | null;
    const count = current ?? 0;

    if (count >= limit) {
      return { allowed: false, remaining: 0 };
    }

    // Increment and set TTL of 120s (covers the current minute window + buffer)
    await kv.set(key, count + 1, { ex: 120 });

    return { allowed: true, remaining: limit - count - 1 };
  } catch {
    // If KV is unavailable, allow the request
    return { allowed: true, remaining: limit };
  }
}
