import {type CacheEntry} from './types.js';
import {DEFAULT_CACHE_TTL_MS, CACHE_CLEANUP_INTERVAL_MS} from './constants.js';

export class SummaryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttlMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(ttlMs: number = DEFAULT_CACHE_TTL_MS) {
    this.ttlMs = ttlMs;
    this.startCleanup();
  }

  /**
   * Get a cached summary if it exists and hasn't expired.
   */
  get(videoId: string): string | null {
    const entry = this.cache.get(videoId);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(videoId);
      return null;
    }

    return entry.summary;
  }

  /**
   * Check if a video is cached (without retrieving the summary).
   */
  has(videoId: string): boolean {
    return this.get(videoId) !== null;
  }

  /**
   * Store a summary in the cache.
   */
  set(videoId: string, summary: string): void {
    this.cache.set(videoId, {
      summary,
      createdAt: Date.now(),
    });
  }

  /**
   * Check if a cache entry has expired.
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.createdAt > this.ttlMs;
  }

  /**
   * Remove all expired entries from the cache.
   */
  private cleanup(): void {
    for (const [videoId, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(videoId);
      }
    }
  }

  /**
   * Start the periodic cleanup interval.
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, CACHE_CLEANUP_INTERVAL_MS);

    // Allow the process to exit even if the interval is running
    this.cleanupInterval.unref();
  }

  /**
   * Stop the cleanup interval (useful for testing or shutdown).
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get the current cache size.
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Clear all entries from the cache.
   */
  clear(): void {
    this.cache.clear();
  }
}

// Singleton instance with configurable TTL from environment
const cacheTtl = parseInt(process.env.YOUTUBE_CACHE_TTL_MS || '', 10) || DEFAULT_CACHE_TTL_MS;
export const summaryCache = new SummaryCache(cacheTtl);
