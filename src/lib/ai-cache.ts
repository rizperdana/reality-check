import { createHash } from 'crypto';

interface CacheEntry {
    value: string;
    timestamp: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 500;

const cache = new Map<string, CacheEntry>();

function computeHash(input: string): string {
    return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

export function buildCacheKey(params: Record<string, unknown>): string {
    const canonical = JSON.stringify(params, Object.keys(params).sort());
    return computeHash(canonical);
}

export function getCached(key: string): string | null {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        cache.delete(key);
        return null;
    }

    return entry.value;
}

export function setCache(key: string, value: string): void {
    if (cache.size >= MAX_ENTRIES) {
        const oldest = cache.keys().next().value;
        if (oldest) cache.delete(oldest);
    }
    cache.set(key, { value, timestamp: Date.now() });
}

export function clearCache(): void {
    cache.clear();
}

export function getCacheStats(): { size: number; maxSize: number; ttlMs: number } {
    return { size: cache.size, maxSize: MAX_ENTRIES, ttlMs: CACHE_TTL_MS };
}
