import { createClient, RedisClientType } from 'redis';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  memoryUsage: number;
  keyCount: number;
}

export class CacheManager {
  private redisClient: RedisClientType | null = null;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private stats: CacheStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    hitRate: 0,
    memoryUsage: 0,
    keyCount: 0
  };
  private isRedisConnected: boolean = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      const redisUrl = import.meta.env.VITE_REDIS_URL || 'redis://localhost:6379';
      
      // Only initialize Redis on server-side
      if (typeof window === 'undefined') {
        this.redisClient = createClient({
          url: redisUrl,
          socket: {
            connectTimeout: 5000,
            lazyConnect: true
          }
        });

        this.redisClient.on('error', (err) => {
          console.error('Redis Client Error:', err);
          this.isRedisConnected = false;
        });

        this.redisClient.on('connect', () => {
          console.log('Redis Client Connected');
          this.isRedisConnected = true;
        });

        await this.redisClient.connect();
      }
    } catch (error) {
      console.warn('Redis initialization failed, using memory cache only:', error);
      this.isRedisConnected = false;
    }
  }

  // Tier 1: Memory Cache (fastest, for hot data)
  async getMemoryCache<T>(key: string): Promise<T | null> {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      this.stats.cacheMisses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      this.stats.cacheMisses++;
      return null;
    }

    entry.hits++;
    this.stats.cacheHits++;
    return entry.data;
  }

  async setMemoryCache<T>(key: string, data: T, ttlMs: number = 300000): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      hits: 0
    };

    this.memoryCache.set(key, entry);
    this.updateMemoryUsage();
  }

  // Tier 2: Redis Cache (medium speed, for shared data)
  async getRedisCache<T>(key: string): Promise<T | null> {
    if (!this.isRedisConnected || !this.redisClient) {
      return null;
    }

    try {
      const cached = await this.redisClient.get(key);
      
      if (!cached) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Check if entry has expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        await this.redisClient.del(key);
        return null;
      }

      // Also store in memory cache for faster access
      await this.setMemoryCache(key, entry.data, entry.ttl);
      
      return entry.data;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async setRedisCache<T>(key: string, data: T, ttlMs: number = 3600000): Promise<void> {
    if (!this.isRedisConnected || !this.redisClient) {
      return;
    }

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs,
        hits: 0
      };

      await this.redisClient.setEx(key, Math.ceil(ttlMs / 1000), JSON.stringify(entry));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  // Tier 3: CDN/Edge Cache (slowest but most distributed)
  // This would typically be handled by CDN providers like Cloudflare
  async getEdgeCache<T>(key: string): Promise<T | null> {
    // In a real implementation, this would call CDN API
    // For now, return null to fallback to other tiers
    return null;
  }

  async setEdgeCache<T>(key: string, data: T, ttlMs: number = 86400000): Promise<void> {
    // In a real implementation, this would set CDN cache headers
    // For now, this is a placeholder
  }

  // Universal get method that tries all tiers
  async get<T>(key: string, useAllTiers: boolean = true): Promise<T | null> {
    this.stats.totalRequests++;

    // Try memory cache first (Tier 1)
    let result = await this.getMemoryCache<T>(key);
    if (result !== null) {
      return result;
    }

    if (useAllTiers) {
      // Try Redis cache (Tier 2)
      result = await this.getRedisCache<T>(key);
      if (result !== null) {
        return result;
      }

      // Try edge cache (Tier 3)
      result = await this.getEdgeCache<T>(key);
      if (result !== null) {
        // Store in lower tiers for faster access
        await this.setMemoryCache(key, result);
        await this.setRedisCache(key, result);
        return result;
      }
    }

    return null;
  }

  // Universal set method that sets all tiers
  async set<T>(
    key: string, 
    data: T, 
    options: {
      memoryTTL?: number;
      redisTTL?: number;
      edgeTTL?: number;
      tiers?: ('memory' | 'redis' | 'edge')[];
    } = {}
  ): Promise<void> {
    const {
      memoryTTL = 300000,      // 5 minutes
      redisTTL = 3600000,      // 1 hour
      edgeTTL = 86400000,      // 24 hours
      tiers = ['memory', 'redis', 'edge']
    } = options;

    // Set in specified tiers
    if (tiers.includes('memory')) {
      await this.setMemoryCache(key, data, memoryTTL);
    }

    if (tiers.includes('redis')) {
      await this.setRedisCache(key, data, redisTTL);
    }

    if (tiers.includes('edge')) {
      await this.setEdgeCache(key, data, edgeTTL);
    }
  }

  // Delete from all tiers
  async delete(key: string): Promise<void> {
    // Delete from memory cache
    this.memoryCache.delete(key);

    // Delete from Redis
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (error) {
        console.error('Redis delete error:', error);
      }
    }

    // Delete from edge cache (placeholder)
    // await this.deleteEdgeCache(key);
  }

  // Clear all caches
  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear Redis
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.flushDb();
      } catch (error) {
        console.error('Redis clear error:', error);
      }
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.cacheHits / this.stats.totalRequests) * 100 
      : 0;
    
    this.stats.keyCount = this.memoryCache.size;
    
    return { ...this.stats };
  }

  // Update memory usage estimation
  private updateMemoryUsage(): void {
    let totalSize = 0;
    for (const [key, entry] of this.memoryCache.entries()) {
      // Rough estimation of memory usage
      totalSize += key.length * 2; // String characters
      totalSize += JSON.stringify(entry.data).length * 2;
      totalSize += 64; // Entry overhead
    }
    this.stats.memoryUsage = totalSize;
  }

  // Cleanup expired entries
  async cleanup(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.memoryCache.delete(key);
    }

    this.updateMemoryUsage();
    console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
  }

  // Get or set pattern (cache-aside)
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      memoryTTL?: number;
      redisTTL?: number;
      edgeTTL?: number;
      tiers?: ('memory' | 'redis' | 'edge')[];
    } = {}
  ): Promise<T> {
    // Try to get from cache first
    let result = await this.get<T>(key);
    
    if (result !== null) {
      return result;
    }

    // Cache miss - fetch data
    try {
      result = await fetcher();
      
      // Store in cache
      await this.set(key, result, options);
      
      return result;
    } catch (error) {
      console.error(`Error fetching data for key ${key}:`, error);
      throw error;
    }
  }

  // Warm up cache with common data
  async warmUp<T>(entries: Array<{
    key: string;
    fetcher: () => Promise<T>;
    options?: {
      memoryTTL?: number;
      redisTTL?: number;
      edgeTTL?: number;
      tiers?: ('memory' | 'redis' | 'edge')[];
    };
  }>): Promise<void> {
    const promises = entries.map(async (entry) => {
      try {
        const data = await entry.fetcher();
        await this.set(entry.key, data, entry.options);
      } catch (error) {
        console.error(`Error warming up cache for key ${entry.key}:`, error);
      }
    });

    await Promise.allSettled(promises);
    console.log(`Warmed up ${entries.length} cache entries`);
  }

  // Get cache keys by pattern
  async getKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];

    // Get memory cache keys
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        keys.push(key);
      }
    }

    // Get Redis keys
    if (this.isRedisConnected && this.redisClient) {
      try {
        const redisKeys = await this.redisClient.keys(`*${pattern}*`);
        keys.push(...redisKeys);
      } catch (error) {
        console.error('Redis keys error:', error);
      }
    }

    return [...new Set(keys)]; // Remove duplicates
  }

  // Check Redis connection status
  isRedisReady(): boolean {
    return this.isRedisConnected && this.redisClient?.isOpen || false;
  }

  // Disconnect Redis
  async disconnect(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.isRedisConnected = false;
    }
  }
}

