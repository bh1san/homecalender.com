
/**
 * @fileOverview A simple in-memory cache to avoid excessive API calls during development.
 * NOTE: This is a server-side cache and will be reset when the server restarts.
 * It's intended to help with API rate limiting during development, not for production use.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Using a global variable to persist the cache across requests in a dev server environment.
// In a serverless function, this state would not persist between invocations.
const globalCache = new Map<string, CacheEntry<any>>();

/**
 * Stores a value in the shared cache.
 * @param key The key to store the data under.
 * @param data The data to store.
 */
export function setInCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  globalCache.set(key, entry);
}

/**
 * Retrieves a value from the shared cache.
 * @param key The key of the item to retrieve.
 * @param maxAgeMs The maximum age of the item in milliseconds. If the item is older, it's considered stale.
 * @returns The cached data, or null if it's not found or is stale.
 */
export function getFromCache<T>(key: string, maxAgeMs?: number): T | null {
  const entry = globalCache.get(key);
  
  if (!entry) {
    return null;
  }

  if (maxAgeMs) {
    const isStale = (Date.now() - entry.timestamp) > maxAgeMs;
    if (isStale) {
      globalCache.delete(key);
      return null;
    }
  }

  return entry.data as T;
}

/**
 * Clears the entire cache.
 */
export function clearCache(): void {
  globalCache.clear();
}
