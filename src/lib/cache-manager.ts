// Mock cache manager for build compatibility

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  memoryUsage: number;
}

export class ThreatAnalysisCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private hits: number = 0;
  private misses: number = 0;

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    entry.hits++;
    this.hits++;
    return entry.data;
  }

  async set<T>(key: string, data: T, ttl: number = 3600000): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    };
    
    this.cache.set(key, entry);
  }

  async invalidate(pattern: string): Promise<void> {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      totalEntries: this.cache.size,
      hitRate: total > 0 ? this.hits / total : 0,
      missRate: total > 0 ? this.misses / total : 0,
      memoryUsage: 0
    };
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}
