type RateLimitStore = Map<string, { count: number; expiresAt: number }>;

const store: RateLimitStore = new Map();

export function rateLimit(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const record = store.get(key);

    if (!record) {
        store.set(key, { count: 1, expiresAt: now + windowMs });
        return { success: true, remaining: limit - 1 };
    }

    if (now > record.expiresAt) {
        store.set(key, { count: 1, expiresAt: now + windowMs });
        return { success: true, remaining: limit - 1 };
    }

    if (record.count >= limit) {
        return { success: false, remaining: 0 };
    }

    record.count++;
    return { success: true, remaining: limit - record.count };
}