// Specialized cache classes for different data types

export class ThreatAnalysisCache extends CacheManager {
  private static instance: ThreatAnalysisCache;

  static getInstance(): ThreatAnalysisCache {
    if (!ThreatAnalysisCache.instance) {
      ThreatAnalysisCache.instance = new ThreatAnalysisCache();
    }
    return ThreatAnalysisCache.instance;
  }

  async cacheThreatAnalysis(
    entity: string,
    analysis: any,
    ttlMs: number = 1800000 // 30 minutes
  ): Promise<void> {
    const key = `threat:analysis:${entity}`;
    await this.set(key, analysis, {
      memoryTTL: ttlMs,
      redisTTL: ttlMs * 2,
      edgeTTL: ttlMs * 4
    });
  }

  async getThreatAnalysis(entity: string): Promise<any | null> {
    const key = `threat:analysis:${entity}`;
    return await this.get(key);
  }
}

export class UserSessionCache extends CacheManager {
  private static instance: UserSessionCache;

  static getInstance(): UserSessionCache {
    if (!UserSessionCache.instance) {
      UserSessionCache.instance = new UserSessionCache();
    }
    return UserSessionCache.instance;
  }

  async cacheUserSession(
    userId: string,
    sessionData: any,
    ttlMs: number = 86400000 // 24 hours
  ): Promise<void> {
    const key = `user:session:${userId}`;
    await this.set(key, sessionData, {
      memoryTTL: ttlMs,
      redisTTL: ttlMs * 2,
      tiers: ['memory', 'redis'] // Don't cache sessions at edge
    });
  }

  async getUserSession(userId: string): Promise<any | null> {
    const key = `user:session:${userId}`;
    return await this.get(key);
  }

  async invalidateUserSession(userId: string): Promise<void> {
    const key = `user:session:${userId}`;
    await this.delete(key);
  }
}

export class RegionalThreatCache extends CacheManager {
  private static instance: RegionalThreatCache;

  static getInstance(): RegionalThreatCache {
    if (!RegionalThreatCache.instance) {
      RegionalThreatCache.instance = new RegionalThreatCache();
    }
    return RegionalThreatCache.instance;
  }

  async cacheRegionalThreats(
    region: string,
    threats: any,
    ttlMs: number = 300000 // 5 minutes
  ): Promise<void> {
    const key = `region:threats:${region}`;
    await this.set(key, threats, {
      memoryTTL: ttlMs,
      redisTTL: ttlMs * 3,
      edgeTTL: ttlMs * 6
    });
  }

  async getRegionalThreats(region: string): Promise<any | null> {
    const key = `region:threats:${region}`;
    return await this.get(key);
  }
}

// Cache middleware for API routes
export function withCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    tiers?: ('memory' | 'redis' | 'edge')[];
  } = {}
) {
  const cache = CacheManager.prototype;
  
  return async (): Promise<T> => {
    return await cache.getOrSet(cacheKey, fetcher, options);
  };
}
