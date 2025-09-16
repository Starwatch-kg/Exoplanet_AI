type CacheRecord<T> = { value: T; expiresAt: number };

export class MemoryCache {
  private store = new Map<string, CacheRecord<unknown>>();

  get<T>(key: string): T | undefined {
    const rec = this.store.get(key);
    if (!rec) return undefined;
    if (Date.now() > rec.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return rec.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}

export const globalCache = new MemoryCache();


