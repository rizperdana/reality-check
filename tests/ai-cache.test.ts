import { buildCacheKey, getCached, setCache, clearCache, getCacheStats } from '../src/lib/ai-cache';

describe('AI Cache', () => {
    beforeEach(() => {
        clearCache();
    });

    describe('buildCacheKey', () => {
        test('deterministic for same params regardless of key order', () => {
            const key1 = buildCacheKey({ a: 1, b: 2, c: 3 });
            const key2 = buildCacheKey({ c: 3, a: 1, b: 2 });
            expect(key1).toBe(key2);
        });

        test('different params produce different keys', () => {
            const key1 = buildCacheKey({ verdict: 'POSITIVE', score: 80 });
            const key2 = buildCacheKey({ verdict: 'NEGATIVE', score: 80 });
            expect(key1).not.toBe(key2);
        });

        test('returns 16-char hex string', () => {
            const key = buildCacheKey({ test: true });
            expect(key).toMatch(/^[a-f0-9]{16}$/);
        });
    });

    describe('getCache / setCache', () => {
        test('returns null for cache miss', () => {
            expect(getCached('nonexistent')).toBeNull();
        });

        test('returns cached value on hit', () => {
            setCache('test-key', 'test-value');
            expect(getCached('test-key')).toBe('test-value');
        });

        test('overwrites existing cache entry', () => {
            setCache('key', 'old');
            setCache('key', 'new');
            expect(getCached('key')).toBe('new');
        });
    });

    describe('TTL expiry', () => {
        test('returns null after TTL expires', () => {
            const originalDateNow = Date.now;
            const baseTime = 1_700_000_000_000;
            Date.now = () => baseTime;

            setCache('expire-key', 'value');
            expect(getCached('expire-key')).toBe('value');

            // Advance time past 1 hour (3600000 ms)
            Date.now = () => baseTime + 3_600_001;
            expect(getCached('expire-key')).toBeNull();

            Date.now = originalDateNow;
        });

        test('returns value within TTL window', () => {
            const originalDateNow = Date.now;
            const baseTime = 1_700_000_000_000;
            Date.now = () => baseTime;

            setCache('valid-key', 'value');

            // Advance 59 minutes (just under 1 hour)
            Date.now = () => baseTime + 59 * 60 * 1000;
            expect(getCached('valid-key')).toBe('value');

            Date.now = originalDateNow;
        });
    });

    describe('clearCache', () => {
        test('clears all entries', () => {
            setCache('a', '1');
            setCache('b', '2');
            clearCache();
            expect(getCached('a')).toBeNull();
            expect(getCached('b')).toBeNull();
            expect(getCacheStats().size).toBe(0);
        });
    });

    describe('getCacheStats', () => {
        test('returns current stats', () => {
            const stats = getCacheStats();
            expect(stats.maxSize).toBe(500);
            expect(stats.ttlMs).toBe(60 * 60 * 1000); // 1 hour
            expect(stats.size).toBe(0);
        });
    });

    describe('eviction', () => {
        test('evicts oldest entry when at max capacity', () => {
            // Fill cache to max (500 entries)
            for (let i = 0; i < 500; i++) {
                setCache(`key-${i}`, `value-${i}`);
            }
            expect(getCacheStats().size).toBe(500);

            // Adding one more should evict the oldest (key-0)
            setCache('key-500', 'value-500');
            expect(getCacheStats().size).toBe(500);
            expect(getCached('key-0')).toBeNull();
            expect(getCached('key-500')).toBe('value-500');
        });
    });
});
